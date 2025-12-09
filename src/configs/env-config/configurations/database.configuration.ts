import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class DatabaseConfiguration {
  constructor(private readonly configService: ConfigService) {}
  get sync(): boolean {
    return this.configService.getOrThrow<boolean>('DB_SYNC');
  }
  get ssl(): boolean {
    return this.configService.getOrThrow<boolean>('DB_SSL');
  }
  get url(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }
}
