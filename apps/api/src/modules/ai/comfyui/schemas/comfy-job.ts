import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import BaseSchema, {
  baseSchemaMiddleware,
} from 'src/public/schema/base.schema';

export const ComfyJobName = 'ComfyJob';

export type ComfyJobDocument = ComfyJob & Document;

@Schema({ timestamps: true })
export class ComfyJob extends BaseSchema {
  @Prop({ required: true, type: String })
  jobId: string;

  @Prop({ required: true, type: String })
  type: 't2i' | 'i2i';

  @Prop({ required: true, type: String })
  status: 'queued' | 'running' | 'completed' | 'error';

  @Prop({ type: Number, default: 0 })
  progress: number;

  @Prop({ type: Object })
  params: Record<string, any>;

  @Prop({ type: String })
  promptId?: string;

  @Prop({ type: [String], default: [] })
  outputUrls: string[];

  @Prop({ type: String })
  error?: string;
}

export const ComfyJobSchema = SchemaFactory.createForClass(ComfyJob);

baseSchemaMiddleware(ComfyJobSchema);

