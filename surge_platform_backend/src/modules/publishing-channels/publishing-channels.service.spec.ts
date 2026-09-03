import { Test, TestingModule } from "@nestjs/testing";
import { PublishingChannelsService } from "./publishing-channels.service";
import { PrismaService } from "../../common/context/prisma.service";
import { EncryptionService } from "../../common/security/encryption.service";
import * as validatorUtil from "./helpers/wordpress-validator.util";

describe("PublishingChannelsService", () => {
  let service: PublishingChannelsService;
  const prisma = {
    workspace: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findFirst: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
    },
    publishingChannel: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const encryptionService = {
    encrypt: jest.fn((val: unknown) => JSON.stringify(val)),
    decrypt: jest.fn(
      (val: string): Record<string, unknown> =>
        JSON.parse(val) as Record<string, unknown>,
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingChannelsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: encryptionService },
      ],
    }).compile();

    service = module.get<PublishingChannelsService>(PublishingChannelsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("validateWordpress delegates to validateWordpressConnection", async () => {
    jest
      .spyOn(validatorUtil, "validateWordpressConnection")
      .mockResolvedValueOnce({
        isValid: true,
        siteUrl: "https://myblog.com",
        siteName: "My Blog",
        user: { id: 1, name: "Admin", slug: "admin" },
        canPublish: true,
      });

    const res = await service.validateWordpress({
      siteUrl: "https://myblog.com",
      username: "admin",
      applicationPassword: "pwd",
    });

    expect(res.isValid).toBe(true);
    expect(res.siteName).toBe("My Blog");
  });

  it("connectWordpress creates or updates a WordPress publishing channel", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1",
      company: { ownerId: "user-1" },
    });
    prisma.subscription.findUnique.mockResolvedValue({ tier: "starter" });
    prisma.publishingChannel.findFirst.mockResolvedValue(null);
    prisma.publishingChannel.count.mockResolvedValue(0);

    jest
      .spyOn(validatorUtil, "validateWordpressConnection")
      .mockResolvedValueOnce({
        isValid: true,
        siteUrl: "https://myblog.com",
        siteName: "My Blog",
        user: { id: 1, name: "Admin", slug: "admin" },
        canPublish: true,
      });

    prisma.publishingChannel.create.mockResolvedValue({
      id: "channel-1",
      workspaceId: "ws-1",
      platform: "wordpress",
      encryptedCredentials: JSON.stringify({
        siteUrl: "https://myblog.com",
        username: "admin",
        siteName: "My Blog",
      }),
      isActive: true,
      createdAt: new Date(),
    });

    const res = await service.connectWordpress(
      {
        workspaceId: "ws-1",
        siteUrl: "https://myblog.com",
        username: "admin",
        applicationPassword: "pwd",
      },
      { userId: "user-1", role: "customer" },
    );

    expect(prisma.publishingChannel.create).toHaveBeenCalled();
    expect(res.siteName).toBe("My Blog");
    expect(res.platform).toBe("wordpress");
    expect(res.canPublish).toBe(true);
  });
});
