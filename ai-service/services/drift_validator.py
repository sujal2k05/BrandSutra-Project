import re
import difflib
import logging
from typing import List, Tuple
from models.schemas import (
    DriftValidationRequest,
    DriftValidationResponse,
    Finding
)
from services.rule_engine import RuleEngine

logger = logging.getLogger("brandsutra.drift")

class DriftValidatorService:
    """
    Live Brand Drift Validator:
    Compares published content snapshot with baseline approved content,
    evaluates changes against Brand DNA, and classifies the drift type.
    """

    @classmethod
    def validate_drift(cls, request: DriftValidationRequest) -> DriftValidationResponse:
        baseline_raw = request.baseline_text or ""
        current_raw = request.current_text or ""

        # 1. Normalization
        norm_baseline = cls.normalize_text(baseline_raw)
        norm_current = cls.normalize_text(current_raw)

        # 2. Check identical
        if norm_baseline == norm_current:
            if baseline_raw.strip() != current_raw.strip():
                return DriftValidationResponse(
                    has_drift=False,
                    drift_type="FORMATTING_ONLY",
                    risk_score=0,
                    risk_level="LOW",
                    findings_count=0,
                    details="Minor formatting/whitespace differences detected. Core brand messaging is intact.",
                    findings=[]
                )
            return DriftValidationResponse(
                has_drift=False,
                drift_type="NO_CHANGE",
                risk_score=0,
                risk_level="LOW",
                findings_count=0,
                details="Content fingerprint matches baseline approved snapshot exactly. No drift detected.",
                findings=[]
            )

        # 3. Content has drifted! Revalidate current content against Brand DNA
        findings = RuleEngine.evaluate(
            text=current_raw,
            rules=request.brand_rules,
            facts=request.approved_facts
        )

        # Calculate risk score for drifted content
        risk_score = 0
        has_critical = False
        has_warranty_issue = False
        has_discount_issue = False
        has_banned_term = False

        for f in findings:
            sev = f.severity.upper()
            if sev == "CRITICAL":
                risk_score += 40
                has_critical = True
            elif sev == "HIGH":
                risk_score += 25
            elif sev == "MEDIUM":
                risk_score += 15
            else:
                risk_score += 5

            cat = f.category.upper()
            if "WARRANTY" in cat:
                has_warranty_issue = True
            if "DISCOUNT" in cat or "PRICING" in cat:
                has_discount_issue = True
            if "TERMINOLOGY" in cat:
                has_banned_term = True

        risk_score = min(100, risk_score)
        risk_level = "LOW" if risk_score <= 20 else ("MEDIUM" if risk_score <= 40 else ("HIGH" if risk_score <= 70 else "CRITICAL"))

        # 4. Classify Drift Type
        if has_banned_term or (has_critical and risk_score >= 70):
            drift_type = "CRITICAL_DRIFT"
            details = f"Critical brand drift detected! Prohibited terminology or severe compliance conflicts identified in live published content."
        elif has_warranty_issue:
            drift_type = "WARRANTY_MISMATCH"
            details = f"Warranty policy drift detected! Live content advertises warranty coverage contradicting approved terms."
        elif has_discount_issue:
            drift_type = "DISCOUNT_MISMATCH"
            details = f"Promotional pricing drift detected! Discount or pricing claims conflict with approved Brand DNA caps."
        elif len(findings) > 0 and risk_score > 20:
            drift_type = "BRAND_GUIDELINE_VIOLATION"
            details = f"Live content has drifted and violates {len(findings)} brand policy guideline(s)."
        elif len(findings) > 0:
            drift_type = "UNSUPPORTED_CLAIM"
            details = f"Live content contains unverified promotional claims requiring evidence verification."
        else:
            drift_type = "CONTENT_CHANGE_COMPLIANT"
            details = "Published content changed, but remains 100% compliant with approved Brand DNA rules and facts."

        return DriftValidationResponse(
            has_drift=True,
            drift_type=drift_type,
            risk_score=risk_score,
            risk_level=risk_level,
            findings_count=len(findings),
            details=details,
            findings=findings
        )

    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""
        # Strip basic HTML tags
        clean = re.sub(r"<[^>]+>", " ", text)
        # Normalize whitespace
        clean = re.sub(r"\s+", " ", clean).strip().lower()
        return clean

