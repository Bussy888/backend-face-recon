const db = require('../db');
const ExcelJS = require('exceljs');

// Exportar pagos a Excel
const exportarPagosExcel = async (req, res) => {
  const query = `
    SELECT 
      c.codigo_socio,
      s.nombre,
      s.apellido,
      ts.nombre_tipo AS tipo_socio,
      c.año,
      c.mes,
      c.pagado,
      c.fecha_pago
    FROM cuotaspagadas c
    JOIN socios s ON s.codigo = c.codigo_socio
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    ORDER BY c.año DESC, c.mes DESC
  `;

  db.query(query, async (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al generar Excel de pagos' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pagos');

    sheet.columns = [
      { header: 'Código de Estudiante', key: 'codigo_socio', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Carrera', key: 'tipo_socio', width: 20 },
      { header: 'Año', key: 'año', width: 10 },
      { header: 'Mes', key: 'mes', width: 10 },
      { header: 'Pagado', key: 'pagado', width: 10 },
      { header: 'Fecha de Pago', key: 'fecha_pago', width: 25 },
    ];

    data.forEach(row => {
      sheet.addRow({
        ...row,
        pagado: row.pagado ? 'Sí' : 'No',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pagos_mensualidades_estudiantes_transmite.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
};

// Resumen general
const obtenerResumen = (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM entradas_socios) AS total_socios,
      (SELECT SUM(cantidad_invitados) FROM entradas_invitados) AS total_invitados
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resumen' });
    res.json(results[0]);
  });
};

// Visitas por periodo
const visitasPorPeriodo = (req, res) => {
  const { periodo } = req.query;

  let groupByFecha;
  switch (periodo) {
    case 'semana':
      groupByFecha = 'WEEK(es.fecha_ingreso)';
      break;
    case 'mes':
      groupByFecha = 'MONTH(es.fecha_ingreso)';
      break;
    default:
      groupByFecha = 'DATE(es.fecha_ingreso)';
  }

  const query = `
    SELECT 
      ${groupByFecha} AS periodo,
      ts.nombre_tipo AS carrera,
      COUNT(*) AS ingresos_socios
    FROM entradas_socios es
    JOIN socios s ON s.codigo = es.codigo_socio
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    GROUP BY periodo, carrera
    ORDER BY periodo ASC, carrera
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en visitasPorPeriodo:', err);
      return res.status(500).json({ error: 'Error al obtener visitas' });
    }
    res.json(results);
  });
};

// Ingresos de hoy
const obtenerIngresosHoy = (req, res) => {
  const query = `
    SELECT 
      ts.nombre_tipo AS carrera,
      COUNT(*) AS ingresos_socios
    FROM entradas_socios es
    JOIN socios s ON s.codigo = es.codigo_socio
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    WHERE DATE(es.fecha_ingreso) = CURDATE()
    GROUP BY carrera
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en obtenerIngresosHoy:', err);
      return res.status(500).json({ error: 'Error al obtener ingresos de hoy' });
    }
    res.json(results);
  });
};
// Exportar accesos a Excel
const exportarExcel = async (req, res) => {
  const query = `
    SELECT 
      s.codigo AS codigo_socio,
      s.nombre,
      s.apellido,
      ts.nombre_tipo AS tipo_socio,
      es.fecha_ingreso
    FROM entradas_socios es
    JOIN socios s ON s.codigo = es.codigo_socio
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    ORDER BY es.fecha_ingreso DESC
  `;

  db.query(query, async (err, data) => {
    if (err) {
      console.error('Error al exportar Excel:', err);
      return res.status(500).json({ error: 'Error al generar Excel' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Accesos Socios');

    sheet.columns = [
      { header: 'Código de Estudiante', key: 'codigo_socio', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Carrera', key: 'tipo_socio', width: 25 },
      { header: 'Fecha Ingreso', key: 'fecha', width: 20 },
      { header: 'Hora Ingreso', key: 'hora', width: 15 }
    ];

    data.forEach(row => {
      const fechaHora = new Date(row.fecha_ingreso);
      sheet.addRow({
        ...row,
        fecha: fechaHora.toISOString().split('T')[0],
        hora: fechaHora.toTimeString().split(' ')[0]
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=accesos_estudiantes_transmite.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
};

// Pagos por mes y tipo de socio
const pagosPorMes = (req, res) => {
  const query = `
    SELECT 
      cp.año,
      cp.mes,
      ts.nombre_tipo AS tipo_socio,
      COUNT(*) AS cantidad_pagos,
      SUM(CASE WHEN cp.pagado THEN 1 ELSE 0 END) AS pagos_completados
    FROM cuotaspagadas cp
    JOIN socios s ON cp.codigo_socio = s.codigo
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    GROUP BY cp.año, cp.mes, tipo_socio
    ORDER BY cp.año DESC, cp.mes DESC, tipo_socio;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return res.status(500).json({ error: 'Error al obtener pagos por mes', details: err });
    }
    res.json(results);
  });
};


// Tipos de socios que más han pagado
const pagosPorTipoSocio = (req, res) => {
  const query = `
    SELECT 
      ts.nombre_tipo AS tipo_socio,
      COUNT(*) AS cantidad
    FROM cuotaspagadas c
    JOIN socios s ON s.codigo = c.codigo_socio
    JOIN tipos_socio ts ON s.tipo_socio = ts.id_tipo
    WHERE c.pagado = TRUE
    GROUP BY tipo_socio
    ORDER BY cantidad DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener pagos por tipo de socio:', err);
      return res.status(500).json({ error: 'Error al obtener pagos por tipo de socio' });
    }
    res.json(results);
  });
};

module.exports = {
  obtenerResumen,
  visitasPorPeriodo,
  exportarExcel,
  obtenerIngresosHoy,
  pagosPorMes,
  pagosPorTipoSocio,
  exportarPagosExcel
};
