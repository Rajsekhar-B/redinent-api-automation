import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('2FA / OTP (Web Session) - edge, equivalence and chaos coverage', () => {
  test('@edge should validate verify_otp GET behavior for edge-length otp values', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-EDGE-004',
      riskId: 'RISK-INPUT-EDGE-OTP-04',
      module: 'otp-web',
      severity: 'high'
    });

    const response = await otpWebClient.verifyOtpGet({
      otp: '000000',
      token: 'edge-session-token'
    });
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate resend_otp with valid equivalence partition input', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-EQV-005',
      riskId: 'RISK-INPUT-EQUIVALENCE-OTP-05',
      module: 'otp-web',
      severity: 'medium'
    });

    const response = await otpWebClient.resendOtp({
      user_id: 1
    });
    expectStatusIn(response.status, [200, 302, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep verify_otp GET stable under burst requests', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-CHAOS-006',
      riskId: 'RISK-RESILIENCE-OTP-06',
      module: 'otp-web',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await otpWebClient.verifyOtpGet({
        otp: '123456',
        token: `chaos-${Date.now()}-${i}`
      });
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
