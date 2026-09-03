import { Test, TestingModule } from "@nestjs/testing";
import { BillingService } from "./billing.service";
import { PrismaService } from "../../../common/context/prisma.service";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, NotFoundException } from "@nestjs/common";

const mockStripeCustomersCreate = jest.fn();
const mockStripeCheckoutSessionsCreate = jest.fn();
const mockStripeBillingPortalSessionsCreate = jest.fn();
const mockStripeWebhooksConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: mockStripeCustomersCreate,
    },
    checkout: {
      sessions: {
        create: mockStripeCheckoutSessionsCreate,
      },
    },
    billingPortal: {
      sessions: {
        create: mockStripeBillingPortalSessionsCreate,
      },
    },
    webhooks: {
      constructEvent: mockStripeWebhooksConstructEvent,
    },
  }));
});

describe("BillingService", () => {
  let service: BillingService;
  let prisma: {
    company: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    subscription: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
    };
    invoice: {
      upsert: jest.Mock;
    };
    rssFeed: {
      count: jest.Mock;
    };
    publishingChannel: {
      count: jest.Mock;
    };
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      company: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      invoice: {
        upsert: jest.fn(),
      },
      rssFeed: {
        count: jest.fn(),
      },
      publishingChannel: {
        count: jest.fn(),
      },
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === "STRIPE_SECRET_KEY") return "sk_test_12345";
        if (key === "STRIPE_WEBHOOK_SECRET") return "whsec_mock";
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);

    const mockStripeInstance = {
      customers: {
        create: mockStripeCustomersCreate,
      },
      checkout: {
        sessions: {
          create: mockStripeCheckoutSessionsCreate,
        },
      },
      billingPortal: {
        sessions: {
          create: mockStripeBillingPortalSessionsCreate,
        },
      },
      webhooks: {
        constructEvent: mockStripeWebhooksConstructEvent,
      },
    };

    (service as unknown as { stripe: typeof mockStripeInstance }).stripe =
      mockStripeInstance;
  });

  describe("createCheckoutSession", () => {
    it("should throw NotFoundException if user has no company", async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession(
          { tier: "pro", interval: "monthly" },
          { userId: "user-1", role: "customer" },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should create a Stripe customer if not already present and return checkoutUrl", async () => {
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        name: "Test Corp",
        stripeCustomerId: null,
        owner: { email: "owner@test.com" },
      });
      mockStripeCustomersCreate.mockResolvedValue({ id: "cus_123" });
      prisma.company.update.mockResolvedValue({
        id: "comp-1",
        stripeCustomerId: "cus_123",
      });
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/pay/cs_test_abc",
      });

      const result = await service.createCheckoutSession(
        { tier: "pro", interval: "monthly" },
        { userId: "user-1", role: "customer" },
      );

      expect(mockStripeCustomersCreate).toHaveBeenCalledWith(
        expect.objectContaining({ email: "owner@test.com" }),
      );
      expect(prisma.company.update).toHaveBeenCalledWith({
        where: { id: "comp-1" },
        data: { stripeCustomerId: "cus_123" },
      });
      expect(result).toEqual({
        checkoutUrl: "https://checkout.stripe.com/pay/cs_test_abc",
      });
    });

    it("should use custom successUrl and cancelUrl when provided in DTO", async () => {
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        name: "Test Corp",
        stripeCustomerId: "cus_123",
        owner: { email: "owner@test.com" },
      });
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/pay/cs_test_custom",
      });

      const result = await service.createCheckoutSession(
        {
          tier: "pro",
          interval: "monthly",
          successUrl: "https://myapp.com/onboarding?step=completed",
          cancelUrl:
            "https://myapp.com/onboarding?step=checkout&cancelled=true",
        },
        { userId: "user-1", role: "customer" },
      );

      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url:
            "https://myapp.com/onboarding?step=completed&session_id={CHECKOUT_SESSION_ID}",
          cancel_url:
            "https://myapp.com/onboarding?step=checkout&cancelled=true",
        }),
      );
      expect(result.checkoutUrl).toBe(
        "https://checkout.stripe.com/pay/cs_test_custom",
      );
    });
  });

  describe("createPortalSession", () => {
    it("should throw BadRequestException if company has no stripe customer id", async () => {
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        stripeCustomerId: null,
      });

      await expect(
        service.createPortalSession({ userId: "user-1", role: "customer" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should return portal session url for valid customer", async () => {
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        stripeCustomerId: "cus_123",
      });
      mockStripeBillingPortalSessionsCreate.mockResolvedValue({
        url: "https://billing.stripe.com/portal/session_abc",
      });

      const result = await service.createPortalSession({
        userId: "user-1",
        role: "customer",
      });
      expect(result).toEqual({
        portalUrl: "https://billing.stripe.com/portal/session_abc",
      });
    });
  });

  describe("getSubscriptionDetails", () => {
    it("should return active tier, limits, and usage counts", async () => {
      prisma.company.findFirst.mockResolvedValue({
        id: "comp-1",
        stripeCustomerId: "cus_123",
        workspaces: [{ id: "ws-1" }],
      });
      prisma.subscription.findUnique.mockResolvedValue({
        tier: "pro",
        status: "ACTIVE",
        currentPostsCount: 14,
      });
      prisma.rssFeed.count.mockResolvedValue(6);
      prisma.publishingChannel.count.mockResolvedValue(2);

      const result = await service.getSubscriptionDetails({
        userId: "user-1",
        role: "customer",
      });

      expect(result.tier).toBe("pro");
      expect(result.tierName).toBe("Pro");
      expect(result.limits.maxRssSources).toBe(20);
      expect(result.limits.maxChannels).toBe(10);
      expect(result.usage.rssFeeds).toBe(6);
      expect(result.usage.channels).toBe(2);
      expect(result.usage.postsCount).toBe(14);
    });
  });

  describe("handleRawWebhook", () => {
    it("should handle checkout.session.completed and upgrade subscription", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "comp-1",
            customer: "cus_123",
            metadata: { tier: "business" },
          },
        },
      };
      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      prisma.company.findUnique.mockResolvedValue({
        id: "comp-1",
        ownerId: "user-1",
      });

      const result = await service.handleRawWebhook(
        Buffer.from(JSON.stringify(mockEvent)),
        "valid_sig",
      );

      expect(result).toEqual({ received: true });
      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          update: {
            tier: "business",
            monthlyPostLimit: 1000,
            feedLimit: 50,
            status: "ACTIVE",
          },
        }),
      );
    });

    it("should handle customer.subscription.deleted and downgrade to starter", async () => {
      const mockEvent = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            customer: "cus_123",
            metadata: {},
          },
        },
      };
      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      prisma.company.findUnique.mockResolvedValue({
        id: "comp-1",
        ownerId: "user-1",
      });

      const result = await service.handleRawWebhook(
        Buffer.from(JSON.stringify(mockEvent)),
        "valid_sig",
      );

      expect(result).toEqual({ received: true });
      expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: {
          tier: "starter",
          monthlyPostLimit: 50,
          feedLimit: 5,
          status: "CANCELED",
        },
      });
    });
  });
});
