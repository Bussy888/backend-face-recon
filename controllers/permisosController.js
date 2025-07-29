const db = require('../db');

// Obtener todos los permisos
exports.getAllPermissions = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM permisos');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener permisos:', err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo permiso
exports.createPermission = async (req, res) => {
  const { nombre_permiso, descripcion } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO permisos (nombre_permiso, descripcion) VALUES (?, ?)',
      [nombre_permiso, descripcion]
    );
    res.status(201).json({ id: result.insertId, nombre_permiso, descripcion });
  } catch (err) {
    console.error('Error al crear permiso:', err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un permiso
exports.updatePermission = async (req, res) => {
  const { id } = req.params;
  const { nombre_permiso, descripcion } = req.body;
  try {
    await db.query(
      'UPDATE permisos SET nombre_permiso = ?, descripcion = ? WHERE id_permiso = ?',
      [nombre_permiso, descripcion, id]
    );
    res.json({ id, nombre_permiso, descripcion });
  } catch (err) {
    console.error('Error al actualizar permiso:', err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un permiso
exports.deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM permisos WHERE id_permiso = ?', [id]);
    res.json({ message: 'Permiso eliminado' });
  } catch (err) {
    console.error('Error al eliminar permiso:', err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener permisos por rol
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

// Asignar permisos a un rol
exports.assignPermissionsToRole = (req, res) => {
  const { id_rol } = req.params;
  const { permisos } = req.body;

  if (!Array.isArray(permisos) || permisos.length === 0) {
    return res.status(400).json({ message: 'Lista de permisos vacía o inválida' });
  }

  permisos.forEach((permiso) => {
    const query = 'SELECT id_permiso FROM permisos WHERE nombre_permiso = ?';
    db.query(query, [permiso], (err, results) => {
      if (err) return console.error('Error al obtener permiso:', err);
      if (results.length > 0) {
        const permisoId = results[0].id_permiso;
        const insertQuery = 'INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (?, ?)';
        db.query(insertQuery, [id_rol, permisoId], (err) => {
          if (err) console.error('Error al asignar permiso:', err);
        });
      }
    });
  });

  res.status(200).json({ message: 'Permisos asignados correctamente al rol' });
};
