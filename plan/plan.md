# FunnelSight - Marketing Intelligence Platform

## Product Overview

FunnelSight is a unified intelligence layer that helps marketers understand what's driving event registrations and outcomes by automatically combining and analyzing marketing and event data from multiple sources.

## Core Value Proposition

**One place that tells marketers clearly and automatically what is actually driving event registrations and success across all marketing channels and data sources.**

## User Personas

1. **Marketers** - Primary users who need to understand campaign performance
2. **Event Managers** - Track event success metrics and attendance
3. **Analysts** - Deep dive into data correlations and trends
4. **Stakeholders** - View reports and summaries

## Core Features

### 1. Data Source Management

**User Stories:**
- As a marketer, I want to connect multiple data sources so all my data is in one place
- As a user, I want data to refresh automatically so insights are always current
- As a user, I want to see which data sources are connected and their sync status

**Data Models:**
- **DataSource**: id, userId, type (spreadsheet, google_analytics, crm, ad_platform, event_tool), name, connectionConfig (JSON), status (connected, syncing, error), lastSyncAt, createdAt
- **DataSync**: id, dataSourceId, status, recordsProcessed, errors, startedAt, completedAt

**Supported Source Types:**
- Spreadsheets (CSV/Excel upload)
- Google Analytics
- CRM Systems (Salesforce, HubSpot)
- Ad Platforms (LinkedIn Ads, Facebook Ads, Google Ads)
- Event Management Tools (Eventbrite, Zoom, custom webhooks)

### 2. Unified Data Layer

**User Stories:**
- As a marketer, I want the system to automatically link marketing activities to event registrations
- As a user, I want to see how different data points are connected
- As a user, I want the system to handle missing or inconsistent data gracefully

**Data Models:**
- **UnifiedRecord**: id, eventId, email, campaignName, utmSource, utmMedium, utmCampaign, registrationId, attendanceStatus, engagementScore, dataSourceId, rawData (JSON), createdAt, updatedAt
- **IdentifierMapping**: id, sourceIdentifier, targetIdentifier, identifierType (email, campaign, utm, registration_id), confidence, createdAt

**Key Functionality:**
- Automatic identifier alignment (email, campaign name, UTM codes, registration IDs)
- Fuzzy matching for inconsistent data
- Confidence scoring for matches
- Data quality indicators

### 3. Events Management

**User Stories:**
- As an event manager, I want to create and track events
- As a marketer, I want to see which events are upcoming vs past
- As a user, I want to track multiple event types with different metrics

**Data Models:**
- **Event**: id, userId, name, type (webinar, conference, workshop, trade_show), status (upcoming, live, completed), startDate, endDate, targetRegistrations, actualRegistrations, attendanceCount, engagementScore, description, createdAt, updatedAt
- **EventMetric**: id, eventId, metricType (registrations, attendance_rate, engagement, conversion), value, timestamp, metadata (JSON)

**Event Timeline Features:**
- Overlay marketing performance against event timelines
- Track pre-event marketing push
- Post-event engagement tracking

### 4. Campaign Performance Tracking

**User Stories:**
- As a marketer, I want to see which campaigns drive the most registrations
- As a user, I want to understand campaign quality (not just volume)
- As a marketer, I want to compare campaign performance across channels

**Data Models:**
- **Campaign**: id, userId, name, channel (linkedin, facebook, google, email, organic), status, budget, spend, impressions, clicks, registrations, attendees, conversionRate, qualityScore, startDate, endDate, metadata (JSON), createdAt
- **CampaignMetric**: id, campaignId, metricType (impressions, clicks, registrations, cost_per_registration), value, date, createdAt

### 5. AI-Powered Insights

**User Stories:**
- As a marketer, I want automatic insights about what's working
- As a user, I want to understand correlations between marketing and event success
- As a stakeholder, I want natural language summaries I can share

**Data Models:**
- **Insight**: id, userId, eventId, type (performance, correlation, anomaly, recommendation), title, description, impact (high, medium, low), metrics (JSON), generatedAt, acknowledgedAt
- **InsightComment**: id, insightId, userId, comment, createdAt

