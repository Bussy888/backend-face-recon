// routes/rolesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Suponiendo que la conexión a la base de datos está en un archivo separado

// Obtener todos los roles
router.get('/', (req, res) => {
    const query = `
      SELECT r.id_rol, r.nombre_rol, r.descripcion, GROUP_CONCAT(p.nombre_permiso) AS permisos
      FROM roles r
      LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
      LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
      GROUP BY r.id_rol
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener los roles:', err);
        return res.status(500).json({ message: 'Error al obtener los roles', error: err });
      }
  
      res.json(results); // Esto ahora incluirá los permisos asociados a cada rol
    });
  });
  

// Crear un nuevo rol
router.post('/', (req, res) => {
    const { nombre_rol, descripcion, permisos } = req.body;

    // Crear el rol en la tabla Roles
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
                        return res.status(400).json({ message: `Permiso no encontrado: ${permiso}` });
                    }
                }

                res.status(200).json({ message: 'Rol creado con éxito' });

            } catch (error) {
                console.error('Error al asociar permisos al rol:', error);
                res.status(500).json({ message: 'Error al asociar permisos al rol', error });
            }
        }
    );
});


// Eliminar un rol
router.delete('/:id_rol', (req, res) => {
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
});

// Obtener un rol específico con su id
router.get('/:id_rol', (req, res) => {
    const { id_rol } = req.params;
    const query = `
      SELECT r.id_rol, r.nombre_rol, r.descripcion, GROUP_CONCAT(p.nombre_permiso) AS permisos
      FROM roles r
      LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
      LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
      WHERE r.id_rol = ?
      GROUP BY r.id_rol
    `;

    db.query(query, [id_rol], (err, results) => {
        if (err) {
            console.error('Error al obtener el rol:', err);
            return res.status(500).json({ message: 'Error al obtener el rol', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json(results[0]); // Enviar el rol con los permisos asociados
    });
});

// Actualizar un rol
router.put('/:id_rol', async (req, res) => {
    const { id_rol } = req.params;
    const { nombre_rol, descripcion, permisos } = req.body;

    // Actualizar el rol en la tabla Roles
    const updateQuery = 'UPDATE roles SET nombre_rol = ?, descripcion = ? WHERE id_rol = ?';
    db.query(updateQuery, [nombre_rol, descripcion, id_rol], async (err, result) => {
        if (err) {
            console.error('Error al actualizar el rol:', err);
            return res.status(500).json({ message: 'Error al actualizar el rol', error: err });
        }

        // Eliminar permisos existentes
        await db.promise().query('DELETE FROM roles_permisos WHERE id_rol = ?', [id_rol]);

        // Asignar los nuevos permisos
        try {
            for (let permiso of permisos) {
                const [rows] = await db.promise().query('SELECT id_permiso FROM permisos WHERE nombre_permiso = ?', [permiso]);

                if (rows.length > 0) {
                    const id_permiso = rows[0].id_permiso;
                    await db.promise().query('INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (?, ?)', [id_rol, id_permiso]);
                }
            }

            res.status(200).json({ message: 'Rol actualizado con éxito' });
        } catch (error) {
            console.error('Error al asociar permisos al rol:', error);
            res.status(500).json({ message: 'Error al asociar permisos al rol', error });
        }
    });
});

module.exports = router;
