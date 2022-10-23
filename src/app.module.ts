import { Module, Global } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  imports:[AuthModule, PrismaModule],
  providers: [AppService],
})
export class AppModule {}
