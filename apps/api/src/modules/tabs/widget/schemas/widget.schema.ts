import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';
import { ResourceName } from 'src/modules/resource/schemas/ref-names';
import { WidgetClassifyName } from '../../widget-classify/schemas/widget-classify.schema';

export type WidgetDocument = Widget & Document;

export const WidgetName = 'Widget';

const WidgetAppIconSchema = {
  type: { type: String, enum: ['image', 'custom'], required: true },
  src: { type: String },
};

const WidgetPagePathsSchema = {
  _id: false,
  settings: { type: String },
};

const WidgetScreenshotSchema = {
  mode: { type: String },
  themeId: { type: String, required: true },
  sizeId: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  file: { type: String, required: true },
  url: { type: String, required: true },
};

@Schema({ timestamps: true })
export class Widget extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: ResourceName }],
    default: [],
  })
  previewImages: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: ResourceName }],
    default: [],
  })
  files: mongoose.Types.ObjectId[];

  @Prop({ type: String, required: true })
  entryFileName: string;

  @Prop({ type: String })
  dir?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ResourceName })
  icon?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WidgetClassifyName })
  classify?: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  enable: boolean;

  // 小组件版本号
  @Prop({ type: String })
  version?: string;

  @Prop({ type: String, enum: ['legacy', 'snwidget'], default: 'legacy' })
  sourceType: 'legacy' | 'snwidget';

  @Prop({ type: String })
  packageName?: string;

  @Prop({ type: String })
  packageSourceName?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'WidgetVersion' })
  activeVersion?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  entryUrl?: string;

  @Prop({ type: String })
  iconUrl?: string;

  @Prop({ type: [WidgetScreenshotSchema], default: [] })
  screenshots: Array<{
    mode?: string;
    themeId: string;
    sizeId: string;
    width?: number;
    height?: number;
    file: string;
    url: string;
  }>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  configSnapshot?: Record<string, any>;

  // 小组件作者
  @Prop({ type: String })
  author?: string;

  // 尺寸配置列表，定义该小组件支持的桌面尺寸
  @Prop({
    type: [
      {
        row: { type: Number, required: true },
        col: { type: Number, required: true },
        name: { type: String, required: true },
        id: { type: String, required: true },
      },
    ],
    default: [{ row: 1, col: 2, name: '2x1', id: '2x1' }],
  })
  sizeConfigs: Array<{ row: number; col: number; name: string; id: string }>;

  // 默认尺寸ID，对应 sizeConfigs 中的 id
  @Prop({ type: String, default: '2x1' })
  defaultSizeId: string;

  // 是否支持图标模式（在桌面上显示为小图标）
  @Prop({ type: Boolean, default: false })
  supportIconMode: boolean;

  // 是否支持作为应用添加到桌面
  @Prop({ type: Boolean, default: false })
  supportAppMode: boolean;

  // 应用图标配置。image 使用 appIconUrl/custom 使用入口 appIcon 模式渲染
  @Prop({ type: WidgetAppIconSchema })
  appIcon?: { type: 'image' | 'custom'; src?: string };

  @Prop({ type: String })
  appIconUrl?: string;

  @Prop({ type: WidgetPagePathsSchema })
  pagePaths?: { settings?: string };

  // 标签列表，用于搜索和分类
  @Prop({ type: [String], default: [] })
  tags: string[];

  // 排序权重，值越小越靠前
  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  // 小组件设置表单 schema，以 antd 表单格式描述可配置项
  @Prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  settingsSchema: Array<Record<string, any>>;
}

export const WidgetSchema = SchemaFactory.createForClass(Widget);
baseSchemaMiddleware(WidgetSchema);
