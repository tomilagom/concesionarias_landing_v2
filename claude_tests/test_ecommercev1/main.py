"""
Ecommerce CLV & Marketing Intelligence — Main Orchestrator

Usage:
    python main.py               # live mode (requires BigQuery credentials)
    python main.py --demo        # demo mode with synthetic data (no credentials needed)
    python main.py --demo --no-report   # skip saving files
"""

import argparse
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

import numpy as np
import pandas as pd
import yaml
from dotenv import load_dotenv

# ── Local modules ─────────────────────────────────────────────────────────────
from analysis.rfm import RFMAnalyzer
from analysis.clv import CLVAnalyzer
from analysis.cohort import CohortAnalyzer
from analysis.engagement import EngagementAnalyzer
from recommendations.engine import RecommendationEngine
from reports.generator import ReportGenerator

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("main")


# ══════════════════════════════════════════════════════════════════════════════
# Config helpers
# ══════════════════════════════════════════════════════════════════════════════

def load_config(path: str = "config.yaml") -> Dict[str, Any]:
    with open(path, "r") as f:
        cfg = yaml.safe_load(f)
    # Allow env vars to override
    if os.getenv("BIGQUERY_PROJECT_ID"):
        cfg["bigquery"]["project_id"] = os.environ["BIGQUERY_PROJECT_ID"]
    if os.getenv("BIGQUERY_DATASET_ID"):
        cfg["bigquery"]["dataset_id"] = os.environ["BIGQUERY_DATASET_ID"]
    return cfg


# ══════════════════════════════════════════════════════════════════════════════
# Demo data generator
# ══════════════════════════════════════════════════════════════════════════════

