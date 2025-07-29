// routes/entradasRoutes.js
const express = require('express');
const router = express.Router();
const entradasController = require('../controllers/entradasController');

// Registrar la entrada de un socio
router.post('/register-entry', entradasController.registerSocioEntry);

// Registrar la entrada de invitados
router.post('/register-invitado', entradasController.registerInvitadoEntry);

router.post('/manual', entradasController.registerManualEntry);
router.get('/ultimas', entradasController.getUltimasEntradas);
module.exports = router;
