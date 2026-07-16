import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PageDto } from "src/public/dto/page";
import { Project } from "src/modules/system/project/schemas/project";
import { Response } from "src/utils/response";
import { ProjectName } from "./schemas/ref-names";
import { ProjectDto } from "./dto/project.dto";

// 当不存在项目记录时的默认公开数据
const DEFAULT_PUBLIC_PROJECT: Partial<Project> = {
  name: "默认项目",
  description: "",
  login: {
    title: "",
    subTitle: "",
  },
  register: {
    title: "",
    subTitle: "",
    forceEmailCaptcha: false,
    forceInvitationCode: false,
    allowRegister: true,
    registerDisabledTip: "当前不允许注册",
  },
  turnstile: {
    enabled: false,
    siteKey: "",
  },
  adminAccess: {
    loginRoleIds: [],
  },
  release: {
    repositoryUrl: "https://github.com/virzs/Search-Next",
  },
};

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(ProjectName) private readonly projectModel: Model<Project>,
  ) {}

  async list(query: PageDto) {
    const { page = 1, pageSize = 10 } = query;

    const projects = await this.projectModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.projectModel.countDocuments();

    return Response.page(projects, { page, pageSize, total });
  }

  async create(body: ProjectDto, user: string) {
    const normalized = this.normalizeProject(body);
    const result = await this.projectModel.create({
      ...normalized,
      creator: user,
    });
    return result;
  }

  async update(id: string, body: ProjectDto, user: string) {
    const normalized = this.normalizeProject(body);
    const result = await this.projectModel.findByIdAndUpdate(
      id,
      { ...normalized, updater: user },
      {
        new: true,
      },
    );
    return result;
  }

  async detail() {
    // 当前始终只有一条，多项目配置以后看情况修改
    const project = await this.projectModel.findOne().exec();
    return project ?? (DEFAULT_PUBLIC_PROJECT as Project);
  }

  async publicDetail(): Promise<Partial<Project>> {
    const doc = await this.projectModel.findOne().exec();
    if (!doc) {
      return DEFAULT_PUBLIC_PROJECT;
    }
    const json = doc.toJSON();
    const { name, description, login, register, turnstile } = json;
    return {
      name,
      description,
      login,
      register,
      turnstile: {
        enabled: turnstile?.enabled ?? false,
        siteKey: turnstile?.siteKey ?? "",
      },
    } as Partial<Project>;
  }

  private normalizeProject(body: ProjectDto) {
    let repositoryUrl: string | undefined;
    try {
      repositoryUrl = body.release?.repositoryUrl
        ? normalizeGithubRepositoryUrl(body.release.repositoryUrl)
        : undefined;
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    return {
      ...body,
      release: repositoryUrl ? { repositoryUrl } : body.release,
    };
  }
}

export const normalizeGithubRepositoryUrl = (value: string) => {
  let url: URL;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    throw new Error("GitHub 仓库地址格式不正确");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("发布仓库仅支持 https://github.com 地址");
  }

  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("GitHub 仓库地址必须包含 owner/repository");
  }

  const owner = parts[0];
  const repository = parts[1].replace(/\.git$/i, "");
  if (
    !owner ||
    !repository ||
    !/^[A-Za-z0-9_.-]+$/.test(owner) ||
    !/^[A-Za-z0-9_.-]+$/.test(repository)
  ) {
    throw new Error("GitHub 仓库地址必须包含 owner/repository");
  }

  return `https://github.com/${owner}/${repository}`;
};
