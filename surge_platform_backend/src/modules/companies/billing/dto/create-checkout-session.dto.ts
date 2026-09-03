import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: "Target subscription tier",
    enum: ["starter", "pro", "business", "enterprise"],
    example: "pro",
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["starter", "pro", "business", "enterprise"])
  tier: "starter" | "pro" | "business" | "enterprise";

  @ApiProperty({
    description: "Billing interval",
    enum: ["monthly", "annual", "yearly"],
    example: "monthly",
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["monthly", "annual", "yearly"])
  interval: "monthly" | "annual" | "yearly";

  @ApiProperty({
    description: "Custom success redirect URL for Stripe Checkout",
    required: false,
    example:
      "https://app.surgeplatform.io/onboarding?step=completed&session_id={CHECKOUT_SESSION_ID}",
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({
    description: "Custom cancel redirect URL for Stripe Checkout",
    required: false,
    example:
      "https://app.surgeplatform.io/onboarding?step=checkout&cancelled=true",
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
