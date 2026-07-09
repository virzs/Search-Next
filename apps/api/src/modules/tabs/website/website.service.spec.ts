import { WebsiteService } from './website.service';

const validWebsite = (name: string, url = `https://${name}.example.com`) => ({
  name,
  url,
  description: `${name} description`,
  enable: true,
  public: false,
  themeColor: 'rgb(1,2,3)',
});

describe('WebsiteService', () => {
  const createFindChain = (rows: any[]) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(rows),
  });

  const createService = (websiteModel: any) =>
    new WebsiteService({} as any, websiteModel, {} as any, {} as any);

  it('exports only website migration fields', async () => {
    const model = {
      find: jest.fn().mockReturnValue(
        createFindChain([
          {
            _id: 'id',
            icon: { url: '/icon.png' },
            classify: 'classify-id',
            tags: ['tag-id'],
            click: 99,
            ...validWebsite('Docs'),
          },
        ]),
      ),
    };
    const service = createService(model);

    const exported = await service.exportAll();

    expect(exported.type).toBe('website');
    expect(exported.items[0]).toEqual(validWebsite('Docs'));
    expect(exported.items[0]).not.toHaveProperty('_id');
    expect(exported.items[0]).not.toHaveProperty('icon');
    expect(exported.items[0]).not.toHaveProperty('classify');
    expect(exported.items[0]).not.toHaveProperty('tags');
    expect(exported.items[0]).not.toHaveProperty('click');
  });

  it('imports created, updated and failed rows while preserving unmigrated fields', async () => {
    const existing = {
      _id: 'existing-id',
      icon: { url: '/icon.png' },
      classify: 'classify-id',
      tags: ['tag-id'],
      click: 12,
    };
    const model = {
      findOne: jest.fn(({ url }) => ({
        exec: jest.fn().mockResolvedValue(
          url === 'https://docs.example.com' ? existing : null,
        ),
      })),
      findByIdAndUpdate: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(existing),
      })),
      create: jest.fn().mockResolvedValue({ _id: 'new-id' }),
    };
    const service = createService(model);

    const result = await service.importAll(
      {
        schemaVersion: 1,
        type: 'website',
        items: [
          validWebsite('Blog', 'https://blog.example.com'),
          {
            ...validWebsite('Docs', ' https://docs.example.com '),
            icon: { url: '/new-icon.png' },
            classify: 'new-classify-id',
            tags: ['new-tag-id'],
            click: 999,
          },
          { name: 'Bad', url: 'bad-url' },
        ],
      },
      'user-id',
    );

    expect(result).toMatchObject({
      total: 3,
      created: 1,
      updated: 1,
      restored: 0,
      failed: 1,
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Blog',
        url: 'https://blog.example.com',
        creator: 'user-id',
      }),
    );
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'existing-id',
      {
        name: 'Docs',
        url: 'https://docs.example.com',
        description: 'Docs description',
        enable: true,
        public: false,
        themeColor: 'rgb(1,2,3)',
        updater: 'user-id',
      },
      { new: true },
    );
    expect(result.errors[0]).toMatchObject({ index: 3, key: 'bad-url' });
  });
});
