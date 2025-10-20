-- BigQuery Table Structure for Amazon PPC Dashboard
-- Project: amazon-ppc-474902
-- Dataset: amazon_ppc

-- Create dataset if it doesn't exist
CREATE SCHEMA IF NOT EXISTS `amazon-ppc-474902.amazon_ppc`
OPTIONS (
    description = 'Amazon PPC campaign performance data for Nature\'s Way Soil'
);

-- Create campaign_performance table
CREATE OR REPLACE TABLE `amazon-ppc-474902.amazon_ppc.campaign_performance` (
    date DATE,
    campaign_name STRING,
    campaign_id STRING,
    ad_group_name STRING,
    ad_group_id STRING,
    keyword_text STRING,
    keyword_id STRING,
    match_type STRING,
    impressions INT64,
    clicks INT64,
    cost FLOAT64,
    ctr FLOAT64,
    conversions INT64,
    conversion_value FLOAT64,
    acos FLOAT64,
    impressions_share FLOAT64,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY campaign_name
OPTIONS (
    description = 'Daily Amazon PPC campaign performance metrics',
    labels = [('environment', 'production'), ('team', 'marketing')]
);

-- Sample data for testing (replace with your actual data)
INSERT INTO `amazon-ppc-474902.amazon_ppc.campaign_performance`
(date, campaign_name, campaign_id, impressions, clicks, cost, ctr, conversions)
VALUES
    (CURRENT_DATE() - INTERVAL 7 DAY, 'Organic Fertilizer Campaign', 'camp_001', 45000, 320, 125.50, 0.71, 12),
    (CURRENT_DATE() - INTERVAL 6 DAY, 'Organic Fertilizer Campaign', 'camp_001', 42500, 298, 118.75, 0.70, 11),
    (CURRENT_DATE() - INTERVAL 5 DAY, 'Organic Fertilizer Campaign', 'camp_001', 47800, 345, 132.25, 0.72, 15),
    (CURRENT_DATE() - INTERVAL 4 DAY, 'Organic Fertilizer Campaign', 'camp_001', 49200, 368, 145.80, 0.75, 16),
    (CURRENT_DATE() - INTERVAL 3 DAY, 'Organic Fertilizer Campaign', 'camp_001', 51300, 392, 152.40, 0.76, 18),
    (CURRENT_DATE() - INTERVAL 2 DAY, 'Organic Fertilizer Campaign', 'camp_001', 48700, 375, 148.90, 0.77, 17),
    (CURRENT_DATE() - INTERVAL 1 DAY, 'Organic Fertilizer Campaign', 'camp_001', 52100, 412, 158.75, 0.79, 20),

    (CURRENT_DATE() - INTERVAL 7 DAY, 'Biochar Products Campaign', 'camp_002', 38000, 280, 98.40, 0.74, 9),
    (CURRENT_DATE() - INTERVAL 6 DAY, 'Biochar Products Campaign', 'camp_002', 36500, 265, 95.25, 0.73, 8),
    (CURRENT_DATE() - INTERVAL 5 DAY, 'Biochar Products Campaign', 'camp_002', 41200, 310, 108.75, 0.75, 12),
    (CURRENT_DATE() - INTERVAL 4 DAY, 'Biochar Products Campaign', 'camp_002', 42800, 335, 115.60, 0.78, 14),
    (CURRENT_DATE() - INTERVAL 3 DAY, 'Biochar Products Campaign', 'camp_002', 44500, 358, 122.85, 0.80, 15),
    (CURRENT_DATE() - INTERVAL 2 DAY, 'Biochar Products Campaign', 'camp_002', 42100, 342, 118.90, 0.81, 13),
    (CURRENT_DATE() - INTERVAL 1 DAY, 'Biochar Products Campaign', 'camp_002', 45800, 385, 128.75, 0.84, 17),

    (CURRENT_DATE() - INTERVAL 7 DAY, 'Compost Blend Campaign', 'camp_003', 29500, 195, 75.25, 0.66, 6),
    (CURRENT_DATE() - INTERVAL 6 DAY, 'Compost Blend Campaign', 'camp_003', 28200, 182, 72.80, 0.65, 5),
    (CURRENT_DATE() - INTERVAL 5 DAY, 'Compost Blend Campaign', 'camp_003', 31800, 215, 82.40, 0.68, 8),
    (CURRENT_DATE() - INTERVAL 4 DAY, 'Compost Blend Campaign', 'camp_003', 33200, 228, 87.95, 0.69, 9),
    (CURRENT_DATE() - INTERVAL 3 DAY, 'Compost Blend Campaign', 'camp_003', 34800, 245, 92.75, 0.70, 10),
    (CURRENT_DATE() - INTERVAL 2 DAY, 'Compost Blend Campaign', 'camp_003', 32500, 232, 89.60, 0.71, 9),
    (CURRENT_DATE() - INTERVAL 1 DAY, 'Compost Blend Campaign', 'camp_003', 36200, 268, 98.25, 0.74, 12),

    (CURRENT_DATE() - INTERVAL 7 DAY, 'Liquid Nutrients Campaign', 'camp_004', 13200, 80, 42.50, 0.61, 3),
    (CURRENT_DATE() - INTERVAL 6 DAY, 'Liquid Nutrients Campaign', 'camp_004', 12800, 75, 40.25, 0.59, 2),
    (CURRENT_DATE() - INTERVAL 5 DAY, 'Liquid Nutrients Campaign', 'camp_004', 14500, 92, 47.80, 0.63, 4),
    (CURRENT_DATE() - INTERVAL 4 DAY, 'Liquid Nutrients Campaign', 'camp_004', 15200, 98, 49.95, 0.64, 4),
    (CURRENT_DATE() - INTERVAL 3 DAY, 'Liquid Nutrients Campaign', 'camp_004', 15800, 105, 52.75, 0.66, 5),
    (CURRENT_DATE() - INTERVAL 2 DAY, 'Liquid Nutrients Campaign', 'camp_004', 14800, 99, 48.90, 0.67, 4),
    (CURRENT_DATE() - INTERVAL 1 DAY, 'Liquid Nutrients Campaign', 'camp_004', 16500, 118, 55.25, 0.72, 6);

-- Create a view for dashboard queries (optional)
CREATE OR REPLACE VIEW `amazon-ppc-474902.amazon_ppc.dashboard_metrics` AS
SELECT
    date,
    campaign_name,
    SUM(impressions) as impressions,
    SUM(clicks) as clicks,
    SUM(cost) as cost,
    AVG(ctr) as ctr,
    SUM(conversions) as conversions,
    SUM(conversion_value) as conversion_value,
    AVG(acos) as acos
FROM `amazon-ppc-474902.amazon_ppc.campaign_performance`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY date, campaign_name;

-- Grant permissions to service account (run this separately if needed)
-- GRANT `roles/bigquery.dataViewer` ON SCHEMA `amazon-ppc-474902.amazon_ppc` TO "serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com";
-- GRANT `roles/bigquery.jobUser` ON PROJECT `amazon-ppc-474902` TO "serviceAccount:amazon-ppc-dashboard@amazon-ppc-474902.iam.gserviceaccount.com";