import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
import request = require('supertest');
import * as path from 'path';
import { Types } from 'mongoose';

describe('ProjectImageController (e2e)', () => {
  let app: INestApplication;
  let createdImageId: string;

  const basePath = '/images';
  const projectId = new Types.ObjectId();

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

  // ─── GET /images/:projectId ───────────────────────────────────────────────
  it('/images/:projectId (GET) should return 200 and array', async () => {
    const res = await request(app.getHttpServer()).get(
      `${basePath}/${projectId}`,
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data ?? res.body)).toBe(true);
  });

  // ─── POST /images ─────────────────────────────────────────────────────────
  it('/images (POST) should return 400 if no file is sent', async () => {
    const res = await request(app.getHttpServer())
      .post(basePath)
      .field('projectId', projectId.toHexString());

    expect(res.status).toBe(400);
  });

  it('/images (POST) should upload an image', async () => {
    const filePath = path.join(__dirname, 'test-files', 'test-image.png');

    const res = await request(app.getHttpServer())
      .post(basePath)
      .field('projectId', projectId.toHexString())
      .field('projectName', 'test image')
      .attach('file', filePath, {
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);

    // dependiendo tu response
    createdImageId =
      res.body?.data?._id ??
      res.body?.data?.id ??
      res.body?._id ??
      res.body?.id;
  });

  it('/images (POST) should reject invalid file type', async () => {
    const filePath = path.join(__dirname, 'test-files', 'test.txt');

    const res = await request(app.getHttpServer())
      .post(basePath)
      .field('projectId', projectId.toHexString())
      .attach('file', filePath);

    expect(res.status).toBe(400);
  });

  // ─── DELETE /images/:id ───────────────────────────────────────────────────
  it('/images/:id (DELETE) should return 404 for non-existent id', async () => {
    const res = await request(app.getHttpServer()).delete(
      `${basePath}/000000000000000000000000`,
    );

    expect(res.status).toBe(404);
  });

  it('/images/:id (DELETE) should delete uploaded image', async () => {
    if (!createdImageId) return;

    const res = await request(app.getHttpServer()).delete(
      `${basePath}/${createdImageId}`,
    );

    expect(res.status).toBe(200);
  });

  // ─── DELETE /images/all/:projectId ────────────────────────────────────────
  it('/images/all/:projectId (DELETE) should delete all images of project', async () => {
    const res = await request(app.getHttpServer()).delete(
      `${basePath}/all/${projectId}`,
    );

    expect(res.status).toBe(200);
  });

  // ─── GET after delete ─────────────────────────────────────────────────────
  it('/images/:projectId (GET) after delete should return empty array', async () => {
    const res = await request(app.getHttpServer()).get(
      `${basePath}/${projectId}`,
    );

    expect(res.status).toBe(200);
    const list = res.body?.data ?? res.body;
    expect(Array.isArray(list)).toBe(true);
  });
});
