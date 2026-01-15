#!/usr/bin/env tsx

/**
 * Setup Demo Account Script
 * Creates a demo account (a@b.com) with realistic marketing campaign data
 * and generates AI insights for showcase purposes.
 */

import 'dotenv/config';

const API_URL = 'https://funnelsight.fly.dev';

interface AuthResponse {
  user: any;
  token: string;
}

interface CampaignData {
  campaign_name: string;
  utm_source: string;
  utm_medium?: string;
  utm_campaign?: string;
  impressions: number;
  clicks: number;
  cost: number;
  registrations: number;
  attendees: number;
  date?: string;
}

// Demo account credentials
const DEMO_EMAIL = 'a@b.com';
const DEMO_PASSWORD = '12345678';
const DEMO_NAME = 'Demo User';

// Realistic campaign datasets
const Q1_WEBINAR_CAMPAIGNS: CampaignData[] = [
  {
    campaign_name: 'Q1 Product Launch Webinar',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'product-launch-search',
    impressions: 45000,
    clicks: 1350,
    cost: 2700,
    registrations: 405,
    attendees: 283,
    date: '2025-01-15'
  },
  {
    campaign_name: 'Q1 Product Launch Webinar',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: 'product-launch-social',
    impressions: 120000,
    clicks: 2400,
    cost: 1800,
    registrations: 528,
    attendees: 369,
    date: '2025-01-15'
  },
  {
    campaign_name: 'Q1 Product Launch Webinar',
    utm_source: 'email',
    utm_medium: 'email',
    utm_campaign: 'product-launch-newsletter',
    impressions: 25000,
    clicks: 1875,
    cost: 0,
    registrations: 656,
    attendees: 459,
    date: '2025-01-15'
  },
  {
    campaign_name: 'Q1 Product Launch Webinar',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: 'product-launch-linkedin',
    impressions: 18000,
    clicks: 720,
    cost: 1440,
    registrations: 302,
    attendees: 211,
    date: '2025-01-15'
  }
];

const RETARGETING_CAMPAIGNS: CampaignData[] = [
  {
    campaign_name: 'Retargeting - Free Trial Offer',
    utm_source: 'google',
    utm_medium: 'display',
    utm_campaign: 'retarget-trial-gdn',
    impressions: 85000,
    clicks: 850,
    cost: 1275,
    registrations: 213,
    attendees: 170,
    date: '2025-02-01'
  },
  {
    campaign_name: 'Retargeting - Free Trial Offer',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: 'retarget-trial-fb',
    impressions: 95000,
    clicks: 1425,
    cost: 950,
    registrations: 285,
    attendees: 228,
    date: '2025-02-01'
  },
  {
    campaign_name: 'Retargeting - Free Trial Offer',
    utm_source: 'email',
    utm_medium: 'email',
    utm_campaign: 'retarget-trial-nurture',
    impressions: 18000,
    clicks: 1260,
    cost: 0,
    registrations: 378,
    attendees: 302,
    date: '2025-02-01'
  }
];

const SEO_CONTENT_CAMPAIGNS: CampaignData[] = [
  {
    campaign_name: 'SEO Content Marketing Initiative',
    utm_source: 'organic',
    utm_medium: 'organic',
    utm_campaign: 'seo-blog-content',
    impressions: 150000,
    clicks: 4500,
    cost: 0,
    registrations: 315,
    attendees: 252,
    date: '2025-02-15'
  },
  {
    campaign_name: 'SEO Content Marketing Initiative',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'seo-featured-snippets',
    impressions: 75000,
    clicks: 3000,
    cost: 0,
    registrations: 210,
    attendees: 168,
    date: '2025-02-15'
  }
];

const PARTNER_CAMPAIGNS: CampaignData[] = [
  {
    campaign_name: 'Partner Co-Marketing Webinar',
    utm_source: 'partner',
    utm_medium: 'referral',
    utm_campaign: 'acme-corp-partnership',
    impressions: 12000,
    clicks: 840,
    cost: 500,
    registrations: 294,
    attendees: 235,
    date: '2025-03-01'
  },
  {
    campaign_name: 'Partner Co-Marketing Webinar',
    utm_source: 'email',
    utm_medium: 'email',
    utm_campaign: 'partner-email-blast',
    impressions: 30000,
    clicks: 2100,
    cost: 0,
    registrations: 420,
    attendees: 336,
    date: '2025-03-01'
  }
];

async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

