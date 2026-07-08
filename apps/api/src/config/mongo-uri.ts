export interface MongoConnectionConfig {
  host?: string;
  port?: number | string;
  username?: string;
  password?: string;
  database?: string;
  authSource?: string;
}

const encodeMongoPart = (value: string) => encodeURIComponent(value);

export const buildMongoUri = (config: MongoConnectionConfig) => {
  const host = config.host || '127.0.0.1';
  const port = config.port || 27017;
  const database = config.database || 'search_next';
  const username = config.username?.trim();
  const password = config.password ?? '';
  const credentials = username
    ? `${encodeMongoPart(username)}:${encodeMongoPart(password)}@`
    : '';
  const query = config.authSource
    ? `?authSource=${encodeURIComponent(config.authSource)}`
    : '';

  return `mongodb://${credentials}${host}:${port}/${database}${query}`;
};

export const buildMongoUriFromEnv = () =>
  buildMongoUri({
    host: process.env.mongo_host,
    port: process.env.mongo_port,
    username: process.env.mongo_username,
    password: process.env.mongo_password,
    database: process.env.mongo_database,
    authSource: process.env.mongo_auth_source,
  });
