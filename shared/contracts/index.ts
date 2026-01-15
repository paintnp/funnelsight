import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';
import { dataSourcesContract } from './data-sources.contract';
import { eventsContract } from './events.contract';
import { campaignsContract } from './campaigns.contract';
import { insightsContract } from './insights.contract';
import { dashboardsContract } from './dashboards.contract';
import { analyticsContract } from './analytics.contract';
import { spreadsheetContract } from './spreadsheet.contract';

const c = initContract();

export const contract = c.router({
  auth: authContract,
  dataSources: dataSourcesContract,
  events: eventsContract,
  campaigns: campaignsContract,
  insights: insightsContract,
  dashboards: dashboardsContract,
  analytics: analyticsContract,
  spreadsheets: spreadsheetContract,
});

export type AppContract = typeof contract;
