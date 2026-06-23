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
import { RoleService } from './role.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { CreateRoleDto } from './dto/create-role.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('角色')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/')
  @ApiOperation({ summary: '角色分页' })
  @ApiQuery({ type: PageDto })
  page(@Query() query: PageDto) {
    return this.roleService.page(query);
  }

  @Get('/list')
  @ApiOperation({ summary: '角色列表' })
  @ApiResponse({ status: 200, type: [CreateRoleDto] })
  list() {
    return this.roleService.list();
  }

  @Get('/:id')
  @ApiOperation({ summary: '角色详情' })
  detail(@Param('id') id: string) {
    return this.roleService.detail(id);
  }

  @Get('/permissions/:id')
  @ApiOperation({ summary: '角色权限id详情' })
  detailPermissions(@Param('id') id: string) {
    return this.roleService.detailPermissions(id);
  }

  @Post('/')
  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateRoleDto })
  create(@Body() createRoleDto: CreateRoleDto, @User('_id') user) {
    return this.roleService.create(createRoleDto, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新角色' })
  @ApiBody({ type: CreateRoleDto })
  update(
    @Param('id') id: string,
    @Body() body: CreateRoleDto,
    @User('_id') user,
  ) {
    return this.roleService.update(id, body, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
