
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 5;

app.use(cors());
app.use(bodyParser.json());

// Database connection with retry logic
function connectToDatabase(retries = 0) {
  console.log("🚀 Connecting to DB...");

  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  db.connect((err) => {
    if (err) {
      console.error(`❌ DB connection failed (attempt ${retries + 1}):`, err.message);
      if (retries < MAX_RETRIES) {
        setTimeout(() => connectToDatabase(retries + 1), 3000);
      } else {
        console.error("❌ Max DB retries reached. Exiting...");
        process.exit(1);
      }
    } else {
      console.log("✅ DB Connected successfully!");
      setupRoutes(db);
      app.listen(PORT, () => {
        console.log(`🌍 Server is live at port ${PORT}`);
      });
    }
  });
}

// All backend routes
function setupRoutes(db) {
  app.get('/', (req, res) => {
    res.send('🔥 Backend is running!');
  });

  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, balance) VALUES (?, ?, 0)', [username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'User already exists or DB error' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });

  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET);
      res.json({ token });
    });
  });

  app.post('/order', (req, res) => {
    const { token, service, link, quantity } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      db.query('INSERT INTO orders (user_id, service, link, quantity, status) VALUES (?, ?, ?, ?, ?)', [userId, service, link, quantity, 'Pending'], (err) => {
        if (err) return res.status(500).json({ message: 'Order failed' });
        res.status(200).json({ message: 'Order placed successfully' });
      });
    } catch (e) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
}

connectToDatabase();
