import { z } from 'zod';
import { addTestMetadata } from '../../src/core/test-metadata';
import { validateSchema } from '../../src/core/response-validator';
import { test, expect } from '../fixtures/api.fixture';

const locationsSchema = z.object({
  data: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable().optional(),
      position: z.object({
        lat: z.number(),
        long: z.number()
      })
    })
  ),
  status: z.string()
});

test.describe('Reports APIs', () => {
  test('@regression should fetch locations from /api/reports/get_locations', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-LOC-001',
      riskId: 'RISK-DATA-INTEGRITY-02',
      module: 'reports',
      severity: 'high'
    });

    const response = await reportsClient.getLocations();
    expect(response.status).toBe(200);

    const parsed = validateSchema(locationsSchema, response.body);
    expect(parsed.status).toBe('success');
    expect(Array.isArray(parsed.data)).toBeTruthy();
  });

  test('@regression should validate query-driven endpoint behavior for get_device_count', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-QRY-004',
      riskId: 'RISK-INPUT-VALIDATION-03',
      module: 'reports',
      severity: 'medium'
    });

    const response = await reportsClient.getDeviceCount({
      location: 'sample-location',
      latitude: '0.0',
      longitude: '0.0',
      device_type: 'camera'
    });

    expect([200, 400]).toContain(response.status);
  });
});
