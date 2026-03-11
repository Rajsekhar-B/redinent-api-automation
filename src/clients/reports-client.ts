import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';
import { ApiKeyGuardResponse, ApiResponseEnvelope, LocationPoint } from '../models/report.model';

export class ReportsClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  async getLocations(): Promise<{ status: number; body: ApiResponseEnvelope<LocationPoint[]> }> {
    const response = await this.request.fetch(endpointMap.apiReports.getLocations, {
      method: 'GET'
    });
    return { status: response.status(), body: (await response.json()) as ApiResponseEnvelope<LocationPoint[]> };
  }

  async getDeviceCount(params: {
    location?: string;
    latitude?: string;
    longitude?: string;
    device_type?: string;
  }): Promise<{ status: number; body: Record<string, unknown> }> {
    const query: Record<string, string> = {};
    if (params.location) query.location = params.location;
    if (params.latitude) query.latitude = params.latitude;
    if (params.longitude) query.longitude = params.longitude;
    if (params.device_type) query.device_type = params.device_type;

    const response = await this.request.fetch(endpointMap.apiReports.getDeviceCount, {
      method: 'GET',
      params: query
    });
    return { status: response.status(), body: (await response.json()) as Record<string, unknown> };
  }

  async getApiReport(
    endpoint: keyof typeof endpointMap.apiReports,
    params?: Record<string, string>
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.request.fetch(endpointMap.apiReports[endpoint], {
      method: 'GET',
      params
    });

    const contentType = response.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      return { status: response.status(), body: (await response.json()) as Record<string, unknown> };
    }

    return { status: response.status(), body: {} };
  }

  async getScanDetailsWithApiKey(apiKey: string, uid: string): Promise<{ status: number; body: ApiKeyGuardResponse }> {
    return this.getReportDetailsWithApiKey('scanDetails', apiKey, uid);
  }

  async getReportDetailsWithApiKey(
    endpoint: keyof typeof endpointMap.reportDetails,
    apiKey: string,
    uid: string
  ): Promise<{ status: number; body: ApiKeyGuardResponse }> {
    const response = await this.request.fetch(endpointMap.reportDetails[endpoint], {
      method: 'GET',
      params: { api_key: apiKey, uid }
    });

    return { status: response.status(), body: (await response.json()) as ApiKeyGuardResponse };
  }
}
