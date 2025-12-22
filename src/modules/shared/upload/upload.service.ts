import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

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

    console.log('--- Upload Debug Info ---');
    console.log('Bucket:', bucket);
    console.log('Region:', region);
    console.log('Original filename:', fileName);
    console.log('File buffer size (bytes):', file.length);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: fileName,
          Body: file,
        }),
      );
      console.log('S3 upload successful');
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }

    const safeFileName = encodeURIComponent(fileName);
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${safeFileName}`;

    console.log('Final file URL:', fileUrl);

    // Optional: sanity check
    try {
      const urlObject = new URL(fileUrl);
      console.log('URL is valid:', urlObject.href);
    } catch (err) {
      console.error('Generated URL is invalid:', fileUrl, err);
      throw new InternalServerErrorException('Generated file URL is invalid');
    }

    return fileUrl;
  }
}
