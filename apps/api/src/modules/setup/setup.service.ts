import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import mongoose, { Connection } from "mongoose";
import { createClient } from "redis";
import {
  getSetupState,
  readRuntimeEnv,
  SETUP_ENVIRONMENT_CONFIGURED_KEY,
  SETUP_INITIALIZED_KEY,
  writeRuntimeEnv,
} from "src/config/env";
import { buildMongoUri } from "src/config/mongo-uri";
import { buildRedisUrl } from "src/config/redis-uri";
import {
  Role,
  RoleSchema,
  SYSTEM_ADMIN_ROLE_CODE,
} from "src/modules/system/role/schemas/role";
import { User, UsersSchema } from "src/modules/users/schemas/user";
import { Project, ProjectSchema } from "../system/project/schemas/project";
import { ProjectName } from "../system/project/schemas/ref-names";
import { RoleName } from "../system/role/schemas/role";
import { UsersName } from "../users/schemas/ref-names";
import {
  SetupAdminCompleteDto,
  SetupCheckDto,
  SetupCompleteDto,
  SetupEnvironmentCompleteDto,
  SetupMongoDto,
  SetupRedisDto,
} from "./dto/setup.dto";

export interface CheckResult {
  ok: boolean;
  message?: string;
}

const DEFAULT_PROJECT_NAME = "Search Next";

type InitialDataConfig = {
  admin: SetupCompleteDto["admin"];
  project: {
    name: string;
  };
};

@Injectable()
export class SetupService {
  getStatus() {
    const { initialized, environmentConfigured, canSetup, mode, stage } =
      getSetupState();
    return { initialized, environmentConfigured, canSetup, mode, stage };
  }

  async check(body: SetupCheckDto) {
    this.assertCanConfigureEnvironment();
    this.assertConnectionConfig(body);
    return await this.runConnectionChecks(body);
  }

  async checkMongoConnection(body: SetupMongoDto) {
    this.assertCanConfigureEnvironment();
    this.assertMongoConfig(body);
    return await this.checkMongo(body);
  }

  async checkRedisConnection(body: SetupRedisDto) {
    this.assertCanConfigureEnvironment();
    this.assertRedisConfig(body);
    return await this.checkRedis(body);
  }

  async complete(body: SetupCompleteDto) {
    return await this.completeEnvironment(body);
  }

  async completeEnvironment(body: SetupEnvironmentCompleteDto) {
    this.assertCanConfigureEnvironment();
    this.assertConnectionConfig(body);
    this.validateStorageConfig(body.storage);

    const checks = await this.runConnectionChecks(body);
    if (!checks.mongo.ok || !checks.redis.ok) {
      throw new BadRequestException("MongoDB 或 Redis 连接失败，请检查配置");
    }

    this.writeAndApplyRuntimeEnv(this.toEnvironmentEnvUpdates(body));
    this.scheduleRestart();

    return {
      success: true,
      restartScheduled: true,
      nextStage: "admin",
      message: "运行环境配置已保存，服务正在重启",
    };
  }

  async completeAdmin(body: SetupAdminCompleteDto) {
    this.assertCanConfigureAdmin();

    if (body.admin.password !== body.admin.confirmPassword) {
      throw new BadRequestException("两次输入的管理员密码不一致");
    }

    const connection = await this.openRuntimeMongoConnection();
    try {
      await this.initializeData(connection, {
        admin: body.admin,
        project: this.getRuntimeProjectConfig(),
      });
      this.writeAndApplyRuntimeEnv({
        [SETUP_INITIALIZED_KEY]: "true",
        [SETUP_ENVIRONMENT_CONFIGURED_KEY]: "true",
      });

      return {
        success: true,
        restartScheduled: false,
        nextStage: "done",
        message: "初始化完成",
      };
    } finally {
      await connection.close();
    }
  }

  private assertCanConfigureEnvironment() {
    const state = getSetupState();
    if (state.initialized) {
      throw new ConflictException("系统已初始化，不能再次进入引导");
    }
    if (state.environmentConfigured) {
      throw new ConflictException("运行环境已配置，请继续创建初始管理员");
    }
  }

