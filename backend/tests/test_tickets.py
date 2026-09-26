import pytest
from fastapi.testclient import TestClient


def test_create_ticket_success(client: TestClient):
    """Test creating a valid support ticket returns 201 Created and TKT-001."""
    payload = {
        "customer_name": "Sarah Connor",
        "customer_email": "sarah@cyberdyne.org",
        "subject": "System anomaly in core unit",
        "description": "The cooling manifold is showing erratic temperature spikes above 85C.",
        "priority": "High"
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["ticket_id"] == "TKT-001"
    assert "created_at" in data


def test_create_ticket_sequential_id(client: TestClient):
    """Test sequential ID allocation across multiple creations (TKT-001, TKT-002, TKT-003)."""
    for i in range(1, 4):
        payload = {
            "customer_name": f"User {i}",
            "customer_email": f"user{i}@example.com",
            "subject": f"Inquiry #{i}",
            "description": f"Details for customer inquiry #{i} requesting support."
        }
        res = client.post("/api/tickets", json=payload)
        assert res.status_code == 201
        assert res.json()["ticket_id"] == f"TKT-{i:03d}"


def test_create_ticket_validation_errors(client: TestClient):
    """Test input validation returns 422 for malformed email, empty subject, or missing body."""
    # 1. Malformed Email
    bad_email_res = client.post("/api/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "not-an-email",
        "subject": "Cannot log in",
        "description": "Password reset button is missing."
    })
    assert bad_email_res.status_code == 422

    # 2. Whitespace-only subject
    bad_subject_res = client.post("/api/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "   ",
        "description": "Password reset button is missing."
    })
    assert bad_subject_res.status_code == 422

    # 3. Description too short (< 5 chars)
    short_desc_res = client.post("/api/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "Valid Subject",
        "description": "Hi"
    })
    assert short_desc_res.status_code == 422


def test_list_tickets(client: TestClient):
    """Test GET /api/tickets returns 200 with ticket items and SLA fields."""
    client.post("/api/tickets", json={
        "customer_name": "Emma Watson",
        "customer_email": "emma@hogwarts.uk",
        "subject": "Book delivery delay",
        "description": "Standard delivery timeline exceeded by 3 business days."
    })

    res = client.get("/api/tickets")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    ticket = items[0]
    assert ticket["ticket_id"] == "TKT-001"
    assert ticket["customer_name"] == "Emma Watson"
    assert ticket["status"] == "Open"
    assert ticket["priority"] == "Medium"  # Default priority
    assert ticket["is_sla_breached"] is False
    assert ticket["notes_count"] == 0


def test_filter_tickets_by_status(client: TestClient):
    """Test filtering tickets by status (Open, In Progress, Closed)."""
    # Create two tickets
    client.post("/api/tickets", json={
        "customer_name": "Ticket One",
        "customer_email": "t1@example.com",
        "subject": "First Ticket",
        "description": "First ticket test description"
    })
    client.post("/api/tickets", json={
        "customer_name": "Ticket Two",
        "customer_email": "t2@example.com",
        "subject": "Second Ticket",
        "description": "Second ticket test description"
    })

    # Close TKT-002
    client.put("/api/tickets/TKT-002", json={"status": "Closed"})

    # Filter Open
    res_open = client.get("/api/tickets?status=Open")
    assert res_open.status_code == 200
    open_items = res_open.json()
    assert len(open_items) == 1
    assert open_items[0]["ticket_id"] == "TKT-001"

    # Filter Closed
    res_closed = client.get("/api/tickets?status=Closed")
    assert res_closed.status_code == 200
    closed_items = res_closed.json()
    assert len(closed_items) == 1
    assert closed_items[0]["ticket_id"] == "TKT-002"


def test_search_tickets_by_keyword(client: TestClient):
    """Test case-insensitive search across name, subject, email, and description."""
    client.post("/api/tickets", json={
        "customer_name": "David Copperfield",
        "customer_email": "david@magic.com",
        "subject": "Vanishing illusion bug",
        "description": "Stage curtain mechanism stuck during performance."
    })
    client.post("/api/tickets", json={
        "customer_name": "Grace Hopper",
        "customer_email": "grace@navy.mil",
        "subject": "Moth found in relay #70",
        "description": "First actual case of bug being found in mainframe."
    })

    # Search by email domain
    res_magic = client.get("/api/tickets?search=magic.com")
    assert res_magic.status_code == 200
    assert len(res_magic.json()) == 1
    assert res_magic.json()[0]["customer_name"] == "David Copperfield"

    # Search by keyword in description
    res_moth = client.get("/api/tickets?search=mainframe")
    assert res_moth.status_code == 200
    assert len(res_moth.json()) == 1
    assert res_moth.json()[0]["ticket_id"] == "TKT-002"

    # Search with no match
    res_empty = client.get("/api/tickets?search=nonexistentterm123")
    assert res_empty.status_code == 200
    assert len(res_empty.json()) == 0


def test_get_ticket_detail_and_404(client: TestClient):
    """Test retrieving full ticket details and verifying 404 for missing ticket."""
    client.post("/api/tickets", json={
        "customer_name": "Bruce Wayne",
        "customer_email": "bruce@wayneenterprises.com",
        "subject": "Batmobile GPS calibration",
        "description": "Satellite link dropped while traversing Gotham river bridge.",
        "priority": "Urgent"
    })

    # 1. Successful fetch
    res = client.get("/api/tickets/TKT-001")
    assert res.status_code == 200
    data = res.json()
    assert data["ticket_id"] == "TKT-001"
    assert data["priority"] == "Urgent"
    assert isinstance(data["notes"], list)
    assert len(data["notes"]) == 0

    # 2. 404 Not Found
    res_404 = client.get("/api/tickets/TKT-999")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()


def test_update_ticket_status_and_append_note(client: TestClient):
    """Test status update and atomic note appending via PUT /api/tickets/{id}."""
    client.post("/api/tickets", json={
        "customer_name": "Clark Kent",
        "customer_email": "clark@dailyplanet.com",
        "subject": "Press pass badge not scanning",
        "description": "Building security gate rejects RFID card."
    })

    # 1. Update status to In Progress and append note
    update_res = client.put("/api/tickets/TKT-001", json={
        "status": "In Progress",
        "notes": "Issued temporary visitor pass while re-encoding card."
    })
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

    # 2. Verify state in GET detail
    detail = client.get("/api/tickets/TKT-001").json()
    assert detail["status"] == "In Progress"
    assert len(detail["notes"]) == 1
    assert detail["notes"][0]["note_text"] == "Issued temporary visitor pass while re-encoding card."

    # 3. 404 on missing ticket update
    missing_update = client.put("/api/tickets/TKT-999", json={"status": "Closed"})
    assert missing_update.status_code == 404

    # 4. 422 on empty update payload (must provide at least status, notes, or priority)
    empty_update = client.put("/api/tickets/TKT-001", json={})
    assert empty_update.status_code == 422
