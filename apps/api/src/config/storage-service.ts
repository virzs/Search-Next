import { registerAs } from '@nestjs/config';

export default registerAs('storage-service', () => ({
  service: process.env.storage_service,
  localStoragePath: process.env.local_storage_path || './assets/uploads',
}));
