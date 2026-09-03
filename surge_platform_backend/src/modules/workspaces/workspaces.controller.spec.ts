import { Test, TestingModule } from "@nestjs/testing";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { RssSourcesService } from "./rss-sources.service";
import { RssSchedulerService } from "./rss-scheduler.service";
import { AutopilotSchedulerService } from "../autopilot/autopilot-scheduler.service";

describe("WorkspacesController", () => {
  let controller: WorkspacesController;
  const workspacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateQueueConfig: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  };
  const rssSourcesService = {
    validate: jest.fn(),
  };
  const rssSchedulerService = {
    onWorkspaceConfigChange: jest.fn(),
  };
  const autopilotSchedulerService = {
    syncWorkspaceSchedules: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        { provide: WorkspacesService, useValue: workspacesService },
        { provide: RssSourcesService, useValue: rssSourcesService },
        { provide: RssSchedulerService, useValue: rssSchedulerService },
        {
          provide: AutopilotSchedulerService,
          useValue: autopilotSchedulerService,
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("delegates workspace creation", async () => {
    workspacesService.create.mockResolvedValue({ id: "workspace-1" });

    const result = await controller.create(
      { name: "Ops", companyId: "company-1" },
      { userId: "user-1", role: "customer" },
    );

    expect(workspacesService.create).toHaveBeenCalledWith(
      { name: "Ops", companyId: "company-1" },
      { userId: "user-1", role: "customer" },
    );
    expect(result.id).toBe("workspace-1");
  });

  it("delegates getting editorial preferences", async () => {
    workspacesService.getPreferences.mockResolvedValue({
      tone: "Professional & Objective",
      audience: "CTOs",
      audiencesList: ["CTOs"],
      excluded: "",
      excludedList: [],
    });

    const result = await controller.getPreferences("workspace-1", {
      userId: "user-1",
      role: "customer",
    });

    expect(workspacesService.getPreferences).toHaveBeenCalledWith(
      "workspace-1",
      { userId: "user-1", role: "customer" },
    );
    expect(result.tone).toBe("Professional & Objective");
  });

  it("delegates updating editorial preferences and triggers scheduler notify", async () => {
    workspacesService.updatePreferences.mockResolvedValue({
      tone: "Conversational & Engaging",
      audience: "Developers, Founders",
      audiencesList: ["Developers", "Founders"],
      excluded: "Crypto",
      excludedList: ["Crypto"],
    });

    const result = await controller.updatePreferences(
      "workspace-1",
      {
        tone: "Conversational & Engaging",
        audience: "Developers, Founders",
        excluded: "Crypto",
      },
      { userId: "user-1", role: "customer" },
    );

    expect(workspacesService.updatePreferences).toHaveBeenCalledWith(
      "workspace-1",
      {
        tone: "Conversational & Engaging",
        audience: "Developers, Founders",
        excluded: "Crypto",
      },
      { userId: "user-1", role: "customer" },
    );
    expect(rssSchedulerService.onWorkspaceConfigChange).toHaveBeenCalledWith(
      "workspace-1",
    );
    expect(result.tone).toBe("Conversational & Engaging");
  });

  it("delegates validating RSS feed URL", async () => {
    rssSourcesService.validate.mockResolvedValue({
      isValid: true,
      title: "Tech News",
      itemCount: 10,
    });

    const result = await controller.validateRssSource({
      url: "https://example.com/feed.xml",
    });

    expect(rssSourcesService.validate).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
    );
    expect(result.title).toBe("Tech News");
  });
});
