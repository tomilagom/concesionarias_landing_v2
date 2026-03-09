-- =============================================================================
-- oliovita/communications.sql
-- Builds per-customer email engagement from cio_deliveries_metrics.
--
-- Notes:
--   - metric column is ARRAY<STRING> → unnested into individual event rows
--   - recipient is email address → joined with shopify_customer to get customer_id
--   - delivery_type filtered to 'email' only
--
-- Output columns (per customer):
--   customer_id, email, email_sent, email_opens, email_clicks,
--   email_unsubscribed, email_bounced, email_open_rate_pct,
--   email_ctr_pct, last_email_open
-- =============================================================================

WITH

-- Unnest metric arrays into individual event rows
email_events AS (
    SELECT
        d.recipient                                             AS email,
        d.campaign_id,
        d.campaign_name,
        d.delivery_id,
        d.created_at                                           AS event_timestamp,
        m                                                      AS event_type,
        EXTRACT(HOUR FROM d.created_at)                        AS event_hour,
        EXTRACT(DAYOFWEEK FROM d.created_at)                   AS event_dow
    FROM `vx-operation.oliovita.cio_deliveries_metrics` d,
         UNNEST(d.metric) AS m
    WHERE
        d.delivery_type = 'email'
        AND d.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY)
),

-- Join recipient email → customer_id via shopify_customer
email_events_with_id AS (
    SELECT
        e.*,
        sc.id AS customer_id
    FROM email_events e
    LEFT JOIN `vx-operation.oliovita.shopify_customer` sc
        ON LOWER(sc.email) = LOWER(e.email)
),

-- Campaign-level metrics
campaign_metrics AS (
    SELECT
        campaign_id,
        campaign_name,
        COUNTIF(event_type = 'sent')          AS sent,
        COUNTIF(event_type = 'delivered')     AS delivered,
        COUNTIF(event_type = 'opened')        AS opened,
        COUNTIF(event_type = 'clicked')       AS clicked,
        COUNTIF(event_type = 'unsubscribed')  AS unsubscribed,
        COUNTIF(event_type = 'bounced')       AS bounced,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'opened'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS open_rate_pct,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'clicked'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS ctr_pct
    FROM email_events_with_id
    GROUP BY 1, 2
),

-- Best send times (by opens)
send_times AS (
    SELECT
        event_hour,
        event_dow,
        COUNT(*) AS open_count,
        RANK() OVER (ORDER BY COUNT(*) DESC) AS open_rank
    FROM email_events_with_id
    WHERE event_type = 'opened'
    GROUP BY 1, 2
),

-- Per-customer engagement
customer_engagement AS (
    SELECT
        customer_id,
        email,
        COUNT(DISTINCT campaign_id)                              AS campaigns_received,
        COUNTIF(event_type = 'sent')                            AS email_sent,
        COUNTIF(event_type = 'opened')                          AS email_opens,
        COUNTIF(event_type = 'clicked')                         AS email_clicks,
        COUNTIF(event_type = 'unsubscribed')                    AS email_unsubscribed,
        COUNTIF(event_type = 'bounced')                         AS email_bounced,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'opened'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS email_open_rate_pct,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'clicked'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS email_ctr_pct,
        MAX(CASE WHEN event_type = 'opened' THEN event_timestamp END) AS last_email_open
    FROM email_events_with_id
    WHERE customer_id IS NOT NULL
    GROUP BY 1, 2
)

SELECT * FROM customer_engagement
ORDER BY email_opens DESC
