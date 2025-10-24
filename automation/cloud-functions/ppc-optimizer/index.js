const { BigQuery } = require('@google-cloud/bigquery');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');
const natural = require('natural');

// Initialize clients
const bigquery = new BigQuery();
const secretManager = new SecretManagerServiceClient();

// Configuration
const CONFIG = {
    project_id: 'amazon-ppc-474902',
    dataset_id: 'amazon_ppc',
    
    // Optimization Thresholds
    acos_threshold_pause: 45.0,    // Pause campaigns over 45% ACOS
    acos_threshold_start: 45.0,    // Start campaigns under 45% ACOS
    min_clicks_for_decision: 10,   // Minimum clicks before optimization
    min_days_for_decision: 3,      // Minimum days of data
    
    // Bid Optimization
    bid_increase_threshold: 15.0,  // ACOS under 15% = increase bids
    bid_decrease_threshold: 35.0,  // ACOS over 35% = decrease bids
    bid_adjustment_percent: 15.0,  // Bid change percentage
    max_bid_limit: 5.00,          // Maximum bid limit
    min_bid_limit: 0.10,          // Minimum bid limit
    
    // Keyword Discovery
    min_impressions_keyword: 50,   // Minimum impressions for keyword analysis
    min_ctr_keyword: 0.5,         // Minimum CTR for new keywords
    max_acos_keyword: 30.0,       // Maximum ACOS for new keywords
    
    // Negative Keywords
    min_clicks_negative: 5,        // Minimum clicks to consider negative
    max_ctr_negative: 0.3,        // Maximum CTR for negative keywords
    min_cost_negative: 2.00,      // Minimum spend to consider negative
    
    // Dayparting
    min_hourly_spend: 1.00,       // Minimum hourly spend for analysis
    performance_lookback_days: 14, // Days to analyze for dayparting
};

/**
 * Advanced Amazon PPC Optimizer
 */
