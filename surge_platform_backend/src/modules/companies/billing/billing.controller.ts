import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { BillingService } from "./billing.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { GetUser } from "../../auth/decorators/get-user.decorator";

interface AuthenticatedUser {
  userId: string;
  role: string;
}

@ApiTags("billing")
@Controller("companies/billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a Stripe Checkout session for a subscription",
  })
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiResponse({
    status: 200,
    description: "Checkout session created successfully",
    schema: { properties: { checkoutUrl: { type: "string" } } },
  })
  createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.billingService.createCheckoutSession(dto, user);
  }

  @Post("portal")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a Stripe Customer Portal session" })
  @ApiResponse({
    status: 200,
    description: "Portal session created successfully",
    schema: { properties: { portalUrl: { type: "string" } } },
  })
  createPortalSession(@GetUser() user: AuthenticatedUser) {
    return this.billingService.createPortalSession(user);
  }

  @Get("subscription")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get current subscription status and resource limits",
  })
  @ApiResponse({
    status: 200,
    description: "Subscription details returned successfully",
  })
  getSubscription(@GetUser() user: AuthenticatedUser) {
    return this.billingService.getSubscriptionDetails(user);
  }

  @Post("webhook")
  @ApiOperation({
    summary: "Stripe Webhook endpoint for billing lifecycle events",
  })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.billingService.handleRawWebhook(req.rawBody, signature);
  }
}
