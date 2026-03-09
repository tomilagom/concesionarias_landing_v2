"""
Cohort retention analysis.

Groups customers by their acquisition month and tracks how many
return in subsequent months — producing a cohort retention matrix.
"""

import logging
from typing import List, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class CohortAnalyzer:
    """
    Build cohort retention tables and identify the strongest acquisition cohorts.

    Args:
        lookback_months: How many months of history to include (default: 12).
    """

    def __init__(self, lookback_months: int = 12) -> None:
        self.lookback_months = lookback_months

    # ------------------------------------------------------------------
    # Cohort table construction
    # ------------------------------------------------------------------

    def build_cohort_table(self, transactions_df: pd.DataFrame) -> pd.DataFrame:
        """
        Construct a cohort retention matrix.

        Each row is an acquisition cohort month; each column is the number
        of cohort months after first purchase (0, 1, 2, …).
        Cell values = number of unique customers who placed at least one order
        in that cohort period.

        Expected input columns (common variants accepted):
            customer_id, order_date / created_at / purchase_date,
            order_id (optional — used for deduplication).

        Args:
            transactions_df: Order-level data (one row per order/transaction).

        Returns:
            DataFrame with cohort_month as index and integer period columns.
            Also attaches ``_cohort_sizes`` attribute with initial cohort counts.
        """
        df = self._normalise(transactions_df)
        if df.empty:
            logger.warning("No data for cohort analysis.")
            return pd.DataFrame()

        # Acquisition month = first order month per customer
        df["order_month"] = df["order_date"].dt.to_period("M")
        first_order = df.groupby("customer_id")["order_date"].min().reset_index()
        first_order["cohort_month"] = first_order["order_date"].dt.to_period("M")

        df = df.merge(first_order[["customer_id", "cohort_month"]], on="customer_id")
        df["cohort_period"] = (
            df["order_month"].astype(int) - df["cohort_month"].astype(int)
        )

        # Limit lookback
        cutoff = df["order_date"].max() - pd.DateOffset(months=self.lookback_months)
        df = df[df["order_date"] >= cutoff]

        # Count unique customers per (cohort_month, cohort_period)
        cohort_pivot = (
            df.groupby(["cohort_month", "cohort_period"])["customer_id"]
            .nunique()
            .reset_index()
        )
        cohort_table = cohort_pivot.pivot_table(
            index="cohort_month",
            columns="cohort_period",
            values="customer_id",
        )
        cohort_table.index = cohort_table.index.astype(str)
        cohort_table.columns = [int(c) for c in cohort_table.columns]
        cohort_table = cohort_table.sort_index()

        # Store raw cohort sizes for retention rate calc
        self._cohort_sizes = cohort_table[0].fillna(0).astype(int)
        logger.info(
            "Cohort table built: %d cohorts x %d periods",
            len(cohort_table),
            len(cohort_table.columns),
        )
        return cohort_table

    # ------------------------------------------------------------------
    # Retention rates
    # ------------------------------------------------------------------

    def calculate_retention_rates(self, cohort_table: pd.DataFrame) -> pd.DataFrame:
        """
        Convert raw cohort counts to percentage retention rates.

        Args:
            cohort_table: Output of ``build_cohort_table``.

        Returns:
            DataFrame of the same shape with values as retention percentages (0-100).
        """
        if cohort_table.empty:
            return pd.DataFrame()

        cohort_sizes = cohort_table[0].fillna(0)
        retention = cohort_table.divide(cohort_sizes, axis=0) * 100
        retention = retention.round(1)
        logger.info("Retention rates computed for %d cohorts", len(retention))
        return retention

    # ------------------------------------------------------------------
    # Best cohorts
    # ------------------------------------------------------------------

    def get_best_cohorts(
        self,
        cohort_table: pd.DataFrame,
        top_n: int = 5,
        evaluation_period: int = 3,
    ) -> pd.DataFrame:
        """
        Identify the top acquisition cohorts by retention after ``evaluation_period`` months.

        Args:
            cohort_table: Output of ``build_cohort_table``.
            top_n: Number of top cohorts to return.
            evaluation_period: Cohort period column used for ranking.

        Returns:
            DataFrame with cohort_month, cohort_size, retention_at_period,
                avg_retention (across all periods).
        """
        if cohort_table.empty:
            return pd.DataFrame()

        retention = self.calculate_retention_rates(cohort_table)
        cohort_sizes = cohort_table[0].fillna(0).astype(int)

        results = []
        for cohort in retention.index:
            row = retention.loc[cohort]
            size = cohort_sizes.get(cohort, 0)
            ret_at_period = row.get(evaluation_period, np.nan)
            avg_ret = row.iloc[1:].mean()  # exclude period 0 (always 100%)
            results.append(
                {
                    "cohort_month": cohort,
                    "cohort_size": size,
                    f"retention_at_month_{evaluation_period}": ret_at_period,
                    "avg_retention_pct": round(avg_ret, 1),
                }
            )

        df = pd.DataFrame(results).dropna(subset=[f"retention_at_month_{evaluation_period}"])
        df = df.sort_values(
            f"retention_at_month_{evaluation_period}", ascending=False
        ).head(top_n)
        return df.reset_index(drop=True)

    def get_average_retention_curve(self, cohort_table: pd.DataFrame) -> pd.Series:
        """
        Compute the average retention rate across all cohorts per period.

        Args:
            cohort_table: Output of ``build_cohort_table``.

        Returns:
            Series indexed by cohort period with mean retention percentage.
        """
        retention = self.calculate_retention_rates(cohort_table)
        return retention.mean(axis=0).round(1)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _normalise(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardise column names in the input DataFrame."""
        df = df.copy()
        for alias in ["created_at", "purchase_date", "date", "transaction_date",
                      "first_purchase_date", "last_purchase_date"]:
            if alias in df.columns and "order_date" not in df.columns:
                df = df.rename(columns={alias: "order_date"})
                break
        if "order_date" not in df.columns:
            raise ValueError(
                "transactions_df must contain an order date column "
                "(order_date / created_at / purchase_date / date)."
            )
        df["order_date"] = pd.to_datetime(df["order_date"])
        return df
