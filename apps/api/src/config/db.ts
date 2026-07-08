import { registerAs } from '@nestjs/config';
import { buildMongoUriFromEnv } from './mongo-uri';

export default registerAs('MongoConfig', () => ({
  uri: buildMongoUriFromEnv(),
}));
