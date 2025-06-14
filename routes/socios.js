// routes/socios.js
const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/sociosController');

router.post('/register-socio', sociosController.registerSocio);
router.get('/get-users', sociosController.getUsers);
router.post('/register-invitado', sociosController.registerInvitado);
router.post('/register-entry', sociosController.registerEntry);
router.get('/get-cuotas', sociosController.getCuotas);
router.put('/update-cuota', sociosController.updateCuota);
router.get('/verify-socio/:codigo', sociosController.verifySocio);
router.put('/update-face-descriptor', sociosController.updateFaceDescriptor);

router.get('/get-socio/:codigo', sociosController.getSocioByCodigo);
router.put('/update-socio/:codigo', sociosController.updateSocioByCodigo);
router.delete('/delete-socio/:codigo', sociosController.deleteSocioByCodigo);
router.get('/get-users-with-payments', sociosController.getUsersWithPayments);

module.exports = router;
