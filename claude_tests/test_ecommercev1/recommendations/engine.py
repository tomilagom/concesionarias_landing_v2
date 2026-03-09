"""
Recommendation engine orchestrator.

Ties together RFM segmentation, CLV analysis, cohort data, and engagement
metrics to produce prioritised, actionable recommendations per segment
and per channel.
"""

import logging
from typing import Any, Dict, List, Optional

import pandas as pd

from .email_strategy import EmailStrategy
from .whatsapp_strategy import WhatsAppStrategy
from .promotions_strategy import PromotionsStrategy

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Orchestrates all recommendation strategies into a unified output.

    Args:
        email_strategy: Optional custom EmailStrategy instance.
        wa_strategy: Optional custom WhatsAppStrategy instance.
        promo_strategy: Optional custom PromotionsStrategy instance.
    """

    def __init__(
        self,
        email_strategy: Optional[EmailStrategy] = None,
        wa_strategy: Optional[WhatsAppStrategy] = None,
        promo_strategy: Optional[PromotionsStrategy] = None,
    ) -> None:
        self.email = email_strategy or EmailStrategy()
        self.whatsapp = wa_strategy or WhatsAppStrategy()
        self.promotions = promo_strategy or PromotionsStrategy()

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def generate_all(
        self,
        rfm_df: pd.DataFrame,
        clv_df: pd.DataFrame,
        cohort_df: Optional[pd.DataFrame] = None,
        engagement_df: Optional[pd.DataFrame] = None,
    ) -> Dict[str, Any]:
        """
        Generate the complete recommendation set.

        Args:
            rfm_df: Output of RFMAnalyzer.assign_segments — must have
                customer_id, segment, R, F, M, monetary columns.
            clv_df: Output of CLVAnalyzer — must have customer_id and
                a CLV column (combined_clv or historical_clv).
            cohort_df: Optional cohort retention table from CohortAnalyzer.
            engagement_df: Optional per-customer engagement summary from
                EngagementAnalyzer.identify_channel_preference.

        Returns:
            Structured dict:
                {
                    "segment_priorities": [...],          # segments ranked by CLV opportunity
                    "by_segment": {                       # per-segment full recommendations
                        "Champion": {
                            "metrics": {...},
                            "email": {...},
                            "whatsapp": {...},
                            "promotions": {...},
                        },
                        ...
                    },
                    "by_channel": {
                        "email": {...},
                        "whatsapp": {...},
                    },
                    "cohort_insights": {...},
                    "executive_summary": [...],
                }
        """
        logger.info("Generating recommendations for %d customers", len(rfm_df))

        # Build per-segment metrics
        segment_metrics = self._build_segment_metrics(rfm_df, clv_df, engagement_df)

        # Prioritise segments by CLV opportunity
        segment_priorities = self._prioritise_segments(segment_metrics)

        # Build engagement dicts per segment
        email_engagement = self._segment_engagement(engagement_df, channel="email")
        wa_engagement = self._segment_engagement(engagement_df, channel="wa")

        # Generate per-segment recommendations
        by_segment: Dict[str, Any] = {}
        for seg_info in segment_priorities:
            seg = seg_info["segment"]
            sm = segment_metrics.get(seg, {})
            by_segment[seg] = {
                "metrics": sm,
                "email": self.email.get_recommendations(
                    seg, email_engagement.get(seg)
                ),
                "whatsapp": self.whatsapp.get_recommendations(
                    seg, wa_engagement.get(seg)
                ),
                "promotions": self.promotions.get_recommendations(seg, sm),
            }

        # Channel-level view
        by_channel = {
            "email": self._channel_summary("email", by_segment),
            "whatsapp": self._channel_summary("whatsapp", by_segment),
        }

        # Cohort insights
        cohort_insights = self._cohort_insights(cohort_df)

        # Executive summary bullets
        executive_summary = self._build_executive_summary(
            segment_priorities, segment_metrics, cohort_insights
        )

        result = {
            "segment_priorities": segment_priorities,
            "by_segment": by_segment,
            "by_channel": by_channel,
            "cohort_insights": cohort_insights,
            "executive_summary": executive_summary,
        }

        logger.info(
            "Recommendations generated for %d segments", len(segment_priorities)
        )
        return result

    # ------------------------------------------------------------------
    # Segment metrics aggregation
    # ------------------------------------------------------------------

    def _build_segment_metrics(
        self,
        rfm_df: pd.DataFrame,
        clv_df: pd.DataFrame,
        engagement_df: Optional[pd.DataFrame],
    ) -> Dict[str, Dict[str, Any]]:
        """Aggregate key metrics per segment from RFM + CLV data."""
        if "segment" not in rfm_df.columns:
            logger.warning("rfm_df missing 'segment' column — metrics will be empty.")
            return {}

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

        metrics: Dict[str, Dict] = {}
        for seg, grp in merged.groupby("segment"):
            metrics[seg] = {
                "customer_count": len(grp),
                "avg_clv": round(float(grp["clv"].mean()), 2),
                "total_clv": round(float(grp["clv"].sum()), 2),
                "avg_monetary": round(float(grp["monetary"].mean()), 2) if "monetary" in grp else 0,
                "avg_frequency": round(float(grp["frequency"].mean()), 2) if "frequency" in grp else 0,
                "avg_recency_days": round(float(grp["recency_days"].mean()), 1) if "recency_days" in grp else 0,
                "avg_order_value": round(float(grp["monetary"].mean()), 2) if "monetary" in grp else 0,
            }

        return metrics

    # ------------------------------------------------------------------
    # Segment prioritisation
    # ------------------------------------------------------------------

    def _prioritise_segments(
        self, segment_metrics: Dict[str, Dict]
    ) -> List[Dict[str, Any]]:
        """
        Rank segments by CLV opportunity (total_clv descending).
        Also factors in urgency for At_Risk and Lost segments.
        """
        priorities = []
        for seg, m in segment_metrics.items():
            urgency = "normal"
            if seg in ("At_Risk", "Lost"):
                urgency = "high"  # revenue at risk of permanent loss
            elif seg in ("New", "Potential_Loyal"):
                urgency = "medium"  # growth opportunity

            priorities.append(
                {
                    "segment": seg,
                    "customer_count": m.get("customer_count", 0),
                    "total_clv": m.get("total_clv", 0),
                    "avg_clv": m.get("avg_clv", 0),
                    "urgency": urgency,
                    "priority_score": self._priority_score(seg, m),
                }
            )

        return sorted(priorities, key=lambda x: x["priority_score"], reverse=True)

    @staticmethod
    def _priority_score(segment: str, metrics: Dict) -> float:
        """
        Compute a composite priority score.

        Champions and Loyal segments get high scores (protect & grow).
        At_Risk gets a urgency boost (prevent churn).
        Lost gets moderate score (recovery opportunity, lower probability).
        """
        base = metrics.get("total_clv", 0)
        multipliers = {
            "Champion": 1.5,
            "Loyal": 1.3,
            "Potential_Loyal": 1.1,
            "New": 1.0,
            "At_Risk": 1.4,   # Urgency: recovering even 20% is high value
            "Lost": 0.8,
            "Others": 0.5,
        }
        return base * multipliers.get(segment, 1.0)

    # ------------------------------------------------------------------
    # Engagement helpers
    # ------------------------------------------------------------------

    def _segment_engagement(
        self,
        engagement_df: Optional[pd.DataFrame],
        channel: str,
    ) -> Dict[str, Dict]:
        """
        Build a dict of {segment: engagement_metrics} for a given channel.

        Requires engagement_df to have a 'segment' column (merged from rfm_df).
        """
        if engagement_df is None or engagement_df.empty:
            return {}
        if "segment" not in engagement_df.columns:
            return {}

        result: Dict[str, Dict] = {}
        for seg, grp in engagement_df.groupby("segment"):
            if channel == "email":
                result[seg] = {
                    "open_rate_pct": float(grp.get("email_open_rate_pct", grp.get("email_score", pd.Series([0]))).mean()),
                    "ctr_pct": float(grp.get("email_clicks", pd.Series([0])).sum()
                               / max(grp.get("email_opens", pd.Series([1])).sum(), 1) * 100),
                    "unsubscribe_rate_pct": float(grp.get("email_unsubscribed", pd.Series([0])).mean()),
                }
            elif channel == "wa":
                result[seg] = {
                    "read_rate_pct": float(grp.get("wa_read_rate_pct", grp.get("wa_score", pd.Series([0]))).mean()),
                    "response_rate_pct": 0.0,
                    "opt_out_rate_pct": float(grp.get("wa_opted_out", pd.Series([0])).mean()),
                }
        return result

    # ------------------------------------------------------------------
    # Channel summary
    # ------------------------------------------------------------------

    @staticmethod
    def _channel_summary(
        channel: str, by_segment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Produce a channel-level view: list of segments with their strategy."""
        summary: Dict[str, Any] = {"segments": {}}
        for seg, data in by_segment.items():
            channel_data = data.get(channel, {})
            summary["segments"][seg] = {
                "strategy": channel_data.get("strategy", ""),
                "objective": channel_data.get("objective", ""),
                "send_frequency": channel_data.get("send_frequency", channel_data.get("frequency_cap", "")),
                "optimal_timing": channel_data.get("optimal_timing", ""),
                "kpi_targets": channel_data.get("kpi_targets", {}),
            }
        return summary

    # ------------------------------------------------------------------
    # Cohort insights
    # ------------------------------------------------------------------

    @staticmethod
    def _cohort_insights(cohort_df: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """Extract high-level insights from the cohort table."""
        if cohort_df is None or cohort_df.empty:
            return {"available": False}

        insights: Dict[str, Any] = {"available": True}
        try:
            # Average M1 retention (month 1 retention is key indicator)
            if 1 in cohort_df.columns and 0 in cohort_df.columns:
                m1_retention = (
                    cohort_df[1].fillna(0) / cohort_df[0].replace(0, float("nan"))
                ).mean() * 100
                insights["avg_m1_retention_pct"] = round(float(m1_retention), 1)

            insights["total_cohorts"] = len(cohort_df)
            insights["latest_cohort"] = str(cohort_df.index[-1]) if len(cohort_df) else "N/A"
            insights["oldest_cohort"] = str(cohort_df.index[0]) if len(cohort_df) else "N/A"
        except Exception as exc:
            logger.warning("Could not extract cohort insights: %s", exc)

        return insights

    # ------------------------------------------------------------------
    # Executive summary
    # ------------------------------------------------------------------

    def _build_executive_summary(
        self,
        priorities: List[Dict],
        metrics: Dict[str, Dict],
        cohort_insights: Dict,
    ) -> List[str]:
        """Build a list of human-readable executive summary bullet points."""
        bullets: List[str] = []

        total_customers = sum(m.get("customer_count", 0) for m in metrics.values())
        total_clv = sum(m.get("total_clv", 0) for m in metrics.values())

        bullets.append(
            f"Total analysed customer base: {total_customers:,} customers "
            f"with combined CLV of ${total_clv:,.0f}."
        )

        # Top segment
        if priorities:
            top = priorities[0]
            bullets.append(
                f"Highest-priority segment: {top['segment']} "
                f"({top['customer_count']:,} customers, "
                f"${top['total_clv']:,.0f} total CLV)."
            )

        # At risk
        at_risk = metrics.get("At_Risk", {})
        if at_risk.get("customer_count", 0) > 0:
            bullets.append(
                f"URGENT: {at_risk['customer_count']:,} customers are At Risk "
                f"(${at_risk['total_clv']:,.0f} CLV). Launch win-back campaign immediately."
            )

        # Lost
        lost = metrics.get("Lost", {})
        if lost.get("customer_count", 0) > 0:
            bullets.append(
                f"{lost['customer_count']:,} customers are Lost "
                f"(${lost['total_clv']:,.0f} historical CLV). "
                "Deploy reactivation offer with 30% discount."
            )

        # New customers
        new = metrics.get("New", {})
        if new.get("customer_count", 0) > 0:
            bullets.append(
                f"{new['customer_count']:,} New customers require onboarding sequences "
                "to maximise retention probability."
            )

        # Cohort insight
        if cohort_insights.get("available") and "avg_m1_retention_pct" in cohort_insights:
            m1 = cohort_insights["avg_m1_retention_pct"]
            benchmark = 20  # industry average ~15-25%
            if m1 < benchmark:
                bullets.append(
                    f"Month-1 cohort retention is {m1:.1f}% (below {benchmark}% benchmark). "
                    "Prioritise onboarding email series and post-purchase engagement."
                )
            else:
                bullets.append(
                    f"Month-1 cohort retention is strong at {m1:.1f}% (benchmark: {benchmark}%)."
                )

        return bullets
