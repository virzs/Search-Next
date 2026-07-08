import * as fs from "fs";
import * as path from "path";

export const SETUP_INITIALIZED_KEY = "setup_initialized";
export const SETUP_ENVIRONMENT_CONFIGURED_KEY = "setup_environment_configured";

export type SetupStage = "environment" | "admin" | "done";

export interface SetupState {
  initialized: boolean;
  environmentConfigured: boolean;
  canSetup: boolean;
  envFilePath: string;
  mode: "app" | "setup";
  stage: SetupStage;
}

const ENV_LINE_PATTERN = /^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/;

export const getRuntimeEnvFilePath = () => {
  const configuredPath = process.env.SEARCH_NEXT_ENV_FILE;
  return configuredPath
    ? path.resolve(configuredPath)
    : path.resolve(process.cwd(), ".env");
};

export const parseBooleanEnv = (value?: string): boolean | undefined => {
  if (value === undefined) return undefined;

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  return undefined;
};

const stripOptionalQuotes = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if (first !== last || (first !== '"' && first !== "'")) return trimmed;

  const inner = trimmed.slice(1, -1);
  if (first === "'") return inner;

  return inner
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

export const parseEnvContent = (content: string): Record<string, string> => {
  return content.split(/\r?\n/).reduce<Record<string, string>>((env, line) => {
    const match = line.match(ENV_LINE_PATTERN);
    if (!match) return env;

    const key = match[2];
    const rawValue = match[3] ?? "";
    env[key] = stripOptionalQuotes(rawValue);
    return env;
  }, {});
};

export const readRuntimeEnv = (
  envFilePath = getRuntimeEnvFilePath(),
): Record<string, string> => {
  if (!fs.existsSync(envFilePath)) return {};
  return parseEnvContent(fs.readFileSync(envFilePath, "utf8"));
};

export const getSetupState = (
  envFilePath = getRuntimeEnvFilePath(),
): SetupState => {
  const envFileExists = fs.existsSync(envFilePath);
  const env = envFileExists ? readRuntimeEnv(envFilePath) : {};
  const setupValue =
    process.env[SETUP_INITIALIZED_KEY] ?? env[SETUP_INITIALIZED_KEY];
  const environmentValue =
    process.env[SETUP_ENVIRONMENT_CONFIGURED_KEY] ??
    env[SETUP_ENVIRONMENT_CONFIGURED_KEY];
  const parsedSetupValue = parseBooleanEnv(setupValue);
  const parsedEnvironmentValue = parseBooleanEnv(environmentValue);
  const hasSetupMetadata =
    setupValue !== undefined || environmentValue !== undefined;
  const initialized = parsedSetupValue ?? (envFileExists && !hasSetupMetadata);
  const environmentConfigured = initialized
    ? true
    : (parsedEnvironmentValue ?? false);
  const stage: SetupStage = initialized
    ? "done"
    : environmentConfigured
      ? "admin"
      : "environment";

  return {
    initialized,
    environmentConfigured,
    canSetup: !initialized,
    envFilePath,
    mode: environmentConfigured ? "app" : "setup",
    stage,
  };
};

export const shouldUseSetupOnlyMode = () =>
  !getSetupState().environmentConfigured;

export const serializeEnvValue = (value: string | number | boolean | null) => {
  const text = value === null ? "" : String(value);
  if (text === "") return "";

  if (/^[A-Za-z0-9_./:@+-]+$/.test(text)) {
    return text;
  }

  return `"${text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"')}"`;
};

export const writeRuntimeEnv = (
  updates: Record<string, string | number | boolean | null>,
  envFilePath = getRuntimeEnvFilePath(),
) => {
  fs.mkdirSync(path.dirname(envFilePath), { recursive: true });

  const existingContent = fs.existsSync(envFilePath)
    ? fs.readFileSync(envFilePath, "utf8")
    : "";
  const lines = existingContent ? existingContent.split(/\r?\n/) : [];
  const pending = new Map(Object.entries(updates));

  const nextLines = lines.map((line) => {
    const match = line.match(ENV_LINE_PATTERN);
    if (!match) return line;

    const [, prefix, key] = match;
    if (!pending.has(key)) return line;

    const value = pending.get(key);
    pending.delete(key);
    return `${prefix}${key}=${serializeEnvValue(value ?? null)}`;
  });

  if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
    nextLines.push("");
  }

  for (const [key, value] of pending) {
    nextLines.push(`${key}=${serializeEnvValue(value ?? null)}`);
  }

  fs.writeFileSync(envFilePath, `${nextLines.join("\n")}\n`, "utf8");
};
