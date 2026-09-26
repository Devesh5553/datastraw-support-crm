from datetime import datetime, timezone, timedelta
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    func
)
from sqlalchemy.orm import relationship
from app.database import Base

IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def get_now_ist():
    """Returns current datetime in Indian Standard Time (IST)."""
    return datetime.now(IST)



class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g., TKT-001
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(
        String(32),
        nullable=False,
        default="Open"
    )
    priority = Column(
        String(32),
        nullable=False,
        default="Medium"
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_now_ist,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_now_ist,
        onupdate=get_now_ist,
        server_default=func.now()
    )

    # Relationships
    notes = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Note.created_at.asc()"
    )

    # Constraints and Indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('Open', 'In Progress', 'Closed')",
            name="check_ticket_status"
        ),
        CheckConstraint(
            "priority IN ('Low', 'Medium', 'High', 'Urgent')",
            name="check_ticket_priority"
        ),
        Index("idx_tickets_status", "status"),
        Index("idx_tickets_search", "customer_name", "customer_email"),
    )

    def __repr__(self):
        return f"<Ticket(id={self.id}, ticket_id='{self.ticket_id}', customer='{self.customer_name}', status='{self.status}')>"


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(
        String(32),
        ForeignKey("tickets.ticket_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    note_text = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_now_ist,
        server_default=func.now()
    )

    # Relationships
    ticket = relationship("Ticket", back_populates="notes")

    def __repr__(self):
        return f"<Note(id={self.id}, ticket_id='{self.ticket_id}', created_at='{self.created_at}')>"
