import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    NoteCreate,
    TicketCreateResponse,
    TicketUpdateResponse,
    TicketListItem,
    TicketDetailOut,
    NoteOut
)
from app.services import ticket_service

logger = logging.getLogger("datastraw_crm.tickets")

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new support ticket",
    description="Accepts customer name, email, subject, description, and optional priority. Automatically generates a sequential TKT-### ID and sets status to Open."
)
def create_ticket_endpoint(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db)
):
    try:
        new_ticket = ticket_service.create_ticket(db, ticket_in)
        logger.info(f"Created ticket {new_ticket.ticket_id} for {new_ticket.customer_email}")
        return TicketCreateResponse(
            ticket_id=new_ticket.ticket_id,
            created_at=new_ticket.created_at
        )
    except Exception as e:
        logger.error(f"Error creating ticket: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the support ticket."
        )


@router.get(
    "",
    response_model=List[TicketListItem],
    status_code=status.HTTP_200_OK,
    summary="List all tickets with search and status filtering",
    description="Returns tickets ordered newest-first with live search across name/email/ID/subject/description, status filtering, and computed SLA flags."
)
def list_tickets_endpoint(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Closed, SLA Breached"),
    search: Optional[str] = Query(None, description="Search term across name, email, ticket ID, subject, or description"),
    sla_breached: Optional[bool] = Query(None, description="Filter exclusively for tickets exceeding 24h SLA breach threshold"),
    db: Session = Depends(get_db)
):
    try:
        return ticket_service.get_tickets(db, status=status, search=search, sla_breached=sla_breached)
    except Exception as e:
        logger.error(f"Error fetching tickets list: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving tickets."
        )





@router.get(
    "/{ticket_id}",
    response_model=TicketDetailOut,
    status_code=status.HTTP_200_OK,
    summary="Get full ticket details by ticket ID",
    description="Returns complete ticket details, full customer information, and chronological notes list."
)
def get_ticket_endpoint(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = ticket_service.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID '{ticket_id}' was not found."
        )
    return ticket


@router.put(
    "/{ticket_id}",
    response_model=TicketUpdateResponse,
    status_code=status.HTTP_200_OK,
    summary="Update ticket status, priority, or append an internal note",
    description="Allows updating the status and/or priority of a ticket and optionally appending an internal note atomically."
)
def update_ticket_endpoint(
    ticket_id: str,
    update_in: TicketUpdate,
    db: Session = Depends(get_db)
):
    updated = ticket_service.update_ticket(db, ticket_id, update_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID '{ticket_id}' was not found."
        )
    logger.info(f"Updated ticket {ticket_id} (Status: {updated.status}, Priority: {updated.priority})")
    return TicketUpdateResponse(
        success=True,
        updated_at=updated.updated_at
    )


@router.post(
    "/{ticket_id}/notes",
    response_model=NoteOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add an internal note to a ticket",
    description="Appends a new note or team comment to an existing ticket."
)
def add_note_endpoint(
    ticket_id: str,
    note_in: NoteCreate,
    db: Session = Depends(get_db)
):
    note = ticket_service.add_note_to_ticket(db, ticket_id, note_in)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID '{ticket_id}' was not found."
        )
    logger.info(f"Added note to ticket {ticket_id}")
    return note
