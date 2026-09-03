import { ForbiddenException } from "@nestjs/common";

export type SubscriptionTier = "starter" | "pro" | "business";

export interface TierConfig {
  name: string;
  monthlyPrice: number; // in USD
  yearlyPrice: number; // in USD per month
  maxRssSources: number;
  maxChannels: number;
  monthlyPosts: number;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  starter: {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    maxRssSources: 5,
    maxChannels: 3,
    monthlyPosts: 50,
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    maxRssSources: 20,
    maxChannels: 10,
    monthlyPosts: 200,
  },
  business: {
    name: "Business",
    monthlyPrice: 99,
    yearlyPrice: 79,
    maxRssSources: 50,
    maxChannels: 25,
    monthlyPosts: 1000,
  },
};

export function normalizeTier(
  tier: string | undefined | null,
): SubscriptionTier {
  if (!tier) return "starter";
  const lower = tier.trim().toLowerCase();
  if (lower === "enterprise" || lower === "business") return "business";
  if (lower === "pro") return "pro";
  return "starter";
}

export function getTierConfig(tier: string | undefined | null): TierConfig {
  return TIER_CONFIGS[normalizeTier(tier)];
}

export function assertTierLimit(
  type: "rss" | "channel",
  currentCount: number,
  tier: string | undefined | null,
): void {
  const normalized = normalizeTier(tier);
  const config = TIER_CONFIGS[normalized];
  const maxAllowed = type === "rss" ? config.maxRssSources : config.maxChannels;

  if (currentCount >= maxAllowed) {
    throw new ForbiddenException(
      `Subscription tier '${normalized}' limit reached for ${type} (Maximum: ${maxAllowed}). Upgrade your plan to add more.`,
    );
  }
}
