import { ReleasePublicationService } from "./release-publication.service";
import type { GithubReleaseData } from "./release.util";
import axios from "axios";

const repositoryUrl = "https://github.com/virzs/Search-Next";
const githubRelease: GithubReleaseData = {
  id: 88,
  tag_name: "web-v1.4.0",
  name: "web v1.4.0",
  body: "New release",
  html_url: "https://github.com/virzs/Search-Next/releases/tag/web-v1.4.0",
  published_at: "2026-07-15T00:00:00.000Z",
  draft: false,
  prerelease: false,
};

const query = <T>(value: T) => {
  const chain: any = { exec: jest.fn().mockResolvedValue(value) };
  chain.setOptions = jest.fn().mockReturnValue(chain);
  return chain;
};

const findQuery = <T>(value: T) => {
  const chain: any = {
    exec: jest.fn().mockResolvedValue(value),
  };
  for (const method of ["sort", "limit", "select", "lean"]) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
  return chain;
};

describe("ReleasePublicationService", () => {
  const createService = (
    existing: any = null,
    releases: GithubReleaseData[] = [githubRelease],
    publications: any[] = [],
  ) => {
    const publicationQuery = findQuery(publications);
    const publicationModel = {
      findOne: jest.fn().mockReturnValue(query(existing)),
      find: jest.fn().mockReturnValue(publicationQuery),
      findByIdAndUpdate: jest.fn().mockImplementation((_id, value) =>
        query({
          _id,
          ...value,
        }),
      ),
      create: jest.fn().mockImplementation(async (value) => ({
        _id: "publication-id",
        ...value,
      })),
    };
    const projectService = {
      detail: jest.fn().mockResolvedValue({
        release: { repositoryUrl },
      }),
    };
    const service = new ReleasePublicationService(
      publicationModel as any,
      projectService as any,
    );
    (service as any).cache.set(repositoryUrl, {
      data: releases,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + 60_000,
    });
    return { service, publicationModel, publicationQuery };
  };

  it("publishes a web release only as a version publication", async () => {
    const { service, publicationModel } = createService();
    const result = await service.publish(
      {
        component: "web",
        githubReleaseId: 88,
        announcementTitle: "Web 1.4.0 更新公告",
        announcementContent: "New release",
        deploymentConfirmed: true,
      },
      "user-id",
    );

    expect(result.created).toBe(true);
    expect(publicationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "web",
        tagName: "web-v1.4.0",
      }),
    );
    expect(publicationModel.create.mock.calls[0][0]).not.toHaveProperty(
      "noticeId",
    );
  });

  it("returns the existing publication without creating another record", async () => {
    const existing = { _id: "existing-publication" };
    const { service, publicationModel } = createService(existing);
    const result = await service.publish(
      {
        component: "web",
        githubReleaseId: 88,
        announcementTitle: "Web 1.4.0 更新公告",
        announcementContent: "New release",
        deploymentConfirmed: true,
      },
      "user-id",
    );

    expect(result).toEqual({ publication: existing, created: false });
    expect(publicationModel.create).not.toHaveBeenCalled();
  });

  it("restores a deleted publication so the release can be published again", async () => {
    const existing = { _id: "deleted-publication", isDelete: true };
    const { service, publicationModel } = createService(existing);

    const result = await service.publish(
      {
        component: "web",
        githubReleaseId: 88,
        announcementTitle: "Web 1.4.0 更新公告",
        announcementContent: "New release",
        deploymentConfirmed: true,
      },
      "user-id",
    );

    expect(result.created).toBe(true);
    expect(publicationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "deleted-publication",
      expect.objectContaining({
        isDelete: false,
        updater: "user-id",
      }),
      expect.objectContaining({ new: true, skipMiddleware: true }),
    );
    expect(publicationModel.create).not.toHaveBeenCalled();
  });

  it("publishes an admin release as an admin version publication", async () => {
    const adminRelease: GithubReleaseData = {
      ...githubRelease,
      id: 89,
      tag_name: "admin-v1.4.0",
    };
    const { service, publicationModel } = createService(null, [adminRelease]);

    await service.publish(
      {
        component: "admin",
        githubReleaseId: 89,
        announcementTitle: "管理后台 1.4.0 更新公告",
        announcementContent: "Admin release",
        deploymentConfirmed: true,
      },
      "user-id",
    );

    expect(publicationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "admin",
        tagName: "admin-v1.4.0",
      }),
    );
  });

  it("reuses the five-minute repository cache and splits candidates by component", async () => {
    const githubGet = jest.spyOn(axios, "get");
    const { service } = createService();

    const first = await service.candidates(false);
    const second = await service.candidates(false);

    expect(first.web).toHaveLength(1);
    expect(first.admin).toHaveLength(0);
    expect(second.web[0].tagName).toBe("web-v1.4.0");
    expect(githubGet).not.toHaveBeenCalled();
    githubGet.mockRestore();
  });

  it("returns public version records newest first with public field names", async () => {
    const publishedAt = new Date("2026-07-16T08:00:00.000Z");
    const { service, publicationModel, publicationQuery } = createService(
      null,
      [githubRelease],
      [
        {
          _id: "publication-id",
          component: "web",
          tagName: "web-v1.4.0",
          version: "1.4.0",
          releaseUrl: githubRelease.html_url,
          releasePublishedAt: new Date(githubRelease.published_at!),
          announcementTitle: "Web 1.4.0 更新",
          announcementContent: "New release",
          publishedAt,
        },
      ],
    );

    await expect(service.publicList("web")).resolves.toEqual([
      expect.objectContaining({
        _id: "publication-id",
        component: "web",
        version: "1.4.0",
        title: "Web 1.4.0 更新",
        content: "New release",
        publishedAt,
      }),
    ]);
    expect(publicationModel.find).toHaveBeenCalledWith({ component: "web" });
    expect(publicationQuery.sort).toHaveBeenCalledWith({ publishedAt: -1 });
    expect(publicationQuery.limit).toHaveBeenCalledWith(50);
  });
});
