import re
from typing import List, Tuple
from models.schemas import BrandRuleInput, BrandFactInput, Finding

class RuleEngine:
    """
    Deterministic rule-based brand verification engine.
    Detects banned terms, discount violations, warranty conflicts,
    and missing disclaimers with 100% explainability.
    """

    @staticmethod
    def evaluate(
        text: str,
        rules: List[BrandRuleInput],
        facts: List[BrandFactInput]
    ) -> List[Finding]:
        findings: List[Finding] = []
        lower_text = text.lower()

        # 1. Check Banned and Restricted Terms
        for rule in rules:
            if rule.rule_type in ["BANNED_TERM", "RESTRICTED_TERM"]:
                term = rule.term_or_phrase.strip()
                if not term:
                    continue
                
                # Use regex with word boundary if alphanumeric
                escaped_term = re.escape(term.lower())
                pattern = rf"(?:\b|_){escaped_term}(?:\b|_)"
                
                match = re.search(pattern, lower_text)
                if match:
                    start, end = match.span()
                    # Context excerpt
                    excerpt_start = max(0, start - 20)
                    excerpt_end = min(len(text), end + 20)
                    excerpt = text[excerpt_start:excerpt_end].strip()

                    findings.append(Finding(
                        category="TERMINOLOGY",
                        issue=f"Banned or restricted terminology detected: '{term}'",
                        severity=rule.severity.upper() if rule.severity else "HIGH",
                        evidence_status="CONTRADICTED",
                        explanation=rule.explanation or f"The term '{term}' is explicitly prohibited by organization brand policies.",
                        excerpt=f"...{excerpt}..." if excerpt_start > 0 or excerpt_end < len(text) else excerpt,
                        suggested_correction=f"Replace with '{rule.preferred_replacement}'" if rule.preferred_replacement else f"Remove or rephrase '{term}'",
                        confidence=1.0
                    ))

        # 2. Check Discount Limits
        # Look for discount rules
        discount_rules = [r for r in rules if r.rule_type == "DISCOUNT_LIMIT" and r.threshold_value is not None]
        # Also check facts for maximum seasonal discount
        max_discount_allowed = None
        discount_fact_id = None
        discount_fact_text = None
        discount_source = None
        discount_version = None

        if discount_rules:
            max_discount_allowed = min(r.threshold_value for r in discount_rules)
        else:
            # Check facts
            for fact in facts:
                if fact.category.upper() in ["DISCOUNTS", "PRICING", "OFFERS"]:
                    m = re.search(r"(\d+(?:\.\d+)?)\s*%", fact.approved_statement)
                    if m and "maximum" in fact.approved_statement.lower():
                        max_discount_allowed = float(m.group(1))
                        discount_fact_id = fact.id
                        discount_fact_text = fact.approved_statement
                        discount_source = fact.source
                        discount_version = fact.version
                        break

        if max_discount_allowed is not None:
            # Extract discounts from submitted text: "40%", "40 % off", "40 percent"
            discount_matches = re.finditer(r"(\d+(?:\.\d+)?)\s*(?:%|\s*percent)(?:\s*(?:off|discount|saving))?", lower_text)
            for dm in discount_matches:
                val = float(dm.group(1))
                if val > max_discount_allowed:
                    start, end = dm.span()
                    excerpt_start = max(0, start - 20)
                    excerpt_end = min(len(text), end + 20)
                    excerpt = text[excerpt_start:excerpt_end].strip()

                    findings.append(Finding(
                        category="DISCOUNTS",
                        issue=f"Advertised discount ({val:.0f}%) exceeds approved maximum ({max_discount_allowed:.0f}%)",
                        severity="CRITICAL",
                        evidence_status="CONTRADICTED",
                        explanation=f"Content advertises a {val:.0f}% discount, which directly contradicts approved policy capping seasonal discounts at {max_discount_allowed:.0f}%.",
                        excerpt=f"...{excerpt}..." if excerpt_start > 0 or excerpt_end < len(text) else excerpt,
                        evidence_id=discount_fact_id,
                        evidence_text=discount_fact_text or f"Maximum seasonal discount is {max_discount_allowed:.0f}%.",
                        source_name=discount_source or "Brand Pricing Policy",
                        source_version=discount_version or "v1.0",
                        suggested_correction=f"Revise to: 'Get up to {max_discount_allowed:.0f}% off on selected products.'",
                        confidence=0.98
                    ))

        # 3. Check Warranty Duration Claims
        warranty_rules = [r for r in rules if r.rule_type == "WARRANTY_LIMIT" and r.threshold_value is not None]
        max_general_warranty = 2.0  # default standard warranty
        standard_warranty_fact = None

        for fact in facts:
            if fact.category.upper() == "WARRANTY":
                m = re.search(r"(\d+)\s*(?:year|yr)", fact.approved_statement.lower())
                if m:
                    if "standard" in fact.approved_statement.lower() or "all" in fact.approved_statement.lower():
                        max_general_warranty = float(m.group(1))
                        standard_warranty_fact = fact
                        break

        # Check for broad/unlimited warranty phrases: "5-year warranty on everything", "warranty on all", "unlimited warranty"
        unlimited_match = re.search(r"(?:unlimited|lifetime)\s+warranty", lower_text)
        if unlimited_match:
            start, end = unlimited_match.span()
            excerpt = text[max(0, start - 20):min(len(text), end + 20)].strip()
            findings.append(Finding(
                category="WARRANTY",
                issue="Claim of 'unlimited/lifetime warranty' contradicts approved warranty terms",
                severity="CRITICAL",
                evidence_status="CONTRADICTED",
                explanation="Brand policies strictly provide fixed duration warranties. Unlimited warranty claims are illegal and unapproved.",
                excerpt=excerpt,
                evidence_id=standard_warranty_fact.id if standard_warranty_fact else None,
                evidence_text=standard_warranty_fact.approved_statement if standard_warranty_fact else "Standard warranty is 2 years.",
                source_name=standard_warranty_fact.source if standard_warranty_fact else "Warranty Guidelines",
                source_version=standard_warranty_fact.version if standard_warranty_fact else "v1.0",
                suggested_correction="Specify the exact warranty: 'Standard 2-year warranty applies.'",
                confidence=0.99
            ))

        warranty_matches = re.finditer(r"(\d+)\s*(?:-| )?(?:years?|yr|yrs)(?:\s+warranty|\s+guarantee)?(?:\s+(?:on|for)\s+([a-zA-Z0-9 ]+))?", lower_text)
        for wm in warranty_matches:
            claimed_years = float(wm.group(1))
            scope = wm.group(2) or ""
            
            # If claimed > standard warranty and scope is "everything" or "all products"
            if claimed_years > max_general_warranty and any(w in scope for w in ["everything", "all", "every", "all products", "any"]):
                start, end = wm.span()
                excerpt = text[max(0, start - 20):min(len(text), end + 20)].strip()
                findings.append(Finding(
                    category="WARRANTY",
                    issue=f"General {claimed_years:.0f}-year warranty on all products exceeds standard {max_general_warranty:.0f}-year coverage",
                    severity="HIGH",
                    evidence_status="CONTRADICTED",
                    explanation=f"Standard warranty across all appliances is {max_general_warranty:.0f} years. Extended 5-year warranty applies exclusively to specific components (e.g. Model X compressor).",
                    excerpt=excerpt,
                    evidence_id=standard_warranty_fact.id if standard_warranty_fact else None,
                    evidence_text=standard_warranty_fact.approved_statement if standard_warranty_fact else f"Standard warranty is {max_general_warranty:.0f} years.",
                    source_name=standard_warranty_fact.source if standard_warranty_fact else "Warranty Spec Sheet",
                    source_version=standard_warranty_fact.version if standard_warranty_fact else "v1.0",
                    suggested_correction=f"Clarify scope: '2-year standard warranty on all appliances, with up to 5 years on Model X compressor.'",
                    confidence=0.97
                ))

        # 4. Check Required Disclaimers
        for rule in rules:
            if rule.rule_type == "REQUIRED_PHRASE":
                phrase = rule.term_or_phrase.strip()
                if phrase and phrase.lower() not in lower_text:
                    findings.append(Finding(
                        category="REQUIRED_DISCLAIMER",
                        issue=f"Missing mandatory disclaimer / required statement: '{phrase}'",
                        severity=rule.severity.upper() if rule.severity else "MEDIUM",
                        evidence_status="REQUIRES_VERIFICATION",
                        explanation=rule.explanation or f"Brand guidelines mandate the inclusion of '{phrase}' in published promotional material.",
                        suggested_correction=f"Add mandatory disclaimer: '{phrase}'",
                        confidence=0.95
                    ))

        return findings
