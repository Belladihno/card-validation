export type CardType =
  'visa' | 'mastercard' | 'verve' | 'amex' | 'discover' | 'unknown';

interface CardPattern {
  type: CardType;
  pattern: RegExp;
}

const CARD_PATTERNS: CardPattern[] = [
  // Verve must come before Discover — both start with 6
  // More specific prefix always checked first
  { type: 'verve', pattern: /^(5061|6500|6501|6504|6509)\d{12,15}$/ },

  // Visa — starts with 4, either 13 or 16 digits
  { type: 'visa', pattern: /^4\d{12}(\d{3})?$/ },

  // Mastercard — traditional 51-55 range
  { type: 'mastercard', pattern: /^5[1-5]\d{14}$/ },

  // Mastercard — newer 2221-2720 range
  {
    type: 'mastercard',
    pattern: /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)\d{12}$/,
  },

  // Amex — starts with 34 or 37, always 15 digits
  { type: 'amex', pattern: /^3[47]\d{13}$/ },

  // Discover — three separate prefix ranges
  { type: 'discover', pattern: /^6011\d{12}$/ },
  { type: 'discover', pattern: /^64[4-9]\d{13}$/ },
  { type: 'discover', pattern: /^65\d{14}$/ },
];

export function detectCardType(cardNumber: string): CardType {
  for (const card of CARD_PATTERNS) {
    if (card.pattern.test(cardNumber)) {
      return card.type;
    }
  }

  return 'unknown';
}
