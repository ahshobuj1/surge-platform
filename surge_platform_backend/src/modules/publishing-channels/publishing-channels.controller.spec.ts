import { Test, TestingModule } from "@nestjs/testing";
import { PublishingChannelsController } from "./publishing-channels.controller";
import { PublishingChannelsService } from "./publishing-channels.service";

describe("PublishingChannelsController", () => {
  let controller: PublishingChannelsController;
  const publishingChannelsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    validateWordpress: jest.fn(),
    connectWordpress: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishingChannelsController],
      providers: [
        {
          provide: PublishingChannelsService,
          useValue: publishingChannelsService,
        },
      ],
    }).compile();

    controller = module.get<PublishingChannelsController>(
      PublishingChannelsController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("delegates validateWordpress to service", async () => {
    publishingChannelsService.validateWordpress.mockResolvedValue({
      isValid: true,
      siteName: "My WP",
    });

    const res = await controller.validateWordpress({
      siteUrl: "https://mywp.com",
      username: "admin",
      applicationPassword: "pwd",
    });

    expect(publishingChannelsService.validateWordpress).toHaveBeenCalledWith({
      siteUrl: "https://mywp.com",
      username: "admin",
      applicationPassword: "pwd",
    });
    expect(res.siteName).toBe("My WP");
  });

  it("delegates connectWordpress to service", async () => {
    publishingChannelsService.connectWordpress.mockResolvedValue({
      id: "ch-1",
      platform: "wordpress",
      siteName: "My WP",
    });

    const res = await controller.connectWordpress(
      {
        workspaceId: "ws-1",
        siteUrl: "https://mywp.com",
        username: "admin",
        applicationPassword: "pwd",
      },
      { userId: "user-1", role: "customer" },
    );

    expect(publishingChannelsService.connectWordpress).toHaveBeenCalledWith(
      {
        workspaceId: "ws-1",
        siteUrl: "https://mywp.com",
        username: "admin",
        applicationPassword: "pwd",
      },
      { userId: "user-1", role: "customer" },
    );
    expect(res.platform).toBe("wordpress");
  });
});
