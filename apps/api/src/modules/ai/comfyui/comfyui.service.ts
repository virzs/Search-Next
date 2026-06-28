import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  ComfyJob,
  ComfyJobDocument,
  ComfyJobName,
} from './schemas/comfy-job';
import { Text2ImageDto } from './dto/text2image.dto';
import { Image2ImageDto } from './dto/image2image.dto';
import { JobStatusUpdateDto } from './dto/job-status.dto';
import { randomUUID } from 'crypto';
import { ResourceService } from 'src/modules/resource/resource.service';
import * as path from 'path';

@Injectable()
export class ComfyuiService {
  constructor(
    @InjectModel(ComfyJobName)
    private readonly jobModel: Model<ComfyJobDocument>,
    private readonly config: ConfigService,
    private readonly resourceService: ResourceService,
  ) {}

  private comfyConnected = false;

  private relayBaseUrl() {
    return (
      this.config.get<string>('comfyuiRelay.serverUrl') ||
      process.env.SERVER_BASE_URL ||
      'http://127.0.0.1:5151'
    );
  }

  private relayEndpoint() {
    return (
      this.config.get<string>('comfyuiRelay.relayUrl') ||
      process.env.RELAY_BASE_URL ||
      'http://127.0.0.1:5252'
    );
  }

  async text2image(body: Text2ImageDto, user?: string) {
    const jobId = randomUUID();
    await this.jobModel.create({
      jobId,
      type: 't2i',
      status: 'queued',
      params: { ...body, user },
      progress: 0,
    });

    await axios.post(`${this.relayEndpoint()}/relay/comfyui/text2image`, {
      jobId,
      params: body,
      callbackBaseUrl: this.relayBaseUrl(),
    });

    return { jobId, status: 'queued' };
  }

  async image2image(body: Image2ImageDto, user?: string) {
    const jobId = randomUUID();
    await this.jobModel.create({
      jobId,
      type: 'i2i',
      status: 'queued',
      params: { ...body, user },
      progress: 0,
    });

    await axios.post(`${this.relayEndpoint()}/relay/comfyui/image2image`, {
      jobId,
      params: body,
      callbackBaseUrl: this.relayBaseUrl(),
    });

    return { jobId, status: 'queued' };
  }

  async getJob(jobId: string) {
    const job = await this.jobModel.findOne({ jobId });
    if (!job) throw new NotFoundException('任务不存在');
    return job;
  }

  async getQueue(query: any) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);
    const total = await this.jobModel.countDocuments({
      status: { $in: ['queued', 'running'] },
    });
    const data = await this.jobModel
      .find({ status: { $in: ['queued', 'running'] } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return { data, total, page, pageSize };
  }

  async updateFromRelay(update: JobStatusUpdateDto) {
    const job = await this.jobModel.findOne({ jobId: update.jobId });
    if (!job) throw new NotFoundException('任务不存在');
    job.status = update.status;
    if (typeof update.progress === 'number') job.progress = update.progress;
    if (update.outputUrls && update.outputUrls.length) {
      const uploadedIds: string[] = [];
      const uploadedUrls: string[] = [];
      for (const url of update.outputUrls) {
        try {
          const resource = await this.uploadComfyOutput(url);
          uploadedIds.push(String(resource._id));
          const visit = await this.resourceService.getVisitUrlByDetail(resource as any);
          uploadedUrls.push(visit || '');
        } catch (e) {
          // ignore single file failure
        }
      }
      job.outputUrls = uploadedUrls.length ? uploadedUrls : update.outputUrls;
      (job as any).resourceIds = uploadedIds;
    }
    if (update.promptId) job.promptId = update.promptId;
    if (update.error) job.error = update.error;
    await job.save();
    return { success: true };
  }

  setComfyHealth(connected: boolean) {
    this.comfyConnected = connected;
    return { connected };
  }

  getComfyHealth() {
    return { connected: this.comfyConnected };
  }

  private async uploadComfyOutput(url: string) {
    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    const buf = Buffer.from(resp.data);
    const filename = this.extractFilenameFromViewUrl(url) || `comfy_${Date.now()}.png`;
    const ext = path.extname(filename).toLowerCase();
    const mimetype =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.png'
          ? 'image/png'
          : 'image/png';
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype,
      size: buf.length,
      buffer: buf,
      destination: '',
      filename: filename,
      path: '',
      stream: null as any,
    };
    const resource = await this.resourceService.uploadFile('comfyui', file, undefined);
    return resource;
  }

  private extractFilenameFromViewUrl(url: string) {
    try {
      const u = new URL(url);
      const filename = u.searchParams.get('filename');
      return filename || null;
    } catch {
      return null;
    }
  }
}
