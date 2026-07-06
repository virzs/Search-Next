import { BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';

describe('AppService app mode manifest parsing', () => {
  let service: AppService;

  const parsePackageConfig = (override: Record<string, unknown> = {}) => {
    const manifest = {
      name: 'sample-app',
      version: '1.0.0',
      entry: 'index.js',
      icon: 'icon.svg',
      sizeConfigs: [{ row: 2, col: 2, name: '2x2', id: '2x2' }],
      defaultSizeId: '2x2',
      settingsSchema: [],
      ...override,
    };

    return (service as any).parsePackageConfig(
      Buffer.from(JSON.stringify(manifest), 'utf8'),
    );
  };

  beforeEach(() => {
    service = new AppService({} as any, {} as any, {} as any);
  });

  it('requires explicit supportAppMode for app menu eligibility', () => {
    const config = parsePackageConfig();

    expect(config.supportAppMode).toBe(false);
    expect(config.appIcon).toBeUndefined();
  });

  it('parses image appIcon and resolves its package path', () => {
    const config = parsePackageConfig({
      supportAppMode: true,
      appIcon: { type: 'image', src: 'assets/app-icon.svg' },
    });

    expect(config.supportAppMode).toBe(true);
    expect(config.appIcon).toEqual({
      type: 'image',
      src: 'assets/app-icon.svg',
    });
    expect((service as any).getPackageAppIconPath(config)).toBe(
      'assets/app-icon.svg',
    );
  });

  it('falls back image appIcon to package icon when src is omitted', () => {
    const config = parsePackageConfig({
      supportAppMode: true,
      appIcon: { type: 'image' },
    });

    expect(config.appIcon).toEqual({ type: 'image' });
    expect((service as any).getPackageAppIconPath(config)).toBe('icon.svg');
  });

  it('parses custom appIcon without requiring an image path', () => {
    const config = parsePackageConfig({
      supportAppMode: true,
      appIcon: { type: 'custom' },
    });

    expect(config.appIcon).toEqual({ type: 'custom' });
    expect((service as any).getPackageAppIconPath(config)).toBeUndefined();
  });

  it('rejects illegal package appIcon paths', () => {
    expect(() =>
      parsePackageConfig({
        supportAppMode: true,
        appIcon: { type: 'image', src: '../app-icon.svg' },
      }),
    ).toThrow(BadRequestException);
  });

  it('parses settings pagePaths from package manifests', () => {
    const config = parsePackageConfig({
      pagePaths: { settings: '/settings' },
    });

    expect(config.pagePaths).toEqual({ settings: '/settings' });
    expect((service as any).buildConfigSnapshot(config).pagePaths).toEqual({
      settings: '/settings',
    });
  });

  it('rejects unsafe settings page route paths', () => {
    expect(() =>
      parsePackageConfig({
        pagePaths: { settings: 'https://example.com/settings' },
      }),
    ).toThrow(BadRequestException);
  });

  it('prefers snapshot package paths over stale app entry URLs', async () => {
    const response = await (service as any).withPublicResponseFields({
      entryFileName: 'index.js',
      entryUrl: '/static/apps/sample-app/0.9.0/index.js',
      iconUrl: '/static/apps/sample-app/0.9.0/icon.svg',
      packageName: 'sample-app-1.0.0.snapp',
      supportIconMode: true,
      supportAppMode: true,
      version: '0.9.0',
      settingsSchema: [],
      screenshots: [
        {
          mode: 'icon',
          themeId: 'light',
          sizeId: '2x2',
          file: 'screenshots/icon/icon-2x2-light.png',
          url: '/static/apps/sample-app/1.0.0/screenshots/icon/icon-2x2-light.png',
        },
      ],
      configSnapshot: {
        name: 'sample-app',
        version: '0.9.0',
        entry: 'index.js',
        icon: 'icon.svg',
        supportIconMode: true,
        supportAppMode: true,
        pagePaths: { settings: '/settings' },
      },
    });

    expect(response.entryUrl).toBe('/static/apps/sample-app/1.0.0/index.js');
    expect(response.iconUrl).toBe('/static/apps/sample-app/1.0.0/icon.svg');
    expect(response.version).toBe('1.0.0');
    expect(response.configSnapshot.version).toBe('1.0.0');
    expect(response.pagePaths).toEqual({ settings: '/settings' });
  });

  it('dedupes version rows by version and keeps the first sorted row', () => {
    const rows = [
      { _id: 'active-010', version: '0.1.0', active: true },
      { _id: 'old-010', version: '0.1.0', active: false },
      { _id: 'active-020', version: '0.2.0', active: false },
    ];

    expect((service as any).dedupeVersionRows(rows)).toEqual([
      rows[0],
      rows[2],
    ]);
  });
});
