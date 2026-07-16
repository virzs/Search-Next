import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Response } from "src/utils/response";
import {
  SystemNotice,
  SystemNoticeSchemaName,
} from "src/modules/system/notice/notice.schema";
import {
  SystemNoticeDto,
  SystemNoticeForAdminDto,
} from "src/modules/system/notice/notice.dto";

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel(SystemNoticeSchemaName)
    private readonly noticeModel: Model<SystemNotice>,
  ) {}

  async page(query: SystemNoticeForAdminDto) {
    const { page = 1, pageSize = 10, key, search, active } = query as any;
    const finder: any = {};

    if (key) finder.key = key;

    if (search) {
      finder.title = { $regex: search, $options: "i" };
    }

    if (active === "true") {
      const now = new Date();
      finder.enable = true;
      finder.$and = [
        {
          $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
        },
        {
          $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }],
        },
      ];
    }

    const data = await this.noticeModel
      .find(finder)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .sort({ createdAt: -1 })
      .populate("creator", "username")
      .populate("updater", "username")
      .exec();

    const total = await this.noticeModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async detail(id: string) {
    return this.noticeModel
      .findById(id)
      .populate("creator", "username")
      .populate("updater", "username")
      .exec();
  }

  async create(body: SystemNoticeDto, user: string) {
    const { effectiveStart, effectiveEnd, enable, ...rest } = body as any;
    const doc: any = {
      ...rest,
      enable: enable ?? true,
      creator: user,
    };

    if (effectiveStart) doc.effectiveStart = new Date(effectiveStart);
    if (effectiveEnd) doc.effectiveEnd = new Date(effectiveEnd);

    return this.noticeModel.create(doc);
  }

  async update(id: string, body: SystemNoticeDto, user: string) {
    const { effectiveStart, effectiveEnd, ...rest } = body as any;
    const doc: any = {
      ...rest,
      updater: user,
    };

    if ("effectiveStart" in body) {
      doc.effectiveStart = effectiveStart
        ? new Date(effectiveStart)
        : undefined;
    }
    if ("effectiveEnd" in body) {
      doc.effectiveEnd = effectiveEnd ? new Date(effectiveEnd) : undefined;
    }

    return this.noticeModel.findByIdAndUpdate(id, doc, { new: true });
  }

  async delete(id: string, user?: string) {
    return this.noticeModel.findByIdAndUpdate(
      id,
      { isDelete: true, updater: user },
      { new: true },
    );
  }

  async getAllForPublic(key: string) {
    const now = new Date();
    return this.noticeModel
      .find({
        key,
        enable: true,
        $and: [
          {
            $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
          },
          {
            $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }],
          },
        ],
      })
      .select(
        "title content cover effectiveStart effectiveEnd sourceKey sourceUrl",
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  async inbox(key: string) {
    const now = new Date();
    return this.noticeModel
      .find({
        key,
        enable: true,
        $and: [
          {
            $or: [{ effectiveStart: null }, { effectiveStart: { $lte: now } }],
          },
          {
            $or: [{ effectiveEnd: null }, { effectiveEnd: { $gte: now } }],
          },
        ],
      })
      .select(
        "title content cover effectiveStart effectiveEnd sourceKey sourceUrl createdAt",
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  async upsertReleaseNotice(payload: {
    sourceKey: string;
    key: string;
    title: string;
    content: string;
    releaseUrl: string;
    user: string;
  }) {
    return this.noticeModel.findOneAndUpdate(
      { sourceKey: payload.sourceKey },
      {
        $setOnInsert: {
          sourceKey: payload.sourceKey,
          sourceUrl: payload.releaseUrl,
          key: payload.key,
          title: payload.title,
          content: payload.content,
          enable: true,
          effectiveStart: new Date(),
          creator: payload.user,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
