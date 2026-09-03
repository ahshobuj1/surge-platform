import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";
import { ValidateWordpressDto } from "./validate-wordpress.dto";

export class ConnectWordpressDto extends ValidateWordpressDto {
  @ApiProperty({
    description:
      "The Workspace ID to connect this WordPress publishing channel to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4", { message: "workspaceId must be a valid UUID." })
  @IsNotEmpty({ message: "workspaceId is required." })
  workspaceId: string;
}
