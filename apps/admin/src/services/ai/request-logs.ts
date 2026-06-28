import { baseGetRequest } from "@/utils/axios";

export interface RequestLog {
  _id: string;
  consumerKey?: any;
  consumerKeyPreview?: string;
  ownerUser?: any;
  aiModel?: any;
  modelName?: string;
  providerModel?: any;
  provider?: any;
  upstreamModel?: string;
  status: "success" | "error";
  stream: boolean;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  chargedIntegral?: number;
  upstreamCost?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  billingStatus?: string;
  isFallback?: boolean;
  fallbackIndex?: number;
  latencyMs?: number;
  upstreamStatus?: number;
  errorMessage?: string;
  createdAt?: string;
}

export const getRequestLogsList = (params: any) => baseGetRequest("/ai/request-logs")(params);
