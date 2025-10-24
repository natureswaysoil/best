const { BigQuery } = require('@google-cloud/bigquery');
const { MetricServiceClient } = require('@google-cloud/monitoring');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const nodemailer = require('nodemailer');
const moment = require('moment');

// Initialize clients
const bigquery = new BigQuery();
const monitoring = new MetricServiceClient();
const secretManager = new SecretManagerServiceClient();

const CONFIG = {
    project_id: 'amazon-ppc-474902',
    dataset_id: 'amazon_ppc',
    // Cost thresholds in USD
    daily_cost_threshold: 50.00,
    monthly_cost_threshold: 1000.00,
    query_cost_threshold: 1.00, // Per query
    // BigQuery slot hours threshold
    slot_hours_threshold: 100
};

/**
 * BigQuery Cost Monitor
 */
class CostMonitor {
    constructor() {
        this.projectId = CONFIG.project_id;
        this.datasetId = CONFIG.dataset_id;
    }

    /**
     * Get daily BigQuery costs
     */
    async getDailyCosts() {
        const query = `
            SELECT 
                DATE(creation_time) as usage_date,
                SUM(total_bytes_processed) as total_bytes,
                COUNT(*) as query_count,
                SUM(total_slot_ms) / (1000 * 60 * 60) as slot_hours,
                -- Estimate cost: $5 per TB processed
                ROUND(SUM(total_bytes_processed) / POWER(1024, 4) * 5, 2) as estimated_cost
            FROM \`${this.projectId}\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
            WHERE 
                DATE(creation_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND job_type = 'QUERY'
                AND state = 'DONE'
                AND error_result IS NULL
            GROUP BY usage_date
            ORDER BY usage_date DESC
        `;
        
        try {
            const [rows] = await bigquery.query(query);
            return rows;
        } catch (error) {
            console.error('❌ Failed to get daily costs:', error);
            return [];
        }
    }

    /**
     * Get expensive queries
     */
    async getExpensiveQueries(limitHours = 24) {
        const query = `
            SELECT 
                job_id,
                user_email,
                query,
                creation_time,
                total_bytes_processed,
                total_slot_ms / (1000 * 60 * 60) as slot_hours,
                ROUND(total_bytes_processed / POWER(1024, 4) * 5, 4) as estimated_cost
            FROM \`${this.projectId}\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
            WHERE 
                creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${limitHours} HOUR)
                AND job_type = 'QUERY'
                AND state = 'DONE'
                AND error_result IS NULL
                AND total_bytes_processed > POWER(1024, 3) * 100  -- > 100 GB
            ORDER BY total_bytes_processed DESC
            LIMIT 20
        `;
        
        try {
            const [rows] = await bigquery.query(query);
            return rows;
        } catch (error) {
            console.error('❌ Failed to get expensive queries:', error);
            return [];
        }
    }

    /**
     * Get BigQuery usage patterns
     */
    async getUsagePatterns() {
        const query = `
            SELECT 
                EXTRACT(HOUR FROM creation_time) as hour,
                COUNT(*) as query_count,
                SUM(total_bytes_processed) as total_bytes,
                ROUND(AVG(total_bytes_processed) / POWER(1024, 3), 2) as avg_gb_per_query
            FROM \`${this.projectId}\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
            WHERE 
                DATE(creation_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND job_type = 'QUERY'
                AND state = 'DONE'
            GROUP BY hour
            ORDER BY hour
        `;
        
        try {
            const [rows] = await bigquery.query(query);
            return rows;
        } catch (error) {
            console.error('❌ Failed to get usage patterns:', error);
            return [];
        }
    }

