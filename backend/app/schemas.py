from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    field_validator,
    model_validator
)


class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


# ---------------------------------------------------------
# Note Schemas
# ---------------------------------------------------------

class NoteCreate(BaseModel):
    note_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The content of the internal note or update message"
    )

    @field_validator("note_text")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Note text cannot be empty or purely whitespace.")
        return cleaned


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    note_text: str
    created_at: datetime


# ---------------------------------------------------------
# Ticket Input Schemas
# ---------------------------------------------------------

class TicketCreate(BaseModel):
    customer_name: str = Field(
        ...,
        min_length=2,
        max_length=128,
        description="Customer's full name"
    )
    customer_email: EmailStr = Field(
        ...,
        description="Valid customer email address"
    )
    subject: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Ticket subject line / title"
    )
    description: str = Field(
        ...,
        min_length=5,
        max_length=10000,
        description="Detailed description of the customer inquiry or issue"
    )
    priority: Optional[TicketPriority] = Field(
        default=TicketPriority.MEDIUM,
        description="Urgency level (Low, Medium, High, Urgent)"
    )

    @field_validator("customer_name", "subject", "description")
    @classmethod
    def strip_text(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only.")
        return cleaned


class TicketUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Optional[TicketStatus] = Field(
        default=None,
        description="New ticket status (Open, In Progress, Closed)"
    )
    note_text: Optional[str] = Field(
        default=None,
        alias="notes",
        max_length=5000,
        description="Optional internal note to append during the status update"
    )
    priority: Optional[TicketPriority] = Field(
        default=None,
        description="Optional updated priority"
    )

    @field_validator("note_text")
    @classmethod
    def validate_note(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            return cleaned if cleaned else None
        return None

    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if self.status is None and self.note_text is None and self.priority is None:
            raise ValueError("At least one field ('status', 'notes', or 'priority') must be provided to update.")
        return self


# ---------------------------------------------------------
# Ticket Response Schemas
# ---------------------------------------------------------

class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketUpdateResponse(BaseModel):
    success: bool = True
    updated_at: datetime


class TicketListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime
    is_sla_breached: bool = False
    sla_hours_elapsed: float = 0.0
    notes_count: int = 0


class TicketDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime
    is_sla_breached: bool = False
    sla_hours_elapsed: float = 0.0
    notes: List[NoteOut] = []
