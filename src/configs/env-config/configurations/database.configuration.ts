import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class DatabaseConfiguration {
  constructor(private readonly configService: ConfigService) {}
  get host(): string {
    return this.configService.getOrThrow<string>('DB_HOST') ?? 'localhost';
  }
  get port(): number {
    return this.configService.getOrThrow<number>('DB_PORT') ?? 5432;
  }
  get name(): string {
    return this.configService.getOrThrow<string>('DB_NAME');
  }
  get username(): string {
    return this.configService.getOrThrow<string>('DB_USERNAME');
  }
  get password(): string {
    return this.configService.getOrThrow<string>('DB_PASSWORD');
  }
  get sync(): boolean {
    return this.configService.getOrThrow<boolean>('DB_SYNC');
  }
  get ssl(): boolean {
    return this.configService.getOrThrow<boolean>('DB_SSL');
  }
}
