import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.email_host ?? 'outlook.office365.com',
  port: process.env.email_port ?? 587,
  user: process.env.email_user,
  pass: process.env.email_pass,
}));
