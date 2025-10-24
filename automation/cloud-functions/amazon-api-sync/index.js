const { BigQuery } = require('@google-cloud/bigquery');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

// Initialize clients
const bigquery = new BigQuery();
const secretManager = new SecretManagerServiceClient();

// Configuration
const CONFIG = {
    project_id: 'amazon-ppc-474902',
    dataset_id: 'amazon_ppc',
    table_id: 'campaign_performance',
    amazon_api_base: 'https://advertising-api.amazon.com',
    reporting_api_base: 'https://advertising-api.amazon.com/reporting',
    secret_name: 'amazon-advertising-credentials'
};

/**
 * Amazon Advertising API Client
 */
class AmazonAdvertisingClient {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.profileId = null;
        this.clientId = null;
        this.clientSecret = null;
        this.tokenExpiry = null;
    }

    /**
     * Load credentials from Google Secret Manager
     */
    async loadCredentials() {
        try {
            const [version] = await secretManager.accessSecretVersion({
                name: `projects/${CONFIG.project_id}/secrets/${CONFIG.secret_name}/versions/latest`
            });
            
            const credentials = JSON.parse(version.payload.data.toString());
            this.clientId = credentials.client_id;
            this.clientSecret = credentials.client_secret;
            this.refreshToken = credentials.refresh_token;
            this.profileId = credentials.profile_id;
            
            console.log('✅ Amazon Advertising credentials loaded');
            return true;
        } catch (error) {
            console.error('❌ Failed to load credentials:', error);
            throw new Error('Failed to load Amazon Advertising credentials');
        }
    }

    /**
     * Get or refresh access token
     */
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post('https://api.amazon.com/auth/o2/token', {
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            console.log('✅ Access token refreshed');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Token refresh failed:', error.response?.data || error.message);
            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Make authenticated request to Amazon Advertising API
     */
    async makeRequest(endpoint, options = {}) {
        const token = await this.getAccessToken();
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Amazon-Advertising-API-ClientId': this.clientId,
                'Amazon-Advertising-API-Scope': this.profileId,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await axios(endpoint, config);
            return response.data;
        } catch (error) {
            console.error('❌ API request failed:', {
                endpoint,
                status: error.response?.status,
                error: error.response?.data || error.message
            });
            throw error;
        }
    }

    /**
     * Get campaigns data
     */
    async getCampaigns() {
        const endpoint = `${CONFIG.amazon_api_base}/v2/sp/campaigns`;
        return await this.makeRequest(endpoint, { method: 'GET' });
    }

    /**
     * Create performance report request
     */
    async requestPerformanceReport(reportDate = null) {
        const date = reportDate || moment().subtract(1, 'day').format('YYYYMMDD');
        
        const reportConfig = {
            reportDate: date,
            metrics: [
                'campaignName',
                'campaignId', 
                'impressions',
                'clicks',
                'cost',
                'purchases1d',
                'purchasesSame1d',
                'sales1d',
                'salesSame1d',
                'attributedConversions1d',
                'attributedConversions1dSameSKU'
            ],
            segment: 'query'
        };

        const endpoint = `${CONFIG.reporting_api_base}/v2/sp/campaigns/report`;
        return await this.makeRequest(endpoint, {
            method: 'POST',
            data: reportConfig
        });
    }

    /**
     * Download report data
     */
    async downloadReport(reportId) {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            try {
                const statusEndpoint = `${CONFIG.reporting_api_base}/v2/reports/${reportId}`;
                const status = await this.makeRequest(statusEndpoint, { method: 'GET' });
                
                if (status.status === 'SUCCESS') {
                    const response = await axios.get(status.location, {
                        headers: {
                            'Authorization': `Bearer ${await this.getAccessToken()}`
                        },
                        responseType: 'stream'
                    });
                    
                    return await this.parseReportStream(response.data);
                } else if (status.status === 'FAILURE') {
                    throw new Error(`Report generation failed: ${status.statusDetails}`);
                }
                
                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
                attempts++;
                console.log(`⏳ Report not ready, attempt ${attempts}/${maxAttempts}`);
                
            } catch (error) {
                console.error('❌ Report download error:', error.message);
                throw error;
            }
        }
        
        throw new Error('Report generation timeout');
    }

    /**
     * Parse report data stream
     */
    async parseReportStream(stream) {
        return new Promise((resolve, reject) => {
            let data = '';
            
            stream.on('data', chunk => {
                data += chunk.toString();
            });
            
            stream.on('end', () => {
                try {
                    const reports = data.split('\n')
                        .filter(line => line.trim())
                        .map(line => JSON.parse(line));
                    resolve(reports);
                } catch (error) {
                    reject(error);
                }
            });
            
            stream.on('error', reject);
        });
    }
}

