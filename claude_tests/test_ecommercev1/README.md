# Hyppo Ecommerce Intelligence

Analyzes BigQuery ecommerce data + Customer.io communications to produce **CLV-driven marketing recommendations** across Email, WhatsApp, and Promotions.

## Quick Start (Demo Mode — no credentials needed)

```bash
cd claude_tests/test_ecommercev1
pip install -r requirements.txt
python main.py --demo
```

This generates 500 synthetic customers, runs full analysis, and saves reports to `outputs/`.

## Live Mode (BigQuery)

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   BIGQUERY_PROJECT_ID=your-project
   BIGQUERY_DATASET_ID=your_dataset
   ```
2. Edit `config.yaml` to match your table names.
3. Run:
   ```bash
   python main.py
   ```

## Architecture

```
main.py                     ← Orchestrator (entry point)
├── data/
│   ├── bigquery_client.py  ← BigQuery connector + schema discovery
│   └── customerio_client.py← Customer.io API connector
├── queries/                ← SQL templates for BigQuery
├── analysis/
│   ├── rfm.py              ← RFM segmentation (R/F/M scores 1-5)
│   ├── clv.py              ← Historical + predicted CLV (BG/NBD model)
│   ├── cohort.py           ← Monthly cohort retention matrix
│   └── engagement.py       ← Email & WhatsApp engagement metrics
├── recommendations/
│   ├── engine.py           ← Orchestrates all strategies
│   ├── email_strategy.py   ← Per-segment email playbooks
│   ├── whatsapp_strategy.py← Per-segment WhatsApp playbooks
│   └── promotions_strategy.py ← Discount framework + ROI estimates
└── reports/
    └── generator.py        ← Markdown + JSON report builder
```

## Customer Segments

| Segment | Description | Key Action |
|---|---|---|
| **Champion** | High R+F+M | Protect, upsell, referral |
| **Loyal** | Consistent buyers | Cross-sell, loyalty rewards |
| **Potential Loyal** | Recent, growing | Second-purchase incentive |
| **New** | First-time buyers | Welcome series (5 emails) |
| **At Risk** | Slipping away | Win-back sequence (urgent) |
| **Lost** | Churned | Reactivation offer (30%) |

## Outputs

Reports are saved to `outputs/`:
- `report_<timestamp>.md` — Full human-readable report with all recommendations
- `report_<timestamp>.json` — Structured data for downstream integrations

## CLI Options

```
python main.py --demo              # synthetic data, no credentials
python main.py --demo --customers 1000   # larger dataset
python main.py --no-report         # skip saving files
python main.py --config path/to/config.yaml
```
