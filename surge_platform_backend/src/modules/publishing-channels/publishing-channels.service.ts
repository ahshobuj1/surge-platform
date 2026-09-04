import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PublishingChannel } from "@prisma/client";
import { PrismaService } from "../../common/context/prisma.service";
import { EncryptionService } from "../../common/security/encryption.service";
import { CreatePublishingChannelDto } from "./dto/create-publishing-channel.dto";
import { UpdatePublishingChannelDto } from "./dto/update-publishing-channel.dto";
import { ValidateWordpressDto } from "./dto/validate-wordpress.dto";
import { ConnectWordpressDto } from "./dto/connect-wordpress.dto";
import {
  assertWorkspaceAccess,
  AuthenticatedUser,
} from "../workspaces/helpers/workspace-auth.util";
import { assertTierLimit } from "../companies/billing/tier-limits.config";
import { validateWordpressConnection } from "./helpers/wordpress-validator.util";

@Injectable()
export class PublishingChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async validateWordpress(dto: ValidateWordpressDto) {
    return validateWordpressConnection(
      dto.siteUrl,
      dto.username,
      dto.applicationPassword,
    );
  }

  async connectWordpress(dto: ConnectWordpressDto, user: AuthenticatedUser) {
    await assertWorkspaceAccess(this.prisma, dto.workspaceId, user, "update");

    // 1. Assert tier limit for new channels
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
      select: { company: { select: { ownerId: true } } },
    });

    if (workspace?.company?.ownerId) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: workspace.company.ownerId },
      });

      const existingWp = await this.prisma.publishingChannel.findFirst({
        where: {
          workspaceId: dto.workspaceId,
          platform: "wordpress",
          isActive: true,
        },
      });

      if (!existingWp) {
        const activeChannels = await this.prisma.publishingChannel.count({
          where: { workspaceId: dto.workspaceId, isActive: true },
        });

        assertTierLimit("channel", activeChannels, subscription?.tier);
      }
    }

    // 2. Validate live credentials via WordPress REST API
    const validated = await validateWordpressConnection(
      dto.siteUrl,
      dto.username,
      dto.applicationPassword,
    );

    const credentialsPayload = {
      platform: "wordpress",
      siteUrl: validated.siteUrl,
      apiUrl: validated.siteUrl,
      username: dto.username.trim(),
      password: dto.applicationPassword.trim(),
      siteName: validated.siteName,
      siteDescription: validated.siteDescription,
      wpUser: validated.user,
      canPublish: validated.canPublish,
    };

    const encryptedCredentials =
      this.encryptionService.encrypt(credentialsPayload);

    // 3. Upsert or update existing WordPress channel for this workspace
    const existingChannel = await this.prisma.publishingChannel.findFirst({
      where: { workspaceId: dto.workspaceId, platform: "wordpress" },
    });

    let channel: PublishingChannel;
    if (existingChannel) {
      channel = await this.prisma.publishingChannel.update({
        where: { id: existingChannel.id },
        data: {
          encryptedCredentials,
          isActive: true,
        },
      });
    } else {
      channel = await this.prisma.publishingChannel.create({
        data: {
          workspaceId: dto.workspaceId,
          platform: "wordpress",
          encryptedCredentials,
          isActive: true,
        },
      });
    }

    return {
      ...this.sanitizeChannel(channel),
      siteName: validated.siteName,
      wpUser: validated.user,
      canPublish: validated.canPublish,
    };
  }

  async create(dto: CreatePublishingChannelDto, user: AuthenticatedUser) {
    if (dto.workspaceId) {
      await assertWorkspaceAccess(this.prisma, dto.workspaceId, user, "update");

      const workspace = await this.prisma.workspace.findUnique({
        where: { id: dto.workspaceId },
        select: { company: { select: { ownerId: true } } },
      });

      if (workspace?.company?.ownerId) {
        const subscription = await this.prisma.subscription.findUnique({
          where: { userId: workspace.company.ownerId },
        });

        const activeChannels = await this.prisma.publishingChannel.count({
          where: { workspaceId: dto.workspaceId, isActive: true },
        });

        assertTierLimit("channel", activeChannels, subscription?.tier);
      }
    }

    const credsWithMeta = {
      ...(dto.credentials || {}),
      channelName:
        dto.channelName ||
        (dto.credentials?.channelName as string) ||
        (dto.credentials?.siteName as string) ||
        (dto.credentials?.siteUrl as string) ||
        dto.platform,
    };

    const encryptedCredentials = this.encryptionService.encrypt(credsWithMeta);

    const channel = await this.prisma.publishingChannel.create({
      data: {
        workspaceId: dto.workspaceId,
        platform: dto.platform,
        encryptedCredentials,
        isActive: dto.isActive ?? true,
      },
    });

    return this.sanitizeChannel(channel);
  }

  async findAll(workspaceId: string | undefined, user: AuthenticatedUser) {
    if (workspaceId) {
      await assertWorkspaceAccess(this.prisma, workspaceId, user, "view");
      const channels = await this.prisma.publishingChannel.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
      });
      return channels.map((channel) => this.sanitizeChannel(channel));
    }

    if (user.role === "admin") {
      const channels = await this.prisma.publishingChannel.findMany({
        orderBy: { createdAt: "desc" },
      });
      return channels.map((channel) => this.sanitizeChannel(channel));
    }

    const accessibleWorkspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { company: { ownerId: user.userId } },
          { members: { some: { userId: user.userId } } },
        ],
      },
      select: { id: true },
    });
    const workspaceIds = accessibleWorkspaces.map((w) => w.id);

    const channels = await this.prisma.publishingChannel.findMany({
      where: { workspaceId: { in: workspaceIds } },
      orderBy: { createdAt: "desc" },
    });

    return channels.map((channel) => this.sanitizeChannel(channel));
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const channel = await this.prisma.publishingChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Publishing channel ${id} not found`);
    }

    if (channel.workspaceId) {
      await assertWorkspaceAccess(
        this.prisma,
        channel.workspaceId,
        user,
        "view",
      );
    }

    return this.sanitizeChannel(channel);
  }

  async update(
    id: string,
    dto: UpdatePublishingChannelDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.publishingChannel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Publishing channel ${id} not found`);
    }

    if (existing.workspaceId) {
      await assertWorkspaceAccess(
        this.prisma,
        existing.workspaceId,
        user,
        "update",
      );
    }

    const data: Prisma.PublishingChannelUpdateInput = {};
    if (dto.platform) data.platform = dto.platform;
    if (typeof dto.isActive === "boolean") data.isActive = dto.isActive;
    if (dto.credentials) {
      data.encryptedCredentials = this.encryptionService.encrypt(
        dto.credentials,
      );
    }

    const updated = await this.prisma.publishingChannel.update({
      where: { id },
      data,
    });

    return this.sanitizeChannel(updated);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const channel = await this.prisma.publishingChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Publishing channel ${id} not found`);
    }

    if (channel.workspaceId) {
      await assertWorkspaceAccess(
        this.prisma,
        channel.workspaceId,
        user,
        "delete",
      );
    }

    return this.prisma.publishingChannel.delete({ where: { id } });
  }

  private sanitizeChannel(channel: PublishingChannel) {
    let credentialsSummary: Record<string, unknown> = { isConfigured: true };
    let channelName = channel.platform;
    try {
      const decrypted = this.encryptionService.decrypt(
        channel.encryptedCredentials,
      );
      if (decrypted && typeof decrypted === "object") {
        const dec = decrypted as Record<string, unknown>;
        channelName =
          (dec.channelName as string) ||
          (dec.siteName as string) ||
          (dec.siteUrl as string) ||
          (dec.username as string) ||
          channel.platform;
        credentialsSummary = {
          isConfigured: true,
          platform: channel.platform,
          channelName,
          authorUrl: dec.authorUrl || dec.wpUrl || dec.siteUrl || undefined,
          siteUrl: dec.siteUrl || dec.apiUrl || undefined,
          siteName: dec.siteName || undefined,
          username: dec.username || undefined,
          targetType: dec.organizationUrn
            ? "organization"
            : dec.personUrn
              ? "person"
              : undefined,
          hasAccessToken: Boolean(
            dec.accessToken || dec.apiKey || dec.password,
          ),
        };
      }
    } catch {
      credentialsSummary = { isConfigured: false };
    }

    const { encryptedCredentials, ...safeChannel } = channel;
    void encryptedCredentials;

    return {
      ...safeChannel,
      channelName,
      credentials: credentialsSummary,
    };
  }
}
