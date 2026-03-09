"""
WhatsApp messaging strategy recommendations per customer segment.

Covers transactional flows, cart abandonment, restock alerts,
flash sale announcements, and win-back messages.
All templates comply with WhatsApp Business Policy guidelines.
"""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# WhatsApp playbook definitions
# ---------------------------------------------------------------------------

_WA_PLAYBOOKS: Dict[str, Dict[str, Any]] = {
    "Champion": {
        "strategy": "VIP Concierge + Cart Recovery",
        "objective": "Deliver premium, personalised service and recover abandoned carts fast.",
        "flows": [
            {
                "flow": "Order Confirmation & Shipping",
                "trigger": "order_placed event",
                "message_type": "transactional",
                "template": (
                    "Hi {{first_name}}, your [Brand] order #{{order_id}} is confirmed! "
                    "We'll message you when it ships. Thank you for being a VIP customer 🌟"
                ),
                "notes": "Send immediately after order. No opt-in required for transactional.",
            },
            {
                "flow": "Shipping Update",
                "trigger": "shipment_dispatched event",
                "message_type": "transactional",
                "template": (
                    "Great news, {{first_name}}! Your order #{{order_id}} is on its way. "
                    "Track it here: {{tracking_url}}"
                ),
                "notes": "Include live tracking link. Keep under 160 chars for readability.",
            },
            {
                "flow": "Cart Abandonment Recovery",
                "trigger": "60 minutes after cart_abandoned event",
                "message_type": "promotional",
                "template": (
                    "Hey {{first_name}}, you left something behind! "
                    "Your cart has {{cart_item_count}} item(s) ready. "
                    "Complete your purchase: {{cart_url}}\n\n"
                    "As a VIP, we've held your items for 24 hours. 🔒"
                ),
                "notes": "Opt-in required. Maximum 1 message per abandoned cart.",
            },
            {
                "flow": "Flash Sale — VIP Early Access",
                "trigger": "24 hours before sale goes public",
                "message_type": "promotional",
                "template": (
                    "{{first_name}}, your VIP early access starts NOW! "
                    "Get {{discount_pct}}% off before anyone else: {{sale_url}} "
                    "Offer ends in 24 hours. ⚡"
                ),
                "notes": "High urgency. Send once only. Do not resend.",
            },
        ],
        "opt_in_recommendation": "Request WhatsApp opt-in at checkout (pre-ticked for VIPs).",
        "frequency_cap": "Max 4 promotional messages per month.",
        "frequency_note": "Transactional messages are uncapped.",
        "customer_io_tags": ["champion", "wa-vip"],
    },

    "Loyal": {
        "strategy": "Restock Alerts + Cart Recovery",
        "objective": "Keep loyal buyers informed of relevant restocks and recover lost revenue.",
        "flows": [
            {
                "flow": "Order Confirmation & Shipping",
                "trigger": "order_placed event",
                "message_type": "transactional",
                "template": (
                    "Hi {{first_name}}, order #{{order_id}} confirmed! "
                    "Expected delivery: {{delivery_estimate}}. "
                    "We'll update you when it ships."
                ),
                "notes": "Standard transactional flow.",
            },
            {
                "flow": "Back-in-Stock Alert",
                "trigger": "product_restocked event (for previously purchased product)",
                "message_type": "promotional",
                "template": (
                    "{{first_name}}, great news! {{product_name}} is back in stock. "
                    "You bought it before — grab yours again: {{product_url}}"
                ),
                "notes": "Only send if customer purchased this product previously. Max 1/product.",
            },
            {
                "flow": "Cart Abandonment",
                "trigger": "90 minutes after cart_abandoned",
                "message_type": "promotional",
                "template": (
                    "Hi {{first_name}}, you left {{cart_item_count}} item(s) in your cart. "
                    "Ready to complete your order? {{cart_url}}"
                ),
                "notes": "Simple recovery — no discount on first attempt for Loyal segment.",
            },
        ],
        "opt_in_recommendation": "Request opt-in post-purchase via thank-you page.",
        "frequency_cap": "Max 3 promotional messages per month.",
        "frequency_note": "Monitor read rate; pause if below 40%.",
        "customer_io_tags": ["loyal", "wa-restock"],
    },

    "Potential_Loyal": {
        "strategy": "Second Purchase Nudge",
        "objective": "Use WhatsApp as a high-visibility channel to drive the second purchase.",
        "flows": [
            {
                "flow": "Order Confirmation",
                "trigger": "order_placed event",
                "message_type": "transactional",
                "template": (
                    "Hi {{first_name}}, your order is confirmed! 🎉 "
                    "Order #{{order_id}} — expected by {{delivery_estimate}}."
                ),
                "notes": "Transactional — always send.",
            },
            {
                "flow": "Second Purchase Incentive",
                "trigger": "14 days after first purchase (no second order)",
                "message_type": "promotional",
                "template": (
                    "Hey {{first_name}}! Hope you're loving your {{product_name}}. "
                    "We'd love to see you again — here's 10% off your next order: {{coupon_code}} "
                    "Valid for 7 days. Shop now: {{shop_url}}"
                ),
                "notes": "Pair with email campaign for maximum reach.",
            },
        ],
        "opt_in_recommendation": "Offer WhatsApp updates as an upgrade during checkout.",
        "frequency_cap": "Max 2 promotional messages in first 30 days.",
        "frequency_note": "Do not send if email is being received and engaged with.",
        "customer_io_tags": ["potential-loyal", "wa-nurture"],
    },

    "New": {
        "strategy": "Onboarding & Order Updates",
        "objective": "Build trust through reliable transactional communication.",
        "flows": [
            {
                "flow": "Order Confirmation",
                "trigger": "order_placed event",
                "message_type": "transactional",
                "template": (
                    "Welcome to [Brand], {{first_name}}! 🌟 "
                    "Your first order #{{order_id}} is confirmed. "
                    "We'll keep you updated right here."
                ),
                "notes": "This is the opt-in confirmation moment — ensure consent captured.",
            },
            {
                "flow": "Shipping Update",
                "trigger": "shipment_dispatched event",
                "message_type": "transactional",
                "template": (
                    "Your [Brand] order is on its way, {{first_name}}! "
                    "Track here: {{tracking_url}}"
                ),
                "notes": "Keep it simple for new customers — avoid promotional content.",
            },
            {
                "flow": "Delivery Confirmation + Review Request",
                "trigger": "3 days after estimated delivery date",
                "message_type": "transactional",
                "template": (
                    "Hi {{first_name}}, how did your order arrive? "
                    "We'd love your feedback: {{review_url}} ⭐"
                ),
                "notes": "Links to review platform. Sends only once.",
            },
        ],
        "opt_in_recommendation": (
            "Present WhatsApp opt-in on order confirmation page. "
            "Frame as 'Get live order updates on WhatsApp' — high consent rates."
        ),
        "frequency_cap": "Transactional only in first 30 days. Then max 1 promotional/month.",
        "frequency_note": "Do not promote until after first satisfactory order.",
        "customer_io_tags": ["new-customer", "wa-onboarding"],
    },

    "At_Risk": {
        "strategy": "Win-Back via WhatsApp",
        "objective": "High-visibility re-engagement complementing the email win-back flow.",
        "flows": [
            {
                "flow": "Soft Re-engagement",
                "trigger": "50 days since last purchase",
                "message_type": "promotional",
                "template": (
                    "Hi {{first_name}}, it's been a while — we miss you! "
                    "Here's what's new at [Brand]: {{shop_url}} 👀"
                ),
                "notes": "Send once. Do not follow up immediately on WhatsApp.",
            },
            {
                "flow": "Discount Win-Back",
                "trigger": "7 days after soft re-engagement (if no purchase)",
                "message_type": "promotional",
                "template": (
                    "{{first_name}}, we want you back! "
                    "Use code {{coupon_code}} for 20% off — expires in 48 hours. "
                    "Shop: {{shop_url}} ⏰"
                ),
                "notes": "Final WhatsApp message in this sequence. Suppress after if no response.",
            },
        ],
        "opt_in_recommendation": "Only message customers who previously opted in.",
        "frequency_cap": "Max 2 win-back messages. Do not exceed.",
        "frequency_note": (
            "Coordinate timing with email win-back: "
            "send WhatsApp 2 days after email to reinforce."
        ),
        "customer_io_tags": ["at-risk", "wa-winback"],
    },

    "Lost": {
        "strategy": "Final Reactivation Attempt",
        "objective": "One last high-value offer via WhatsApp to recover churned customers.",
        "flows": [
            {
                "flow": "Reactivation Offer",
                "trigger": "90+ days since last purchase",
                "message_type": "promotional",
                "template": (
                    "Hi {{first_name}}, we haven't seen you in a while and we want to fix that. "
                    "Here's our best offer: 30% off + free returns. "
                    "Code: {{coupon_code}} | Shop: {{shop_url}}\n"
                    "Offer expires in 72 hours."
                ),
                "notes": (
                    "Send only once. If no response, suppress from all WhatsApp communications "
                    "and remove from promotional email lists."
                ),
            },
        ],
        "opt_in_recommendation": "Only contact customers with active WhatsApp consent.",
        "frequency_cap": "1 message maximum. Suppress immediately after.",
        "frequency_note": "Respect customer fatigue — this is a last-resort channel.",
        "customer_io_tags": ["lost", "wa-reactivation"],
    },

    "Others": {
        "strategy": "Transactional Only",
        "objective": "Maintain trust through reliable order communication only.",
        "flows": [
            {
                "flow": "Order Confirmation & Shipping",
                "trigger": "order_placed / shipment_dispatched events",
                "message_type": "transactional",
                "template": (
                    "Hi {{first_name}}, your order #{{order_id}} is confirmed. "
                    "We'll update you when it ships."
                ),
                "notes": "Stick to transactional until segment clarifies.",
            }
        ],
        "opt_in_recommendation": "Collect opt-in but do not send promotional messages yet.",
        "frequency_cap": "Transactional only.",
        "frequency_note": "Reassign segment before launching promotional flows.",
        "customer_io_tags": ["general"],
    },
}


