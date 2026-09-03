import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/context/prisma.service";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { mergeQueueConfig, QueueConfig } from "./helpers/workspace-config.util";
import {
  assertCompanyOwnerOrAdmin,
  assertWorkspaceAccess,
  AuthenticatedUser,
} from "./helpers/workspace-auth.util";

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    user: AuthenticatedUser,
  ) {
    if (!createWorkspaceDto.name?.trim()) {
      throw new BadRequestException("Workspace name is required");
    }

    await assertCompanyOwnerOrAdmin(
      this.prisma,
      createWorkspaceDto.companyId,
      user,
    );

    const workspace = await this.prisma.workspace.create({
      data: {
        companyId: createWorkspaceDto.companyId,
        name: createWorkspaceDto.name.trim(),
        timezone: createWorkspaceDto.timezone ?? "UTC",
        queueConfig: {
          fetchFrequencyHours: 24,
          postingTimes: ["09:00"],
          autoPost: false,
        },
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.userId,
        role: user.role === "admin" ? "admin" : "owner",
      },
    });

    return workspace;
  }

  async findAll(user: AuthenticatedUser) {
    if (user.role === "admin") {
      return this.prisma.workspace.findMany({
        orderBy: { createdAt: "desc" },
        include: { company: true },
      });
    }

    return this.prisma.workspace.findMany({
      where: {
        OR: [
          { company: { ownerId: user.userId } },
          { members: { some: { userId: user.userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { company: true },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    return assertWorkspaceAccess(this.prisma, id, user, "view");
  }

  async update(
    id: string,
    updateWorkspaceDto: Partial<CreateWorkspaceDto>,
    user: AuthenticatedUser,
  ) {
    await assertWorkspaceAccess(this.prisma, id, user, "update");

    const data: Record<string, unknown> = {};
    if (updateWorkspaceDto.name) {
      data.name = updateWorkspaceDto.name.trim();
    }
    if (updateWorkspaceDto.timezone) {
      data.timezone = updateWorkspaceDto.timezone;
    }

    return this.prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    await assertWorkspaceAccess(this.prisma, id, user, "delete");
    return this.prisma.workspace.delete({ where: { id } });
  }

  async updateQueueConfig(
    workspaceId: string,
    config: QueueConfig,
    user?: AuthenticatedUser,
  ) {
    if (user) {
      await assertWorkspaceAccess(this.prisma, workspaceId, user, "update");
    }
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!ws) throw new NotFoundException("Workspace not found");

    const mergedConfig = mergeQueueConfig(
      ws.queueConfig as QueueConfig | null,
      config,
    );

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        queueConfig: mergedConfig as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async updatePreferences(
    workspaceId: string,
    dto: UpdatePreferencesDto,
    user: AuthenticatedUser,
  ) {
    await assertWorkspaceAccess(this.prisma, workspaceId, user, "update");

    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!ws) throw new NotFoundException("Workspace not found");

    // Parse, sanitize, and validate comma-separated audience
    const rawAudience = dto.audience || "";
    const seenAudience = new Set<string>();
    const sanitizedAudiences: string[] = [];

    for (const raw of rawAudience.split(",")) {
      const trimmed = raw.trim();
      const lower = trimmed.toLowerCase();
      if (
        trimmed.length >= 2 &&
        trimmed.length <= 50 &&
        !seenAudience.has(lower)
      ) {
        seenAudience.add(lower);
        sanitizedAudiences.push(trimmed);
      }
    }

    if (sanitizedAudiences.length === 0) {
      throw new BadRequestException(
        "Please provide at least one valid target audience tag (each between 2 and 50 characters, e.g. 'CTOs, Developers').",
      );
    }

    // Parse optional excluded topics / editorial rules
    const rawExcluded = dto.excluded || "";
    const seenExcluded = new Set<string>();
    const sanitizedExcluded: string[] = [];

    if (rawExcluded.trim()) {
      for (const raw of rawExcluded.split(",")) {
        const trimmed = raw.trim();
        const lower = trimmed.toLowerCase();
        if (
          trimmed.length >= 2 &&
          trimmed.length <= 50 &&
          !seenExcluded.has(lower)
        ) {
          seenExcluded.add(lower);
          sanitizedExcluded.push(trimmed);
        }
      }
    }

    const existingConfig = (ws.queueConfig as QueueConfig | null) ?? {};
    const updatedConfig: QueueConfig = {
      ...existingConfig,
      brandVoice: dto.tone.trim(),
      targetAudience: sanitizedAudiences.join(", "),
      editorialRules: sanitizedExcluded,
    };

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        queueConfig: updatedConfig as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      tone: updatedConfig.brandVoice,
      audience: updatedConfig.targetAudience,
      audiencesList: sanitizedAudiences,
      excluded: sanitizedExcluded.join(", "),
      excludedList: sanitizedExcluded,
    };
  }

  async getPreferences(workspaceId: string, user: AuthenticatedUser) {
    await assertWorkspaceAccess(this.prisma, workspaceId, user, "view");

    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!ws) throw new NotFoundException("Workspace not found");

    const config = (ws.queueConfig as QueueConfig | null) ?? {};
    const audienceStr = config.targetAudience || "";
    const rules = config.editorialRules || [];

    return {
      tone: config.brandVoice || "Professional & Objective",
      audience: audienceStr,
      audiencesList: audienceStr
        ? audienceStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      excluded: rules.join(", "),
      excludedList: rules,
    };
  }
}
