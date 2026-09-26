import logging
import os
import time
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import init_db
from app.routers import tickets
from app.services import ticket_service
from app.database import SessionLocal

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("datastraw_crm")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and initial 5 tickets exist
    logger.info("Initializing database models and tables...")
    init_db()
    db = SessionLocal()
    try:
        ticket_service.ensure_initial_tickets(db)
    finally:
        db.close()
    logger.info("Database ready with initial tickets.")
    yield
    # Shutdown
    logger.info("Shutting down Datastraw Support CRM...")


app = FastAPI(
    title="Datastraw Support CRM API",
    description="Backend API for customer support ticket management, status transitions, SLA monitoring, and internal notes.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins: List[str] = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
if "*" not in origins:
    origins.append("http://localhost:5173")
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Request Logging Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms}ms)"
        )
        return response
    except Exception as exc:
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(
            f"Unhandled error processing {request.method} {request.url.path} ({process_time_ms}ms): {exc}",
            exc_info=True
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "message": "An unexpected server error occurred. Please try again or contact support."
            }
        )


# Global exception handler for uncaught exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing your request."
        }
    )


# Include API Routers
app.include_router(tickets.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Datastraw Support CRM Backend",
        "version": "1.0.0"
    }


# Mount Static Frontend Bundle if present (Production Single Container Deployment)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if not os.path.exists(frontend_dist):
    # Check current directory inside Docker container / static folder
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))

if os.path.exists(frontend_dist):
    logger.info(f"Mounting static production frontend from {frontend_dist}")
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/", tags=["Root"])
    def root_redirect():
        return {
            "message": "Welcome to Datastraw Support CRM API. Visit /docs for OpenAPI documentation.",
            "health": "/health",
            "docs": "/docs"
        }
