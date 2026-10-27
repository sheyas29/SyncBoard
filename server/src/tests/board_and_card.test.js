import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import app from '../app.js';
import User from '../models/User.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';

let mongoServer;
let userAToken;
let userBToken;
let userAId;
let userBId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Mock socket.io on app
  const mockIo = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };
  app.set('io', mockIo);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Board.deleteMany({});
  await Card.deleteMany({});

  // Setup User A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'Alice Owner',
    email: 'alice@example.com',
    password: 'password123',
  });
  userAToken = resA.body.data.token;
  userAId = resA.body.data._id;

  // Setup User B (unauthorized third-party)
  const resB = await request(app).post('/api/auth/register').send({
    name: 'Bob Outsider',
    email: 'bob@example.com',
    password: 'password123',
  });
  userBToken = resB.body.data.token;
  userBId = resB.body.data._id;
});

describe('Boards & Cards Operations & Security Tests', () => {
  test('POST /api/boards - creates a board with default columns', async () => {
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Project Roadmap',
        description: 'Sprint planning board',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Project Roadmap');
    expect(res.body.data.columns).toHaveLength(3);
    expect(res.body.data.owner._id.toString()).toBe(userAId);
  });

  test('GET /api/boards/:id - rejects unauthorized user from viewing private board', async () => {
    // User A creates board
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Top Secret Project' });
    const boardId = boardRes.body.data._id;

    // User B tries to access it
    const unauthorizedRes = await request(app)
      .get(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);
    expect(unauthorizedRes.body.message).toContain('Forbidden');
  });

  test('POST /api/cards - creates task card and assigns order', async () => {
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Dev Board' });
    const boardId = boardRes.body.data._id;

    const cardRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        boardId,
        title: 'Build Login Form',
        description: 'Include validation and error messages',
        status: 'todo',
        priority: 'high',
      });

    expect(cardRes.status).toBe(201);
    expect(cardRes.body.success).toBe(true);
    expect(cardRes.body.data.title).toBe('Build Login Form');
    expect(cardRes.body.data.status).toBe('todo');
    expect(cardRes.body.data.order).toBe(0);
  });

  test('PATCH /api/cards/:id/move - moves card from todo to in_progress and updates state', async () => {
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Kanban Board' });
    const boardId = boardRes.body.data._id;

    const cardRes = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        boardId,
        title: 'Setup WebSockets',
        status: 'todo',
      });
    const cardId = cardRes.body.data._id;

    const moveRes = await request(app)
      .patch(`/api/cards/${cardId}/move`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        destinationStatus: 'in_progress',
        destinationIndex: 0,
      });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.success).toBe(true);
    expect(moveRes.body.data.status).toBe('in_progress');

    // Verify persistence in DB
    const fetched = await Card.findById(cardId);
    expect(fetched.status).toBe('in_progress');
  });

  test('DELETE /api/boards/:id - cascades delete to all associated cards', async () => {
    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Temp Board' });
    const boardId = boardRes.body.data._id;

    // Create 2 cards
    await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ boardId, title: 'Card 1' });
    await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ boardId, title: 'Card 2' });

    expect(await Card.countDocuments({ board: boardId })).toBe(2);

    // Delete board
    const delRes = await request(app)
      .delete(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);
    expect(await Board.findById(boardId)).toBeNull();
    expect(await Card.countDocuments({ board: boardId })).toBe(0);
  });
});
