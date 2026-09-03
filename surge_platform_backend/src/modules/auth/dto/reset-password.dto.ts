import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty({ message: "Reset code is required" })
  @IsString({ message: "Reset code must be a string" })
  @Length(6, 6, { message: "Reset code must be exactly 6 digits" })
  token: string;

  @IsNotEmpty({ message: "New password is required" })
  @IsString({ message: "New password must be a string" })
  @MinLength(6, { message: "New password must be at least 6 characters" })
  newPassword: string;
}
