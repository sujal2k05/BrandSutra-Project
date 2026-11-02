import io
import json
import datetime
from typing import Dict, Any
from models.schemas import AdversarialAIResponse

class AdversarialReportPdfGenerator:
    """
    Generates a professional executive PDF audit report using PyMuPDF (fitz)
    at 100% zero external cost.
    """

    @classmethod
    def generate_pdf(
        cls,
        sim_data: Any,
        content_text: str,
        campaign_name: str = "Promotional Campaign",
        org_name: str = "NovaHome Appliances"
    ) -> bytes:
        import fitz  # PyMuPDF

        doc = fitz.open()
        page = doc.new_page(width=595, height=842)  # Standard A4 size

        # Colors (RGB normalized 0.0 - 1.0)
        c_indigo = (0.29, 0.33, 0.85)       # Brand Primary #4B55D6
        c_dark = (0.09, 0.12, 0.17)         # Slate 900
        c_slate = (0.39, 0.45, 0.55)        # Slate 500
        c_card_bg = (0.97, 0.98, 1.0)       # Light indigo/slate bg
        c_border = (0.88, 0.90, 0.95)

        # Resilient attribute extraction (supports both Pydantic schema & dict)
        if isinstance(sim_data, dict):
            score = int(sim_data.get("overall_risk_score", 50))
            consumer_score = int(sim_data.get("consumer_risk_score", 50))
            compliance_score = int(sim_data.get("compliance_risk_score", 50))
            reputation_score = int(sim_data.get("reputation_risk_score", 50))
            executive_summary = sim_data.get("executive_summary", "Adversarial PR simulation audit completed.")
            raw_reports = sim_data.get("reports", [])
        else:
            score = int(getattr(sim_data, "overall_risk_score", 50))
            consumer_score = int(getattr(sim_data, "consumer_risk_score", 50))
            compliance_score = int(getattr(sim_data, "compliance_risk_score", 50))
            reputation_score = int(getattr(sim_data, "reputation_risk_score", 50))
            executive_summary = getattr(sim_data, "executive_summary", "Adversarial PR simulation audit completed.")
            raw_reports = getattr(sim_data, "reports", [])

        # Determine risk color
        if score > 70:
            c_risk = (0.88, 0.15, 0.15)     # Red
            risk_label = "CRITICAL RISK"
        elif score > 40:
            c_risk = (0.92, 0.45, 0.10)     # Orange
            risk_label = "HIGH RISK"
        elif score > 20:
            c_risk = (0.85, 0.65, 0.10)     # Amber
            risk_label = "MEDIUM RISK"
        else:
            c_risk = (0.10, 0.65, 0.35)     # Green
            risk_label = "LOW RISK"

        # -------------------------------------------------------------
        # 1. Header Banner
        # -------------------------------------------------------------
        header_rect = fitz.Rect(35, 30, 560, 85)
        page.draw_rect(header_rect, color=c_indigo, fill=c_indigo)

        page.insert_text(
            (50, 54),
            "BrandSutra  |  Adversarial PR Simulator",
            fontsize=15,
            color=(1, 1, 1),
            fontname="helv",
            fontfile=None
        )
        page.insert_text(
            (50, 72),
            "Pre-Publication Stakeholder Risk & Deceptive Advertising Audit Report",
            fontsize=9.5,
            color=(0.90, 0.92, 1.0),
            fontname="helv"
        )

        # -------------------------------------------------------------
        # 2. Metadata Strip
        # -------------------------------------------------------------
        now_str = datetime.datetime.now().strftime("%d %B %Y, %H:%M UTC")
        page.insert_text((40, 108), f"Organization: {org_name}", fontsize=9, color=c_dark, fontname="helv")
        page.insert_text((40, 122), f"Campaign: {campaign_name or 'General Promotion'}", fontsize=9, color=c_dark, fontname="helv")
        page.insert_text((340, 108), f"Generated: {now_str}", fontsize=9, color=c_slate, fontname="helv")
        page.insert_text((340, 122), "Status: PRE-PUBLICATION AUDIT", fontsize=9, color=c_indigo, fontname="helv")

        page.draw_line(fitz.Point(35, 134), fitz.Point(560, 134), color=c_border, width=1)

        # -------------------------------------------------------------
        # 3. Overall Risk Scorecard & Perspective Breakdown
        # -------------------------------------------------------------
        card_rect = fitz.Rect(35, 145, 560, 215)
        page.draw_rect(card_rect, color=c_border, fill=c_card_bg)

        # Overall Score Box
        score_box = fitz.Rect(45, 155, 155, 205)
        page.draw_rect(score_box, color=c_risk, fill=c_risk)
        page.insert_text((65, 182), f"{score}/100", fontsize=20, color=(1, 1, 1), fontname="helv")
        page.insert_text((62, 198), risk_label, fontsize=8.5, color=(1, 1, 1), fontname="helv")

        # Perspective Breakdown
        page.insert_text((170, 165), "Multi-Stakeholder Perspective Breakdown:", fontsize=10, color=c_dark, fontname="helv")
        page.insert_text((170, 183), f"• Consumer Perspective Risk:     {consumer_score}/100", fontsize=9, color=c_dark, fontname="helv")
        page.insert_text((170, 197), f"• Regulatory & Advertising Risk:   {compliance_score}/100", fontsize=9, color=c_dark, fontname="helv")
        page.insert_text((170, 211), f"• Brand Reputation & Trust Risk:   {reputation_score}/100", fontsize=9, color=c_dark, fontname="helv")

        # -------------------------------------------------------------
        # 4. Analyzed Content Excerpt
        # -------------------------------------------------------------
        y_pos = 224
        page.insert_text((36, y_pos), "Submitted Marketing Content Evaluated:", fontsize=9.5, color=c_indigo, fontname="helv")
        y_pos += 10

        content_box = fitz.Rect(35, y_pos, 560, y_pos + 44)
        page.draw_rect(content_box, color=(0.92, 0.94, 0.96), fill=(0.97, 0.97, 0.98))

        display_text = content_text.strip()
        page.insert_textbox(
            fitz.Rect(45, y_pos + 5, 550, y_pos + 39),
            f'"{display_text}"',
            fontsize=8.5,
            fontname="helv",
            color=c_dark,
            align=fitz.TEXT_ALIGN_LEFT
        )
        y_pos += 52

        # -------------------------------------------------------------
        # 5. Executive Summary
        # -------------------------------------------------------------
        page.insert_text((36, y_pos), "Executive Risk Assessment:", fontsize=9.5, color=c_indigo, fontname="helv")
        y_pos += 10

        summary_box = fitz.Rect(35, y_pos, 560, y_pos + 50)
        page.draw_rect(summary_box, color=c_border, fill=(1, 1, 1))

        summary_text = executive_summary or "Pre-publication audit complete."
        page.insert_textbox(
            fitz.Rect(45, y_pos + 5, 550, y_pos + 45),
            summary_text,
            fontsize=8.5,
            fontname="helv",
            color=c_dark,
            align=fitz.TEXT_ALIGN_LEFT
        )
        y_pos += 58

        # -------------------------------------------------------------
        # 6. Detailed Agent Findings (Up to 3 Perspectives)
        # -------------------------------------------------------------
        page.insert_text((36, y_pos), "Detailed Perspective Findings & Actionable Recommendations:", fontsize=9.5, color=c_indigo, fontname="helv")
        y_pos += 10

        for rep in raw_reports[:3]:
            if y_pos > 700:
                break
            
            if isinstance(rep, dict):
                p_name = rep.get("agent_perspective", "AGENT").upper()
                rep_score = rep.get("risk_score", 50)
                findings_raw = rep.get("findings_json") or rep.get("findings", [])
                recs_raw = rep.get("recommendations_json") or rep.get("recommendations", [])
                p_summary = rep.get("perspective_summary", "")
            else:
                p_name = getattr(rep, "agent_perspective", "AGENT").upper()
                rep_score = getattr(rep, "risk_score", 50)
                findings_raw = getattr(rep, "findings_json", "")
                recs_raw = getattr(rep, "recommendations_json", "")
                p_summary = getattr(rep, "perspective_summary", "")

            findings = []
            recs = []
            try:
                findings = json.loads(findings_raw) if isinstance(findings_raw, str) else findings_raw
                recs = json.loads(recs_raw) if isinstance(recs_raw, str) else recs_raw
            except Exception:
                pass

            p_box = fitz.Rect(35, y_pos, 560, y_pos + 72)
            page.draw_rect(p_box, color=c_border, fill=(0.99, 0.99, 1.0))

            page.insert_text((45, y_pos + 14), f"[{p_name} PERSPECTIVE] - Risk Score: {rep_score}/100", fontsize=8.5, color=c_indigo, fontname="helv")
            
            # Print finding with text wrapping
            f_text = p_summary or "No critical violations detected."
            if findings and isinstance(findings, list) and len(findings) > 0:
                first_f = findings[0]
                if isinstance(first_f, dict):
                    f_text = f"Issue: {first_f.get('title', '')} - {first_f.get('explanation', '')}"
                elif isinstance(first_f, str):
                    f_text = f"Issue: {first_f}"

            page.insert_textbox(
                fitz.Rect(45, y_pos + 18, 550, y_pos + 44),
                f_text,
                fontsize=8,
                fontname="helv",
                color=c_dark,
                align=fitz.TEXT_ALIGN_LEFT
            )

            # Print recommendation with text wrapping
            r_text = "Follow standard brand guidelines."
            if recs and isinstance(recs, list) and len(recs) > 0:
                first_r = recs[0]
                if isinstance(first_r, dict):
                    r_text = first_r.get("text") or first_r.get("recommendation", str(first_r))
                else:
                    r_text = str(first_r)

            page.insert_textbox(
                fitz.Rect(45, y_pos + 46, 550, y_pos + 68),
                f"Recommendation: {r_text}",
                fontsize=8,
                fontname="helv",
                color=(0.10, 0.50, 0.30),
                align=fitz.TEXT_ALIGN_LEFT
            )

            y_pos += 78

        # -------------------------------------------------------------
        # 7. Regulatory Disclaimer Footer
        # -------------------------------------------------------------
        disclaimer_y = 780
        page.draw_line(fitz.Point(35, disclaimer_y), fitz.Point(560, disclaimer_y), color=c_border, width=0.8)
        page.insert_text(
            (38, disclaimer_y + 14),
            "DISCLAIMER: This document is an automated pre-publication governance risk-screening report produced by BrandSutra.",
            fontsize=7.5,
            color=c_slate,
            fontname="helv"
        )
        page.insert_text(
            (38, disclaimer_y + 24),
            "It does not constitute formal legal counsel. Final content approval remains strictly with the designated Human Reviewer.",
            fontsize=7.5,
            color=c_slate,
            fontname="helv"
        )

        # Output bytes
        pdf_bytes = doc.write()
        doc.close()
        return pdf_bytes
