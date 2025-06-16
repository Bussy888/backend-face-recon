const db = require('../db');
const nodemailer = require('nodemailer');
const enviarCorreo = async (req, res) => {
  const { evento } = req.body;

  const sociosQuery = 'SELECT correo FROM socios';
  db.query(sociosQuery, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener socios' });

    const correos = results.map(row => row.correo);

    // ✅ Formatear la fecha al estilo "martes, 18 de junio de 2025"
    const fechaFormateada = new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(evento.fecha_evento));

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Instituto Transmite" <${process.env.EMAIL_USER}>`,
      to: correos,
      subject: `📢 Nuevo evento: ${evento.nombre_evento}`,
      html: `
        <div style="background-color: #1e1e2f; padding: 0; font-family: Arial, sans-serif;">
          <div style="background-color: #1e1e2f; text-align: center; padding: 20px;">
            <img src="https://transmite.bo/views/layout/assets/frontend/img/Logo-Transmite-White-Colors.png" alt="Instituto Transmite" style="max-width: 180px;" />
          </div>

          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Nuevo Evento Académico</h2>

            <p style="color: #333;"><strong>📌 Nombre del Evento:</strong> ${evento.nombre_evento}</p>
            <p style="color: #333;"><strong>📝 Descripción:</strong> ${evento.descripcion_evento}</p>
            <p style="color: #333;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>

            <hr style="margin: 30px 0;" />

            <footer style="font-size: 14px; color: #555; text-align: center;">
              <p><strong>Instituto Tecnológico Transmite</strong></p>
              <p>Calle Pinilla #2588 Edif. Arcadia, entre Av. Arce y Av. 6 de Agosto<br>La Paz, Bolivia</p>
              <p>📞 +591 787 95415 | 📧 info@transmite.bo</p>

              <div style="margin-top: 20px;">
                <a href="https://www.instagram.com/transmitebolivia/" style="margin: 0 8px;" target="_blank">
                  <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" />
                </a>
                <a href="https://www.facebook.com/transmitebolivia/" style="margin: 0 8px;" target="_blank">
                  <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" />
                </a>
                <a href="https://www.tiktok.com/@transmitebolivia" style="margin: 0 8px;" target="_blank">
                  <img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" />
                </a>
                <a href="https://transmite.bo" style="margin: 0 8px;" target="_blank">
                  <img src="https://cdn-icons-png.flaticon.com/24/535/535239.png" alt="Sitio Web" />
                </a>
              </div>

              <p style="color: #888; margin-top: 15px;">Gracias por ser parte de nuestra comunidad educativa.</p>
            </footer>
          </div>
        </div>
      `
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
