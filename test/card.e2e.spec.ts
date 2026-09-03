import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('POST /card/validate (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and isValid true for a valid Visa card', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '4111111111111111' })
      .expect(200)
      .expect((res) => {
        expect(res.body.isValid).toBe(true);
        expect(res.body.cardType).toBe('visa');
      });
  });

  it('should return 200 and isValid true for a card number with spaces', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '4111 1111 1111 1111' })
      .expect(200)
      .expect((res) => {
        expect(res.body.isValid).toBe(true);
      });
  });

  it('should return 200 and isValid false for a Luhn failure', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '4111111111111112' })
      .expect(200)
      .expect((res) => {
        expect(res.body.isValid).toBe(false);
        expect(res.body.reason).toBe('Failed Luhn check');
      });
  });

  it('should return 200 and isValid false for a number that is too short', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '411111111111' })
      .expect(200)
      .expect((res) => {
        expect(res.body.isValid).toBe(false);
        expect(res.body.reason).toBe('Card number is too short');
      });
  });

  it('should return 400 for non-digit characters', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '4111abc1111111' })
      .expect(400);
  });

  it('should return 400 when cardNumber is missing', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('cardNumber should not be empty');
      });
  });

  it('should return 400 when cardNumber is not a string', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: 4111111111111111 })
      .expect(400);
  });

  it('should return 400 for unknown extra fields', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '4111111111111111', extra: 'field' })
      .expect(400);
  });

  it('should return 200 with unknown cardType for unrecognised prefix', async () => {
    return request(app.getHttpServer())
      .post('/card/validate')
      .send({ cardNumber: '36227206271667' })
      .expect(200)
      .expect((res) => {
        expect(res.body.isValid).toBe(true);
        expect(res.body.cardType).toBe('unknown');
      });
  });
});