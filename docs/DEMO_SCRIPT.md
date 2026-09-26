# Datastraw Support CRM: 3–5 Minute Video Walkthrough Blueprint

This document provides a step-by-step recording script for demonstrating the Datastraw Support CRM in your demo video submission.

---

## 🎬 Video Overview (Total Duration: ~3:30)

| Timestamp | Section | Key Talking Points | Screen View |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:30** | **1. Introduction & Overview** | Name, project goal, full-stack tech choices (FastAPI + SQLite + React + Tailwind). | Full App Dashboard (`http://localhost:5173`) |
| **0:30 - 1:15** | **2. Core Feature Walkthrough** | Show KPI metrics, ticket list, debounced search bar (`"Richard"`), and status filter tabs (`Open`, `In Progress`, `Closed`). | Live UI interactions |
| **1:15 - 1:45** | **3. Create Ticket & Validation** | Click **"New Ticket"**, demonstrate client & backend validation, submit valid ticket (`TKT-006`). | New Ticket Modal |
| **1:45 - 2:30** | **4. Detail View & Notes Thread** | Open `TKT-001`, transition status (`Open` → `In Progress`), log internal team note, show real-time timeline. | Ticket Detail View |
| **2:30 - 3:00** | **5. ⭐ Stand-Out Feature: SLA Breach** | Highlight `TKT-001` pulsing red badge (`SLA Breached (>24h)`), explain real-time IST age calculation logic. | KPI Card & Breached Filter |
| **3:00 - 3:30** | **6. Code Architecture & Wrap-Up** | Highlight clean directory structure (`routers/`, `schemas/`, `services/`), OpenAPI docs at `/docs`, and Pytest suite. | VS Code / Swagger Docs (`/docs`) |

---

## 🎙️ Sample Script & Narration

### Section 1: Introduction (0:00 - 0:30)
> *"Hello! This is my submission for the Datastraw Support CRM hiring assignment. I built a full-stack customer support management system using Python FastAPI on the backend with SQLite and SQLAlchemy, and React 18 with Vite and Tailwind CSS on the frontend."*

### Section 2: Core Dashboard & Search (0:30 - 1:15)
> *"Here on the main dashboard, you can see our KPI metrics bar tracking Total, Open, In Progress, and SLA Breached tickets. All timestamps are localized to Indian Standard Time (IST). Our search bar is debounced by 300ms to prevent database overload—typing 'Stark' instantly filters across customer names, emails, ticket IDs, and subjects."*

### Section 3: Creating a Ticket (1:15 - 1:45)
> *"Let's create a new ticket by clicking 'New Ticket'. If I enter a malformed email or leave required fields blank, client-side validation highlights errors. Once I submit valid data, FastAPI generates a sequential ID—TKT-006—and returns a 201 Created response."*

### Section 4: Status Transition & Notes (1:45 - 2:30)
> *"Clicking on any card opens the detailed view. As a support agent, I can transition the status from 'Open' to 'In Progress' and append an internal collaboration note. Notice how both changes commit atomically inside the same transaction and update the audit log."*

### Section 5: Stand-Out SLA Feature (2:30 - 3:00)
> *"For my stand-out feature, I built an SLA Auto-Breach Tracking Engine. Any unresolved ticket open for more than 24 hours is automatically flagged with a pulsing red warning tag showing exact hours elapsed. Clicking the Breached SLA KPI card isolates these urgent tickets so support leads can intervene immediately."*

### Section 6: Architecture & Testing (3:00 - 3:30)
> *"Under the hood, the backend follows a strict layered architecture: routers handle HTTP, Pydantic schemas validate requests, the service layer holds business logic, and SQLAlchemy ORM executes parameterized queries. I also wrote an 8-case Pytest suite covering happy paths, 404s, and 422 error handling. Thank you!"*
