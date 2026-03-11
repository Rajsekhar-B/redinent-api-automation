import { APIRequestContext, request as playwrightRequest, test as base } from '@playwright/test';
import { TokenManager } from '../../src/auth/token-manager';
import { AuthClient } from '../../src/clients/auth-client';
import { ReportsClient } from '../../src/clients/reports-client';
import { TenantsClient } from '../../src/clients/tenants-client';
import { DevicesClient } from '../../src/clients/devices-client';
import { DiscoveriesClient } from '../../src/clients/discoveries-client';
import { UsersClient } from '../../src/clients/users-client';
import { DiagnosticsClient } from '../../src/clients/diagnostics-client';
import { OemSignaturesClient } from '../../src/clients/oem-signatures-client';
import { UptimeMonitoringClient } from '../../src/clients/uptime-monitoring-client';
import { AssetGroupClient } from '../../src/clients/asset-group-client';
import { AppUpdateHistoryClient } from '../../src/clients/app-update-history-client';
import { IntegratorsClient } from '../../src/clients/integrators-client';
import { DiscoveryTemplatesClient } from '../../src/clients/discovery-templates-client';
import { ZipUploadsClient } from '../../src/clients/zip-uploads-client';
import { CweResultsClient } from '../../src/clients/cwe-results-client';
import { HomeDashboardsClient } from '../../src/clients/home-dashboards-client';
import { ComparisonDashboardClient } from '../../src/clients/comparison-dashboard-client';
import { ApplicationUtilitiesClient } from '../../src/clients/application-utilities-client';
import { OtpWebClient } from '../../src/clients/otp-web-client';
import { OtherClient } from '../../src/clients/other-client';
import { env } from '../../src/config/env';

type ApiFixtures = {
  apiRequest: APIRequestContext;
  tokenManager: TokenManager;
  authClient: AuthClient;
  reportsClient: ReportsClient;
  tenantsClient: TenantsClient;
  devicesClient: DevicesClient;
  discoveriesClient: DiscoveriesClient;
  usersClient: UsersClient;
  diagnosticsClient: DiagnosticsClient;
  oemSignaturesClient: OemSignaturesClient;
  uptimeMonitoringClient: UptimeMonitoringClient;
  assetGroupClient: AssetGroupClient;
  appUpdateHistoryClient: AppUpdateHistoryClient;
  integratorsClient: IntegratorsClient;
  discoveryTemplatesClient: DiscoveryTemplatesClient;
  zipUploadsClient: ZipUploadsClient;
  cweResultsClient: CweResultsClient;
  homeDashboardsClient: HomeDashboardsClient;
  comparisonDashboardClient: ComparisonDashboardClient;
  applicationUtilitiesClient: ApplicationUtilitiesClient;
  otpWebClient: OtpWebClient;
  otherClient: OtherClient;
};

export const test = base.extend<ApiFixtures>({
  // Playwright fixture signature requires object destructuring for the first arg.
  // eslint-disable-next-line no-empty-pattern
  apiRequest: async ({}, use) => {
    const req = await playwrightRequest.newContext({
      baseURL: env.BASE_URL
    });

    await use(req);
    await req.dispose();
  },

  tokenManager: async ({ apiRequest }, use) => {
    const tokenManager = new TokenManager(apiRequest);
    await use(tokenManager);
  },

  authClient: async ({ apiRequest }, use) => {
    await use(new AuthClient(apiRequest));
  },

  reportsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new ReportsClient(apiRequest, tokenManager));
  },

  tenantsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new TenantsClient(apiRequest, tokenManager));
  },

  devicesClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new DevicesClient(apiRequest, tokenManager));
  },

  discoveriesClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new DiscoveriesClient(apiRequest, tokenManager));
  },

  usersClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new UsersClient(apiRequest, tokenManager));
  },

  diagnosticsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new DiagnosticsClient(apiRequest, tokenManager));
  },

  oemSignaturesClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new OemSignaturesClient(apiRequest, tokenManager));
  },

  uptimeMonitoringClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new UptimeMonitoringClient(apiRequest, tokenManager));
  },

  assetGroupClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new AssetGroupClient(apiRequest, tokenManager));
  },

  appUpdateHistoryClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new AppUpdateHistoryClient(apiRequest, tokenManager));
  },

  integratorsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new IntegratorsClient(apiRequest, tokenManager));
  },

  discoveryTemplatesClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new DiscoveryTemplatesClient(apiRequest, tokenManager));
  },

  zipUploadsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new ZipUploadsClient(apiRequest, tokenManager));
  },

  cweResultsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new CweResultsClient(apiRequest, tokenManager));
  },

  homeDashboardsClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new HomeDashboardsClient(apiRequest, tokenManager));
  },

  comparisonDashboardClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new ComparisonDashboardClient(apiRequest, tokenManager));
  },

  applicationUtilitiesClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new ApplicationUtilitiesClient(apiRequest, tokenManager));
  },

  otpWebClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new OtpWebClient(apiRequest, tokenManager));
  },

  otherClient: async ({ apiRequest, tokenManager }, use) => {
    await use(new OtherClient(apiRequest, tokenManager));
  }
});

export { expect } from '@playwright/test';
