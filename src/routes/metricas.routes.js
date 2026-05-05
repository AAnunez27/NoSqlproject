const express = require('express');
const router = express.Router();
const MetricasController = require('../controllers/metricas.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @route GET /api/metrics/basic
 * @desc Obtener métricas básicas del sistema
 * @access Public
 */
router.get('/basic',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerBasicas
);

/**
 * @route GET /api/metrics/summary
 * @desc Obtener resumen general del sistema
 * @access Public
 */
router.get('/summary',
  MetricasController.obtenerResumen
);

/**
 * @route GET /api/metrics/by-application
 * @desc Obtener métricas por aplicación
 * @access Public
 */
router.get('/by-application',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerPorAplicacion
);

/**
 * @route GET /api/metrics/top-users
 * @desc Obtener usuarios más activos
 * @access Public
 */
router.get('/top-users',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerUsuariosActivos
);

/**
 * @route GET /api/metrics/health
 * @desc Obtener estado de salud del sistema
 * @access Public
 */
router.get('/health',
  MetricasController.obtenerSaludSistema
);

module.exports = router;
