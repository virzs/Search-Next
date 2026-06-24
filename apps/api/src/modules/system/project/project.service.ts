import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageDto } from 'src/public/dto/page';
import { Project } from 'src/modules/system/project/schemas/project';
import { Response } from 'src/utils/response';
import { ProjectName } from './schemas/ref-names';
import { ProjectDto } from './dto/project.dto';

// 当不存在项目记录时的默认公开数据
const DEFAULT_PUBLIC_PROJECT: Partial<Project> = {
  name: '默认项目',
  description: '',
  login: {
    title: '',
    subTitle: '',
  },
  register: {
    title: '',
    subTitle: '',
    forceEmailCaptcha: false,
    forceInvitationCode: false,
    allowRegister: true,
    registerDisabledTip: '当前不允许注册',
  },
  turnstile: {
    enabled: false,
    siteKey: '',
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
    const result = await this.projectModel.create({ ...body, creator: user });
    return result;
  }

  async update(id: string, body: ProjectDto, user: string) {
    const result = await this.projectModel.findByIdAndUpdate(
      id,
      { ...body, updater: user },
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
        siteKey: turnstile?.siteKey ?? '',
      },
    } as Partial<Project>;
  }
}
