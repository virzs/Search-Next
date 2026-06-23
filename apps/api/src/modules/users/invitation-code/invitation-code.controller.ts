import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { InvitationCodeService } from './invitation-code.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { InvitationCodeDto } from './dto/invitation-code.dto';

@ApiTags('用户/邀请码')
@Controller('users/invitation-code')
export class InvitationCodeController {
  constructor(private readonly invitationCodeService: InvitationCodeService) {}

  @Get('/')
  @ApiOperation({ summary: '列表' })
  getCode(@User('_id') user: string) {
    return this.invitationCodeService.codeList(user);
  }

  @Get('/invited-users')
  @ApiOperation({ summary: '邀请用户列表' })
  getInvitedUsers(@User('_id') user: string) {
    return this.invitationCodeService.invitedUsers(user);
  }

  @Post('/')
  @ApiOperation({ summary: '生成邀请码' })
  createCode(@User('_id') user: string, @Body() body: InvitationCodeDto) {
    return this.invitationCodeService.create(user, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除邀请码' })
  deleteCode(@Param('id') id: string, @User('_id') user: string) {
    return this.invitationCodeService.delete(id, user);
  }

  @Put('/forbidden/:id')
  @ApiOperation({ summary: '禁用' })
  changeStatus(@Param('id') id: string) {
    return this.invitationCodeService.changeStatus(id);
  }
}
