import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../common/context/prisma.service";
import * as crypto from "crypto";

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleRawWebhook(
    rawBody?: Buffer,
    parsedBody?: any,
    signature?: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET",
    );

    if (webhookSecret) {
      if (!signature || !rawBody) {
        throw new BadRequestException("Missing stripe signature or raw payload");
      }
      const isValid = this.verifyStripeSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        this.logger.error("Rejected invalid Stripe webhook signature");
        throw new BadRequestException("Invalid Stripe signature");
      }
    }

    const event = parsedBody || (rawBody ? JSON.parse(rawBody.toString("utf8")) : {});
    return this.handleStripeEvent(event);
  }

  private verifyStripeSignature(
    rawBody: Buffer,
    signatureHeader: string,
    secret: string,
  ): boolean {
    try {
      const parts = signatureHeader.split(",");
      let timestamp = "";
      const signatures: string[] = [];

      for (const part of parts) {
        const [k, v] = part.split("=");
        if (k?.trim() === "t") timestamp = v?.trim();
        if (k?.trim() === "v1") signatures.push(v?.trim());
      }

      if (!timestamp || signatures.length === 0) return false;

      const timestampNum = parseInt(timestamp, 10);
      if (Number.isNaN(timestampNum)) return false;

      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestampNum) > 300) {
        return false;
      }

      const payload = `${timestamp}.${rawBody.toString("utf8")}`;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      return signatures.some((sig) => {
        try {
          return (
            sig.length === expected.length &&
            crypto.timingSafeEqual(
              Buffer.from(sig, "utf8"),
              Buffer.from(expected, "utf8"),
            )
          );
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  async handleStripeEvent(event: { type: string; data: { object: any } }) {
    const { type, data } = event;
    const obj = data?.object ?? {};

    this.logger.log(`Processing Stripe webhook event: ${type}`);

    if (type === "checkout.session.completed") {
      const companyId = obj.client_reference_id || obj.metadata?.companyId;
      const tier = obj.metadata?.tier || "pro";

      if (companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
          select: { ownerId: true },
        });

        if (company) {
          await this.prisma.subscription.upsert({
            where: { userId: company.ownerId },
            update: { tier, status: "ACTIVE" },
            create: {
              userId: company.ownerId,
              tier,
              monthlyPostLimit: tier === "business" ? 1000 : 200,
              status: "ACTIVE",
            },
          });
          this.logger.log(
            `Upgraded user ${company.ownerId} subscription to ${tier}`,
          );
        }
      }
    } else if (type === "customer.subscription.deleted") {
      const companyId = obj.metadata?.companyId;
      if (companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
          select: { ownerId: true },
        });

        if (company) {
          await this.prisma.subscription.update({
            where: { userId: company.ownerId },
            data: { tier: "starter", status: "CANCELED" },
          });
          this.logger.log(
            `Downgraded user ${company.ownerId} subscription to starter`,
          );
        }
      }
    }

    return { received: true };
  }
}
