// backend/tests/tasks.test.js

const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');

// Mock mysql
jest.mock('mysql2/promise');

const app = require('../server'); // Adjust this path if necessary

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /tasks should return all tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1' },
      { id: 2, title: 'Task 2', description: 'Description 2' },
    ];

    mysql.createPool.mockReturnValue({
      query: jest.fn().mockResolvedValue([mockTasks]),
    });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTasks);
  });

  test('POST /tasks should create a new task', async () => {
    const newTask = { title: 'New Task', description: 'New Description' };
    const mockInsertResult = { insertId: 3 };

    mysql.createPool.mockReturnValue({
      query: jest.fn().mockResolvedValue([mockInsertResult]),
    });

    const response = await request(app)
      .post('/tasks')
      .send(newTask);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 3,
      message: 'Task created successfully',
    });
  });

  test('DELETE /tasks/:id should delete a task', async () => {
    mysql.createPool.mockReturnValue({
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
    });

    const response = await request(app).delete('/tasks/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Task deleted successfully',
    });
  });

  test('PUT /tasks/:id should update a task', async () => {
    const updatedTask = { title: 'Updated Task', description: 'Updated Description' };

    mysql.createPool.mockReturnValue({
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
    });

    const response = await request(app)
      .put('/tasks/1')
      .send(updatedTask);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Task updated successfully',
    });
  });
});
