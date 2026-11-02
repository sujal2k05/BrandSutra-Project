import os
import re
import json
import logging
from typing import List, Dict, Any, Tuple
from models.schemas import (
    AdversarialAIRequest,
    AdversarialAIResponse,
    AdversarialReportItem
)
from config import settings

logger = logging.getLogger("brandsutra.adversarial")

class AdversarialPRSimulatorService:
    """
    Adversarial PR Simulator: Evaluates marketing campaigns from 3 critical stakeholder angles:
    1. Consumer Perspective Agent
    2. Legal & Advertising Compliance Risk Agent
    3. Brand Reputation Agent
    Calculates explainable 0-100 risk score with actionable findings and recommendations.
    """

    @classmethod
    def simulate(cls, request: AdversarialAIRequest) -> AdversarialAIResponse:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

        # Try Gemini multi-perspective evaluation first
        if api_key:
            try:
                ai_response = cls._run_gemini_simulation(request, api_key)
                if ai_response:
                    return ai_response
            except Exception as e:
                logger.warning(f"Gemini Adversarial Simulation failed: {e}. Utilizing deterministic adversarial heuristics.")

        # Deterministic Adversarial Heuristic Engine (100% Offline / Zero-Cost Fallback)
        return cls._run_deterministic_simulation(request)

    @classmethod
    def _run_gemini_simulation(cls, request: AdversarialAIRequest, api_key: str) -> AdversarialAIResponse:
        from google import genai
        client = genai.Client(api_key=api_key, http_options={"timeout": 10})

        facts_text = "\n".join([f"- {f.category}: {f.approved_statement}" for f in (request.approved_facts or [])])
        rules_text = "\n".join([f"- {r.rule_type}: {r.term_or_phrase}" for r in (request.brand_rules or [])])
        brand_name = request.brand_profile.brand_name if request.brand_profile else "NovaHome"
        tone = request.brand_profile.voice_tone if request.brand_profile else "Professional and Friendly"

        prompt = f"""You are the BrandSutra Adversarial PR Simulator Engine.
Simulate an adversarial, multi-stakeholder audit of the marketing copy before public release.

=== PERSPECTIVES TO AUDIT ===
1. CONSUMER PERSPECTIVE AGENT:
   - Identify confusing phrasing, hidden conditions, misleading offers (e.g. blanket discounts/warranties), and unrealistic expectations that can trigger customer backlash or support complaints.
2. LEGAL & ADVERTISING COMPLIANCE AGENT:
   - Identify deceptive advertising risks, unsupported promotional guarantees, missing mandatory qualifying terms, and claims vulnerable to regulatory action.
   - Note: preliminary risk-screening only, not formal legal advice.
3. BRAND REPUTATION AGENT:
   - Identify overpromising, hyperbole, brand dilution, and negative press or social media boycott angles.

=== APPROVED BRAND DNA ===
Brand: {brand_name} (Voice: {tone})
Approved Facts:
{facts_text}
Brand Rules:
{rules_text}

=== SUBMITTED MARKETING CONTENT ===
\"\"\"{request.content_text}\"\"\"

=== REQUIRED OUTPUT JSON FORMAT ===
{{
  "overall_risk_score": 85,
  "consumer_risk_score": 80,
  "compliance_risk_score": 90,
  "reputation_risk_score": 85,
  "risk_level": "CRITICAL",
  "executive_summary": "High exposure to regulatory challenges and consumer complaints due to blanket warranty and unverified discount promises.",
  "reports": [
    {{
      "agent_perspective": "CONSUMER",
      "risk_score": 80,
      "perspective_summary": "Consumers expect 5-year coverage on all products and 40% off sitewide, leading to frustration at checkout.",
      "findings": [
        {{
          "title": "Unqualified Blanket Warranty Expectation",
          "severity": "HIGH",
          "excerpt": "5-year warranty on everything",
          "explanation": "Customers will assume complete replacement coverage on all small appliances.",
          "impact": "Customer churn, chargebacks, negative Google/Trustpilot reviews"
        }}
      ],
      "recommendations": [
        "Explicitly specify that 5-year coverage applies exclusively to Model X compressors.",
        "Add 'Terms & Conditions apply' and clear eligible product lists."
      ]
    }},
    {{
      "agent_perspective": "COMPLIANCE",
      "risk_score": 90,
      "perspective_summary": "Promising a flat 40% discount and unlimited coverage without qualifying terms violates consumer advertising standards.",
      "findings": [
        {{
          "title": "Potentially Deceptive Discount Claim",
          "severity": "CRITICAL",
          "excerpt": "flat 40% off sitewide, always!",
          "explanation": "Contradicts internal policy capping discounts at 25%. Deceptive under consumer protection acts.",
          "impact": "Regulatory fines, mandatory advertising withdrawal"
        }}
      ],
      "recommendations": [
        "Include qualifying disclaimers and expiration dates.",
        "Align discount percentage to maximum approved 25% cap."
      ]
    }},
    {{
      "agent_perspective": "REPUTATION",
      "risk_score": 85,
      "perspective_summary": "Hyperbolic language undermines Brand trust and opens the company to competitor attacks.",
      "findings": [
        {{
          "title": "Exaggerated Marketing Absolute",
          "severity": "HIGH",
          "excerpt": "100% perfect",
          "explanation": "Absolute perfection claims invite viral consumer debunking videos.",
          "impact": "Reputational cynicism and loss of credibility with savvy homeowners"
        }}
      ],
      "recommendations": [
        "Shift messaging from '100% perfect' to verified reliability statistics.",
        "Highlight actual energy efficiency lab certifications."
      ]
    }}
  ]
}}
"""
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json", "temperature": 0.2}
        )
        data = json.loads(response.text.strip())

        report_items = []
        for rep in data.get("reports", []):
            report_items.append(AdversarialReportItem(
                agent_perspective=rep.get("agent_perspective", "CONSUMER").upper(),
                risk_score=rep.get("risk_score", 50),
                perspective_summary=rep.get("perspective_summary", ""),
                findings_json=json.dumps(rep.get("findings", [])),
                recommendations_json=json.dumps(rep.get("recommendations", []))
            ))

        return AdversarialAIResponse(
            overall_risk_score=data.get("overall_risk_score", 50),
            consumer_risk_score=data.get("consumer_risk_score", 50),
            compliance_risk_score=data.get("compliance_risk_score", 50),
            reputation_risk_score=data.get("reputation_risk_score", 50),
            risk_level=data.get("risk_level", "MEDIUM"),
            executive_summary=data.get("executive_summary", "Adversarial PR simulation complete."),
            reports=report_items
        )

    # -------------------------------------------------------------------------
    # DETERMINISTIC ADVERSARIAL HEURISTIC ENGINE (100% Offline / ₹0 Cost)
    # -------------------------------------------------------------------------
    @classmethod
    def _run_deterministic_simulation(cls, request: AdversarialAIRequest) -> AdversarialAIResponse:
        text = request.content_text
        lower = text.lower()

        consumer_findings = []
        consumer_recs = []
        consumer_score = 10

        compliance_findings = []
        compliance_recs = []
        compliance_score = 10

        reputation_findings = []
        reputation_recs = []
        reputation_score = 10

        # Check warranty ambiguities
        if re.search(r"(\d+)\s*(?:-| )?year\s+warranty.*(?:all|everything|every)", lower):
            consumer_findings.append({
                "title": "Blanket Warranty Coverage Ambiguity",
                "severity": "HIGH",
                "excerpt": re.search(r"(\d+\s*(?:-| )?year\s+warranty[^\.,;]*)", text, re.IGNORECASE).group(0) if re.search(r"(\d+\s*(?:-| )?year\s+warranty[^\.,;]*)", text, re.IGNORECASE) else "warranty claim",
                "explanation": "Consumers will expect total multi-year replacement across all categories without limitation, resulting in customer service disputes.",
                "impact": "Customer dissatisfaction, negative ratings, social media complaints"
            })
            consumer_recs.append("Explicitly state that extended warranty applies strictly to designated components (e.g. Model X compressor).")
            consumer_score += 35

            compliance_findings.append({
                "title": "Unsupported Product Warranty Promise",
                "severity": "HIGH",
                "excerpt": "Warranty coverage on all products",
                "explanation": "Stating coverage without disclosing the standard 2-year general limit violates fair advertising standards.",
                "impact": "Potential consumer protection notices and deceptive trade challenge"
            })
            compliance_recs.append("Insert clear disclaimer: 'Terms apply. Standard warranty is 2 years.'")
            compliance_score += 35

        # Check discount claims
        discount_match = re.search(r"(\d+)\s*%", lower)
        if discount_match and float(discount_match.group(1)) > 25:
            val = discount_match.group(1)
            consumer_findings.append({
                "title": "Unrealistic Discount Perception",
                "severity": "HIGH",
                "excerpt": f"{val}% off",
                "explanation": f"Shoppers navigating to the store will find selected exclusions, triggering bait-and-switch accusations.",
                "impact": "Cart abandonment, lost repeat customers"
            })
            consumer_recs.append(f"Clarify discount scope: 'Up to 25% off on selected seasonal appliances.'")
            consumer_score += 35

            compliance_findings.append({
                "title": "Misleading High-Percentage Discount Claim",
                "severity": "CRITICAL",
                "excerpt": f"flat {val}% off sitewide",
                "explanation": "Advertising discounts exceeding approved thresholds without clear qualifying dates or exclusions constitutes misleading pricing.",
                "impact": "Advertising standards council investigations and mandatory retraction"
            })
            compliance_recs.append("Ensure advertised discount percentage does not exceed authorized pricing caps.")
            compliance_score += 45

        # Check absolute or perpetual claims
        if re.search(r"\b(always|forever|unlimited|100%\s*perfect|guaranteed)\b", lower):
            match_word = re.search(r"\b(always|forever|unlimited|100%\s*perfect|guaranteed)\b", text, re.IGNORECASE).group(0)
            reputation_findings.append({
                "title": "Perpetual or Absolute Brand Promise",
                "severity": "HIGH",
                "excerpt": match_word,
                "explanation": f"Using absolute promises ('{match_word}') erodes credibility among discerning buyers and attracts competitor scrutiny.",
                "impact": "Reputational cynicism and viral debunking"
            })
            reputation_recs.append("Replace absolute claims with measurable, verified engineering achievements.")
            reputation_score += 40

            compliance_findings.append({
                "title": "Unsubstantiated Performance Guarantee",
                "severity": "MEDIUM",
                "excerpt": match_word,
                "explanation": "Guarantees without verifiable clinical/lab documentation trigger regulatory inquiry.",
                "impact": "Advertising compliance scrutiny"
            })
            compliance_recs.append("Remove unprovable absolutes from consumer-facing channels.")
            compliance_score += 20

        # Reputation voice check
        if re.search(r"!{2,}|\b(insane|unbelievable|crazy)\b", lower):
            reputation_findings.append({
                "title": "Low-Trust Hyperbolic Tone",
                "severity": "MEDIUM",
                "excerpt": "Hype-driven punctuation/vocabulary",
                "explanation": "Cheapens premium brand positioning and diminishes brand stature.",
                "impact": "Brand dilution, perceived drop in product quality"
            })
            reputation_recs.append("Maintain an authoritative, reassuring, and premium brand voice.")
            reputation_score += 25

        # Calculate final composite scores
        consumer_score = min(100, consumer_score)
        compliance_score = min(100, compliance_score)
        reputation_score = min(100, reputation_score)
        overall_score = int(round(0.35 * consumer_score + 0.35 * compliance_score + 0.30 * reputation_score))

        risk_level = "LOW" if overall_score <= 20 else ("MEDIUM" if overall_score <= 40 else ("HIGH" if overall_score <= 70 else "CRITICAL"))

        exec_summary = (
            f"Adversarial audit identified {len(consumer_findings) + len(compliance_findings) + len(reputation_findings)} "
            f"risk exposure(s). Overall Reputation Risk: {overall_score}/100 ({risk_level}). "
            f"Key vulnerability: conflicting discount claims and blanket warranty wording."
        )

        reports = [
            AdversarialReportItem(
                agent_perspective="CONSUMER",
                risk_score=consumer_score,
                perspective_summary=f"Consumer friction score: {consumer_score}/100. Potential for expectation mismatch regarding terms and discounts.",
                findings_json=json.dumps(consumer_findings),
                recommendations_json=json.dumps(consumer_recs or ["Clarify promotional terms and conditions."])
            ),
            AdversarialReportItem(
                agent_perspective="COMPLIANCE",
                risk_score=compliance_score,
                perspective_summary=f"Compliance exposure score: {compliance_score}/100. Preliminary screening indicates heightened exposure under advertising standards.",
                findings_json=json.dumps(compliance_findings),
                recommendations_json=json.dumps(compliance_recs or ["Add standard promotional disclaimers."])
            ),
            AdversarialReportItem(
                agent_perspective="REPUTATION",
                risk_score=reputation_score,
                perspective_summary=f"Brand reputation risk score: {reputation_score}/100. Hyperbolic phrasing threatens premium brand credibility.",
                findings_json=json.dumps(reputation_findings),
                recommendations_json=json.dumps(reputation_recs or ["Align marketing copy with approved Brand DNA tone guidelines."])
            )
        ]

        return AdversarialAIResponse(
            overall_risk_score=overall_score,
            consumer_risk_score=consumer_score,
            compliance_risk_score=compliance_score,
            reputation_risk_score=reputation_score,
            risk_level=risk_level,
            executive_summary=exec_summary,
            reports=reports
        )
