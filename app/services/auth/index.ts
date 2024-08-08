import { basePostRequest } from "../../utils/axios";
import { LoginRequest, LoginResponse, RegisterRequest } from "./interface";

interface RefreshTokenRequestData {
  refreshToken: string;
}

// auth/refresh-token post
export const postRefreshToken = (data: RefreshTokenRequestData) =>
  basePostRequest("/auth/refresh-token")(data);

// /auth/login post
export const postLogin = (data: LoginRequest): Promise<LoginResponse> =>
  basePostRequest("/auth/login")(data);

// /auth/register post
export const postRegister = (data: RegisterRequest): Promise<LoginResponse> =>
  basePostRequest("/auth/register")(data);

// /system/email/register/captcha
export const getEmailCaptcha = (email: string) =>
  basePostRequest("/auth/register/captcha")({ email });

// /auth/logout post
export const postLogout = (data: any) => basePostRequest("/auth/logout")(data);
