-- =============================================================================
-- transactions.sql
-- Ecommerce transaction queries: revenue, orders, products, repeat purchase.
--
-- Placeholders replaced at runtime:
--   {project}       -> GCP project ID
--   {dataset}       -> BigQuery dataset ID
--   {table_prefix}  -> Optional table name prefix (e.g. "raw_")
--
-- Parameters (@start_date, @end_date) are injected as BigQuery query parameters.
-- =============================================================================

-- Monthly revenue and order summary
WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC(o.created_at, MONTH)                         AS order_month,
        COUNT(DISTINCT o.order_id)                              AS total_orders,
        COUNT(DISTINCT o.customer_id)                           AS unique_customers,
        ROUND(SUM(o.total_amount), 2)                           AS total_revenue,
        ROUND(AVG(o.total_amount), 2)                           AS avg_order_value,
        ROUND(SUM(o.total_amount) / COUNT(DISTINCT o.order_id), 2) AS revenue_per_order
    FROM `{project}.{dataset}.{table_prefix}orders` o
    WHERE
        o.status NOT IN ('cancelled', 'refunded')
        AND DATE(o.created_at) BETWEEN @start_date AND @end_date
    GROUP BY 1
),

-- Repeat purchase stats
customer_order_counts AS (
    SELECT
        customer_id,
        COUNT(DISTINCT order_id) AS order_count,
        MIN(DATE(created_at))    AS first_order_date,
        MAX(DATE(created_at))    AS last_order_date,
        SUM(total_amount)        AS lifetime_value
    FROM `{project}.{dataset}.{table_prefix}orders`
    WHERE
        status NOT IN ('cancelled', 'refunded')
        AND DATE(created_at) BETWEEN @start_date AND @end_date
    GROUP BY customer_id
),

repeat_purchase_rate AS (
    SELECT
        COUNTIF(order_count >= 2) / COUNT(*) * 100 AS repeat_purchase_rate_pct,
        AVG(order_count)                           AS avg_orders_per_customer,
        AVG(lifetime_value)                        AS avg_customer_ltv
    FROM customer_order_counts
),

-- Top products by revenue
top_products AS (
    SELECT
        oi.product_id,
        oi.product_name,
        oi.category,
        COUNT(DISTINCT oi.order_id)   AS units_ordered,
        SUM(oi.quantity)              AS total_units_sold,
        ROUND(SUM(oi.line_total), 2)  AS total_revenue,
        ROUND(AVG(oi.unit_price), 2)  AS avg_unit_price
    FROM `{project}.{dataset}.{table_prefix}order_items` oi
    INNER JOIN `{project}.{dataset}.{table_prefix}orders` o
        ON oi.order_id = o.order_id
    WHERE
        o.status NOT IN ('cancelled', 'refunded')
        AND DATE(o.created_at) BETWEEN @start_date AND @end_date
    GROUP BY 1, 2, 3
    ORDER BY total_revenue DESC
    LIMIT 50
),

-- Revenue by customer (for RFM / CLV inputs)
customer_revenue AS (
    SELECT
        o.customer_id,
        COUNT(DISTINCT o.order_id)              AS order_count,
        ROUND(SUM(o.total_amount), 2)           AS total_spend,
        ROUND(AVG(o.total_amount), 2)           AS avg_order_value,
        DATE(MIN(o.created_at))                 AS first_purchase_date,
        DATE(MAX(o.created_at))                 AS last_purchase_date,
        DATE_DIFF(
            MAX(DATE(o.created_at)),
            MIN(DATE(o.created_at)),
            DAY
        )                                       AS customer_tenure_days,
        DATE_DIFF(
            CURRENT_DATE(),
            MAX(DATE(o.created_at)),
            DAY
        )                                       AS days_since_last_order
    FROM `{project}.{dataset}.{table_prefix}orders` o
    WHERE
        o.status NOT IN ('cancelled', 'refunded')
        AND DATE(o.created_at) BETWEEN @start_date AND @end_date
    GROUP BY o.customer_id
)

-- Final output: customer-level transaction summary (primary RFM/CLV input)
SELECT
    cr.*,
    rpr.repeat_purchase_rate_pct,
    rpr.avg_orders_per_customer,
    rpr.avg_customer_ltv
FROM customer_revenue cr
CROSS JOIN repeat_purchase_rate rpr
ORDER BY cr.total_spend DESC
