import { ForbiddenException } from "@nestjs/common";
import {
  assertTierLimit,
  getTierConfig,
  normalizeTier,
  TIER_CONFIGS,
} from "./tier-limits.config";

describe("tier-limits.config", () => {
  describe("normalizeTier", () => {
    it("should normalize valid tiers and aliases correctly", () => {
      expect(normalizeTier("starter")).toBe("starter");
      expect(normalizeTier("STARTER")).toBe("starter");
      expect(normalizeTier("pro")).toBe("pro");
      expect(normalizeTier("Pro ")).toBe("pro");
      expect(normalizeTier("business")).toBe("business");
      expect(normalizeTier("enterprise")).toBe("business");
      expect(normalizeTier("Enterprise")).toBe("business");
      expect(normalizeTier(undefined)).toBe("starter");
      expect(normalizeTier(null)).toBe("starter");
      expect(normalizeTier("unknown-tier")).toBe("starter");
    });
  });

  describe("getTierConfig", () => {
    it("should return the correct tier limits and pricing", () => {
      const starter = getTierConfig("starter");
      expect(starter).toEqual(TIER_CONFIGS.starter);
      expect(starter.maxRssSources).toBe(5);
      expect(starter.maxChannels).toBe(3);

      const pro = getTierConfig("pro");
      expect(pro.maxRssSources).toBe(20);
      expect(pro.maxChannels).toBe(10);

      const enterprise = getTierConfig("enterprise");
      expect(enterprise.maxRssSources).toBe(50);
      expect(enterprise.maxChannels).toBe(25);
    });
  });

  describe("assertTierLimit", () => {
    it("should allow counts strictly below the limit", () => {
      expect(() => assertTierLimit("rss", 4, "starter")).not.toThrow();
      expect(() => assertTierLimit("channel", 2, "starter")).not.toThrow();
      expect(() => assertTierLimit("rss", 19, "pro")).not.toThrow();
      expect(() => assertTierLimit("channel", 9, "pro")).not.toThrow();
    });

    it("should throw ForbiddenException when count reaches or exceeds limit", () => {
      expect(() => assertTierLimit("rss", 5, "starter")).toThrow(
        ForbiddenException,
      );
      expect(() => assertTierLimit("channel", 3, "starter")).toThrow(
        ForbiddenException,
      );
      expect(() => assertTierLimit("rss", 20, "pro")).toThrow(
        ForbiddenException,
      );
      expect(() => assertTierLimit("channel", 10, "pro")).toThrow(
        ForbiddenException,
      );
      expect(() => assertTierLimit("rss", 50, "business")).toThrow(
        ForbiddenException,
      );
      expect(() => assertTierLimit("channel", 25, "business")).toThrow(
        ForbiddenException,
      );
    });
  });
});
