// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const db = require('./db'); // Ajusta la ruta si está en otro lado

// Inicializa Firebase
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
  throw new Error('Firebase service account JSON malformado');
}

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rutas reales
app.get('/api/ping', (_req, res) => res.json({ ok: true })); // Ruta para prueba

// Importa tus rutas
app.use('/api/socios', require('./routes/socios'));
app.use('/api/empleado', require('./routes/empleados.js'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/entradas', require('./routes/entradas'));
app.use('/api/permisos', require('./routes/permisos'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/reportesAcceso', require('./routes/reportesAcceso'));

// Ruta por defecto (404)
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = app; // ¡Esto es lo que Vercel espera!
