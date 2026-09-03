import { Module } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CompaniesController } from "./companies.controller";
import { AuthModule } from "../auth/auth.module";
import { BillingController } from "./billing/billing.controller";
import { BillingService } from "./billing/billing.service";

@Module({
  imports: [AuthModule],
  controllers: [CompaniesController, BillingController],
  providers: [CompaniesService, BillingService],
  exports: [CompaniesService, BillingService],
})
export class CompaniesModule {}
