import { APIRequestContext, APIResponse } from '@playwright/test';
import { RequestHelper } from '../core/request-helper';
import { TokenManager } from '../auth/token-manager';

export class BaseApiClient {
  protected readonly requestHelper: RequestHelper;

  constructor(
    protected readonly request: APIRequestContext,
    protected readonly tokenManager: TokenManager
  ) {
    this.requestHelper = new RequestHelper(request);
  }

  protected async get(url: string, query?: Record<string, string | number | boolean>): Promise<APIResponse> {
    const authHeaders = await this.tokenManager.getAuthHeaders();
    const { response } = await this.requestHelper.send({ method: 'GET', url, query, headers: authHeaders });
    return response;
  }

  protected async post(url: string, data?: unknown): Promise<APIResponse> {
    const authHeaders = await this.tokenManager.getAuthHeaders();
    const { response } = await this.requestHelper.send({ method: 'POST', url, data, headers: authHeaders });
    return response;
  }

  protected async put(url: string, data?: unknown): Promise<APIResponse> {
    const authHeaders = await this.tokenManager.getAuthHeaders();
    const { response } = await this.requestHelper.send({ method: 'PUT', url, data, headers: authHeaders });
    return response;
  }

  protected async patch(url: string, data?: unknown): Promise<APIResponse> {
    const authHeaders = await this.tokenManager.getAuthHeaders();
    const { response } = await this.requestHelper.send({ method: 'PATCH', url, data, headers: authHeaders });
    return response;
  }

  protected async delete(url: string): Promise<APIResponse> {
    const authHeaders = await this.tokenManager.getAuthHeaders();
    const { response } = await this.requestHelper.send({ method: 'DELETE', url, headers: authHeaders });
    return response;
  }
}
