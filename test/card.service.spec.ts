import { describe, it, expect, beforeEach } from 'vitest';
import { CardService } from '../src/card/card.service';
import { BadRequestException } from '@nestjs/common';

describe('CardService', () => {
  let service: CardService;

  beforeEach(() => {
    service = new CardService();
  });

  it('should return valid for a correct Visa card number', () => {
    const result = service.validate('4111111111111111');
    expect(result.isValid).toBe(true);
    expect(result.cardType).toBe('visa');
  });

  it('should return valid for a card number with spaces', () => {
    const result = service.validate('4111 1111 1111 1111');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for a number that fails Luhn', () => {
    const result = service.validate('4111111111111112');
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Failed Luhn check');
  });

  it('should return invalid for a number that is too short', () => {
    const result = service.validate('411111111111');
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Card number is too short');
  });

  it('should throw 400 for non-digit characters', () => {
    expect(() => service.validate('4111abc1111111')).toThrow(BadRequestException);
  });
  
  it('should return unknown for a valid Luhn number with unrecognised prefix', () => {
    // 36 prefix is Diners Club — not in our supported types
    const result = service.validate('36227206271667');
    expect(result.isValid).toBe(true);
    expect(result.cardType).toBe('unknown');
  });
  
  it('should correctly detect a Verve card', () => {
    const result = service.validate('5061260000000000002');
    expect(result.isValid).toBe(true);
    expect(result.cardType).toBe('verve');
  });
});