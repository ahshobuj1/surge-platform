import { Test, TestingModule } from "@nestjs/testing";
import { PublishingChannelsService } from "./publishing-channels.service";

import { PrismaService } from "../../common/context/prisma.service";
import { EncryptionService } from "../../common/security/encryption.service";

describe("PublishingChannelsService", () => {
  let service: PublishingChannelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingChannelsService,
        {
          provide: PrismaService,
          useValue: {
            publishingChannel: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn((val) => JSON.stringify(val)),
            decrypt: jest.fn((val) =>
              typeof val === "string" ? JSON.parse(val) : val,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<PublishingChannelsService>(PublishingChannelsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
