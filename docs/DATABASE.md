# BrandSutra Database Schema Documentation

Database Name: `brandsutra_db`  
Engine: `InnoDB`  
Default Charset: `utf8mb4`  
Collation: `utf8mb4_unicode_ci`  

The database consists of **13 relational tables** supporting multi-tenancy, immutable content versioning, explainable AI findings, and human approval auditing.

---

## Entity Relationship Overview

```
organizations (1) ────< (N) organization_members (N) >──── (1) users
       │
       ├────< (1) brand_profiles
       ├────< (N) brand_facts
       ├────< (N) brand_rules
       ├────< (N) brand_guidelines
       ├────< (N) content_submissions ────< (N) content_versions
       │                                            │
       │                                            ├────< (1) analysis_results
       │                                            │             │
       │                                            │             └────< (N) ai_findings
       │                                            │
       │                                            └────< (N) approval_decisions
       │
       └────< (N) audit_logs
```

---

## Table Definitions

### 1. `organizations`
Primary workspace entity representing a corporate brand or agency.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(150), NOT NULL, UNIQUE)
- `slug` (VARCHAR(150), NOT NULL, UNIQUE)
- `industry` (VARCHAR(100))
- `website` (VARCHAR(255))
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)

### 2. `users`
Authenticated system users.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `email` (VARCHAR(150), NOT NULL, UNIQUE)
- `password_hash` (VARCHAR(255), NOT NULL) - BCrypt encrypted
- `full_name` (VARCHAR(150), NOT NULL)
- `role` (ENUM('ADMIN', 'CONTENT_CREATOR', 'REVIEWER'), NOT NULL)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### 3. `organization_members`
Association table linking users to organizations with specific workspace roles.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `user_id` (BIGINT, FK -> users.id, ON DELETE CASCADE)
- `role` (ENUM('ADMIN', 'CONTENT_CREATOR', 'REVIEWER'), NOT NULL)
- `created_at` (TIMESTAMP)
- *Constraint*: `UNIQUE(organization_id, user_id)`

