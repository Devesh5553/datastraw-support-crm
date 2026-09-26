# Multi-stage production Dockerfile for Datastraw Support CRM
# Stage 1: Build React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend + FastAPI
FROM python:3.13-slim AS runner
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application code
COPY backend/app ./backend/app

# Copy built frontend assets to static folder inside backend for unified serving
COPY --from=frontend-builder /app/frontend/dist ./backend/app/static

WORKDIR /app/backend

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
