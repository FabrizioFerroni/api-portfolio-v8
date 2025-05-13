import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import {
  UserError,
  UserMessages,
} from '@/features/api/user/messages/general.messages';
import { CreateUserDto } from '@/features/api/user/dto/create.dto';
import { Types } from 'mongoose';

const userEmail = `e2e-${Date.now()}@example.com`;

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) crea un usuario', async () => {
    const data: CreateUserDto = {
      name: 'Fabri',
      lastname: 'Test',
      email: userEmail,
      password: 'Password123#',
      password_verify: 'Password123#',
    };
    const res = await request(server).post('/users').send(data).expect(201);

    expect(res.body.data).toBe(UserMessages.USER_CREATED);
  });

  it('/users (POST) debiera dar error al crear un usuario con email existente', async () => {
    const data: CreateUserDto = {
      name: 'Fabri',
      lastname: 'Test',
      email: userEmail,
      password: 'Password123#',
      password_verify: 'Password123#',
    };
    const res = await request(server).post('/users').send(data).expect(400);
    expect(res.body.message.message).toBe(UserError.USER_ALREADY_EXIST);
  });

  it('/users (GET) devuelve todos los usuarios', async () => {
    const res = await request(server).get('/users').expect(200);

    const user = res.body.data.find((u) => u.email === userEmail);
    expect(user).toBeDefined();

    createdUserId = user.id;

    expect(createdUserId).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/users/:id (GET) devuelve un usuario por ID', async () => {
    const res = await request(server)
      .get(`/users/${createdUserId}`)
      .expect(200);
    expect(res.body.data.email).toBe(userEmail);
  });

  it('/users/:id (GET) debiera dar un 404 porque no encontro un usuario por ID', async () => {
    const userId = new Types.ObjectId().toString();
    const res = await request(server).get(`/users/${userId}`).expect(404);
    expect(res.body.message.message).toBe(UserError.USER_NOT_FOUND);
  });

  it('/users/em/:email (GET) devuelve un usuario por su correo', async () => {
    const res = await request(server).get(`/users/em/${userEmail}`).expect(200);
    expect(res.body.data.email).toBe(userEmail);
  });

  it('/users/em/:email (GET) devuelve 404 porque no encontro un usuario por su correo', async () => {
    const res = await request(server)
      .get(`/users/em/e2e-${Date.now()}@example.com`)
      .expect(404);
    expect(res.body.message.message).toBe(UserError.USER_NOT_FOUND);
  });

  it('/users/:id (PATCH) actualiza un usuario', async () => {
    const res = await request(server)
      .patch(`/users/${createdUserId}`)
      .send({ name: 'Fabri Updated' })
      .expect(200);

    expect(res.body.data).toBe(UserMessages.USER_UPDATED);
  });

  it('/users/:id (DELETE) elimina un usuario', async () => {
    const res = await request(server)
      .delete(`/users/${createdUserId}`)
      .expect(200);

    expect(res.body.data).toBe(UserMessages.USER_REMOVED);
  });
});
