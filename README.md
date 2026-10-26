# BrandSutra

> **Your Brand. Your Rules. AI-Powered Confidence.**

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🏆 Project Information

- **Project Name**: BrandSutra
- **Tagline**: *Your Brand. Your Rules. AI-Powered Confidence.*
- **Project Category**: Explainable AI-Powered Brand Governance and Pre-Publication Content Verification Platform
- **Hackathon**: AVINYA
- **Problem Statement Provider**: Inkloom AI
- **Developer**: Sujal (Individual participant)

---

## 📌 Executive Summary

Modern marketing teams publish content across dozens of digital channels at lightning speed. Inconsistencies, unverified discounts, outdated promotional dates, missing mandatory disclaimers, and exaggerated claims regularly slip past human review—resulting in costly regulatory penalties, legal disputes, and brand reputational damage.

**BrandSutra** is an enterprise-grade content verification and brand governance platform. Organizations define their authoritative knowledge base called **Brand DNA** (identity, voice guidelines, approved facts, pricing/discount caps, and terminology rules). When marketing creators draft copy (social media posts, advertisements, website articles, promotional emails), BrandSutra evaluates the content before publication using a **hybrid deterministic and semantic AI verification pipeline**, calculating an explainable **Brand Risk Score** (0–100) and enabling human reviewers to approve or request changes on immutable versions.

---

## 🚀 Key Features

### 1. 🧬 Brand DNA Knowledge Base Engine
- **Brand Identity & Voice**: Define mission, values, target audience, primary tone (*Professional, Friendly, Formal, Casual, Confident*), and voice parameters.
- **Approved Facts Repository**: Categorized authoritative knowledge base (*Pricing, Warranty, Product Information, Discounts, Offers, Performance, General Policies*) with version tracking and validity dates.
- **Deterministic Brand Rules**: Regulate banned phrases, restricted terms, required phrases, warranty duration ceilings, and mandatory disclaimers.
- **Guideline Intelligence**: Upload PDF policy manuals; text is automatically extracted page-by-page via **PyMuPDF (`fitz`)** and converted into approved verifiable evidence.

### 2. 🛡️ Real Hybrid AI Content Inspector
- **Deterministic Pre-Scan**: High-speed regex engine catches banned terms, excessive discounts, and missing disclaimers with 100% precision.
- **Google Gemini 2.5 Flash Grounding**: Deep semantic verification evaluating brand voice, tone alignment, and subtle unsupported claims using the official Google GenAI Python SDK.
- **Anti-Prompt-Injection Sandbox**: Evaluated content is strictly isolated within data boundaries and treated as untrusted text, preventing prompt injection attacks.
- **Strict Evidence Validation**: Spring Boot cross-checks every AI-cited fact ID against active database records belonging strictly to the requesting organization.
- **Detects all 8 core violation types**:
  1. Incorrect product information
  2. Unsupported marketing claims
  3. Incorrect warranty information
  4. Incorrect discount percentages
  5. Outdated offers and dates
  6. Banned or restricted terminology
  7. Brand tone inconsistencies
  8. Missing required disclaimers

### 3. 🎯 Explainable Brand Risk Radar
- Calculates an explainable **Brand Risk Score** (0–100) based on weighted severity findings:
  - `CRITICAL`: 40 points
  - `HIGH`: 25 points
  - `MEDIUM`: 15 points
  - `LOW`: 5 points
- Dynamic SVG gauge visualization with color-coded risk levels (*Low, Medium, High, Critical*).
- Cites specific approved facts, source references, and suggests one-click actionable corrections.

### 4. 🔄 Content Versioning & Human Approval Workflow
- **Immutable Content Versions**: Every edit creates a new version (`Version 1`, `Version 2`), preserving the complete compliance history.
- **Role-Based Workflow**: Content creators draft and revise copy; reviewers inspect highlighted violations and issue binding decisions (`APPROVED`, `REJECTED`, `CHANGES_REQUESTED`) with audit comments.
- Approvals apply strictly to a specific immutable version; subsequent edits require re-approval.

### 5. 📊 Real SQL Governance Analytics
- Executive dashboard powered by live SQL queries against `brandsutra_db`.
- Visual charts using **Recharts**:
  - Submission Status Distribution
  - Risk Severity Distribution
  - Historical violation trends and KPI summary cards.

---

## 🏗️ Architecture

```
React Frontend (Vite / Tailwind CSS)
            │
            ▼ REST API / Bearer JWT
Spring Boot 3.3.4 Backend (Java 21)
       │                  │
       ▼ JDBC / JPA       ▼ HTTP (Private Service Token)
MySQL 8.0 Database     FastAPI AI Microservice (Python 3.11)
(brandsutra_db)           │
(13 Relational Tables)    ▼ Official Google GenAI SDK
                       Google Gemini API (gemini-2.5-flash)
```

