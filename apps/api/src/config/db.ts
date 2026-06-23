import { registerAs } from '@nestjs/config';

export default registerAs('MongoConfig', () => ({
  uri: `mongodb://${process.env.mongo_username}:${process.env.mongo_password}@${process.env.mongo_host}:${process.env.mongo_port}/${process.env.mongo_database}`,
}));
