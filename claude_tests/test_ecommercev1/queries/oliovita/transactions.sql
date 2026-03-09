-- =============================================================================
-- oliovita/transactions.sql
-- Uses oliovita_rfm (pre-aggregated) joined with shopify_order for dates.
-- Outputs the customer-level format expected by RFMAnalyzer.calculate_rfm().
--
-- Required output columns:
--   customer_id, last_purchase_date, total_orders, total_spend,
--   avg_order_value, first_purchase_date, days_since_last_order
-- =============================================================================

SELECT
    r.customer_id,
    r.email,
    r.first_name,
    r.last_name,
    r.segment                               AS existing_segment,
    r.q_orders                              AS total_orders,
    r.net_total_value                       AS total_spend,
    r.avg_net_total_value                   AS avg_order_value,
    CAST(r.first_order_date AS DATE)        AS first_purchase_date,
    CAST(r.last_order_date  AS DATE)        AS last_purchase_date,
    r.time_since_last_order                 AS days_since_last_order,
    r.days_from_first_to_last_order         AS customer_tenure_days,
    r.phone,
    r.formatted_phone
FROM `vx-operation.oliovita.oliovita_rfm` r
WHERE
    r.q_orders > 0
    AND r.net_total_value > 0
    AND r.last_order_date IS NOT NULL
ORDER BY r.net_total_value DESC
