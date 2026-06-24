export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken?: string;
}

export interface LoginResponse {
  _id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  captcha?: string;
  invitationCode?: string;
  turnstileToken?: string;
}
