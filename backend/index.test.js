const request = require('supertest');
const app = require('./index');

describe('GET /tasks', () => {
    it('responds with json containing a list of products', async () => {
        const response = await request(app).get('/tasks');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
});