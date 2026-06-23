import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserApiKeyService } from './user-api-key.service';
import { UserApiKey } from './user-api-key.schema';
import { SaveApiKeyDto } from './dto/user-api-key.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('AI/用户API密钥管理')
@Controller('ai/user-api-keys')
export class UserApiKeyController {
  constructor(private readonly userApiKeyService: UserApiKeyService) {}

  @Post()
  @ApiOperation({ summary: '保存用户API密钥' })
  @ApiResponse({ status: 201, description: 'API密钥保存成功' })
  @ApiResponse({ status: 400, description: '该服务商的API密钥已存在' })
  async saveApiKey(
    @Body() saveApiKeyDto: SaveApiKeyDto,
    @User('_id') userId: string,
  ): Promise<UserApiKey> {
    return await this.userApiKeyService.saveApiKey(
      userId,
      saveApiKeyDto.provider,
      saveApiKeyDto.apiKey,
    );
  }

  @Get()
  @ApiOperation({ summary: '获取用户的所有API密钥' })
  @ApiResponse({ status: 200, description: 'API密钥列表（密钥值已加密显示）' })
  async getUserApiKeys(@User('_id') userId: string): Promise<any[]> {
    return this.userApiKeyService.getUserApiKeys(userId);
  }

  @Delete(':provider')
  @ApiOperation({ summary: '删除用户API密钥' })
  @ApiResponse({ status: 200, description: 'API密钥删除成功' })
  async deleteApiKey(
    @Param('provider') provider: string,
    @User('_id') userId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.userApiKeyService.deleteApiKey(userId, provider);
    return { success };
  }
}
