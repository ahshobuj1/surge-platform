import { PrismaService } from "../../../common/context/prisma.service";
import { assertTierLimit } from "../../companies/billing/tier-limits.config";

export async function checkRssSubscriptionLimit(
  prisma: PrismaService,
  companyOwnerId: string,
  workspaceId: string,
) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: companyOwnerId },
  });

  const activeCount = await prisma.rssFeed.count({
    where: { workspaceId, status: "active" },
  });

  assertTierLimit("rss", activeCount, subscription?.tier);
}
