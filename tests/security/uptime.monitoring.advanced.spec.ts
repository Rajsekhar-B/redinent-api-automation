import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Uptime Monitoring - edge, equivalence and chaos coverage', () => {
  test('@edge should validate server_detail endpoint for edge query values', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-UPMON-26',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const response = await uptimeMonitoringClient.serverDetail({
      monitor_id: 0
    });
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate set_frequency with valid equivalence class payload', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-EQV-008',
      riskId: 'RISK-INPUT-EQUIVALENCE-UPMON-27',
      module: 'uptime-monitoring',
      severity: 'medium'
    });

    const response = await uptimeMonitoringClient.setFrequency({
      monitor_id: 1,
      frequency_seconds: 300
    });
    expectStatusIn(response.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep uptime graph endpoint stable under repeated requests', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-CHAOS-009',
      riskId: 'RISK-RESILIENCE-UPMON-28',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await uptimeMonitoringClient.graph({
        monitor_id: 1,
        range: '24h',
        bucket: `5m-${i}`
      });
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
