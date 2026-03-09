-- =============================================================================
-- communications.sql
-- Email and WhatsApp engagement queries.
--
-- Placeholders:
--   {project}       -> GCP project ID
--   {dataset}       -> BigQuery dataset ID
--   {table_prefix}  -> Optional table name prefix
--
-- Parameters: @start_date, @end_date
-- =============================================================================

-- Email performance summary by campaign
WITH email_events AS (
    SELECT
        ee.customer_id,
        ee.campaign_id,
        ee.campaign_name,
        ee.campaign_type,          -- e.g. welcome, winback, promotional
        ee.event_type,             -- sent, delivered, opened, clicked, unsubscribed, bounced
        ee.event_timestamp,
        EXTRACT(HOUR FROM ee.event_timestamp)   AS event_hour,
        EXTRACT(DAYOFWEEK FROM ee.event_timestamp) AS event_dow  -- 1=Sun, 7=Sat
    FROM `{project}.{dataset}.{table_prefix}email_events` ee
    WHERE DATE(ee.event_timestamp) BETWEEN @start_date AND @end_date
),

email_campaign_metrics AS (
    SELECT
        campaign_id,
        campaign_name,
        campaign_type,
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
        ) * 100 AS ctr_pct,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'unsubscribed'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS unsubscribe_rate_pct
    FROM email_events
    GROUP BY 1, 2, 3
),

-- Best sending times (by open events only)
email_send_times AS (
    SELECT
        event_hour,
        event_dow,
        COUNT(*) AS open_count,
        RANK() OVER (ORDER BY COUNT(*) DESC) AS open_rank
    FROM email_events
    WHERE event_type = 'opened'
    GROUP BY 1, 2
),

-- Per-customer email engagement
customer_email_engagement AS (
    SELECT
        customer_id,
        COUNT(DISTINCT campaign_id)                             AS campaigns_received,
        COUNTIF(event_type = 'opened')                         AS total_opens,
        COUNTIF(event_type = 'clicked')                        AS total_clicks,
        COUNTIF(event_type = 'unsubscribed')                   AS unsubscribed,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'opened'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS personal_open_rate_pct,
        MAX(CASE WHEN event_type = 'opened' THEN event_timestamp END) AS last_open_date
    FROM email_events
    GROUP BY customer_id
),

-- WhatsApp engagement
whatsapp_events AS (
    SELECT
        we.customer_id,
        we.campaign_id,
        we.campaign_name,
        we.message_type,           -- transactional, promotional, cart_recovery
        we.event_type,             -- sent, delivered, read, replied, opted_out
        we.event_timestamp,
        EXTRACT(HOUR FROM we.event_timestamp)   AS event_hour,
        EXTRACT(DAYOFWEEK FROM we.event_timestamp) AS event_dow
    FROM `{project}.{dataset}.{table_prefix}whatsapp_events` we
    WHERE DATE(we.event_timestamp) BETWEEN @start_date AND @end_date
),

whatsapp_campaign_metrics AS (
    SELECT
        campaign_id,
        campaign_name,
        message_type,
        COUNTIF(event_type = 'sent')       AS sent,
        COUNTIF(event_type = 'delivered')  AS delivered,
        COUNTIF(event_type = 'read')       AS read_count,
        COUNTIF(event_type = 'replied')    AS replied,
        COUNTIF(event_type = 'opted_out')  AS opted_out,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'read'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS read_rate_pct,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'replied'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS response_rate_pct
    FROM whatsapp_events
    GROUP BY 1, 2, 3
),

-- Per-customer WhatsApp engagement
customer_wa_engagement AS (
    SELECT
        customer_id,
        COUNTIF(event_type = 'read')      AS total_reads,
        COUNTIF(event_type = 'replied')   AS total_replies,
        COUNTIF(event_type = 'opted_out') AS opted_out,
        SAFE_DIVIDE(
            COUNTIF(event_type = 'read'),
            COUNTIF(event_type = 'delivered')
        ) * 100 AS personal_read_rate_pct
    FROM whatsapp_events
    GROUP BY customer_id
)

-- Combined per-customer channel engagement (primary output for engagement.py)
SELECT
    COALESCE(ce.customer_id, wa.customer_id)    AS customer_id,
    COALESCE(ce.campaigns_received, 0)          AS email_campaigns_received,
    COALESCE(ce.total_opens, 0)                 AS email_opens,
    COALESCE(ce.total_clicks, 0)                AS email_clicks,
    COALESCE(ce.unsubscribed, 0)                AS email_unsubscribed,
    COALESCE(ce.personal_open_rate_pct, 0)      AS email_open_rate_pct,
    ce.last_open_date                           AS last_email_open,
    COALESCE(wa.total_reads, 0)                 AS wa_reads,
    COALESCE(wa.total_replies, 0)               AS wa_replies,
    COALESCE(wa.opted_out, 0)                   AS wa_opted_out,
    COALESCE(wa.personal_read_rate_pct, 0)      AS wa_read_rate_pct
FROM customer_email_engagement ce
FULL OUTER JOIN customer_wa_engagement wa
    ON ce.customer_id = wa.customer_id
ORDER BY email_opens DESC
