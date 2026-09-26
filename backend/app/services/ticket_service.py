import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy import or_, desc, func
from sqlalchemy.orm import Session, joinedload
from app.models import Ticket, Note
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    NoteCreate,
    TicketListItem,
    TicketDetailOut,
    NoteOut,
    TicketStatus,
    TicketPriority
)


# Indian Standard Time (UTC+05:30)
IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def get_now_ist() -> datetime:
    """Returns the current datetime in Indian Standard Time (IST)."""
    return datetime.now(IST)


def calculate_sla_breach_metrics(created_at: datetime, status: str, threshold_hours: int = 24):
    """
    Evaluates SLA metrics for a ticket in IST.
    Returns (is_sla_breached, hours_elapsed).
    """
    now_ist = get_now_ist()
    if created_at.tzinfo is None:
        created_at_ist = created_at.replace(tzinfo=IST)
    else:
        created_at_ist = created_at.astimezone(IST)

    elapsed_seconds = (now_ist - created_at_ist).total_seconds()
    hours_elapsed = round(max(0.0, elapsed_seconds / 3600.0), 1)

    if status == TicketStatus.CLOSED.value or status == "Closed":
        return False, hours_elapsed

    is_breached = hours_elapsed > threshold_hours
    return is_breached, hours_elapsed


def calculate_sla_breach(created_at: datetime, status: str, threshold_hours: int = 24) -> bool:
    is_breached, _ = calculate_sla_breach_metrics(created_at, status, threshold_hours)
    return is_breached


def generate_next_ticket_id(db: Session) -> str:
    """
    Generates sequential ticket IDs formatted as TKT-001, TKT-002, etc.
    Scans existing tickets to determine the highest sequential number.
    """
    tickets = db.query(Ticket.ticket_id).all()
    max_num = 0
    pattern = re.compile(r"^TKT-(\d+)$")

    for (t_id,) in tickets:
        match = pattern.match(t_id or "")
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    next_num = max_num + 1
    return f"TKT-{next_num:03d}"


def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
    """
    Creates a new support ticket with sequential ID and initial status 'Open'.
    """
    next_id = generate_next_ticket_id(db)
    new_ticket = Ticket(
        ticket_id=next_id,
        customer_name=ticket_in.customer_name,
        customer_email=str(ticket_in.customer_email),
        subject=ticket_in.subject,
        description=ticket_in.description,
        status=TicketStatus.OPEN.value,
        priority=ticket_in.priority.value if ticket_in.priority else TicketPriority.MEDIUM.value
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


def get_tickets(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sla_breached: Optional[bool] = None
) -> List[TicketListItem]:
    """
    Fetches tickets with optional status filtering, search, and SLA breach filtering.
    Computes SLA breach status, hours elapsed, and notes count for each ticket.
    """
    query = db.query(Ticket).options(joinedload(Ticket.notes))

    # Status filter
    if status and status.strip() and status.strip() != "All" and status.strip() != "SLA Breached":
        clean_status = status.strip()
        query = query.filter(Ticket.status == clean_status)

    # Search filter: across customer name, email, ticket ID, subject, and description
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(term),
                Ticket.customer_name.ilike(term),
                Ticket.customer_email.ilike(term),
                Ticket.subject.ilike(term),
                Ticket.description.ilike(term)
            )
        )

    # Order newest first
    tickets = query.order_by(desc(Ticket.created_at)).all()

    results: List[TicketListItem] = []
    for t in tickets:
        is_breached, hours_elapsed = calculate_sla_breach_metrics(t.created_at, t.status)

        # Apply SLA breached filter if requested
        if sla_breached is True and not is_breached:
            continue
        if status == "SLA Breached" and not is_breached:
            continue

        results.append(
            TicketListItem(
                id=t.id,
                ticket_id=t.ticket_id,
                customer_name=t.customer_name,
                customer_email=t.customer_email,
                subject=t.subject,
                status=TicketStatus(t.status),
                priority=TicketPriority(t.priority) if t.priority else TicketPriority.MEDIUM,
                created_at=t.created_at,
                updated_at=t.updated_at,
                is_sla_breached=is_breached,
                sla_hours_elapsed=hours_elapsed,
                notes_count=len(t.notes) if t.notes else 0
            )
        )
    return results


def get_ticket_by_id(db: Session, ticket_id: str) -> Optional[TicketDetailOut]:
    """
    Retrieves full ticket details including ordered notes timeline and SLA status.
    Returns None if ticket does not exist.
    """
    clean_id = ticket_id.strip()
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.notes))
        .filter(Ticket.ticket_id == clean_id)
        .first()
    )

    if not ticket:
        return None

    is_breached, hours_elapsed = calculate_sla_breach_metrics(ticket.created_at, ticket.status)
    notes_out = [
        NoteOut(
            id=n.id,
            ticket_id=n.ticket_id,
            note_text=n.note_text,
            created_at=n.created_at
        )
        for n in (ticket.notes or [])
    ]

    return TicketDetailOut(
        id=ticket.id,
        ticket_id=ticket.ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status=TicketStatus(ticket.status),
        priority=TicketPriority(ticket.priority) if ticket.priority else TicketPriority.MEDIUM,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        is_sla_breached=is_breached,
        sla_hours_elapsed=hours_elapsed,
        notes=notes_out
    )


