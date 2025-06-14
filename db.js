// db.js
const mysql = require('mysql2');
require('dotenv').config(); // Asegúrate de cargar las variables .env

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT, // importante: Railway usa un puerto personalizado
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to the database:', err);
    return;
  }
  console.log('✅ Connected to the database.');
});

module.exports = db;