  private assertCanConfigureAdmin() {
    const state = getSetupState();
    if (state.initialized) {
      throw new ConflictException("系统已初始化，不能再次进入引导");
    }
    if (!state.environmentConfigured) {
      throw new BadRequestException("请先完成运行环境配置");
    }
  }

  private validateStorageConfig(
    storage: SetupEnvironmentCompleteDto["storage"],
  ) {
    if (!storage) {
      throw new BadRequestException("请选择存储方式");
    }

    if (storage.service === "local") return;

    const r2 = storage.r2 ?? {};
    const missing = [
      ["accessKey", "R2 Access Key"],
      ["secretKey", "R2 Secret Key"],
      ["bucket", "R2 Bucket"],
      ["accountId", "R2 Account ID"],
    ].filter(([key]) => !r2[key as keyof typeof r2]?.trim());

    if (missing.length > 0) {
      throw new BadRequestException(
        `请填写 ${missing.map((item) => item[1]).join("、")}`,
      );
    }
  }

  private assertConnectionConfig(
    body: SetupCheckDto | undefined,
  ): asserts body is SetupCheckDto {
    if (!body) {
      throw new BadRequestException("请填写运行环境配置");
    }

    this.assertMongoConfig(body.mongo);
    this.assertRedisConfig(body.redis);
  }

  private assertMongoConfig(
    mongo: SetupMongoDto | undefined,
  ): asserts mongo is SetupMongoDto {
    if (!mongo) {
      throw new BadRequestException("请填写 MongoDB 配置");
    }
  }

  private assertRedisConfig(
    redis: SetupRedisDto | undefined,
  ): asserts redis is SetupRedisDto {
    if (!redis) {
      throw new BadRequestException("请填写 Redis 配置");
    }
  }

  private async runConnectionChecks(body: SetupCheckDto) {
    const [mongo, redis] = await Promise.all([
      this.checkMongo(body.mongo),
      this.checkRedis(body.redis),
    ]);

    return { mongo, redis };
  }

