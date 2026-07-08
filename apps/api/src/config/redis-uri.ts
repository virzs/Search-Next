export interface RedisConnectionConfig {
  host?: string;
  port?: number | string;
  password?: string;
  db?: number | string;
}

export const buildRedisUrl = (config: RedisConnectionConfig) => {
  const host = config.host || '127.0.0.1';
  const port = config.port || 6379;
  const db = config.db ?? 0;
  const auth = config.password
    ? `:${encodeURIComponent(config.password)}@`
    : '';

  return `redis://${auth}${host}:${port}/${db}`;
};
