import { registerAs } from '@nestjs/config';

export default registerAs('r2', () => ({
  accessKey: process.env.r2_access_key,
  secretKey: process.env.r2_secret_key,
  bucket: process.env.r2_bucket,
  accountId: process.env.r2_account_id,
  customDomain: process.env.r2_custom_domain,
}));
