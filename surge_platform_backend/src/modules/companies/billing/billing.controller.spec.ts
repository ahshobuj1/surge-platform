import { Test, TestingModule } from "@nestjs/testing";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import type { Request } from "express";

describe("BillingController", () => {
  let controller: BillingController;
  let billingService: {
    createCheckoutSession: jest.Mock;
    createPortalSession: jest.Mock;
    getSubscriptionDetails: jest.Mock;
    handleRawWebhook: jest.Mock;
  };

  beforeEach(async () => {
    billingService = {
      createCheckoutSession: jest.fn(),
      createPortalSession: jest.fn(),
      getSubscriptionDetails: jest.fn(),
      handleRawWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [{ provide: BillingService, useValue: billingService }],
    }).compile();

    controller = module.get<BillingController>(BillingController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call createCheckoutSession on billingService", async () => {
    billingService.createCheckoutSession.mockResolvedValue({
      checkoutUrl: "https://checkout.stripe.com/abc",
    });

    const result = await controller.createCheckoutSession(
      { tier: "pro", interval: "monthly" },
      { userId: "user-1", role: "customer" },
    );

    expect(billingService.createCheckoutSession).toHaveBeenCalledWith(
      { tier: "pro", interval: "monthly" },
      { userId: "user-1", role: "customer" },
    );
    expect(result).toEqual({ checkoutUrl: "https://checkout.stripe.com/abc" });
  });

  it("should call createPortalSession on billingService", async () => {
    billingService.createPortalSession.mockResolvedValue({
      portalUrl: "https://billing.stripe.com/portal/abc",
    });

    const result = await controller.createPortalSession({
      userId: "user-1",
      role: "customer",
    });

    expect(billingService.createPortalSession).toHaveBeenCalledWith({
      userId: "user-1",
      role: "customer",
    });
    expect(result).toEqual({
      portalUrl: "https://billing.stripe.com/portal/abc",
    });
  });

  it("should call getSubscriptionDetails on billingService", async () => {
    billingService.getSubscriptionDetails.mockResolvedValue({
      tier: "starter",
      limits: { maxRssSources: 5, maxChannels: 3, monthlyPosts: 50 },
    });

    const result = await controller.getSubscription({
      userId: "user-1",
      role: "customer",
    });

    expect(billingService.getSubscriptionDetails).toHaveBeenCalledWith({
      userId: "user-1",
      role: "customer",
    });
    expect(result.tier).toBe("starter");
  });

  it("should call handleRawWebhook on billingService", async () => {
    billingService.handleRawWebhook.mockResolvedValue({ received: true });
    const req = { rawBody: Buffer.from("{}") } as Request & {
      rawBody?: Buffer;
    };

    const result = await controller.handleWebhook(req, "sig_123");

    expect(billingService.handleRawWebhook).toHaveBeenCalledWith(
      req.rawBody,
      "sig_123",
    );
    expect(result).toEqual({ received: true });
  });
});
