"""
Channel engagement analysis for email and WhatsApp.

Computes open rates, CTR, read rates, best sending times,
and per-customer channel preference.
"""

import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Day-of-week label mapping (Python weekday: 0=Mon, 6=Sun)
_DOW_LABELS = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}


class EngagementAnalyzer:
    """
    Analyse email and WhatsApp communication performance.

    All methods accept DataFrames derived from the BigQuery ``communications.sql``
    query or equivalent data with compatible column schemas.
    """

    # ------------------------------------------------------------------
    # Email performance
    # ------------------------------------------------------------------

    def analyze_email_performance(
        self, email_events_df: pd.DataFrame
    ) -> Dict[str, pd.DataFrame]:
        """
        Compute email KPIs by campaign type and overall.

        Expected columns: customer_id, campaign_id, campaign_name,
            campaign_type, event_type (sent/delivered/opened/clicked/
            unsubscribed/bounced), event_timestamp.

        Args:
            email_events_df: Raw email event rows.

        Returns:
            Dict with keys:
                - "overall": single-row summary DataFrame
                - "by_campaign_type": per-campaign-type metrics
                - "by_campaign": per-campaign metrics
        """
        df = self._ensure_timestamp(email_events_df, "event_timestamp")
        if df.empty:
            return {"overall": pd.DataFrame(), "by_campaign_type": pd.DataFrame(), "by_campaign": pd.DataFrame()}
        df = self._normalize_email_schema(df)

        def _metrics(group: pd.DataFrame) -> pd.Series:
            delivered = (group["event_type"] == "delivered").sum()
            return pd.Series(
                {
                    "sent": (group["event_type"] == "sent").sum(),
                    "delivered": delivered,
                    "opened": (group["event_type"] == "opened").sum(),
                    "clicked": (group["event_type"] == "clicked").sum(),
                    "unsubscribed": (group["event_type"] == "unsubscribed").sum(),
                    "bounced": (group["event_type"] == "bounced").sum(),
                    "open_rate_pct": self._pct(
                        (group["event_type"] == "opened").sum(), delivered
                    ),
                    "ctr_pct": self._pct(
                        (group["event_type"] == "clicked").sum(), delivered
                    ),
                    "unsubscribe_rate_pct": self._pct(
                        (group["event_type"] == "unsubscribed").sum(), delivered
                    ),
                    "bounce_rate_pct": self._pct(
                        (group["event_type"] == "bounced").sum(),
                        (group["event_type"] == "sent").sum(),
                    ),
                }
            )

        overall = _metrics(df).to_frame().T
        by_type = df.groupby("campaign_type").apply(_metrics).reset_index() if "campaign_type" in df.columns else pd.DataFrame()
        by_camp = df.groupby(["campaign_id", "campaign_name"]).apply(_metrics).reset_index() if "campaign_id" in df.columns else pd.DataFrame()

        logger.info(
            "Email analysis: %.1f%% open rate, %.1f%% CTR overall",
            float(overall["open_rate_pct"].iloc[0]),
            float(overall["ctr_pct"].iloc[0]),
        )
        return {
            "overall": overall,
            "by_campaign_type": by_type.round(2),
            "by_campaign": by_camp.round(2),
        }

    # ------------------------------------------------------------------
    # WhatsApp performance
    # ------------------------------------------------------------------

    def analyze_whatsapp_performance(
        self, wa_events_df: pd.DataFrame
    ) -> Dict[str, pd.DataFrame]:
        """
        Compute WhatsApp KPIs by message type.

        Expected columns: customer_id, campaign_id, campaign_name,
            message_type (transactional/promotional/cart_recovery),
            event_type (sent/delivered/read/replied/opted_out), event_timestamp.

        Args:
            wa_events_df: Raw WhatsApp event rows.

        Returns:
            Dict with keys: "overall", "by_message_type".
        """
        df = self._ensure_timestamp(wa_events_df, "event_timestamp")
        if df.empty:
            return {"overall": pd.DataFrame(), "by_message_type": pd.DataFrame()}
        df = self._normalize_wa_schema(df)

        def _wa_metrics(group: pd.DataFrame) -> pd.Series:
            delivered = (group["event_type"] == "delivered").sum()
            return pd.Series(
                {
                    "sent": (group["event_type"] == "sent").sum(),
                    "delivered": delivered,
                    "read": (group["event_type"] == "read").sum(),
                    "replied": (group["event_type"] == "replied").sum(),
                    "opted_out": (group["event_type"] == "opted_out").sum(),
                    "read_rate_pct": self._pct(
                        (group["event_type"] == "read").sum(), delivered
                    ),
                    "response_rate_pct": self._pct(
                        (group["event_type"] == "replied").sum(), delivered
                    ),
                    "opt_out_rate_pct": self._pct(
                        (group["event_type"] == "opted_out").sum(), delivered
                    ),
                }
            )

        overall = _wa_metrics(df).to_frame().T
        by_type = (
            df.groupby("message_type").apply(_wa_metrics).reset_index()
            if "message_type" in df.columns
            else pd.DataFrame()
        )

        logger.info(
            "WhatsApp analysis: %.1f%% read rate, %.1f%% response rate",
            float(overall["read_rate_pct"].iloc[0]),
            float(overall["response_rate_pct"].iloc[0]),
        )
        return {"overall": overall, "by_message_type": by_type.round(2)}

    # ------------------------------------------------------------------
    # Best send times
    # ------------------------------------------------------------------

    def find_best_send_times(
        self, events_df: pd.DataFrame, event_type_filter: str = "opened"
    ) -> pd.DataFrame:
        """
        Identify hours and days with the highest engagement.

        Args:
            events_df: Combined email or WhatsApp event data with event_timestamp.
            event_type_filter: Which event type to base rankings on
                               (default: "opened"; use "read" for WhatsApp).

        Returns:
            DataFrame with: hour, day_of_week, event_count, rank.
            Sorted by event_count descending.
        """
        df = self._ensure_timestamp(events_df, "event_timestamp")
        if "event_type" in df.columns:
            df = df[df["event_type"] == event_type_filter].copy()
        else:
            # Demo data uses boolean 'opened'/'read' columns instead of event_type
            df = df.copy()
        if df.empty:
            logger.warning("No '%s' events found for send-time analysis.", event_type_filter)
            return pd.DataFrame()

        df["hour"] = df["event_timestamp"].dt.hour
        df["dow"] = df["event_timestamp"].dt.dayofweek  # 0=Mon

        grouped = (
            df.groupby(["hour", "dow"])
            .size()
            .reset_index(name="event_count")
        )
        grouped["day_name"] = grouped["dow"].map(_DOW_LABELS)
        grouped["rank"] = grouped["event_count"].rank(ascending=False, method="first").astype(int)
        return grouped.sort_values("rank").reset_index(drop=True)

    # ------------------------------------------------------------------
    # Channel preference
    # ------------------------------------------------------------------

    def identify_channel_preference(
        self, customer_events_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Classify each customer as preferring email, WhatsApp, or both/neither.

        Expected columns (the output of the BigQuery communications.sql query):
            customer_id, email_open_rate_pct, wa_read_rate_pct,
            email_unsubscribed (0/1), wa_opted_out (0/1).

        Args:
            customer_events_df: Per-customer engagement summary.

        Returns:
            DataFrame with: customer_id, channel_preference, email_score,
                wa_score.
        """
        df = customer_events_df.copy()

        # Normalise column names coming from BigQuery output
        col_renames = {
            "email_open_rate_pct": "email_score",
            "personal_open_rate_pct": "email_score",
            "wa_read_rate_pct": "wa_score",
            "personal_read_rate_pct": "wa_score",
        }
        df = df.rename(columns={k: v for k, v in col_renames.items() if k in df.columns})

        if "email_score" not in df.columns:
            df["email_score"] = 0.0
        if "wa_score" not in df.columns:
            df["wa_score"] = 0.0

        # Penalise opt-outs
        if "email_unsubscribed" in df.columns:
            df.loc[df["email_unsubscribed"] > 0, "email_score"] = -1.0
        if "wa_opted_out" in df.columns:
            df.loc[df["wa_opted_out"] > 0, "wa_score"] = -1.0

        def _preference(row: pd.Series) -> str:
            e, w = row["email_score"], row["wa_score"]
            if e < 0 and w < 0:
                return "none"
            if e < 0:
                return "whatsapp"
            if w < 0:
                return "email"
            if e > 0 and w > 0:
                return "both" if abs(e - w) < 10 else ("email" if e > w else "whatsapp")
            if e > 0:
                return "email"
            if w > 0:
                return "whatsapp"
            return "unknown"

        df["channel_preference"] = df.apply(_preference, axis=1)
        counts = df["channel_preference"].value_counts().to_dict()
        logger.info("Channel preference distribution: %s", counts)
        return df[["customer_id", "email_score", "wa_score", "channel_preference"]]

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _ensure_timestamp(df: pd.DataFrame, col: str) -> pd.DataFrame:
        """Parse timestamp column if present; return empty DataFrame if missing."""
        if df.empty:
            return pd.DataFrame()
        # Support 'sent_at' as an alias for event_timestamp (demo data)
        if col not in df.columns and "sent_at" in df.columns:
            df = df.copy()
            df[col] = df["sent_at"]
        if col not in df.columns:
            return pd.DataFrame()
        df = df.copy()
        df[col] = pd.to_datetime(df[col], errors="coerce")
        df = df.dropna(subset=[col])
        return df

    @staticmethod
    def _normalize_email_schema(df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert boolean-column email data (demo format) to event_type row format.
        If event_type column already exists, returns df unchanged.
        """
        if df.empty or "event_type" in df.columns:
            return df
        # Demo schema has boolean columns: opened, clicked, converted, unsubscribed
        records = []
        for _, row in df.iterrows():
            base = {
                "customer_id": row.get("customer_id"),
                "campaign_type": row.get("campaign_type", "unknown"),
                "event_timestamp": row.get("event_timestamp", row.get("sent_at")),
                "hour_of_day": row.get("hour_of_day"),
                "day_of_week": row.get("day_of_week"),
            }
            records.append({**base, "event_type": "sent"})
            if row.get("opened"):
                records.append({**base, "event_type": "opened"})
                records.append({**base, "event_type": "delivered"})
            else:
                records.append({**base, "event_type": "delivered"})
            if row.get("clicked"):
                records.append({**base, "event_type": "clicked"})
            if row.get("unsubscribed"):
                records.append({**base, "event_type": "unsubscribed"})
        return pd.DataFrame(records)

    @staticmethod
    def _normalize_wa_schema(df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert boolean-column WhatsApp data (demo format) to event_type row format.
        If event_type column already exists, returns df unchanged.
        """
        if df.empty or "event_type" in df.columns:
            return df
        records = []
        for _, row in df.iterrows():
            base = {
                "customer_id": row.get("customer_id"),
                "message_type": row.get("message_type", "unknown"),
                "event_timestamp": row.get("event_timestamp", row.get("sent_at")),
                "hour_of_day": row.get("hour_of_day"),
                "day_of_week": row.get("day_of_week"),
            }
            records.append({**base, "event_type": "sent"})
            if row.get("delivered"):
                records.append({**base, "event_type": "delivered"})
            if row.get("read"):
                records.append({**base, "event_type": "read"})
            if row.get("opted_out"):
                records.append({**base, "event_type": "opted_out"})
        return pd.DataFrame(records)

    @staticmethod
    def _pct(numerator: float, denominator: float) -> float:
        if not denominator:
            return 0.0
        return round(numerator / denominator * 100, 2)
