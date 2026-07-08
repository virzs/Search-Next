import { baseGetRequest, basePostRequest } from "@/utils/axios";
import { getApiPrefix } from "@/utils/utils";

export interface SetupMongoConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  authSource?: string;
}

export interface SetupRedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl?: number;
}

export interface SetupStorageConfig {
  service: "local" | "r2";
  localPath?: string;
  r2?: {
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    accountId?: string;
    customDomain?: string;
  };
}

export interface SetupStatus {
  initialized: boolean;
  environmentConfigured: boolean;
  canSetup: boolean;
  mode: "app" | "setup";
  stage: "environment" | "admin" | "done";
}

export interface SetupCheckRequest {
  mongo: SetupMongoConfig;
  redis: SetupRedisConfig;
}

export interface SetupCompleteRequest extends SetupCheckRequest {
  api: {
    port: number;
  };
  storage: SetupStorageConfig;
  admin: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export type SetupEnvironmentCompleteRequest = Omit<
  SetupCompleteRequest,
  "admin"
>;

export interface SetupAdminCompleteRequest {
  admin: SetupCompleteRequest["admin"];
}

export interface SetupCheckResult {
  mongo: {
    ok: boolean;
    message?: string;
  };
  redis: {
    ok: boolean;
    message?: string;
  };
}

export interface SetupSingleCheckResult {
  ok: boolean;
  message?: string;
}

export const getSetupStatus = () =>
  baseGetRequest<SetupStatus>("/setup/status")({});

export const getSetupStatusSilently = async () => {
  const response = await fetch(getApiPrefix("/setup/status"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("setup status unavailable");
  }
  return (await response.json()) as SetupStatus;
};

export const postSetupCheck = (data: SetupCheckRequest) =>
  basePostRequest<SetupCheckResult>("/setup/check")(data);

export const postSetupCheckMongo = (data: SetupMongoConfig) =>
  basePostRequest<SetupSingleCheckResult>("/setup/check/mongo")(data);

export const postSetupCheckRedis = (data: SetupRedisConfig) =>
  basePostRequest<SetupSingleCheckResult>("/setup/check/redis")(data);

export const postSetupComplete = (data: SetupCompleteRequest) =>
  basePostRequest<{
    success: boolean;
    message?: string;
    restartScheduled?: boolean;
  }>("/setup/complete")(data);

export const postSetupEnvironmentComplete = (
  data: SetupEnvironmentCompleteRequest,
) =>
  basePostRequest<{
    success: boolean;
    message?: string;
    restartScheduled?: boolean;
    nextStage?: string;
  }>("/setup/environment/complete")(data);

export const postSetupAdminComplete = (data: SetupAdminCompleteRequest) =>
  basePostRequest<{
    success: boolean;
    message?: string;
    restartScheduled?: boolean;
    nextStage?: string;
  }>("/setup/admin/complete")(data);
