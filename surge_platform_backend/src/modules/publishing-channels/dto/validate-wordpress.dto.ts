import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class ValidateWordpressDto {
  @ApiProperty({
    description: "WordPress site base URL",
    example: "https://mycompany.com",
  })
  @IsString()
  @IsNotEmpty({ message: "WordPress site URL is required." })
  @IsUrl(
    { require_protocol: true, protocols: ["http", "https"] },
    { message: "Please provide a valid HTTP or HTTPS WordPress URL." },
  )
  siteUrl: string;

  @ApiProperty({
    description: "WordPress administrator or editor username",
    example: "admin",
  })
  @IsString()
  @IsNotEmpty({ message: "WordPress username is required." })
  username: string;

  @ApiProperty({
    description: "WordPress Application Password generated in user profile",
    example: "abcd efgh ijkl mnop qrst uvwx",
  })
  @IsString()
  @IsNotEmpty({ message: "WordPress Application Password is required." })
  applicationPassword: string;
}
