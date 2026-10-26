from typing import List, Optional
from pydantic import BaseModel, Field

class BrandFactInput(BaseModel):
    id: Optional[int] = None
    category: str
    fact_title: str
    approved_statement: str
    source: Optional[str] = None
    version: Optional[str] = "v1.0"

class BrandRuleInput(BaseModel):
    id: Optional[int] = None
    rule_type: str  # BANNED_TERM, REQUIRED_PHRASE, RESTRICTED_TERM, DISCOUNT_LIMIT, WARRANTY_LIMIT
    term_or_phrase: str
    preferred_replacement: Optional[str] = None
    explanation: Optional[str] = None
    threshold_value: Optional[float] = None
    severity: str = "HIGH"

class BrandProfileInput(BaseModel):
    brand_name: str
    voice_tone: Optional[str] = "Professional and Friendly"
    mission: Optional[str] = None
    tone_guidelines: Optional[str] = None

class AnalysisRequest(BaseModel):
    submission_id: Optional[int] = None
    version_id: Optional[int] = None
    organization_id: int
    submitted_text: str
    content_type: str = "SOCIAL_MEDIA"
    marketing_channel: str = "INSTAGRAM"
    brand_profile: Optional[BrandProfileInput] = None
    approved_facts: List[BrandFactInput] = Field(default_factory=list)
    brand_rules: List[BrandRuleInput] = Field(default_factory=list)
    guidelines_text: Optional[str] = None

class Finding(BaseModel):
    category: str
    issue: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    evidence_status: str  # CONTRADICTED, UNSUPPORTED, COMPLIANT, REQUIRES_VERIFICATION
    explanation: str
    excerpt: Optional[str] = None
    evidence_id: Optional[int] = None
    evidence_text: Optional[str] = None
    source_name: Optional[str] = None
    source_version: Optional[str] = None
    suggested_correction: Optional[str] = None
    confidence: float = 0.95

class AnalysisResponse(BaseModel):
    status: str = "COMPLETED"
    findings: List[Finding] = Field(default_factory=list)
    risk_score: int = 0
    risk_level: str = "LOW"
    summary: str = ""
    rule_based_count: int = 0
    ai_based_count: int = 0
    execution_time_ms: int = 0

class PdfExtractionResponse(BaseModel):
    filename: str
    page_count: int
    extracted_text: str
    char_count: int
