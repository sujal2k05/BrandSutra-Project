# BrandSutra REST API Reference

Base URL: `http://localhost:8080/api`  
Authentication: HTTP Bearer Token (`Authorization: Bearer <JWT>`)

---

## 1. Authentication Endpoints

### `POST /auth/register`
Create a new user and initialize their organization workspace.
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "Jane Doe",
  "organizationName": "Acme Corp",
  "industry": "Consumer Electronics"
}
```
- **Response**: `200 OK` (AuthResponse with JWT token and user profile)

### `POST /auth/login`
Authenticate existing user.
- **Request Body**:
```json
{
  "email": "admin@novahome.com",
  "password": "Admin@123"
}
```
- **Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "admin@novahome.com",
    "fullName": "Sujal Admin",
    "role": "ADMIN",
    "organizationId": 1,
    "organizationName": "NovaHome Appliances"
  }
}
```

### `GET /auth/me`
Retrieve profile of currently authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Organization Management

### `GET /organizations/{id}`
Retrieve organization workspace details.

### `PUT /organizations/{id}`
Update organization metadata (name, industry, website).

### `GET /organizations/{id}/members`
List all team members and assigned roles in the workspace.

### `POST /organizations/{id}/members`
Invite or assign a new team member with `ADMIN`, `CONTENT_CREATOR`, or `REVIEWER` role.

---

## 3. Brand DNA Endpoints

### `GET /brands/{orgId}/dna`
Retrieve Brand Profile (mission, values, primary and secondary voice tones, communication rules).

### `PUT /brands/{orgId}/dna`
Update Brand Profile.

### `GET /brands/{orgId}/facts`
List all approved facts in the brand knowledge base.
- **Response**: Array of `BrandFactDto` objects.

### `POST /brands/{orgId}/facts`
Add an authoritative approved fact.
- **Request Body**:
```json
{
  "category": "DISCOUNTS",
  "factTitle": "Maximum Seasonal Discount",
  "approvedStatement": "Maximum seasonal discount is 25% on selected appliances.",
  "sourceReference": "Q4 Pricing Policy v2.1",
  "effectiveDate": "2026-01-01",
  "expirationDate": "2026-12-31"
}
```

### `PUT /brands/facts/{factId}`
Update an existing fact (increments version number).

### `DELETE /brands/facts/{factId}`
Deactivate an approved fact.

### `GET /brands/{orgId}/rules`
List all deterministic compliance rules (banned terms, discount limits, warranty rules).

### `POST /brands/{orgId}/rules`
Create a compliance rule.
- **Request Body**:
```json
{
  "ruleType": "BANNED_TERM",
  "pattern": "100% perfect",
  "preferredReplacement": "industry-leading quality",
  "explanation": "Unsubstantiated perfection claims violate advertising standards.",
  "severity": "CRITICAL"
}
```

### `GET /brands/{orgId}/guidelines`
List brand guidelines and documents.

### `POST /brands/{orgId}/guidelines`
Add text-based guideline policy.

### `POST /brands/{orgId}/guidelines/upload`
Upload a PDF guideline document. Text is automatically extracted using PyMuPDF and indexed as approved evidence.

---

## 4. Content Submissions & Versioning

### `POST /content`
Create a new marketing submission draft (creates Version 1).
- **Request Body**:
```json
{
  "organizationId": 1,
  "title": "Summer Campaign Post",
  "contentType": "SOCIAL_MEDIA_POST",
  "marketingChannel": "INSTAGRAM",
  "campaignName": "Summer Cool 2026",
  "description": "Instagram carousel copy",
  "contentText": "Get 40% OFF on all NovaHome products! Enjoy 5-year warranty on everything. 100% perfect!",
  "publicationDate": "2026-11-20"
}
```

### `GET /content?orgId=1`
List all submissions for the organization with version and approval metadata.

### `GET /content/{id}`
Retrieve a specific submission, including active version text and recent findings.

### `POST /content/{id}/revisions`
Create an immutable new revision (e.g., Version 2) after correcting text based on AI suggestions.
- **Request Body**:
```json
{
  "contentText": "Get up to 25% off on selected NovaHome appliances! 2-year warranty included."
}
```

### `GET /content/{id}/versions`
Retrieve all historical versions of a submission.

---

## 5. AI Content Verification

### `POST /content/{id}/analyze`
Dispatch active content version to the AI verification service.
1. Spring Boot retrieves approved Brand DNA facts and rules from MySQL.
2. Spring Boot calls FastAPI at `http://localhost:8000/api/analyze`.
3. FastAPI runs deterministic rules and calls Google Gemini 2.5 Flash with strict grounding.
4. Spring Boot verifies evidence IDs, calculates the Brand Risk Score, and persists findings in MySQL.
- **Response**: `200 OK`
```json
{
  "analysisResultId": 2,
  "contentVersionId": 3,
  "status": "COMPLETED",
  "riskScore": 100,
  "riskLevel": "CRITICAL",
  "executionTimeMs": 240,
  "findings": [
    {
      "id": 5,
      "category": "DISCOUNTS",
      "issue": "Advertised discount (40%) exceeds approved maximum (25%)",
      "severity": "CRITICAL",
      "evidenceStatus": "CONTRADICTED",
      "explanation": "Content advertises a 40% discount, contradicting approved policy.",
      "evidenceId": 3,
      "evidenceText": "Maximum seasonal discount is 25%.",
      "sourceName": "Brand Fact #3",
      "suggestedCorrection": "Get up to 25% off on selected products.",
      "confidence": 0.98
    }
  ]
}
```

### `GET /content/{id}/findings`
Fetch findings associated with the active version of a submission.

---

## 6. Approvals & Governance

### `GET /approvals/pending?orgId=1`
List submissions currently awaiting human reviewer action (`PENDING_REVIEW`).

### `POST /approvals/{id}/submit`
Content Creator submits an analyzed version for reviewer evaluation.

### `POST /approvals/{id}/approve`
Reviewer approves the specific immutable version for publication.
- **Request Body**:
```json
{
  "decision": "APPROVED",
  "comments": "Claims verified against Brand DNA v1. Approved for publication."
}
```

### `POST /approvals/{id}/reject`
Reviewer rejects the submission with required feedback comments.

### `POST /approvals/{id}/request-changes`
Reviewer requests revisions from the creator.

### `GET /approvals/{id}/history`
Retrieve the full audit trail of reviewer decisions for a submission.

---

## 7. Dashboard & Analytics

### `GET /dashboard/summary?orgId=1`
Live aggregate KPIs calculated directly via MySQL SQL queries:
- Total Submissions
- Approved Content
- Pending Reviews
- Rejected Content
- High-Risk Content
- Average Brand Risk Score

### `GET /dashboard/analytics?orgId=1`
Detailed time-series and categorical data for Recharts visualizations:
- Status Breakdown
- Severity Distribution (Critical, High, Medium, Low)
- Category Distribution (Discounts, Warranty, Terminology, Pricing, etc.)
