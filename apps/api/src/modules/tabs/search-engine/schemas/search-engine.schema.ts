import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export type SearchEngineDocument = SearchEngine & Document;

export const SearchEngineName = 'SearchEngine';

@Schema({ timestamps: true })
export class SearchEngine extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string; // 名称（唯一）

  @Prop()
  description?: string; // 描述

  @Prop()
  icon?: string; // 图标（内联SVG字符串）

  @Prop({ required: true })
  searchUrl: string; // 搜索网址

  @Prop()
  suggestUrl?: string; // 搜索提示词接口地址

  @Prop({ type: String, default: '(function(data){return data;})' })
  jsonpCode: string; // JSONP 获取提示词代码（默认空）

  @Prop({ default: true })
  isEnabled: boolean; // 是否启用
}

export const SearchEngineSchema = SchemaFactory.createForClass(SearchEngine);

// 应用基础中间件，确保默认不查询 isDelete=true，并隐藏 isDelete、__v
baseSchemaMiddleware(SearchEngineSchema);
