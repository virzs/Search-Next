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

const query = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

describe("ReleasePublicationService", () => {
  const createService = (
    existing: any = null,
    releases: GithubReleaseData[] = [githubRelease],
  ) => {
    const publicationModel = {
      findOne: jest.fn().mockReturnValue(query(existing)),
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue(query([])),
        }),
      }),
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
    const noticeService = {
      upsertReleaseNotice: jest.fn().mockResolvedValue({ _id: "notice-id" }),
    };
    const service = new ReleasePublicationService(
      publicationModel as any,
      projectService as any,
      noticeService as any,
    );
    (service as any).cache.set(repositoryUrl, {
      data: releases,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + 60_000,
    });
    return { service, publicationModel, noticeService };
  };

  it("publishes a web release into the tabs notice audience", async () => {
    const { service, publicationModel, noticeService } = createService();
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
    expect(noticeService.upsertReleaseNotice).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "tabs",
        sourceKey: "github:virzs/Search-Next:web:88",
      }),
    );
    expect(publicationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "web",
        noticeId: "notice-id",
        tagName: "web-v1.4.0",
      }),
    );
  });

  it("returns the existing publication without creating another notice", async () => {
    const existing = { _id: "existing-publication" };
    const { service, publicationModel, noticeService } =
      createService(existing);
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
    expect(noticeService.upsertReleaseNotice).not.toHaveBeenCalled();
    expect(publicationModel.create).not.toHaveBeenCalled();
  });

  it("publishes an admin release into the authenticated admin audience", async () => {
    const adminRelease: GithubReleaseData = {
      ...githubRelease,
      id: 89,
      tag_name: "admin-v1.4.0",
    };
    const { service, noticeService } = createService(null, [adminRelease]);

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

    expect(noticeService.upsertReleaseNotice).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "admin",
        sourceKey: "github:virzs/Search-Next:admin:89",
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
});
