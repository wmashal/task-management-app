const request = require('supertest');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

const { app, initializePool } = require('../server');

describe('Task API', () => {
  let mockPool;
  let mockQuery;

  beforeAll(() => {
    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
    };
    mysql.createPool.mockReturnValue(mockPool);
    initializePool();
  });

  beforeEach(() => {
    mockQuery.mockClear();
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', description: 'Description 1' }];
      mockQuery.mockResolvedValueOnce([mockTasks]);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM tasks');
    });

    it('should handle errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'New Task', description: 'New Description' };
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app)
          .post('/tasks')
          .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(mockQuery).toHaveBeenCalledWith(
          'INSERT INTO tasks (title, description) VALUES (?, ?)',
          [newTask.title, newTask.description]
      );
    });

    it('should handle errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
          .post('/tasks')
          .send({ title: 'New Task', description: 'New Description' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a specific task', async () => {
      const mockTask = { id: 1, title: 'Task 1', description: 'Description 1' };
      mockQuery.mockResolvedValueOnce([[mockTask]]);

      const response = await request(app).get('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTask);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ?', ['1']);
    });

    it('should return 404 if task not found', async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const response = await request(app).get('/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const updatedTask = { title: 'Updated Task', description: 'Updated Description' };
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
          .put('/tasks/1')
          .send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(mockQuery).toHaveBeenCalledWith(
          'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
          [updatedTask.title, updatedTask.description, '1']
      );
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', ['1']);
    });
  });
});