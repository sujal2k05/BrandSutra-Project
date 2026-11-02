import pytest
from models.schemas import (
    SelfHealingAIRequest,
    AdversarialAIRequest,
    DriftValidationRequest,
    BrandFactInput,
    BrandRuleInput,
    BrandProfileInput
)
from services.self_healing_service import SelfHealingService
from services.adversarial_service import AdversarialPRSimulatorService
from services.report_generator import AdversarialReportPdfGenerator
import os
from services.drift_validator import DriftValidatorService
from config import settings

@pytest.fixture(autouse=True)
def disable_external_api_in_tests(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")

@pytest.fixture
def sample_brand_dna():
    profile = BrandProfileInput(
        brand_name="NovaHome Appliances",
        voice_tone="Professional and Friendly"
    )
    facts = [
        BrandFactInput(id=1, category="WARRANTY", fact_title="Standard Warranty", approved_statement="Standard warranty is 2 years on all appliances."),
        BrandFactInput(id=2, category="WARRANTY", fact_title="Model X Compressor", approved_statement="Model X compressor warranty is 5 years."),
        BrandFactInput(id=3, category="DISCOUNTS", fact_title="Max Discount", approved_statement="Maximum seasonal discount is 25% on selected categories.")
    ]
    rules = [
        BrandRuleInput(id=10, rule_type="BANNED_TERM", term_or_phrase="100% perfect", preferred_replacement="engineered for excellence", severity="CRITICAL"),
        BrandRuleInput(id=11, rule_type="BANNED_TERM", term_or_phrase="Unlimited warranty", preferred_replacement="standard 2-year warranty", severity="CRITICAL")
    ]
    return profile, facts, rules

def test_self_healing_studio_remedies_violations(sample_brand_dna):
    profile, facts, rules = sample_brand_dna
    # Intentionally violating text from user specification:
    violating_text = "Enjoy a 5-year warranty on every NovaHome product and flat 40% off sitewide, always! Our products are 100% perfect!"
    
    req = SelfHealingAIRequest(
        content_text=violating_text,
        max_iterations=3,
        brand_profile=profile,
        approved_facts=facts,
        brand_rules=rules
    )

    res = SelfHealingService.execute_self_healing(req)

    assert res.status == "COMPLETED"
    assert res.initial_risk_score > 40
    # Healed text should resolve the 40% discount and 100% perfect
    assert "40%" not in res.healed_text
    assert "100% perfect" not in res.healed_text.lower()
    # It must contain approved limits
    assert "25%" in res.healed_text or "2-year" in res.healed_text or "standard" in res.healed_text.lower()
    assert res.final_risk_score < res.initial_risk_score
    assert len(res.steps) >= 4  # At least 1 full cycle of 4 agents

def test_adversarial_simulator_generates_3_perspectives(sample_brand_dna):
    profile, facts, rules = sample_brand_dna
    violating_text = "Enjoy a 5-year warranty on every NovaHome product and flat 40% off sitewide, always!"
    
    req = AdversarialAIRequest(
        content_text=violating_text,
        campaign_name="Holiday Blitz",
        brand_profile=profile,
        approved_facts=facts,
        brand_rules=rules
    )

    res = AdversarialPRSimulatorService.simulate(req)

    assert res.overall_risk_score > 40
    assert len(res.reports) == 3
    perspectives = [r.agent_perspective for r in res.reports]
    assert "CONSUMER" in perspectives
    assert "COMPLIANCE" in perspectives
    assert "REPUTATION" in perspectives

    # Test PDF generation
    pdf_bytes = AdversarialReportPdfGenerator.generate_pdf(
        sim_data=res,
        content_text=violating_text,
        campaign_name="Holiday Blitz",
        org_name="NovaHome Appliances"
    )
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

def test_drift_sentinel_detects_content_drift(sample_brand_dna):
    profile, facts, rules = sample_brand_dna
    baseline = "Get up to 25% off on selected NovaHome appliances with standard 2-year warranty."
    drifted = "Get up to 40% off on all NovaHome appliances with 5-year warranty on everything!"

    req = DriftValidationRequest(
        baseline_text=baseline,
        current_text=drifted,
        brand_profile=profile,
        approved_facts=facts,
        brand_rules=rules
    )

    res = DriftValidatorService.validate_drift(req)

    assert res.has_drift is True
    assert res.drift_type in ["WARRANTY_MISMATCH", "DISCOUNT_MISMATCH", "CRITICAL_DRIFT"]
    assert res.risk_score > 20
    assert res.findings_count > 0

def test_drift_sentinel_detects_no_drift(sample_brand_dna):
    profile, facts, rules = sample_brand_dna
    baseline = "Get up to 25% off on selected NovaHome appliances."
    current = "Get up to 25% off on selected NovaHome appliances."

    req = DriftValidationRequest(
        baseline_text=baseline,
        current_text=current,
        brand_profile=profile,
        approved_facts=facts,
        brand_rules=rules
    )

    res = DriftValidatorService.validate_drift(req)
    assert res.has_drift is False
    assert res.drift_type == "NO_CHANGE"
