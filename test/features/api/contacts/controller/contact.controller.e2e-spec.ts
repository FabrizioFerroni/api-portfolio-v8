import { AppModule } from '@/app.module';
import { MailQeueService } from '@/core/mail/service/mail-qeue.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('ContactController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/contact (GET) debería devolver lista de contactos', async () => {
    const res = await request(app.getHttpServer()).get('/contact');

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.data.contacts)).toBe(true);
  });

  it('/contact/:id (GET) contacto existente', async () => {
    const id = '6833a1c9eb8534f065457118';
    const res = await request(app.getHttpServer()).get(`/contact/${id}`);

    if (res.status === 200) {
      expect(res.body).toBeDefined();
      expect(res.body.data.id).toBe(id);
    } else {
      expect(res.status).toBe(404);
    }
  });

  it('/contact/em/:email (GET) buscar por email', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer()).get(`/contact/em/${email}`);

    expect([200, 404]).toContain(res.status);
  });

  it('/contact/ems/:email (GET) todos por email', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer()).get(`/contact/ems/${email}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('/contact/sb/:subject (GET) buscar por asunto', async () => {
    const subject = 'Consulta general';
    const res = await request(app.getHttpServer()).get(
      `/contact/sb/${subject}`,
    );

    expect([200, 404]).toContain(res.status);
  });

  it('/contact/sbs/:subject (GET) todos por asunto', async () => {
    const subject = 'Test email';
    const res = await request(app.getHttpServer()).get(
      `/contact/sbs/${subject}`,
    );

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('/contact (POST) crear contacto válido', async () => {
    const dto = {
      email: 'nuevo@correo.com',
      name: 'Fabrii',
      subject: 'Ayuda',
      message: 'Hola, necesito soporte.',
    };

    const res = await request(app.getHttpServer()).post('/contact').send(dto);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('/contact (POST) crear contacto inválido (400)', async () => {
    const dto = {
      name: 'Sin email',
      message: 'Falta email y subject',
    };

    const res = await request(app.getHttpServer()).post('/contact').send(dto);

    expect(res.status).toBe(400);
  });
});
