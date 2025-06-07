require('dotenv').config();
console.log("🌍 .env loaded");

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

console.log("🚀 Connecting to DB...");

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  } else {
    console.log("✅ MySQL connected...");
  }
});

app.get('/', (req, res) => {
  res.send('🔥 Backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is live at port ${PORT}`);
});
