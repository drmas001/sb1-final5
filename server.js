import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1); // Exit the process if unable to connect to the database
  }
};

testDatabaseConnection();

// API Routes
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, mrn, age, gender, diagnosis, admissionDate, specialty, assignedDoctor } = req.body;
    const [result] = await pool.query(
      'INSERT INTO patients (name, mrn, age, gender, diagnosis, admissionDate, specialty, assignedDoctor, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, mrn, age, gender, diagnosis, admissionDate, specialty, assignedDoctor, 'Active']
    );
    const newPatient = { id: result.insertId, ...req.body, status: 'Active' };
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const [result] = await pool.query('UPDATE patients SET ? WHERE id = ?', [updates, id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Patient not found' });
    } else {
      const [updatedPatient] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
      res.json(updatedPatient[0]);
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    let query = 'SELECT * FROM medical_notes WHERE patientId = ?';
    const queryParams = [id];
    if (date) {
      query += ' AND DATE(date) = ?';
      queryParams.push(date);
    }
    const [notes] = await pool.query(query, queryParams);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching medical notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { patientId, date, note, user } = req.body;
    const [result] = await pool.query(
      'INSERT INTO medical_notes (patientId, date, note, user) VALUES (?, ?, ?, ?)',
      [patientId, date, note, user]
    );
    const newNote = { id: result.insertId, ...req.body };
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error adding medical note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for any other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});