### 4. `brand_profiles`
Core brand identity, audience, and voice guidelines.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, UNIQUE, ON DELETE CASCADE)
- `brand_name` (VARCHAR(150), NOT NULL)
- `description` (TEXT)
- `industry` (VARCHAR(100))
- `website` (VARCHAR(255))
- `target_audience` (TEXT)
- `brand_mission` (TEXT)
- `brand_values` (TEXT)
- `primary_tone` (VARCHAR(50)) - Professional, Friendly, Formal, Casual, etc.
- `secondary_tone` (VARCHAR(50))
- `voice_guidelines` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### 5. `brand_facts`
Approved, authoritative statements that serve as factual evidence.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `category` (ENUM('PRICING', 'WARRANTY', 'PRODUCT_INFORMATION', 'DISCOUNTS', 'OFFERS', 'PERFORMANCE', 'GENERAL_POLICIES'), NOT NULL)
- `fact_title` (VARCHAR(200), NOT NULL)
- `approved_statement` (TEXT, NOT NULL)
- `source_reference` (VARCHAR(255))
- `version` (INT, DEFAULT 1)
- `effective_date` (DATE)
- `expiration_date` (DATE)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### 6. `brand_rules`
Deterministic compliance rules (banned terms, required disclaimers, numeric limits).
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `rule_type` (ENUM('BANNED_TERM', 'RESTRICTED_TERM', 'REQUIRED_PHRASE', 'DISCOUNT_LIMIT', 'WARRANTY_LIMIT', 'REQUIRED_DISCLAIMER'), NOT NULL)
- `pattern` (VARCHAR(255), NOT NULL)
- `preferred_replacement` (VARCHAR(255))
- `explanation` (TEXT)
- `severity` (ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), DEFAULT 'HIGH')
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### 7. `brand_guidelines`
Extracted textual policies and uploaded guideline documents.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `title` (VARCHAR(200), NOT NULL)
- `category` (VARCHAR(100))
- `guideline_text` (LONGTEXT, NOT NULL)
- `original_filename` (VARCHAR(255))
- `version` (INT, DEFAULT 1)
- `is_approved` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### 8. `content_submissions`
Parent submission container for marketing campaigns.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `creator_id` (BIGINT, FK -> users.id)
- `title` (VARCHAR(255), NOT NULL)
- `content_type` (ENUM('SOCIAL_MEDIA_POST', 'ADVERTISEMENT', 'EMAIL_MARKETING', 'WEBSITE_CONTENT', 'PRODUCT_DESCRIPTION', 'PROMOTIONAL_CAMPAIGN'), NOT NULL)
- `marketing_channel` (ENUM('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'WEBSITE', 'EMAIL', 'OTHER'), NOT NULL)
- `campaign_name` (VARCHAR(200))
- `description` (TEXT)
- `overall_status` (ENUM('DRAFT', 'ANALYZING', 'ANALYZED', 'ANALYSIS_FAILED', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'), DEFAULT 'DRAFT')
- `current_version_number` (INT, DEFAULT 1)
- `publication_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

### 9. `content_versions`
Immutable content revisions created each time copy is edited.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `submission_id` (BIGINT, FK -> content_submissions.id, ON DELETE CASCADE)
- `version_number` (INT, NOT NULL)
- `content_text` (LONGTEXT, NOT NULL)
- `created_by` (BIGINT, FK -> users.id)
- `analysis_status` (VARCHAR(50), DEFAULT 'NOT_ANALYZED')
- `risk_score` (INT, DEFAULT 0)
- `risk_level` (VARCHAR(50))
- `created_at` (TIMESTAMP)
- *Constraint*: `UNIQUE(submission_id, version_number)`

### 10. `analysis_results`
Analysis metadata for a specific content version.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `content_version_id` (BIGINT, FK -> content_versions.id, ON DELETE CASCADE)
- `status` (VARCHAR(50), NOT NULL)
- `risk_score` (INT, DEFAULT 0)
- `risk_level` (VARCHAR(50))
- `execution_time_ms` (BIGINT)
- `raw_model_response` (LONGTEXT)
- `created_at` (TIMESTAMP)

### 11. `ai_findings`
Discrete compliance issues detected during analysis.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `analysis_result_id` (BIGINT, FK -> analysis_results.id, ON DELETE CASCADE)
- `category` (VARCHAR(100), NOT NULL)
- `issue` (VARCHAR(255), NOT NULL)
- `severity` (ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), NOT NULL)
- `evidence_status` (ENUM('CONTRADICTED', 'UNSUPPORTED', 'REQUIRES_VERIFICATION', 'COMPLIANT'), NOT NULL)
- `explanation` (TEXT, NOT NULL)
- `original_excerpt` (TEXT)
- `evidence_id` (BIGINT, FK -> brand_facts.id, NULLABLE)
- `evidence_text` (TEXT)
- `source_name` (VARCHAR(255))
- `source_version` (INT)
- `suggested_correction` (TEXT)
- `confidence` (DOUBLE, DEFAULT 1.0)
- `is_dismissed` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)

### 12. `approval_decisions`
Audit trail of human reviewer actions on specific content versions.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `submission_id` (BIGINT, FK -> content_submissions.id, ON DELETE CASCADE)
- `content_version_id` (BIGINT, FK -> content_versions.id)
- `reviewer_id` (BIGINT, FK -> users.id)
- `decision` (ENUM('APPROVED', 'REJECTED', 'CHANGES_REQUESTED'), NOT NULL)
- `comments` (TEXT)
- `created_at` (TIMESTAMP)

### 13. `audit_logs`
System-wide security and compliance activity stream.
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `organization_id` (BIGINT, FK -> organizations.id, ON DELETE CASCADE)
- `user_id` (BIGINT, FK -> users.id)
- `action` (VARCHAR(100), NOT NULL)
- `entity_type` (VARCHAR(100), NOT NULL)
- `entity_id` (BIGINT)
- `details` (TEXT)
- `ip_address` (VARCHAR(50))
- `created_at` (TIMESTAMP)
