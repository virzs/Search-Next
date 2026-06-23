import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as os from 'os';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './public/filter/all';
import { HttpExceptionFilter } from './public/filter/http';
import { TransformInterceptor } from './public/interceptor/transform';
import { logger } from './public/middleware/log';
import DefaultDTOValidationPipe from './public/pipe/dtoValid';
import { Logger } from './utils/log4';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: new ConsoleLogger({
        json: true,
        colors: true,
      }),
      bodyParser: false,
    },
  );

  // 支持 application/x-www-form-urlencoded 格式
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  // 支持 application/json 格式
  app.use(express.json({ limit: '50mb' }));
  // 支持 text/plain 格式
  app.use(express.text({ type: 'text/plain', limit: '10mb' }));

  // 配置静态文件服务，支持本地存储文件访问
  const localStoragePath = process.env.local_storage_path || './assets/uploads';
  app.useStaticAssets(path.resolve(localStoragePath), {
    prefix: '/static/',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  // 接口文档
  const config = new DocumentBuilder()
    .setTitle('Search Next API')
    .setDescription('Search Next tabs and management API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  // 全局默认参数验证
  app.useGlobalPipes(new DefaultDTOValidationPipe());

  // request 日志
  app.use(logger);

  //全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 过滤处理 HTTP 异常
  app.useGlobalFilters(new HttpExceptionFilter());

  //过滤其他类型异常
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: [
      'http://localhost:8132',
      'http://127.0.0.1:8132',
      'http://localhost:8133',
      'http://127.0.0.1:8133',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, authorization',
  });

  const ifaces = os.networkInterfaces();
  let ip = '';
  for (const dev in ifaces) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4' && (dev === 'en0' || dev === 'WLAN')) {
        ip = details.address;
      }
    });
  }

  const port = process.env.PORT || 5151;

  await app.listen(port);

  Logger.info(`
  服务启动成功

  Local:   http://localhost:${port}
  Network: http://${ip}:${port}

  API 文档

  Local:   http://localhost:${port}/doc
  Network: http://${ip}:${port}/doc
  `);
}
bootstrap();
