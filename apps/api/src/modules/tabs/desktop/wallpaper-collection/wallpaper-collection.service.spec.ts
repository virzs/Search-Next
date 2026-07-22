import { WallpaperCollectionService } from "./wallpaper-collection.service";

describe("WallpaperCollectionService", () => {
  let service: WallpaperCollectionService;

  beforeEach(() => {
    service = new WallpaperCollectionService({} as any, {} as any);
  });

  it("builds dynamic filters for categories and web wallpapers", () => {
    const finder = (service as any).getDynamicFinder({
      categoryIds: ["507f1f77bcf86cd799439011"],
      wallpaperTypes: ["application"],
    });

    expect(finder).toEqual({
      isActive: true,
      categoryId: { $in: ["507f1f77bcf86cd799439011"] },
      type: "application",
    });
  });

  it("keeps legacy image wallpapers in image-only collections", () => {
    const finder = (service as any).getDynamicFinder({
      wallpaperTypes: ["image"],
    });

    expect(finder.$and).toContainEqual({
      $or: [{ type: "image" }, { type: { $exists: false } }],
    });
  });

  it("supports gradient-only and mixed dynamic collections", () => {
    expect(
      (service as any).getDynamicFinder({ wallpaperTypes: ["gradient"] }),
    ).toEqual({ isActive: true, type: "gradient" });

    const mixed = (service as any).getDynamicFinder({
      wallpaperTypes: ["image", "gradient"],
    });
    expect(mixed.$and).toContainEqual({
      $or: [
        { type: "gradient" },
        { type: "image" },
        { type: { $exists: false } },
      ],
    });
  });

  it("uses wallpaper order as a supported dynamic sort", () => {
    expect(
      (service as any).getDynamicSort({
        sortBy: "sortOrder",
        sortOrder: "asc",
      }),
    ).toEqual({ sortOrder: 1, createdAt: -1 });
  });

  it("removes private package storage paths from public wallpaper data", () => {
    const wallpaper = (service as any).serializeWallpaper({
      _id: "wallpaper-id",
      type: "application",
      application: {
        revision: "revision-id",
        storageDir: "private/revision-id",
      },
      sourceKey: "internal-seed-key",
      creator: "user-id",
      isDelete: false,
      __v: 1,
    });

    expect(wallpaper.application.revision).toBe("revision-id");
    expect(wallpaper.application.storageDir).toBeUndefined();
    expect(wallpaper.sourceKey).toBeUndefined();
    expect(wallpaper.creator).toBeUndefined();
    expect(wallpaper.isDelete).toBeUndefined();
    expect(wallpaper.__v).toBeUndefined();
  });

  it("removes audit and cache fields from public collection data", () => {
    const collection = (service as any).serializePublicCollection({
      title: "Spring",
      creator: "user-id",
      updater: "user-id",
      cachedWallpaperIds: ["wallpaper-id"],
      cachedAt: new Date(),
      isDelete: false,
      __v: 1,
    });

    expect(collection).toEqual({ title: "Spring" });
  });

  it("converts effective dates when creating a collection", async () => {
    const create = jest.fn(async (value) => value);
    service = new WallpaperCollectionService({ create } as any, {} as any);

    await service.createCollection(
      {
        title: "Spring",
        effectiveStart: "2026-03-01T00:00:00.000Z",
        effectiveEnd: "2026-03-31T23:59:59.000Z",
      },
      "user-id",
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Spring",
        creator: "user-id",
        enable: true,
        effectiveStart: expect.any(Date),
        effectiveEnd: expect.any(Date),
      }),
    );
  });

  it("invalidates dynamic cache when collection rules change", async () => {
    const findByIdAndUpdate = jest.fn(async () => ({}));
    service = new WallpaperCollectionService(
      { findByIdAndUpdate } as any,
      {} as any,
    );

    await service.updateCollection(
      "collection-id",
      {
        title: "Newest",
        type: "dynamic",
        dynamic: { sortBy: "updatedAt" },
      },
      "user-id",
    );

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      "collection-id",
      expect.objectContaining({
        cachedWallpaperIds: [],
        cachedAt: null,
        updater: "user-id",
      }),
      { new: true },
    );
  });
});
