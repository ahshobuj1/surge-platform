import { Prisma } from "@prisma/client";
import { getTierConfig } from "../../companies/billing/tier-limits.config";

export async function provisionVerifiedUserAccount(
  tx: Prisma.TransactionClient,
  userId: string,
  verificationId: string,
) {
  const updatedUser = await tx.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  await tx.verificationToken.update({
    where: { id: verificationId },
    data: { used: true },
  });

  let companyRecord = await tx.company.findFirst({
    where: { ownerId: updatedUser.id },
  });

  if (!companyRecord) {
    companyRecord = await tx.company.create({
      data: {
        ownerId: updatedUser.id,
        name: updatedUser.email.split("@")[0] || updatedUser.email,
        status: "active",
      },
    });
  }

  let workspaceRecord = await tx.workspace.findFirst({
    where: { companyId: companyRecord.id },
  });

  if (!workspaceRecord) {
    workspaceRecord = await tx.workspace.create({
      data: {
        companyId: companyRecord.id,
        name: "Default Workspace",
        timezone: "UTC",
        queueConfig: {
          fetchFrequencyHours: 24,
          postingTimes: ["09:00"],
        },
      },
    });
  }

  await tx.workspaceMember.create({
    data: {
      workspaceId: workspaceRecord.id,
      userId: updatedUser.id,
      role: "owner",
    },
  });

  const starterConfig = getTierConfig("starter");
  await tx.subscription.upsert({
    where: { userId: updatedUser.id },
    update: {},
    create: {
      userId: updatedUser.id,
      tier: "starter",
      monthlyPostLimit: starterConfig.monthlyPosts,
      feedLimit: starterConfig.maxRssSources,
      status: "ACTIVE",
    },
  });

  return {
    company: companyRecord,
    workspace: workspaceRecord,
  };
}
