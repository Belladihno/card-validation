import { BadRequestException, Injectable } from '@nestjs/common';
import { CardType, detectCardType } from './utils/card-type';
import { isValidLuhn } from './utils/luhn';

interface ValidationResult {
  isValid: boolean;
  cardType: CardType | null;
  reason?: string;
}

@Injectable()
export class CardService {
  validate(cardNumber: string): ValidationResult {
    const sanitised = this.sanitise(cardNumber);

    if (sanitised.length < 13) {
      return {
        isValid: false,
        cardType: null,
        reason: 'Card number is too short',
      };
    }

    if (!isValidLuhn(sanitised)) {
      return {
        isValid: false,
        cardType: null,
        reason: 'Failed Luhn check',
      };
    }

    const cardType = detectCardType(sanitised);

    return {
      isValid: true,
      cardType,
    };
  }

  private sanitise(cardNumber: string): string {
    const sanitised = cardNumber.replace(/[\s-]/g, '');

    if (!/^\d+$/.test(sanitised)) {
      throw new BadRequestException(
        'cardNumber must contain digits only (spaces and dashes are allowed)',
      );
    }

    return sanitised;
  }
}
