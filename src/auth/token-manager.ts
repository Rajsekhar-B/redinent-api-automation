import { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { endpointMap } from '../config/endpoints';
import { ApiLoginResponse } from '../models/auth.model';

export interface AuthHeaders {
  [key: string]: string;
}

export class TokenManager {
  private authenticated = false;
  private authHeaders: AuthHeaders = {};

  constructor(private readonly request: APIRequestContext) {}

  async getAuthHeaders(): Promise<AuthHeaders> {
    if (!this.authenticated) {
      await this.login();
    }
    return this.authHeaders;
  }

  async login(): Promise<void> {
    const response = await this.request.post(endpointMap.auth.login, {
      data: {
        user: {
          email: env.DEFAULT_USERNAME,
          password: env.DEFAULT_PASSWORD
        }
      }
    });

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }

    const json = (await response.json()) as ApiLoginResponse;
    const authToken = json.response?.authentication_token;

    if (authToken) {
      this.authHeaders = {
        [env.DEFAULT_USER_EMAIL_HEADER]: env.DEFAULT_USERNAME,
        [env.DEFAULT_USER_TOKEN_HEADER]: authToken
      };
    } else {
      this.authHeaders = {};
    }

    this.authenticated = true;
  }
}
