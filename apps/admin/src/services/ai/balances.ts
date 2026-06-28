import { baseGetRequest, basePutRequest } from "@/utils/axios";

export interface AiBalanceUser {
  _id: string;
  username: string;
  email: string;
  integral?: number;
  status?: number;
  enable?: boolean;
  createdAt?: string;
}

export interface AdjustBalanceData {
  integral: number;
  reason?: string;
}

export const getAiBalances = (params: any) => baseGetRequest("/ai/balances")(params);

export const adjustAiBalance = (userId: string, data: AdjustBalanceData) => basePutRequest("/ai/balances")(userId, data);

export const getAiBalanceLogs = (userId: string, params: any = {}) =>
  baseGetRequest(`/ai/balances/${userId}/logs`)(params);
