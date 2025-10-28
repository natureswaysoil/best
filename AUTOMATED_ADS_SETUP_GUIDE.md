# Automated Online Advertising System
## Multi-Platform Ad Campaign Management for Nature's Way Soil

---

## Overview

This automated advertising system generates and manages seasonal ad campaigns across:
- **Google Ads** - Search and display advertising
- **Meta Ads** - Facebook and Instagram advertising  
- **Pinterest Ads** - Pinterest promoted pins

### Key Features
✅ Seasonal campaign generation (Spring, Summer, Fall, Winter)  
✅ A/B testing with multiple ad variations  
✅ Automated targeting and bidding  
✅ Performance monitoring and reporting  
✅ ROI tracking across all platforms  

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Credentials

**Option A: Using Google Secret Manager** (Recommended if credentials are already there)
```bash
# Set your Google Cloud project
export GOOGLE_CLOUD_PROJECT=your-project-id

# Fetch credentials from Secret Manager
npm run ads:fetch-secrets
```

See `GOOGLE_SECRET_MANAGER_GUIDE.md` for detailed instructions.

**Option B: Manual Configuration**

Add these to your `.env.local` file:

```bash
# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_ADS_CUSTOMER_ID=your_customer_id_here

# Meta (Facebook/Instagram) Ads
META_ACCESS_TOKEN=your_meta_access_token_here
META_AD_ACCOUNT_ID=your_ad_account_id_here

# Pinterest Ads
PINTEREST_ACCESS_TOKEN=your_pinterest_access_token_here
PINTEREST_AD_ACCOUNT_ID=your_pinterest_ad_account_id_here
```

### 3. Generate Seasonal Campaigns
```bash
npm run ads:generate
```

This creates:
- `seasonal-ad-campaign-{season}.json` - Complete campaign configuration
- `ad-performance-tracker.json` - Performance tracking template

### 4. Review and Deploy
```bash
npm run ads:deploy
```

This prepares deployment files:
- `google-ads-deployment.json`
- `meta-ads-deployment.json`
- `pinterest-ads-deployment.json`
- `ad-deployment-summary.json`

**Note**: Campaigns start in PAUSED status for your review.

### 5. Monitor Performance
```bash
npm run ads:monitor
```

View real-time performance metrics across all platforms.

---

## Getting API Credentials

### Google Ads Setup

1. **Create Google Ads Account**
   - Go to: https://ads.google.com
   - Sign up or log in
   - Note your Customer ID (format: 123-456-7890)

2. **Get Developer Token**
   - Visit: https://ads.google.com/aw/apicenter
   - Request developer token (may take 24 hours for approval)

3. **Set Up OAuth 2.0**
   - Go to: https://console.cloud.google.com
   - Create new project or select existing
   - Enable "Google Ads API"
   - Create OAuth 2.0 credentials
   - Download client ID and secret

4. **Generate Refresh Token**
   ```bash
   # Use Google's OAuth playground
   # https://developers.google.com/oauthplayground
   ```

**Documentation**: https://developers.google.com/google-ads/api/docs/start

---

### Meta (Facebook/Instagram) Ads Setup

1. **Create Meta Business Account**
   - Go to: https://business.facebook.com
   - Create business account
   - Add ad account

2. **Create Meta App**
   - Visit: https://developers.facebook.com
   - Create new app
   - Add "Marketing API" product

3. **Get Access Token**
   - Go to Tools → Access Token Debugger
   - Generate long-lived token (60 days)
   - For permanent token, request "ads_management" permission

4. **Find Ad Account ID**
   - Go to Meta Ads Manager
   - Settings → Ad Account Settings
   - Copy Account ID (format: act_1234567890)

**Documentation**: https://developers.facebook.com/docs/marketing-apis

---

### Pinterest Ads Setup

1. **Create Pinterest Business Account**
   - Go to: https://business.pinterest.com
   - Convert to business account
   - Set up ad account

2. **Create Pinterest App**
   - Visit: https://developers.pinterest.com
   - Create new app
   - Request "Ads" scope access

