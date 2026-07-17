import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PageDto } from 'src/public/dto/page';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SkipPermission } from 'src/public/decorator/skip_permission.decorator';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { SkipLegalConfirmation } from 'src/public/decorator/skip-legal-confirmation.decorator';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @ApiOperation({ summary: '用户分页' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  getNormalUser(@Query() query: PageDto) {
    return this.usersService.getNormalUser(query);
  }

  @Get('/statistics')
  @ApiOperation({ summary: '用户统计' })
  statistics() {
    return this.usersService.statistics();
  }

  @Get('/search')
  @ApiOperation({ summary: '搜索用户' })
  @ApiParam({ name: 'keyWords', description: '搜索关键词', example: 'test' })
  searchUsers(@Query('keyWords') keyWords: string) {
    return this.usersService.searchUsers(keyWords);
  }

  @Get('/me')
  @SkipPermission()
  @ApiOperation({ summary: '当前用户信息' })
  currentUser(@User() user): Promise<any> {
    return this.usersService.currentUser(user);
  }

  @Put('/me/profile')
  @SkipPermission()
  @ApiOperation({ summary: '更新当前用户资料' })
  updateProfile(
    @User('_id') userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Put('/me/password')
  @SkipPermission()
  @SkipLegalConfirmation()
  @ApiOperation({ summary: '修改当前用户密码' })
  changePassword(
    @User('_id') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, body);
  }

  @Delete('/me')
  @SkipPermission()
  @SkipLegalConfirmation()
  @ApiOperation({ summary: '删除当前用户账号' })
  deleteAccount(
    @User('_id') userId: string,
    @Body() body: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(userId, body);
  }

  @Post('/')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '用户详情' })
  detail(@Param('id') id: string) {
    return this.usersService.detail(id);
  }

  @Put('/enable/:id')
  @ApiOperation({ summary: '切换用户启用状态' })
  changeEnable(@Param('id') id: string) {
    return this.usersService.changeEnable(id);
  }
}
