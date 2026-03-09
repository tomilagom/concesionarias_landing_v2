-- =============================================================================
-- customers.sql
-- Customer profile queries: acquisition, order history, spend, recency.
--
-- Placeholders:
--   {project}       -> GCP project ID
--   {dataset}       -> BigQuery dataset ID
--   {table_prefix}  -> Optional table name prefix
-- =============================================================================

WITH customer_orders AS (
    SELECT
        o.customer_id,
        COUNT(DISTINCT o.order_id)              AS total_orders,
        ROUND(SUM(o.total_amount), 2)           AS total_spend,
        ROUND(AVG(o.total_amount), 2)           AS avg_order_value,
        MIN(DATE(o.created_at))                 AS first_order_date,
        MAX(DATE(o.created_at))                 AS last_order_date,
        DATE_DIFF(CURRENT_DATE(), MAX(DATE(o.created_at)), DAY) AS days_since_last_order,
        DATE_DIFF(
            MAX(DATE(o.created_at)),
            MIN(DATE(o.created_at)),
            DAY
        )                                       AS customer_tenure_days
    FROM `{project}.{dataset}.{table_prefix}orders` o
    WHERE o.status NOT IN ('cancelled', 'refunded')
    GROUP BY o.customer_id
),

customer_categories AS (
    -- Top purchased category per customer
    SELECT
        oi.customer_id,
        oi.category                            AS top_category,
        COUNT(*) AS category_orders,
        RANK() OVER (
            PARTITION BY oi.customer_id
            ORDER BY COUNT(*) DESC
        ) AS category_rank
    FROM `{project}.{dataset}.{table_prefix}order_items` oi
    INNER JOIN `{project}.{dataset}.{table_prefix}orders` o
        ON oi.order_id = o.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded')
    GROUP BY oi.customer_id, oi.category
),

top_category AS (
    SELECT customer_id, top_category
    FROM customer_categories
    WHERE category_rank = 1
)

SELECT
    c.customer_id,
    c.email,
    c.phone,
    c.first_name,
    c.last_name,
    c.country,
    c.city,
    c.acquisition_channel,          -- e.g. organic, paid_search, social, referral
    DATE(c.created_at)             AS signup_date,
    DATE_DIFF(CURRENT_DATE(), DATE(c.created_at), DAY) AS account_age_days,
    COALESCE(co.total_orders, 0)   AS total_orders,
    COALESCE(co.total_spend, 0)    AS total_spend,
    COALESCE(co.avg_order_value, 0) AS avg_order_value,
    co.first_order_date,
    co.last_order_date,
    COALESCE(co.days_since_last_order, 9999) AS days_since_last_order,
    COALESCE(co.customer_tenure_days, 0)     AS customer_tenure_days,
    tc.top_category,
    CASE
        WHEN co.total_orders IS NULL     THEN 'never_purchased'
        WHEN co.total_orders = 1         THEN 'one_time_buyer'
        WHEN co.total_orders BETWEEN 2 AND 4 THEN 'occasional_buyer'
        WHEN co.total_orders >= 5        THEN 'frequent_buyer'
    END AS buyer_type
FROM `{project}.{dataset}.{table_prefix}customers` c
LEFT JOIN customer_orders co
    ON c.customer_id = co.customer_id
LEFT JOIN top_category tc
    ON c.customer_id = tc.customer_id
ORDER BY co.total_spend DESC NULLS LAST
