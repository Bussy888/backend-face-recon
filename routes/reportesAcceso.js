const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Rutas
router.get('/resumen', reportesController.obtenerResumen);
router.get('/visitas', reportesController.visitasPorPeriodo); // Esta ruta acepta query string (periodo=dia|semana|mes)
router.get('/exportar', reportesController.exportarExcel);
router.get('/ingresosHoy', reportesController.obtenerIngresosHoy);
router.get('/pagosPorMes', reportesController.pagosPorMes);
router.get('/pagosPorTipoSocio', reportesController.pagosPorTipoSocio);
router.get('/exportarPagos', reportesController.exportarPagosExcel);

module.exports = router;
