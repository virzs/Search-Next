import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import axios, { AxiosError } from "axios";
import { Model } from "mongoose";
import {
  normalizeGithubRepositoryUrl,
  ProjectService,
} from "../project/project.service";
import { Response } from "src/utils/response";
import {
  ReleasePublication,
  ReleasePublicationName,
  type ReleaseComponent,
} from "./release-publication.schema";
import { PublishReleaseDto } from "./release-publication.dto";
import {
  type GithubReleaseData,
  parseRepositoryCoordinates,
  toReleaseCandidate,
} from "./release.util";

const DEFAULT_REPOSITORY_URL = "https://github.com/virzs/Search-Next";
const CACHE_TTL = 5 * 60 * 1000;

interface ReleaseCacheEntry {
  data: GithubReleaseData[];
  fetchedAt: string;
  expiresAt: number;
  etag?: string;
}

@Injectable()
export class ReleasePublicationService {
  private readonly cache = new Map<string, ReleaseCacheEntry>();

  constructor(
    @InjectModel(ReleasePublicationName)
    private readonly publicationModel: Model<ReleasePublication>,
    private readonly projectService: ProjectService,
  ) {}

  async candidates(refresh = false) {
    const repositoryUrl = await this.getRepositoryUrl();
    const releases = await this.fetchReleases(repositoryUrl, refresh);
    const cache = this.cache.get(repositoryUrl);
    const publications = await this.publicationModel
      .find({ repositoryUrl })
      .select(
        "component githubReleaseId tagName version releaseUrl releasePublishedAt announcementTitle announcementContent publishedAt",
      )
      .lean()
      .exec();
    const published = new Map(
      publications.map((item) => [
        `${item.component}:${item.githubReleaseId}`,
        item,
      ]),
    );

    const build = (component: ReleaseComponent) =>
      releases
        .map((release) => toReleaseCandidate(release, component))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort(
          (a, b) =>
            new Date(b.releasePublishedAt).getTime() -
            new Date(a.releasePublishedAt).getTime(),
        )
        .slice(0, 20)
        .map((item) => {
          const publication = published.get(
            `${component}:${item.githubReleaseId}`,
          );
          return {
            ...item,
            published: Boolean(publication),
            publicationId: publication?._id,
            publication: publication
              ? {
                  _id: publication._id,
                  tagName: publication.tagName,
                  version: publication.version,
                  title: publication.announcementTitle,
                  content: publication.announcementContent,
                  releaseUrl: publication.releaseUrl,
                  releasePublishedAt: publication.releasePublishedAt,
                  publishedAt: publication.publishedAt,
                }
              : undefined,
          };
        });

    return {
      repositoryUrl,
      fetchedAt: cache?.fetchedAt || new Date().toISOString(),
      web: build("web"),
      admin: build("admin"),
    };
  }

