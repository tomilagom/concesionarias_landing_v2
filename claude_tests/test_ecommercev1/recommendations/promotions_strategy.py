"""
Promotions and discount strategy per customer segment.

Calculates expected ROI, recommends discount levels, and produces
a monthly promotion calendar with optimal timing per segment.
"""

import logging
from typing import Any, Dict, List, Optional

import pandas as pd

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Segment promotion definitions
# ---------------------------------------------------------------------------

_PROMO_PLAYBOOKS: Dict[str, Dict[str, Any]] = {
    "Champion": {
        "strategy": "Exclusivity Over Discounts",
        "rationale": (
            "Champions buy at full price; discounting devalues the brand in their eyes "
            "and trains price-sensitivity. Focus on non-monetary perks."
        ),
        "promotions": [
            {
                "name": "VIP Early Access",
                "type": "access",
                "discount_pct": 0,
                "benefit": "Access to new collection 24-48h before general public",
                "frequency": "Every new collection / major launch",
                "max_per_year": 6,
            },
            {
                "name": "Complimentary Gift with Purchase",
                "type": "gift",
                "discount_pct": 0,
                "benefit": "Free branded gift on orders above average order value",
                "frequency": "Quarterly",
                "max_per_year": 4,
            },
            {
                "name": "Loyalty Tier Upgrade",
                "type": "status",
                "discount_pct": 0,
                "benefit": "Fast-track to Gold/Platinum tier with free shipping + priority support",
                "frequency": "Annual",
                "max_per_year": 1,
            },
        ],
        "avoid": "Percentage discounts and flash sales visible to this segment.",
        "expected_margin_impact": "Neutral to positive — loyalty deepens without margin erosion.",
    },

    "Loyal": {
        "strategy": "Modest Loyalty Reward",
        "rationale": (
            "Loyal customers deserve recognition but do not yet require heavy discounts. "
            "10-15% keeps margins healthy while rewarding continued engagement."
        ),
        "promotions": [
            {
                "name": "Loyalty Appreciation Discount",
                "type": "percentage",
                "discount_pct": 12,
                "benefit": "12% off sitewide as a thank-you for loyalty",
                "frequency": "Quarterly",
                "max_per_year": 4,
                "coupon_type": "single-use",
            },
            {
                "name": "Free Shipping Upgrade",
                "type": "shipping",
                "discount_pct": 0,
                "benefit": "Free express shipping on all orders for 30 days",
                "frequency": "Semi-annual",
                "max_per_year": 2,
            },
            {
                "name": "Category Sale Access",
                "type": "category_discount",
                "discount_pct": 15,
                "benefit": "15% off their most purchased category",
                "frequency": "Quarterly",
                "max_per_year": 4,
                "targeting": "personalised by top_category",
            },
        ],
        "avoid": "Deep 30%+ discounts — Loyal customers don't need them.",
        "expected_margin_impact": (
            "Modest margin reduction (est. -2 to -4 margin points) "
            "offset by increased order frequency."
        ),
    },

    "Potential_Loyal": {
        "strategy": "Second Purchase Incentive",
        "rationale": (
            "Getting a customer to buy twice is the biggest conversion lever in ecommerce. "
            "A 10% offer is economically justified by the long-term CLV gain."
        ),
        "promotions": [
            {
                "name": "Second Purchase Coupon",
                "type": "percentage",
                "discount_pct": 10,
                "benefit": "10% off second order, auto-applied or code-based",
                "frequency": "One-time, sent 7-14 days after first order",
                "max_per_year": 1,
                "expiry_days": 14,
            },
            {
                "name": "Bundle Deal",
                "type": "bundle",
                "discount_pct": 10,
                "benefit": "Buy 2, get 10% off — encourages higher basket size",
                "frequency": "Triggered when browsing 2+ products",
                "max_per_year": 4,
            },
        ],
        "avoid": "Deep discounts before demonstrating product value.",
        "expected_margin_impact": (
            "Short-term margin reduction offset by lifetime value increase "
            "for customers who become Loyal."
        ),
    },

    "New": {
        "strategy": "Welcome Incentive (First Repeat)",
        "rationale": (
            "New customers have the highest churn risk in the first 30 days. "
            "A generous welcome offer significantly increases repeat purchase probability."
        ),
        "promotions": [
            {
                "name": "First Repeat Purchase Offer",
                "type": "percentage+shipping",
                "discount_pct": 15,
                "benefit": "15% off + free shipping on second order",
                "frequency": "One-time, 14 days after first purchase",
                "max_per_year": 1,
                "expiry_days": 30,
            },
            {
                "name": "Welcome Bundle",
                "type": "bundle",
                "discount_pct": 10,
                "benefit": "Starter bundle at 10% off — curated by top category",
                "frequency": "Shown at checkout on first visit",
                "max_per_year": 1,
            },
        ],
        "avoid": "Showing discount before checkout — it may cannibalise full-price purchase.",
        "expected_margin_impact": (
            "Acceptable margin reduction given the high lifetime value potential of converted new customers."
        ),
    },

    "At_Risk": {
        "strategy": "Urgency-Driven Win-Back Discount",
        "rationale": (
            "Customers are drifting and need a compelling reason to return. "
            "20-25% with a tight expiry creates urgency without feeling desperate."
        ),
        "promotions": [
            {
                "name": "Win-Back Offer — Step 1",
                "type": "percentage",
                "discount_pct": 20,
                "benefit": "20% off sitewide — time-limited (72 hours)",
                "frequency": "Triggered at 45-60 days since last order",
                "max_per_year": 1,
                "expiry_days": 3,
            },
            {
                "name": "Win-Back Offer — Step 2 (Escalated)",
                "type": "percentage",
                "discount_pct": 25,
                "benefit": "25% off — final offer (48 hours)",
                "frequency": "7 days after Step 1 if no purchase",
                "max_per_year": 1,
                "expiry_days": 2,
            },
        ],
        "avoid": "Offering discounts indefinitely without an expiry — no urgency created.",
        "expected_margin_impact": (
            "Significant margin hit (~20-25 points) but necessary to recover "
            "otherwise lost revenue. ROI positive if ≥10% of at-risk customers convert."
        ),
    },

    "Lost": {
        "strategy": "Maximum Reactivation Offer",
        "rationale": (
            "Churned customers require a significantly compelling offer to return. "
            "30% + free returns removes price AND risk barriers simultaneously."
        ),
        "promotions": [
            {
                "name": "Reactivation Discount",
                "type": "percentage+returns",
                "discount_pct": 30,
                "benefit": "30% off entire order + free returns (no-risk trial)",
                "frequency": "One-time, 90+ days since last order",
                "max_per_year": 1,
                "expiry_days": 7,
            },
        ],
        "avoid": "Repeated reactivation offers — trains price-seeking behaviour.",
        "expected_margin_impact": (
            "Deep margin hit (~30 points) but expected reactivation rate is low (3-8%). "
            "Total revenue recovery must exceed discount + returns cost."
        ),
    },

    "Others": {
        "strategy": "General Seasonal Promotions",
        "rationale": "Unclassified customers should receive standard sitewide promotions only.",
        "promotions": [
            {
                "name": "Seasonal Sale",
                "type": "percentage",
                "discount_pct": 10,
                "benefit": "10% off sitewide during major sale events",
                "frequency": "Quarterly (aligned with retail calendar)",
                "max_per_year": 4,
            },
        ],
        "avoid": "Personalised offers until segment is properly classified.",
        "expected_margin_impact": "Standard retail promotion margins.",
    },
}