**Insight Types:**
- Channel performance ("X% of registrations came from LinkedIn Ads")
- Quality metrics ("Email campaigns drove highest-quality leads")
- Correlations ("Marketing push 3 weeks before event = 40% higher attendance")
- Anomalies ("Unusual spike in Facebook ad registrations")
- Recommendations ("Consider increasing LinkedIn budget based on ROI")

### 6. Interactive Dashboard

**User Stories:**
- As a marketer, I want a visual overview of funnel performance
- As a user, I want to explore data by filtering and drilling down
- As a stakeholder, I want to see key takeaways at a glance

**Dashboard Layers:**
- Funnel Performance (top-of-funnel to conversion)
- Campaign Impact (by channel and campaign)
- Registration Sources (attribution breakdown)
- Attendance Trends (over time and by source)
- Conversion Attribution (multi-touch)

**Visualizations:**
- Funnel charts
- Time series graphs
- Attribution pie/bar charts
- Heatmaps for timeline overlay
- Trend indicators

### 7. Collaboration & Reporting

**User Stories:**
- As a marketer, I want to share dashboards with my team
- As a stakeholder, I want to export reports for presentations
- As a team, we want to discuss insights together

**Data Models:**
- **Dashboard**: id, userId, name, eventIds (array), filters (JSON), layout (JSON), isShared, createdAt, updatedAt
- **DashboardShare**: id, dashboardId, sharedWithUserId, permission (view, comment), createdAt
- **Export**: id, userId, dashboardId, format (pdf, csv, png), url, createdAt, expiresAt

### 8. User Management & Authentication

**User Stories:**
- As a user, I want to securely log in
- As an admin, I want to manage team access
- As a user, I want to control my data sources

**Data Models:**
- **User**: id, email, name, role (admin, marketer, event_manager, analyst, stakeholder), teamId, avatarUrl, createdAt, updatedAt
- **Team**: id, name, plan (free, pro, enterprise), settings (JSON), createdAt

## Technical Considerations

### Data Integration Strategy
- Polling-based sync for most sources (every 15-60 minutes)
- Webhook support for real-time updates (event platforms)
- Batch processing for large datasets
- Error handling and retry logic

### AI/ML Features
- LLM-based insight generation (Claude API)
- Pattern recognition in marketing data
- Anomaly detection
- Natural language summary generation
- Fallback to rule-based insights if AI unavailable

### Performance Requirements
- Handle datasets with 100K+ records
- Dashboard loads in <3 seconds
- Real-time filtering and drill-down
- Background processing for data sync

### Data Privacy & Security
- Encrypted data storage
- Role-based access control
- Audit logs for data access
- GDPR compliance features

## User Flows

### Primary Flow: Connect Data → See Insights
1. User signs up and logs in
2. User connects first data source (e.g., Google Analytics)
3. User creates an event
4. User connects ad platform (e.g., LinkedIn Ads)
5. System automatically syncs and links data
6. Dashboard populates with insights
7. User explores correlations and exports report

### Secondary Flow: Event Performance Analysis
1. User selects specific event
2. Views timeline with marketing overlay
3. Explores registration sources
4. Reviews AI-generated insights
5. Comments on insights with team
6. Exports summary for stakeholders

### Tertiary Flow: Campaign Optimization
1. User views all campaigns dashboard
2. Filters by channel or date range
3. Compares ROI across campaigns
4. Reads recommendation insights
5. Adjusts future campaign strategy

## Success Metrics

- Time to first insight: <10 minutes after connecting first data source
- Data freshness: <1 hour lag for most sources
- Insight accuracy: 80%+ correlation validation
- User engagement: Daily active usage for campaign periods
- Export usage: Reports shared with stakeholders weekly

## Future Enhancements (Out of Scope for MVP)

- Predictive analytics (forecasting event success)
- A/B test tracking
- Budget optimization recommendations
- Integration marketplace
- Custom metric builder
- API for external integrations
- Mobile app
