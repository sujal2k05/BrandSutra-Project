# BrandSutra Deployment Guide

This document describes how to configure, run, and deploy BrandSutra across both local development environments and containerized Docker environments.

---

## 1. Prerequisites

- **Java**: Eclipse Adoptium Temurin JDK 21 LTS
- **Build Tool**: Apache Maven 3.9+
- **Python**: Python 3.11+
- **Node.js**: Node.js 20+ and npm 10+
- **Database**: MySQL Server 8.0+
- **AI Key**: Google Gemini API Key (`GEMINI_API_KEY`)
- *(Optional)*: Docker & Docker Compose 2.0+

---

## 2. Local Multi-Process Setup

### Step A: MySQL Database Setup
Ensure MySQL is running and execute the database schema:
```bash
# Connect to your MySQL server (adjust port/user as needed)
mysql -u root -p -P 3306 < database/schema.sql
```
This initializes all 13 tables in `brandsutra_db`.

### Step B: AI Microservice (FastAPI)
```bash
cd ai-service

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure .env
copy .env.example .env
# Set GEMINI_API_KEY=your_key_here

# Run unit tests
pytest

# Start development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Healthcheck: `http://localhost:8000/health`

### Step C: Backend (Spring Boot 3.3.4, Java 21)
```bash
cd backend

# Ensure JAVA_HOME points to JDK 21
# On Windows:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"

# Build and run
mvn clean package -DskipTests
mvn spring-boot:run
```
Backend API will start on `http://localhost:8080`.  
*Note*: `DataInitializer` automatically seeds the `NovaHome Appliances` demo workspace on first boot.

### Step D: Frontend (React 19 + Vite + Tailwind CSS)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --port 5173
```
Frontend UI will be live at `http://localhost:5173`.

---

## 3. Docker Compose Orchestration (Production Ready)

To launch the complete multi-container stack with a single command:

```bash
# 1. Create root .env file from template
cp .env.example .env
# Fill in GEMINI_API_KEY

# 2. Build and start all 4 services
docker compose up --build -d

# 3. Check health and service logs
docker compose ps
docker compose logs -f backend
```

Services in Docker Compose:
- **`brandsutra_db`**: MySQL 8.0 (Port `3306`)
- **`brandsutra_ai`**: FastAPI + PyMuPDF + GenAI (Port `8000`)
- **`brandsutra_backend`**: Spring Boot 3.3.4 (Port `8080`)
- **`brandsutra_frontend`**: Nginx + React 19 SPA (Port `3000`)

Access the web interface at `http://localhost:3000`.

---

## 4. Production Hardening Checklist

1. **Secrets Management**: Store `DB_PASSWORD`, `JWT_SECRET`, and `GEMINI_API_KEY` in environment secrets or cloud vaults (AWS Secrets Manager, Google Cloud Secret Manager).
2. **CORS Restrictions**: In `CorsConfig.java`, replace wildcard/localhost origins with the explicit production domain.
3. **Database Migrations**: Switch `spring.jpa.hibernate.ddl-auto` from `update` to `validate`, managing all schema increments with Flyway.
4. **HTTPS / TLS**: Terminate TLS at the Nginx reverse proxy or cloud load balancer.
5. **Rate Limiting**: Enforce request rate limiting on `/api/content/{id}/analyze` to manage Gemini API token quotas.
