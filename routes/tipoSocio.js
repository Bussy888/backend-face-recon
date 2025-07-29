const express = require('express');
const router = express.Router();
const tiposSocioController = require('../controllers/tiposSocioController');

// CRUD de tipos de socio
router.get('/', tiposSocioController.getAllTiposSocio);
router.post('/', tiposSocioController.createTipoSocio);
router.put('/:id', tiposSocioController.updateTipoSocio);
router.delete('/:id', tiposSocioController.deleteTipoSocio);

module.exports = router;