    /**
     * Analyze query optimization opportunities
     */
    async getOptimizationOpportunities() {
        const query = `
            SELECT 
                'Partition Pruning' as opportunity_type,
                COUNT(*) as query_count,
                'Add WHERE clauses on partitioned columns' as recommendation
            FROM \`${this.projectId}\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
            WHERE 
                DATE(creation_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
                AND job_type = 'QUERY'
                AND state = 'DONE'
                AND total_bytes_processed > POWER(1024, 2) * 100  -- > 100 MB
                AND NOT REGEXP_CONTAINS(LOWER(query), r'where.*date.*>=|where.*date.*between')
            
            UNION ALL
            
            SELECT 
                'SELECT *' as opportunity_type,
                COUNT(*) as query_count,
                'Replace SELECT * with specific column names' as recommendation
            FROM \`${this.projectId}\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
            WHERE 
                DATE(creation_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
                AND job_type = 'QUERY'
                AND state = 'DONE'
                AND REGEXP_CONTAINS(LOWER(query), r'select\\s+\\*')
        `;
        
        try {
            const [rows] = await bigquery.query(query);
            return rows;
        } catch (error) {
            console.error('❌ Failed to get optimization opportunities:', error);
            return [];
        }
    }
}

/**
 * Alert Manager
 */
class AlertManager {
    constructor() {
        this.transporter = null;
    }

