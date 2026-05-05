const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/evento.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @route POST /api/events
 * @desc Crear un nuevo evento
 * @access Public
 */
router.post('/',
  validacion.validar(esquemas.crearEvento),
  EventoController.crear
);

/**
 * @route GET /api/events
 * @desc Listar eventos con filtros dinámicos
 * @access Public
 */
router.get('/',
  validacion.validar(esquemas.parametrosConsulta.consultaEventos, 'query'),
  EventoController.listar
);

/**
 * @route GET /api/events/metrics/basic
 * @desc Obtener métricas básicas de eventos
 * @access Public
 */
router.get('/metrics/basic',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  EventoController.metricas
);

/**
 * @route GET /api/events/user/:usuarioId
 * @desc Obtener eventos por usuario
 * @access Public
 */
router.get('/user/:usuarioId',
  validacion.validar(esquemas.parametrosRuta.usuarioId, 'params'),
  validacion.validar(esquemas.parametrosConsulta.consultaEventos, 'query'),
  EventoController.obtenerPorUsuario
);

/**
 * @route GET /api/events/date/:fecha
 * @desc Obtener eventos por fecha
 * @access Public
 */
router.get('/date/:fecha',
  validacion.validar(esquemas.parametrosRuta.fecha, 'params'),
  validacion.validar(esquemas.parametrosConsulta.filtroFecha, 'query'),
  EventoController.obtenerPorFecha
);

/**
 * @route GET /api/events/type/:tipoEvento
 * @desc Obtener eventos por tipo
 * @access Public
 */
router.get('/type/:tipoEvento',
  validacion.validar(esquemas.parametrosRuta.tipoEvento, 'params'),
  validacion.validar(esquemas.parametrosConsulta.consultaEventos, 'query'),
  EventoController.obtenerPorTipo
);

/**
 * @route GET /api/events/:eventoId
 * @desc Obtener evento por ID
 * @access Public
 */
router.get('/:eventoId',
  validacion.validar(esquemas.parametrosRuta.eventoId, 'params'),
  EventoController.obtenerPorId
);

/**
 * @route PUT /api/events/:eventoId/metadata
 * @desc Actualizar metadata de un evento
 * @access Public
 */
router.put('/:eventoId/metadata',
  validacion.validar(esquemas.parametrosRuta.eventoId, 'params'),
  validacion.validar(esquemas.actualizarEventoMetadata),
  EventoController.actualizarMetadata
);

/**
 * @route DELETE /api/events/:eventoId
 * @desc Eliminar un evento
 * @access Public
 */
router.delete('/:eventoId',
  validacion.validar(esquemas.parametrosRuta.eventoId, 'params'),
  EventoController.eliminar
);

module.exports = router;