3. **Get Access Token**
   - Generate OAuth token with ads permissions
   - Token format: `pina_XXXXXXXXXXXXXXXXXXXXXX`

4. **Find Ad Account ID**
   - Go to Pinterest Ads Manager
   - Copy account ID from URL

**Documentation**: https://developers.pinterest.com/docs/api/v5/

---

## Seasonal Campaign Strategy

The system automatically generates campaigns based on the current season:

### 🌸 Spring (March - May)
**Focus**: Garden preparation, planting, transplanting  
**Products**: Fertilizers, compost, seedling care  
**Keywords**: spring planting, garden prep, transplanting, new growth  
**Budget**: Higher (peak season)

### ☀️ Summer (June - August)
**Focus**: Growth, maintenance, lawn care  
**Products**: Growth boosters, lawn fertilizers, tomato care  
**Keywords**: summer garden, growth boost, tomato season, lawn care  
**Budget**: Highest (maximum activity)

### 🍂 Fall (September - November)
**Focus**: Soil preparation, winter prep  
**Products**: Soil amendments, biochar, compost  
**Keywords**: fall planting, soil prep, compost, winter prep  
**Budget**: Medium (preparation season)

### ❄️ Winter (December - February)
**Focus**: Indoor gardening, planning  
**Products**: House plant fertilizers, terrariums  
**Keywords**: house plants, indoor gardening, terrarium  
**Budget**: Lower (off-season)

---

## Campaign Structure

### Ad Copy Variations (A/B Testing)

Each product gets 4 ad variations:

1. **Feature-Focused**
   - Highlights specific product features
   - Technical benefits
   - Example: "Contains billions of beneficial microbes"

2. **Benefit-Focused**
   - Emphasizes results and outcomes
   - Emotional appeal
   - Example: "Transform your garden with..."

3. **Urgency-Focused**
   - Limited time offers
   - Seasonal timing
   - Example: "Get ready for spring planting!"

4. **Question-Based**
   - Engages curiosity
   - Problem-solving angle
   - Example: "Ready for spring planting season?"

### Targeting Strategy

**Demographics**:
- Age: 25-65
- Interests: Organic gardening, sustainable living, home improvement

**Keywords** (Google Ads):
- Broad match: General gardening terms
- Phrase match: Product categories
- Exact match: Specific product names

**Geographic**:
- United States (expandable)
- Can be refined by state/region

---

## Budget Recommendations

### Starting Budgets (Per Platform)

**Google Ads**: $50/day
- High intent search traffic
- Best conversion rates
- Start here for quick results

**Meta Ads**: $30/day
- Broad reach
- Good for brand awareness
- Lower cost per impression

**Pinterest Ads**: $20/day
- Visual product showcase
- Good for inspiration/discovery
- Already proven with organic pins

**Total**: $100/day = $3,000/month

### Scaling Strategy

**Week 1-2**: Start with minimum budgets, gather data  
**Week 3-4**: Increase budget on best-performing platforms  
**Month 2+**: Optimize based on ROI, scale winners

---

## Performance Metrics

### Key Performance Indicators (KPIs)

**Impressions**: How many people saw your ads  
**Click-Through Rate (CTR)**: % of people who clicked  
- Target: 1-3% (industry average)

**Cost Per Click (CPC)**: Average cost per ad click  
- Target: $1-3 for search ads

**Conversion Rate**: % of clicks that purchased  
- Target: 2-5%

**Cost Per Conversion**: Total cost ÷ conversions  
- Target: <$50 (based on product margins)

**Return on Ad Spend (ROAS)**: Revenue ÷ ad spend  
- Target: 3:1 minimum (300% ROAS)

---

## Monitoring & Optimization

### Daily Tasks
```bash
npm run ads:monitor
```
- Check performance metrics
- Review alerts
- Pause underperforming ads

### Weekly Tasks
- Analyze which ad variations perform best
- Adjust bids based on conversion data
- Add negative keywords (Google Ads)
- Test new ad copy

