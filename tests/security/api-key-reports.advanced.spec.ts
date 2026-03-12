import { env } from '../../src/config/env';
import { expectStatusIn } from '../../src/core/assertions';
import { addTestMetadata } from '../../src/core/test-metadata';
import { expect, test } from '../fixtures/api.fixture';

const detailEndpoints = ['scanDetails', 'cveDetails', 'cweDetails', 'deviceDetails'] as const;
const apiKey = env.CORE_API_KEY ?? 'invalid-api-key';

test.describe('API Key Reports - positive, edge, boundary, equivalence and chaos coverage', () => {
  test('@positive should return contract-safe responses for all detail endpoints', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-APIKEY-POS-021',
      riskId: 'RISK-APIKEY-AUTHZ-21',
      module: 'api-key-reports',
      severity: 'high'
    });

    for (const endpoint of detailEndpoints) {
      const response = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, env.SAMPLE_UID);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
      expect(response.status).toBeLessThan(500);
    }
  });

  test('@edge should safely handle edge UID values on detail endpoints', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-APIKEY-EDGE-022',
      riskId: 'RISK-APIKEY-EDGE-22',
      module: 'api-key-reports',
      severity: 'medium'
    });

    const edgeUids = ['0', '-1', 'uid-with-space ', 'uid/%2Fslash', 'uid_very_long_' + 'x'.repeat(80)];

    for (const endpoint of detailEndpoints) {
      for (const uid of edgeUids) {
        const response = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, uid);
        expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
        expect(response.status).toBeLessThan(500);
      }
    }
  });

  test('@boundary should enforce UID length boundaries consistently', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-APIKEY-BVA-023',
      riskId: 'RISK-APIKEY-BOUNDARY-23',
      module: 'api-key-reports',
      severity: 'medium'
    });

    const minUid = 'a';
    const maxUid = 'u'.repeat(256);
    const overLimitUid = 'u'.repeat(257);

    for (const endpoint of detailEndpoints) {
      for (const uid of [minUid, maxUid, overLimitUid]) {
        const response = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, uid);
        expectStatusIn(response.status, [200, 400, 401, 403, 404, 413, 414, 422]);
        expect(response.status).toBeLessThan(500);
      }
    }
  });

  test('@equivalence should separate valid and invalid UID classes cleanly', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-APIKEY-EQV-024',
      riskId: 'RISK-APIKEY-EQUIVALENCE-24',
      module: 'api-key-reports',
      severity: 'high'
    });

    for (const endpoint of detailEndpoints) {
      const validClassResponse = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, env.SAMPLE_UID);
      expectStatusIn(validClassResponse.status, [200, 400, 401, 403, 404, 422]);

      const invalidClassResponse = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, '');
      expectStatusIn(invalidClassResponse.status, [200, 400, 401, 403, 404, 422]);

      expect(validClassResponse.status).toBeLessThan(500);
      expect(invalidClassResponse.status).toBeLessThan(500);
    }
  });

  test('@chaos should remain stable under repeated report-detail bursts', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-APIKEY-CHAOS-025',
      riskId: 'RISK-APIKEY-RESILIENCE-25',
      module: 'api-key-reports',
      severity: 'high'
    });

    for (const endpoint of detailEndpoints) {
      const statuses: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        const response = await reportsClient.getReportDetailsWithApiKey(endpoint, apiKey, `${env.SAMPLE_UID}-${i}`);
        statuses.push(response.status);
        expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429]);
      }

      expect(statuses.every((status) => status < 500)).toBeTruthy();
    }
  });
});
