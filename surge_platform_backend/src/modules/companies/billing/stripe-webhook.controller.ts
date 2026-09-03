import {
  Controller,
  Post,
  Req,
  Headers,
} from "@nestjs/common";
import { Request } from "express";
import { StripeWebhookService } from "./stripe-webhook.service";

@Controller("companies/billing")
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post("webhook")
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.webhookService.handleRawWebhook(
      req.rawBody,
      req.body,
      signature,
    );
  }
}
