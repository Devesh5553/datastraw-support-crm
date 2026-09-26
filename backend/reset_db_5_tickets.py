"""
Database Reset & Initial Seeder
Clears support_crm.db and populates exactly 5 clean, realistic support tickets:
- TKT-001: Open, Urgent, Created 32h ago (SLA Breached >24h)
- TKT-002: In Progress, High, Created 6h ago (with Agent Note)
- TKT-003: Open, Medium, Created 2h ago
- TKT-004: Open, Low, Created 45m ago
- TKT-005: Closed, Low, Created 14h ago (with Resolution Note)
"""
import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure app package is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal, init_db
from app.models import Ticket, Note

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

def reset_and_seed():
    print("Initializing database schema...")
    init_db()
    db = SessionLocal()

    try:
        print("Clearing existing tables...")
        db.query(Note).delete()
        db.query(Ticket).delete()
        db.commit()

        now = datetime.now(IST)

        print("Seeding exactly 5 clean, realistic customer support tickets...")

        # 1. TKT-001: SLA Breached (>32h old)
        t1 = Ticket(
            ticket_id="TKT-001",
            customer_name="Richard Hendricks",
            customer_email="richard@piedpiper.com",
            subject="API Rate limit exceeded on batch compression upload",
            description="Our server cluster hit a 429 Too Many Requests response during midnight data sync. Requesting limit increase to 10,000 req/min.",
            status="Open",
            priority="Urgent",
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

        # 2. TKT-002: In Progress
        t2 = Ticket(
            ticket_id="TKT-002",
            customer_name="Sarah Connor",
            customer_email="sarah@cyberdyne.org",
            subject="Webhook notification timeout on payment gateway callback",
            description="Payment webhooks fail after 5000ms latency spike on gateway. Requesting timeout window adjustment from 5s to 10s.",
            status="In Progress",
            priority="High",
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

        # 3. TKT-003: Open
        t3 = Ticket(
            ticket_id="TKT-003",
            customer_name="Pepper Potts",
            customer_email="pepper@stark.com",
            subject="OAuth2 token refresh failing for regional grid endpoint",
            description="Regional gateway returns invalid_grant error when exchanging authorization code for access token.",
            status="Open",
            priority="Medium",
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(hours=2)
        )
        db.add(t3)
        db.commit()

        # 4. TKT-004: Open
        t4 = Ticket(
            ticket_id="TKT-004",
            customer_name="Bruce Wayne",
            customer_email="bruce@wayneenterprises.com",
            subject="Bulk invoice PDF export out of memory exception",
            description="Exporting more than 500 invoices in a single ZIP archive causes memory limit exceeded error.",
            status="Open",
            priority="Low",
            created_at=now - timedelta(minutes=45),
            updated_at=now - timedelta(minutes=45)
        )
        db.add(t4)
        db.commit()

        # 5. TKT-005: Closed
        t5 = Ticket(
            ticket_id="TKT-005",
            customer_name="Michael Scott",
            customer_email="michael@dundermifflin.com",
            subject="Password reset verification email not received",
            description="Customer requested password reset email but link expired after 24 hours.",
            status="Closed",
            priority="Low",
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
        print("Successfully seeded 5 initial tickets:")
        tickets = db.query(Ticket).all()
        for t in tickets:
            print(f"  • [{t.ticket_id}] {t.customer_name} | Status: {t.status} | Priority: {t.priority}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
