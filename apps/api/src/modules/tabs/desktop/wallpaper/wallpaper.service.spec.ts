import { BadRequestException, NotFoundException } from "@nestjs/common";
import AdmZip from "adm-zip";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { WallpaperService } from "./wallpaper.service";

describe("WallpaperService web wallpaper packages", () => {
  let service: WallpaperService;
  let storageRoot: string;

  const makePackage = (
    manifest: Record<string, unknown> = {},
    files: Record<string, string | Buffer> = {},
  ) => {
    const zip = new AdmZip();
    const config = {
      schemaVersion: 1,
      name: "aurora-particles",
      version: "1.0.0",
      entry: "index.html",
      preview: "preview.webp",
      author: "Example Author",
      projectUrl: "https://github.com/example/aurora-particles",
      description: "An offline generative web wallpaper.",
      ...manifest,
    };
    zip.addFile(
      "wallpaper.config.json",
      Buffer.from(JSON.stringify(config), "utf8"),
    );
    zip.addFile(
      "index.html",
      Buffer.from("<!doctype html><html><head></head><body>OK</body></html>"),
    );
    zip.addFile("preview.webp", Buffer.from("preview"));
    Object.entries(files).forEach(([name, value]) => {
      zip.addFile(name, Buffer.isBuffer(value) ? value : Buffer.from(value));
    });
    const buffer = zip.toBuffer();
    return {
      originalname: "sample.snwall",
      mimetype: "application/zip",
      buffer,
      size: buffer.length,
    } as Express.Multer.File;
  };

  beforeEach(async () => {
    storageRoot = await fs.mkdtemp(path.join(os.tmpdir(), "snwall-test-"));
    process.env.wallpaper_application_storage_path = storageRoot;
    service = new WallpaperService({} as any, {} as any, {} as any);
  });

  afterEach(async () => {
    delete process.env.wallpaper_application_storage_path;
    await fs.rm(storageRoot, { recursive: true, force: true });
  });

  it("seeds the former built-in gradients without overwriting admin changes", async () => {
    const bulkWrite = jest.fn(async (_operations: any[]) => ({}));
    service = new WallpaperService({ bulkWrite } as any, {} as any, {} as any);

    await service.onModuleInit();

    const operations = bulkWrite.mock.calls[0][0];
    expect(operations).toHaveLength(6);
    expect(operations[0]).toEqual({
      updateOne: {
        filter: { sourceKey: "system-gradient-aurora" },
        update: {
          $setOnInsert: expect.objectContaining({
            type: "gradient",
            name: "极光",
            isActive: true,
          }),
        },
        upsert: true,
      },
    });
    expect(operations[0].updateOne.update.$set).toBeUndefined();
    expect(bulkWrite).toHaveBeenCalledWith(operations, { timestamps: false });
  });

  it("accepts layered gradients and rejects executable or injectable CSS", () => {
    const layered =
      "radial-gradient(circle at 20% 20%, rgba(0, 0, 0, .2), transparent 60%), linear-gradient(135deg, #34c759, #0a84ff)";

    expect((service as any).normalizeGradientCss(layered)).toBe(layered);
    for (const unsafe of [
      "linear-gradient(red, blue); background: url(https://example.com/a)",
      "linear-gradient(red, u/**/rl(https://example.com/a))",
      "linear-gradient(red, var(--external))",
      "linear-gradient(red, j\\61vascript:alert(1))",
    ]) {
      expect(() => (service as any).normalizeGradientCss(unsafe)).toThrow(
        BadRequestException,
      );
    }
  });

  it("creates and updates admin-managed gradient wallpapers", async () => {
    const create = jest.fn(async () => ({ _id: "507f1f77bcf86cd799439011" }));
    const findById = jest.fn(() => ({
      exec: async () => ({ type: "gradient" }),
    }));
    const findByIdAndUpdate = jest.fn(async () => ({ type: "gradient" }));
    service = new WallpaperService(
      { create, findById, findByIdAndUpdate } as any,
      {} as any,
      {} as any,
    );
    jest
      .spyOn(service, "getWallpaperDetail")
      .mockResolvedValue({ type: "gradient" } as any);

    await service.createGradientWallpaper(
      {
        name: "Ocean",
        css: "linear-gradient(135deg, #34c759, #0a84ff)",
      },
      "user-id",
    );
    await service.updateGradientWallpaper(
      "507f1f77bcf86cd799439011",
      { css: "radial-gradient(circle, #fff, #000)" },
      "user-id",
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "gradient",
        name: "Ocean",
        creator: "user-id",
      }),
    );
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      expect.objectContaining({
        type: "gradient",
        css: "radial-gradient(circle, #fff, #000)",
        updater: "user-id",
      }),
      { new: true },
    );
  });

  it("validates and stages a valid package", async () => {
    const prepared = await (service as any).prepareApplicationPackage(
      makePackage({}, { "assets/main.js": 'document.body.dataset.ready="1"' }),
      "wallpaper-id",
    );

    expect(prepared.application).toMatchObject({
      packageName: "aurora-particles",
      version: "1.0.0",
      entry: "index.html",
      preview: "preview.webp",
      author: "Example Author",
      projectUrl: "https://github.com/example/aurora-particles",
      description: "An offline generative web wallpaper.",
    });
    await expect(
      fs.readFile(path.join(prepared.finalPath, "assets/main.js"), "utf8"),
    ).resolves.toContain("dataset.ready");
  });

  it("imports package metadata into editable wallpaper fields", async () => {
    const create = jest.fn(async (payload: any) => ({
      ...payload,
      _id: payload._id,
    }));
    service = new WallpaperService({ create } as any, {} as any, {} as any);
    jest
      .spyOn(service, "getWallpaperDetail")
      .mockResolvedValue({ _id: "wallpaper-id" } as any);

    await service.createApplicationWallpaper(makePackage(), {}, "user-id");

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "application",
        name: "aurora-particles",
        description: "An offline generative web wallpaper.",
        author: "Example Author",
        url: "https://github.com/example/aurora-particles",
        isActive: true,
      }),
    );
  });

  it("rejects packages with the wrong extension", async () => {
    const file = makePackage();
    file.originalname = "sample.zip";
    await expect(
      (service as any).prepareApplicationPackage(file, "wallpaper-id"),
    ).rejects.toThrow("仅支持 .snwall");
  });

  it("rejects a missing manifest", async () => {
    const zip = new AdmZip();
    zip.addFile("index.html", Buffer.from("<html></html>"));
    zip.addFile("preview.webp", Buffer.from("preview"));
    const buffer = zip.toBuffer();
    await expect(
      (service as any).prepareApplicationPackage(
        {
          originalname: "sample.snwall",
          buffer,
          size: buffer.length,
        },
        "wallpaper-id",
      ),
    ).rejects.toThrow("缺少 wallpaper.config.json");
  });

  it("rejects missing entry and unsupported preview formats", async () => {
    await expect(
      (service as any).prepareApplicationPackage(
        makePackage({ entry: "missing.html" }),
        "wallpaper-id",
      ),
    ).rejects.toThrow("缺少入口");

    await expect(
      (service as any).prepareApplicationPackage(
        makePackage({ preview: "preview.svg" }, { "preview.svg": "<svg />" }),
        "wallpaper-id",
      ),
    ).rejects.toThrow("预览图仅支持");
  });

  it("validates optional source metadata", async () => {
    await expect(
      (service as any).prepareApplicationPackage(
        makePackage({ projectUrl: "http://example.com/project" }),
        "wallpaper-id",
      ),
    ).rejects.toThrow("projectUrl 必须是 HTTPS 地址");

    await expect(
      (service as any).prepareApplicationPackage(
        makePackage({ author: " ".repeat(2) }),
        "wallpaper-id",
      ),
    ).rejects.toThrow("author 格式不正确");
  });

  it("rejects multiple HTML files and unsafe paths", async () => {
    await expect(
      (service as any).prepareApplicationPackage(
        makePackage({}, { "second.html": "<html></html>" }),
        "wallpaper-id",
      ),
    ).rejects.toThrow("只能包含一个 HTML");

    expect(() =>
      (service as any).assertSafeRelativePath("../secret.js"),
    ).toThrow(BadRequestException);
  });

  it("rejects duplicate paths, unsupported files, and package limits", () => {
    const entry = (entryName: string, size = 1) =>
      ({ entryName, attr: 0, header: { size } }) as AdmZip.IZipEntry;

    expect(() =>
      (service as any).validatePackageEntries([
        entry("assets/main.js"),
        entry("Assets/Main.js"),
      ]),
    ).toThrow("重复路径");
    expect(() =>
      (service as any).validatePackageEntries([entry("server.exe")]),
    ).toThrow("不支持该文件类型");
    expect(() =>
      (service as any).validatePackageEntries(
        Array.from({ length: 501 }, (_, index) => entry(`assets/${index}.js`)),
      ),
    ).toThrow("文件数不能超过 500");
    expect(() =>
      (service as any).validatePackageEntries([
        entry("video.mp4", 80 * 1024 * 1024 + 1),
      ]),
    ).toThrow("解压后不能超过 80MB");
  });

  it("injects the sandbox bridge and offline CSP", () => {
    const html = (service as any).injectRuntimeHtml(
      "<!doctype html><html><head></head><body></body></html>",
    );
    expect(html).toContain('<base href="./assets/">');
    expect(html).toContain("search-next-wallpaper-v1");
    expect(html).toContain("emit('activity'");
    expect(html).toContain("pointermove");
    expect(html).toContain("touchstart");
    expect(html).toContain("wheel");
    expect(html).toContain("activity('keyboard')");
    expect(html).toContain("now-lastActivity<500");
    expect((service as any).getRuntimeContentSecurityPolicy()).toContain(
      "connect-src 'none'",
    );
  });

  it("serves staged HTML and module assets with sandbox headers", async () => {
    const prepared = await (service as any).prepareApplicationPackage(
      makePackage({}, { "assets/main.mjs": "export const ready = true" }),
      "507f1f77bcf86cd799439011",
    );
    const findOne = jest.fn(() => ({
      exec: async () => ({ application: prepared.application }),
    }));
    service = new WallpaperService({ findOne } as any, {} as any, {} as any);

    const entry = await service.getApplicationRuntimeFile(
      "507f1f77bcf86cd799439011",
      prepared.application.revision,
      "entry",
    );
    expect(entry.contentType).toContain("text/html");
    expect(entry.buffer.toString("utf8")).toContain("./assets/");
    expect(entry.headers["Content-Security-Policy"]).toContain(
      "connect-src 'none'",
    );

    const asset = await service.getApplicationRuntimeFile(
      "507f1f77bcf86cd799439011",
      prepared.application.revision,
      "asset",
      "assets/main.mjs",
    );
    expect(asset.contentType).toContain("text/javascript");
    expect(asset.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );

    await service.getApplicationRuntimeFile(
      "507f1f77bcf86cd799439011",
      prepared.application.revision,
      "preview",
    );
    expect(findOne).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ isActive: true }),
    );
  });

  it("does not serve inactive or missing web wallpapers", async () => {
    const model = {
      findOne: () => ({ exec: async () => null }),
    };
    service = new WallpaperService(model as any, {} as any, {} as any);
    await expect(
      service.getApplicationRuntimeFile(
        "507f1f77bcf86cd799439011",
        "revision",
        "entry",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
