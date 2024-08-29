const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let pool;

const initializePool = () => {
    pool = mysql.createPool({
        host: 'mysql',
        user: 'root',
        password: 'rootpassword',
        database: 'taskdb',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

// Only initialize the pool if it hasn't been initialized yet
if (!pool) {
    initializePool();
}

app.get('/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description]);
        res.status(201).json({ id: result.insertId, message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/tasks/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Task not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { title, description } = req.body;
    try {
        await pool.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id]);
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

// Export for testing
module.exports = { app, initializePool };