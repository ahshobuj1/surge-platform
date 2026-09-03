import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmCheckoutSessionDto {
  @ApiProperty({
    description: "Stripe Checkout Session ID",
    example: "cs_test_a1b2c3d4",
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
