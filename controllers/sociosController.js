const db = require('../db');

// Función para registrar un socio con el tipo de socio
const registerSocio = (req, res) => {
  const { codigo, nombre, apellido, correo, fecha_nacimiento, face_descriptor, tipo_socio } = req.body;

  // Asegúrate de que face_descriptor esté correctamente formateado (por ejemplo, si es un array JSON, debe ser convertido a string)
  const faceDescriptorString = face_descriptor ? JSON.stringify(face_descriptor) : null;

  // Validar que el tipo de socio esté en los valores permitidos
  const tiposSocioValidos = [
    'Negocios Digitales',
    'Desarrollo Fullstack',
    'Analitica Digital',
  ];

  
  if (!tiposSocioValidos.includes(tipo_socio.trim())) {
    return res.status(400).json({ message: 'Tipo de socio no válido' });
  }
  


  // Corregir la consulta SQL para incluir apellido
  const query = `
    INSERT INTO socios (codigo, nombre, apellido, correo, fecha_nacimiento, face_descriptor, tipo_socio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Mostrar los valores antes de ejecutar la consulta (solo para depuración)
  console.log('Datos a insertar:', {
    codigo, nombre, apellido, correo, fecha_nacimiento, faceDescriptorString, tipo_socio
  });

  db.query(query, [codigo, nombre, apellido, correo, fecha_nacimiento, faceDescriptorString, tipo_socio], (err, result) => {
    if (err) {
      console.error('Error al registrar socio: ', err.message);
      console.error('Error completo: ', err);
      return res.status(500).json({ message: 'Error al guardar el socio', error: err.message });
    }
    res.status(200).json({ message: 'Socio registrado exitosamente', id: result.insertId });
  });
};
// Nuevo endpoint en tu backend
const getUsersWithPayments = (req, res) => {
  const query = `
    SELECT s.codigo, s.nombre, s.apellido, s.correo, s.fecha_nacimiento, s.face_descriptor, s.tipo_socio,
           p.mes, p.año, p.pagado
    FROM socios s
    LEFT JOIN cuotaspagadas p ON s.codigo = p.codigo_socio
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener los usuarios con pagos', error: err });
    }

    const usersMap = {};

    results.forEach(row => {
      if (!usersMap[row.codigo]) {
        usersMap[row.codigo] = {
          codigo: row.codigo,
          nombre: row.nombre,
          apellido: row.apellido,
          correo: row.correo,
          fechaNacimiento: row.fecha_nacimiento,
          faceDescriptor: JSON.parse(row.face_descriptor),
          tipoSocio: row.tipo_socio,
          pagos: [],
        };
      }

      if (row.mes && row.año) {
        usersMap[row.codigo].pagos.push({
          mes: row.mes,
          año: row.año,
          pagado: !!row.pagado
        });
      }
    });

    const users = Object.values(usersMap);
    res.json({ users });
  });
};

const verifySocio = (req, res) => {
  const { codigo } = req.params;

  const query = 'SELECT * FROM socios WHERE codigo = ?';
  db.query(query, [codigo], (err, results) => {
    if (err) {
      console.error('Error al verificar socio:', err.message);
      return res.status(500).json({ message: 'Error al buscar socio' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }
    res.status(200).json(results[0]);
  });
};

const updateFaceDescriptor = (req, res) => {
  const { codigo, face_descriptor } = req.body;

  if (!codigo || !face_descriptor) {
    return res.status(400).json({ message: 'Código y face descriptor son requeridos' });
  }

  const faceDescriptorString = JSON.stringify(face_descriptor);

  const query = 'UPDATE socios SET face_descriptor = ? WHERE codigo = ?';

  db.query(query, [faceDescriptorString, codigo], (err, result) => {
    if (err) {
      console.error('Error al actualizar face descriptor:', err.message);
      return res.status(500).json({ message: 'Error al actualizar face descriptor' });
    }
    res.status(200).json({ message: 'Face descriptor actualizado exitosamente' });
  });
};


// Función para obtener los usuarios
const getUsers = (req, res) => {
  const query = 'SELECT codigo, nombre, apellido, correo, fecha_nacimiento, face_descriptor, tipo_socio FROM socios';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener los usuarios', error: err });
    }

    const users = results.map(user => ({
      codigo: user.codigo,
      nombre: user.nombre,
      correo: user.correo,
      apellido: user.apellido,
      fechaNacimiento: user.fecha_nacimiento,
      faceDescriptor: JSON.parse(user.face_descriptor),  // Asegúrate de parsear el descriptor facial correctamente
      tipoSocio: user.tipo_socio,  // Añadimos el tipo de socio
    }));

    res.json({ users });
  });
};

