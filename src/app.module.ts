import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from 'src/modules/users/users.module';
import { AddressesModule } from 'src/modules/addresses/addresses.module';
import { SuppliesModule } from 'src/modules/supplies/supplies.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BooksModule } from './modules/books/books.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AuthModule,
    AuthorsModule,
    BooksModule,
    CategoriesModule,
    UsersModule,
    AddressesModule,
    SuppliesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
