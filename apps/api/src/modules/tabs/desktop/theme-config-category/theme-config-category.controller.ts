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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { ThemeConfigCategoryService } from './theme-config-category.service';
import {
  CreateThemeCategoryDto,
  ThemeCategoryQueryDto,
  UpdateThemeCategoryDto,
} from './theme-config-category.dto';

@ApiTags('新标签页/桌面/主题分类')
@Controller('tabs/desktop/theme-config-category')
export class ThemeConfigCategoryController {
  constructor(
    private readonly themeConfigCategoryService: ThemeConfigCategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: '主题分类分页' })
  getThemeCategories(@Query() query: PageDto & ThemeCategoryQueryDto) {
    return this.themeConfigCategoryService.getThemeCategories(query);
  }

  @Get('/user')
  @RequireLogin()
  @ApiOperation({ summary: '用户主题分类列表' })
  getUserThemeCategories() {
    return this.themeConfigCategoryService.getUserThemeCategories();
  }

  @Post()
  @ApiOperation({ summary: '创建主题分类' })
  createThemeCategory(
    @Body() body: CreateThemeCategoryDto,
    @User('_id') user: string,
  ) {
    return this.themeConfigCategoryService.createThemeCategory(body, user);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新主题分类' })
  updateThemeCategory(
    @Param('id') id: string,
    @Body() body: UpdateThemeCategoryDto,
    @User('_id') user: string,
  ) {
    return this.themeConfigCategoryService.updateThemeCategory(id, body, user);
  }

  @Put('/:id/toggle')
  @ApiOperation({ summary: '切换主题分类启用状态' })
  toggleThemeCategory(@Param('id') id: string, @User('_id') user: string) {
    return this.themeConfigCategoryService.toggleThemeCategory(id, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除主题分类' })
  deleteThemeCategory(@Param('id') id: string) {
    return this.themeConfigCategoryService.deleteThemeCategory(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: '主题分类详情' })
  getThemeCategoryDetail(@Param('id') id: string) {
    return this.themeConfigCategoryService.getThemeCategoryDetail(id);
  }
}
