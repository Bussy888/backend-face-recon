const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisosController');

// CRUD de permisos
router.get('/', permisosController.getAllPermissions);
router.post('/', permisosController.createPermission);
router.put('/:id', permisosController.updatePermission);
router.delete('/:id', permisosController.deletePermission);

// Permisos por rol
router.get('/:id_rol/permisos', permisosController.getPermissionsByRole);
router.post('/:id_rol/permisos', permisosController.assignPermissionsToRole);

module.exports = router;
