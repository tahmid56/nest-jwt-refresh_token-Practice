import { Module, Global } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [AppService],
  exports: [PrismaService]
})
export class AppModule {}
