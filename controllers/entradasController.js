// controllers/entradasController.js
const db = require('../db');

// Registrar la entrada de un socio
exports.registerSocioEntry = (req, res) => {
  const { codigo_socio } = req.body;

  if (!codigo_socio) {
    return res.status(400).json({ message: 'Código de socio es requerido' });
  }

  const query = 'INSERT INTO entradas_socios (codigo_socio) VALUES (?)';

  db.query(query, [codigo_socio], (err, result) => {
    if (err) {
      console.error('Error al registrar la entrada:', err);
      return res.status(500).json({ message: 'Error al registrar la entrada', error: err });
    }
    res.status(200).json({ message: 'Entrada registrada con éxito', id_entrada: result.insertId });
  });
};

// Registrar la entrada de invitados
exports.registerInvitadoEntry = (req, res) => {
  const { codigo_socio, cantidad_invitados } = req.body;

  if (cantidad_invitados <= 0) {
    return res.status(400).json({ message: 'La cantidad de invitados debe ser mayor que 0' });
  }

  const query = 'INSERT INTO entradas_Invitados (codigo_socio, cantidad_invitados) VALUES (?, ?)';

  db.query(query, [codigo_socio || null, cantidad_invitados], (err, result) => {
    if (err) {
      console.error('Error al registrar la entrada de invitados:', err);
      return res.status(500).json({ message: 'Error al registrar la entrada de invitados', error: err });
    }
    res.status(200).json({ message: 'Entrada de invitados registrada con éxito', id_entrada: result.insertId });
  });
};

exports.registerManualEntry = (req, res) => {
  const { codigo_socio, fecha, hora } = req.body;

  if (!codigo_socio || !fecha || !hora) {
    return res.status(400).json({ message: 'Código del estudiante, fecha y hora son requeridos' });
  }

  const fecha_ingreso = `${fecha} ${hora}:00`; // Agrega los segundos

  const query = 'INSERT INTO entradas_socios (codigo_socio, fecha_ingreso) VALUES (?, ?)';

  db.query(query, [codigo_socio, fecha_ingreso], (err, result) => {
    if (err) {
      console.error('Error al registrar la entrada manual:', err);
      return res.status(500).json({ message: 'Error al registrar la entrada manual', error: err });
    }
    res.status(200).json({ message: 'Entrada manual registrada con éxito', id_entrada: result.insertId });
  });
};


exports.getUltimasEntradas = (req, res) => {
  const query = `
    SELECT 
      e.id_entrada,
      e.fecha_ingreso,
      s.codigo,
      s.nombre,
      s.apellido,
      ts.nombre_tipo AS tipo_socio
    FROM entradas_socios e
    JOIN socios s ON s.codigo = e.codigo_socio
    LEFT JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    ORDER BY e.fecha_ingreso DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener entradas:", err);
      return res.status(500).json({ message: "Error al obtener entradas", error: err });
    }

    res.status(200).json(results);
  });
};
