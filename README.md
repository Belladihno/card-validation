# Card Validation API

A REST API that validates card numbers using the Luhn algorithm and detects the card type.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm

### Installation

```bash
pnpm install
```

### Run in development

```bash
pnpm run start:dev
```

The server starts on `http://localhost:3000`.

---

## Running Tests

### Unit tests

```bash
pnpm run test
```

### Integration tests

```bash
pnpm run test:e2e
```

---

## The Endpoint

POST /card/validate
Content-Type: application/json


### Request body

```json
{
  "cardNumber": "4111 1111 1111 1111"
}
```

`cardNumber` must be a non-empty string. Spaces and dashes are stripped automatically before validation. Any other non-digit character is rejected.

### Responses

**Valid card — `200 OK`**
```json
{
  "isValid": true,
  "cardType": "visa"
}
```

**Invalid card — `200 OK`**
```json
{
  "isValid": false,
  "cardType": null,
  "reason": "Failed Luhn check"
}
```

**Malformed input — `400 Bad Request`**
```json
{
  "statusCode": 400,
  "message": "cardNumber must contain digits only (spaces and dashes are allowed)"
}
```

**Missing field — `400 Bad Request`**
```json
{
  "statusCode": 400,
  "message": ["cardNumber should not be empty", "cardNumber must be a string"]
}
```

### HTTP status code decisions

| Scenario | Status |
|---|---|
| Card passes or fails validation | `200` |
| Non-digit characters in input | `400` |
| Missing or wrong type for `cardNumber` | `400` |
| Unexpected server error | `500` |

A card that fails Luhn returns `200`, not `400` — the request was valid, the card just did not pass. A `400` means the client sent something malformed that could never be a card number.

---

## Design Decisions

### Why NestJS over Express

NestJS enforces a clear separation between the controller, service, and module from the start. For an assessed project where code structure is explicitly evaluated, that structure matters. Express gives you freedom — NestJS gives you a pattern to follow and defend.

### Validation approach — the Luhn algorithm

The Luhn algorithm is the industry standard checksum used to validate card numbers. It catches typos and transcription errors without making a network call. I implemented it from scratch rather than using a third-party package so the logic is fully visible and explainable.

### Why the service throws for non-digits but returns `isValid: false` for Luhn failure

These are two different problems. A card number containing letters like `4111abc1111` is malformed input — it can never be a card number regardless of any algorithm. That is a client error and gets a `400`. A number that is all digits but fails Luhn is a legitimate request that produced a negative result. That gets a `200` with `isValid: false`.

### Why card type detection checks Verve before Discover

Both Verve and Discover use prefixes starting with `6`. If Discover was checked first, a Verve card starting with `6500` could match the Discover `65` pattern incorrectly. More specific prefixes are always checked before broader ones.

### Why the Luhn function is pure

The Luhn utility takes a string and returns a boolean. No dependencies, no side effects. Pure functions are trivially testable and trivially explainable — you call them with input and assert the output. The same applies to the card type detection function.

### Request body validation — DTO with class-validator

The `ValidateCardDto` uses `@IsString()` and `@IsNotEmpty()` decorators from `class-validator`. The global `ValidationPipe` is configured with `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields are rejected outright rather than silently stripped. This keeps the API surface strict and predictable.

---

## Manual Test

```bash
curl -X POST http://localhost:3000/card/validate \
  -H "Content-Type: application/json" \
  -d '{"cardNumber": "4111 1111 1111 1111"}'
```

Expected response:

```json
{
  "isValid": true,
  "cardType": "visa"
}
```