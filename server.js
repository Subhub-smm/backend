require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

console.log('🌍 .env loaded');
console.log('🚀 Connecting to DB...');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ MySQL connected...');
  }
});

app.get('/', (req, res) => {
  res.send('🔥 Backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is live at port ${PORT}`);
});
