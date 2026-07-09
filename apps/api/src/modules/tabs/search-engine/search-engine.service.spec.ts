import { SearchEngineService } from './search-engine.service';

const validSearchEngine = (name: string) => ({
  name,
  description: `${name} description`,
  searchUrl: `https://example.com/search?q={keyword}&engine=${name}`,
  suggestUrl: `https://example.com/suggest?q={keyword}&callback={jsonp}`,
  jsonpCode: '(function(data){ return data; })',
  icon: '<svg></svg>',
  isEnabled: true,
});

describe('SearchEngineService', () => {
  const createFindChain = (rows: any[]) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(rows),
  });

  it('exports only migration fields', async () => {
    const model = {
      find: jest.fn().mockReturnValue(
        createFindChain([
          {
            _id: 'id',
            creator: 'creator',
            updater: 'updater',
            isDelete: false,
            ...validSearchEngine('Google'),
          },
        ]),
      ),
    };
    const service = new SearchEngineService(model as any);

    const exported = await service.exportAll();

    expect(exported.type).toBe('search-engine');
    expect(exported.items[0]).toEqual(validSearchEngine('Google'));
    expect(exported.items[0]).not.toHaveProperty('_id');
    expect(exported.items[0]).not.toHaveProperty('creator');
    expect(exported.items[0]).not.toHaveProperty('updater');
    expect(exported.items[0]).not.toHaveProperty('isDelete');
  });

  it('imports created, updated, restored and failed rows', async () => {
    const existingRows = {
      Bing: { _id: 'bing-id', isDelete: false },
      Old: { _id: 'old-id', isDelete: true },
    };
    const model = {
      collection: {
        findOne: jest.fn(({ name }) => existingRows[name]),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      },
      create: jest.fn().mockResolvedValue({ _id: 'new-id' }),
    };
    const service = new SearchEngineService(model as any);

    const result = await service.importAll(
      {
        schemaVersion: 1,
        type: 'search-engine',
        items: [
          validSearchEngine('Google'),
          validSearchEngine('Bing'),
          validSearchEngine('Old'),
          { name: 'Bad', searchUrl: 'bad-url' },
        ],
      },
      'user-id',
    );

    expect(result).toMatchObject({
      total: 4,
      created: 1,
      updated: 1,
      restored: 1,
      failed: 1,
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Google', creator: 'user-id' }),
    );
    expect(model.collection.updateOne).toHaveBeenCalledWith(
      { _id: 'old-id' },
      expect.objectContaining({
        $set: expect.objectContaining({ name: 'Old', isDelete: false }),
      }),
    );
    expect(result.errors[0]).toMatchObject({ index: 4, key: 'Bad' });
  });
});
