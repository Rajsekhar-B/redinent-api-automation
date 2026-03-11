import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class OtpWebClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async resendOtp(params: Record<string, string | number | boolean> = {}): Promise<{ status: number; body: JsonLike }> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.set(key, String(value));
    }
    const path = query.size > 0 ? `${endpointMap.otpWeb.resendOtp}?${query.toString()}` : endpointMap.otpWeb.resendOtp;
    const response = await this.get(path);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async verifyOtpGet(params: Record<string, string | number | boolean> = {}): Promise<{ status: number; body: JsonLike }> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.set(key, String(value));
    }
    const path = query.size > 0 ? `${endpointMap.otpWeb.verifyOtpGet}?${query.toString()}` : endpointMap.otpWeb.verifyOtpGet;
    const response = await this.get(path);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async verifyOtpPost(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.otpWeb.verifyOtpPost, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