// Función para registrar la entrada de un invitado
const registerInvitado = (req, res) => {
  const { codigo_socio, cantidad_invitados } = req.body;

  if (cantidad_invitados <= 0) {
    return res.status(400).json({ message: 'La cantidad de invitados debe ser mayor que 0' });
  }

  const query = 'INSERT INTO entradas_invitados (codigo_socio, cantidad_invitados) VALUES (?, ?)';
  db.query(query, [codigo_socio || null, cantidad_invitados], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al registrar la entrada de invitados', error: err });
    }
    res.status(200).json({ message: 'Entrada de invitados registrada con éxito', id_entrada: result.insertId });
  });
};

// Función para registrar la entrada de un socio
const registerEntry = (req, res) => {
  const { codigo_socio } = req.body;

  if (!codigo_socio) {
    return res.status(400).json({ message: 'Código de socio es requerido' });
  }

  const query = 'INSERT INTO entradas_socios (codigo_socio) VALUES (?)';
  db.query(query, [codigo_socio], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al registrar la entrada', error: err });
    }
    res.status(200).json({ message: 'Entrada registrada con éxito', id_entrada: result.insertId });
  });
};

// Función para obtener las cuotas de los socios
const getCuotas = (req, res) => {
  const { year, name = '', page = 1, limit = 10 } = req.query;
  const selectedYear = year || new Date().getFullYear();
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      s.codigo,
      s.nombre,
      s.apellido,
      s.correo,
      s.fecha_nacimiento,
      s.tipo_socio,  -- Incluir el tipo de socio en la consulta
      cp.mes,
      cp.pagado
    FROM socios s
    LEFT JOIN cuotaspagadas cp ON s.codigo = cp.codigo_socio AND cp.año = ?
    WHERE s.nombre LIKE ?
    ORDER BY s.nombre ASC
    LIMIT ? OFFSET ?;
  `;

  db.query(query, [parseInt(selectedYear), `%${name}%`, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener las cuotas de los socios', error: err });
    }

    const socios = results.reduce((acc, socio) => {
      if (!acc[socio.codigo]) {
        acc[socio.codigo] = {
          codigo: socio.codigo,
          nombre: `${socio.nombre} ${socio.apellido}`,
          correo: socio.correo,
          fechaNacimiento: socio.fecha_nacimiento,
          tipoSocio: socio.tipo_socio,
          cuotas: {
            enero: false,
            febrero: false,
            marzo: false,
            abril: false,
            mayo: false,
            junio: false,
            julio: false,
            agosto: false,
            septiembre: false,
            octubre: false,
            noviembre: false,
            diciembre: false,
          }
        };
      }

      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      if (socio.mes >= 1 && socio.mes <= 12) {
        acc[socio.codigo].cuotas[meses[socio.mes - 1]] = socio.pagado;
      } else {
        console.log(`Mes inválido para socio ${socio.codigo}: ${socio.mes}`);
      }

      return acc;
    }, {});

    const cuotas = Object.values(socios);

    res.json({ cuotas });
  });
};

// Función para actualizar el pago de las cuotas
const updateCuota = (req, res) => {
  const { codigo_socio, mes, estado_pago, year } = req.body;

  if (!codigo_socio || !mes || estado_pago === undefined || !year) {
    return res.status(400).json({ message: 'Faltan parámetros necesarios' });
  }

  if (mes < 1 || mes > 12) {
    return res.status(400).json({ message: 'Mes inválido' });
  }

  const checkQuery = 'SELECT * FROM cuotaspagadas WHERE codigo_socio = ? AND mes = ? AND año = ?';
  const insertQuery = 'INSERT INTO cuotaspagadas (codigo_socio, mes, año, pagado) VALUES (?, ?, ?, ?)';
  const updateQuery = 'UPDATE cuotaspagadas SET pagado = ? WHERE codigo_socio = ? AND mes = ? AND año = ?';

  db.query(checkQuery, [codigo_socio, mes, year], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al verificar cuota', error: err });

    if (rows.length === 0) {
      db.query(insertQuery, [codigo_socio, mes, year, estado_pago ? 1 : 0], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al insertar cuota', error: err });
        return res.status(200).json({ message: 'Cuota registrada correctamente' });
      });
    } else {
      db.query(updateQuery, [estado_pago ? 1 : 0, codigo_socio, mes, year], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar cuota', error: err });
        return res.status(200).json({ message: 'Cuota actualizada correctamente' });
      });
    }
  });
};
// Ruta: GET /api/socios/:id_socio
const getSocioByCodigo = (req, res) => {
  const { codigo } = req.params;
  db.query('SELECT * FROM socios WHERE codigo = ?', [codigo], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener socio' });
    if (result.length === 0) return res.status(404).json({ message: 'Socio no encontrado' });

    let socio = result[0];
    if (socio.face_descriptor) {
      try {
        socio.face_descriptor = JSON.parse(socio.face_descriptor);
      } catch {
        socio.face_descriptor = null;
      }
    }

    res.status(200).json(socio);
  });
};


// Ruta: PUT /api/socios/:id_socio
const updateSocioByCodigo = (req, res) => {
  const { codigo } = req.params;
  const {
    nombre,
    apellido,
    correo,
    fecha_nacimiento,
    tipo_socio,
    face_descriptor
  } = req.body;

  const faceDescriptorStr = face_descriptor ? JSON.stringify(face_descriptor) : null;

  const query = `
    UPDATE socios SET 
      nombre = ?, 
      apellido = ?, 
      correo = ?, 
      fecha_nacimiento = ?, 
      tipo_socio = ?, 
      face_descriptor = ?
    WHERE codigo = ?
  `;

  db.query(
    query,
    [nombre, apellido, correo, fecha_nacimiento, tipo_socio, faceDescriptorStr, codigo],
    (err, result) => {
      if (err) {
        console.error('Error al actualizar socio:', err);
        return res.status(500).json({ message: 'Error al actualizar socio' });
      }
      res.status(200).json({ message: 'Socio actualizado correctamente' });
    }
  );
};

const deleteSocioByCodigo = async (req, res) => {
  const { codigo } = req.params;

  try {
    // Eliminar entradas de socios
    const [resultEntradasSocios] = await db
      .promise()
      .query('DELETE FROM entradas_socios WHERE codigo_socio = ?', [codigo]);
    console.log(`Entradas socios eliminadas: ${resultEntradasSocios.affectedRows}`);

    // Eliminar entradas de invitados asociadas al socio
    const [resultEntradasInvitados] = await db
      .promise()
      .query('DELETE FROM entradas_invitados WHERE codigo_socio = ?', [codigo]);
    console.log(`Entradas invitados eliminadas: ${resultEntradasInvitados.affectedRows}`);

    // Eliminar cuotas de pago del socio
    const [resultCuotas] = await db
      .promise()
      .query('DELETE FROM cuotaspagadas WHERE codigo_socio = ?', [codigo]);
    console.log(`Cuotas pagadas eliminadas: ${resultCuotas.affectedRows}`);

    // Eliminar al socio
    const [resultSocio] = await db
      .promise()
      .query('DELETE FROM socios WHERE codigo = ?', [codigo]);
    console.log(`Socios eliminados: ${resultSocio.affectedRows}`);

    // Verificar si el socio existía
    if (resultSocio.affectedRows === 0) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    res.status(200).json({ message: 'Socio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    res.status(500).json({
      message: 'Error al eliminar socio',
      error: error.sqlMessage || error.message,
    });
  }
};





module.exports = {
  registerSocio,
  getSocioByCodigo, 
  updateSocioByCodigo,
  getUsers,
  registerInvitado,
  registerEntry,
  updateCuota,
  getCuotas,
  verifySocio,
  updateFaceDescriptor,
  deleteSocioByCodigo, 
  getUsersWithPayments
};
