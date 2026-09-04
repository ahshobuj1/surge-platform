export class CreatePublishingChannelDto {
  workspaceId!: string;
  platform!: string;
  channelName?: string;
  credentials!: Record<string, unknown>;
  isActive?: boolean;
}
