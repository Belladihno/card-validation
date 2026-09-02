export function isValidLuhn(cardNumber: string): Boolean {
  const digits = cardNumber.split('').reverse();

  let total = 0;

  for (let position = 0; position < digits.length; position++) {
    let digit = parseInt(digits[position], 10);

    const isEvenPosition = position % 2 !== 0;

    if (isEvenPosition) {
      digit = digit * 2;

      if (digit > 9) {
        digit = digit - 9;
      }
    }

    total = total + digit;
  }
  return total % 10 === 0;
}
