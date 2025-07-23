const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
});

db.connect(err => {
  if (err) {
    console.error('❌ Error de conexión DB:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

module.exports = db;
