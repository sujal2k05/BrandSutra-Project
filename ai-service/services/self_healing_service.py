import os
import re
import json
import time
import difflib
import logging
from typing import List, Tuple
from models.schemas import (
    SelfHealingAIRequest,
    SelfHealingAIResponse,
    AgentStepResult,
    Finding,
    AnalysisRequest
)
from services.rule_engine import RuleEngine
from services.gemini_service import GeminiVerificationService
from config import settings

logger = logging.getLogger("brandsutra.self_healing")

SEVERITY_WEIGHTS = {
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 25,
    "CRITICAL": 40
}

class SelfHealingService:
    """
    Agentic Multi-Agent Self-Healing Content Studio:
    Agent 1: Policy Violation Detection Agent
    Agent 2: Content Correction Agent
    Agent 3: Brand Voice Agent
    Agent 4: Compliance Revalidation Agent
    Loops up to max_iterations (max 3) until content is compliant.
    """

    @classmethod
    def execute_self_healing(cls, request: SelfHealingAIRequest) -> SelfHealingAIResponse:
        current_text = request.content_text.strip()
        original_text = current_text
        steps: List[AgentStepResult] = []
        max_cycles = min(3, max(1, request.max_iterations))

        initial_risk_score = 0
        resolved_count = 0
        initial_violations_count = 0

        for iteration in range(1, max_cycles + 1):
            iter_start = time.time()

            # -------------------------------------------------------------
            # AGENT 1: Policy Violation Detection Agent
            # -------------------------------------------------------------
            step1_start = time.time()
            findings = cls._agent1_detect_violations(current_text, request)
            current_risk_score, current_risk_level = cls._calculate_risk(findings)

            if iteration == 1:
                initial_risk_score = current_risk_score
                initial_violations_count = len(findings)

            findings_summary = f"Detected {len(findings)} violation(s). Risk Score: {current_risk_score}/100 ({current_risk_level})."
            steps.append(AgentStepResult(
                iteration_number=iteration,
                agent_name="DETECTION",
                status="SUCCESS" if len(findings) == 0 else "WARNING",
                input_snippet=current_text[:200] + ("..." if len(current_text) > 200 else ""),
                output_text=f"Found {len(findings)} policy violation(s).",
                findings_json=json.dumps([f.model_dump() for f in findings]),
                explanation=findings_summary,
                execution_time_ms=int((time.time() - step1_start) * 1000)
            ))

            # If clean on the first or revalidation cycle, no further correction needed
            if len(findings) == 0:
                break

            # -------------------------------------------------------------
            # AGENT 2: Content Correction Agent
            # -------------------------------------------------------------
            step2_start = time.time()
            corrected_text, correction_notes = cls._agent2_correct_content(current_text, findings, request)
            steps.append(AgentStepResult(
                iteration_number=iteration,
                agent_name="CORRECTION",
                status="SUCCESS",
                input_snippet=current_text[:200] + ("..." if len(current_text) > 200 else ""),
                output_text=corrected_text,
                explanation=correction_notes,
                execution_time_ms=int((time.time() - step2_start) * 1000)
            ))

            # -------------------------------------------------------------
            # AGENT 3: Brand Voice Agent
            # -------------------------------------------------------------
            step3_start = time.time()
            voice_refined_text, voice_notes = cls._agent3_brand_voice_polish(corrected_text, request)
            steps.append(AgentStepResult(
                iteration_number=iteration,
                agent_name="VOICE",
                status="SUCCESS",
                input_snippet=corrected_text[:200] + ("..." if len(corrected_text) > 200 else ""),
                output_text=voice_refined_text,
                explanation=voice_notes,
                execution_time_ms=int((time.time() - step3_start) * 1000)
            ))

            current_text = voice_refined_text

            # -------------------------------------------------------------
            # AGENT 4: Compliance Revalidation Agent
            # -------------------------------------------------------------
            step4_start = time.time()
            reval_findings = cls._agent1_detect_violations(current_text, request)
            reval_risk_score, reval_risk_level = cls._calculate_risk(reval_findings)

            reval_status = "SUCCESS" if len(reval_findings) == 0 else ("WARNING" if reval_risk_score < current_risk_score else "ERROR")
            reval_explanation = (
                f"Revalidation clean! 0 remaining violations. Risk Score: 0/100 (LOW)."
                if len(reval_findings) == 0
                else f"Revalidation found {len(reval_findings)} remaining violation(s). Risk Score: {reval_risk_score}/100 ({reval_risk_level})."
            )

            steps.append(AgentStepResult(
                iteration_number=iteration,
                agent_name="REVALIDATION",
                status=reval_status,
                input_snippet=current_text[:200] + ("..." if len(current_text) > 200 else ""),
                output_text=f"Residual findings: {len(reval_findings)}",
                findings_json=json.dumps([f.model_dump() for f in reval_findings]),
                explanation=reval_explanation,
                execution_time_ms=int((time.time() - step4_start) * 1000)
            ))

            # Check if resolved
            if len(reval_findings) == 0:
                resolved_count = initial_violations_count
                break

        # Final evaluation of the healed text
        final_findings = cls._agent1_detect_violations(current_text, request)
        final_risk_score, final_risk_level = cls._calculate_risk(final_findings)
        remaining_count = len(final_findings)
        resolved_count = max(0, initial_violations_count - remaining_count)

        # Generate readable diff summary
        diff_summary = cls._generate_diff_summary(original_text, current_text)

        summary_msg = (
            f"Self-Healing completed in {len([s for s in steps if s.agent_name == 'DETECTION'])} cycle(s). "
            f"Resolved {resolved_count} of {initial_violations_count} violation(s). "
            f"Final Risk: {final_risk_score}/100 ({final_risk_level})."
        )

        return SelfHealingAIResponse(
            status="COMPLETED",
            original_text=original_text,
            healed_text=current_text,
            iterations_count=min(max_cycles, len([s for s in steps if s.agent_name == 'DETECTION'])),
            initial_risk_score=initial_risk_score,
            final_risk_score=final_risk_score,
            final_risk_level=final_risk_level,
            resolved_violations_count=resolved_count,
            remaining_violations_count=remaining_count,
            summary=summary_msg,
            steps=steps,
            diff_highlights=diff_summary
        )

    # -------------------------------------------------------------------------
    # AGENT 1 IMPLEMENTATION
    # -------------------------------------------------------------------------
    @classmethod
    def _agent1_detect_violations(cls, text: str, request: SelfHealingAIRequest) -> List[Finding]:
        # 1. Deterministic Rule-Based Scanning
        rule_findings = RuleEngine.evaluate(
            text=text,
            rules=request.brand_rules,
            facts=request.approved_facts
        )

        # 2. Semantic Gemini Verification (if configured)
        ai_findings: List[Finding] = []
        try:
            analysis_req = AnalysisRequest(
                submission_id=request.submission_id,
                version_id=request.version_id,
                organization_id=request.organization_id,
                submitted_text=text,
                brand_profile=request.brand_profile,
                approved_facts=request.approved_facts,
                brand_rules=request.brand_rules,
                guidelines_text=request.guidelines_text
            )
            ai_findings = GeminiVerificationService.analyze(analysis_req)
        except Exception as e:
            logger.info(f"AI semantic verification skipped or failed: {e}. Relying on deterministic rules.")

        # Deduplicate
        combined: List[Finding] = list(rule_findings)
        seen = {f.category.lower() + "_" + f.severity.lower() for f in rule_findings}
        for af in ai_findings:
            key = af.category.lower() + "_" + af.severity.lower()
            if key not in seen:
                combined.append(af)
                seen.add(key)

        return combined

    # -------------------------------------------------------------------------
    # AGENT 2 IMPLEMENTATION
    # -------------------------------------------------------------------------
    @classmethod
    def _agent2_correct_content(
        cls,
        text: str,
        findings: List[Finding],
        request: SelfHealingAIRequest
    ) -> Tuple[str, str]:
        """
        Grounded correction agent: removes unsupported claims, replaces banned terms,
        and caps discounts and warranties to approved Brand DNA numbers.
        """
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

        # Try Gemini Agent first with strict grounding instructions
        if api_key:
            try:
                from google import genai
                client = genai.Client(api_key=api_key, http_options={"timeout": 10})

                facts_text = "\n".join([f"- {f.category}: {f.approved_statement}" for f in request.approved_facts])
                rules_text = "\n".join([f"- {r.rule_type}: '{r.term_or_phrase}' -> replacement: '{r.preferred_replacement or 'remove'}'" for r in request.brand_rules])
                violations_text = "\n".join([f"- {f.category} ({f.severity}): {f.issue} (Suggested: {f.suggested_correction or 'Fix based on facts'})" for f in findings])

                prompt = f"""You are the BrandSutra Content Correction Agent.
Your job is to revise marketing copy to 100% resolve the detected violations while preserving the creator's promotional intent.

=== STRICT GROUNDING RULES ===
1. SOURCE OF TRUTH: Use the approved facts below as absolute truth. DO NOT invent new specifications, warranties, or discounts.
2. NEVER EXCEED:
   - Max seasonal discount is capped strictly per facts (e.g. 25% on selected categories).
   - Standard warranty is strictly 2 years across all appliances (5-year applies ONLY to Model X compressor).
3. PROHIBITED PHRASES: Replace banned terms (e.g. '100% perfect', 'unlimited warranty', 'guaranteed results') with approved brand terminology.
4. DO NOT change the product type or marketing purpose. Keep the copy punchy, compelling, and compliant.
5. Return ONLY a JSON object:
{{
  "corrected_text": "the revised text here",
  "explanation": "brief description of specific edits made"
}}

APPROVED FACTS:
{facts_text}

BRAND RULES:
{rules_text}

DETECTED VIOLATIONS TO RESOLVE:
{violations_text}

ORIGINAL TEXT:
\"\"\"{text}\"\"\"
"""
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config={"response_mime_type": "application/json", "temperature": 0.1}
                )
                res_data = json.loads(response.text.strip())
                corrected = res_data.get("corrected_text", "").strip()
                explanation = res_data.get("explanation", "Applied grounded corrections to align claims with Brand DNA.")
                if corrected:
                    return corrected, explanation
            except Exception as e:
                logger.warning(f"Gemini Correction Agent error: {e}. Falling back to deterministic correction engine.")

        # --- DETERMINISTIC CORRECTION ENGINE FALLBACK (100% Offline / Zero Cost) ---
        return cls._deterministic_correction(text, findings, request)

    @classmethod
    def _deterministic_correction(
        cls,
        text: str,
        findings: List[Finding],
        request: SelfHealingAIRequest
    ) -> Tuple[str, str]:
        corrected = text
        changes_applied = []

        # 1. Replace banned terms using BrandRule preferred replacements
        for rule in request.brand_rules:
            if rule.rule_type in ["BANNED_TERM", "RESTRICTED_TERM"]:
                term = rule.term_or_phrase.strip()
                if term and re.search(re.escape(term), corrected, re.IGNORECASE):
                    replacement = rule.preferred_replacement or "engineered for excellence"
                    corrected = re.sub(re.escape(term), replacement, corrected, flags=re.IGNORECASE)
                    changes_applied.append(f"Replaced prohibited term '{term}' with '{replacement}'.")

        # 2. Adjust excessive discount claims
        max_discount = 25.0
        for fact in request.approved_facts:
            if fact.category.upper() in ["DISCOUNTS", "PRICING"]:
                m = re.search(r"(\d+(?:\.\d+)?)\s*%", fact.approved_statement)
                if m:
                    max_discount = float(m.group(1))
                    break

        # Replace excessive discounts (e.g. "40% off", "40% OFF")
        def discount_replacer(match):
            val = float(match.group(1))
            if val > max_discount:
                changes_applied.append(f"Capped promotional discount from {val:.0f}% to approved maximum {max_discount:.0f}%.")
                return f"up to {max_discount:.0f}% off on selected"
            return match.group(0)

        corrected = re.sub(
            r"(?:flat\s+)?(\d+(?:\.\d+)?)\s*%\s*(?:off|discount)(?:\s*(?:on|sitewide|everything))?",
            discount_replacer,
            corrected,
            flags=re.IGNORECASE
        )

        # 3. Correct blanket warranty claims
        # e.g. "5-year warranty on everything" -> "2-year standard warranty on all appliances, with 5 years on Model X compressor"
        blanket_warranty_pattern = r"(?:a\s+)?(\d+)\s*(?:-| )?year\s+warranty\s+(?:on|for)\s+(?:everything|all\s+products?|every\s+product|all)"
        if re.search(blanket_warranty_pattern, corrected, re.IGNORECASE):
            corrected = re.sub(
                blanket_warranty_pattern,
                "standard 2-year warranty on all models, and 5-year compressor warranty on Model X",
                corrected,
                flags=re.IGNORECASE
            )
            changes_applied.append("Refined blanket warranty to standard 2-year coverage with 5-year Model X compressor terms.")

        # 4. Remove unsupported absolutes: "always!", "sitewide, always!"
        if re.search(r",?\s*always!?\b", corrected, re.IGNORECASE):
            corrected = re.sub(r",?\s*always!?\b", ". Offer valid for a limited promotional period.", corrected, flags=re.IGNORECASE)
            changes_applied.append("Removed perpetual 'always' claim and added valid promotional period clause.")

        # Clean up repeated spaces or awkward punctuation
        corrected = re.sub(r"\s+", " ", corrected).strip()
        corrected = re.sub(r"\s+([.,!?])", r"\1", corrected)

        explanation = "; ".join(changes_applied) if changes_applied else "Adjusted claims to strictly match approved Brand DNA policies."
        return corrected, explanation

    # -------------------------------------------------------------------------
    # AGENT 3 IMPLEMENTATION
    # -------------------------------------------------------------------------
    @classmethod
    def _agent3_brand_voice_polish(cls, text: str, request: SelfHealingAIRequest) -> Tuple[str, str]:
        """
        Brand Voice Agent: ensures tone guidelines, professional readability,
        and brand identity consistency.
        """
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        tone = request.brand_profile.voice_tone if request.brand_profile else "Professional and Friendly"

        if api_key:
            try:
                from google import genai
                client = genai.Client(api_key=api_key, http_options={"timeout": 10})
                prompt = f"""You are the BrandSutra Brand Voice Agent.
Polish the following marketing draft to strictly reflect our brand voice: '{tone}'.

REQUIREMENTS:
1. Elevate clarity and polish without changing any factual claims, numbers, warranties, or discounts.
2. Eliminate cheesy sales hype or excessive punctuation (e.g. '!!!').
3. Keep the messaging confident, approachable, and trustworthy.
4. Return ONLY a JSON object:
{{
  "voice_refined_text": "the refined copy",
  "notes": "brief summary of tone adjustments"
}}

DRAFT TEXT:
\"\"\"{text}\"\"\"
"""
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config={"response_mime_type": "application/json", "temperature": 0.1}
                )
                res_data = json.loads(response.text.strip())
                polished = res_data.get("voice_refined_text", "").strip()
                notes = res_data.get("notes", f"Aligned vocabulary with {tone} voice parameters.")
                if polished:
                    return polished, notes
            except Exception as e:
                logger.warning(f"Voice Agent AI attempt skipped: {e}. Using deterministic voice polisher.")

        # Deterministic Voice Polishing
        polished = text
        # Clean excessive exclamation points
        polished = re.sub(r"!{2,}", "!", polished)
        # Ensure proper sentence capitalization
        sentences = re.split(r"(?<=[.!?])\s+", polished)
        capitalized = [s[0].upper() + s[1:] if len(s) > 1 else s.upper() for s in sentences if s]
        polished = " ".join(capitalized)

        return polished, f"Refined formatting and calibrated tone to '{tone}' standards."

    # -------------------------------------------------------------------------
    # UTILITIES
    # -------------------------------------------------------------------------
    @staticmethod
    def _calculate_risk(findings: List[Finding]) -> Tuple[int, str]:
        total = 0
        for f in findings:
            total += SEVERITY_WEIGHTS.get(f.severity.upper(), 15)
        score = min(100, total)
        level = "LOW" if score <= 20 else ("MEDIUM" if score <= 40 else ("HIGH" if score <= 70 else "CRITICAL"))
        return score, level

    @staticmethod
    def _generate_diff_summary(original: str, healed: str) -> str:
        s = difflib.SequenceMatcher(None, original.split(), healed.split())
        changes = []
        for tag, i1, i2, j1, j2 in s.get_opcodes():
            if tag == 'replace':
                orig_snippet = " ".join(original.split()[i1:i2])
                new_snippet = " ".join(healed.split()[j1:j2])
                changes.append(f"Changed '{orig_snippet}' ➔ '{new_snippet}'")
            elif tag == 'delete':
                del_snippet = " ".join(original.split()[i1:i2])
                changes.append(f"Removed '{del_snippet}'")
            elif tag == 'insert':
                add_snippet = " ".join(healed.split()[j1:j2])
                changes.append(f"Added '{add_snippet}'")
        return "\n".join(changes[:10]) if changes else "No structural text modifications."
