const path = require('path');
const request = require('supertest');
const jsonServer = require('json-server');

function createApp() {
  const app = jsonServer.create();
  const router = jsonServer.router(path.join(__dirname, '../../server/db.json'));
  const middlewares = jsonServer.defaults();

  app.use(middlewares); // incluye body-parser, CORS, etc.
  app.use('/api', router);

  return app;
}

describe('API Integration (json-server via /api)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('GET /api/users returns demo user', async () => {
    const res = await request(app).get('/api/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const demo = res.body.find(u => u.email === 'demo@nutritrack.com');
    expect(demo).toBeTruthy();
    expect(demo.dailyGoals).toMatchObject({
      calories: expect.any(Number),
      protein: expect.any(Number),
      carbs: expect.any(Number),
      fat: expect.any(Number),
    });
  });

  test('GET /api/meals returns at least one meal', async () => {
    const res = await request(app).get('/api/meals').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const meal = res.body[0];
    expect(meal).toHaveProperty('foods');
    expect(Array.isArray(meal.foods)).toBe(true);
    expect(meal).toHaveProperty('calories');
  });

  test('POST /api/workouts creates a new workout', async () => {
    const payload = {
      name: 'Prueba Integración',
      type: 'cardio',
      duration: 10,
      caloriesBurned: 100,
      dateTime: new Date().toISOString(),
      notes: 'Test desde supertest',
    };

    const res = await request(app)
      .post('/api/workouts')
      .send(payload)
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(res.body).toMatchObject(payload);
    expect(res.body).toHaveProperty('id');

    // Verificar que ahora existe en la colección
    const list = await request(app).get('/api/workouts').expect(200);
    const created = list.body.find(w => w.id === res.body.id);
    expect(created).toBeTruthy();
  });
});