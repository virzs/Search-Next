import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

/**
 * @name 资源关联
 * @description 记录资源与其他数据的关联关系
 */
@Schema()
export class ResourceAssociation extends Document {
  @ApiProperty({ description: '资源ID' })
  @Prop({ required: true })
  resourceId: string;

  @ApiProperty({ description: '关联数据ID' })
  @Prop({ required: true })
  associatedDataId: string;

  @ApiProperty({ description: '关联数据来源' })
  @Prop({ required: true })
  associatedDataFrom: string;
}

export const ResourceAssociationSchema =
  SchemaFactory.createForClass(ResourceAssociation);