/**
 * BigQuery Data Manager
 */
class BigQueryManager {
    constructor() {
        this.dataset = bigquery.dataset(CONFIG.dataset_id);
        this.table = this.dataset.table(CONFIG.table_id);
    }

    /**
     * Transform Amazon API data to BigQuery schema
     */
    transformData(reportData) {
        return reportData.map(row => ({
            date: moment(row.date || moment().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
            campaign_name: row.campaignName || 'Unknown Campaign',
            campaign_id: row.campaignId?.toString() || null,
            impressions: parseInt(row.impressions) || 0,
            clicks: parseInt(row.clicks) || 0,
            cost: parseFloat(row.cost) || 0.0,
            ctr: row.clicks && row.impressions ? 
                parseFloat((row.clicks / row.impressions * 100).toFixed(4)) : 0.0,
            conversions: parseInt(row.attributedConversions1d || row.purchases1d) || 0,
            conversion_value: parseFloat(row.sales1d || row.salesSame1d) || 0.0,
            acos: row.cost && row.sales1d ? 
                parseFloat((row.cost / row.sales1d * 100).toFixed(2)) : null,
            roas: row.sales1d && row.cost ? 
                parseFloat((row.sales1d / row.cost).toFixed(2)) : null,
            created_at: new Date().toISOString()
        }));
    }

    /**
     * Insert data into BigQuery
     */
    async insertData(transformedData) {
        try {
            // Create table if it doesn't exist
            await this.ensureTableExists();
            
            // Insert data
            const [insertResult] = await this.table.insert(transformedData);
            
            if (insertResult && insertResult.length > 0) {
                console.error('❌ Insert errors:', insertResult);
                throw new Error('BigQuery insert failed with errors');
            }
            
            console.log(`✅ Successfully inserted ${transformedData.length} rows into BigQuery`);
            return { success: true, rows: transformedData.length };
            
        } catch (error) {
            console.error('❌ BigQuery insert error:', error);
            throw error;
        }
    }

    /**
     * Ensure table exists with proper schema
     */
    async ensureTableExists() {
        try {
            const [exists] = await this.table.exists();
            if (!exists) {
                const schema = [
                    { name: 'date', type: 'DATE', mode: 'REQUIRED' },
                    { name: 'campaign_name', type: 'STRING', mode: 'NULLABLE' },
                    { name: 'campaign_id', type: 'STRING', mode: 'NULLABLE' },
                    { name: 'impressions', type: 'INTEGER', mode: 'NULLABLE' },
                    { name: 'clicks', type: 'INTEGER', mode: 'NULLABLE' },
                    { name: 'cost', type: 'FLOAT', mode: 'NULLABLE' },
                    { name: 'ctr', type: 'FLOAT', mode: 'NULLABLE' },
                    { name: 'conversions', type: 'INTEGER', mode: 'NULLABLE' },
                    { name: 'conversion_value', type: 'FLOAT', mode: 'NULLABLE' },
                    { name: 'acos', type: 'FLOAT', mode: 'NULLABLE' },
                    { name: 'roas', type: 'FLOAT', mode: 'NULLABLE' },
                    { name: 'created_at', type: 'TIMESTAMP', mode: 'NULLABLE' }
                ];

                await this.table.create({
                    schema: schema,
                    timePartitioning: {
                        type: 'DAY',
                        field: 'date'
                    },
                    clustering: {
                        fields: ['campaign_name', 'campaign_id']
                    }
                });
                
                console.log('✅ BigQuery table created with partitioning and clustering');
            }
        } catch (error) {
            console.error('❌ Table creation error:', error);
            throw error;
        }
    }

    /**
     * Delete duplicate data for a specific date
     */
    async deleteDuplicates(date) {
        const deleteQuery = `
            DELETE FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.${CONFIG.table_id}\`
            WHERE date = @date
        `;
        
        const options = {
            query: deleteQuery,
            params: { date: date }
        };
        
        try {
            const [job] = await bigquery.createQueryJob(options);
            await job.getQueryResults();
            console.log(`✅ Deleted existing data for date: ${date}`);
        } catch (error) {
            console.error('❌ Delete duplicates error:', error);
            // Don't throw - continue with insert
        }
    }
}

/**
 * Main sync function (Cloud Function entry point)
 */
async function syncAmazonData(req, res) {
    const startTime = Date.now();
    let result = {
        success: false,
        timestamp: new Date().toISOString(),
        duration: 0,
        rowsProcessed: 0,
        errors: []
    };

    try {
        console.log('🚀 Starting Amazon PPC data sync...');
        
        // Initialize clients
        const amazonClient = new AmazonAdvertisingClient();
        const bqManager = new BigQueryManager();
        
        // Load credentials
        await amazonClient.loadCredentials();
        
        // Get date to process (yesterday by default, or from query param)
        const targetDate = req.query?.date || moment().subtract(1, 'day').format('YYYY-MM-DD');
        console.log(`📅 Processing data for date: ${targetDate}`);
        
        // Request performance report
        console.log('📊 Requesting performance report...');
        const reportRequest = await amazonClient.requestPerformanceReport(
            moment(targetDate).format('YYYYMMDD')
        );
        
        if (!reportRequest.reportId) {
            throw new Error('No report ID returned from Amazon API');
        }
        
        console.log(`📋 Report requested: ${reportRequest.reportId}`);
        
        // Download report data
        console.log('⬇️ Downloading report data...');
        const reportData = await amazonClient.downloadReport(reportRequest.reportId);
        
        if (!reportData || reportData.length === 0) {
            console.log('⚠️ No data returned from Amazon API');
            result.success = true;
            result.message = 'No data available for specified date';
        } else {
            // Transform data
            console.log(`🔄 Transforming ${reportData.length} records...`);
            const transformedData = bqManager.transformData(reportData);
            
            // Delete existing data for this date to avoid duplicates
            await bqManager.deleteDuplicates(targetDate);
            
            // Insert into BigQuery
            await bqManager.insertData(transformedData);
            
            result.success = true;
            result.rowsProcessed = transformedData.length;
            result.message = `Successfully synced ${transformedData.length} records`;
        }
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        result.errors.push(error.message);
        result.message = 'Sync failed: ' + error.message;
    } finally {
        result.duration = Date.now() - startTime;
        
        // Log summary
        console.log('📈 Sync Summary:', {
            success: result.success,
            duration: `${result.duration}ms`,
            rowsProcessed: result.rowsProcessed,
            errors: result.errors
        });
        
        // Send response
        if (res) {
            res.status(result.success ? 200 : 500).json(result);
        }
    }
    
    return result;
}

// Export for Cloud Functions
exports.syncAmazonData = syncAmazonData;

// Export classes for testing
exports.AmazonAdvertisingClient = AmazonAdvertisingClient;
exports.BigQueryManager = BigQueryManager;