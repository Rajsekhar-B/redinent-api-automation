import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { createCorrelationId } from './correlation';
import { logger } from './logger';
import { withRetry } from './retry';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  query?: Record<string, string | number | boolean>;
  data?: unknown;
  headers?: Record<string, string>;
  retryCount?: number;
}

export class RequestHelper {
  constructor(private readonly request: APIRequestContext) {}

  async send(options: RequestOptions): Promise<{ response: APIResponse; correlationId: string }> {
    const correlationId = createCorrelationId();
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-correlation-id': correlationId,
      ...options.headers
    };

    const execute = async (): Promise<APIResponse> => {
      const response = await this.request.fetch(options.url, {
        method: options.method,
        headers,
        params: options.query,
        data: options.data,
        timeout: env.REQUEST_TIMEOUT_MS
      });

      logger.info({
        request: { method: options.method, url: options.url, correlationId },
        response: { status: response.status() }
      });

      return response;
    };

    const response = await withRetry(
      execute,
      options.retryCount ?? env.MAX_RETRY_COUNT,
      (error) => {
        const message = error instanceof Error ? error.message : 'unknown';
        return /ECONNRESET|ETIMEDOUT|429|5\d\d/.test(message);
      }
    );

    return { response, correlationId };
  }
}