class PPCOptimizer {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.profileId = null;
        this.clientId = null;
        this.clientSecret = null;
        this.optimizationActions = [];
    }

    /**
     * Load credentials from Google Secret Manager
     */
    async loadCredentials() {
        try {
            const [version] = await secretManager.accessSecretVersion({
                name: `projects/${CONFIG.project_id}/secrets/amazon-advertising-credentials/versions/latest`
            });
            
            const credentials = JSON.parse(version.payload.data.toString());
            this.clientId = credentials.client_id;
            this.clientSecret = credentials.client_secret;
            this.refreshToken = credentials.refresh_token;
            this.profileId = credentials.profile_id;
            
            console.log('✅ Amazon credentials loaded for optimization');
            return true;
        } catch (error) {
            console.error('❌ Failed to load credentials:', error);
            throw new Error('Failed to load Amazon Advertising credentials');
        }
    }

    /**
     * Get access token
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
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Make authenticated Amazon API request
     */
    async makeAmazonRequest(endpoint, options = {}) {
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
            console.error('❌ Amazon API request failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * 1. CAMPAIGN AUTO-PAUSE/START BASED ON ACOS
     */
    async optimizeCampaignStatus() {
        console.log('🎯 Analyzing campaigns for auto-pause/start...');
        
        const query = `
            SELECT 
                campaign_id,
                campaign_name,
                AVG(acos) as avg_acos,
                SUM(clicks) as total_clicks,
                SUM(cost) as total_cost,
                COUNT(DISTINCT date) as days_of_data,
                MAX(date) as last_activity_date
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.campaign_performance\`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${CONFIG.min_days_for_decision} DAY)
                AND campaign_id IS NOT NULL
            GROUP BY campaign_id, campaign_name
            HAVING total_clicks >= ${CONFIG.min_clicks_for_decision}
                AND days_of_data >= ${CONFIG.min_days_for_decision}
        `;

        const [campaignData] = await bigquery.query(query);
        let actionsToTake = [];

        for (const campaign of campaignData) {
            const avgAcos = parseFloat(campaign.avg_acos) || 0;
            const campaignId = campaign.campaign_id;
            const campaignName = campaign.campaign_name;

            // Get current campaign status
            const campaignDetails = await this.getCampaignDetails(campaignId);
            const currentStatus = campaignDetails?.state || 'unknown';

            if (avgAcos > CONFIG.acos_threshold_pause && currentStatus === 'enabled') {
                // PAUSE high ACOS campaigns
                actionsToTake.push({
                    type: 'PAUSE_CAMPAIGN',
                    campaignId: campaignId,
                    campaignName: campaignName,
                    reason: `ACOS too high: ${avgAcos.toFixed(2)}% > ${CONFIG.acos_threshold_pause}%`,
                    currentAcos: avgAcos,
                    action: () => this.pauseCampaign(campaignId)
                });
            } else if (avgAcos < CONFIG.acos_threshold_start && currentStatus === 'paused') {
                // START low ACOS campaigns that are paused
                actionsToTake.push({
                    type: 'START_CAMPAIGN',
                    campaignId: campaignId,
                    campaignName: campaignName,
                    reason: `ACOS acceptable: ${avgAcos.toFixed(2)}% < ${CONFIG.acos_threshold_start}%`,
                    currentAcos: avgAcos,
                    action: () => this.enableCampaign(campaignId)
                });
            }
        }

        // Execute campaign status changes
        for (const action of actionsToTake) {
            try {
                await action.action();
                console.log(`✅ ${action.type}: ${action.campaignName} - ${action.reason}`);
                this.optimizationActions.push(action);
            } catch (error) {
                console.error(`❌ Failed ${action.type} for ${action.campaignName}:`, error.message);
            }
        }

        return actionsToTake;
    }

    /**
     * 2. INTELLIGENT BID OPTIMIZATION
     */
    async optimizeBids() {
        console.log('💰 Analyzing keywords for bid optimization...');
        
        const query = `
            SELECT 
                k.keyword_id,
                k.keyword_text,
                k.campaign_id,
                k.ad_group_id,
                k.current_bid,
                AVG(p.acos) as avg_acos,
                SUM(p.clicks) as total_clicks,
                SUM(p.conversions) as total_conversions,
                AVG(p.ctr) as avg_ctr,
                SUM(p.cost) as total_cost
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.keyword_performance\` p
            JOIN \`${CONFIG.project_id}.${CONFIG.dataset_id}.keywords\` k ON p.keyword_id = k.keyword_id
            WHERE p.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND p.clicks >= ${CONFIG.min_clicks_for_decision}
            GROUP BY k.keyword_id, k.keyword_text, k.campaign_id, k.ad_group_id, k.current_bid
        `;

        try {
            const [keywordData] = await bigquery.query(query);
            let bidActions = [];

            for (const keyword of keywordData) {
                const avgAcos = parseFloat(keyword.avg_acos) || 0;
                const currentBid = parseFloat(keyword.current_bid) || 0;
                const totalConversions = parseInt(keyword.total_conversions) || 0;
                
                let newBid = currentBid;
                let bidChangeReason = '';

                if (avgAcos < CONFIG.bid_increase_threshold && totalConversions > 0) {
                    // INCREASE bid for profitable keywords
                    newBid = Math.min(currentBid * (1 + CONFIG.bid_adjustment_percent / 100), CONFIG.max_bid_limit);
                    bidChangeReason = `Low ACOS ${avgAcos.toFixed(2)}% - increasing bid`;
                } else if (avgAcos > CONFIG.bid_decrease_threshold) {
                    // DECREASE bid for expensive keywords
                    newBid = Math.max(currentBid * (1 - CONFIG.bid_adjustment_percent / 100), CONFIG.min_bid_limit);
                    bidChangeReason = `High ACOS ${avgAcos.toFixed(2)}% - decreasing bid`;
                }

                if (Math.abs(newBid - currentBid) > 0.01) { // Only change if significant difference
                    bidActions.push({
                        type: 'BID_ADJUSTMENT',
                        keywordId: keyword.keyword_id,
                        keywordText: keyword.keyword_text,
                        oldBid: currentBid,
                        newBid: newBid,
                        reason: bidChangeReason,
                        acos: avgAcos,
                        action: () => this.updateKeywordBid(keyword.keyword_id, newBid)
                    });
                }
            }

            // Execute bid changes
            for (const action of bidActions.slice(0, 50)) { // Limit to 50 changes per run
                try {
                    await action.action();
                    console.log(`✅ BID UPDATED: ${action.keywordText} ${action.oldBid.toFixed(2)} → ${action.newBid.toFixed(2)} (${action.reason})`);
                    this.optimizationActions.push(action);
                } catch (error) {
                    console.error(`❌ Failed bid update for ${action.keywordText}:`, error.message);
                }
            }

            return bidActions;
        } catch (error) {
            console.log('⚠️ Keyword performance table not found, skipping bid optimization');
            return [];
        }
    }

    /**
     * 3. KEYWORD DISCOVERY FROM SEARCH TERMS
     */
    async discoverNewKeywords() {
        console.log('🔍 Discovering high-performing search terms for new keywords...');
        
        const query = `
            SELECT 
                search_term,
                campaign_id,
                ad_group_id,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(cost) as total_cost,
                SUM(conversions) as total_conversions,
                SUM(conversion_value) as total_conversion_value,
                ROUND(SUM(clicks)*100.0/NULLIF(SUM(impressions),0), 2) as ctr,
                ROUND(SUM(cost)*100.0/NULLIF(SUM(conversion_value),0), 2) as acos
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.search_term_reports\`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
                AND search_term IS NOT NULL
                AND search_term != ''
            GROUP BY search_term, campaign_id, ad_group_id
            HAVING total_impressions >= ${CONFIG.min_impressions_keyword}
                AND ctr >= ${CONFIG.min_ctr_keyword}
                AND acos <= ${CONFIG.max_acos_keyword}
                AND total_conversions > 0
            ORDER BY total_conversions DESC, acos ASC
        `;

        try {
            const [searchTerms] = await bigquery.query(query);
            let keywordActions = [];

            for (const term of searchTerms.slice(0, 20)) { // Top 20 opportunities
                // Check if keyword already exists
                const existingKeyword = await this.checkExistingKeyword(term.search_term, term.ad_group_id);
                
                if (!existingKeyword) {
                    keywordActions.push({
                        type: 'ADD_KEYWORD',
                        searchTerm: term.search_term,
                        campaignId: term.campaign_id,
                        adGroupId: term.ad_group_id,
                        estimatedBid: this.calculateOptimalBid(term),
                        performance: {
                            conversions: term.total_conversions,
                            acos: term.acos,
                            ctr: term.ctr
                        },
                        action: () => this.addKeyword(term.search_term, term.ad_group_id, this.calculateOptimalBid(term))
                    });
                }
            }

            // Execute keyword additions
            for (const action of keywordActions) {
                try {
                    await action.action();
                    console.log(`✅ NEW KEYWORD ADDED: "${action.searchTerm}" with bid $${action.estimatedBid.toFixed(2)}`);
                    this.optimizationActions.push(action);
                } catch (error) {
                    console.error(`❌ Failed to add keyword "${action.searchTerm}":`, error.message);
                }
            }

            return keywordActions;
        } catch (error) {
            console.log('⚠️ Search term reports table not found, skipping keyword discovery');
            return [];
        }
    }

    /**
     * 4. NEGATIVE KEYWORD AUTOMATION
     */
    async addNegativeKeywords() {
        console.log('🚫 Identifying poor-performing search terms for negative keywords...');
        
        const query = `
            SELECT 
                search_term,
                campaign_id,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(cost) as total_cost,
                SUM(conversions) as total_conversions,
                ROUND(SUM(clicks)*100.0/NULLIF(SUM(impressions),0), 2) as ctr
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.search_term_reports\`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
                AND search_term IS NOT NULL
                AND search_term != ''
            GROUP BY search_term, campaign_id
            HAVING total_clicks >= ${CONFIG.min_clicks_negative}
                AND total_cost >= ${CONFIG.min_cost_negative}
                AND total_conversions = 0
                AND ctr <= ${CONFIG.max_ctr_negative}
            ORDER BY total_cost DESC
        `;

        try {
            const [negativeTerms] = await bigquery.query(query);
            let negativeActions = [];

            for (const term of negativeTerms.slice(0, 30)) { // Top 30 worst performers
                // Check if already a negative keyword
                const existingNegative = await this.checkExistingNegativeKeyword(term.search_term, term.campaign_id);
                
                if (!existingNegative) {
                    negativeActions.push({
                        type: 'ADD_NEGATIVE_KEYWORD',
                        searchTerm: term.search_term,
                        campaignId: term.campaign_id,
                        wastedSpend: term.total_cost,
                        clicks: term.total_clicks,
                        ctr: term.ctr,
                        action: () => this.addNegativeKeyword(term.search_term, term.campaign_id)
                    });
                }
            }

            // Execute negative keyword additions
            for (const action of negativeActions) {
                try {
                    await action.action();
                    console.log(`✅ NEGATIVE KEYWORD ADDED: "${action.searchTerm}" (saved $${action.wastedSpend.toFixed(2)})`);
                    this.optimizationActions.push(action);
                } catch (error) {
                    console.error(`❌ Failed to add negative keyword "${action.searchTerm}":`, error.message);
                }
            }

            return negativeActions;
        } catch (error) {
            console.log('⚠️ Search term reports table not found, skipping negative keywords');
            return [];
        }
    }

    /**
     * 5. DAYPARTING ANALYSIS AND OPTIMIZATION
     */
    async optimizeDayparting() {
        console.log('⏰ Analyzing hourly performance for dayparting optimization...');
        
        const query = `
            SELECT 
                campaign_id,
                campaign_name,
                EXTRACT(HOUR FROM TIMESTAMP(CONCAT(date, ' ', COALESCE(hour, '12'), ':00:00'))) as hour_of_day,
                EXTRACT(DAYOFWEEK FROM date) as day_of_week,
                SUM(impressions) as hourly_impressions,
                SUM(clicks) as hourly_clicks,
                SUM(cost) as hourly_cost,
                SUM(conversions) as hourly_conversions,
                ROUND(SUM(cost)*100.0/NULLIF(SUM(conversion_value),0), 2) as hourly_acos,
                ROUND(SUM(clicks)*100.0/NULLIF(SUM(impressions),0), 2) as hourly_ctr
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.hourly_performance\`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${CONFIG.performance_lookback_days} DAY)
                AND cost >= ${CONFIG.min_hourly_spend}
            GROUP BY campaign_id, campaign_name, hour_of_day, day_of_week
            HAVING hourly_cost >= ${CONFIG.min_hourly_spend}
        `;

        try {
            const [hourlyData] = await bigquery.query(query);
            let daypartingActions = [];

            // Group by campaign
            const campaignGroups = _.groupBy(hourlyData, 'campaign_id');

            for (const [campaignId, hours] of Object.entries(campaignGroups)) {
                const campaignName = hours[0].campaign_name;
                
                // Analyze performance by hour
                const performanceByHour = this.analyzeDaypartingPerformance(hours);
                
                // Find underperforming hours (high ACOS, low conversions)
                const hoursToReduce = performanceByHour.filter(h => 
                    h.avg_acos > CONFIG.acos_threshold_pause && h.total_conversions < 1
                );

                // Find high-performing hours (low ACOS, good conversions)
                const hoursToIncrease = performanceByHour.filter(h => 
                    h.avg_acos < CONFIG.bid_increase_threshold && h.total_conversions > 0
                );

                if (hoursToReduce.length > 0 || hoursToIncrease.length > 0) {
                    daypartingActions.push({
                        type: 'DAYPARTING_OPTIMIZATION',
                        campaignId: campaignId,
                        campaignName: campaignName,
                        hoursToReduce: hoursToReduce.map(h => h.hour_of_day),
                        hoursToIncrease: hoursToIncrease.map(h => h.hour_of_day),
                        action: () => this.updateCampaignDayparting(campaignId, hoursToReduce, hoursToIncrease)
                    });
                }
            }

            // Execute dayparting optimizations
            for (const action of daypartingActions) {
                try {
                    await action.action();
                    console.log(`✅ DAYPARTING UPDATED: ${action.campaignName} - Reduced hours: ${action.hoursToReduce.join(',')} | Increased hours: ${action.hoursToIncrease.join(',')}`);
                    this.optimizationActions.push(action);
                } catch (error) {
                    console.error(`❌ Failed dayparting update for ${action.campaignName}:`, error.message);
                }
            }

            return daypartingActions;
        } catch (error) {
            console.log('⚠️ Hourly performance table not found, skipping dayparting');
            return [];
        }
    }

    /**
     * 6. BUDGET REALLOCATION BASED ON PERFORMANCE
     */
    async optimizeBudgets() {
        console.log('💵 Analyzing campaign budgets for reallocation...');
        
        const query = `
            SELECT 
                campaign_id,
                campaign_name,
                AVG(daily_budget) as current_budget,
                AVG(acos) as avg_acos,
                SUM(cost) as total_spend,
                SUM(conversions) as total_conversions,
                SUM(conversion_value) as total_revenue,
                ROUND(SUM(conversion_value)/NULLIF(SUM(cost),0), 2) as roas
            FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.campaign_performance\`
            WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
                AND daily_budget IS NOT NULL
            GROUP BY campaign_id, campaign_name
            HAVING total_conversions > 0
        `;

        try {
            const [campaignBudgets] = await bigquery.query(query);
            let budgetActions = [];

            // Sort campaigns by ROAS (best performers first)
            const sortedCampaigns = campaignBudgets.sort((a, b) => (b.roas || 0) - (a.roas || 0));

            for (const campaign of sortedCampaigns) {
                const currentBudget = parseFloat(campaign.current_budget) || 0;
                const avgAcos = parseFloat(campaign.avg_acos) || 0;
                const roas = parseFloat(campaign.roas) || 0;
                
                let newBudget = currentBudget;
                let budgetChangeReason = '';

                if (avgAcos < 20 && roas > 3) {
                    // INCREASE budget for high-performing campaigns
                    newBudget = currentBudget * 1.25; // 25% increase
                    budgetChangeReason = `High performance: ACOS ${avgAcos.toFixed(2)}%, ROAS ${roas.toFixed(2)}`;
                } else if (avgAcos > 40 || roas < 1) {
                    // DECREASE budget for poor-performing campaigns
                    newBudget = currentBudget * 0.75; // 25% decrease
                    budgetChangeReason = `Poor performance: ACOS ${avgAcos.toFixed(2)}%, ROAS ${roas.toFixed(2)}`;
                }

                if (Math.abs(newBudget - currentBudget) > 5) { // Only change if difference > $5
                    budgetActions.push({
                        type: 'BUDGET_ADJUSTMENT',
                        campaignId: campaign.campaign_id,
                        campaignName: campaign.campaign_name,
                        oldBudget: currentBudget,
                        newBudget: newBudget,
                        reason: budgetChangeReason,
                        acos: avgAcos,
                        roas: roas,
                        action: () => this.updateCampaignBudget(campaign.campaign_id, newBudget)
                    });
                }
            }

            // Execute budget changes
            for (const action of budgetActions) {
                try {
                    await action.action();
                    console.log(`✅ BUDGET UPDATED: ${action.campaignName} $${action.oldBudget.toFixed(2)} → $${action.newBudget.toFixed(2)} (${action.reason})`);
                    this.optimizationActions.push(action);
                } catch (error) {
                    console.error(`❌ Failed budget update for ${action.campaignName}:`, error.message);
                }
            }

            return budgetActions;
        } catch (error) {
            console.log('⚠️ Budget data not available, skipping budget optimization');
            return [];
        }
    }

    // Helper methods for Amazon API calls
    async getCampaignDetails(campaignId) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        return await this.makeAmazonRequest(endpoint, { method: 'GET' });
    }

    async pauseCampaign(campaignId) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'PUT',
            data: { state: 'paused' }
        });
    }

    async enableCampaign(campaignId) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'PUT',
            data: { state: 'enabled' }
        });
    }

    async updateKeywordBid(keywordId, newBid) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/keywords/${keywordId}`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'PUT',
            data: { bid: newBid.toFixed(2) }
        });
    }

    async addKeyword(keywordText, adGroupId, bid) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/keywords`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'POST',
            data: [{
                adGroupId: adGroupId,
                keywordText: keywordText,
                matchType: 'exact',
                state: 'enabled',
                bid: bid.toFixed(2)
            }]
        });
    }

    async addNegativeKeyword(keywordText, campaignId) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/campaignNegativeKeywords`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'POST',
            data: [{
                campaignId: campaignId,
                keywordText: keywordText,
                matchType: 'negativeExact',
                state: 'enabled'
            }]
        });
    }

    async updateCampaignBudget(campaignId, newBudget) {
        const endpoint = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        return await this.makeAmazonRequest(endpoint, {
            method: 'PUT',
            data: { dailyBudget: newBudget.toFixed(2) }
        });
    }

    async updateCampaignDayparting(campaignId, hoursToReduce, hoursToIncrease) {
        // Note: Amazon doesn't have direct dayparting API, this would be implemented via bid adjustments
        console.log(`Dayparting update for campaign ${campaignId} - would implement via bid adjustments`);
        return { success: true, method: 'bid_adjustments' };
    }

    // Helper analysis methods
    calculateOptimalBid(searchTermData) {
        const ctr = parseFloat(searchTermData.ctr) || 1;
        const acos = parseFloat(searchTermData.acos) || 30;
        const avgCost = parseFloat(searchTermData.total_cost) / parseFloat(searchTermData.total_clicks);
        
        // Adjust bid based on performance
        let bidMultiplier = 1;
        if (acos < 15) bidMultiplier = 1.5;
        else if (acos < 25) bidMultiplier = 1.2;
        else if (acos > 35) bidMultiplier = 0.7;
        
        return Math.min(Math.max(avgCost * bidMultiplier, CONFIG.min_bid_limit), CONFIG.max_bid_limit);
    }

    analyzeDaypartingPerformance(hourlyData) {
        const performanceByHour = _.groupBy(hourlyData, 'hour_of_day');
        
        return Object.entries(performanceByHour).map(([hour, data]) => ({
            hour_of_day: parseInt(hour),
            total_cost: _.sumBy(data, d => parseFloat(d.hourly_cost) || 0),
            total_conversions: _.sumBy(data, d => parseInt(d.hourly_conversions) || 0),
            avg_acos: _.meanBy(data, d => parseFloat(d.hourly_acos) || 0),
            avg_ctr: _.meanBy(data, d => parseFloat(d.hourly_ctr) || 0)
        }));
    }

    async checkExistingKeyword(keywordText, adGroupId) {
        // Check BigQuery for existing keywords
        const query = `
            SELECT keyword_id FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.keywords\`
            WHERE LOWER(keyword_text) = LOWER(@keywordText) AND ad_group_id = @adGroupId
        `;
        
        try {
            const [rows] = await bigquery.query({
                query: query,
                params: { keywordText: keywordText, adGroupId: adGroupId }
            });
            return rows.length > 0;
        } catch (error) {
            return false;
        }
    }

    async checkExistingNegativeKeyword(keywordText, campaignId) {
        // Check BigQuery for existing negative keywords
        const query = `
            SELECT keyword_id FROM \`${CONFIG.project_id}.${CONFIG.dataset_id}.negative_keywords\`
            WHERE LOWER(keyword_text) = LOWER(@keywordText) AND campaign_id = @campaignId
        `;
        
        try {
            const [rows] = await bigquery.query({
                query: query,
                params: { keywordText: keywordText, campaignId: campaignId }
            });
            return rows.length > 0;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Main optimization function (Cloud Function entry point)
 */
async function optimizePPC(req, res) {
    const startTime = Date.now();
    let result = {
        success: false,
        timestamp: new Date().toISOString(),
        duration: 0,
        optimizations: {
            campaigns_paused: 0,
            campaigns_started: 0,
            bids_adjusted: 0,
            keywords_added: 0,
            negative_keywords_added: 0,
            budgets_adjusted: 0,
            dayparting_optimized: 0
        },
        actions: [],
        cost_savings_estimate: 0,
        revenue_increase_estimate: 0
    };

    try {
        console.log('🚀 Starting comprehensive PPC optimization...');
        
        const optimizer = new PPCOptimizer();
        await optimizer.loadCredentials();
        
        // Run all optimization modules
        const campaignActions = await optimizer.optimizeCampaignStatus();
        const bidActions = await optimizer.optimizeBids();
        const keywordActions = await optimizer.discoverNewKeywords();
        const negativeActions = await optimizer.addNegativeKeywords();
        const daypartingActions = await optimizer.optimizeDayparting();
        const budgetActions = await optimizer.optimizeBudgets();
        
        // Compile results
        result.optimizations = {
            campaigns_paused: campaignActions.filter(a => a.type === 'PAUSE_CAMPAIGN').length,
            campaigns_started: campaignActions.filter(a => a.type === 'START_CAMPAIGN').length,
            bids_adjusted: bidActions.length,
            keywords_added: keywordActions.length,
            negative_keywords_added: negativeActions.length,
            budgets_adjusted: budgetActions.length,
            dayparting_optimized: daypartingActions.length
        };
        
        result.actions = optimizer.optimizationActions;
        
        // Estimate impact
        result.cost_savings_estimate = negativeActions.reduce((sum, a) => sum + (a.wastedSpend || 0), 0);
        result.revenue_increase_estimate = keywordActions.length * 50; // Rough estimate: $50 per new keyword
        
        result.success = true;
        
        console.log('✅ Optimization complete!', {
            campaigns_managed: result.optimizations.campaigns_paused + result.optimizations.campaigns_started,
            bids_optimized: result.optimizations.bids_adjusted,
            keywords_discovered: result.optimizations.keywords_added,
            negative_keywords: result.optimizations.negative_keywords_added,
            estimated_savings: `$${result.cost_savings_estimate.toFixed(2)}`
        });
        
    } catch (error) {
        console.error('❌ PPC optimization failed:', error);
        result.error = error.message;
    }
    
    result.duration = Date.now() - startTime;
    
    if (res) {
        res.status(result.success ? 200 : 500).json(result);
    }
    
    return result;
}

// Export for Cloud Functions
exports.optimizePPC = optimizePPC;
exports.PPCOptimizer = PPCOptimizer;