import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_KEY'),
      },
    });
  }
  async upload(fileName: string, file: Buffer): Promise<string> {
    const bucket = this.configService.getOrThrow('S3_BUCKET');
    const region = this.configService.getOrThrow('AWS_S3_REGION');
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('S3_BUCKET'),
        Key: fileName,
        Body: file,
      }),
    );
    console.log(this.configService.getOrThrow('S3_BUCKET'));
    const safeFileName = encodeURIComponent(fileName);
    return `https://${bucket}.s3.${region}.amazonaws.com/${safeFileName}`;
  }
}