  private async checkMongo(
    mongo: SetupCheckDto["mongo"],
  ): Promise<CheckResult> {
    if (mongo.password && !mongo.username) {
      return { ok: false, message: "MongoDB 用户名不能为空" };
    }

    let connection: Connection | undefined;
    try {
      connection = await this.openMongoConnection(mongo);
      await connection.db.admin().ping();
      // Some MongoDB deployments allow unauthenticated ping. Listing
      // collections catches missing/invalid credentials before initialization.
      await connection.db.listCollections({}, { nameOnly: true }).toArray();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: this.getSafeErrorMessage(error) };
    } finally {
      if (connection) await connection.close().catch(() => undefined);
    }
  }

  private async openMongoConnection(mongo: SetupCheckDto["mongo"]) {
    const connection = mongoose.createConnection(buildMongoUri(mongo), {
      serverSelectionTimeoutMS: 5000,
    });
    await connection.asPromise();
    return connection;
  }

  private async openRuntimeMongoConnection() {
    return await this.openMongoConnection(this.getRuntimeMongoConfig());
  }

  private async checkRedis(
    redis: SetupCheckDto["redis"],
  ): Promise<CheckResult> {
    const client = createClient({
      url: buildRedisUrl(redis),
      socket: {
        connectTimeout: 5000,
      },
    });
    client.on("error", () => undefined);

    try {
      await client.connect();
      await client.ping();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: this.getSafeErrorMessage(error) };
    } finally {
      if (client.isOpen) {
        await client.quit().catch(() => client.disconnect());
      }
    }
  }

  private async initializeData(
    connection: Connection,
    body: InitialDataConfig,
  ) {
    const RoleModel = connection.model<Role>(RoleName, RoleSchema);
    const UserModel = connection.model<User>(UsersName, UsersSchema);
    const ProjectModel = connection.model<Project>(ProjectName, ProjectSchema);

    const existingUsers = await UserModel.countDocuments({}).exec();
    if (existingUsers > 0) {
      throw new ConflictException("数据库中已存在用户，不能执行首次初始化");
    }

    const role = await this.ensureSystemAdminRole(RoleModel);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(body.admin.password, salt);

    await UserModel.create({
      username: body.admin.username,
      email: body.admin.email,
      password: hashedPassword,
      salt,
      status: 1,
      enable: true,
      roles: [role._id],
      isDelete: false,
    });

    const existingProject = await ProjectModel.findOne().exec();
    if (!existingProject) {
      await ProjectModel.create({
        name: body.project.name,
        description: "",
        enable: true,
        login: {
          title: body.project.name,
          subTitle: "",
        },
        register: {
          title: body.project.name,
          subTitle: "",
          forceEmailCaptcha: false,
          forceInvitationCode: false,
          allowRegister: true,
          registerDisabledTip: "当前不允许注册",
        },
        turnstile: {
          enabled: false,
          siteKey: "",
          secretKey: "",
        },
      });
    }
  }

  private async ensureSystemAdminRole(RoleModel: mongoose.Model<Role>) {
    const existing = await RoleModel.findOne({
      $or: [{ code: SYSTEM_ADMIN_ROLE_CODE }, { name: "系统管理员" }],
    }).exec();

    const data = {
      code: SYSTEM_ADMIN_ROLE_CODE,
      name: "系统管理员",
      description: "系统内置角色，拥有所有接口权限",
      permissions: [],
      isSystem: true,
      isSuperAdmin: true,
    };

    if (existing) {
      await RoleModel.findByIdAndUpdate(existing._id, data).exec();
      Object.assign(existing, data);
      return existing;
    }

    return await RoleModel.create(data);
  }

  private toEnvironmentEnvUpdates(body: SetupEnvironmentCompleteDto) {
    return {
      [SETUP_INITIALIZED_KEY]: "false",
      [SETUP_ENVIRONMENT_CONFIGURED_KEY]: "true",
      mongo_host: body.mongo.host,
      mongo_port: body.mongo.port,
      mongo_username: body.mongo.username ?? "",
      mongo_password: body.mongo.password ?? "",
      mongo_database: body.mongo.database,
      mongo_auth_source: body.mongo.authSource ?? "",
      redis_host: body.redis.host,
      redis_port: body.redis.port,
      redis_password: body.redis.password ?? "",
      redis_db: body.redis.db,
      redis_ttl: body.redis.ttl ?? 60,
      storage_service: body.storage.service,
      local_storage_path: body.storage.localPath || "./assets/uploads",
      r2_access_key:
        body.storage.service === "r2" ? (body.storage.r2?.accessKey ?? "") : "",
      r2_secret_key:
        body.storage.service === "r2" ? (body.storage.r2?.secretKey ?? "") : "",
      r2_bucket:
        body.storage.service === "r2" ? (body.storage.r2?.bucket ?? "") : "",
      r2_account_id:
        body.storage.service === "r2" ? (body.storage.r2?.accountId ?? "") : "",
      r2_custom_domain:
        body.storage.service === "r2"
          ? (body.storage.r2?.customDomain ?? "")
          : "",
    };
  }

  private getRuntimeMongoConfig(): SetupMongoDto {
    const env = readRuntimeEnv();
    const value = (key: string) => process.env[key] ?? env[key];

    return {
      host: value("mongo_host") || "127.0.0.1",
      port: Number.parseInt(value("mongo_port") || "27017", 10),
      database: value("mongo_database") || "search_next",
      username: value("mongo_username") || "",
      password: value("mongo_password") || "",
      authSource: value("mongo_auth_source") || "",
    };
  }

  private getRuntimeProjectConfig() {
    return { name: DEFAULT_PROJECT_NAME };
  }

  private writeAndApplyRuntimeEnv(
    updates: Record<string, string | number | boolean | null>,
  ) {
    writeRuntimeEnv(updates);
    for (const [key, value] of Object.entries(updates)) {
      process.env[key] = value === null ? "" : String(value);
    }
  }

  private scheduleRestart() {
    if (process.env.NODE_ENV === "test") return;

    const timer = setTimeout(() => {
      process.exit(0);
    }, 1200);
    timer.unref?.();
  }

  private getSafeErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return "连接失败";
  }
}
