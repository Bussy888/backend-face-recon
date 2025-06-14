// controllers/empleadosController.js
const db = require('../db');

const agregarEmpleado = async (req, res) => {
  const { google_id, nombre, apellido, correo, rol } = req.body;

  console.log({ google_id, nombre, apellido, correo, rol });

  try {
    // Obtener el id_rol desde la tabla Roles
    const [roles] = await db.promise().query(
      'SELECT id_rol FROM roles WHERE nombre_rol = ?',
      [rol]
    );

    if (roles.length === 0) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    const rol_id = roles[0].id_rol;

    // Insertar el empleado (sin fecha_registro)
    await db.promise().query(
      'INSERT INTO empleados (google_id, nombre,apellido, correo,  rol_id) VALUES (?, ?, ?, ?, ?)',
      [google_id, nombre, apellido, correo, rol_id]
    );

    res.status(200).json({ message: 'Empleado agregado correctamente' });
  } catch (error) {
    console.error('Error al agregar empleado:', error.message || error);
    res.status(500).json({ error: 'Error al agregar el empleado' });
  }
};



const getEmpleados = (req, res) => {
  const query = `SELECT e.id_empleado, e.nombre, e.apellido, e.correo, r.nombre_rol as rol FROM empleados e JOIN roles r ON e.rol_id = r.id_rol`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener empleados', error: err });
    }
    res.json(results);
  });
};

const getEmpleadoByEmail = (req, res) => {
  const email = req.params.email;
  const query = `
    SELECT 
      e.id_empleado, 
      e.nombre, 
      e.apellido, 
      e.correo, 
      e.fecha_creacion, 
      e.fecha_actualizacion,
      e.rol_id,
      r.nombre_rol
    FROM empleados e
    JOIN roles r ON e.rol_id = r.id_rol
    WHERE e.correo = ?
  `;

  db.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result[0]);
  });
};

const actualizarEmpleado = (req, res) => {
    const { nombre, apellido, rol_id } = req.body;
    const correo = req.params.correo;
  
    const query = 'UPDATE empleados SET nombre = ?, apellido = ?, rol_id = ? WHERE correo = ?';
    db.query(query, [nombre, apellido, rol_id, correo], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar el empleado' });
      }
      res.status(200).json({ message: 'Empleado actualizado correctamente' });
    });
  };
  const eliminarEmpleado = (req, res) => {
    const { id_empleado } = req.params;
  
    const query = 'DELETE FROM empleados WHERE id_empleado = ?';
    db.query(query, [id_empleado], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar el empleado', details: err });
      }
  
      // Si no se encuentra el empleado, result.affectedRows será 0
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
  
      res.status(200).json({ message: 'Empleado eliminado correctamente' });
    });
  };
  
  

module.exports = {
  agregarEmpleado,
  getEmpleados,
  getEmpleadoByEmail,
  actualizarEmpleado,
  eliminarEmpleado
};
