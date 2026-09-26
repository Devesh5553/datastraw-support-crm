# Datastraw Support CRM System

A production-grade, full-stack Customer Support Ticket Management CRM built for the **Datastraw Assessment Test**.

![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20SQLite%20%7C%20React%20%7C%20Tailwind-blue)
![Python](https://img.shields.io/badge/Python-3.13-green)
![React](https://img.shields.io/badge/React-18.3-cyan)
![Tests](https://img.shields.io/badge/Pytest-8%20Passed-emerald)

---

## 📌 Executive Summary & Architecture

The application is structured using a **layered, decoupled architecture** designed for high reliability, zero runtime crashes, and full testability:

```text
Frontend (React 18 + Vite + Tailwind CSS)
  ├── KPI Metrics Bar (Total, Open, In Progress, SLA Breached counts)
  ├── SearchBar (300ms debounced multi-field search)
  ├── StatusFilter (Pill tabs for All, Open, In Progress, Closed, SLA Breached)
  ├── TicketCard Grid (Badges, IST dates, SLA pulse warnings)
  ├── NewTicketModal (Client-side validation & error alerts)
  ├── TicketDetailModal (Status workflow & chronological notes thread)
  └── ErrorBoundary (React exception wrapper)
       │
       ▼ HTTP (fetch API client with Pydantic 422 error unwrapping)
Backend (FastAPI + Python 3.13)
  ├── Routers (/api/tickets)            -> HTTP parsing, status codes & serialization
  ├── Pydantic Schemas (schemas.py)     -> RFC 5322 email & payload validation
  ├── Service Layer (ticket_service.py) -> TKT-### ID sequencing, IST timestamps & SLA metrics
  ├── SQLAlchemy ORM (models.py)        -> Parameterized SQL queries & relationship cascades
  └── SQLite DB (support_crm.db)        -> Engine PRAGMA foreign keys & status CHECK constraints
```

---

## 🛠️ Technology Stack & Tradeoffs

| Tier | Technology | Why This Choice Was Made | Tradeoff Made |
| :--- | :--- | :--- | :--- |
| **Backend** | Python (FastAPI) | Automatic OpenAPI docs (`/docs`), Pydantic v2 request validation, high async performance. | Skipped complex GraphQL in favor of simple REST endpoints to maximize reliability. |
| **Database** | SQLite + SQLAlchemy 2.0 | Zero external infrastructure setup; SQLite file with engine `PRAGMA foreign_keys=ON` guarantees data integrity. | Used SQLite file storage instead of PostgreSQL cluster to stay within scope for MVP. |
| **Validation**| Pydantic v2 + Email-Validator | Rejects malformed requests before touching the DB; returns RFC compliant HTTP 422 error arrays. | Strict validation returns HTTP 422 instead of silently ignoring invalid parameters. |
| **Frontend** | React 18 (Vite) + Tailwind CSS | Fast HMR development, modern utility-first CSS styling, and zero bloated component libraries. | Used vanilla React state instead of Redux to keep bundle light (54 kB gzipped). |
| **Icons** | Lucide React | Clean, lightweight SVG iconography. | None. |

---

## 🗄️ Database Schema & Data Integrity

### `tickets` Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `ticket_id`: VARCHAR(32) UNIQUE NOT NULL (`TKT-001`, `TKT-002`, etc.)
- `customer_name`: VARCHAR(128) NOT NULL
- `customer_email`: VARCHAR(255) NOT NULL
- `subject`: VARCHAR(255) NOT NULL
- `description`: TEXT NOT NULL
- `status`: VARCHAR(32) NOT NULL DEFAULT `'Open'` (`CHECK (status IN ('Open', 'In Progress', 'Closed'))`)
- `priority`: VARCHAR(32) NOT NULL DEFAULT `'Medium'` (`CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'))`)
- `created_at`: TIMESTAMP (IST, `UTC+05:30`)
- `updated_at`: TIMESTAMP (IST, `UTC+05:30`)
- **Indexes:**
  - `idx_tickets_status` ON `tickets(status)`
  - `idx_tickets_search` ON `tickets(customer_name, customer_email)`

### `notes` Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `ticket_id`: VARCHAR(32) NOT NULL (`REFERENCES tickets(ticket_id) ON DELETE CASCADE`)
- `note_text`: TEXT NOT NULL
- `created_at`: TIMESTAMP (IST, `UTC+05:30`)

---

## ⚡ Key Features

1. **Create Tickets:** Auto-generates sequential `TKT-001`, `TKT-002` IDs with customer info and timestamps in IST.
2. **List & Search:** Instant debounced (~300ms) multi-field search across customer name, email, ticket ID, subject, and description.
3. **Filter by Status:** Filter tabs for `All`, `Open`, `In Progress`, `Closed`, and `SLA Breached`.
4. **Ticket Detail & Notes Timeline:** Status workflow transition and team internal notes audit trail.
5. **⭐ Stand-Out Feature — SLA Auto-Breach Engine:** Automatically computes elapsed hours in real-time (in IST). Any unresolved ticket open for >24 hours displays a pulsing red `SLA Breached (32.0h open)` warning badge.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # On Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Backend server runs at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
*Frontend app runs at `http://localhost:5173`.*

---

## 🐳 Docker Deployment Instructions (For User Execution)

To build and run the full application as a containerized production service:

### Build & Run with Docker Compose (Recommended)
```bash
docker-compose up --build -d
```
*Access the application at `http://localhost:8000`.*

### Build & Run with Docker CLI
```bash
# 1. Build Docker image
docker build -t datastraw-crm .

# 2. Run container
docker run -d -p 8000:8000 --name datastraw_crm_app datastraw-crm
```

### Stop & Cleanup Docker Containers
```bash
# Stop Docker Compose
docker-compose down

# Stop Docker CLI Container
docker stop datastraw_crm_app && docker rm datastraw_crm_app
```

---

## 🧪 Running Automated Pytest Suite

```powershell
cd backend
.\.venv\Scripts\pytest -v
```
*Executes 8 comprehensive integration test cases covering creation, sequential IDs, validation errors, search, filter, 404s, and updates.*

---

## 🛡️ Reliability Checklist

- [x] Every route wrapped in try/except with typed error responses.
- [x] Pydantic validates all inputs (no unvalidated user input reaches DB).
- [x] SQLite engine listener executes `PRAGMA foreign_keys=ON` on connection.
- [x] Empty search returns an empty state, not a 500 error.
- [x] React ErrorBoundary wraps UI to prevent blank crash screens.
- [x] Database sessions cleanly closed per request via FastAPI `Depends(get_db)`.

---

## 🔮 What Would Be Added With More Time

1. **Role-Based Authentication (JWT):** Support agent vs admin vs customer portal login views.
2. **Multi-Channel Ingestion:** Email-to-ticket auto-parser and live WebSockets chat widget.
3. **Cursor Pagination:** For scaling past 100,000+ support tickets efficiently.
