import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from 'src/public/decorator/public_route.decorator';
import { SkipLegalConfirmation } from 'src/public/decorator/skip-legal-confirmation.decorator';
import { SkipPermission } from 'src/public/decorator/skip_permission.decorator';
import { User } from 'src/public/decorator/route-user.decoratpr';
import {
  LegalConfirmationsDto,
  LegalDocumentHistoryQueryDto,
  PublishLegalDocumentDto,
  SaveLegalDocumentDraftDto,
} from './legal-document.dto';
import { LegalDocumentService } from './legal-document.service';

@ApiTags('系统/协议与隐私')
@Controller('system/legal-documents')
export class LegalDocumentController {
  constructor(private readonly legalDocumentService: LegalDocumentService) {}

  @Get('public/versions')
  @PublicRoute()
  @ApiOperation({ summary: '当前公开法律文档版本' })
  publicVersions() {
    return this.legalDocumentService.publicVersions();
  }

  @Get('public/:type')
  @PublicRoute()
  @ApiOperation({ summary: '当前公开法律文档内容' })
  publicCurrent(@Param('type') type: string, @Query('locale') locale?: string) {
    return this.legalDocumentService.publicCurrent(type, locale);
  }

  @Get('confirmation-status')
  @SkipPermission()
  @SkipLegalConfirmation()
  @ApiOperation({ summary: '当前用户法律文档确认状态' })
  confirmationStatus(@User('_id') userId: string) {
    return this.legalDocumentService.confirmationStatus(userId);
  }

  @Post('confirmations')
  @SkipPermission()
  @SkipLegalConfirmation()
  @ApiOperation({ summary: '确认当前法律文档' })
  confirmations(
    @Body() body: LegalConfirmationsDto,
    @User('_id') userId: string,
  ) {
    return this.legalDocumentService.confirmForUser(
      userId,
      body.legalConfirmations,
      body.legalConfirmationLocale,
      'in_app',
    );
  }

  @Get(':type/draft')
  @ApiOperation({ summary: '法律文档草稿' })
  draft(@Param('type') type: string) {
    return this.legalDocumentService.getDraft(type);
  }

  @Put(':type/draft')
  @ApiOperation({ summary: '保存法律文档草稿' })
  saveDraft(
    @Param('type') type: string,
    @Body() body: SaveLegalDocumentDraftDto,
    @User('_id') userId: string,
  ) {
    return this.legalDocumentService.saveDraft(type, body, userId);
  }

  @Post(':type/publish')
  @ApiOperation({ summary: '发布法律文档版本' })
  publish(
    @Param('type') type: string,
    @Body() body: PublishLegalDocumentDto,
    @User('_id') userId: string,
  ) {
    return this.legalDocumentService.publish(type, body, userId);
  }

  @Get(':type/history')
  @ApiOperation({ summary: '法律文档发布历史' })
  history(
    @Param('type') type: string,
    @Query() query: LegalDocumentHistoryQueryDto,
  ) {
    return this.legalDocumentService.history(type, query);
  }

  @Get(':type/history/:revisionId')
  @ApiOperation({ summary: '法律文档历史版本详情' })
  revision(
    @Param('type') type: string,
    @Param('revisionId') revisionId: string,
  ) {
    return this.legalDocumentService.revision(type, revisionId);
  }
}
