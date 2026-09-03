import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { PrismaService } from "../../../common/context/prisma.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import {
  getTierConfig,
  normalizeTier,
  SubscriptionTier,
} from "./tier-limits.config";

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey =
      this.configService.get<string>("STRIPE_SECRET_KEY") || "sk_test_dummy";
    this.stripe = new Stripe(secretKey);
  }

  /**
   * Create a Stripe Checkout session for subscription tier upgrade/purchase.
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
    user: AuthenticatedUser,
  ): Promise<{ checkoutUrl: string }> {
    const company = await this.prisma.company.findFirst({
      where: { ownerId: user.userId },
      include: { owner: true },
    });

    if (!company) {
      throw new NotFoundException("No company found for this user");
    }

    const tier = normalizeTier(dto.tier);
    const tierConfig = getTierConfig(tier);
    const isAnnual = dto.interval === "annual" || dto.interval === "yearly";

    // Obtain or create Stripe Customer
    let customerId = company.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await this.stripe.customers.create({
          email: company.owner.email,
          name: company.name,
          metadata: {
            companyId: company.id,
            userId: user.userId,
          },
        });
        customerId = customer.id;
        await this.prisma.company.update({
          where: { id: company.id },
          data: { stripeCustomerId: customerId },
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create Stripe customer";
        this.logger.error(`Failed to create Stripe customer: ${message}`);
        throw new BadRequestException(message);
      }
    }

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") ||
      this.configService.get<string>("APP_URL") ||
      "http://localhost:3000";

    const unitAmount = isAnnual
      ? Math.round(tierConfig.yearlyPrice * 12 * 100)
      : Math.round(tierConfig.monthlyPrice * 100);

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Surge Platform - ${tierConfig.name} Plan`,
                description: `${tierConfig.maxRssSources} RSS Feeds, ${tierConfig.maxChannels} Publishing Channels, ${tierConfig.monthlyPosts} Monthly Posts.`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: isAnnual ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          companyId: company.id,
          userId: user.userId,
          tier,
        },
        client_reference_id: company.id,
        success_url: `${frontendUrl}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/dashboard?billing=cancelled`,
      });

      if (!session.url) {
        throw new BadRequestException(
          "Stripe failed to return checkout session URL",
        );
      }

      return { checkoutUrl: session.url };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initialize Stripe checkout";
      this.logger.error(`Stripe checkout session error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /**
   * Create a Stripe Customer Portal session for subscription management.
   */
  async createPortalSession(
    user: AuthenticatedUser,
  ): Promise<{ portalUrl: string }> {
    const company = await this.prisma.company.findFirst({
      where: { ownerId: user.userId },
    });

    if (!company || !company.stripeCustomerId) {
      throw new BadRequestException(
        "No active Stripe billing account found for your company. Please select a plan first.",
      );
    }

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") ||
      this.configService.get<string>("APP_URL") ||
      "http://localhost:3000";

    try {
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: company.stripeCustomerId,
        return_url: `${frontendUrl}/dashboard`,
      });

      return { portalUrl: portalSession.url };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to open Stripe billing portal";
      this.logger.error(`Stripe portal session error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /**
   * Get active subscription details, resource quotas, and current usage.
   */
  async getSubscriptionDetails(user: AuthenticatedUser) {
    const [company, subscription] = await Promise.all([
      this.prisma.company.findFirst({
        where: { ownerId: user.userId },
        include: { workspaces: { select: { id: true } } },
      }),
      this.prisma.subscription.findUnique({
        where: { userId: user.userId },
      }),
    ]);

    const tier: SubscriptionTier = normalizeTier(subscription?.tier);
    const tierConfig = getTierConfig(tier);

    const workspaceIds = company?.workspaces.map((w) => w.id) ?? [];
    const [activeRssFeeds, activeChannels] = await Promise.all([
      this.prisma.rssFeed.count({
        where: { workspaceId: { in: workspaceIds }, status: "active" },
      }),
      this.prisma.publishingChannel.count({
        where: { workspaceId: { in: workspaceIds }, isActive: true },
      }),
    ]);

    return {
      tier,
      tierName: tierConfig.name,
      status: subscription?.status ?? "ACTIVE",
      limits: {
        maxRssSources: tierConfig.maxRssSources,
        maxChannels: tierConfig.maxChannels,
        monthlyPosts: tierConfig.monthlyPosts,
      },
      usage: {
        rssFeeds: activeRssFeeds,
        channels: activeChannels,
        postsCount: subscription?.currentPostsCount ?? 0,
      },
      stripeCustomerId: company?.stripeCustomerId ?? null,
    };
  }

  /**
   * Securely process incoming raw Stripe webhook requests.
   */
  async handleRawWebhook(
    rawBody?: Buffer,
    signature?: string,
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET",
    );

    let event: Stripe.Event;

    if (webhookSecret && webhookSecret !== "whsec_test_secret") {
      if (!signature || !rawBody) {
        throw new BadRequestException(
          "Missing Stripe signature or raw payload",
        );
      }
      try {
        event = this.stripe.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret,
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Invalid Stripe signature";
        this.logger.error(`Rejected invalid Stripe signature: ${message}`);
        throw new BadRequestException(message);
      }
    } else {
      if (!rawBody) {
        throw new BadRequestException("Missing raw payload");
      }
      try {
        event = JSON.parse(rawBody.toString("utf8")) as Stripe.Event;
      } catch {
        throw new BadRequestException("Failed to parse webhook JSON body");
      }
    }

    await this.processStripeEvent(event);
    return { received: true };
  }

  private async processStripeEvent(event: Stripe.Event): Promise<void> {
    const { type, data } = event;
    this.logger.log(`Processing Stripe webhook event: ${type}`);

    switch (type) {
      case "checkout.session.completed": {
        const session = data.object;
        const companyId =
          session.client_reference_id || session.metadata?.companyId;
        const tier = normalizeTier(session.metadata?.tier);
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (companyId) {
          const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, ownerId: true },
          });

          if (company) {
            if (customerId) {
              await this.prisma.company.update({
                where: { id: company.id },
                data: { stripeCustomerId: customerId, status: "active" },
              });
            }

            const tierConfig = getTierConfig(tier);
            await this.prisma.subscription.upsert({
              where: { userId: company.ownerId },
              update: {
                tier,
                monthlyPostLimit: tierConfig.monthlyPosts,
                feedLimit: tierConfig.maxRssSources,
                status: "ACTIVE",
              },
              create: {
                userId: company.ownerId,
                tier,
                monthlyPostLimit: tierConfig.monthlyPosts,
                feedLimit: tierConfig.maxRssSources,
                status: "ACTIVE",
              },
            });

            this.logger.log(
              `Upgraded user ${company.ownerId} subscription to ${tier}`,
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (customerId) {
          const company = await this.prisma.company.findUnique({
            where: { stripeCustomerId: customerId },
            select: { ownerId: true },
          });

          if (company) {
            const statusMap: Record<string, string> = {
              active: "ACTIVE",
              trialing: "ACTIVE",
              past_due: "PAST_DUE",
              unpaid: "PAST_DUE",
              canceled: "CANCELED",
              incomplete: "INACTIVE",
              incomplete_expired: "CANCELED",
              paused: "SUSPENDED",
            };

            const subscriptionStatus = statusMap[sub.status] || "ACTIVE";

            await this.prisma.subscription.updateMany({
              where: { userId: company.ownerId },
              data: { status: subscriptionStatus },
            });

            this.logger.log(
              `Updated subscription status for user ${company.ownerId} to ${subscriptionStatus}`,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        const companyId = sub.metadata?.companyId;

        const company = customerId
          ? await this.prisma.company.findUnique({
              where: { stripeCustomerId: customerId },
              select: { ownerId: true },
            })
          : companyId
            ? await this.prisma.company.findUnique({
                where: { id: companyId },
                select: { ownerId: true },
              })
            : null;

        if (company) {
          const starterConfig = getTierConfig("starter");
          await this.prisma.subscription.updateMany({
            where: { userId: company.ownerId },
            data: {
              tier: "starter",
              monthlyPostLimit: starterConfig.monthlyPosts,
              feedLimit: starterConfig.maxRssSources,
              status: "CANCELED",
            },
          });
          this.logger.log(
            `Downgraded user ${company.ownerId} subscription to starter (canceled)`,
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const company = await this.prisma.company.findUnique({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });

          if (company) {
            await this.prisma.company.update({
              where: { id: company.id },
              data: { status: "active" },
            });

            if (invoice.id) {
              await this.prisma.invoice.upsert({
                where: { stripeInvoiceId: invoice.id },
                update: {
                  status: "paid",
                  amount: invoice.amount_paid,
                  paidAt: new Date(),
                },
                create: {
                  companyId: company.id,
                  stripeInvoiceId: invoice.id,
                  amount: invoice.amount_paid,
                  currency: invoice.currency?.toUpperCase() ?? "USD",
                  status: "paid",
                  paidAt: new Date(),
                },
              });
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const company = await this.prisma.company.findUnique({
            where: { stripeCustomerId: customerId },
            select: { id: true, ownerId: true },
          });

          if (company) {
            await this.prisma.company.update({
              where: { id: company.id },
              data: { status: "past_due" },
            });

            await this.prisma.subscription.updateMany({
              where: { userId: company.ownerId },
              data: { status: "PAST_DUE" },
            });

            if (invoice.id) {
              await this.prisma.invoice.upsert({
                where: { stripeInvoiceId: invoice.id },
                update: {
                  status: "failed",
                },
                create: {
                  companyId: company.id,
                  stripeInvoiceId: invoice.id,
                  amount: invoice.amount_due,
                  currency: invoice.currency?.toUpperCase() ?? "USD",
                  status: "failed",
                },
              });
            }
          }
        }
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event type: ${type}`);
        break;
    }
  }
}
