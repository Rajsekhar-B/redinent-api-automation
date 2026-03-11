import path from 'path';
import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { test, expect } from '@playwright/test';

test.describe('Contract - Redinent API Sign-In Consumer Pact', () => {
  test('@contract should generate pact for /api/users/sign_in response contract', async () => {
    const provider = new PactV3({
      consumer: 'redinent-api-tests',
      provider: 'redinent-rails-api',
      dir: path.resolve(process.cwd(), 'pacts')
    });

    provider
      .given('A valid Redinent user exists')
      .uponReceiving('a valid API sign-in request')
      .withRequest({
        method: 'POST',
        path: '/api/users/sign_in',
        headers: { 'Content-Type': 'application/json' },
        body: {
          user: {
            email: MatchersV3.like('qa.sdet@redinent.example.com'),
            password: MatchersV3.like('StrongPass#123')
          }
        }
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: MatchersV3.like(true),
          message: MatchersV3.like('You sucessfully logged in'),
          response: {
            id: MatchersV3.like(1),
            email: MatchersV3.like('qa.sdet@redinent.example.com'),
            authentication_token: MatchersV3.like('sample-token')
          }
        }
      });

    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/api/users/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'qa.sdet@redinent.example.com',
            password: 'StrongPass#123'
          }
        })
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { success: boolean; response: { email: string } };
      expect(body.success).toBeTruthy();
      expect(body.response.email).toBeTruthy();
    });
  });
});