# ---------------------------------------------------------------------------
# Promotion calendar (monthly)
# ---------------------------------------------------------------------------

_PROMO_CALENDAR: List[Dict[str, Any]] = [
    {"month": 1,  "name": "New Year Clearance",    "segments": ["At_Risk", "Lost"],            "suggested_discount": "20-25%"},
    {"month": 2,  "name": "Valentine's Day",        "segments": ["Champion", "Loyal"],          "suggested_discount": "Gift + early access"},
    {"month": 3,  "name": "Spring Launch",           "segments": ["New", "Potential_Loyal"],     "suggested_discount": "10-15%"},
    {"month": 4,  "name": "Spring Sale",             "segments": ["Loyal", "Potential_Loyal"],   "suggested_discount": "12%"},
    {"month": 5,  "name": "Loyalty Appreciation",    "segments": ["Champion", "Loyal"],          "suggested_discount": "Gift / free shipping"},
    {"month": 6,  "name": "Mid-Year Win-Back",        "segments": ["At_Risk", "Lost"],            "suggested_discount": "25-30%"},
    {"month": 7,  "name": "Summer Essentials",       "segments": ["All"],                        "suggested_discount": "10%"},
    {"month": 8,  "name": "Back to School",          "segments": ["New", "Potential_Loyal"],     "suggested_discount": "10%"},
    {"month": 9,  "name": "Autumn Launch",           "segments": ["Champion", "Loyal"],          "suggested_discount": "Early access"},
    {"month": 10, "name": "Pre-Black Friday Tease", "segments": ["Champion"],                   "suggested_discount": "VIP pre-access"},
    {"month": 11, "name": "Black Friday / Cyber Monday", "segments": ["All"],                  "suggested_discount": "Site-wide 20-30%"},
    {"month": 12, "name": "Christmas & Year-End",    "segments": ["Loyal", "Potential_Loyal"],  "suggested_discount": "15% + free gift wrap"},
]


