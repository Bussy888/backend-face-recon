const db = require('../db');

// Obtener todos los tipos de socio
const getAllTiposSocio = (req, res) => {
  const query = 'SELECT * FROM tipos_socio';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener tipos de socio:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(results);
  });
};

// Añadir un nuevo tipo de socio
const createTipoSocio = (req, res) => {
  const { nombre_tipo, descripcion } = req.body;

  if (!nombre_tipo) {
    return res.status(400).json({ error: 'El nombre del tipo de socio es requerido' });
  }

  const query = 'INSERT INTO tipos_socio (nombre_tipo, descripcion) VALUES (?, ?)';

  db.query(query, [nombre_tipo, descripcion], (err, result) => {
    if (err) {
      console.error('Error al crear tipo de socio:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Tipo de socio creado exitosamente' });
  });
};


// Actualizar tipo de socio
const updateTipoSocio = (req, res) => {
  const { id } = req.params;
  const { nombre_tipo, descripcion } = req.body;

  if (!nombre_tipo) {
    return res.status(400).json({ error: 'El nombre del tipo de socio es requerido' });
  }

  const query = 'UPDATE tipos_socio SET nombre_tipo = ? , descripcion = ? WHERE id_tipo = ?';

  db.query(query, [nombre_tipo, descripcion, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar tipo de socio:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: 'Tipo de socio actualizado exitosamente' });
  });
};

// Eliminar tipo de socio
const deleteTipoSocio = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM tipos_socio WHERE id_tipo = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar tipo de socio:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: 'Tipo de socio eliminado exitosamente' });
  });
};

module.exports = {
  getAllTiposSocio,
  createTipoSocio,
  updateTipoSocio,
  deleteTipoSocio
};
