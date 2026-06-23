import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import BaseSchema, {
  baseSchemaPreFind,
  baseSchemaToJSON,
} from 'src/public/schema/base.schema';
import { UsersName } from './ref-names';

@Schema({ timestamps: true })
export class Integral extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UsersName })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  integral: number;

  @Prop({ type: String })
  reason: string;
}

export const IntegralSchema = SchemaFactory.createForClass(Integral);

IntegralSchema.pre('find', baseSchemaPreFind);

IntegralSchema.methods.toJSON = baseSchemaToJSON;
