"""
Customer Lifetime Value (CLV) analysis.

Provides both historical CLV (actual revenue) and predictive CLV using
the BG/NBD + Gamma-Gamma probabilistic models from the ``lifetimes`` library.
"""

import logging
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class CLVAnalyzer:
    """
    Calculate historical and predicted CLV per customer.

    Args:
        prediction_months: Forecast horizon for future CLV (default: 12).
        penalizer_coef: Regularisation coefficient for lifetimes models (default: 0.01).
        min_transactions: Minimum order count for a customer to be included
                          in the BG/NBD model (default: 1).
    """

    def __init__(
        self,
        prediction_months: int = 12,
        penalizer_coef: float = 0.01,
        min_transactions: int = 1,
    ) -> None:
        self.prediction_months = prediction_months
        self.penalizer_coef = penalizer_coef
        self.min_transactions = min_transactions

    # ------------------------------------------------------------------
    # Historical CLV
    # ------------------------------------------------------------------

    def calculate_historical_clv(self, transactions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute historical CLV as total revenue per customer.

        Expected columns (flexible — common variants accepted):
            customer_id, total_spend OR amount/revenue,
            total_orders OR order_id,
            first_purchase_date, last_purchase_date OR order_date/created_at.

        Args:
            transactions_df: Customer-level or order-level data.

        Returns:
            DataFrame with: customer_id, historical_clv, total_orders,
                avg_order_value, first_purchase_date, last_purchase_date,
                customer_tenure_days.
        """
        df = transactions_df.copy()

        # --- Normalise to customer-level if necessary ---
        if "total_spend" not in df.columns:
            df = self._aggregate_orders(df)

        df["total_spend"] = pd.to_numeric(df["total_spend"], errors="coerce").fillna(0)

        if "first_purchase_date" in df.columns:
            df["first_purchase_date"] = pd.to_datetime(df["first_purchase_date"])
        if "last_purchase_date" in df.columns:
            df["last_purchase_date"] = pd.to_datetime(df["last_purchase_date"])

        if "customer_tenure_days" not in df.columns and all(
            c in df.columns for c in ["first_purchase_date", "last_purchase_date"]
        ):
            df["customer_tenure_days"] = (
                df["last_purchase_date"] - df["first_purchase_date"]
            ).dt.days

        clv_df = df[
            [
                "customer_id",
                "total_spend",
                "total_orders",
                *[c for c in ["avg_order_value", "first_purchase_date",
                               "last_purchase_date", "customer_tenure_days"]
                  if c in df.columns],
            ]
        ].copy()
        clv_df = clv_df.rename(columns={"total_spend": "historical_clv"})

        if "avg_order_value" not in clv_df.columns:
            clv_df["avg_order_value"] = clv_df["historical_clv"] / clv_df["total_orders"].clip(lower=1)

        logger.info("Historical CLV computed for %d customers", len(clv_df))
        return clv_df.reset_index(drop=True)

    # ------------------------------------------------------------------
    # Predictive CLV (BG/NBD + Gamma-Gamma)
    # ------------------------------------------------------------------

    def predict_future_clv(
        self,
        transactions_df: pd.DataFrame,
        months: Optional[int] = None,
    ) -> pd.DataFrame:
        """
        Predict future CLV using BG/NBD (purchase frequency) and
        Gamma-Gamma (monetary value) models.

        The BG/NBD model requires a ``summary`` DataFrame with columns:
            frequency, recency, T, monetary_value
        as produced by ``lifetimes.utils.summary_data_from_transaction_data``.

        Args:
            transactions_df: Raw order-level data (one row per order) with
                customer_id, order_date/created_at, total_amount/amount/revenue.
            months: Forecast horizon in months (defaults to self.prediction_months).

        Returns:
            DataFrame with: customer_id, predicted_purchases, predicted_clv,
                historical_clv (if available), combined_clv.
        """
        horizon = months or self.prediction_months
        try:
            from lifetimes import BetaGeoFitter, GammaGammaFitter  # type: ignore
            from lifetimes.utils import summary_data_from_transaction_data  # type: ignore
        except ImportError:
            logger.warning(
                "lifetimes library not installed. Falling back to heuristic CLV."
            )
            return self._heuristic_future_clv(transactions_df, horizon)

        df = transactions_df.copy()
        # Normalise column names
        df = self._normalise_order_columns(df)

        if df.empty or "order_date" not in df.columns:
            logger.warning("Insufficient data for predictive CLV model.")
            return self._heuristic_future_clv(transactions_df, horizon)

        # Build lifetimes summary table
        try:
            summary = summary_data_from_transaction_data(
                df,
                customer_id_col="customer_id",
                datetime_col="order_date",
                monetary_value_col="amount",
                observation_period_end=df["order_date"].max(),
                freq="D",
            )
        except Exception as exc:
            logger.warning("Could not build lifetimes summary: %s. Using heuristic.", exc)
            return self._heuristic_future_clv(transactions_df, horizon)

        # Filter: minimum transactions
        summary = summary[summary["frequency"] >= self.min_transactions]
        if len(summary) < 10:
            logger.warning(
                "Too few customers (%d) for BG/NBD model. Using heuristic CLV.", len(summary)
            )
            return self._heuristic_future_clv(transactions_df, horizon)

        # Fit BG/NBD
        bgf = BetaGeoFitter(penalizer_coef=self.penalizer_coef)
        try:
            bgf.fit(
                summary["frequency"],
                summary["recency"],
                summary["T"],
            )
        except Exception as exc:
            logger.warning("BG/NBD fitting failed: %s. Using heuristic.", exc)
            return self._heuristic_future_clv(transactions_df, horizon)

        # Fit Gamma-Gamma
        gg_summary = summary[summary["monetary_value"] > 0]
        ggf = GammaGammaFitter(penalizer_coef=self.penalizer_coef)
        try:
            ggf.fit(gg_summary["frequency"], gg_summary["monetary_value"])
        except Exception as exc:
            logger.warning("Gamma-Gamma fitting failed: %s. Using heuristic.", exc)
            return self._heuristic_future_clv(transactions_df, horizon)

        # Predict
        t_days = horizon * 30  # approximate months → days
        predicted_purchases = bgf.conditional_expected_number_of_purchases_up_to_time(
            t_days,
            summary["frequency"],
            summary["recency"],
            summary["T"],
        )
        predicted_clv = ggf.customer_lifetime_value(
            bgf,
            summary["frequency"],
            summary["recency"],
            summary["T"],
            summary["monetary_value"],
            time=horizon,
            freq="D",
            discount_rate=0.01,
        )

        result = pd.DataFrame(
            {
                "customer_id": summary.index,
                "predicted_purchases": predicted_purchases.values,
                "predicted_clv": predicted_clv.values,
            }
        )

        # Merge with historical
        hist = self.calculate_historical_clv(transactions_df)
        result = result.merge(
            hist[["customer_id", "historical_clv"]],
            on="customer_id",
            how="left",
        )
        result["combined_clv"] = result["historical_clv"].fillna(0) + result["predicted_clv"]

        logger.info(
            "Predictive CLV computed for %d customers over %d months",
            len(result),
            horizon,
        )
        return result.reset_index(drop=True)

    # ------------------------------------------------------------------
    # Segment-level CLV
    # ------------------------------------------------------------------

    def calculate_clv_by_segment(
        self,
        clv_df: pd.DataFrame,
        rfm_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Aggregate CLV metrics per RFM segment.

        Args:
            clv_df: Output of ``calculate_historical_clv`` or ``predict_future_clv``.
            rfm_df: Output of ``RFMAnalyzer.assign_segments`` (must have ``segment`` column).

        Returns:
            DataFrame with per-segment CLV statistics.
        """
        if "segment" not in rfm_df.columns:
            raise ValueError("rfm_df must contain a 'segment' column.")

        seg_map = rfm_df.drop_duplicates("customer_id").set_index("customer_id")["segment"]
        merged = clv_df.copy()
        merged["segment"] = merged["customer_id"].map(seg_map)
        merged = merged.dropna(subset=["segment"])

        clv_col = "combined_clv" if "combined_clv" in merged.columns else "historical_clv"

        summary = (
            merged.groupby("segment")
            .agg(
                customer_count=("customer_id", "count"),
                total_clv=(clv_col, "sum"),
                avg_clv=(clv_col, "mean"),
                median_clv=(clv_col, "median"),
                max_clv=(clv_col, "max"),
                min_clv=(clv_col, "min"),
            )
            .round(2)
        )
        summary["clv_share_pct"] = (
            summary["total_clv"] / summary["total_clv"].sum() * 100
        ).round(1)

        return summary.sort_values("avg_clv", ascending=False)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _heuristic_future_clv(
        self, transactions_df: pd.DataFrame, months: int
    ) -> pd.DataFrame:
        """
        Simple heuristic: project future CLV as avg_monthly_spend * months.
        Used as fallback when the lifetimes model is unavailable.
        """
        hist = self.calculate_historical_clv(transactions_df)

        if "customer_tenure_days" in hist.columns:
            tenure_months = (hist["customer_tenure_days"] / 30).clip(lower=1)
        else:
            tenure_months = pd.Series(12, index=hist.index)

        monthly_spend = hist["historical_clv"] / tenure_months
        hist["predicted_purchases"] = (
            hist["total_orders"] / tenure_months * months
        ).round(1)
        hist["predicted_clv"] = (monthly_spend * months).round(2)
        hist["combined_clv"] = hist["historical_clv"] + hist["predicted_clv"]
        return hist

    @staticmethod
    def _normalise_order_columns(df: pd.DataFrame) -> pd.DataFrame:
        """Rename common column variants to standard names."""
        rename = {}
        for alias in ["created_at", "purchase_date", "date", "transaction_date"]:
            if alias in df.columns and "order_date" not in df.columns:
                rename[alias] = "order_date"
        for alias in ["total_amount", "revenue", "price", "order_total"]:
            if alias in df.columns and "amount" not in df.columns:
                rename[alias] = "amount"
        return df.rename(columns=rename)

    @staticmethod
    def _aggregate_orders(df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate raw order rows into customer-level summary."""
        date_col = next(
            (c for c in ["order_date", "created_at", "purchase_date"] if c in df.columns),
            None,
        )
        amount_col = next(
            (c for c in ["amount", "total_amount", "revenue"] if c in df.columns), None
        )
        order_col = next(
            (c for c in ["order_id", "transaction_id"] if c in df.columns), None
        )

        if not amount_col:
            raise ValueError("No amount column found for CLV aggregation.")

        df[date_col] = pd.to_datetime(df[date_col]) if date_col else None

        agg: Dict = {amount_col: ["sum", "mean"]}
        if date_col:
            agg[date_col] = ["min", "max"]
        if order_col:
            agg[order_col] = "nunique"

        grouped = df.groupby("customer_id").agg(agg)
        grouped.columns = ["_".join(c) for c in grouped.columns]
        grouped = grouped.reset_index()

        rename = {f"{amount_col}_sum": "total_spend", f"{amount_col}_mean": "avg_order_value"}
        if date_col:
            rename[f"{date_col}_min"] = "first_purchase_date"
            rename[f"{date_col}_max"] = "last_purchase_date"
        if order_col:
            rename[f"{order_col}_nunique"] = "total_orders"
        else:
            grouped["total_orders"] = df.groupby("customer_id").size().values

        return grouped.rename(columns=rename)
