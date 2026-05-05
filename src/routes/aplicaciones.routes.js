const express = require('express');
const router = express.Router();
const AplicacionController = require('../controllers/aplicacion.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @route POST /api/applications
 * @desc Crear una nueva aplicación
 * @access Public
 */
router.post('/',
  validacion.validar(esquemas.crearAplicacion),
  AplicacionController.crear
);

/**
 * @route GET /api/applications
 * @desc Obtener todas las aplicaciones
 * @access Public
 */
router.get('/',
  AplicacionController.obtenerTodas
);

/**
 * @route GET /api/applications/active
 * @desc Obtener aplicaciones activas
 * @access Public
 */
router.get('/active',
  AplicacionController.obtenerActivas
);

/**
 * @route GET /api/applications/:aplicacionId/exists
 * @desc Verificar si una aplicación existe
 * @access Public
 */
router.get('/:aplicacionId/exists',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.verificarExistencia
);

/**
 * @route GET /api/applications/:aplicacionId/stats
 * @desc Obtener estadísticas de una aplicación
 * @access Public
 */
router.get('/:aplicacionId/stats',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  AplicacionController.obtenerEstadisticas
);

/**
 * @route GET /api/applications/:aplicacionId
 * @desc Obtener aplicación por ID
 * @access Public
 */
router.get('/:aplicacionId',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.obtenerPorId
);

/**
 * @route PUT /api/applications/:aplicacionId/config
 * @desc Actualizar configuración de una aplicación
 * @access Public
 */
router.put('/:aplicacionId/config',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.actualizarConfiguracion
);

/**
 * @route PATCH /api/applications/:aplicacionId/activate
 * @desc Activar una aplicación
 * @access Public
 */
router.patch('/:aplicacionId/activate',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.activar
);

/**
 * @route PATCH /api/applications/:aplicacionId/deactivate
 * @desc Desactivar una aplicación
 * @access Public
 */
router.patch('/:aplicacionId/deactivate',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.desactivar
);

module.exports = router;
