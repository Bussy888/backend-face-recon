// controllers/entradasController.js
const db = require('../db');

// Registrar la entrada de un socio
exports.registerSocioEntry = (req, res) => {
  const { codigo_socio } = req.body;

  if (!codigo_socio) {
    return res.status(400).json({ message: 'Código de socio es requerido' });
  }

  const query = 'INSERT INTO entradas_Socios (codigo_socio) VALUES (?)';

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
