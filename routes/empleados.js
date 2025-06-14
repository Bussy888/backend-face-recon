// routes/empleados.js
const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');

router.post('/agregarEmpleado', empleadosController.agregarEmpleado);
router.get('/', empleadosController.getEmpleados);
router.get('/:email', empleadosController.getEmpleadoByEmail);
// Asegúrate de agregar el endpoint en tu archivo de rutas:
router.put('/:correo', empleadosController.actualizarEmpleado);
router.delete('/:id_empleado', empleadosController.eliminarEmpleado);
module.exports = router;
