import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import * as path from 'path';
import { CreateNewProjectDto } from '@/features/api/projects/dto/create-project.dto';
import { InsertOrUpdateProjectTecDto } from '@/features/api/projects-technologies/dto/insert-update.dto';
import { Types } from 'mongoose';
import { InsertOrUpdateProjectFeatDto } from '@/features/api/projects-features/dto/insert-update.dto';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;
  let createdSlug: string;

  const basePath = '/projects';

  const filePath = path.join(__dirname, 'test-files', 'test-image.png');

  const projectTechnologies: InsertOrUpdateProjectTecDto[] = [
    {
      name: 'Angular',
      category: 'Frontend',
      projectId: new Types.ObjectId(),
    },
    {
      name: 'NestJS',
      category: 'Backend',
      projectId: new Types.ObjectId(),
    },
    {
      name: 'PostgreSQL',
      category: 'Base de datos',
      projectId: new Types.ObjectId(),
    },
  ];

  const projectFeatures: InsertOrUpdateProjectFeatDto[] = [
    {
      description: 'Angular',
      displayOrder: 1,
      projectId: new Types.ObjectId(),
    },
    {
      description: 'NestJS',
      displayOrder: 2,
      projectId: new Types.ObjectId(),
    },
    {
      description: 'PostgreSQL',
      displayOrder: 3,
      projectId: new Types.ObjectId(),
    },
  ];

  const dto: CreateNewProjectDto = {
    title: `E2E Project - ${Date.now()}`,
    summary: 'pepeppepepe',
    description: 'Test project',
    isFeatured: 0,
    publishedDate: '19/04/2026',
    projectTechnologies: projectTechnologies,
    projectFeatures: projectFeatures,
  };

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

  // ─── GET /projects ───────────────────────────────────────────────
  it('/projects (GET) should return 200 and array', async () => {
    const res = await request(app.getHttpServer()).get(basePath);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data ?? res.body)).toBe(true);
  });

  // ─── POST /projects ──────────────────────────────────────────────
  it('/projects (POST) should return 400 without file', async () => {
    const res = await request(app.getHttpServer()).post(basePath).send(dto);

    expect(res.status).toBe(400);
  });

  it('/projects (POST) should create project', async () => {
    const res = await request(app.getHttpServer())
      .post(basePath)
      .field('title', dto.title)
      .field('summary', dto.summary)
      .field('publishedDate', dto.publishedDate)
      .field('isFeatured', String(dto.isFeatured))
      .field('description', dto.description)
      .field('projectFeatures', JSON.stringify(dto.projectFeatures))
      .field('projectTechnologies', JSON.stringify(dto.projectTechnologies))
      .attach('file', filePath, {
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);

    const data = res.body?.data ?? res.body;

    createdId = data?._id ?? data?.id;
    createdSlug = data?.slug;
  });

  //   message: 'Oops... There is slug already is taken',

  it('/projects (POST) should failed to create project by slug duplicate', async () => {
    const res = await request(app.getHttpServer())
      .post(basePath)
      .field('title', 'E2E Project')
      .field('summary', dto.summary)
      .field('publishedDate', dto.publishedDate)
      .field('isFeatured', String(dto.isFeatured))
      .field('description', dto.description)
      .field('projectFeatures', JSON.stringify(dto.projectFeatures))
      .field('projectTechnologies', JSON.stringify(dto.projectTechnologies))
      .attach('file', filePath, {
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);

    const data = res.body?.data ?? res.body;

    createdId = data?._id ?? data?.id;
    createdSlug = data?.slug;
  });

  // ─── GET /projects/:slug ─────────────────────────────────────────
  it('/projects/:slug (GET) should return project', async () => {
    if (!createdSlug) return;

    const res = await request(app.getHttpServer()).get(
      `${basePath}/${createdSlug}`,
    );

    expect(res.status).toBe(200);
  });

  it('/projects/:slug (GET) should return 404 for non-existent slug', async () => {
    const res = await request(app.getHttpServer()).get(
      `${basePath}/non-existent-slug`,
    );

    expect(res.status).toBe(404);
  });

  // ─── GET /projects/p/:id ─────────────────────────────────────────
  it('/projects/p/:id (GET) should return project', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).get(
      `${basePath}/p/${createdId}`,
    );

    expect(res.status).toBe(200);
  });

  it('/projects/p/:id (GET) should return 404 for invalid id', async () => {
    const res = await request(app.getHttpServer()).get(
      `${basePath}/p/000000000000000000000000`,
    );

    expect(res.status).toBe(404);
  });

  // ─── PATCH /projects/:id ─────────────────────────────────────────
  it('/projects/:id (PATCH) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`${basePath}/000000000000000000000000`)
      .send({
        title: 'Updated',
      });

    expect(res.status).toBe(404);
  });

  it('/projects/:id (PATCH) should update project without file', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer())
      .patch(`${basePath}/${createdId}`)
      .send({
        title: 'Updated Project',
      });

    expect(res.status).toBe(200);
  });

  it('/projects/:id (PATCH) should update project with file', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer())
      .patch(`${basePath}/${createdId}`)
      .field('title', 'Updated With Image')
      .attach('file', filePath, {
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
  });

  // ─── DELETE /projects/:id ────────────────────────────────────────
  it('/projects/:id (DELETE) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `${basePath}/000000000000000000000000`,
    );

    expect(res.status).toBe(404);
  });

  it('/projects/:id (DELETE) should delete project', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).delete(
      `${basePath}/${createdId}`,
    );

    expect(res.status).toBe(200);
  });

  it('/projects/:id after delete should return 404', async () => {
    if (!createdId) return;

    const res = await request(app.getHttpServer()).get(
      `${basePath}/p/${createdId}`,
    );

    expect(res.status).toBe(404);
  });
});
