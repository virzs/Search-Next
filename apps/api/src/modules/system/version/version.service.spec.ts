import { NotFoundException } from "@nestjs/common";
import { VersionService } from "./version.service";

const query = <T>(value: T) => {
  const chain: any = { exec: jest.fn().mockResolvedValue(value) };
  for (const method of ["sort", "limit", "populate"]) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
  return chain;
};

describe("VersionService", () => {
  const createService = ({
    versions = [],
    publications = [],
    versionTotal = versions.length,
    publicationTotal = publications.length,
  }: {
    versions?: any[];
    publications?: any[];
    versionTotal?: number;
    publicationTotal?: number;
  } = {}) => {
    const versionModel = {
      find: jest.fn().mockReturnValue(query(versions)),
      countDocuments: jest.fn().mockResolvedValue(versionTotal),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    const publicationModel = {
      find: jest.fn().mockReturnValue(query(publications)),
      countDocuments: jest.fn().mockResolvedValue(publicationTotal),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    const service = new VersionService(
      versionModel as any,
      publicationModel as any,
    );
    return { service, versionModel, publicationModel };
  };

  it("returns client and Web/Admin releases from the original version list", async () => {
    const { service } = createService({
      versions: [
        {
          _id: "client-id",
          version: "0.2.0",
          platforms: [{ platform: "windows", updateType: 2 }],
          createdAt: new Date("2026-07-15T00:00:00.000Z"),
        },
      ],
      publications: [
        {
          _id: "publication-id",
          component: "web",
          version: "0.3.0",
          announcementTitle: "Web 0.3.0 更新记录",
          announcementContent: "Release notes",
          publishedAt: new Date("2026-07-16T00:00:00.000Z"),
        },
      ],
    });

    const result = await service.page({ page: 1, pageSize: 20 });

    expect(result.total).toBe(2);
    expect(result.data).toEqual([
      expect.objectContaining({
        _id: "release:publication-id",
        sourceId: "publication-id",
        recordType: "release",
        version: "0.3.0",
        platforms: [{ platform: "web" }],
      }),
      expect.objectContaining({
        _id: "client-id",
        recordType: "client",
        version: "0.2.0",
      }),
    ]);
    expect(result.data[0].content).toBeUndefined();
  });

  it("uses the original version detail route for release records", async () => {
    const publication = {
      _id: "publication-id",
      component: "admin",
      version: "0.3.0",
      announcementTitle: "Admin 0.3.0 更新记录",
      announcementContent: "Admin release notes",
      publishedAt: new Date("2026-07-16T00:00:00.000Z"),
    };
    const { service, publicationModel } = createService();
    publicationModel.findById.mockReturnValue(query(publication));

    await expect(service.detail("release:publication-id")).resolves.toEqual(
      expect.objectContaining({
        recordType: "release",
        platforms: [{ platform: "admin" }],
        content: "Admin release notes",
      }),
    );
  });

  it("soft-deletes release records through the original version delete route", async () => {
    const { service, publicationModel } = createService();
    publicationModel.findById.mockReturnValue(query({ _id: "publication-id" }));
    publicationModel.findByIdAndUpdate.mockResolvedValue({
      _id: "publication-id",
      isDelete: true,
    });

    await service.delete("release:publication-id", "user-id");

    expect(publicationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "publication-id",
      { isDelete: true, updater: "user-id" },
      { new: true },
    );
  });

  it("rejects deleting a missing release record", async () => {
    const { service, publicationModel } = createService();
    publicationModel.findById.mockReturnValue(query(null));

    await expect(
      service.delete("release:missing", "user-id"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
