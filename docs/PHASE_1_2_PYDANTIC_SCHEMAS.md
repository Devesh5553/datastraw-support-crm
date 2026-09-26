# Phase 1.2 Documentation: Pydantic Validation Schemas

This document details the schema definitions, input sanitization rules, and practical applications implemented in **Phase 1.2: Pydantic Validation Schemas** for the Datastraw Support CRM backend.

---

## 1. Summary of Completed Actions

1. **Dependency Integration:**
   - Integrated `email-validator` library to enable full RFC 5322 email compliance in Pydantic.
   - Updated `backend/requirements.txt` with `email-validator>=2.0.0`.

2. **Schema Architecture (`backend/app/schemas.py`):**
   - **Enums:**
     - `TicketStatus`: Restricts values to `"Open"`, `"In Progress"`, and `"Closed"`.
     - `TicketPriority`: Standardizes priorities across `"Low"`, `"Medium"`, `"High"`, and `"Urgent"`.
   - **Input Validation Models:**
     - `TicketCreate`: Validates customer name, RFC compliant email, subject, description, and priority. Automatically strips leading/trailing whitespace and rejects blank strings.
     - `TicketUpdate`: Validates partial updates (status, priority, and optional internal note). Supports field alias `notes` for API convenience.
     - `NoteCreate`: Validates non-empty note texts up to 5,000 characters.
   - **Response Output Models:**
     - `TicketCreateResponse`: Returns `{ ticket_id, created_at }` matching the evaluation contract.
     - `TicketUpdateResponse`: Returns `{ success: true, updated_at }`.
     - `TicketListItem`: Optimized lightweight payload for list views, including computed `is_sla_breached` flag and `notes_count`.
     - `TicketDetailOut`: Full payload including complete issue description and nested `notes: List[NoteOut]`.
     - `NoteOut`: Serialization for internal team collaboration notes.

3. **Validation Test Suite:**
   - Executed automated verification covering valid payload parsing, email formatting checks, blank-input rejection, alias resolution, empty-body rejection, and enum boundary enforcement.

---

## 2. Code Breakdown & Practical Applications

### A. Input Sanitization & RFC Email Validation
* **Code:**
  ```python
  class TicketCreate(BaseModel):
      customer_name: str = Field(..., min_length=2, max_length=128)
      customer_email: EmailStr
      subject: str = Field(..., min_length=3, max_length=255)
      description: str = Field(..., min_length=5, max_length=10000)
      priority: Optional[TicketPriority] = Field(default=TicketPriority.MEDIUM)

      @field_validator("customer_name", "subject", "description")
      @classmethod
      def strip_text(cls, v: str) -> str:
          cleaned = v.strip()
          if not cleaned:
              raise ValueError("Field cannot be empty or whitespace only.")
          return cleaned
  ```
* **Practical Application:**
  - Prevents garbage submissions such as spaces-only strings (`"   "`).
  - `EmailStr` validates real email syntax before touching the database or triggering email notification hooks.
  - Returns clear HTTP 422 Unprocessable Entity error payloads directly to the frontend if client validation was bypassed.

### B. Flexible Ticket Updates & Aliasing
* **Code:**
  ```python
  class TicketUpdate(BaseModel):
      model_config = ConfigDict(populate_by_name=True)

      status: Optional[TicketStatus] = None
      note_text: Optional[str] = Field(None, alias="notes")
      priority: Optional[TicketPriority] = None

      @model_validator(mode="after")
      def check_at_least_one_field(self):
          if self.status is None and self.note_text is None and self.priority is None:
              raise ValueError("At least one field ('status', 'notes', or 'priority') must be provided to update.")
          return self
  ```
* **Practical Application:**
  - The evaluation contract mentions `PUT /api/tickets/{ticket_id}` with body `{ status?, notes? }`.
  - The alias `alias="notes"` allows frontend or API consumers to send either `{ "notes": "text" }` or `{ "note_text": "text" }` without breaking.
  - Rejects empty `PUT {}` requests with a 422 validation error, preventing wasteful database transactions.

### C. ORM Serialization (`from_attributes=True`)
* **Code:**
  ```python
  class TicketDetailOut(BaseModel):
      model_config = ConfigDict(from_attributes=True)
      id: int
      ticket_id: str
      ...
      notes: List[NoteOut] = []
  ```
* **Practical Application:**
  - Allows SQLAlchemy model instances (`db_ticket`) to be passed directly to Pydantic responses.
  - Pydantic extracts attributes, converts datetimes to ISO 8601 strings, and serializes child relations (`ticket.notes`) into JSON arrays.

---

## 3. Verification Test Results

```text
Testing Pydantic Schemas...
1. Valid TicketCreate and whitespace stripping: PASSED
2. Invalid Email rejection (RFC compliance): PASSED
3. Whitespace-only subject rejection: PASSED
4. TicketUpdate with alias field: PASSED
5. Empty TicketUpdate rejection: PASSED
6. Invalid Status enum rejection: PASSED
ALL PHASE 1.2 PYDANTIC SCHEMA VERIFICATIONS PASSED!
```

---
*Phase 1.2 is complete and verified. Ready to proceed to Phase 1.3 (Service Layer & Business Logic).*
