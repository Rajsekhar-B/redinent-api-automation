export interface ApiResponseEnvelope<T> {
  data: T;
  status: 'success' | string;
}

export interface LocationPoint {
  name: string;
  description: string | null;
  position: {
    lat: number;
    long: number;
  };
}

export interface ApiKeyGuardResponse {
  success: boolean;
  stats: unknown;
  status: number;
}
