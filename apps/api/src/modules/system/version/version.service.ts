import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LastVersion, Version, VersionName } from "./schemas/version";
import { Model } from "mongoose";
import { PageDto } from "src/public/dto/page";
import { Response } from "src/utils/response";
import { VersionDto } from "./dto/version.dto";
import {
  ReleasePublication,
  ReleasePublicationName,
} from "./release-publication.schema";

const RELEASE_VERSION_ID_PREFIX = "release:";

@Injectable()
export class VersionService {
  constructor(
    @InjectModel(VersionName) private readonly versionModel: Model<Version>,
    @InjectModel(ReleasePublicationName)
    private readonly publicationModel: Model<ReleasePublication>,
  ) {}

  async page(query: PageDto) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Number(query.pageSize || 10));
    const offset = (page - 1) * pageSize;
    const fetchLimit = offset + pageSize;
    const active = { isDelete: { $in: [false, null] } };

    const [versions, publications, versionTotal, publicationTotal] =
      await Promise.all([
        this.versionModel
          .find({}, { content: 0 })
          .sort({ releaseTime: -1, createdAt: -1 })
          .limit(fetchLimit)
          .populate("creator")
          .populate("updater")
          .exec(),
        this.publicationModel
          .find({})
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(fetchLimit)
          .populate("creator", "username")
          .populate("updater", "username")
          .exec(),
        this.versionModel.countDocuments(active),
        this.publicationModel.countDocuments(active),
      ]);

    const data = [
      ...versions.map((version) => this.toClientVersion(version)),
      ...publications.map((publication) => this.toReleaseVersion(publication)),
    ]
      .sort((a, b) => this.versionTime(b) - this.versionTime(a))
      .slice(offset, offset + pageSize);

    return Response.page(data, {
      page,
      pageSize,
      total: versionTotal + publicationTotal,
    });
  }

  async create(body: VersionDto, user: string) {
    const version = await this.versionModel.create({ ...body, creator: user });
    return version;
  }

  async update(id: string, body: VersionDto, user: string) {
    const version = await this.versionModel.findByIdAndUpdate(
      id,
      { ...body, updater: user },
      {
        new: true,
      },
    );
    return version;
  }

  async delete(id: string, user: string) {
    if (this.isReleaseVersionId(id)) {
      const publicationId = this.releasePublicationId(id);
      const old = await this.publicationModel.findById(publicationId).exec();
      if (!old) {
        throw new NotFoundException("版本不存在");
      }
      return this.publicationModel.findByIdAndUpdate(
        publicationId,
        { isDelete: true, updater: user },
        { new: true },
      );
    }

    const old = await this.versionModel.findById(id);
    if (!old) {
      throw new Error("版本不存在");
    }
    const version = await this.versionModel.findByIdAndUpdate(id, {
      isDelete: true,
      version: `${old.version}-delete-${new Date().getTime()}`,
      updater: user,
    });
    return version;
  }

  //   获取最新的版本，根据平台
  async latest(platform: string) {
    const version = await this.versionModel
      .findOne({
        ...(platform === "all" ? {} : { platform }),
        isDelete: false,
        $or: [
          { releaseTime: { $exists: false } },
          { releaseTime: { $lte: new Date() } },
        ],
      })
      .sort({ createTime: -1 })
      .exec();

    if (!version) {
      return null;
    }

    if (platform === "all") {
      return version;
    }

    const { platforms, ...rest } = version;

    const platformData = platforms.findIndex(
      (item) => item.platform === platform,
    );

    if (platformData === -1) {
      return null;
    }

    const result = {
      ...rest,
      platform: platforms[platformData],
    } as unknown as LastVersion;

    return result;
  }

  async detail(id: string) {
    if (this.isReleaseVersionId(id)) {
      const publication = await this.publicationModel
        .findById(this.releasePublicationId(id))
        .populate("creator", "username")
        .populate("updater", "username")
        .exec();
      if (!publication) {
        throw new NotFoundException("版本不存在");
      }
      return this.toReleaseVersion(publication, true);
    }

    const version = await this.versionModel.findById(id);
    return version;
  }

  private isReleaseVersionId(id: string) {
    return id.startsWith(RELEASE_VERSION_ID_PREFIX);
  }

  private releasePublicationId(id: string) {
    return id.slice(RELEASE_VERSION_ID_PREFIX.length);
  }

  private toObject(value: any) {
    return typeof value?.toObject === "function" ? value.toObject() : value;
  }

  private toClientVersion(version: any) {
    return {
      ...this.toObject(version),
      recordType: "client" as const,
    };
  }

  private toReleaseVersion(publication: any, includeContent = false) {
    const value = { ...this.toObject(publication) };
    const announcementContent = value.announcementContent;
    const announcementTitle = value.announcementTitle;
    delete value.announcementContent;
    delete value.announcementTitle;
    delete value.isDelete;
    delete value.__v;
    const sourceId = String(value._id);
    return {
      ...value,
      _id: `${RELEASE_VERSION_ID_PREFIX}${sourceId}`,
      sourceId,
      recordType: "release" as const,
      platforms: [{ platform: value.component }],
      content: includeContent ? announcementContent : undefined,
      title: announcementTitle,
      releaseTime: value.publishedAt,
    };
  }

  private versionTime(version: any) {
    const value =
      version.releaseTime || version.publishedAt || version.createdAt;
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
