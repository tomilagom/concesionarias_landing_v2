-- =============================================================================
-- schema_discovery.sql
-- INFORMATION_SCHEMA queries to discover available tables and columns.
--
-- Placeholders:
--   {project}  -> GCP project ID
--   {dataset}  -> BigQuery dataset ID
-- =============================================================================

-- 1. List all base tables in the dataset
SELECT
    t.table_name,
    t.table_type,
    t.creation_time,
    t.last_modified_time,
    t.row_count,
    t.size_bytes,
    ROUND(t.size_bytes / POW(1024, 3), 4) AS size_gb
FROM `{project}.{dataset}.INFORMATION_SCHEMA.TABLE_OPTIONS`
-- Fall back to TABLE_STORAGE when TABLE_OPTIONS unavailable:
-- FROM `{project}.{dataset}.__TABLES__`
INNER JOIN `{project}.{dataset}.INFORMATION_SCHEMA.TABLES` t
    USING (table_name)
WHERE t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 2. List all columns with types
SELECT
    c.table_name,
    c.column_name,
    c.ordinal_position,
    c.data_type,
    c.is_nullable,
    c.is_partitioning_column,
    c.clustering_ordinal_position
FROM `{project}.{dataset}.INFORMATION_SCHEMA.COLUMNS` c
ORDER BY c.table_name, c.ordinal_position;

-- 3. Row counts per table (lightweight probe)
-- Run this as a separate query per table using the __TABLES__ view
SELECT
    table_id       AS table_name,
    row_count,
    size_bytes,
    ROUND(size_bytes / 1024 / 1024, 2) AS size_mb,
    TIMESTAMP_MILLIS(last_modified_time) AS last_modified
FROM `{project}.{dataset}.__TABLES__`
ORDER BY size_bytes DESC;
