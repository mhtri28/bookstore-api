import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '././services/token.service';
import { HashingService } from './services/hashing.service';

const sharedServices = [PrismaService, HashingService, TokenService];

@Global()
@Module({
  providers: [...sharedServices],
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
