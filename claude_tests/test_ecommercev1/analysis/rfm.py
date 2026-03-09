"""
RFM (Recency, Frequency, Monetary) segmentation.

Scores customers 1-5 on each dimension using quantile-based binning,
then maps score combinations to named business segments.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Default segment definitions
# Each segment maps to (R_min, F_min, M_min, R_max, F_max, M_max) bounds
# and an evaluation order (first match wins).
# ---------------------------------------------------------------------------
DEFAULT_SEGMENT_RULES: List[Tuple[str, Any]] = [
    # (segment_name, condition_fn(r, f, m) -> bool)
    ("Champion",        lambda r, f, m: r >= 4 and f >= 4 and m >= 4),
    ("Loyal",           lambda r, f, m: r >= 3 and f >= 3 and m >= 3),
    ("Potential_Loyal", lambda r, f, m: r >= 3 and f <= 3),
    ("New",             lambda r, f, m: r >= 4 and f == 1),
    ("At_Risk",         lambda r, f, m: r <= 3 and f >= 2 and m >= 2),
    ("Lost",            lambda r, f, m: r <= 2),
    ("Others",          lambda r, f, m: True),   # catch-all
]


class RFMAnalyzer:
    """
    Compute RFM scores and assign named segments.

    Args:
        analysis_date: Reference date for recency calculation (defaults to today).
        segment_rules: Custom segment rules. Each element is a
            (segment_name, condition_fn) tuple where condition_fn takes
            (recency_score, frequency_score, monetary_score) and returns bool.
    """

    def __init__(
        self,
        analysis_date: Optional[pd.Timestamp] = None,
        segment_rules: Optional[List[Tuple[str, Any]]] = None,
    ) -> None:
        self.analysis_date = analysis_date or pd.Timestamp.today().normalize()
        self.segment_rules = segment_rules or DEFAULT_SEGMENT_RULES

    # ------------------------------------------------------------------
    # Core calculation
    # ------------------------------------------------------------------

    def calculate_rfm(self, transactions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute raw R, F, M values and 1-5 scores per customer.

        Expected columns in transactions_df:
            - customer_id
            - last_purchase_date  (date / datetime)
            - total_orders        (int)
            - total_spend         (float)

        If the expected columns are absent but ``order_date`` / ``order_id`` /
        ``amount`` / ``revenue`` columns exist, they will be aggregated
        automatically.

        Args:
            transactions_df: Customer-level or order-level transaction data.

        Returns:
            DataFrame with columns:
                customer_id, recency_days, frequency, monetary,
                R, F, M, rfm_score (concatenated string), rfm_total (sum).
        """
        df = transactions_df.copy()

        # Auto-aggregate if raw order-level data is provided
        if "last_purchase_date" not in df.columns:
            df = self._aggregate_to_customer_level(df)

        # Ensure correct types
        df["last_purchase_date"] = pd.to_datetime(df["last_purchase_date"])
        df["recency_days"] = (self.analysis_date - df["last_purchase_date"]).dt.days
        df["frequency"] = df["total_orders"].astype(int)
        df["monetary"] = df["total_spend"].astype(float)

        # Drop customers with zero or negative monetary value
        before = len(df)
        df = df[df["monetary"] > 0].copy()
        if len(df) < before:
            logger.warning("Dropped %d customers with non-positive spend", before - len(df))

        if df.empty:
            logger.error("No valid customers for RFM after filtering.")
            return pd.DataFrame()

        # Score 1-5 (recency: lower days = higher score)
        df["R"] = self._quantile_score(df["recency_days"], ascending=False)
        df["F"] = self._quantile_score(df["frequency"], ascending=True)
        df["M"] = self._quantile_score(df["monetary"], ascending=True)

        df["rfm_score"] = (
            df["R"].astype(str) + df["F"].astype(str) + df["M"].astype(str)
        )
        df["rfm_total"] = df["R"] + df["F"] + df["M"]

        logger.info("RFM calculated for %d customers", len(df))
        return df.reset_index(drop=True)

    def assign_segments(self, rfm_df: pd.DataFrame) -> pd.DataFrame:
        """
        Map RFM scores to named business segments.

        Args:
            rfm_df: Output of ``calculate_rfm``.

        Returns:
            rfm_df with an additional ``segment`` column.
        """
        df = rfm_df.copy()

        def _segment(row: pd.Series) -> str:
            r, f, m = int(row["R"]), int(row["F"]), int(row["M"])
            for name, cond in self.segment_rules:
                if cond(r, f, m):
                    return name
            return "Others"

        df["segment"] = df.apply(_segment, axis=1)
        segment_counts = df["segment"].value_counts().to_dict()
        logger.info("Segment distribution: %s", segment_counts)
        return df

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------

    def get_segment_summary(self, rfm_df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate key metrics per segment.

        Args:
            rfm_df: Output of ``assign_segments`` (must contain ``segment`` column).

        Returns:
            DataFrame indexed by segment with:
                customer_count, pct_of_total,
                avg_recency_days, avg_frequency, avg_monetary,
                avg_rfm_total, median_monetary, total_revenue.
        """
        if "segment" not in rfm_df.columns:
            rfm_df = self.assign_segments(rfm_df)

        total_customers = len(rfm_df)
        summary = (
            rfm_df.groupby("segment")
            .agg(
                customer_count=("customer_id", "count"),
                avg_recency_days=("recency_days", "mean"),
                avg_frequency=("frequency", "mean"),
                avg_monetary=("monetary", "mean"),
                median_monetary=("monetary", "median"),
                total_revenue=("monetary", "sum"),
                avg_rfm_total=("rfm_total", "mean"),
            )
            .round(2)
        )
        summary["pct_of_total"] = (
            (summary["customer_count"] / total_customers * 100).round(1)
        )
        return summary.sort_values("avg_monetary", ascending=False)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _quantile_score(series: pd.Series, ascending: bool = True) -> pd.Series:
        """
        Bin a numeric series into 5 quantile-based buckets (1-5).

        Args:
            series: Numeric pandas Series.
            ascending: If True, higher values → higher score.
                       If False, lower values → higher score (recency).

        Returns:
            Integer Series with scores 1-5.
        """
        # Use rank to handle ties gracefully
        ranked = series.rank(method="first", ascending=ascending)
        n = len(series)
        labels = [1, 2, 3, 4, 5]
        bins = pd.cut(ranked, bins=5, labels=labels)
        return bins.astype(int)

    @staticmethod
    def _aggregate_to_customer_level(df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate order-level data to customer-level.

        Attempts common column name variants.
        """
        # Detect columns
        date_col = next(
            (c for c in ["order_date", "created_at", "purchase_date", "date"] if c in df.columns),
            None,
        )
        id_col = next(
            (c for c in ["order_id", "transaction_id", "id"] if c in df.columns), None
        )
        amount_col = next(
            (c for c in ["total_amount", "amount", "revenue", "total"] if c in df.columns),
            None,
        )

        if not date_col or not amount_col:
            raise ValueError(
                "Cannot aggregate to customer level: missing date or amount column. "
                f"Available columns: {list(df.columns)}"
            )

        df[date_col] = pd.to_datetime(df[date_col])
        agg_dict: Dict = {
            date_col: ["max", "min"],
            amount_col: ["sum", "mean"],
        }
        if id_col:
            agg_dict[id_col] = "nunique"

        grouped = df.groupby("customer_id").agg(agg_dict)
        grouped.columns = [
            "_".join(c).strip("_") for c in grouped.columns.values
        ]
        grouped = grouped.reset_index()

        # Rename to expected schema
        rename_map = {
            f"{date_col}_max": "last_purchase_date",
            f"{date_col}_min": "first_purchase_date",
            f"{amount_col}_sum": "total_spend",
            f"{amount_col}_mean": "avg_order_value",
        }
        if id_col:
            rename_map[f"{id_col}_nunique"] = "total_orders"
        else:
            grouped["total_orders"] = (
                df.groupby("customer_id").size().values
            )

        grouped = grouped.rename(columns=rename_map)
        return grouped
