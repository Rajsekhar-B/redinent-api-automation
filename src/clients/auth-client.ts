import { APIRequestContext } from '@playwright/test';
import { endpointMap } from '../config/endpoints';
import { ApiLoginRequest, ApiLoginResponse } from '../models/auth.model';

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(payload: ApiLoginRequest): Promise<{ status: number; body: ApiLoginResponse }> {
    const response = await this.request.post(endpointMap.auth.login, { data: payload });
    const body = (await response.json()) as ApiLoginResponse;
    return { status: response.status(), body };
  }

  async logout(headers?: Record<string, string>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.request.delete(endpointMap.auth.logout, {
      headers
    });

    const contentType = response.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      return { status: response.status(), body: (await response.json()) as Record<string, unknown> };
    }

    return { status: response.status(), body: {} };
  }
}
