import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class ValidateRssSourceDto {
  @ApiProperty({
    description: "The RSS or Atom feed URL to validate",
    example: "https://feeds.bbci.co.uk/news/rss.xml",
  })
  @IsString()
  @IsNotEmpty({ message: "Feed URL must not be empty" })
  @IsUrl(
    { require_protocol: true, protocols: ["http", "https"] },
    { message: "Please provide a valid HTTP or HTTPS URL" },
  )
  url: string;
}
