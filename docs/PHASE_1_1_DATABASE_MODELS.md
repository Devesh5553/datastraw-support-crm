# Phase 1.1 Documentation: Database Engine & SQLAlchemy ORM Models

This document explains the code implementation, database architecture, and practical applications for **Phase 1.1: Database Engine & SQLAlchemy ORM Models** of the Datastraw Support CRM.

---

## 1. Summary of Completed Actions

1. **Database Engine & Connection Management (`backend/app/database.py`):**
   - Configured SQLAlchemy engine with `DATABASE_URL` (SQLite file `support_crm.db`).
   - Attached an engine-level listener `set_sqlite_pragma` to force `PRAGMA foreign_keys=ON` on every SQLite connection.
   - Built a session factory (`SessionLocal`) and a clean FastAPI dependency (`get_db`) that guarantees proper database session closure after each request.
   - Created `init_db()` utility to generate tables and indexes automatically.

2. **Database Models & Constraints (`backend/app/models.py`):**
   - Implemented `Ticket` model with all required fields: `id`, `ticket_id`, `customer_name`, `customer_email`, `subject`, `description`, `status`, `priority`, `created_at`, `updated_at`.
   - Enforced status integrity with `CheckConstraint("status IN ('Open', 'In Progress', 'Closed')")`.
   - Enforced priority integrity with `CheckConstraint("priority IN ('Low', 'Medium', 'High', 'Urgent')")`.
   - Implemented `Note` model with foreign key pointing to `tickets.ticket_id` with `ondelete="CASCADE"`.
   - Established ORM bidirectional relationship: `Ticket.notes` and `Note.ticket` with automatic cascade deletion (`cascade="all, delete-orphan"`).
   - Created database indexes:
     - `idx_tickets_status` on `status` (for instant status-based filtering).
     - `idx_tickets_search` composite index on `(customer_name, customer_email)` (for fast search lookups).

3. **Verification:**
   - Ran an automated verification script testing table generation, record insertion, ORM relationship querying, cascade deletion, and `CheckConstraint` violation rejection.

---

## 2. Code Breakdown & Practical Applications

### A. `backend/app/database.py`
* **Path:** [`backend/app/database.py`](file:///c:/Users/Devesh/OneDrive/Documents/crm/backend/app/database.py)
* **Code & Architectural Role:**
  ```python
  @event.listens_for(Engine, "connect")
  def set_sqlite_pragma(dbapi_connection, connection_record):
      if DATABASE_URL.startswith("sqlite"):
          cursor = dbapi_connection.cursor()
          cursor.execute("PRAGMA foreign_keys=ON")
          cursor.close()
  ```
  * **Application:** By default, SQLite does *not* enforce foreign key constraints or `ON DELETE CASCADE` unless `PRAGMA foreign_keys=ON` is explicitly issued per connection. This listener hooks into every connection created by SQLAlchemy, guaranteeing data integrity at the database layer.
  * **`get_db()`:**
    ```python
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    ```
    * **Application:** Adheres to FastAPI's dependency injection pattern (`Depends(get_db)`). Ensures database connections are never leaked; even if an endpoint raises an uncaught exception, the `finally` block ensures the session is closed cleanly.

### B. `backend/app/models.py`
* **Path:** [`backend/app/models.py`](file:///c:/Users/Devesh/OneDrive/Documents/crm/backend/app/models.py)
* **Code & Architectural Role:**
  * **`Ticket` Model:**
    ```python
    class Ticket(Base):
        __tablename__ = "tickets"
        id = Column(Integer, primary_key=True, index=True, autoincrement=True)
        ticket_id = Column(String(32), unique=True, nullable=False, index=True)
        customer_name = Column(String(128), nullable=False)
        customer_email = Column(String(255), nullable=False)
        subject = Column(String(255), nullable=False)
        description = Column(Text, nullable=False)
        status = Column(String(32), nullable=False, default="Open")
        priority = Column(String(32), nullable=False, default="Medium")
        created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
        updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    ```
    * **Application:** Stores core ticket information. `updated_at` automatically updates on database write events.
  * **Check Constraints:**
    ```python
    CheckConstraint("status IN ('Open', 'In Progress', 'Closed')", name="check_ticket_status")
    CheckConstraint("priority IN ('Low', 'Medium', 'High', 'Urgent')", name="check_ticket_priority")
    ```
    * **Application:** Guarantees that even if buggy code attempts to write a status like `"Pending"`, the database itself blocks the corrupt insert with an `IntegrityError`.
  * **Composite Search Index:**
    ```python
    Index("idx_tickets_search", "customer_name", "customer_email")
    Index("idx_tickets_status", "status")
    ```
    * **Application:** As the ticket volume scales into thousands of records, searching by customer name or email and filtering by status will use B-Tree index scans instead of slow full table scans.
  * **`Note` Model & Cascade Delete:**
    ```python
    class Note(Base):
        __tablename__ = "notes"
        id = Column(Integer, primary_key=True, index=True, autoincrement=True)
        ticket_id = Column(String(32), ForeignKey("tickets.ticket_id", ondelete="CASCADE"), nullable=False, index=True)
        note_text = Column(Text, nullable=False)
        created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    ```
    * **Application:** Enables team collaboration. When a ticket is removed or archived, all corresponding notes are automatically purged by SQLite without leaving dangling orphaned rows.

---

## 3. Verification Test Results

Execution of the verification test suite returned:
```text
Initializing database schema...
Created ticket: TKT-TEST with ID 1
Added note ID 1 for ticket TKT-TEST
Relationship verified: ticket has 1 note(s)
Cascade delete verified: notes cleanly removed when ticket deleted
CheckConstraint verified: invalid status was rejected by database
ALL PHASE 1.1 DATABASE VERIFICATIONS PASSED!
```

---
*Phase 1.1 is complete and verified. Ready to proceed to Phase 1.2 (Pydantic Validation Schemas).*
