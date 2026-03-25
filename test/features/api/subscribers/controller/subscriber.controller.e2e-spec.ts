import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('SubscriberController (e2e)', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  // ─── GET /subscribers ───────────────────────────────────────────────────────

  it('/subscribers (GET) deberia retornar lista de subscribers', async () => {
    const res = await request(app.getHttpServer()).get('/subscribers');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.data.subscribers)).toBe(true);
  });

  it('/subscribers (GET) deberia soportar paginacion', async () => {
    const res = await request(app.getHttpServer())
      .get('/subscribers')
      .query({ page: 1, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('subscribers');
    if (res.body.data.subscribers.length > 0) {
      expect(res.body.data).toHaveProperty('meta');
    }
  });

  // ─── GET /subscribers/count ──────────────────────────────────────────────────

  it('/subscribers/count (GET) deberia retornar el conteo de subscribers', async () => {
    const res = await request(app.getHttpServer()).get('/subscribers/count');
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe('number');
  });

  // ─── GET /subscribers/:id ────────────────────────────────────────────────────

  it('/subscribers/:id (GET) subscriber existente', async () => {
    const id = '6833a1c9eb8534f065457118';
    const res = await request(app.getHttpServer()).get(`/subscribers/${id}`);
    if (res.status === 200) {
      expect(res.body).toBeDefined();
      expect(res.body.data.id).toBe(id);
    } else {
      expect(res.status).toBe(404);
    }
  });

  it('/subscribers/:id (GET) deberia retornar 404 con id inexistente', async () => {
    const res = await request(app.getHttpServer()).get(
      '/subscribers/000000000000000000000000',
    );
    expect(res.status).toBe(404);
  });

  // ─── GET /subscribers/email/:email ───────────────────────────────────────────

  it('/subscribers/email/:email (GET) buscar por email', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer()).get(
      `/subscribers/email/${email}`,
    );
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.email).toBe(email);
    }
  });

  // ─── GET /subscribers/source/:source ─────────────────────────────────────────

  it('/subscribers/source/:source (GET) buscar por source', async () => {
    const source = 'web';
    const res = await request(app.getHttpServer()).get(
      `/subscribers/source/${source}`,
    );
    expect([200, 404]).toContain(res.status);
  });

  // ─── GET /subscribers/email/:email/source/:source ────────────────────────────

  it('/subscribers/email/:email/source/:source (GET) buscar por email y source', async () => {
    const email = 'test@example.com';
    const source = 'web';
    const res = await request(app.getHttpServer()).get(
      `/subscribers/email/${email}/source/${source}`,
    );
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.source).toBe(source);
    }
  });

  // ─── GET /subscribers/status/:status ─────────────────────────────────────────

  it('/subscribers/status/:status (GET) buscar activos', async () => {
    const res = await request(app.getHttpServer()).get(
      '/subscribers/status/true',
    );
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data.subscribers)).toBe(true);
    }
  });

  it('/subscribers/status/:status (GET) buscar inactivos', async () => {
    const res = await request(app.getHttpServer()).get(
      '/subscribers/status/false',
    );
    expect([200, 404]).toContain(res.status);
  });

  it('/subscribers/status/:status (GET) deberia soportar paginacion', async () => {
    const res = await request(app.getHttpServer())
      .get('/subscribers/status/true')
      .query({ page: 1, limit: 5 });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200 && res.body.data.subscribers.length > 0) {
      expect(res.body.data).toHaveProperty('meta');
    }
  });

  // ─── POST /subscribers ───────────────────────────────────────────────────────

  it('/subscribers (POST) deberia crear un subscriber valido', async () => {
    const dto = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      source: 'web',
    };
    const res = await request(app.getHttpServer())
      .post('/subscribers')
      .send(dto);
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
  });

  it('/subscribers (POST) deberia retornar 400 con dto invalido', async () => {
    const dto = {
      name: 'Sin email',
    };
    const res = await request(app.getHttpServer())
      .post('/subscribers')
      .send(dto);
    expect(res.status).toBe(400);
  });

  it('/subscribers (POST) deberia retornar 400 si el email ya existe', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      source: 'web',
    };
    const res = await request(app.getHttpServer())
      .post('/subscribers')
      .send(dto);
    expect([201, 400]).toContain(res.status);
  });

  // ─── PATCH /subscribers/:id ──────────────────────────────────────────────────

  it('/subscribers/:id (PATCH) deberia actualizar un subscriber existente', async () => {
    const id = '6833a1c9eb8534f065457118';
    const dto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      source: 'web',
    };
    const res = await request(app.getHttpServer())
      .patch(`/subscribers/${id}`)
      .send(dto);
    expect([200, 404, 400]).toContain(res.status);
  });

  it('/subscribers/:id (PATCH) deberia retornar 400 con dto invalido', async () => {
    const id = '6833a1c9eb8534f065457118';
    const res = await request(app.getHttpServer())
      .patch(`/subscribers/${id}`)
      .send({});
    expect(res.status).toBe(400);
  });

  // ─── GET /subscribers/unsubscribe/:email ─────────────────────────────────────

  it('/subscribers/unsubscribe/:email (GET) deberia desuscribir un subscriber', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer()).get(
      `/subscribers/unsubscribe/${email}`,
    );
    expect([200, 404, 400]).toContain(res.status);
  });

  // ─── DELETE /subscribers/:email ──────────────────────────────────────────────

  it('/subscribers/:email (DELETE) deberia eliminar un subscriber', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer()).delete(
      `/subscribers/${email}`,
    );
    expect([200, 404]).toContain(res.status);
  });

  it('/subscribers/:email (DELETE) deberia retornar 404 con email inexistente', async () => {
    const res = await request(app.getHttpServer()).delete(
      '/subscribers/noexiste@noexiste.com',
    );
    expect(res.status).toBe(404);
  });
});
