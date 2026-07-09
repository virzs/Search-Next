import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  getRuntimeEnvFilePath,
  getRuntimeEnvFilePaths,
  getSetupState,
  SETUP_ENVIRONMENT_CONFIGURED_KEY,
  parseEnvContent,
  SETUP_INITIALIZED_KEY,
  writeRuntimeEnv,
} from "./env";

describe("runtime env helpers", () => {
  const originalSetupInitialized = process.env[SETUP_INITIALIZED_KEY];
  const originalSetupEnvironmentConfigured =
    process.env[SETUP_ENVIRONMENT_CONFIGURED_KEY];
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "search-next-env-"));
    delete process.env[SETUP_INITIALIZED_KEY];
    delete process.env[SETUP_ENVIRONMENT_CONFIGURED_KEY];
  });

  afterEach(() => {
    if (originalSetupInitialized === undefined) {
      delete process.env[SETUP_INITIALIZED_KEY];
    } else {
      process.env[SETUP_INITIALIZED_KEY] = originalSetupInitialized;
    }

    if (originalSetupEnvironmentConfigured === undefined) {
      delete process.env[SETUP_ENVIRONMENT_CONFIGURED_KEY];
    } else {
      process.env[SETUP_ENVIRONMENT_CONFIGURED_KEY] =
        originalSetupEnvironmentConfigured;
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resolves .env from cwd", () => {
    const originalCwd = process.cwd();
    const realTmpDir = fs.realpathSync(tmpDir);

    process.chdir(tmpDir);
    try {
      expect(getRuntimeEnvFilePath()).toBe(path.join(realTmpDir, ".env"));
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("uses the legacy dev/prod/setup env files", () => {
    const originalCwd = process.cwd();
    const realTmpDir = fs.realpathSync(tmpDir);

    process.chdir(tmpDir);
    try {
      expect(getRuntimeEnvFilePaths()).toEqual([
        path.join(realTmpDir, "dev.env"),
        path.join(realTmpDir, "prod.env"),
        path.join(realTmpDir, ".env"),
      ]);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("treats missing env as setup mode and legacy env as initialized", () => {
    const envPath = path.join(tmpDir, ".env");
    expect(getSetupState(envPath)).toMatchObject({
      initialized: false,
      environmentConfigured: false,
      canSetup: true,
      mode: "setup",
      stage: "environment",
    });

    fs.writeFileSync(envPath, "mongo_host=127.0.0.1\n", "utf8");
    expect(getSetupState(envPath)).toMatchObject({
      initialized: true,
      environmentConfigured: true,
      canSetup: false,
      mode: "app",
      stage: "done",
    });

    fs.writeFileSync(envPath, "setup_initialized=false\n", "utf8");
    expect(getSetupState(envPath)).toMatchObject({
      initialized: false,
      environmentConfigured: false,
      canSetup: true,
      mode: "setup",
      stage: "environment",
    });

    fs.writeFileSync(
      envPath,
      "setup_initialized=false\nsetup_environment_configured=true\n",
      "utf8",
    );
    expect(getSetupState(envPath)).toMatchObject({
      initialized: false,
      environmentConfigured: true,
      canSetup: true,
      mode: "app",
      stage: "admin",
    });
  });

  it("uses the first existing env file for setup state", () => {
    const devEnvPath = path.join(tmpDir, "dev.env");
    const setupEnvPath = path.join(tmpDir, ".env");

    fs.writeFileSync(devEnvPath, "mongo_host=127.0.0.1\n", "utf8");
    fs.writeFileSync(
      setupEnvPath,
      "setup_initialized=false\nsetup_environment_configured=false\n",
      "utf8",
    );

    expect(getSetupState([devEnvPath, setupEnvPath])).toMatchObject({
      initialized: true,
      environmentConfigured: true,
      canSetup: false,
      mode: "app",
      stage: "done",
    });
  });

  it("parses and writes env while preserving comments and unknown keys", () => {
    const envPath = path.join(tmpDir, ".env");
    fs.writeFileSync(
      envPath,
      '# comment\nPORT=5151\nunknown=value\nmongo_password=\"old value\"\n',
      "utf8",
    );

    writeRuntimeEnv(
      {
        PORT: 5152,
        mongo_password: "new value#1",
        redis_host: "127.0.0.1",
      },
      envPath,
    );

    const nextContent = fs.readFileSync(envPath, "utf8");
    expect(nextContent).toContain("# comment");
    expect(nextContent).toContain("unknown=value");
    expect(parseEnvContent(nextContent)).toMatchObject({
      PORT: "5152",
      mongo_password: "new value#1",
      redis_host: "127.0.0.1",
    });
  });
});
