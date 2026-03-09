"""
Email campaign strategy recommendations per customer segment.

Each segment gets a full email playbook: cadence, subject line templates,
optimal send timing, and tactical notes for Customer.io campaign setup.
"""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Playbook definitions
# ---------------------------------------------------------------------------

_EMAIL_PLAYBOOKS: Dict[str, Dict[str, Any]] = {
    "Champion": {
        "strategy": "VIP Reward & Referral",
        "objective": "Deepen loyalty, leverage brand advocacy, increase referral revenue.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "Segment entry / monthly",
                "subject_examples": [
                    "You're one of our VIPs — here's your exclusive access 🎁",
                    "Early access: [New collection] drops tomorrow — just for you",
                ],
                "body_focus": "VIP badge reveal, early access to new products/sales.",
                "cta": "Shop Early Access",
            },
            {
                "step": 2,
                "trigger": "7 days after step 1",
                "subject_examples": [
                    "Share the love — earn [X]€ for every friend you refer",
                    "Your friends deserve [Brand] too — give them 15% off",
                ],
                "body_focus": "Referral program introduction with dual-sided incentive.",
                "cta": "Share My Referral Link",
            },
            {
                "step": 3,
                "trigger": "On loyalty milestone (e.g. 10th order)",
                "subject_examples": [
                    "Congratulations on your 10th order — a gift from us",
                    "You've unlocked Gold status — here's what that means",
                ],
                "body_focus": "Loyalty milestone celebration, gift or upgrade reveal.",
                "cta": "Claim Your Reward",
            },
        ],
        "send_frequency": "2–3x per month",
        "optimal_timing": "Tuesday–Thursday, 10:00–12:00 local time",
        "personalisation": [
            "First name in subject line",
            "Show their favourite product category",
            "Display loyalty points / tier status",
        ],
        "avoid": "Discounts — Champions buy without them; discounting trains them to wait.",
        "customer_io_tags": ["champion", "vip", "referral-eligible"],
    },

    "Loyal": {
        "strategy": "Cross-sell & Upsell Nurture",
        "objective": "Increase basket size and introduce premium product lines.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "7 days after last purchase",
                "subject_examples": [
                    "Since you loved [Product], you'll want to see this",
                    "Complete your collection — items that go perfectly with your last order",
                ],
                "body_focus": "Curated cross-sell recommendations based on purchase history.",
                "cta": "Shop Recommendations",
            },
            {
                "step": 2,
                "trigger": "30 days after last purchase",
                "subject_examples": [
                    "Level up: our premium [Category] range is here",
                    "You've tried the good — here's the best",
                ],
                "body_focus": "Upsell to premium tier with quality/benefit comparison.",
                "cta": "Explore Premium Range",
            },
            {
                "step": 3,
                "trigger": "On loyalty milestone",
                "subject_examples": [
                    "Loyal customers get 12% off — because you've earned it",
                    "A little thank-you: free shipping on your next order",
                ],
                "body_focus": "Modest loyalty reward (10-15% discount or free shipping).",
                "cta": "Shop With Discount",
            },
        ],
        "send_frequency": "1–2x per month",
        "optimal_timing": "Wednesday–Thursday, 09:00–11:00 local time",
        "personalisation": [
            "Product recommendations by category",
            "Order count milestone acknowledgement",
        ],
        "avoid": "Deep discounts — erodes margin with already-buying customers.",
        "customer_io_tags": ["loyal", "upsell-candidate"],
    },

    "Potential_Loyal": {
        "strategy": "Second Purchase Incentive & Social Proof",
        "objective": "Convert single or infrequent buyers into habitual purchasers.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "3 days after first/last purchase",
                "subject_examples": [
                    "How did you enjoy your [Product]? Here's what others got next",
                    "People who bought [Product] also loved these",
                ],
                "body_focus": "Social proof (reviews, bestsellers) + related products.",
                "cta": "See What Others Are Buying",
            },
            {
                "step": 2,
                "trigger": "10 days after step 1 (no second purchase)",
                "subject_examples": [
                    "10% off your next order — just for coming back",
                    "We saved something for you: 10% off expires in 48 hours",
                ],
                "body_focus": "Light discount to nudge second purchase.",
                "cta": "Shop Now — 10% Off",
            },
            {
                "step": 3,
                "trigger": "21 days after step 1 (no second purchase)",
                "subject_examples": [
                    "[Brand] members save more — here's why loyal customers love us",
                    "What happens when you order twice from [Brand]",
                ],
                "body_focus": "Benefits of continued purchasing (loyalty perks, convenience).",
                "cta": "Discover Loyalty Benefits",
            },
        ],
        "send_frequency": "Weekly during onboarding (first 30 days)",
        "optimal_timing": "Monday–Wednesday, 10:00–13:00 local time",
        "personalisation": ["First name", "Purchased product image", "Category affinity"],
        "avoid": "Overwhelming with too many emails too quickly.",
        "customer_io_tags": ["potential-loyal", "second-purchase-nurture"],
    },

    "New": {
        "strategy": "Welcome Series (5-Email Onboarding)",
        "objective": "Make a great first impression, build trust, drive first repeat purchase.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "Immediately after first purchase / sign-up",
                "subject_examples": [
                    "Welcome to [Brand] — your order is confirmed 🎉",
                    "You're in! Here's everything you need to know",
                ],
                "body_focus": "Order confirmation, brand story, what to expect.",
                "cta": "Track Your Order",
            },
            {
                "step": 2,
                "trigger": "Day 2",
                "subject_examples": [
                    "While your order is on its way — meet our bestsellers",
                    "The [Brand] community loves these products",
                ],
                "body_focus": "Bestsellers and top-rated products (social proof).",
                "cta": "Explore Bestsellers",
            },
            {
                "step": 3,
                "trigger": "Day 5",
                "subject_examples": [
                    "Did your order arrive? Here's how to get the most from [Product]",
                    "Pro tips for your [Product] — straight from our team",
                ],
                "body_focus": "Product education / usage tips to drive satisfaction.",
                "cta": "Read the Guide",
            },
            {
                "step": 4,
                "trigger": "Day 10",
                "subject_examples": [
                    "How are you getting on? Share your first impression",
                    "Your feedback shapes [Brand] — take 1 minute to review",
                ],
                "body_focus": "Review request + UGC encouragement.",
                "cta": "Leave a Review",
            },
            {
                "step": 5,
                "trigger": "Day 14 (no second purchase)",
                "subject_examples": [
                    "A little gift for being new: 15% off your second order",
                    "We'd love to see you again — here's 15% + free shipping",
                ],
                "body_focus": "First purchase incentive: 15% off + free shipping.",
                "cta": "Shop Now — 15% Off",
            },
        ],
        "send_frequency": "Daily for first 2 weeks, then weekly",
        "optimal_timing": "Mornings 08:00–10:00, weekdays",
        "personalisation": ["First name", "Purchased product", "Acquisition channel context"],
        "avoid": "Sending promotional emails before order confirmation.",
        "customer_io_tags": ["new-customer", "welcome-series"],
    },

    "At_Risk": {
        "strategy": "Win-Back Sequence (3-Email Flow)",
        "objective": "Re-engage lapsing customers before they churn completely.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "45–60 days since last purchase",
                "subject_examples": [
                    "We miss you, [First Name] — look what's new",
                    "It's been a while… here's what you've been missing",
                ],
                "body_focus": "Soft re-engagement — new arrivals or restocks in their category.",
                "cta": "See What's New",
            },
            {
                "step": 2,
                "trigger": "10 days after step 1 (no purchase)",
                "subject_examples": [
                    "Come back — 20% off, just for you",
                    "[First Name], we have something special: 20% off expires in 72 hours",
                ],
                "body_focus": "Urgency discount offer (20-25%) with clear expiry.",
                "cta": "Claim 20% Off",
            },
            {
                "step": 3,
                "trigger": "7 days after step 2 (no purchase)",
                "subject_examples": [
                    "Last chance: your 25% off expires tonight",
                    "We don't want to lose you — one final offer",
                ],
                "body_focus": "Final urgency + escalated discount (25%). Acknowledge absence.",
                "cta": "Shop Before Offer Expires",
            },
        ],
        "send_frequency": "3 emails over 17 days, then pause",
        "optimal_timing": "Tuesday, 10:00–12:00 local time (highest re-engagement rates)",
        "personalisation": [
            "Last purchased product",
            "Time since last order",
            "Personalised discount code",
        ],
        "avoid": "Sending more than 3 win-back emails — it signals desperation.",
        "customer_io_tags": ["at-risk", "win-back"],
    },

    "Lost": {
        "strategy": "Last-Chance Reactivation + Feedback",
        "objective": "Recover a small percentage of churned customers; understand why others left.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "90+ days since last purchase",
                "subject_examples": [
                    "We want you back — 30% off, no strings attached",
                    "[First Name], we're offering our biggest discount ever: 30% off",
                ],
                "body_focus": "Generous reactivation offer (30%) with free returns.",
                "cta": "Come Back — 30% Off",
            },
            {
                "step": 2,
                "trigger": "14 days after step 1 (no purchase)",
                "subject_examples": [
                    "Before you go — would you tell us why?",
                    "Quick question: what could [Brand] do better?",
                ],
                "body_focus": "Feedback survey (3 questions max). Offer small gift for completing.",
                "cta": "Share Your Feedback",
            },
        ],
        "send_frequency": "2 emails maximum, then suppress",
        "optimal_timing": "Wednesday, 11:00 local time",
        "personalisation": ["First name", "Last purchased category", "Tenure acknowledgement"],
        "avoid": (
            "Continuing to email after no response — move to suppression list "
            "to protect sender reputation."
        ),
        "customer_io_tags": ["lost", "reactivation", "suppression-candidate"],
    },

    "Others": {
        "strategy": "General Newsletter",
        "objective": "Maintain brand awareness for unclassified customers.",
        "email_sequence": [
            {
                "step": 1,
                "trigger": "Monthly",
                "subject_examples": [
                    "[Brand] Monthly Highlights — what's new this month",
                ],
                "body_focus": "Curated content: new arrivals, blog posts, community highlights.",
                "cta": "Explore This Month's Picks",
            }
        ],
        "send_frequency": "Monthly",
        "optimal_timing": "First Tuesday of the month, 10:00",
        "personalisation": ["First name"],
        "avoid": "Aggressive sales messaging without prior engagement data.",
        "customer_io_tags": ["general"],
    },
}


