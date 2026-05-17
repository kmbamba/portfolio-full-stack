process.env.NODE_ENV = 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const TEST_DB_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/portfolio_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
}, 30000);

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.disconnect();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}, 15000);

// ─── Tests createProject ───
describe('POST /api/projects', () => {
  test('doit créer un projet avec succès', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ titre: 'Mon Projet Test', description: 'Description du projet', technologies: ['React', 'Node.js'] });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titre).toBe('Mon Projet Test');
  });

  test('doit échouer si titre manquant', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ description: 'Description', technologies: ['React'] });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('doit échouer si description manquante', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ titre: 'Mon Projet', technologies: ['React'] });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Tests getAllProjects ───
describe('GET /api/projects', () => {
  test('doit retourner une liste vide', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  test('doit retourner les projets créés', async () => {
    await request(app).post('/api/projects')
      .send({ titre: 'Projet 1', description: 'Description 1', technologies: ['React'] });
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
  });
});

// ─── Tests getProjectById ───
describe('GET /api/projects/:id', () => {
  test('doit retourner un projet par ID', async () => {
    const created = await request(app).post('/api/projects')
      .send({ titre: 'Projet Test', description: 'Description', technologies: ['Node.js'] });
    const id = created.body.data._id;
    const res = await request(app).get(`/api/projects/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  test('doit retourner 404 si projet inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/projects/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── Tests deleteProject ───
describe('DELETE /api/projects/:id', () => {
  test('doit supprimer un projet (soft delete)', async () => {
    const created = await request(app).post('/api/projects')
      .send({ titre: 'Projet à supprimer', description: 'Description', technologies: ['Docker'] });
    const id = created.body.data._id;
    const res = await request(app).delete(`/api/projects/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});