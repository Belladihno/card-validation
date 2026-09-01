import { Injectable } from '@nestjs/common';
import { ValidateCardDto } from './dto/validate-card.dto';


@Injectable()
export class CardService {
  validate(createCardDto: ValidateCardDto) {
    return 'This action adds a new card';
  }
}
