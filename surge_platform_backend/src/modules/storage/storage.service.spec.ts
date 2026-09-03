import { ConfigService } from "@nestjs/config";
import { StorageService } from "./storage.service";

const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn().mockImplementation((args) => args),
    GetObjectCommand: jest.fn().mockImplementation((args) => args),
    HeadBucketCommand: jest.fn().mockImplementation((args) => args),
    CreateBucketCommand: jest.fn().mockImplementation((args) => args),
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: any[]) => mockGetSignedUrl(...args),
}));

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    const configService = {
      get: jest.fn(
        (key: string) =>
          ({
            MINIO_ENDPOINT: "127.0.0.1",
            MINIO_PORT: "9000",
            MINIO_USE_SSL: "false",
            MINIO_ACCESS_KEY: "minioadmin",
            MINIO_SECRET_KEY: "minioadmin",
            MINIO_BUCKET: "surge-assets",
          })[key],
      ),
    } as unknown as ConfigService;

    service = new StorageService(configService);
  });

  it("returns a presigned upload URL for a new object", async () => {
    mockGetSignedUrl.mockResolvedValue("https://example.com/upload");

    const result = await service.generatePresignedUploadUrl({
      contentType: "image/png",
      folder: "workspaces/ws-1/assets",
      fileName: "hero.png",
    });

    expect(result.uploadUrl).toBe("https://example.com/upload");
    expect(result.objectName).toContain("workspaces/ws-1/assets/");
    expect(result.bucketName).toBe("surge-assets");
  });
});
