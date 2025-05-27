export interface LoginRequest {
  email: string;
  password: string;
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
  email: string;
  password: string;
  captcha: number;
  invitationCode: string;
}
