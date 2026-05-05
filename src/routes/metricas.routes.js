const express = require('express');
const router = express.Router();
const MetricasController = require('../controllers/metricas.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     tags: [Métricas]
 *     summary: Información general de métricas disponibles
 *     description: Endpoint base que proporciona información sobre los endpoints de métricas disponibles
 *     responses:
 *       200:
 *         description: Información de métricas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         endpoints:
 *                           type: object
 *                           properties:
 *                             basicas:
 *                               type: string
 *                               example: "/api/metrics/basic"
 *                             resumen:
 *                               type: string
 *                               example: "/api/metrics/summary"
 *                             por_aplicacion:
 *                               type: string
 *                               example: "/api/metrics/by-application"
 *                             usuarios_activos:
 *                               type: string
 *                               example: "/api/metrics/top-users"
 *                             salud:
 *                               type: string
 *                               example: "/api/metrics/health"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoints de métricas disponibles',
    data: {
      endpoints: {
        basicas: '/api/metrics/basic',
        resumen: '/api/metrics/summary',
        por_aplicacion: '/api/metrics/by-application',
        usuarios_activos: '/api/metrics/top-users',
        salud: '/api/metrics/health'
      },
      descripcion: 'API de métricas para análisis de comportamiento de usuarios'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/metrics/basic:
 *   get:
 *     tags: [Métricas]
 *     summary: Obtener métricas básicas del sistema
 *     description: Retorna estadísticas básicas como total de eventos, usuarios activos, etc.
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del periodo (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del periodo (YYYY-MM-DD)
 *       - in: query
 *         name: aplicacion_id
 *         schema:
 *           type: string
 *         description: Filtrar por aplicación específica
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MetricasBasicas'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/basic',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerBasicas
);

/**
 * @swagger
 * /api/metrics/summary:
 *   get:
 *     tags: [Métricas]
 *     summary: Obtener resumen general del sistema
 *     description: Retorna un resumen completo con estadísticas globales y tendencias
 *     responses:
 *       200:
 *         description: Resumen obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MetricasResumen'
 */
router.get('/summary',
  MetricasController.obtenerResumen
);

/**
 * @swagger
 * /api/metrics/by-application:
 *   get:
 *     tags: [Métricas]
 *     summary: Obtener métricas por aplicación
 *     description: Retorna métricas segmentadas por aplicación
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del periodo (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del periodo (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Métricas por aplicación obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           aplicacion_id:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           total_eventos:
 *                             type: number
 *                           usuarios_unicos:
 *                             type: number
 */
router.get('/by-application',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerPorAplicacion
);

/**
 * @swagger
 * /api/metrics/top-users:
 *   get:
 *     tags: [Métricas]
 *     summary: Obtener usuarios más activos
 *     description: Retorna una lista de los usuarios con mayor actividad
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de usuarios a retornar
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del periodo (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del periodo (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Usuarios activos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           usuario_id:
 *                             type: string
 *                           total_eventos:
 *                             type: number
 *                           ultima_actividad:
 *                             type: string
 *                             format: date-time
 */
router.get('/top-users',
  validacion.validar(esquemas.parametrosConsulta.parametrosMetricas, 'query'),
  MetricasController.obtenerUsuariosActivos
);

/**
 * @swagger
 * /api/metrics/health:
 *   get:
 *     tags: [Métricas]
 *     summary: Obtener estado de salud del sistema
 *     description: Verifica el estado de salud de los componentes del sistema
 *     responses:
 *       200:
 *         description: Estado de salud obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: ['healthy', 'warning', 'error']
 *                         base_datos:
 *                           type: string
 *                           enum: ['ok', 'slow', 'error']
 *                         memoria_uso:
 *                           type: number
 *                         cpu_uso:
 *                           type: number
 *                         uptime:
 *                           type: number
 */
router.get('/health',
  MetricasController.obtenerSaludSistema
);

module.exports = router;
