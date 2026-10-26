import time
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    Finding,
    PdfExtractionResponse
)
from services.rule_engine import RuleEngine
from services.gemini_service import GeminiVerificationService
from services.pdf_extractor import PdfExtractor

app = FastAPI(
    title="BrandSutra AI Content Governance Microservice",
    description="Explainable Rule-Based & Gemini AI Semantic Verification Service",
    version="1.0.0"
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

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BrandSutra AI Content Inspector",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "version": "1.0.0"
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
    # If a rule engine finding already covers the category and similar issue, preserve the rule engine finding
    combined_findings: List[Finding] = list(rule_findings)
    rule_issues = {f.category.lower() + "_" + f.severity.lower() for f in rule_findings}

    for af in ai_findings:
        key = af.category.lower() + "_" + af.severity.lower()
        # Avoid exact duplicate category + severity if already covered
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

    # Build human-readable summary
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

@app.post("/api/extract-pdf", response_model=PdfExtractionResponse)
async def extract_pdf_guideline(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for guideline extraction.")
    
    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit of 15MB.")

    result = PdfExtractor.extract_text(contents, file.filename)
    return PdfExtractionResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.SERVICE_HOST, port=settings.SERVICE_PORT, reload=True)