def generate_demo_data(
    n_customers: int = 500,
    n_orders: int = 1800,
    seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Generate synthetic but realistic ecommerce data for demo mode.

    Returns:
        (transactions_df, email_events_df, whatsapp_events_df)
    """
    rng = np.random.default_rng(seed)

    logger.info("Generating demo data: %d customers, ~%d orders …", n_customers, n_orders)

    # ── Customers ─────────────────────────────────────────────────────────────
    customer_ids = [f"C{i:05d}" for i in range(1, n_customers + 1)]
    acquisition_dates = pd.to_datetime(
        datetime.now() - pd.to_timedelta(rng.integers(30, 730, n_customers), unit="D")
    )

    # ── Orders ────────────────────────────────────────────────────────────────
    # Assign order counts per customer — power law distribution
    order_counts = rng.integers(1, 12, n_customers)
    order_counts = np.clip(order_counts, 1, 20)

    records = []
    for i, cid in enumerate(customer_ids):
        n = int(order_counts[i])
        acq = acquisition_dates[i]
        for _ in range(n):
            days_after = rng.integers(0, (datetime.now() - acq).days + 1)
            order_date = acq + timedelta(days=int(days_after))
            order_value = float(rng.lognormal(mean=4.2, sigma=0.8))  # ~$67 avg
            order_value = round(max(10.0, min(order_value, 2000.0)), 2)
            records.append({
                "customer_id": cid,
                "order_id": f"O{len(records):06d}",
                "order_date": order_date,
                "revenue": order_value,
            })

    transactions_df = pd.DataFrame(records)
    transactions_df["order_date"] = pd.to_datetime(transactions_df["order_date"])
    logger.info("  → %d transactions generated", len(transactions_df))

    # ── Email events ──────────────────────────────────────────────────────────
    email_records = []
    campaign_types = ["newsletter", "promotion", "win_back", "welcome", "upsell"]
    for cid in customer_ids:
        n_emails = rng.integers(3, 30)
        for _ in range(n_emails):
            sent_date = datetime.now() - timedelta(days=int(rng.integers(1, 180)))
            opened = rng.random() < 0.28   # 28% open rate
            clicked = opened and (rng.random() < 0.20)
            converted = clicked and (rng.random() < 0.10)
            email_records.append({
                "customer_id": cid,
                "event_type": "sent",
                "campaign_type": rng.choice(campaign_types),
                "sent_at": sent_date,
                "opened": int(opened),
                "clicked": int(clicked),
                "converted": int(converted),
                "unsubscribed": int(not opened and rng.random() < 0.005),
                "hour_of_day": rng.integers(7, 22),
                "day_of_week": rng.integers(0, 7),
            })

    email_events_df = pd.DataFrame(email_records)
    email_events_df["sent_at"] = pd.to_datetime(email_events_df["sent_at"])
    logger.info("  → %d email events generated", len(email_events_df))

    # ── WhatsApp events ───────────────────────────────────────────────────────
    wa_records = []
    wa_types = ["order_confirm", "shipping_update", "cart_abandonment", "promotion", "win_back"]
    opted_in_customers = rng.choice(customer_ids, size=int(n_customers * 0.55), replace=False)
    for cid in opted_in_customers:
        n_wa = rng.integers(1, 10)
        for _ in range(n_wa):
            sent_date = datetime.now() - timedelta(days=int(rng.integers(1, 90)))
            delivered = rng.random() < 0.95
            read = delivered and (rng.random() < 0.72)
            wa_records.append({
                "customer_id": cid,
                "message_type": rng.choice(wa_types),
                "sent_at": sent_date,
                "delivered": int(delivered),
                "read": int(read),
                "opted_out": int(rng.random() < 0.02),
                "hour_of_day": rng.integers(9, 21),
                "day_of_week": rng.integers(0, 7),
            })

    whatsapp_events_df = pd.DataFrame(wa_records)
    whatsapp_events_df["sent_at"] = pd.to_datetime(whatsapp_events_df["sent_at"])
    logger.info("  → %d WhatsApp events generated", len(whatsapp_events_df))

    return transactions_df, email_events_df, whatsapp_events_df


# ══════════════════════════════════════════════════════════════════════════════
# Live BigQuery fetch
# ══════════════════════════════════════════════════════════════════════════════

def fetch_live_data(cfg: Dict, client_name: Optional[str] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Fetch data from BigQuery (requires credentials).

    If client_name is provided, uses the per-client config from cfg['clients'][client_name]
    and loads SQL from that client's queries_dir. Otherwise uses the generic cfg['bigquery'].
    """
    from google.cloud import bigquery as bq_lib
    from pathlib import Path

    # Resolve config for this client
    if client_name:
        client_cfg = cfg.get("clients", {}).get(client_name)
        if not client_cfg:
            raise ValueError(f"Client '{client_name}' not found in config.yaml under 'clients:'")
        project_id = client_cfg["project_id"]
        dataset_id = client_cfg["dataset_id"]
        location   = client_cfg.get("location", "US")
        queries_dir = Path(client_cfg["queries_dir"])
        logger.info("Using client config: %s (dataset=%s)", client_name, dataset_id)
    else:
        project_id  = cfg["bigquery"]["project_id"]
        dataset_id  = cfg["bigquery"]["dataset_id"]
        location    = cfg["bigquery"].get("location", "US")
        queries_dir = Path("queries")

    bq_client = bq_lib.Client(project=project_id)

    def run_sql_file(filename: str) -> pd.DataFrame:
        sql_path = queries_dir / filename
        if not sql_path.exists():
            logger.warning("SQL file not found: %s — skipping.", sql_path)
            return pd.DataFrame()
        sql = sql_path.read_text(encoding="utf-8")
        logger.info("Running %s …", sql_path)
        return bq_client.query(sql).to_dataframe()

    transactions_df    = run_sql_file("transactions.sql")
    email_events_df    = run_sql_file("communications.sql")
    whatsapp_events_df = pd.DataFrame()  # no WA for this client

    logger.info("Fetched: %d transaction rows, %d email rows",
                len(transactions_df), len(email_events_df))
    return transactions_df, email_events_df, whatsapp_events_df


# ══════════════════════════════════════════════════════════════════════════════
# Analysis pipeline
# ══════════════════════════════════════════════════════════════════════════════

def run_analysis(
    transactions_df: pd.DataFrame,
    email_events_df: pd.DataFrame,
    whatsapp_events_df: pd.DataFrame,
    cfg: Dict,
) -> Dict[str, Any]:
    """Run full analysis pipeline. Returns dict of all analysis outputs."""

    results: Dict[str, Any] = {}

    # ── RFM ──────────────────────────────────────────────────────────────────
    logger.info("Running RFM segmentation …")
    rfm_analyzer = RFMAnalyzer()
    rfm_df = rfm_analyzer.calculate_rfm(transactions_df)
    rfm_df = rfm_analyzer.assign_segments(rfm_df)
    segment_summary = rfm_analyzer.get_segment_summary(rfm_df)
    results["rfm_df"] = rfm_df
    results["segment_summary"] = segment_summary
    logger.info("RFM complete. Segments found: %s", rfm_df["segment"].value_counts().to_dict())

    # ── CLV ───────────────────────────────────────────────────────────────────
    logger.info("Calculating Customer Lifetime Value …")
    clv_analyzer = CLVAnalyzer(
        prediction_months=cfg["analysis"]["clv_prediction_months"]
    )
    clv_df = clv_analyzer.calculate_historical_clv(transactions_df)
    try:
        clv_df = clv_analyzer.predict_future_clv(transactions_df)
    except Exception as e:
        logger.warning("CLV prediction model skipped (%s) — using historical CLV.", e)
    clv_by_segment = clv_analyzer.calculate_clv_by_segment(clv_df, rfm_df)
    results["clv_df"] = clv_df
    results["clv_by_segment"] = clv_by_segment
    logger.info("CLV complete. Avg CLV: $%.0f", clv_df.filter(like="clv").iloc[:, -1].mean())

    # ── Cohort ────────────────────────────────────────────────────────────────
    logger.info("Building cohort retention table …")
    cohort_analyzer = CohortAnalyzer()
    try:
        cohort_table = cohort_analyzer.build_cohort_table(transactions_df)
        retention_rates = cohort_analyzer.calculate_retention_rates(cohort_table)
        results["cohort_table"] = cohort_table
        results["retention_rates"] = retention_rates
        logger.info("Cohort table built: %d cohorts.", len(cohort_table))
    except Exception as e:
        logger.warning("Cohort analysis skipped: %s", e)
        results["cohort_table"] = pd.DataFrame()

    # ── Engagement ────────────────────────────────────────────────────────────
    logger.info("Analysing channel engagement …")
    eng_analyzer = EngagementAnalyzer()

    # Normalize timestamp column name (demo uses 'sent_at', BigQuery may use 'event_timestamp')
    def _normalize_ts(df: pd.DataFrame) -> pd.DataFrame:
        if not df.empty and "sent_at" in df.columns and "event_timestamp" not in df.columns:
            return df.rename(columns={"sent_at": "event_timestamp"})
        return df

    email_events_norm = _normalize_ts(email_events_df)
    wa_events_norm = _normalize_ts(whatsapp_events_df)

    email_perf = eng_analyzer.analyze_email_performance(email_events_norm) if not email_events_norm.empty else {}
    wa_perf = eng_analyzer.analyze_whatsapp_performance(wa_events_norm) if not wa_events_norm.empty else {}
    best_times = eng_analyzer.find_best_send_times(email_events_norm) if not email_events_norm.empty else {}

    # Build engagement_df — supports both raw event rows (demo) and
    # pre-aggregated per-customer rows (live BigQuery queries)
    engagement_df = pd.DataFrame()
    if not email_events_df.empty:
        if "email_open_rate_pct" in email_events_df.columns:
            # Already aggregated (live BigQuery output)
            engagement_df = email_events_df.copy()
        else:
            # Raw event rows (demo data) — aggregate
            email_agg = (
                email_events_df.groupby("customer_id")
                .agg(
                    email_sent=("customer_id", "count"),
                    email_opens=("opened", "sum"),
                    email_clicks=("clicked", "sum"),
                    email_unsubscribed=("unsubscribed", "sum"),
                )
                .reset_index()
            )
            email_agg["email_open_rate_pct"] = (
                email_agg["email_opens"] / email_agg["email_sent"] * 100
            )
            engagement_df = email_agg

    if not whatsapp_events_df.empty:
        wa_agg = (
            whatsapp_events_df.groupby("customer_id")
            .agg(
                wa_sent=("customer_id", "count"),
                wa_delivered=("delivered", "sum"),
                wa_read=("read", "sum"),
                wa_opted_out=("opted_out", "sum"),
            )
            .reset_index()
        )
        wa_agg["wa_read_rate_pct"] = wa_agg["wa_read"] / wa_agg["wa_sent"] * 100
        if not engagement_df.empty:
            engagement_df = engagement_df.merge(wa_agg, on="customer_id", how="outer")
        else:
            engagement_df = wa_agg

    # Attach segment labels
    if not engagement_df.empty and "segment" in rfm_df.columns:
        engagement_df = engagement_df.merge(
            rfm_df[["customer_id", "segment"]], on="customer_id", how="left"
        )

    results["engagement_df"] = engagement_df
    results["email_performance"] = email_perf
    results["wa_performance"] = wa_perf
    results["best_send_times"] = best_times

    return results


# ══════════════════════════════════════════════════════════════════════════════
# Print helpers
# ══════════════════════════════════════════════════════════════════════════════

def print_executive_summary(recommendations: Dict[str, Any]) -> None:
    print("\n" + "═" * 70)
    print("  EXECUTIVE SUMMARY")
    print("═" * 70)
    for bullet in recommendations.get("executive_summary", []):
        print(f"  • {bullet}")

    print("\n  SEGMENT PRIORITIES (by CLV opportunity):")
    print("  " + "-" * 60)
    for p in recommendations.get("segment_priorities", []):
        urgency = {"high": "[URGENT]", "medium": "[GROWTH]", "normal": "[STABLE]"}.get(
            p.get("urgency", "normal"), ""
        )
        print(
            f"  {urgency:10s}  {p['segment']:18s}  "
            f"{p['customer_count']:5,} customers  "
            f"CLV: ${p['total_clv']:>10,.0f}"
        )
    print("═" * 70 + "\n")


# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    parser = argparse.ArgumentParser(description="Ecommerce CLV & Marketing Intelligence")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run with synthetic demo data (no BigQuery credentials required)",
    )
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Skip saving report files",
    )
    parser.add_argument(
        "--customers",
        type=int,
        default=500,
        help="Number of synthetic customers in demo mode (default: 500)",
    )
    parser.add_argument(
        "--config",
        default="config.yaml",
        help="Path to config.yaml (default: config.yaml)",
    )
    parser.add_argument(
        "--client",
        default=None,
        help="Client name from config.yaml (e.g. oliovita, puraypunto, lure)",
    )
    args = parser.parse_args()

    load_dotenv()
    cfg = load_config(args.config)

    client_label = f" | Client: {args.client.upper()}" if args.client else ""
    mode = "demo" if args.demo else "live"
    logger.info("Starting Hyppo Ecommerce Intelligence [mode=%s, client=%s]", mode, args.client or "generic")
    print(f"\n{'─'*70}")
    print(f"  Hyppo Ecommerce Intelligence  |  Mode: {mode.upper()}{client_label}")
    print(f"{'─'*70}\n")

    # ── Fetch data ─────────────────────────────────────────────────────────────
    if args.demo:
        transactions_df, email_events_df, whatsapp_events_df = generate_demo_data(
            n_customers=args.customers
        )
    else:
        try:
            transactions_df, email_events_df, whatsapp_events_df = fetch_live_data(
                cfg, client_name=args.client
            )
        except Exception as e:
            logger.error("Failed to fetch live data: %s", e)
            logger.error("Tip: run with --demo to use synthetic data instead.")
            sys.exit(1)

    # ── Run analysis ───────────────────────────────────────────────────────────
    analysis_results = run_analysis(
        transactions_df, email_events_df, whatsapp_events_df, cfg
    )

    rfm_df = analysis_results["rfm_df"]
    clv_df = analysis_results["clv_df"]
    cohort_table = analysis_results.get("cohort_table", pd.DataFrame())
    engagement_df = analysis_results.get("engagement_df", pd.DataFrame())

    # ── Generate recommendations ───────────────────────────────────────────────
    logger.info("Generating marketing recommendations …")
    engine = RecommendationEngine()
    recommendations = engine.generate_all(
        rfm_df=rfm_df,
        clv_df=clv_df,
        cohort_df=cohort_table if not cohort_table.empty else None,
        engagement_df=engagement_df if not engagement_df.empty else None,
    )

    # ── Print summary to terminal ──────────────────────────────────────────────
    print_executive_summary(recommendations)

    # ── Save reports ───────────────────────────────────────────────────────────
    if not args.no_report:
        output_dir = cfg.get("outputs", {}).get("directory", "outputs")
        reporter = ReportGenerator(output_dir=output_dir)
        paths = reporter.generate_full_report(
            rfm_df=rfm_df,
            clv_df=clv_df,
            recommendations=recommendations,
            cohort_df=cohort_table if not cohort_table.empty else None,
            engagement_df=engagement_df if not engagement_df.empty else None,
            mode=mode,
        )
        print("\nReports saved:")
        for fmt, path in paths.items():
            print(f"  {fmt:10s} → {path}")
        print()

    logger.info("Done.")


if __name__ == "__main__":
    main()
