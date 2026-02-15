import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field không được khai báo decorator trong DTO
      forbidNonWhitelisted: true, // Ném lỗi nếu có field không được khai báo decorator trong DTO mà client truyền lên sẽ báo lỗi
      transform: true, // Tự động chuyển đổi kiểu dữ liệu phù hợp với DTO
      transformOptions: {
        enableImplicitConversion: true, // Cho phép chuyển đổi kiểu dữ liệu một cách ngầm định
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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
