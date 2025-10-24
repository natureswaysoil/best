-- Enhanced BigQuery Schema for Advanced PPC Optimization
-- Run this to create all required tables for the PPC optimization engine

-- 1. Enhanced Campaign Performance Table (already exists, adding new columns)
ALTER TABLE `amazon-ppc-474902.amazon_ppc.campaign_performance`
ADD COLUMN IF NOT EXISTS daily_budget FLOAT64,
ADD COLUMN IF NOT EXISTS hour STRING,
ADD COLUMN IF NOT EXISTS day_of_week INT64;

-- 2. Keyword Performance Table
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.keyword_performance` (
    date DATE,
    keyword_id STRING,
    campaign_id STRING,
    ad_group_id STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    ctr FLOAT64,
    acos FLOAT64,
    cpc FLOAT64,
    created_at TIMESTAMP
)
PARTITION BY date
CLUSTER BY keyword_id, campaign_id;

-- 3. Keywords Master Table
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.keywords` (
    keyword_id STRING,
    keyword_text STRING,
    campaign_id STRING,
    ad_group_id STRING,
    match_type STRING,
    current_bid FLOAT64,
    state STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
CLUSTER BY keyword_id, campaign_id;

-- 4. Search Term Reports Table
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.search_term_reports` (
    date DATE,
    search_term STRING,
    campaign_id STRING,
    ad_group_id STRING,
    keyword_id STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    created_at TIMESTAMP
)
PARTITION BY date
CLUSTER BY search_term, campaign_id;

-- 5. Negative Keywords Table
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.negative_keywords` (
    keyword_id STRING,
    keyword_text STRING,
    campaign_id STRING,
    ad_group_id STRING,
    match_type STRING,
    state STRING,
    created_at TIMESTAMP
)
CLUSTER BY keyword_text, campaign_id;

-- 6. Hourly Performance Table (for dayparting)
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.hourly_performance` (
    date DATE,
    hour INT64,
    campaign_id STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    created_at TIMESTAMP
)
PARTITION BY date
CLUSTER BY campaign_id, hour;

-- 7. Optimization Actions Log
CREATE TABLE IF NOT EXISTS `amazon-ppc-474902.amazon_ppc.optimization_actions` (
    action_id STRING,
    timestamp TIMESTAMP,
    action_type STRING,
    campaign_id STRING,
    keyword_id STRING,
    old_value FLOAT64,
    new_value FLOAT64,
    reason STRING,
    impact_estimate FLOAT64,
    status STRING,
    created_at TIMESTAMP
)
PARTITION BY DATE(timestamp)
CLUSTER BY action_type, campaign_id;

-- 8. Sample Data for Testing (Insert sample keyword and search term data)
INSERT INTO `amazon-ppc-474902.amazon_ppc.keywords` 
(keyword_id, keyword_text, campaign_id, ad_group_id, match_type, current_bid, state, created_at, updated_at)
VALUES 
('kw001', 'organic fertilizer', 'camp001', 'ag001', 'exact', 1.25, 'enabled', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('kw002', 'biochar soil amendment', 'camp002', 'ag002', 'broad', 0.85, 'enabled', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('kw003', 'compost blend', 'camp003', 'ag003', 'phrase', 1.10, 'enabled', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

INSERT INTO `amazon-ppc-474902.amazon_ppc.keyword_performance`
(date, keyword_id, campaign_id, ad_group_id, impressions, clicks, cost, conversions, conversion_value, ctr, acos, cpc, created_at)
VALUES
(CURRENT_DATE(), 'kw001', 'camp001', 'ag001', 1000, 25, 31.25, 3, 89.97, 2.5, 34.74, 1.25, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 'kw002', 'camp002', 'ag002', 800, 15, 12.75, 1, 24.99, 1.875, 51.02, 0.85, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 'kw003', 'camp003', 'ag003', 500, 12, 13.20, 2, 49.98, 2.4, 26.41, 1.10, CURRENT_TIMESTAMP());

INSERT INTO `amazon-ppc-474902.amazon_ppc.search_term_reports`
(date, search_term, campaign_id, ad_group_id, keyword_id, impressions, clicks, cost, conversions, conversion_value, created_at)
VALUES
(CURRENT_DATE(), 'best organic fertilizer', 'camp001', 'ag001', 'kw001', 200, 8, 10.00, 2, 59.98, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 'cheap fertilizer', 'camp001', 'ag001', 'kw001', 150, 5, 6.25, 0, 0, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 'premium biochar', 'camp002', 'ag002', 'kw002', 100, 3, 2.55, 1, 24.99, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 'biochar for cannabis', 'camp002', 'ag002', 'kw002', 80, 4, 3.40, 0, 0, CURRENT_TIMESTAMP());

INSERT INTO `amazon-ppc-474902.amazon_ppc.hourly_performance`
(date, hour, campaign_id, impressions, clicks, cost, conversions, conversion_value, created_at)
VALUES
(CURRENT_DATE(), 8, 'camp001', 150, 4, 5.00, 1, 29.99, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 12, 'camp001', 200, 6, 7.50, 2, 59.98, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 20, 'camp001', 100, 2, 2.50, 0, 0, CURRENT_TIMESTAMP()),
(CURRENT_DATE(), 2, 'camp001', 50, 1, 1.25, 0, 0, CURRENT_TIMESTAMP());

-- Create views for easy reporting
CREATE OR REPLACE VIEW `amazon-ppc-474902.amazon_ppc.campaign_optimization_summary` AS
SELECT 
    c.campaign_name,
    c.campaign_id,
    AVG(c.acos) as avg_acos,
    SUM(c.cost) as total_cost,
    SUM(c.conversions) as total_conversions,
    COUNT(DISTINCT k.keyword_id) as total_keywords,
    COUNT(DISTINCT CASE WHEN k.state = 'enabled' THEN k.keyword_id END) as active_keywords,
    AVG(k.current_bid) as avg_keyword_bid,
    -- Optimization recommendations
    CASE 
        WHEN AVG(c.acos) > 45 THEN 'PAUSE_RECOMMENDED'
        WHEN AVG(c.acos) < 15 THEN 'INCREASE_BUDGET_RECOMMENDED'
        WHEN AVG(c.acos) BETWEEN 15 AND 25 THEN 'PERFORMING_WELL'
        WHEN AVG(c.acos) BETWEEN 25 AND 35 THEN 'MONITOR_CLOSELY'
        ELSE 'NEEDS_OPTIMIZATION'
    END as optimization_recommendation
FROM `amazon-ppc-474902.amazon_ppc.campaign_performance` c
LEFT JOIN `amazon-ppc-474902.amazon_ppc.keywords` k ON c.campaign_id = k.campaign_id
WHERE c.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY c.campaign_name, c.campaign_id;