// routes/permisosRoutes.js
const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisosController');

// Obtener permisos de un rol
router.get('/:id_rol', permisosController.getPermissionsByRole);

// Asociar permisos a un rol
router.post('/:id_rol/permisos', permisosController.assignPermissionsToRole);

router.get('/', permisosController.getAllPermissions);
module.exports = router;