For detailed architectural schematics and sequence diagrams, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| **Backend** | Java 21 LTS, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Spring Security, JJWT 0.12.6, Maven |
| **Database** | MySQL 8.0+ (`brandsutra_db`), 13 Relational Tables, InnoDB, UTF8MB4 |
| **AI Microservice** | Python 3.11+, FastAPI, Uvicorn, Google GenAI SDK, Pydantic v2, PyMuPDF (`fitz`), Pytest |
| **Orchestration** | Docker, Docker Compose, Nginx |

---

## 👥 Seeded Demo Accounts (NovaHome Appliances)

The application automatically seeds a fictional organization—**NovaHome Appliances**—complete with 7 approved facts, 5 brand rules, guidelines, and pre-configured test users:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@novahome.com` | `Admin@123` | Full workspace admin, Brand DNA, rules, team management, analytics |
| **Content Creator** | `creator@novahome.com` | `Creator@123` | Draft content, run AI inspections, create revisions, submit for review |
| **Reviewer** | `reviewer@novahome.com` | `Reviewer@123` | Inspect submissions, review AI findings & evidence, Approve/Reject/Request Changes |

> ⚡ **Tip**: The application includes a **1-Click Demo Role Switcher** on the Login page and Sidebar, allowing evaluators to seamlessly toggle between Admin, Creator, and Reviewer perspectives with zero typing!

---

## ⚡ Quick Start Guide

### Option 1: Docker Compose (Recommended)

1. Clone repository and copy environment template:
```bash
git clone https://github.com/sujal/BrandSutra.git
cd BrandSutra
cp .env.example .env
```

2. Add your Gemini API key in `.env`:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. Launch all 4 microservices:
```bash
docker compose up --build -d
```

4. Open your browser:
- **Frontend Dashboard**: `http://localhost:3000` (or `http://localhost:5173` if running locally)
- **Spring Boot API**: `http://localhost:8080/api`
- **FastAPI AI Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Multi-Process Development

#### 1. Database
Ensure MySQL 8 is running with database `brandsutra_db`:
```bash
mysql -u root -p -P 3306 < database/schema.sql
```

#### 2. FastAPI AI Service
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate      # On Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```

#### 4. React Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Visit `http://localhost:5173` to explore BrandSutra!

---

## 🧪 Testing & Verification

### Automated Unit & Integration Tests

1. **Python AI Rule Engine & Schemas**:
```bash
cd ai-service
pytest -v
# Output: 3 passed in 0.24s
```

2. **Spring Boot Backend Services & Repositories**:
```bash
cd backend
mvn test
# Output: Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
```

3. **Full 12-Stage End-to-End Workflow Verification**:
BrandSutra includes an automated PowerShell script (`test_flow.ps1`) verifying all 12 stages against the live services:
```powershell
powershell -ExecutionPolicy Bypass -File test_flow.ps1
```
Verified Stages:
- [x] Admin Login & Brand DNA extraction
- [x] Approved facts & rules indexing
- [x] Content Creator login & non-compliant post submission
- [x] Real-time AI analysis & risk scoring (100/100 CRITICAL, 4 detected findings)
- [x] Creator applies suggested corrections and creates Version 2 revision
- [x] AI re-analysis on Version 2 (Risk score 0/100 LOW, 0 findings)
- [x] Submission for human review (Status: `PENDING_REVIEW`)
- [x] Reviewer login & pending queue inspection
- [x] Reviewer approval with immutable version binding and audit comments
- [x] Dashboard KPI calculation from actual SQL database queries

---

## 📚 Detailed Documentation

- [System Architecture & Sequence Flows](docs/ARCHITECTURE.md)
- [Database Schema & ER Model](docs/DATABASE.md)
- [REST API Reference](docs/API.md)
- [AI Verification Engine & Evidence Grounding](docs/AI_ENGINE.md)
- [Deployment & Production Hardening Guide](docs/DEPLOYMENT.md)

---

## 🔮 Future Enhancements (Round 3 Roadmap)

1. **Guideline Gap Detector**: Cluster recurring unsupported claims across marketing teams and generate automated recommendations for missing Brand DNA policies.
2. **Dense Vector Semantic RAG**: Supplement keyword retrieval with vector embeddings (e.g., pgvector / ChromaDB) for semantic retrieval over 100+ page policy manuals.
3. **Side-by-Side Visual Diff Inspector**: Render visual diffs highlighting exact additions and deletions between revisions directly within the human approval portal.

---

## 📄 License & Attribution

Developed for the **AVINYA Hackathon** by Sujal.  
Problem Statement provided by **Inkloom AI**.  
Licensed under the [MIT License](LICENSE).