async function createOrLoginDemoAccount(): Promise<string> {
  console.log('🔐 Setting up demo account...');

  try {
    // Try to login first
    const loginResponse: AuthResponse = await apiCall('/api/auth/login', 'POST', {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    console.log('✅ Demo account already exists, logged in successfully');
    return loginResponse.token;
  } catch (error) {
    // Account doesn't exist, create it
    console.log('📝 Creating new demo account...');
    const signupResponse: AuthResponse = await apiCall('/api/auth/signup', 'POST', {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
      role: 'marketer',
    });
    console.log('✅ Demo account created successfully');
    return signupResponse.token;
  }
}

function createCSVContent(campaigns: CampaignData[]): string {
  const headers = 'campaign_name,utm_source,utm_medium,utm_campaign,impressions,clicks,cost,registrations,attendees,date\n';
  const rows = campaigns.map(c =>
    `"${c.campaign_name}","${c.utm_source}","${c.utm_medium || ''}","${c.utm_campaign || ''}",${c.impressions},${c.clicks},${c.cost},${c.registrations},${c.attendees},"${c.date || ''}"`
  ).join('\n');
  return headers + rows;
}

async function uploadCampaignCSV(token: string, csvContent: string, filename: string) {
  console.log(`📤 Uploading ${filename}...`);

  // Create FormData-like structure (for JSON API)
  const campaigns = csvContent.split('\n').slice(1).filter(line => line.trim()).map(line => {
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(p => p.replace(/^"|"$/g, ''));
    if (!parts || parts.length < 9) return null;

    return {
      campaign_name: parts[0],
      utm_source: parts[1],
      utm_medium: parts[2] || undefined,
      utm_campaign: parts[3] || undefined,
      impressions: parseInt(parts[4]),
      clicks: parseInt(parts[5]),
      cost: parseFloat(parts[6]),
      registrations: parseInt(parts[7]),
      attendees: parseInt(parts[8]),
      date: parts[9] || undefined,
    };
  }).filter(Boolean);

  const response = await apiCall('/api/spreadsheets/import', 'POST', { campaigns }, token);
  console.log(`✅ Uploaded ${filename}: ${campaigns.length} campaigns imported`);
  return response;
}

async function generateAIInsights(token: string) {
  console.log('🤖 Generating AI insights...');

  try {
    const response = await apiCall('/api/insights/generate', 'POST', {
      prompt: 'Analyze our marketing campaigns and provide strategic insights on performance, ROI, and recommendations for optimization.'
    }, token);
    console.log('✅ AI insights generated successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to generate AI insights:', error);
    throw error;
  }
}

async function verifyDashboardData(token: string) {
  console.log('🔍 Verifying dashboard data...');

  // Get campaigns
  const campaigns = await apiCall('/api/campaigns', 'GET', undefined, token);
  console.log(`✅ Campaigns: ${campaigns.length} total`);

  // Get insights
  const insights = await apiCall('/api/insights', 'GET', undefined, token);
  console.log(`✅ Insights: ${insights.length} total`);

  // Calculate totals
  const totalImpressions = campaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
  const totalCost = campaigns.reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
  const totalRegistrations = campaigns.reduce((sum: number, c: any) => sum + (c.registrations || 0), 0);
  const totalAttendees = campaigns.reduce((sum: number, c: any) => sum + (c.attendees || 0), 0);

  console.log('\n📊 Campaign Summary:');
  console.log(`   Impressions: ${totalImpressions.toLocaleString()}`);
  console.log(`   Clicks: ${totalClicks.toLocaleString()}`);
  console.log(`   Cost: $${totalCost.toLocaleString()}`);
  console.log(`   Registrations: ${totalRegistrations.toLocaleString()}`);
  console.log(`   Attendees: ${totalAttendees.toLocaleString()}`);
  console.log(`   CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
  console.log(`   Conversion Rate: ${((totalRegistrations / totalClicks) * 100).toFixed(2)}%`);
  console.log(`   Cost per Registration: $${(totalCost / totalRegistrations).toFixed(2)}`);
}

async function main() {
  console.log('🚀 FunnelSight Demo Account Setup\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    // Step 1: Create/login demo account
    const token = await createOrLoginDemoAccount();

    // Step 2: Upload campaign datasets
    console.log('\n📊 Uploading campaign datasets...\n');

    const q1WebinarCSV = createCSVContent(Q1_WEBINAR_CAMPAIGNS);
    await uploadCampaignCSV(token, q1WebinarCSV, 'Q1_Product_Launch_Webinar.csv');

    const retargetingCSV = createCSVContent(RETARGETING_CAMPAIGNS);
    await uploadCampaignCSV(token, retargetingCSV, 'Retargeting_Free_Trial.csv');

    const seoContentCSV = createCSVContent(SEO_CONTENT_CAMPAIGNS);
    await uploadCampaignCSV(token, seoContentCSV, 'SEO_Content_Marketing.csv');

    const partnerCSV = createCSVContent(PARTNER_CAMPAIGNS);
    await uploadCampaignCSV(token, partnerCSV, 'Partner_Co_Marketing.csv');

    // Step 3: Generate AI insights
    console.log('\n🤖 Generating AI insights...\n');
    await generateAIInsights(token);

    // Step 4: Verify data
    console.log('\n🔍 Verifying dashboard data...\n');
    await verifyDashboardData(token);

    console.log('\n✨ Demo account setup complete!\n');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`\n🌐 Access dashboard: ${API_URL}/dashboard\n`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
