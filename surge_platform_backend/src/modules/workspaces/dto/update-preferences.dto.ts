import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePreferencesDto {
  @ApiProperty({
    description: "Writing tone of the generated articles",
    example: "Professional & Objective",
  })
  @IsString()
  @IsNotEmpty({ message: "Writing tone is required." })
  tone: string;

  @ApiProperty({
    description: "Comma-separated target audience list",
    example: "CTOs, Software Engineers, Tech Founders",
  })
  @IsString()
  @IsNotEmpty({ message: "Targeted audience is required." })
  audience: string;

  @ApiPropertyOptional({
    description: "Optional comma-separated excluded topics or editorial rules",
    example: "Politics, Crypto, Gossip",
  })
  @IsOptional()
  @IsString()
  excluded?: string;
}
