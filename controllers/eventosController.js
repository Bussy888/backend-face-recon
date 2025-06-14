const db = require('../db');
const nodemailer = require('nodemailer');

const enviarCorreo = async (req, res) => {
  const { evento } = req.body;

  const sociosQuery = 'SELECT correo FROM socios';
  db.query(sociosQuery, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener socios' });

    const correos = results.map(row => row.correo);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correos,
      subject: `Nuevo evento: ${evento.nombre_evento}`,
      text: `Hola, se ha creado un nuevo evento: ${evento.nombre_evento}\n\n${evento.descripcion_evento}\n\nFecha: ${evento.fecha_evento}`
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al enviar el correo' });
    }
  });
};


const getEventos = (req, res) => {
  const query = 'SELECT * FROM eventos ORDER BY fecha_evento ASC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener los eventos', error: err });
    res.json(results);
  });
};

const createEvento = (req, res) => {
  const { nombre_evento, descripcion_evento, fecha_evento } = req.body;
  const query = `INSERT INTO eventos (nombre_evento, descripcion_evento, fecha_evento) VALUES (?, ?, ?)`;
  db.query(query, [nombre_evento, descripcion_evento, fecha_evento], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al crear el evento', error: err });
    res.status(200).json({ message: 'Evento creado correctamente', id: result.insertId });
  });
};

const updateEvento = (req, res) => {
  const { id } = req.params;
  const { nombre_evento, descripcion_evento, fecha_evento } = req.body;
  const query = `
    UPDATE eventos SET nombre_evento = ?, descripcion_evento = ?, fecha_evento = ?
    WHERE id_evento = ?
  `;
  db.query(query, [nombre_evento, descripcion_evento, fecha_evento, id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar el evento', error: err });
    res.status(200).json({ message: 'Evento actualizado correctamente' });
  });
};

const deleteEvento = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM eventos WHERE id_evento = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar el evento', error: err });
    res.status(200).json({ message: 'Evento eliminado correctamente' });
  });
};

const getEventoById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM eventos WHERE id_evento = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      res.json(results[0]);
    });
  };
  

module.exports = { getEventos, createEvento, updateEvento, deleteEvento, enviarCorreo, getEventoById };
