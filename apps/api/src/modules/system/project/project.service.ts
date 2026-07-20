import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PageDto } from "src/public/dto/page";
import { Project } from "src/modules/system/project/schemas/project";
import { Response } from "src/utils/response";
import { ProjectName } from "./schemas/ref-names";
import { ProjectDto } from "./dto/project.dto";

export const DEFAULT_PROJECT_THEME_COLOR = "rgb(250, 84, 28)";

// 当不存在项目记录时的默认公开数据
const DEFAULT_PUBLIC_PROJECT: Partial<Project> = {
  name: "Search Next",
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
  site: {
    themeColor: DEFAULT_PROJECT_THEME_COLOR,
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
    if (!project) {
      return DEFAULT_PUBLIC_PROJECT as Project;
    }

    if (!project.site) {
      project.set("site", { themeColor: DEFAULT_PROJECT_THEME_COLOR });
    } else if (!project.site.themeColor) {
      project.set("site.themeColor", DEFAULT_PROJECT_THEME_COLOR);
    }
    return project;
  }

  async publicDetail(): Promise<Partial<Project>> {
    const doc = await this.projectModel.findOne().exec();
    const json = doc ? doc.toJSON() : DEFAULT_PUBLIC_PROJECT;
    const { name, description, login, register, turnstile, site } = json;
    return {
      name,
      description,
      login,
      register,
      site: {
        ...(site?.icon ? { icon: site.icon } : {}),
        themeColor: site?.themeColor ?? DEFAULT_PROJECT_THEME_COLOR,
      },
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
      site: body.site
        ? {
            ...body.site,
            themeColor: body.site.themeColor
              ? normalizeRgbColor(body.site.themeColor)
              : DEFAULT_PROJECT_THEME_COLOR,
          }
        : body.site,
    };
  }
}

export const normalizeRgbColor = (value: string) => {
  const match = String(value || "")
    .replace(/\s+/g, "")
    .match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i);
  if (!match) return DEFAULT_PROJECT_THEME_COLOR;
  return `rgb(${Number(match[1])}, ${Number(match[2])}, ${Number(match[3])})`;
};

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