### Monthly Tasks
- Full performance review
- Budget reallocation
- Seasonal campaign updates
- Competitor analysis

---

## Automation Schedule

### Recommended Cron Schedule

```bash
# Generate new seasonal campaigns (1st of each month)
0 0 1 * * npm run ads:generate

# Daily performance monitoring (9 AM)
0 9 * * * npm run ads:monitor

# Weekly optimization report (Monday 9 AM)
0 9 * * 1 npm run ads:monitor > reports/weekly-$(date +\%Y-\%m-\%d).txt
```

---

## Troubleshooting

### "No credentials" Error
**Solution**: Add API tokens to `.env.local` file

### "Campaign already exists" Error
**Solution**: Campaigns are season-based. Each season generates once.

### High Cost Per Conversion
**Solutions**:
1. Pause poor-performing ad variations
2. Refine targeting (exclude irrelevant audiences)
3. Improve landing pages
4. Adjust bids downward

### Low Click-Through Rate
**Solutions**:
1. Test new ad copy variations
2. Improve product images
3. More compelling call-to-action
4. Better keyword targeting

---

## Advanced Features

### Custom Campaigns

Edit generated JSON files before deployment to:
- Adjust budgets per product
- Change targeting parameters
- Add custom ad copy
- Modify bidding strategies

### Integration with Analytics

The system tracks:
- Campaign performance by season
- Product performance across platforms
- Historical data (30-day retention)
- ROI per platform

### Multi-Account Support

To run ads for multiple brands:
1. Duplicate scripts folder
2. Update environment variables with account-specific credentials
3. Run each system independently

---

## Cost Estimate

### Setup Costs
- **Google Ads**: Free (pay per click)
- **Meta Ads**: Free (pay per impression/click)
- **Pinterest Ads**: Free (pay per engagement)
- **Development**: $0 (system included)

### Monthly Operating Costs
- **Ad Spend**: $100/day × 30 = $3,000/month
- **Platform Fees**: Included in ad spend
- **Maintenance**: Automated (minimal time)

### Expected Results (Conservative)
- **Clicks**: ~1,000/month (1% CTR on 100,000 impressions)
- **Conversions**: ~30/month (3% conversion rate)
- **Revenue**: ~$900/month (30 × $30 avg order)
- **ROAS**: 0.3:1 (need optimization to reach 3:1 target)

**Note**: Real results vary. Optimize continuously for best ROI.

---

## Support & Resources

### Official Documentation
- [Google Ads API](https://developers.google.com/google-ads/api)
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Pinterest Ads API](https://developers.pinterest.com/docs/api/v5/)

### Learning Resources
- Google Skillshop (free Google Ads training)
- Meta Blueprint (free Meta Ads training)
- Pinterest Academy (free Pinterest Ads training)

### Community
- Stack Overflow (technical issues)
- Platform-specific support forums
- Google Ads Community
- Meta Business Help Center

---

## Next Steps

1. ✅ **Get API Credentials**
   - Start with one platform
   - Google Ads recommended (highest intent)

2. ✅ **Generate First Campaign**
   ```bash
   npm run ads:generate
   ```

3. ✅ **Review Campaign Files**
   - Check generated JSON files
   - Verify targeting and budgets

4. ✅ **Test Small Budget**
   - Start with $10-20/day
   - Learn platform mechanics
   - Gather initial data

5. ✅ **Monitor & Optimize**
   - Daily checks first week
   - Pause poor performers
   - Scale winners

6. ✅ **Scale Up**
   - Increase budget on proven campaigns
   - Expand to additional platforms
   - Add more products

---

## Questions?

For technical issues with the automation system:
- Check this documentation first
- Review generated JSON files
- Test with small budgets

For platform-specific ad questions:
- Consult official platform documentation
- Use platform support forums
- Consider hiring ad specialist for optimization

---

**Last Updated**: October 28, 2025  
**System Version**: 1.0  
**Platforms Supported**: Google Ads, Meta Ads, Pinterest Ads
