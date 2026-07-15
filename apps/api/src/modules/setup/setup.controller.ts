import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicRoute } from "src/public/decorator/public_route.decorator";
import {
  SetupAdminCompleteDto,
  SetupCheckDto,
  SetupCompleteDto,
  SetupEnvironmentCompleteDto,
  SetupMongoDto,
  SetupRedisDto,
} from "./dto/setup.dto";
import { SetupService } from "./setup.service";

@ApiTags("首次部署引导")
@Controller("setup")
@PublicRoute()
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get("status")
  @ApiOperation({ summary: "初始化状态" })
  status() {
    return this.setupService.getStatus();
  }

  @Post("check")
  @ApiOperation({ summary: "测试 MongoDB 和 Redis 连接" })
  @ApiBody({ type: SetupCheckDto })
  check(@Body() body: SetupCheckDto) {
    return this.setupService.check(body);
  }

  @Post("check/mongo")
  @ApiOperation({ summary: "测试 MongoDB 连接" })
  @ApiBody({ type: SetupMongoDto })
  checkMongo(@Body() body: SetupMongoDto) {
    return this.setupService.checkMongoConnection(body);
  }

  @Post("check/redis")
  @ApiOperation({ summary: "测试 Redis 连接" })
  @ApiBody({ type: SetupRedisDto })
  checkRedis(@Body() body: SetupRedisDto) {
    return this.setupService.checkRedisConnection(body);
  }

  @Post("complete")
  @ApiOperation({ summary: "完成首次部署初始化" })
  @ApiBody({ type: SetupCompleteDto })
  complete(@Body() body: SetupCompleteDto) {
    return this.setupService.complete(body);
  }

  @Post("environment/complete")
  @ApiOperation({ summary: "保存运行环境配置并重启服务" })
  @ApiBody({ type: SetupEnvironmentCompleteDto })
  completeEnvironment(@Body() body: SetupEnvironmentCompleteDto) {
    return this.setupService.completeEnvironment(body);
  }

  @Post("admin/complete")
  @ApiOperation({ summary: "创建初始管理员并完成初始化" })
  @ApiBody({ type: SetupAdminCompleteDto })
  completeAdmin(@Body() body: SetupAdminCompleteDto) {
    return this.setupService.completeAdmin(body);
  }
}
