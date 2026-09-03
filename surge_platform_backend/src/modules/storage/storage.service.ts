import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const rawEndpoint =
      this.configService.get<string>("RUSTFS_ENDPOINT") ??
      this.configService.get<string>("S3_ENDPOINT") ??
      `http://${this.configService.get<string>("MINIO_ENDPOINT") ?? "127.0.0.1"}:${this.configService.get<string>("RUSTFS_PORT") ?? this.configService.get<string>("MINIO_PORT") ?? "9010"}`;

    const endpoint = rawEndpoint.startsWith("http")
      ? rawEndpoint
      : `http://${rawEndpoint}`;

    const accessKeyId =
      this.configService.get<string>("RUSTFS_ACCESS_KEY") ??
      this.configService.get<string>("S3_ACCESS_KEY") ??
      this.configService.get<string>("MINIO_ACCESS_KEY") ??
      "rustfsadmin";

    const secretAccessKey =
      this.configService.get<string>("RUSTFS_SECRET_KEY") ??
      this.configService.get<string>("S3_SECRET_KEY") ??
      this.configService.get<string>("MINIO_SECRET_KEY") ??
      "rustfsadmin";

    const region =
      this.configService.get<string>("S3_REGION") ?? "us-east-1";

    this.bucketName =
      this.configService.get<string>("RUSTFS_BUCKET") ??
      this.configService.get<string>("S3_BUCKET") ??
      this.configService.get<string>("MINIO_BUCKET") ??
      "surge-assets";

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async generatePresignedUploadUrl(dto: {
    contentType: string;
    folder: string;
    fileName: string;
  }) {
    const objectName = `${dto.folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${randomUUID()}-${dto.fileName}`;

    await this.ensureBucketExists();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 24 * 60 * 60,
    });

    return {
      uploadUrl,
      objectName,
      bucketName: this.bucketName,
      expiresInSeconds: 24 * 60 * 60,
    };
  }

  async getPresignedDownloadUrl(objectName: string) {
    await this.ensureBucketExists();

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 24 * 60 * 60,
    });
  }

  async uploadBuffer(objectName: string, buffer: Buffer, contentType: string) {
    await this.ensureBucketExists();

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return this.getPresignedDownloadUrl(objectName);
  }

  async ensureBucketExists() {
    try {
      await this.s3.send(
        new HeadBucketCommand({
          Bucket: this.bucketName,
        }),
      );
    } catch {
      try {
        await this.s3.send(
          new CreateBucketCommand({
            Bucket: this.bucketName,
          }),
        );
      } catch {
        // Bucket may already exist or error
      }
    }
  }

  async verifyConnection() {
    try {
      await this.ensureBucketExists();
      return { ok: true, bucketName: this.bucketName };
    } catch (error) {
      throw new InternalServerErrorException("RustFS / S3 storage is not reachable");
    }
  }
}
