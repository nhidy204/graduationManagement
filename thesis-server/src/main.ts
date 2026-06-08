import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Prefix ──
  app.setGlobalPrefix('api');

  // ── CORS ──
  app.enableCors({
    origin: config.get<string>('clientUrl'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Cookie ──
  app.use(cookieParser());

  // ── Global pipes ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filters ──
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global interceptors ──
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  // ── Swagger ──
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Thesis Management System API')
    .setDescription(
      'API cho hệ thống quản lý khóa luận tốt nghiệp.\n\n' +
        '**Roles:** STUDENT | LECTURER | ADMIN\n\n' +
        'Dùng endpoint `/api/auth/login` để lấy access token, ' +
        'sau đó click **Authorize** và nhập `Bearer <token>`.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Auth', 'Xác thực & phân quyền')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Topics', 'Quản lý đề tài')
    .addTag('Registrations', 'Đăng ký đề tài')
    .addTag('Progress', 'Theo dõi tiến độ')
    .addTag('Grading', 'Chấm điểm & phản biện')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  // ── Start ──
  const port = config.get<number>('port') ?? 3001;
  await app.listen(port);
  console.log(`\n🚀 Server running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs  http://localhost:${port}/api/docs\n`);
}

void bootstrap();
