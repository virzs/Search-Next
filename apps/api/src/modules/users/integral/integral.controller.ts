import { Controller, Get, Query } from '@nestjs/common';
import { IntegralService } from './integral.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/public/dto/page';
import { User } from 'src/public/decorator/route-user.decoratpr';

@ApiTags('用户/积分')
@Controller('users/integral')
export class IntegralController {
  constructor(private readonly integralService: IntegralService) {}

  @Get('/')
  @ApiOperation({ summary: '列表' })
  @ApiParam({ name: 'page', description: '页码', example: 1 })
  @ApiParam({ name: 'pageSize', description: '每页数量', example: 10 })
  async list(@Query() query: PageDto, @User('_id') user: string) {
    return this.integralService.page(query, user);
  }
}