    /**
     * Initialize email transporter
     */
    async initializeEmail() {
        try {
            const [version] = await secretManager.accessSecretVersion({
                name: `projects/${CONFIG.project_id}/secrets/email-config/versions/latest`
            });
            
            const emailConfig = JSON.parse(version.payload.data.toString());
            
            this.transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: emailConfig.user,
                    pass: emailConfig.password
                }
            });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize email:', error);
            return false;
        }
    }

    /**
     * Send cost alert email
     */
    async sendCostAlert(alertData) {
        if (!this.transporter) {
            console.log('⚠️ Email not configured, skipping alert');
            return;
        }

        const subject = `🚨 BigQuery Cost Alert - ${alertData.type}`;
        const html = this.generateAlertHTML(alertData);

        try {
            await this.transporter.sendMail({
                from: '"Amazon PPC Monitor" <noreply@natureswaysoil.com>',
                to: 'natureswaysoil@gmail.com',
                subject: subject,
                html: html
            });
            
            console.log('✅ Cost alert sent successfully');
        } catch (error) {
            console.error('❌ Failed to send alert:', error);
        }
    }

    /**
     * Generate alert HTML
     */
    generateAlertHTML(data) {
        return `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #dc3545; margin-top: 0;">🚨 BigQuery Cost Alert</h2>
                
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #495057; margin-top: 0;">Alert Type: ${data.type}</h3>
                    <p><strong>Threshold:</strong> $${data.threshold}</p>
                    <p><strong>Current Value:</strong> $${data.current}</p>
                    <p><strong>Time Period:</strong> ${data.period}</p>
                </div>

                ${data.details ? `
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4>Details:</h4>
                    <ul>
                        ${data.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${data.recommendations ? `
                <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4 style="color: #0066cc;">💡 Recommendations:</h4>
                    <ul>
                        ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0;">
                        Generated by Amazon PPC Cost Monitor | ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Write metrics to Cloud Monitoring
     */
    async writeMetrics(costs) {
        const projectPath = monitoring.projectPath(CONFIG.project_id);
        
        const timeSeries = costs.map(cost => ({
            resource: {
                type: 'global',
                labels: {
                    project_id: CONFIG.project_id
                }
            },
            metric: {
                type: 'custom.googleapis.com/bigquery/daily_cost',
                labels: {
                    dataset: CONFIG.dataset_id
                }
            },
            points: [{
                interval: {
                    endTime: {
                        seconds: Math.floor(Date.now() / 1000)
                    }
                },
                value: {
                    doubleValue: parseFloat(cost.estimated_cost || 0)
                }
            }]
        }));

        try {
            await monitoring.createTimeSeries({
                name: projectPath,
                timeSeries: timeSeries
            });
            
            console.log('✅ Metrics written to Cloud Monitoring');
        } catch (error) {
            console.error('❌ Failed to write metrics:', error);
        }
    }
}

/**
 * Main monitoring function
 */
async function monitorCosts(req, res) {
    const startTime = Date.now();
    let result = {
        success: false,
        timestamp: new Date().toISOString(),
        alerts_sent: 0,
        total_cost_7d: 0,
        expensive_queries: 0
    };

    try {
        console.log('📊 Starting BigQuery cost monitoring...');
        
        const costMonitor = new CostMonitor();
        const alertManager = new AlertManager();
        
        // Initialize email (optional)
        await alertManager.initializeEmail();
        
        // Get cost data
        const dailyCosts = await costMonitor.getDailyCosts();
        const expensiveQueries = await costMonitor.getExpensiveQueries();
        const optimizationOps = await costMonitor.getOptimizationOpportunities();
        
        // Calculate totals
        const totalCost7d = dailyCosts.reduce((sum, day) => sum + parseFloat(day.estimated_cost || 0), 0);
        const todayCost = dailyCosts.length > 0 ? parseFloat(dailyCosts[0].estimated_cost || 0) : 0;
        
        result.total_cost_7d = totalCost7d;
        result.expensive_queries = expensiveQueries.length;
        
        console.log(`📈 Cost Analysis:`, {
            total_7d: `$${totalCost7d.toFixed(2)}`,
            today: `$${todayCost.toFixed(2)}`,
            expensive_queries: expensiveQueries.length
        });
        
        // Check thresholds and send alerts
        let alertsSent = 0;
        
        // Daily cost threshold
        if (todayCost > CONFIG.daily_cost_threshold) {
            await alertManager.sendCostAlert({
                type: 'Daily Cost Threshold Exceeded',
                threshold: CONFIG.daily_cost_threshold,
                current: todayCost.toFixed(2),
                period: 'Today',
                details: dailyCosts.slice(0, 3).map(d => 
                    `${d.usage_date}: $${d.estimated_cost} (${d.query_count} queries)`),
                recommendations: [
                    'Review expensive queries in the last 24 hours',
                    'Consider adding date filters to reduce data scanned',
                    'Optimize dashboard queries to use cached results'
                ]
            });
            alertsSent++;
        }
        
        // Weekly cost threshold
        if (totalCost7d > CONFIG.monthly_cost_threshold / 4) { // 1/4 monthly threshold
            await alertManager.sendCostAlert({
                type: 'Weekly Cost Trending High',
                threshold: (CONFIG.monthly_cost_threshold / 4).toFixed(2),
                current: totalCost7d.toFixed(2),
                period: 'Last 7 Days',
                details: [`Total queries: ${dailyCosts.reduce((sum, d) => sum + d.query_count, 0)}`],
                recommendations: [
                    'Consider implementing query result caching',
                    'Review automated sync frequency',
                    'Optimize BigQuery table partitioning'
                ]
            });
            alertsSent++;
        }
        
        // Expensive queries alert
        if (expensiveQueries.length > 5) {
            await alertManager.sendCostAlert({
                type: 'High Number of Expensive Queries',
                threshold: '5 queries',
                current: `${expensiveQueries.length} queries`,
                period: 'Last 24 Hours', 
                details: expensiveQueries.slice(0, 5).map(q => 
                    `$${q.estimated_cost} - ${q.query.substring(0, 100)}...`),
                recommendations: optimizationOps.map(op => 
                    `${op.opportunity_type}: ${op.recommendation} (${op.query_count} queries affected)`)
            });
            alertsSent++;
        }
        
        // Write metrics to monitoring
        await alertManager.writeMetrics(dailyCosts);
        
        result.success = true;
        result.alerts_sent = alertsSent;
        
    } catch (error) {
        console.error('❌ Cost monitoring failed:', error);
        result.error = error.message;
    }
    
    result.duration = Date.now() - startTime;
    
    console.log('📋 Monitoring Summary:', result);
    
    if (res) {
        res.status(result.success ? 200 : 500).json(result);
    }
    
    return result;
}

// Export for Cloud Functions
exports.monitorCosts = monitorCosts;