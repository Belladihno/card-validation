import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateCardDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;
}
