import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

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
}
