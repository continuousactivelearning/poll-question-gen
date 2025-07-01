import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoomValidator {
  @IsString()
  @IsNotEmpty({ message: "Room name is required" })
  name: string;
}
