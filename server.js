// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const serverless = require('serverless-http');
const db = require('./db');

const admin = firebaseAdmin;

// Intenta cargar el JSON de la variable de entorno
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Importa las rutas
const sociosRoutes = require('./routes/socios');
const empleadosRoutes = require('./routes/empleados.js');
const rolesRoutes = require('./routes/roles');
const entradasRoutes = require('./routes/entradas');
const permisosRoutes = require('./routes/permisos');
const eventosRoutes = require('./routes/eventos');
const reportesAccesoRoutes = require('./routes/reportesAcceso');

app.use('/api/socios', sociosRoutes);
app.use('/api/empleado', empleadosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/reportesAcceso', reportesAccesoRoutes);

console.log('Vercel env var:', process.env.VERCEL);

// Ejecutar servidor localmente solo si NO está en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Exporta handler para Vercel
module.exports.handler = serverless(app);
