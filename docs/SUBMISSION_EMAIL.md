# Submission Email Template

**To:** `ozair.shaikh@datastraw.in`, `aryan.jaiswal@datastraw.in`  
**CC:** `talent@datastraw.in`  
**Subject:** Submission: Support CRM System Hiring Assignment - [Your Full Name]

---

### Email Body

Hi Ozair & Aryan,

I have completed the Customer Support Ticketing CRM System hiring assignment. The application has been built, tested, containerized, and documented according to the assessment specifications.

Here are the required submission links:

- **Deployed Live Application:** `[Insert Deployed URL - e.g. Railway / Render / Vercel link]`
- **GitHub Repository:** `[Insert GitHub Repo URL]`
- **Demo Video Walkthrough (3-5 min):** `[Insert YouTube / Loom Link]`
- **LinkedIn Profile:** `[Insert LinkedIn Profile Link]`

---

### Key Technical Highlights & Approach

1. **Architecture & Reliability:**
   - **Backend:** Python (FastAPI) + SQLite + SQLAlchemy 2.0 ORM + Pydantic v2. Built using a strict 4-layer request flow (Router → Pydantic Schemas → Service Layer → ORM) to guarantee error isolation and zero server crashes.
   - **Data Integrity:** SQLite engine listener enforces `PRAGMA foreign_keys=ON` for automatic `ON DELETE CASCADE` deletion of orphaned notes.
   - **Frontend:** React 18 (Vite) + Tailwind CSS + Lucide Icons. Features debounced (~300ms) search, responsive layout, and React ErrorBoundary protections.
   - **Timezone:** Native support for Indian Standard Time (IST, `UTC+05:30`) across all models, services, and UI timestamps.

2. **⭐ Stand-Out Feature — SLA Auto-Breach Tracking & Urgency System:**
   - Automatically evaluates ticket age in real-time in IST. Any unresolved ticket open for >24 hours displays a pulsing red `SLA Breached (>24h)` warning badge and can be filtered in 1 click using the interactive KPI summary bar.

3. **Tradeoffs Made:**
   - Skipped complex user authentication (JWT/OAuth) to keep the MVP simple, focus on data validation, and guarantee 100% test reliability within the 2–3 day timeline.

4. **What I Would Add With More Time:**
   - Role-based authentication (Agent vs Admin), email-to-ticket auto-parser, and WebSockets live chat ingestion.

An 8-case Pytest integration test suite (`pytest -v`) is included in `backend/tests/`. Complete setup steps, architecture diagrams, and Docker deployment scripts are detailed in the repository `README.md`.

Thank you for the opportunity, and I look forward to your feedback!

Best regards,  
**[Your Full Name]**  
[Your Phone Number]  
[Your Email Address]
