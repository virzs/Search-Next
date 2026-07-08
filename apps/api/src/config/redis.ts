import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default registerAs('redis', () => ({
  host: process.env.redis_host || '127.0.0.1',
  port: parseNumber(process.env.redis_port, 6379),
  password: process.env.redis_password,
  db: parseNumber(process.env.redis_db, 0),
  ttl: parseNumber(process.env.redis_ttl, 60),
}));
