// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const db = require('./db');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./socios-circulo-firebase-adminsdk-fbsvc-680ba0eedf.json')),
});

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Rutas
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


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
