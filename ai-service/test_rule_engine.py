import pytest
from models.schemas import BrandRuleInput, BrandFactInput, AnalysisRequest
from services.rule_engine import RuleEngine

def test_banned_term_detection():
    rules = [
        BrandRuleInput(
            rule_type="BANNED_TERM",
            term_or_phrase="100% perfect",
            preferred_replacement="Engineered for excellence",
            explanation="Unsubstantiated perfection claims are deceptive.",
            severity="CRITICAL"
        )
    ]
    facts = []
    text = "Our home appliances are 100% perfect for your kitchen!"
    findings = RuleEngine.evaluate(text, rules, facts)
    
    assert len(findings) == 1
    assert findings[0].category == "TERMINOLOGY"
    assert findings[0].severity == "CRITICAL"
    assert "100% perfect" in findings[0].issue

def test_discount_threshold_detection():
    rules = [
        BrandRuleInput(
            rule_type="DISCOUNT_LIMIT",
            term_or_phrase="Discount Cap",
            threshold_value=25.0,
            severity="CRITICAL"
        )
    ]
    facts = [
        BrandFactInput(
            id=3,
            category="DISCOUNTS",
            fact_title="Max Discount",
            approved_statement="Maximum seasonal discount is 25%."
        )
    ]
    text = "Get 40% OFF on all NovaHome products this festive season!"
    findings = RuleEngine.evaluate(text, rules, facts)

    assert any(f.category == "DISCOUNTS" and f.severity == "CRITICAL" for f in findings)
    discount_finding = next(f for f in findings if f.category == "DISCOUNTS")
    assert "40%" in discount_finding.issue
    assert "25%" in discount_finding.issue

def test_warranty_exceeded_detection():
    rules = [
        BrandRuleInput(
            rule_type="WARRANTY_LIMIT",
            term_or_phrase="Warranty Limit",
            threshold_value=5.0,
            severity="HIGH"
        )
    ]
    facts = [
        BrandFactInput(
            id=1,
            category="WARRANTY",
            fact_title="Standard Warranty",
            approved_statement="Standard warranty is 2 years on all appliances."
        )
    ]
    text = "Enjoy a 5-year warranty on everything you purchase."
    findings = RuleEngine.evaluate(text, rules, facts)

    assert any(f.category == "WARRANTY" for f in findings)
