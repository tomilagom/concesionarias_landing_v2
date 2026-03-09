"""
Marketing recommendation modules: email, WhatsApp, and promotions strategies.
"""

from .engine import RecommendationEngine
from .email_strategy import EmailStrategy
from .whatsapp_strategy import WhatsAppStrategy
from .promotions_strategy import PromotionsStrategy

__all__ = [
    "RecommendationEngine",
    "EmailStrategy",
    "WhatsAppStrategy",
    "PromotionsStrategy",
]
