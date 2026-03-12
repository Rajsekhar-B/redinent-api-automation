import { APIRequestContext, APIResponse } from '@playwright/test';
import { endpointMap } from '../config/endpoints';
import { ApiLoginRequest, ApiLoginResponse } from '../models/auth.model';

async function parseJsonSafe(response: APIResponse): Promise<Record<string, unknown>> {
  const contentType = response.headers()['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    return {};
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(payload: ApiLoginRequest): Promise<{ status: number; body: ApiLoginResponse }> {
    return this.loginAt(endpointMap.auth.login, payload);
  }

  async loginAt(path: string, payload: ApiLoginRequest): Promise<{ status: number; body: ApiLoginResponse }> {
    const response = await this.request.post(path, { data: payload });
    const body = (await parseJsonSafe(response)) as ApiLoginResponse;
    return { status: response.status(), body };
  }

  async getSignInAt(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.request.get(path);
    const body = await parseJsonSafe(response);
    return { status: response.status(), body };
  }

  async logout(headers?: Record<string, string>): Promise<{ status: number; body: Record<string, unknown> }> {
    return this.logoutAt(endpointMap.auth.logout, headers);
  }

  async logoutAt(path: string, headers?: Record<string, string>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.request.delete(path, {
      headers
    });
    const body = await parseJsonSafe(response);
    return { status: response.status(), body };
  }
}
