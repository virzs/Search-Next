import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../public/decorator/route-user.decoratpr';
import { SkipPermission } from '../../../public/decorator/skip_permission.decorator';
import {
  RenameUserDataSyncDto,
  UserDataSyncAdminQueryDto,
  UserDataSyncAdminVersionsQueryDto,
  UserDataSyncDto,
} from './dto/user-data.dto';
import { UserDataService } from './user-data.service';

@ApiTags('新标签页/用户数据同步')
@Controller('tabs/user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Get('/sync')
  @SkipPermission()
  @ApiOperation({ summary: '当前用户云同步数据' })
  getSync(@User('_id') userId: string, @User('roles') roles: any[]) {
    return this.userDataService.getSync(userId, roles);
  }

  @Put('/sync')
  @SkipPermission()
  @ApiOperation({ summary: '保存用户云同步数据' })
  saveSync(
    @User('_id') userId: string,
    @User('roles') roles: any[],
    @Body() body: UserDataSyncDto,
  ) {
    return this.userDataService.saveSync(userId, body.payload, {
      backupId: body.backupId,
      name: body.name,
      userRoles: roles,
    });
  }

  @Put('/sync/:id/name')
  @SkipPermission()
  @ApiOperation({ summary: '修改云备份名称' })
  renameSyncBackup(
    @Param('id') id: string,
    @User('_id') userId: string,
    @User('roles') roles: any[],
    @Body() body: RenameUserDataSyncDto,
  ) {
    return this.userDataService.renameSyncBackup(
      userId,
      id,
      body.name,
      roles,
    );
  }

  @Get('/sync/admin')
  @ApiOperation({ summary: '用户同步元信息' })
  getAdminSyncList(@Query() query: UserDataSyncAdminQueryDto) {
    return this.userDataService.getAdminSyncList(query);
  }

  @Get('/sync/admin/:userId/versions')
  @ApiOperation({ summary: '云备份版本元信息' })
  getAdminUserVersions(@Param() params: UserDataSyncAdminVersionsQueryDto) {
    return this.userDataService.getAdminUserVersions(params.userId);
  }

  @Delete('/sync/admin/versions/:id')
  @ApiOperation({ summary: '删除云备份版本' })
  deleteAdminVersion(@Param('id') id: string) {
    return this.userDataService.deleteAdminVersion(id);
  }
}
