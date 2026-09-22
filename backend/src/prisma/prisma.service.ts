import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const dbUrl = config.get<string>('DATABASE_URL');
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    try {
      const url = new URL(dbUrl);
      const adapter = new PrismaMariaDb({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        connectionLimit: 10,
        allowPublicKeyRetrieval:
          url.searchParams.get('allowPublicKeyRetrieval') === 'true',
        ssl: url.searchParams.get('useSSL') === 'false' ? false : undefined,
      });

      // Prisma 7 requires the adapter to be passed in the constructor
      super({ adapter });
    } catch (error) {
      Logger.error(
        'Failed to initialize Prisma adapter',
        (error as Error)?.stack,
      );
      throw error;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
