import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TreeDto } from './dto/tree.dto';

@ApiTags('权限')
@Controller('system/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('tree')
  @ApiOperation({ summary: '权限' })
  tree(@Query() query: TreeDto) {
    return this.permissionService.treeInfo(query);
  }

  @Post('/')
  @ApiOperation({ summary: '创建权限' })
  @ApiBody({ type: CreatePermissionDto })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新权限' })
  @ApiBody({ type: UpdatePermissionDto })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: string) {
    return this.permissionService.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '权限详情' })
  findOne(@Param('id') id: string) {
    return this.permissionService.detail(id);
  }
}
