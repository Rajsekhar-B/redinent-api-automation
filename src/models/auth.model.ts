export interface ApiLoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface ApiUser {
  id: number;
  email: string;
  role?: string;
  authentication_token?: string;
}

export interface ApiLoginResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  response?: ApiUser;
}
