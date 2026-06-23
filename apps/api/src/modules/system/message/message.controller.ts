import {
  Controller,
  Sse,
  MessageEvent,
  Param,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageData } from './message.schema';
import { MessageQueryDto } from './dto/message-query.dto';
import { SkipPermission } from 'src/public/decorator/skip_permission.decorator';

@ApiTags('消息')
@Controller('message')
@ApiBearerAuth()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Sse('subscribe/:userId')
  @SkipPermission()
  @ApiOperation({ summary: '订阅消息' })
  subscribe(@Param('userId') userId: string): Observable<MessageEvent> {
    return this.messageService.subscribe(userId).pipe(
      map((message) => ({
        data: message,
      })),
    );
  }

  @Post('send/:userId')
  @ApiOperation({ summary: '发送消息给指定用户' })
  sendToUser(@Param('userId') userId: string, @Body() message: MessageData) {
    this.messageService.sendMessageToUser(userId, message);
    return { success: true };
  }

  @Post('broadcast')
  @ApiOperation({ summary: '广播消息' })
  broadcast(@Body() message: MessageData) {
    this.messageService.broadcast(message);
    return { success: true };
  }

  @Get('latest/:userId')
  @SkipPermission()
  @ApiOperation({ summary: '获取用户最新50条消息' })
  async getLatestMessages(
    @Param('userId') userId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messageService.getLatestMessages(userId, query);
  }

  @Get('list/:userId')
  @SkipPermission()
  @ApiOperation({ summary: '分页获取用户消息列表' })
  async getUserMessages(
    @Param('userId') userId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messageService.getUserMessages(userId, query);
  }

  @Post('read/:messageId')
  @SkipPermission()
  @ApiOperation({ summary: '标记消息已读' })
  async markAsRead(@Param('messageId') messageId: string) {
    await this.messageService.markAsRead(messageId);
    return { success: true };
  }

  @Get('unread/:userId')
  @SkipPermission()
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(
    @Param('userId') userId: string,
    @Query() query: MessageQueryDto,
  ) {
    const count = await this.messageService.getUnreadCount(userId, query);
    return { count };
  }
}
