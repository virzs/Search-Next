import { buildMongoUri } from './mongo-uri';

describe('buildMongoUri', () => {
  it('builds an unauthenticated URI when username is empty', () => {
    expect(
      buildMongoUri({
        host: '127.0.0.1',
        port: 27017,
        database: 'search_next',
        username: '',
        password: '',
      }),
    ).toBe('mongodb://127.0.0.1:27017/search_next');
  });

  it('builds an authenticated URI with authSource', () => {
    expect(
      buildMongoUri({
        host: 'mongo.local',
        port: 27018,
        database: 'search_next',
        username: 'search user',
        password: 'p@ss',
        authSource: 'admin',
      }),
    ).toBe(
      'mongodb://search%20user:p%40ss@mongo.local:27018/search_next?authSource=admin',
    );
  });
});
