import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('API_KEY:', process.env.API_KEY);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (ValidationErrors) => {
        return new UnprocessableEntityException(
          ValidationErrors.map((error) => ({
            field: error.property,
            errors: error.constraints ? Object.values(error.constraints).join(', ') : 'Invalid value',
          })),
        );
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Bookstore API')
    .setDescription('Tài liệu API cho hệ thống quản lý bán sách')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Lỗi khởi động server:', err);
});
