import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UsersName } from 'src/modules/users/schemas/ref-names';

// 扩展 mongoose 的 QueryOptions 接口
declare module 'mongoose' {
  interface QueryOptions {
    /**
     * 跳过中间件
     */
    skipMiddleware?: boolean;
    /**
     * 跳过 toJSON 中间件
     */
    skipToJSON?: boolean;
  }
}

/**
 * 默认 Schema 添加 创建人 创建时间 更新人 更新时间
 */
@Schema({ timestamps: true })
class BaseSchema extends Document {
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
  })
  creator: string;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: UsersName,
  })
  updater: string;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;

  createdAt: Date;

  updatedAt: Date;
}

// 默认查询中间件函数
// BaseSchema.pre('find', function () {});
export const baseSchemaPreFind = function () {
  this.where({ isDelete: { $in: [false, null] } });
};

// 默认 toJSON 中间件函数
// BaseSchema.methods.toJSON = function () {};
export const baseSchemaToJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDelete, __v, ...data } = this.toObject();
  return data;
};

// 整合默认查询中间件函数和默认 toJSON 中间件函数 参数为 Schema
export const baseSchemaMiddleware = (
  schema: mongoose.Schema,
  options?: {
    preFind?: () => void;
    preFindOne?: () => void;
    preFindOneAndUpdate?: () => void;
    preUpdate?: () => void;
    preUpdateOne?: () => void;
    preUpdateMany?: () => void;
    preCountDocuments?: () => void;
    toJSON?: () => any;
    enableSkipMiddleware?: boolean; // 新增: 是否启用跳过中间件功能
  },
) => {
  const {
    preFind,
    preFindOne,
    preFindOneAndUpdate,
    preUpdateOne,
    preUpdateMany,
    preCountDocuments,
    toJSON,
    enableSkipMiddleware = false,
  } = options ?? {};

  // 默认的 preFind 处理函数
  const defaultPreFind = function () {
    if (enableSkipMiddleware && this.getOptions?.()?.skipMiddleware) {
      return;
    }
    baseSchemaPreFind.call(this);
  };

  // 默认的 toJSON 处理函数
  const defaultToJSON = function () {
    if (enableSkipMiddleware && this.getOptions?.()?.skipToJSON) {
      return this.toObject();
    }
    return baseSchemaToJSON.call(this);
  };

  // 应用中间件
  schema.pre('find', preFind ?? defaultPreFind);
  schema.pre('findOne', preFindOne ?? defaultPreFind);
  schema.pre('findOneAndUpdate', preFindOneAndUpdate ?? defaultPreFind);
  schema.pre('updateOne', preUpdateOne ?? defaultPreFind);
  schema.pre('updateMany', preUpdateMany ?? defaultPreFind);
  schema.pre('countDocuments', preCountDocuments ?? defaultPreFind);
  schema.methods.toJSON = toJSON ?? defaultToJSON;
};

export default BaseSchema;
