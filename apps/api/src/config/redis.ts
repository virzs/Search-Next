import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.redis_host,
  port: parseInt(process.env.redis_port, 10),
  password: process.env.redis_password,
  db: parseInt(process.env.redis_db, 0),
  ttl: parseInt(process.env.redis_ttl, 60),
}));
