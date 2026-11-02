import time
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    Finding,
    PdfExtractionResponse,
    SelfHealingAIRequest,
    SelfHealingAIResponse,
    AdversarialAIRequest,
    AdversarialAIResponse,
    DriftValidationRequest,
    DriftValidationResponse
)
from services.rule_engine import RuleEngine
from services.gemini_service import GeminiVerificationService
from services.pdf_extractor import PdfExtractor
from services.visual_checker import analyze_visual_asset
from services.self_healing_service import SelfHealingService
from services.adversarial_service import AdversarialPRSimulatorService
from services.report_generator import AdversarialReportPdfGenerator
from services.drift_validator import DriftValidatorService

app = FastAPI(
    title="BrandSutra AI Content Governance Microservice",
    description="Explainable Rule-Based & Gemini AI Semantic Verification Service with Visual Brand Checker",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SEVERITY_WEIGHTS = {
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 25,
    "CRITICAL": 40
}

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "BrandSutra AI Content Governance Microservice",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "version": "1.1.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "analyze": "POST /api/analyze",
            "visual_check": "POST /api/analyze-visual",
            "extract_pdf": "POST /api/extract-pdf"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BrandSutra AI Content Inspector",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "visual_checker": "active",
        "version": "1.1.0"
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_content(request: AnalysisRequest):
    start_time = time.time()
    
    # 1. Deterministic Rule-Based Evaluation
    rule_findings: List[Finding] = RuleEngine.evaluate(
        text=request.submitted_text,
        rules=request.brand_rules,
        facts=request.approved_facts
    )

    # 2. Gemini Semantic Verification
    ai_findings: List[Finding] = GeminiVerificationService.analyze(request)

    # 3. Deduplicate and Merge Findings
    combined_findings: List[Finding] = list(rule_findings)
    rule_issues = {f.category.lower() + "_" + f.severity.lower() for f in rule_findings}

    for af in ai_findings:
        key = af.category.lower() + "_" + af.severity.lower()
        if key not in rule_issues:
            combined_findings.append(af)
            rule_issues.add(key)

    # 4. Calculate Explainable Brand Risk Score
    total_score = 0
    for finding in combined_findings:
        sev = finding.severity.upper()
        weight = SEVERITY_WEIGHTS.get(sev, 15)
        total_score += weight

    risk_score = min(100, total_score)
    if risk_score <= 20:
        risk_level = "LOW"
    elif risk_score <= 40:
        risk_level = "MEDIUM"
    elif risk_score <= 70:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    if not combined_findings:
        summary = "No brand governance violations detected. Content complies with approved Brand DNA."
    else:
        summary = f"Detected {len(combined_findings)} brand governance issue(s). Brand Risk Score: {risk_score}/100 ({risk_level})."

    exec_time = int((time.time() - start_time) * 1000)

    return AnalysisResponse(
        status="COMPLETED",
        findings=combined_findings,
        risk_score=risk_score,
        risk_level=risk_level,
        summary=summary,
        rule_based_count=len(rule_findings),
        ai_based_count=len(combined_findings) - len(rule_findings),
        execution_time_ms=exec_time
    )

@app.post("/api/analyze-visual")
async def analyze_visual_endpoint(
    file: UploadFile = File(...),
    marketing_channel: str = Form("INSTAGRAM"),
    primary_color_hex: str = Form("#6366F1"),
    secondary_color_hex: str = Form("#8B5CF6")
):
    """
    Visual Brand Checker: Inspects uploaded creative image against brand color guidelines,
    aspect ratio standards, and safe margins.
    """
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file size exceeds maximum 20MB limit.")

    result = analyze_visual_asset(
        image_bytes=contents,
        marketing_channel=marketing_channel,
        primary_color_hex=primary_color_hex,
        secondary_color_hex=secondary_color_hex,
        filename=file.filename or "creative.png"
    )
    return result

@app.post("/api/extract-pdf", response_model=PdfExtractionResponse)
async def extract_pdf_guideline(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for guideline extraction.")
    
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit of 15MB.")

    result = PdfExtractor.extract_text(contents, file.filename)
    return PdfExtractionResponse(**result)

# =============================================================================
# ROUND 3 IMPROVEMENTS: FEATURE 1 - AGENTIC SELF-HEALING STUDIO
# =============================================================================

@app.post("/api/self-healing/heal", response_model=SelfHealingAIResponse)
def execute_self_healing_endpoint(request: SelfHealingAIRequest):
    """
    Executes the 4-agent self-healing loop:
    1. Detection Agent -> 2. Correction Agent -> 3. Brand Voice Agent -> 4. Compliance Revalidation Agent
    """
    return SelfHealingService.execute_self_healing(request)

# =============================================================================
# ROUND 3 IMPROVEMENTS: FEATURE 2 - ADVERSARIAL PR SIMULATOR
# =============================================================================

@app.post("/api/adversarial/simulate", response_model=AdversarialAIResponse)
def execute_adversarial_simulation_endpoint(request: AdversarialAIRequest):
    """
    Runs multi-stakeholder adversarial simulation (Consumer, Legal/Advertising Compliance, Brand Reputation).
    """
    return AdversarialPRSimulatorService.simulate(request)

@app.post("/api/adversarial/export-pdf")
def export_adversarial_pdf_endpoint(request: AdversarialAIRequest):
    """
    Generates an executive audit PDF report using PyMuPDF at zero cost.
    """
    sim_data = AdversarialPRSimulatorService.simulate(request)
    org_name = request.brand_profile.brand_name if request.brand_profile else "NovaHome Appliances"
    pdf_bytes = AdversarialReportPdfGenerator.generate_pdf(
        sim_data=sim_data,
        content_text=request.content_text,
        campaign_name=request.campaign_name or "Promotional Campaign",
        org_name=org_name
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=BrandSutra_Adversarial_PR_Report.pdf"}
    )

# =============================================================================
# ROUND 3 IMPROVEMENTS: FEATURE 3 - LIVE BRAND DRIFT SENTINEL
# =============================================================================

@app.post("/api/drift/validate", response_model=DriftValidationResponse)
def validate_brand_drift_endpoint(request: DriftValidationRequest):
    """
    Validates published content drift against baseline and classifies risk type.
    """
    return DriftValidatorService.validate_drift(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.SERVICE_HOST, port=settings.SERVICE_PORT, reload=True)
