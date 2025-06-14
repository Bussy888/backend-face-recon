// controllers/permisosController.js
const db = require('../db');

// Obtener permisos de un rol
exports.getPermissionsByRole = (req, res) => {
  const { id_rol } = req.params;

  const query = `
    SELECT p.nombre_permiso
    FROM permisos p
    JOIN roles_Permisos rp ON p.id_permiso = rp.id_permiso
    WHERE rp.id_rol = ?
  `;

  db.query(query, [id_rol], (err, results) => {
    if (err) {
      console.error('Error al obtener permisos:', err);
      return res.status(500).json({ message: 'Error al obtener permisos', error: err });
    }

    const permisos = results.map(result => result.nombre_permiso);
    res.json({ permisos });
  });
};

// Asociar permisos a un rol
exports.assignPermissionsToRole = (req, res) => {
  const { id_rol } = req.params;
  const { permisos } = req.body;

  permisos.forEach(permiso => {
    const query = 'SELECT id_permiso FROM permisos WHERE nombre_permiso = ?';

    db.query(query, [permiso], (err, results) => {
      if (err) {
        console.error('Error al obtener permiso:', err);
        return res.status(500).json({ message: 'Error al obtener el permiso', error: err });
      }

      if (results.length > 0) {
        const permisoId = results[0].id_permiso;

        const insertQuery = 'INSERT INTO roles_Permisos (id_rol, id_permiso) VALUES (?, ?)';
        
        db.query(insertQuery, [id_rol, permisoId], (err) => {
          if (err) {
            console.error('Error al asociar permiso al rol:', err);
            return res.status(500).json({ message: 'Error al asociar permiso', error: err });
          }
        });
      }
    });
  });

  res.status(200).json({ message: 'Permisos asignados correctamente al rol' });
};

exports.getPermissionsByRole = (req, res) => {
  const { id_rol } = req.params;

  const query = `
    SELECT p.nombre_permiso
    FROM permisos p
    JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
    WHERE rp.id_rol = ?
  `;

  db.query(query, [id_rol], (err, results) => {
    if (err) {
      console.error('Error al obtener permisos:', err);
      return res.status(500).json({ message: 'Error al obtener permisos', error: err });
    }

    const permisos = results.map(result => result.nombre_permiso);
    res.json({ permisos });
  });
};
exports.getAllPermissions = (req, res) => {
    const query = 'SELECT nombre_permiso FROM permisos';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener los permisos:', err);
        return res.status(500).json({ message: 'Error al obtener los permisos', error: err });
      }
  
      const permisos = results.map(row => row.nombre_permiso);
      res.json({ permisos }); // Devolver los permisos en formato { permisos: [...] }
    });
  };