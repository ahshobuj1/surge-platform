export class CreatePublishingChannelDto {
  workspaceId!: string;
  platform!: string;
  credentials!: Record<string, unknown>;
  isActive?: boolean;
}
