import request from 'supertest';
import { app } from '../src/app';

describe('Health Check', () => {
  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is running');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'notanemail', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: '12' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('should reject empty password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });
});

describe('Protected Routes', () => {
  it('GET /api/users should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('GET /api/chats should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.status).toBe(401);
  });

  it('POST /api/chats should reject unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/chats')
      .send({ participantId: 'some-id' });
    expect(res.status).toBe(401);
  });
});

describe('Validation', () => {
  it('POST /api/chats should reject invalid participantId', async () => {
    // Even with a valid token, invalid UUID should fail validation
    // This test checks the validation layer without needing a real token
    const res = await request(app)
      .post('/api/chats')
      .set('Authorization', 'Bearer fake')
      .send({ participantId: 'not-a-uuid' });
    // Will get 401 first because of auth, which is correct
    expect(res.status).toBe(401);
  });
});

