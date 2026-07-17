export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken?: string;
  legalConfirmations?: Array<{
    documentType: "terms" | "privacy";
    revisionId: string;
  }>;
  legalConfirmationLocale?: "zh-CN" | "en-US";
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

export interface RegisterResponse {
  message: string;
  _id?: string;
  username?: string;
  createdAt?: Date;
  access_token?: string;
  refresh_token?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  captcha: number | undefined;
  invitationCode: string;
  turnstileToken?: string;
  legalConfirmations?: Array<{
    documentType: "terms" | "privacy";
    revisionId: string;
  }>;
  legalConfirmationLocale?: "zh-CN" | "en-US";
}
