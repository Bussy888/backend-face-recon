// controllers/rolesController.js
const db = require('../db');

// Obtener todos los roles
exports.getRoles = (req, res) => {
  const query = 'SELECT id_rol, nombre_rol FROM roles';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener los roles:', err);
      return res.status(500).json({ message: 'Error al obtener los roles', error: err });
    }

    res.json(results);
  });
};
exports.createRole = (req, res) => {
    const { nombre_rol, descripcion, permisos } = req.body;
  
    // Crear el rol
    db.query(
      'INSERT INTO roles (nombre_rol, descripcion) VALUES (?, ?)',
      [nombre_rol, descripcion],
      async (err, result) => {
        if (err) {
          console.error('Error al crear rol:', err);
          return res.status(500).json({ message: 'Error al crear el rol', error: err });
        }
  
        const rolId = result.insertId;
  
        // Buscar el id_permiso para cada permiso
        try {
          for (let permiso of permisos) {
            // Obtener el id_permiso basado en el nombre del permiso
            const [rows] = await db.promise().query('SELECT id_permiso FROM permisos WHERE nombre_permiso = ?', [permiso]);
  
            if (rows.length > 0) {
              const id_permiso = rows[0].id_permiso;
  
              // Insertar la relación en la tabla Roles_Permisos
              const insertQuery = 'INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (?, ?)';
              await db.promise().query(insertQuery, [rolId, id_permiso]);
            } else {
              console.error(`Permiso no encontrado: ${permiso}`);
              // Manejo de error si no se encuentra el permiso
            }
          }
  
          res.status(200).json({ message: 'Rol creado con éxito' });
  
        } catch (error) {
          console.error('Error al asociar permisos al rol:', error);
          res.status(500).json({ message: 'Error al asociar permisos al rol', error });
        }
      }
    );
  };
  
// Eliminar un rol
exports.deleteRole = (req, res) => {
  const { id_rol } = req.params;

  const query = 'DELETE FROM roles WHERE id_rol = ?';

  db.query(query, [id_rol], (err, result) => {
    if (err) {
      console.error('Error al eliminar rol:', err);
      return res.status(500).json({ message: 'Error al eliminar rol', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.status(200).json({ message: 'Rol eliminado exitosamente' });
  });
};
