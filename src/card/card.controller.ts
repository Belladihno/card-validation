import { Controller, Post, Body } from '@nestjs/common';
import { CardService } from './card.service';
import { ValidateCardDto } from './dto/validate-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: ValidateCardDto) {
    return this.cardService.validate(createCardDto);
  }
}