def ensure_initial_tickets(db: Session) -> List[Ticket]:
    """
    Seeds exactly 5 clean, realistic customer support tickets if the database is currently empty.
    Includes 1 SLA Breached (>24h) ticket, 1 In Progress ticket, 2 Open tickets, and 1 Closed ticket.
    """
    existing_count = db.query(Ticket).count()
    if existing_count > 0:
        return []

    now = get_now_ist()

    # 1. TKT-001 (SLA Breached - Open > 24h)
    t1 = Ticket(
        ticket_id="TKT-001",
        customer_name="Richard Hendricks",
        customer_email="richard@piedpiper.com",
        subject="API Rate limit exceeded on batch compression upload",
        description="Our server cluster hit a 429 Too Many Requests response during midnight data sync. Requesting limit increase to 10,000 req/min.",
        status=TicketStatus.OPEN.value,
        priority=TicketPriority.URGENT.value,
        created_at=now - timedelta(hours=32),
        updated_at=now - timedelta(hours=32)
    )
    db.add(t1)
    db.commit()

    n1 = Note(
        ticket_id="TKT-001",
        note_text="[Auto-System] Ticket open for >32 hours without resolution update.",
        created_at=now - timedelta(hours=31)
    )
    db.add(n1)

    # 2. TKT-002 (In Progress)
    t2 = Ticket(
        ticket_id="TKT-002",
        customer_name="Sarah Connor",
        customer_email="sarah@cyberdyne.org",
        subject="Webhook notification timeout on payment gateway callback",
        description="Payment webhooks fail after 5000ms latency spike on gateway. Requesting timeout window adjustment from 5s to 10s.",
        status=TicketStatus.IN_PROGRESS.value,
        priority=TicketPriority.HIGH.value,
        created_at=now - timedelta(hours=6),
        updated_at=now - timedelta(hours=2)
    )
    db.add(t2)
    db.commit()

    n2 = Note(
        ticket_id="TKT-002",
        note_text="[Agent Note] Dispatched patch to increase webhook retry backoff timeout.",
        created_at=now - timedelta(hours=2)
    )
    db.add(n2)

    # 3. TKT-003 (Open)
    t3 = Ticket(
        ticket_id="TKT-003",
        customer_name="Pepper Potts",
        customer_email="pepper@stark.com",
        subject="OAuth2 token refresh failing for regional grid endpoint",
        description="Regional gateway returns invalid_grant error when exchanging authorization code for access token.",
        status=TicketStatus.OPEN.value,
        priority=TicketPriority.MEDIUM.value,
        created_at=now - timedelta(hours=2),
        updated_at=now - timedelta(hours=2)
    )
    db.add(t3)
    db.commit()

    # 4. TKT-004 (Open)
    t4 = Ticket(
        ticket_id="TKT-004",
        customer_name="Bruce Wayne",
        customer_email="bruce@wayneenterprises.com",
        subject="Bulk invoice PDF export out of memory exception",
        description="Exporting more than 500 invoices in a single ZIP archive causes memory limit exceeded error.",
        status=TicketStatus.OPEN.value,
        priority=TicketPriority.LOW.value,
        created_at=now - timedelta(minutes=45),
        updated_at=now - timedelta(minutes=45)
    )
    db.add(t4)
    db.commit()

    # 5. TKT-005 (Closed)
    t5 = Ticket(
        ticket_id="TKT-005",
        customer_name="Michael Scott",
        customer_email="michael@dundermifflin.com",
        subject="Password reset verification email not received",
        description="Customer requested password reset email but link expired after 24 hours.",
        status=TicketStatus.CLOSED.value,
        priority=TicketPriority.LOW.value,
        created_at=now - timedelta(hours=14),
        updated_at=now - timedelta(hours=1)
    )
    db.add(t5)
    db.commit()

    n5 = Note(
        ticket_id="TKT-005",
        note_text="[Agent Note] Manually triggered fresh password reset email. Customer confirmed successful login.",
        created_at=now - timedelta(hours=1)
    )
    db.add(n5)

    db.commit()
    return [t1, t2, t3, t4, t5]



def update_ticket(
    db: Session,
    ticket_id: str,
    update_in: TicketUpdate
) -> Optional[Ticket]:
    """
    Updates ticket status, priority, and optionally appends an internal note atomically.
    Returns None if ticket does not exist.
    """
    clean_id = ticket_id.strip()
    ticket = db.query(Ticket).filter(Ticket.ticket_id == clean_id).first()

    if not ticket:
        return None

    if update_in.status:
        ticket.status = update_in.status.value

    if update_in.priority:
        ticket.priority = update_in.priority.value

    if update_in.note_text:
        new_note = Note(
            ticket_id=ticket.ticket_id,
            note_text=update_in.note_text
        )
        db.add(new_note)

    # Force updated_at timestamp refresh
    ticket.updated_at = get_now_ist()
    db.commit()
    db.refresh(ticket)
    return ticket


def add_note_to_ticket(
    db: Session,
    ticket_id: str,
    note_in: NoteCreate
) -> Optional[Note]:
    """
    Appends an internal note to an existing ticket.
    Returns None if the ticket does not exist.
    """
    clean_id = ticket_id.strip()
    ticket = db.query(Ticket).filter(Ticket.ticket_id == clean_id).first()
    if not ticket:
        return None

    note = Note(
        ticket_id=ticket.ticket_id,
        note_text=note_in.note_text
    )
    ticket.updated_at = get_now_ist()
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
