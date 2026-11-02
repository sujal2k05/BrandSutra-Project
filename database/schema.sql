-- BrandSutra Database Schema
-- Database: brandsutra_db

CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CONTENT_CREATOR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS organization_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_org VARCHAR(50) NOT NULL DEFAULT 'CONTENT_CREATOR',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_org_user (organization_id, user_id),
    CONSTRAINT fk_member_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNIQUE NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    mission TEXT,
    values_statement TEXT,
    target_audience TEXT,
    voice_tone VARCHAR(100) DEFAULT 'Professional',
    tone_guidelines TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_facts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    fact_title VARCHAR(255) NOT NULL,
    approved_statement TEXT NOT NULL,
    source VARCHAR(255),
    version VARCHAR(50) DEFAULT 'v1.0',
    effective_date DATE,
    expiration_date DATE,
    status VARCHAR(50) DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facts_org_cat (organization_id, category),
    CONSTRAINT fk_facts_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    term_or_phrase VARCHAR(255) NOT NULL,
    preferred_replacement VARCHAR(255),
    explanation TEXT,
    threshold_value DOUBLE,
    severity VARCHAR(50) DEFAULT 'HIGH',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rules_org (organization_id),
    CONSTRAINT fk_rules_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_guidelines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_text LONGTEXT NOT NULL,
    original_filename VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT,
    is_approved BOOLEAN DEFAULT TRUE,
    version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_guidelines_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    creator_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    campaign_name VARCHAR(255),
    content_type VARCHAR(50) NOT NULL,
    marketing_channel VARCHAR(50) NOT NULL,
    description TEXT,
    overall_status VARCHAR(50) DEFAULT 'DRAFT',
    current_version_id BIGINT NULL,
    publication_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sub_org (organization_id),
    INDEX idx_sub_status (overall_status),
    CONSTRAINT fk_sub_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    content_text LONGTEXT NOT NULL,
    created_by BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    risk_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ver_sub (submission_id),
    CONSTRAINT fk_ver_sub FOREIGN KEY (submission_id) REFERENCES content_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ver_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    total_findings INT DEFAULT 0,
    low_count INT DEFAULT 0,
    medium_count INT DEFAULT 0,
    high_count INT DEFAULT 0,
    critical_count INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    status VARCHAR(50) DEFAULT 'COMPLETED',
    analysis_summary TEXT,
    execution_time_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_ver FOREIGN KEY (version_id) REFERENCES content_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_findings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    issue VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    evidence_status VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL,
    excerpt TEXT,
    evidence_id BIGINT NULL,
    evidence_text TEXT,
    source_name VARCHAR(255),
    source_version VARCHAR(50),
    suggested_correction TEXT,
    confidence DOUBLE DEFAULT 0.95,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_finding_ver (version_id),
    CONSTRAINT fk_finding_analysis FOREIGN KEY (analysis_id) REFERENCES analysis_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_finding_ver FOREIGN KEY (version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_finding_evidence FOREIGN KEY (evidence_id) REFERENCES brand_facts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_decisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    decision VARCHAR(50) NOT NULL,
    comments TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_sub FOREIGN KEY (submission_id) REFERENCES content_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_ver FOREIGN KEY (version_id) REFERENCES content_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NULL,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_org (organization_id),
    CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Round 3 Improvements: Feature 1 - Agentic Self-Healing Content Studio
CREATE TABLE IF NOT EXISTS self_healing_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    submission_id BIGINT NULL,
    source_version_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    original_text LONGTEXT NOT NULL,
    healed_text LONGTEXT,
    iterations_count INT DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    initial_risk_score INT DEFAULT 0,
    final_risk_score INT DEFAULT 0,
    final_risk_level VARCHAR(50) DEFAULT 'LOW',
    resolved_violations_count INT DEFAULT 0,
    remaining_violations_count INT DEFAULT 0,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sh_org (organization_id),
    INDEX idx_sh_sub (submission_id),
    CONSTRAINT fk_sh_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_sh_sub FOREIGN KEY (submission_id) REFERENCES content_submissions(id) ON DELETE SET NULL,
    CONSTRAINT fk_sh_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS self_healing_agent_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    iteration_number INT NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    input_snippet TEXT,
    output_text LONGTEXT,
    findings_json LONGTEXT,
    explanation TEXT,
    execution_time_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sh_steps_session (session_id),
    CONSTRAINT fk_sh_step_session FOREIGN KEY (session_id) REFERENCES self_healing_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Round 3 Improvements: Feature 2 - Adversarial PR Simulator
CREATE TABLE IF NOT EXISTS adversarial_simulations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    submission_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    content_text LONGTEXT NOT NULL,
    campaign_name VARCHAR(255),
    overall_risk_score INT DEFAULT 0,
    consumer_risk_score INT DEFAULT 0,
    compliance_risk_score INT DEFAULT 0,
    reputation_risk_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    executive_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_adv_org (organization_id),
    INDEX idx_adv_sub (submission_id),
    CONSTRAINT fk_adv_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_adv_sub FOREIGN KEY (submission_id) REFERENCES content_submissions(id) ON DELETE SET NULL,
    CONSTRAINT fk_adv_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS adversarial_agent_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    simulation_id BIGINT NOT NULL,
    agent_perspective VARCHAR(100) NOT NULL,
    risk_score INT DEFAULT 0,
    perspective_summary TEXT,
    findings_json LONGTEXT,
    recommendations_json LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_adv_rep_sim (simulation_id),
    CONSTRAINT fk_adv_rep_sim FOREIGN KEY (simulation_id) REFERENCES adversarial_simulations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Round 3 Improvements: Feature 3 - Live Brand Drift Sentinel
CREATE TABLE IF NOT EXISTS monitored_sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC_URL',
    url VARCHAR(1024),
    check_frequency VARCHAR(50) DEFAULT 'HOURLY',
    is_active BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMP NULL,
    last_status VARCHAR(50) DEFAULT 'PENDING',
    current_hash VARCHAR(64),
    current_snapshot LONGTEXT,
    baseline_snapshot LONGTEXT,
    last_risk_score INT DEFAULT 0,
    last_drift_type VARCHAR(50) DEFAULT 'NO_CHANGE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mon_org (organization_id),
    CONSTRAINT fk_mon_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_mon_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drift_check_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_hash VARCHAR(64),
    new_hash VARCHAR(64),
    has_drift BOOLEAN DEFAULT FALSE,
    drift_type VARCHAR(50) DEFAULT 'NO_CHANGE',
    risk_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    findings_count INT DEFAULT 0,
    details TEXT,
    snapshot_excerpt TEXT,
    INDEX idx_drift_source (source_id),
    CONSTRAINT fk_drift_source FOREIGN KEY (source_id) REFERENCES monitored_sources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drift_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    source_id BIGINT NOT NULL,
    history_id BIGINT NULL,
    alert_title VARCHAR(255) NOT NULL,
    drift_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    risk_score INT DEFAULT 0,
    explanation TEXT,
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_org (organization_id),
    INDEX idx_alert_reviewed (is_reviewed),
    CONSTRAINT fk_alert_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_source FOREIGN KEY (source_id) REFERENCES monitored_sources(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_history FOREIGN KEY (history_id) REFERENCES drift_check_history(id) ON DELETE SET NULL,
    CONSTRAINT fk_alert_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