class EmailStrategy:
    """
    Generate email marketing playbooks per customer segment.

    Args:
        custom_playbooks: Override or extend default segment playbooks.
    """

    def __init__(self, custom_playbooks: Optional[Dict[str, Any]] = None) -> None:
        self._playbooks = {**_EMAIL_PLAYBOOKS, **(custom_playbooks or {})}

    def get_recommendations(
        self,
        segment: str,
        engagement_metrics: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Return the email playbook for a given segment, optionally adjusted
        by observed engagement metrics.

        Args:
            segment: Segment name (e.g. "Champion", "At_Risk").
            engagement_metrics: Optional dict with keys like open_rate_pct,
                ctr_pct, unsubscribe_rate_pct to adjust recommendations.

        Returns:
            Full playbook dict with strategy, sequence, timing, and KPI targets.
        """
        playbook = self._playbooks.get(segment, self._playbooks["Others"]).copy()

        # Adjust based on observed engagement
        if engagement_metrics:
            playbook = self._adjust_for_engagement(playbook, segment, engagement_metrics)

        # Add KPI benchmarks
        playbook["kpi_targets"] = self._kpi_targets(segment)
        playbook["segment"] = segment

        logger.debug("Email recommendations generated for segment '%s'", segment)
        return playbook

    def get_all_recommendations(
        self,
        segment_engagement: Optional[Dict[str, Dict]] = None,
    ) -> Dict[str, Dict]:
        """
        Return playbooks for all segments.

        Args:
            segment_engagement: Dict mapping segment name → engagement metrics dict.

        Returns:
            Dict mapping segment name → playbook.
        """
        result = {}
        for segment in self._playbooks:
            metrics = (segment_engagement or {}).get(segment)
            result[segment] = self.get_recommendations(segment, metrics)
        return result

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _adjust_for_engagement(
        self,
        playbook: Dict,
        segment: str,
        metrics: Dict[str, Any],
    ) -> Dict:
        """Modify playbook based on observed engagement data."""
        notes: List[str] = []

        open_rate = metrics.get("open_rate_pct", 0)
        unsub_rate = metrics.get("unsubscribe_rate_pct", 0)
        ctr = metrics.get("ctr_pct", 0)

        if open_rate < 15:
            notes.append(
                f"Open rate is low ({open_rate:.1f}%). "
                "A/B test subject lines; consider send-time optimisation."
            )
        if unsub_rate > 0.5:
            notes.append(
                f"Unsubscribe rate is elevated ({unsub_rate:.1f}%). "
                "Reduce frequency and audit content relevance."
            )
        if ctr < 1.0 and open_rate > 20:
            notes.append(
                f"Good opens but low CTR ({ctr:.1f}%). "
                "Improve CTA copy, placement, and button contrast."
            )
        if open_rate > 40:
            notes.append(
                f"Excellent open rate ({open_rate:.1f}%). "
                "Test sending one additional email per month."
            )

        if notes:
            playbook["engagement_notes"] = notes
        return playbook

    @staticmethod
    def _kpi_targets(segment: str) -> Dict[str, str]:
        """Return industry-benchmark KPI targets per segment."""
        targets: Dict[str, Dict] = {
            "Champion":        {"open_rate": ">35%", "ctr": ">5%",  "unsubscribe": "<0.1%"},
            "Loyal":           {"open_rate": ">28%", "ctr": ">4%",  "unsubscribe": "<0.2%"},
            "Potential_Loyal": {"open_rate": ">22%", "ctr": ">3%",  "unsubscribe": "<0.3%"},
            "New":             {"open_rate": ">40%", "ctr": ">6%",  "unsubscribe": "<0.2%"},
            "At_Risk":         {"open_rate": ">18%", "ctr": ">2.5%","unsubscribe": "<0.5%"},
            "Lost":            {"open_rate": ">12%", "ctr": ">1.5%","unsubscribe": "<1.0%"},
        }
        return targets.get(segment, {"open_rate": ">20%", "ctr": ">2%", "unsubscribe": "<0.5%"})