class PromotionsStrategy:
    """
    Generate promotion and discount recommendations per segment.

    Also calculates expected ROI and builds a monthly promotion calendar.

    Args:
        custom_playbooks: Override or extend default playbooks.
    """

    def __init__(self, custom_playbooks: Optional[Dict[str, Any]] = None) -> None:
        self._playbooks = {**_PROMO_PLAYBOOKS, **(custom_playbooks or {})}

    # ------------------------------------------------------------------
    # Recommendations
    # ------------------------------------------------------------------

    def get_recommendations(
        self,
        segment: str,
        segment_metrics: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Return the promotions playbook for a segment, with ROI estimates.

        Args:
            segment: Customer segment name.
            segment_metrics: Optional dict with avg_clv, avg_order_value,
                customer_count to personalise ROI calculations.

        Returns:
            Full playbook dict including ROI projections.
        """
        playbook = self._playbooks.get(segment, self._playbooks["Others"]).copy()
        playbook["segment"] = segment

        if segment_metrics:
            playbook["roi_projections"] = self._calculate_roi(segment, segment_metrics)

        logger.debug("Promotions recommendations generated for segment '%s'", segment)
        return playbook

    def get_all_recommendations(
        self,
        segment_metrics: Optional[Dict[str, Dict]] = None,
    ) -> Dict[str, Dict]:
        """Return promotions playbooks for all segments."""
        return {
            seg: self.get_recommendations(seg, (segment_metrics or {}).get(seg))
            for seg in self._playbooks
        }

    # ------------------------------------------------------------------
    # Promotion calendar
    # ------------------------------------------------------------------

    def get_promotion_calendar(
        self,
        current_month: Optional[int] = None,
        remaining_months: int = 12,
    ) -> pd.DataFrame:
        """
        Return the promotion calendar as a DataFrame.

        Args:
            current_month: Start from this month (1-12). Defaults to next month.
            remaining_months: How many months of calendar to return.

        Returns:
            DataFrame with: month, name, segments, suggested_discount.
        """
        df = pd.DataFrame(_PROMO_CALENDAR)
        if current_month:
            months = [
                ((current_month - 1 + i) % 12) + 1
                for i in range(remaining_months)
            ]
            df = df[df["month"].isin(months)]
        return df.reset_index(drop=True)

    # ------------------------------------------------------------------
    # ROI calculation
    # ------------------------------------------------------------------

    def _calculate_roi(
        self,
        segment: str,
        metrics: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Estimate revenue lift vs discount cost for each promotion in the segment.

        Args:
            segment: Segment name.
            metrics: Dict with avg_order_value, customer_count,
                avg_clv, expected_conversion_rate (optional).

        Returns:
            List of dicts with roi_pct, expected_revenue, discount_cost per promotion.
        """
        playbook = self._playbooks.get(segment, {})
        promotions = playbook.get("promotions", [])

        aov = float(metrics.get("avg_order_value", 100))
        count = int(metrics.get("customer_count", 0))

        # Segment-specific conversion rate assumptions
        _conversion_rates = {
            "Champion": 0.25,
            "Loyal": 0.20,
            "Potential_Loyal": 0.15,
            "New": 0.20,
            "At_Risk": 0.10,
            "Lost": 0.05,
            "Others": 0.08,
        }
        conv_rate = metrics.get(
            "expected_conversion_rate",
            _conversion_rates.get(segment, 0.10),
        )

        results = []
        for promo in promotions:
            discount_pct = promo.get("discount_pct", 0) / 100
            expected_buyers = count * conv_rate
            gross_revenue = expected_buyers * aov
            discount_cost = gross_revenue * discount_pct
            net_revenue = gross_revenue - discount_cost
            roi = (net_revenue / discount_cost * 100) if discount_cost > 0 else float("inf")

            results.append(
                {
                    "promotion": promo.get("name"),
                    "discount_pct": promo.get("discount_pct", 0),
                    "expected_converters": round(expected_buyers),
                    "gross_revenue_est": round(gross_revenue, 2),
                    "discount_cost_est": round(discount_cost, 2),
                    "net_revenue_est": round(net_revenue, 2),
                    "roi_pct": round(roi, 1) if roi != float("inf") else "N/A (no discount)",
                }
            )
        return results
