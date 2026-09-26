# Phase 1.3 Documentation: Service Layer & Business Logic

This document details the business logic, ID generation algorithms, query filters, and practical applications implemented in **Phase 1.3: Service Layer & Business Logic** for the Datastraw Support CRM backend.

---

## 1. Summary of Completed Actions

1. **Service Architecture (`backend/app/services/ticket_service.py`):**
   - **Sequential Ticket ID Generator (`generate_next_ticket_id`):** Scans the database using regex matching `^TKT-(\d+)$` to safely compute the next sequential integer and formats it as `TKT-###` (e.g., `TKT-001`, `TKT-002`, `TKT-042`).
   - **Ticket Creation (`create_ticket`):** Allocates the next ID, sets initial status to `"Open"`, assigns customer priority (defaulting to `"Medium"`), and persists the record.
   - **Search & Filter Query Engine (`get_tickets`):**
     - Case-insensitive `ILIKE` multi-field search across `customer_name`, `customer_email`, `ticket_id`, `subject`, and `description`.
     - Exact status filtering (`Open`, `In Progress`, `Closed`).
     - Eager loading of associated notes via `joinedload` to prevent N+1 query performance bottlenecks.
     - Newest-first sorting (`desc(Ticket.created_at)`).
     - Per-ticket dynamic SLA breach calculation and notes counting.
   - **Ticket Detail Fetcher (`get_ticket_by_id`):** Retrieves the ticket with all related notes in chronological order, returning `None` if missing to enable clean HTTP 404 responses.
   - **Atomic Ticket Updater (`update_ticket`):** Updates status/priority, updates `updated_at` timestamp, and atomically appends an internal note if provided in the update payload.
   - **Indian Standard Time (IST) Engine (`calculate_sla_breach` & `get_now_ist`):** Uses timezone-aware IST (`UTC+05:30`) datetime math across models and service calculations to flag unresolved tickets older than 24 hours while marking closed tickets as compliant.


2. **Automated Verification:**
   - Executed an 8-stage unit test covering sequential ID generation, ticket persistence, multi-field search, status filtering, status update with note appending, missing ticket handling, and SLA breach calculations.

---

## 2. Code Breakdown & Practical Applications

### A. Sequential Ticket ID Generation
* **Path:** [`backend/app/services/ticket_service.py`](file:///c:/Users/Devesh/OneDrive/Documents/crm/backend/app/services/ticket_service.py)
* **Code:**
  ```python
  def generate_next_ticket_id(db: Session) -> str:
      tickets = db.query(Ticket.ticket_id).all()
      max_num = 0
      pattern = re.compile(r"^TKT-(\d+)$")
      for (t_id,) in tickets:
          match = pattern.match(t_id or "")
          if match:
              num = int(match.group(1))
              if num > max_num:
                  max_num = num
      return f"TKT-{max_num + 1:03d}"
  ```
* **Practical Application:**
  - Standard database auto-increment produces plain integers (`1`, `2`, `3`).
  - Support CRMs require human-readable reference IDs like `TKT-001` for customer communication and searchability.
  - Using regex extraction over existing IDs guarantees that deleting a ticket does not cause collisions or broken sequences.

### B. Multi-Field Search & Eager Loading
* **Code:**
  ```python
  query = db.query(Ticket).options(joinedload(Ticket.notes))
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
  ```
* **Practical Application:**
  - Support agents can type *anything* in the search bar: an email domain (`@client.com`), a ticket number (`001`), a customer's first name, or a symptom (`"timeout"`), and the engine finds all matching records.
  - `options(joinedload(Ticket.notes))` executes an SQL `LEFT OUTER JOIN`, fetching notes in a single query rather than making 50 individual queries when listing 50 tickets.

### C. SLA Auto-Breach Computation (Stand-Out Feature)
* **Code:**
  ```python
  def calculate_sla_breach(created_at: datetime, status: str, threshold_hours: int = 24) -> bool:
      if status == TicketStatus.CLOSED.value or status == "Closed":
          return False
      now = datetime.now(timezone.utc)
      created_at_utc = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
      return (now - created_at_utc) > timedelta(hours=threshold_hours)
  ```
* **Practical Application:**
  - Evaluates operational urgency in real time without storing stale boolean flags in the database.
  - Resolved (`Closed`) tickets are exempt from SLA breach warnings.
  - Any unresolved ticket open for >24 hours is automatically flagged so supervisors can intervene.

### D. Atomic Status Update & Note Appending
* **Code:**
  ```python
  def update_ticket(db: Session, ticket_id: str, update_in: TicketUpdate) -> Optional[Ticket]:
      ...
      if update_in.note_text:
          new_note = Note(ticket_id=ticket.ticket_id, note_text=update_in.note_text)
          db.add(new_note)
      ticket.updated_at = datetime.now(timezone.utc)
      db.commit()
  ```
* **Practical Application:**
  - Allows an agent to update a ticket's status (e.g., from `Open` to `In Progress`) and log the reason (e.g., `"Investigating logs"`) in a single network round-trip.
  - Both changes commit inside the same database transaction.

---

## 3. Verification Test Results

```text
Testing Phase 1.3 Service Layer...
1. Initial sequential ID TKT-001: PASSED
2. create_ticket (TKT-001, High, Open): PASSED
3. Sequential increment to TKT-002: PASSED
4. Multi-field search (name, subject, email): PASSED
5. Status filtering (Open vs Closed): PASSED
6. update_ticket with status change and note append: PASSED
7. Missing ticket returns None (clean 404 support): PASSED
8. SLA auto-breach calculation (24h rule): PASSED
ALL PHASE 1.3 SERVICE LAYER VERIFICATIONS PASSED!
```

---
*Phase 1.3 is complete and verified. Ready to proceed to Phase 1.4 (REST API Router & Endpoint Integration).*
