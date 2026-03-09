"""
BigQuery client for ecommerce data extraction.

Handles schema discovery, parameterized queries, and typed data retrieval
for transactions, customers, and communication events.
"""

import logging
import os
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

logger = logging.getLogger(__name__)


class BigQueryClient:
    """
    Wrapper around the Google BigQuery client with schema discovery
    and typed data retrieval methods.

    Usage:
        client = BigQueryClient(project_id="my-project", dataset_id="ecommerce")
        df = client.get_transactions("2024-01-01", "2024-12-31")
    """

    def __init__(self, project_id: str, dataset_id: str, location: str = "US") -> None:
        """
        Initialize the BigQuery client.

        Args:
            project_id: GCP project ID.
            dataset_id: BigQuery dataset ID.
            location: Dataset location (default: "US").
        """
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.location = location
        self._client: Optional[Any] = None
        self._queries_dir = Path(__file__).parent.parent / "queries"

    def _get_client(self) -> Any:
        """Lazily initialise the BigQuery client."""
        if self._client is None:
            try:
                from google.cloud import bigquery  # type: ignore

                self._client = bigquery.Client(
                    project=self.project_id,
                    location=self.location,
                )
                logger.info(
                    "BigQuery client initialised for project '%s', dataset '%s'",
                    self.project_id,
                    self.dataset_id,
                )
            except ImportError as exc:
                raise ImportError(
                    "google-cloud-bigquery is not installed. "
                    "Run: pip install google-cloud-bigquery"
                ) from exc
            except Exception as exc:
                logger.error("Failed to initialise BigQuery client: %s", exc)
                raise
        return self._client

    # ------------------------------------------------------------------
    # Schema discovery
    # ------------------------------------------------------------------

    def discover_schema(self, dataset_id: Optional[str] = None) -> pd.DataFrame:
        """
        List all tables and their columns in the given dataset.

        Args:
            dataset_id: Override the default dataset ID.

        Returns:
            DataFrame with columns: table_name, column_name, data_type, is_nullable.
        """
        target_dataset = dataset_id or self.dataset_id
        sql = f"""
            SELECT
                table_name,
                column_name,
                data_type,
                is_nullable
            FROM `{self.project_id}.{target_dataset}.INFORMATION_SCHEMA.COLUMNS`
            ORDER BY table_name, ordinal_position
        """
        logger.info("Discovering schema for dataset '%s'", target_dataset)
        return self.run_query(sql)

    def list_tables(self, dataset_id: Optional[str] = None) -> List[str]:
        """
        Return a list of table names in the dataset.

        Args:
            dataset_id: Override the default dataset ID.

        Returns:
            List of table names.
        """
        target_dataset = dataset_id or self.dataset_id
        sql = f"""
            SELECT table_name
            FROM `{self.project_id}.{target_dataset}.INFORMATION_SCHEMA.TABLES`
            WHERE table_type = 'BASE TABLE'
            ORDER BY table_name
        """
        df = self.run_query(sql)
        return df["table_name"].tolist()

    # ------------------------------------------------------------------
    # Query execution
    # ------------------------------------------------------------------

    def run_query(self, sql: str, params: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
        """
        Execute a SQL query and return the result as a DataFrame.

        Args:
            sql: SQL query string. Use @param_name placeholders for parameters.
            params: Dictionary of query parameters {name: value}.

        Returns:
            Query results as a pandas DataFrame.

        Raises:
            RuntimeError: If the query fails.
        """
        from google.cloud import bigquery  # type: ignore

        client = self._get_client()
        job_config = bigquery.QueryJobConfig()

        if params:
            job_config.query_parameters = [
                self._make_scalar_param(k, v) for k, v in params.items()
            ]

        try:
            logger.debug("Running query:\n%s", sql[:500])
            query_job = client.query(sql, job_config=job_config)
            df = query_job.to_dataframe()
            logger.info("Query returned %d rows", len(df))
            return df
        except Exception as exc:
            logger.error("Query execution failed: %s\nSQL: %s", exc, sql[:300])
            raise RuntimeError(f"BigQuery query failed: {exc}") from exc

    def _make_scalar_param(self, name: str, value: Any) -> Any:
        """Convert a Python value to a BigQuery ScalarQueryParameter."""
        from google.cloud import bigquery  # type: ignore

        if isinstance(value, bool):
            return bigquery.ScalarQueryParameter(name, "BOOL", value)
        if isinstance(value, int):
            return bigquery.ScalarQueryParameter(name, "INT64", value)
        if isinstance(value, float):
            return bigquery.ScalarQueryParameter(name, "FLOAT64", value)
        if isinstance(value, (date, datetime)):
            return bigquery.ScalarQueryParameter(name, "DATE", value)
        return bigquery.ScalarQueryParameter(name, "STRING", str(value))

    def _load_sql(self, filename: str, **substitutions: str) -> str:
        """
        Load a SQL file from the queries directory and apply string substitutions.

        Args:
            filename: SQL filename (e.g. "transactions.sql").
            **substitutions: Key-value pairs to substitute in the SQL template.

        Returns:
            SQL string with substitutions applied.
        """
        sql_path = self._queries_dir / filename
        if not sql_path.exists():
            raise FileNotFoundError(f"SQL file not found: {sql_path}")
        sql = sql_path.read_text(encoding="utf-8")
        substitutions.setdefault("project", self.project_id)
        substitutions.setdefault("dataset", self.dataset_id)
        return sql.format(**substitutions)

    # ------------------------------------------------------------------
    # Typed data retrieval
    # ------------------------------------------------------------------

    def get_transactions(
        self,
        start_date: str,
        end_date: str,
        table_prefix: str = "",
    ) -> pd.DataFrame:
        """
        Fetch order/transaction data for a date range.

        Args:
            start_date: Start date as "YYYY-MM-DD".
            end_date: End date as "YYYY-MM-DD".
            table_prefix: Optional prefix prepended to table names.

        Returns:
            DataFrame with transaction data.
        """
        sql = self._load_sql(
            "transactions.sql",
            table_prefix=table_prefix,
        )
        params = {"start_date": start_date, "end_date": end_date}
        logger.info("Fetching transactions from %s to %s", start_date, end_date)
        return self.run_query(sql, params)

    def get_customers(self, table_prefix: str = "") -> pd.DataFrame:
        """
        Fetch customer profile data.

        Args:
            table_prefix: Optional prefix prepended to table names.

        Returns:
            DataFrame with customer profiles.
        """
        sql = self._load_sql("customers.sql", table_prefix=table_prefix)
        logger.info("Fetching customer profiles")
        return self.run_query(sql)

    def get_communication_events(
        self,
        start_date: str,
        end_date: str,
        table_prefix: str = "",
    ) -> pd.DataFrame:
        """
        Fetch email and WhatsApp communication events.

        Args:
            start_date: Start date as "YYYY-MM-DD".
            end_date: End date as "YYYY-MM-DD".
            table_prefix: Optional prefix prepended to table names.

        Returns:
            DataFrame with communication events.
        """
        sql = self._load_sql(
            "communications.sql",
            table_prefix=table_prefix,
        )
        params = {"start_date": start_date, "end_date": end_date}
        logger.info(
            "Fetching communication events from %s to %s", start_date, end_date
        )
        return self.run_query(sql, params)
