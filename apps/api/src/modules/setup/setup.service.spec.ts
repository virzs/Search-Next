import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { BadRequestException, ConflictException } from "@nestjs/common";
import {
  getSetupState,
  readRuntimeEnv,
  SETUP_ENVIRONMENT_CONFIGURED_KEY,
  SETUP_INITIALIZED_KEY,
} from "src/config/env";
import { SetupService } from "./setup.service";
import {
  SetupAdminCompleteDto,
  SetupEnvironmentCompleteDto,
} from "./dto/setup.dto";

const managedEnvKeys = [
  SETUP_INITIALIZED_KEY,
  SETUP_ENVIRONMENT_CONFIGURED_KEY,
  "mongo_host",
  "mongo_port",
  "mongo_username",
  "mongo_password",
  "mongo_database",
  "mongo_auth_source",
  "redis_host",
  "redis_port",
  "redis_password",
  "redis_db",
  "redis_ttl",
];

const environmentBody: SetupEnvironmentCompleteDto = {
  mongo: {
    host: "127.0.0.1",
    port: 27017,
    database: "search_next",
    username: "search_next",
    password: "secret",
    authSource: "admin",
  },
  redis: {
    host: "127.0.0.1",
    port: 6379,
    password: "",
    db: 0,
    ttl: 60,
  },
  storage: {
    service: "local",
    localPath: "./assets/uploads",
    r2: {
      accessKey: "",
      secretKey: "",
      bucket: "",
      accountId: "",
      customDomain: "",
    },
  },
};

const adminBody: SetupAdminCompleteDto = {
  admin: {
    username: "admin",
    email: "admin@example.com",
    password: "SearchNext@2026",
    confirmPassword: "SearchNext@2026",
  },
};

describe("SetupService", () => {
  const originalEnv = new Map<string, string | undefined>();
  let originalCwd: string;
  let tmpDir: string;
  let envPath: string;
  let service: SetupService;

  beforeAll(() => {
    originalCwd = process.cwd();
    for (const key of managedEnvKeys) {
      originalEnv.set(key, process.env[key]);
    }
  });

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "search-next-setup-"));
    envPath = path.join(tmpDir, ".env");
    service = new SetupService();

    for (const key of managedEnvKeys) {
      delete process.env[key];
    }
    process.chdir(tmpDir);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });

    for (const key of managedEnvKeys) {
      const value = originalEnv.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("writes environment config and moves setup into admin stage", async () => {
    fs.writeFileSync(
      envPath,
      [
        "setup_initialized=false",
        "setup_environment_configured=false",
        "PORT=9999",
      ].join("\n"),
      "utf8",
    );
    jest
      .spyOn(service as any, "runConnectionChecks")
      .mockResolvedValue({ mongo: { ok: true }, redis: { ok: true } });

    const result = await service.completeEnvironment(environmentBody);

    expect(result).toMatchObject({
      success: true,
      restartScheduled: true,
      nextStage: "admin",
    });
    expect(readRuntimeEnv(envPath)).toMatchObject({
      [SETUP_INITIALIZED_KEY]: "false",
      [SETUP_ENVIRONMENT_CONFIGURED_KEY]: "true",
      mongo_username: "search_next",
      redis_db: "0",
      storage_service: "local",
      local_storage_path: "./assets/uploads",
      PORT: "9999",
    });
    expect(getSetupState(envPath)).toMatchObject({
      initialized: false,
      environmentConfigured: true,
      mode: "app",
      stage: "admin",
    });
  });

  it("refuses to write env when connection checks fail", async () => {
    jest
      .spyOn(service as any, "runConnectionChecks")
      .mockResolvedValue({ mongo: { ok: false }, redis: { ok: true } });

    await expect(service.completeEnvironment(environmentBody)).rejects.toThrow(
      BadRequestException,
    );
    expect(fs.existsSync(envPath)).toBe(false);
  });

  it("rejects incomplete environment payloads before connection checks", async () => {
    const runConnectionChecks = jest.spyOn(
      service as any,
      "runConnectionChecks",
    );

    await expect(
      service.completeEnvironment({
        ...environmentBody,
        redis: undefined as any,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(runConnectionChecks).not.toHaveBeenCalled();
    expect(fs.existsSync(envPath)).toBe(false);
  });

  it("requires Cloudflare R2 config when R2 storage is selected", async () => {
    await expect(
      service.completeEnvironment({
        ...environmentBody,
        storage: {
          service: "r2",
          localPath: "./assets/uploads",
          r2: {
            accessKey: "key",
            secretKey: "",
            bucket: "bucket",
            accountId: "account-id",
            customDomain: "",
          },
        },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  it("writes Cloudflare R2 storage config", async () => {
    jest
      .spyOn(service as any, "runConnectionChecks")
      .mockResolvedValue({ mongo: { ok: true }, redis: { ok: true } });

    await service.completeEnvironment({
      ...environmentBody,
      storage: {
        service: "r2",
        localPath: "./assets/uploads",
        r2: {
          accessKey: "r2-access",
          secretKey: "r2-secret",
          bucket: "search-next",
          accountId: "account-id",
          customDomain: "cdn.example.com",
        },
      },
    });

    expect(readRuntimeEnv(envPath)).toMatchObject({
      storage_service: "r2",
      r2_access_key: "r2-access",
      r2_secret_key: "r2-secret",
      r2_bucket: "search-next",
      r2_account_id: "account-id",
      r2_custom_domain: "cdn.example.com",
    });
  });

  it("creates admin after restart and marks setup initialized", async () => {
    fs.writeFileSync(
      envPath,
      [
        "setup_initialized=false",
        "setup_environment_configured=true",
        "mongo_host=127.0.0.1",
        "mongo_port=27017",
        "mongo_database=search_next",
      ].join("\n"),
      "utf8",
    );
    const connection = { close: jest.fn().mockResolvedValue(undefined) };
    const initializeData = jest
      .spyOn(service as any, "initializeData")
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, "openRuntimeMongoConnection")
      .mockResolvedValue(connection);

    const result = await service.completeAdmin(adminBody);

    expect(result).toMatchObject({
      success: true,
      restartScheduled: false,
      nextStage: "done",
    });
    expect(initializeData).toHaveBeenCalledWith(connection, {
      admin: adminBody.admin,
      project: { name: "Search Next" },
    });
    expect(connection.close).toHaveBeenCalled();
    expect(readRuntimeEnv(envPath)).toMatchObject({
      [SETUP_INITIALIZED_KEY]: "true",
      [SETUP_ENVIRONMENT_CONFIGURED_KEY]: "true",
    });
  });

  it("refuses admin creation before environment is configured", async () => {
    await expect(service.completeAdmin(adminBody)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("keeps setup open when admin data initialization is rejected", async () => {
    fs.writeFileSync(
      envPath,
      "setup_initialized=false\nsetup_environment_configured=true\n",
      "utf8",
    );
    const connection = { close: jest.fn().mockResolvedValue(undefined) };
    jest
      .spyOn(service as any, "openRuntimeMongoConnection")
      .mockResolvedValue(connection);
    jest
      .spyOn(service as any, "initializeData")
      .mockRejectedValue(new ConflictException("数据库中已存在用户"));

    await expect(service.completeAdmin(adminBody)).rejects.toThrow(
      ConflictException,
    );
    expect(connection.close).toHaveBeenCalled();
    expect(readRuntimeEnv(envPath)).toMatchObject({
      [SETUP_INITIALIZED_KEY]: "false",
    });
  });
});
