"""
Report generator: produces Markdown and JSON outputs from analysis results.
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional

import pandas as pd
from tabulate import tabulate

logger = logging.getLogger(__name__)


class ReportGenerator:
    """
    Generates human-readable Markdown reports and machine-readable JSON
    from the combined analysis and recommendation results.

    Args:
        output_dir: Directory where reports will be saved.
    """

    def __init__(self, output_dir: str = "outputs") -> None:
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self._timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_full_report(
        self,
        rfm_df: pd.DataFrame,
        clv_df: pd.DataFrame,
        recommendations: Dict[str, Any],
        cohort_df: Optional[pd.DataFrame] = None,
        engagement_df: Optional[pd.DataFrame] = None,
        mode: str = "live",
    ) -> Dict[str, str]:
        """
        Generate and save all report formats.

        Returns:
            Dict with paths to each saved file.
        """
        paths: Dict[str, str] = {}

        md = self._build_markdown(rfm_df, clv_df, recommendations, cohort_df, engagement_df, mode)
        md_path = os.path.join(self.output_dir, f"report_{self._timestamp}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md)
        paths["markdown"] = md_path
        logger.info("Markdown report saved: %s", md_path)

        json_data = self._build_json(rfm_df, clv_df, recommendations, mode)
        json_path = os.path.join(self.output_dir, f"report_{self._timestamp}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=2, default=str)
        paths["json"] = json_path
        logger.info("JSON report saved: %s", json_path)

        return paths

    # ------------------------------------------------------------------
    # Markdown builder
    # ------------------------------------------------------------------

    def _build_markdown(
        self,
        rfm_df: pd.DataFrame,
        clv_df: pd.DataFrame,
        recommendations: Dict[str, Any],
        cohort_df: Optional[pd.DataFrame],
        engagement_df: Optional[pd.DataFrame],
        mode: str,
    ) -> str:
        sections = [
            self._md_header(mode),
            self._md_executive_summary(recommendations),
            self._md_segment_overview(rfm_df, clv_df),
            self._md_segment_recommendations(recommendations),
            self._md_email_strategy(recommendations),
            self._md_whatsapp_strategy(recommendations),
            self._md_promotions_calendar(recommendations),
            self._md_cohort_section(cohort_df),
            self._md_footer(),
        ]
        return "\n\n".join(s for s in sections if s)

    # ------------------------------------------------------------------

    def _md_header(self, mode: str) -> str:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        mode_badge = " *(DEMO DATA)*" if mode == "demo" else ""
        return (
            f"# Ecommerce CLV & Marketing Intelligence Report{mode_badge}\n\n"
            f"**Generated:** {ts}  \n"
            f"**Focus:** Owned Media — Email · WhatsApp · Promotions  \n"
            f"**Objective:** Increase Customer Lifetime Value\n\n"
            "---"
        )

    def _md_executive_summary(self, recs: Dict[str, Any]) -> str:
        bullets = recs.get("executive_summary", [])
        if not bullets:
            return ""
        lines = ["## Executive Summary\n"]
        for b in bullets:
            lines.append(f"- {b}")
        return "\n".join(lines)

    def _md_segment_overview(
        self, rfm_df: pd.DataFrame, clv_df: pd.DataFrame
    ) -> str:
        if rfm_df.empty:
            return ""

        clv_col = next(
            (c for c in ["combined_clv", "historical_clv", "predicted_clv"] if c in clv_df.columns),
            None,
        )
        merged = rfm_df.copy()
        if clv_col and "customer_id" in clv_df.columns:
            merged = merged.merge(
                clv_df[["customer_id", clv_col]].rename(columns={clv_col: "clv"}),
                on="customer_id",
                how="left",
            )
        else:
            merged["clv"] = merged.get("monetary", 0)

        table_rows = []
        for seg, grp in merged.groupby("segment"):
            table_rows.append({
                "Segment": seg,
                "Customers": f"{len(grp):,}",
                "Avg CLV ($)": f"{grp['clv'].mean():,.0f}",
                "Total CLV ($)": f"{grp['clv'].sum():,.0f}",
                "Avg Order ($)": f"{grp['monetary'].mean():,.0f}" if "monetary" in grp else "—",
                "Avg Frequency": f"{grp['frequency'].mean():.1f}" if "frequency" in grp else "—",
                "Avg Recency (days)": f"{grp['recency_days'].mean():.0f}" if "recency_days" in grp else "—",
            })

        total_customers = merged.shape[0]
        total_clv = merged["clv"].sum()

        lines = [
            "## Customer Segment Overview\n",
            tabulate(table_rows, headers="keys", tablefmt="github"),
            f"\n**Total customers:** {total_customers:,} | **Combined CLV:** ${total_clv:,.0f}",
        ]
        return "\n".join(lines)

    def _md_segment_recommendations(self, recs: Dict[str, Any]) -> str:
        by_seg = recs.get("by_segment", {})
        priorities = recs.get("segment_priorities", [])
        if not by_seg:
            return ""

        lines = ["## Segment-Level Recommendations\n"]
        for p in priorities:
            seg = p["segment"]
            data = by_seg.get(seg, {})
            metrics = data.get("metrics", {})
            promo = data.get("promotions", {})

            urgency_icon = {"high": "🚨", "medium": "📈", "normal": "✅"}.get(p.get("urgency", "normal"), "")

            lines.append(f"### {urgency_icon} {seg}")
            lines.append(
                f"**{metrics.get('customer_count', 0):,} customers** | "
                f"Avg CLV: ${metrics.get('avg_clv', 0):,.0f} | "
                f"Total CLV: ${metrics.get('total_clv', 0):,.0f}\n"
            )

            # Promo recommendation summary — uses actual playbook keys
            if promo:
                lines.append(f"**Promotion Approach:** {promo.get('strategy', '')}  ")
                lines.append(f"**Rationale:** {promo.get('rationale', '')}  ")
                promos = promo.get("promotions", [])
                if promos:
                    max_disc = max((p.get("discount_pct", 0) for p in promos), default=0)
                    if max_disc:
                        lines.append(f"**Max Discount:** {max_disc}%  ")
                    promo_names = ", ".join(p.get("name", "") for p in promos)
                    lines.append(f"**Tactics:** {promo_names}  ")
                avoid = promo.get("avoid")
                if avoid:
                    lines.append(f"**Avoid:** {avoid}  ")
                roi_proj = promo.get("roi_projections", [])
                if roi_proj:
                    first = roi_proj[0]
                    lines.append(
                        f"**Est. Revenue Lift:** ${first.get('incremental_revenue', 0):,.0f}  "
                        f"| ROI: {first.get('roi_pct', 'N/A')}%"
                    )
            lines.append("")

        return "\n".join(lines)

    def _md_email_strategy(self, recs: Dict[str, Any]) -> str:
        by_seg = recs.get("by_segment", {})
        priorities = recs.get("segment_priorities", [])
        if not by_seg:
            return ""

        lines = ["## Email Strategy by Segment\n"]
        for p in priorities:
            seg = p["segment"]
            email = by_seg.get(seg, {}).get("email", {})
            if not email:
                continue

            lines.append(f"### {seg}")
            lines.append(f"**Strategy:** {email.get('strategy', '')}  ")
            lines.append(f"**Objective:** {email.get('objective', '')}  ")
            lines.append(f"**Frequency:** {email.get('send_frequency', '')}  ")
            lines.append(f"**Best Time:** {email.get('optimal_timing', '')}  ")

            # email_sequence is the actual key from the playbook
            sequence = email.get("email_sequence", email.get("automation_flows", []))
            if sequence:
                lines.append("\n**Email Sequence:**")
                for step in sequence:
                    subjects_ex = step.get("subject_examples", [step.get("subject", "")])
                    subj = subjects_ex[0] if subjects_ex else ""
                    lines.append(
                        f"- **Step {step.get('step', '?')}** ({step.get('trigger', '')}): "
                        f"*{subj}* — {step.get('cta', step.get('body_focus', ''))}"
                    )

            subjects = email.get("subject_line_examples", [])
            if subjects:
                lines.append("\n**Subject Line Examples:**")
                for s in subjects:
                    lines.append(f"- `{s}`")

            kpis = email.get("kpi_targets", {})
            if kpis:
                kpi_str = " | ".join(f"{k}: {v}" for k, v in kpis.items())
                lines.append(f"\n**KPI Targets:** {kpi_str}")

            lines.append("")

        return "\n".join(lines)

    def _md_whatsapp_strategy(self, recs: Dict[str, Any]) -> str:
        by_seg = recs.get("by_segment", {})
        priorities = recs.get("segment_priorities", [])
        if not by_seg:
            return ""

        lines = ["## WhatsApp Strategy by Segment\n"]
        for p in priorities:
            seg = p["segment"]
            wa = by_seg.get(seg, {}).get("whatsapp", {})
            if not wa:
                continue

            lines.append(f"### {seg}")
            lines.append(f"**Strategy:** {wa.get('strategy', '')}  ")
            lines.append(f"**Objective:** {wa.get('objective', '')}  ")
            lines.append(f"**Frequency Cap:** {wa.get('frequency_cap', '')}  ")
            lines.append(f"**Best Time:** {wa.get('optimal_timing', '')}  ")

            templates = wa.get("message_templates", [])
            if templates:
                lines.append("\n**Message Templates:**")
                for t in templates:
                    lines.append(f"\n*{t.get('name', '')}* ({t.get('trigger', '')})")
                    lines.append(f"```\n{t.get('template', '')}\n```")

            lines.append("")

        return "\n".join(lines)

    def _md_promotions_calendar(self, recs: Dict[str, Any]) -> str:
        by_seg = recs.get("by_segment", {})
        priorities = recs.get("segment_priorities", [])
        if not by_seg:
            return ""

        lines = [
            "## Promotions Strategy & Calendar\n",
            "### Discount Framework by Segment\n",
        ]

        table_rows = []
        for p in priorities:
            seg = p["segment"]
            promo = by_seg.get(seg, {}).get("promotions", {})
            if not promo:
                continue
            promos_list = promo.get("promotions", [])
            max_disc = max((p.get("discount_pct", 0) for p in promos_list), default=0)
            roi_proj = promo.get("roi_projections", [])
            lift = f"${roi_proj[0].get('incremental_revenue', 0):,.0f}" if roi_proj else "—"
            table_rows.append({
                "Segment": seg,
                "Strategy": promo.get("strategy", ""),
                "Max Discount": f"{max_disc}%" if max_disc else "None",
                "# Tactics": len(promos_list),
                "Est. Revenue Lift": lift,
                "Margin Impact": promo.get("expected_margin_impact", ""),
            })

        if table_rows:
            lines.append(tabulate(table_rows, headers="keys", tablefmt="github"))

        # Calendar
        lines.append("\n### Recommended Promotion Calendar\n")
        calendar = [
            {"Month": "Month 1", "Segment": "At_Risk + Lost", "Action": "Win-back campaign (20-30% discount) via Email + WhatsApp"},
            {"Month": "Month 1", "Segment": "New", "Action": "Welcome series + 15% first repurchase incentive"},
            {"Month": "Month 2", "Segment": "Potential_Loyal", "Action": "Second-purchase incentive (10% off) via Email"},
            {"Month": "Month 2", "Segment": "Champion + Loyal", "Action": "VIP early access to new products / loyalty reward"},
            {"Month": "Month 3", "Segment": "All", "Action": "Seasonal campaign with tiered discounts by segment"},
            {"Month": "Ongoing", "Segment": "All", "Action": "Post-purchase upsell/cross-sell flows (automated)"},
        ]
        lines.append(tabulate(calendar, headers="keys", tablefmt="github"))

        return "\n".join(lines)

    def _md_cohort_section(self, cohort_df: Optional[pd.DataFrame]) -> str:
        if cohort_df is None or cohort_df.empty:
            return ""

        lines = ["## Cohort Retention Analysis\n"]
        try:
            lines.append(tabulate(cohort_df.head(12).fillna(""), headers="keys", tablefmt="github"))
        except Exception:
            lines.append("*Cohort data available but could not be formatted.*")
        return "\n".join(lines)

    def _md_footer(self) -> str:
        return (
            "---\n\n"
            "*Report generated by Hyppo Ecommerce Intelligence · "
            f"Powered by Claude AI · {datetime.now().strftime('%Y-%m-%d')}*"
        )

    # ------------------------------------------------------------------
    # JSON builder
    # ------------------------------------------------------------------

    def _build_json(
        self,
        rfm_df: pd.DataFrame,
        clv_df: pd.DataFrame,
        recommendations: Dict[str, Any],
        mode: str,
    ) -> Dict[str, Any]:
        segment_summary = {}
        if not rfm_df.empty and "segment" in rfm_df.columns:
            for seg, grp in rfm_df.groupby("segment"):
                segment_summary[seg] = {
                    "customer_count": int(len(grp)),
                    "avg_recency_days": float(grp["recency_days"].mean()) if "recency_days" in grp else 0,
                    "avg_frequency": float(grp["frequency"].mean()) if "frequency" in grp else 0,
                    "avg_monetary": float(grp["monetary"].mean()) if "monetary" in grp else 0,
                }

        return {
            "meta": {
                "generated_at": datetime.now().isoformat(),
                "mode": mode,
                "total_customers": int(len(rfm_df)),
            },
            "segment_summary": segment_summary,
            "recommendations": recommendations,
        }
