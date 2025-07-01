import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from "class-validator";

export class CreatePollValidator {
  @IsString()
  @IsNotEmpty({ message: "Question is required" })
  question: string;

  @IsArray()
  @ArrayMinSize(2, { message: "At least two options are required" })
  @IsString({ each: true })
  options: string[];
}
