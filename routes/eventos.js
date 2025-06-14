const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');

router.get('/', eventosController.getEventos);
router.post('/', eventosController.createEvento);
router.put('/:id', eventosController.updateEvento);
router.delete('/:id', eventosController.deleteEvento);
router.post('/enviar-correo', eventosController.enviarCorreo);
router.get('/:id', eventosController.getEventoById); // para la edición
module.exports = router;
