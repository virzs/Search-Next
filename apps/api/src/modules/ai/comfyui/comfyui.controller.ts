import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComfyuiService } from './comfyui.service';
import { Text2ImageDto } from './dto/text2image.dto';
import { Image2ImageDto } from './dto/image2image.dto';
import { JobStatusUpdateDto } from './dto/job-status.dto';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { Response } from 'src/utils/response';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('ComfyUI')
@Controller('ai/comfyui')
export class ComfyuiController {
  constructor(private readonly service: ComfyuiService) {}

  @Post('/text2image')
  @RequireLogin()
  @ApiOperation({ summary: '文生图 - 提交任务' })
  async text2image(@Body() body: Text2ImageDto, @User('_id') user: string) {
    return await this.service.text2image(body, user);
  }

  @Post('/image2image')
  @RequireLogin()
  @ApiOperation({ summary: '图生图 - 提交任务' })
  async image2image(@Body() body: Image2ImageDto, @User('_id') user: string) {
    return await this.service.image2image(body, user);
  }

  @Get('/job/:id')
  @RequireLogin()
  @ApiOperation({ summary: '任务状态' })
  async job(@Param('id') id: string) {
    return await this.service.getJob(id);
  }

  @Get('/queue')
  @RequireLogin()
  @ApiOperation({ summary: '队列状态' })
  async queue(@Query() query: any) {
    const res = await this.service.getQueue(query);
    return Response.page(res.data, res);
  }

  @Post('/relay/job/update')
  @RequireLogin()
  @ApiOperation({ summary: '同步任务状态回调' })
  async relayUpdate(@Body() body: JobStatusUpdateDto) {
    return await this.service.updateFromRelay(body);
  }

  @Post('/relay/health')
  @RequireLogin()
  @ApiOperation({ summary: '同步 ComfyUI 连接回调' })
  async relayHealth(@Body() body: { connected: boolean }) {
    return this.service.setComfyHealth(!!body.connected);
  }

  @Get('/health')
  @RequireLogin()
  @ApiOperation({ summary: 'ComfyUI 连接状态' })
  async health() {
    return this.service.getComfyHealth();
  }
}
