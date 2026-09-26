# Phase 0 Documentation: Setup & Scaffolding

This document explains all files created, configurations established, and their specific architectural and practical applications in **Phase 0 — Setup (Hour 0–1)** of the Datastraw Support CRM project.

---

## 1. Summary of Completed Actions

1. **Root Configuration & Git Isolation:**
   - Established `.gitignore` covering Python virtual environments, SQLite database files (`*.sqlite3`, `*.db`), Node modules (`node_modules/`), build outputs (`dist/`), and environment variables (`.env`).

2. **Backend Scaffolding:**
   - Created isolated virtual environment (`backend/.venv`) using Python 3.13.
   - Defined `backend/requirements.txt` with strict dependencies: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `sqlalchemy`, `pytest`, `httpx`, and `python-dotenv`.
   - Installed all backend dependencies into the virtual environment.
   - Created `backend/.env.example` and `backend/.env` for centralized environment configurations (database URL, CORS origins, service names).
   - Created modular package structure: `backend/app/` with `routers/` and `services/` subpackages.
   - Built `backend/app/main.py` with FastAPI initialization, automatic OpenAPI/Swagger documentation (`/docs`, `/redoc`), request logging middleware, global 500 error boundary handling, and a `/health` verification endpoint.
   - Verified backend operation using FastAPI `TestClient` (returned HTTP 200 OK).

3. **Frontend Scaffolding:**
   - Scaffolded React 18 single-page application using Vite in `frontend/`.
   - Configured Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `src/index.css`) with curated brand palettes (vibrant blues and emerald accents) and custom typography (Plus Jakarta Sans and JetBrains Mono).
   - Configured `vite.config.js` with automated reverse-proxying of `/api/*` calls to the FastAPI server at `http://127.0.0.1:8000`.
   - Added `lucide-react` for modern, crisp UI iconography.
   - Executed full production build test (`npm run build`), producing optimized minified assets with zero errors.

---

## 2. Directory Structure After Phase 0

```text
crm/
├── .gitignore                      # Git exclusion rules
├── backend/
│   ├── .venv/                      # Python 3.13 isolated virtual environment
│   ├── app/
│   │   ├── __init__.py             # App package marker
│   │   ├── main.py                 # FastAPI application, CORS, middleware, global error handling
│   │   ├── routers/
│   │   │   └── __init__.py         # Routers package marker
│   │   └── services/
│   │       └── __init__.py         # Services package marker
│   ├── .env                        # Local runtime environment variables
│   ├── .env.example                # Template for production and team deployment
│   └── requirements.txt            # Python library specifications
├── frontend/
│   ├── dist/                       # Validated production build bundle
│   ├── node_modules/               # Installed JavaScript dependencies
│   ├── src/
│   │   ├── App.jsx                 # Initial root component
│   │   ├── index.css               # Tailwind CSS directives & font configurations
│   │   └── main.jsx                # React 18 root DOM mount point
│   ├── index.html                  # HTML entry point with web fonts
│   ├── package.json                # Node dependencies and scripts
│   ├── postcss.config.js           # PostCSS configuration for Tailwind
│   ├── tailwind.config.js          # Tailwind theme and content path configuration
│   └── vite.config.js              # Vite server & API proxy configuration
└── docs/
    └── PHASE_0_SETUP.md            # This documentation file
```

---

## 3. Detailed Code Breakdown & Applications

### A. `.gitignore`
* **Path:** `/.gitignore`
* **Application:** Prevents accidental commits of sensitive `.env` secrets, binary SQLite files (`.db`), large dependency trees (`node_modules/`, `.venv/`), and compiler artifacts. Ensures the GitHub repository remains clean, lightweight, and secure.

### B. `backend/requirements.txt`
* **Path:** `/backend/requirements.txt`
* **Application:** Specifies exact runtime and testing libraries needed for a resilient, production-ready backend:
  * `fastapi` & `uvicorn`: High-performance asynchronous REST API framework and ASGI server.
  * `pydantic` & `pydantic-settings`: Enforces runtime type validation on incoming requests, returning automated HTTP 422 Unprocessable Entity responses for malformed data before reaching the database.
  * `sqlalchemy`: Robust ORM providing parameterized SQL queries that prevent SQL injection vulnerabilities.
  * `pytest` & `httpx`: Enables end-to-end integration and unit testing with FastAPI's `TestClient`.

### C. `backend/app/main.py`
* **Path:** `/backend/app/main.py`
* **Code Components & Purpose:**
  1. **CORS Middleware (`CORSMiddleware`):** Configures allowed origins dynamically from `CORS_ORIGINS` (including Vite's `http://localhost:5173`), preventing browser cross-origin blocking when the frontend calls backend endpoints.
  2. **Request Logging Middleware (`log_requests_middleware`):** Intercepts every incoming HTTP request, records start/end timestamps, calculates duration in milliseconds, and logs the HTTP method, route, and status code. Provides instant observability in server logs.
  3. **Global Exception Handler (`@app.exception_handler(Exception)`):** Prevents uncaught Python exceptions from crashing the server process or leaking internal stack traces. Returns a standardized JSON HTTP 500 response.
  4. **Health Route (`GET /health`):** A lightweight diagnostic endpoint used by container orchestrators (like Docker, Railway, Render) to confirm the service is alive.

### D. `frontend/vite.config.js`
* **Path:** `/frontend/vite.config.js`
* **Application:** Configures Vite's development server. Crucially includes:
  ```javascript
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true
    }
  }
  ```
  This eliminates Cross-Origin Resource Sharing (CORS) friction during local development because all frontend requests to `/api/...` are transparently proxied to FastAPI.

### E. `frontend/tailwind.config.js` & `frontend/src/index.css`
* **Path:** `/frontend/tailwind.config.js` and `/frontend/src/index.css`
* **Application:** Sets up modern CSS utility styling, customized brand color tokens, and Google Fonts (`Plus Jakarta Sans` for UI readability and `JetBrains Mono` for ticket IDs like `TKT-001`). Also includes custom scrollbar rules for smooth list scrolling.

---

## 4. Verification Results

| Target | Command | Result |
| :--- | :--- | :--- |
| **Backend Health Check** | `.\.venv\Scripts\python.exe -c "..."` | **HTTP 200 OK** (`{'status': 'healthy', 'service': 'Datastraw Support CRM Backend'}`) |
| **Frontend Production Build** | `npm run build` | **Build Success (2.06s)** (Zero warnings or syntax errors) |

---
*Phase 0 is complete and verified. Ready to proceed to Phase 1 (Backend Core: Database Models, Schemas, Endpoints, and Pytest Suite).*
