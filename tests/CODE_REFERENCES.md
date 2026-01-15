# Code References - Key Files for Issues

## 1. Insight Engine (Template-Based, Not LLM)
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/lib/insights/insight-engine.ts`

The insight engine defines 8 hardcoded templates instead of calling real LLM:

```typescript
export class InsightEngine {
  private templates: InsightTemplate[] = [
    {
      id: 'top_channel',
      category: 'top_performer',
      priority: 9,
      condition: (data) => data.topChannel && data.topChannel.percentage > 50,
      generate: (data) => ({
        id: `top_channel_${Date.now()}`,
        category: 'top_performer',
        priority: 9,
        title: `${data.topChannel.name} Dominates Registration Sources`,
        narrative: `${data.topChannel.name} was the dominant driver this period...`
        // ... etc
      })
    },
    // ... 7 more templates
  ];
```

**Lines 55-291**: All template definitions
**Line 297-317**: generateInsights() method - just evaluates conditions, no LLM call

---

## 2. Insights Endpoint (No LLM Integration)
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/insights.ts`

```typescript
router.get('/api/insights/natural-language', authMiddleware(), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const campaigns = await storage.getCampaigns(userId);
    
    // Aggregates metrics...
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    
    // NO ANTHROPIC SDK IMPORTED OR USED
    const insights = insightEngine.generateInsights(analyticsData);
    
    res.json({
      success: true,
      insights,
      summary: { ... }
    });
  } catch (error) { ... }
});
```

**Key Finding**: No import of Anthropic SDK, no API call to Claude

---

## 3. Campaign Creation Bug (Multi-Channel Issue)
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/spreadsheets.ts`

Lines 160-209:
```typescript
// Extract unique campaigns from validated data
const campaignNames = new Set<string>();
validationResult.valid.forEach((row) => {
  if (row.campaignName) {
    campaignNames.add(row.campaignName);  // KEY: Groups by NAME only
  }
});

// Create campaigns if they don't exist
for (const campaignName of campaignNames) {
  // ...
  // Determine channel from UTM source or default
  const firstRowWithCampaign = validationResult.valid
    .find(r => r.campaignName === campaignName);  // Takes FIRST row
  if (firstRowWithCampaign?.utmSource) {
    const source = firstRowWithCampaign.utmSource.toLowerCase();
    // Assigns channel based on FIRST row only
    if (source.includes('linkedin')) channel = 'linkedin';
  }
```

**Problem**: Groups by campaign_name, not by channel. First row's channel applies to all.

---

## 4. Zero-Cost Validation Error
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/shared/schema.zod.ts`

```typescript
export const marketingDataRowSchema = z.object({
  // ... other fields
  cost: z.number().positive().optional(),  // REJECTS 0 or free campaigns
  impressions: z.number().int().nonnegative().optional(),
  // ...
});
```

**Fix**: Change to `z.number().nonnegative().optional()`

---

## 5. Attendee Count Not Imported
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/spreadsheets.ts`

Lines 296-350:
```typescript
// Update campaign totals
const campaign = await storage.getCampaign(campaignId);
if (campaign) {
  await storage.updateCampaign(campaignId, {
    impressions: (campaign.impressions || 0) + (row.impressions || 0),
    clicks: (campaign.clicks || 0) + (row.clicks || 0),
    registrations: (campaign.registrations || 0) + (row.conversions || 0),
    attendees: (campaign.attendees || 0) + (row.attendees || 0),  // Added here
    spend: (campaign.spend || 0) + (row.cost || 0),
  });
}
```

**Line 308**: Should add attendees correctly, but result shows 0
**Root Cause**: Unknown - need to debug storage.updateCampaign() method

---

## 6. Missing Anthropic SDK
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/package.json`

**Finding**: No `@anthropic-ai/sdk` or `anthropic` dependency installed

**Codebase Search Results**:
- grep: No imports of anthropic SDK anywhere
- No Anthropic API calls anywhere in codebase
- API_KEY configured in .env but unused

---

## 7. Environment Configuration
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/.env`

```
ANTHROPIC_API_KEY=sk-ant-api03-REDACTED
```

**Status**: Key is configured but NOT USED

---

## Summary of File Locations

| Issue | File Path |
|-------|-----------|
| Template-based insights | `/server/lib/insights/insight-engine.ts` |
| Insights endpoint (no LLM) | `/server/routes/insights.ts` |
| Campaign creation bug | `/server/routes/spreadsheets.ts` (lines 160-209) |
| Zero-cost validation | `/shared/schema.zod.ts` |
| Attendee count issue | `/server/routes/spreadsheets.ts` (line 308) |
| Missing SDK | `/package.json` |