  async page(query: {
    page?: number;
    pageSize?: number;
    component?: ReleaseComponent;
  }) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);
    const finder = query.component ? { component: query.component } : {};
    const data = await this.publicationModel
      .find(finder)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("creator", "username")
      .exec();
    const total = await this.publicationModel.countDocuments(finder);
    return Response.page(data, { page, pageSize, total });
  }

  async latest(component: ReleaseComponent) {
    this.validateComponent(component);
    return this.publicationModel
      .findOne({ component })
      .sort({ publishedAt: -1 })
      .select("component tagName version releaseUrl publishedAt")
      .lean()
      .exec();
  }

  async publicList(component: ReleaseComponent) {
    this.validateComponent(component);
    const publications = await this.publicationModel
      .find({ component })
      .sort({ publishedAt: -1 })
      .limit(50)
      .select(
        "component tagName version releaseUrl releasePublishedAt announcementTitle announcementContent publishedAt",
      )
      .lean()
      .exec();

    return publications.map((publication) => ({
      _id: publication._id,
      component: publication.component,
      tagName: publication.tagName,
      version: publication.version,
      title: publication.announcementTitle,
      content: publication.announcementContent,
      releaseUrl: publication.releaseUrl,
      releasePublishedAt: publication.releasePublishedAt,
      publishedAt: publication.publishedAt,
    }));
  }

  async publish(body: PublishReleaseDto, user: string) {
    const repositoryUrl = await this.getRepositoryUrl();
    const existing = await this.publicationModel
      .findOne({
        repositoryUrl,
        component: body.component,
        githubReleaseId: body.githubReleaseId,
      })
      .setOptions({ skipMiddleware: true })
      .exec();
    if (existing && !existing.isDelete) {
      return { publication: existing, created: false };
    }

    const release = await this.fetchReleaseById(
      repositoryUrl,
      body.githubReleaseId,
    );
    const candidate = toReleaseCandidate(release, body.component);
    if (!candidate) {
      throw new BadRequestException("选择的 Release 与发布端不匹配");
    }

    const publicationData = {
      component: body.component,
      repositoryUrl,
      githubReleaseId: candidate.githubReleaseId,
      tagName: candidate.tagName,
      version: candidate.version,
      releaseName: candidate.releaseName,
      releaseUrl: candidate.releaseUrl,
      releasePublishedAt: new Date(candidate.releasePublishedAt),
      announcementTitle: body.announcementTitle.trim(),
      announcementContent: body.announcementContent.trim(),
      publishedAt: new Date(),
    };

    try {
      if (existing?.isDelete) {
        const publication = await this.publicationModel
          .findByIdAndUpdate(
            existing._id,
            {
              ...publicationData,
              isDelete: false,
              updater: user,
            },
            { new: true, skipMiddleware: true },
          )
          .exec();
        return { publication, created: true };
      }

      const publication = await this.publicationModel.create({
        ...publicationData,
        creator: user,
      });
      return { publication, created: true };
    } catch (error: any) {
      if (error?.code === 11000) {
        const publication = await this.publicationModel
          .findOne({
            repositoryUrl,
            component: body.component,
            githubReleaseId: body.githubReleaseId,
          })
          .setOptions({ skipMiddleware: true })
          .exec();
        return { publication, created: false };
      }
      throw error;
    }
  }

  private validateComponent(component: ReleaseComponent) {
    if (!["web", "admin"].includes(component)) {
      throw new BadRequestException("component 必须是 web 或 admin");
    }
  }

  private async getRepositoryUrl() {
    const project = await this.projectService.detail();
    try {
      return normalizeGithubRepositoryUrl(
        project?.release?.repositoryUrl || DEFAULT_REPOSITORY_URL,
      );
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  private async fetchReleaseById(
    repositoryUrl: string,
    githubReleaseId: number,
  ) {
    const cached = await this.fetchReleases(repositoryUrl, false);
    const found = cached.find((item) => item.id === githubReleaseId);
    if (found) return found;

    const { owner, repository } = parseRepositoryCoordinates(repositoryUrl);
    try {
      const response = await axios.get<GithubReleaseData>(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/releases/${githubReleaseId}`,
        {
          timeout: 10_000,
          headers: this.githubHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      this.throwGithubError(error);
    }
  }

  private async fetchReleases(repositoryUrl: string, refresh: boolean) {
    const cached = this.cache.get(repositoryUrl);
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const { owner, repository } = parseRepositoryCoordinates(repositoryUrl);
    try {
      const response = await axios.get<GithubReleaseData[]>(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/releases`,
        {
          timeout: 10_000,
          params: { per_page: 100 },
          headers: {
            ...this.githubHeaders(),
            ...(cached?.etag ? { "If-None-Match": cached.etag } : {}),
          },
          validateStatus: (status) => status === 200 || status === 304,
        },
      );

      const data =
        response.status === 304 && cached ? cached.data : response.data;
      const entry: ReleaseCacheEntry = {
        data,
        fetchedAt: new Date().toISOString(),
        expiresAt: Date.now() + CACHE_TTL,
        etag: response.headers.etag || cached?.etag,
      };
      this.cache.set(repositoryUrl, entry);
      return data;
    } catch (error) {
      if (cached) return cached.data;
      this.throwGithubError(error);
    }
  }

  private githubHeaders() {
    return {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Search-Next-Release-Publisher",
    };
  }

  private throwGithubError(error: unknown): never {
    const response = (error as AxiosError)?.response;
    if (response?.status === 404) {
      throw new NotFoundException("GitHub 仓库或 Release 不存在");
    }
    if (response?.status === 403) {
      const reset = response.headers?.["x-ratelimit-reset"];
      const suffix = reset
        ? `，可在 ${new Date(Number(reset) * 1000).toLocaleString()} 后重试`
        : "";
      throw new BadGatewayException(`GitHub API 请求已达到限额${suffix}`);
    }
    throw new BadGatewayException("暂时无法读取 GitHub Release");
  }
}
