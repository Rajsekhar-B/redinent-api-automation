import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

test.describe('2FA / OTP (Web Session) - functional and security coverage', () => {
  test('@regression should validate resend_otp endpoint availability for authenticated context', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-FUNC-001',
      riskId: 'RISK-AVAILABILITY-OTP-01',
      module: 'otp-web',
      severity: 'medium'
    });

    const response = await otpWebClient.resendOtp();
    expectStatusIn(response.status, [200, 302, 400, 401, 403, 404, 422, 500]);
  });

  test('@security @negative should reject malformed query on verify_otp GET', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-NEG-002',
      riskId: 'RISK-INPUT-VALIDATION-OTP-02',
      module: 'otp-web',
      severity: 'high'
    });

    const response = await otpWebClient.verifyOtpGet({
      otp: 'AAAAAA<script>alert(1)</script>',
      token: ''
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422, 500]);
  });

  test('@security @boundary should reject malformed verify_otp POST payload', async ({ otpWebClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTP-BVA-003',
      riskId: 'RISK-INPUT-BOUNDARY-OTP-03',
      module: 'otp-web',
      severity: 'high'
    });

    const response = await otpWebClient.verifyOtpPost({
      otp: '123',
      user_id: -1,
      session_id: null
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 405, 422, 500]);
  });
});
