import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Resource } from 'src/modules/resource/schemas/resource';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

class SubObject {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  subTitle: string;

  @Prop({ type: Resource })
  background?: Resource;
}

class RegisterPage extends SubObject {
  // 是否强制需要邮箱验证码注册
  @Prop({ type: Boolean, default: false })
  forceEmailCaptcha: boolean;

  // 是否强制需要邀请码注册
  @Prop({ type: Boolean, default: false })
  forceInvitationCode: boolean;

  // 是否允许注册
  @Prop({ type: Boolean, default: true })
  allowRegister: boolean;

  // 禁止注册时的提示文字
  @Prop({ type: String, default: '当前不允许注册' })
  registerDisabledTip: string;
}

@Schema({ timestamps: true })
export class Project extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  //  项目编码 唯一
  @Prop({ type: String, unique: true })
  code: string;

  //   是否启用
  @Prop({ type: Boolean, default: true })
  enable: boolean;

  // 登录页设置
  @Prop({ type: SubObject })
  login: SubObject;

  // 注册页设置
  @Prop({ type: SubObject })
  register: RegisterPage;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(ProjectSchema);