class WhatsAppStrategy:
    """
    Generate WhatsApp messaging playbooks per customer segment.

    Args:
        custom_playbooks: Override or extend default playbooks.
    """

    def __init__(self, custom_playbooks: Optional[Dict[str, Any]] = None) -> None:
        self._playbooks = {**_WA_PLAYBOOKS, **(custom_playbooks or {})}

    def get_recommendations(
        self,
        segment: str,
        engagement_metrics: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Return the WhatsApp playbook for a given segment.

        Args:
            segment: Customer segment name.
            engagement_metrics: Optional dict with read_rate_pct, response_rate_pct,
                opt_out_rate_pct to adjust recommendations.

        Returns:
            Full playbook dict.
        """
        playbook = self._playbooks.get(segment, self._playbooks["Others"]).copy()

        if engagement_metrics:
            playbook = self._adjust_for_engagement(playbook, engagement_metrics)

        playbook["kpi_targets"] = self._kpi_targets(segment)
        playbook["segment"] = segment
        return playbook

    def get_all_recommendations(
        self,
        segment_engagement: Optional[Dict[str, Dict]] = None,
    ) -> Dict[str, Dict]:
        """Return playbooks for all segments."""
        return {
            seg: self.get_recommendations(seg, (segment_engagement or {}).get(seg))
            for seg in self._playbooks
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _adjust_for_engagement(
        self, playbook: Dict, metrics: Dict[str, Any]
    ) -> Dict:
        notes: List[str] = []
        read_rate = metrics.get("read_rate_pct", 0)
        opt_out = metrics.get("opt_out_rate_pct", 0)
        response = metrics.get("response_rate_pct", 0)

        if read_rate < 40:
            notes.append(
                f"Read rate is below benchmark ({read_rate:.1f}% vs 60%+ target). "
                "Review message timing and template content."
            )
        if opt_out > 2:
            notes.append(
                f"High opt-out rate ({opt_out:.1f}%). "
                "Reduce message frequency immediately and audit relevance."
            )
        if response > 5:
            notes.append(
                f"Strong response rate ({response:.1f}%). "
                "Consider adding a conversational bot flow to handle replies."
            )

        if notes:
            playbook["engagement_notes"] = notes
        return playbook

    @staticmethod
    def _kpi_targets(segment: str) -> Dict[str, str]:
        targets = {
            "Champion":        {"read_rate": ">70%", "response_rate": ">8%",  "opt_out": "<0.5%"},
            "Loyal":           {"read_rate": ">60%", "response_rate": ">5%",  "opt_out": "<1%"},
            "Potential_Loyal": {"read_rate": ">55%", "response_rate": ">3%",  "opt_out": "<1.5%"},
            "New":             {"read_rate": ">65%", "response_rate": ">4%",  "opt_out": "<1%"},
            "At_Risk":         {"read_rate": ">40%", "response_rate": ">2%",  "opt_out": "<2%"},
            "Lost":            {"read_rate": ">25%", "response_rate": ">1%",  "opt_out": "<3%"},
        }
        return targets.get(segment, {"read_rate": ">50%", "response_rate": ">3%", "opt_out": "<2%"})
