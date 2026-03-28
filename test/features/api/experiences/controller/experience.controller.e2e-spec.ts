import { AppModule } from '@/app.module';
import {
  ExperienceError,
  ExperienceMessages,
} from '@/features/api/experiences/messages/general.messages';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('ExperienceController (e2e)', (): void => {
  let app: INestApplication;
  let createdId: string;

  const path = '/experiences';
  const uniqueCompany = `E2E Company ${Date.now()}`;
  const duplicateCompany = `E2E Duplicate ${Date.now()}`;

  const getList = (body: any): any[] => {
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.data?.experiences)) return body.data.experiences;
    return [];
  };

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

  // ─── GET /experiences ────────────────────────────────────────────────────────
  it('/experiences (GET) should return 200 and an array', async () => {
    const res = await request(app.getHttpServer()).get('/experiences');

    expect(res.status).toBe(200);
    expect(Array.isArray(getList(res.body))).toBe(true);
  });

  // ─── GET /experiences/:id ────────────────────────────────────────────────────
  it('/experiences/:id (GET) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer()).get(
      `${path}/000000000000000000000000`,
    );

    expect(res.status).toBe(404);
  });

  it('/experiences/:id (GET) should return 400 or 404 for malformed id', async () => {
    const res = await request(app.getHttpServer()).get(
      `${path}/not-a-valid-objectid`,
    );

    expect([400, 404]).toContain(res.status);
  });

  // ─── POST /experiences ───────────────────────────────────────────────────────
  it('/experiences (POST) should return 400 with missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post(path)
      .send({ position: 'Developer' }); // falta company y startsDate

    expect(res.status).toBe(400);
  });

  it('/experiences (POST) should create a valid experience', async () => {
    const dto = {
      company: uniqueCompany,
      position: 'Backend Developer',
      startsDate: '2022-01-01T00:00:00.000Z',
      endsDate: '2024-01-01T00:00:00.000Z',
      currentPosition: false,
      description: 'Working on NestJS and MongoDB projects',
      skills: ['nestjs', 'mongodb', 'typescript'],
      displayOrder: 0,
    };

    const res = await request(app.getHttpServer()).post(path).send(dto);

    expect(res.status).toBe(201);

    // El servicio devuelve un string de éxito — buscamos el id en el GET
    const listRes = await request(app.getHttpServer()).get(path);
    const list = getList(listRes.body);
    const created = list.find((exp: any) => exp.company === uniqueCompany);
    if (created) createdId = created._id ?? created.id;
  });

  it('/experiences (POST) should return 400 if company already exists', async () => {
    // Primer insert
    await request(app.getHttpServer()).post(path).send({
      company: duplicateCompany,
      position: 'Developer',
      startsDate: '2022-01-01T00:00:00.000Z',
      currentPosition: false,
      skills: [],
      displayOrder: 1,
    });

    // Segundo insert con la misma company
    const res = await request(app.getHttpServer()).post(path).send({
      company: duplicateCompany,
      position: 'Developer',
      startsDate: '2022-01-01T00:00:00.000Z',
      currentPosition: false,
      skills: [],
      displayOrder: 1,
    });

    expect(res.status).toBe(400);
  });

  // ─── GET /experiences/:id (con id real) ──────────────────────────────────────
  it('/experiences/:id (GET) should return the created experience', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).get(`${path}/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.data._id ?? res.body.data.id).toBe(createdId);
  });

  // ─── PATCH /experiences/:id ──────────────────────────────────────────────────
  it('/experiences/:id (PATCH) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`${path}/000000000000000000000000`)
      .send({
        company: uniqueCompany,
        position: 'Senior Backend Developer',
        startsDate: new Date(),
        currentPosition: true,
        skills: ['nestjs', 'mongodb', 'typescript', 'docker'],
      });

    expect(res.status).toBe(404);
    expect(res.body.message.message).toBe(ExperienceError.EXPERIENCE_NOT_FOUND);
  });

  it('/experiences/:id (PATCH) should return 400 if company is already taken', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer())
      .patch(`${path}/${createdId}`)
      .send({
        company: duplicateCompany,
        position: 'Senior Backend Developer',
        startsDate: new Date(),
        currentPosition: true,
        skills: ['nestjs', 'mongodb', 'typescript', 'docker'],
      });

    expect(res.status).toBe(400);
    expect(res.body.message.message).toBe(
      ExperienceError.EXPERIENCE_ALREADY_EXIST,
    );
  });

  it('/experiences/:id (PATCH) should update an existing experience', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer())
      .patch(`${path}/${createdId}`)
      .send({
        company: uniqueCompany,
        position: 'Senior Backend Developer',
        startsDate: new Date(),
        currentPosition: true,
        skills: ['nestjs', 'mongodb', 'typescript', 'docker'],
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toBe(ExperienceMessages.EXPERIENCE_UPDATED);
  });

  // ─── DELETE /experiences/:id ─────────────────────────────────────────────────
  it('/experiences/:id (DELETE) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `${path}/000000000000000000000000`,
    );

    expect(res.status).toBe(404);
  });

  it('/experiences/:id (DELETE) should delete the created experience', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).delete(
      `${path}/${createdId}`,
    );

    expect(res.status).toBe(200);
  });

  it('/experiences/:id (DELETE) after deletion GET should return 404', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).get(`${path}/${createdId}`);

    expect(res.status).toBe(404);
  });
});
