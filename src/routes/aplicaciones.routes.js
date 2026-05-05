const express = require('express');
const router = express.Router();
const AplicacionController = require('../controllers/aplicacion.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Aplicaciones]
 *     summary: Crear una nueva aplicación
 *     description: Registra una nueva aplicación en el sistema para tracking de eventos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AplicacionCrear'
 *           examples:
 *             app_web:
 *               summary: Aplicación web
 *               value:
 *                 nombre: "Mi E-commerce"
 *                 descripcion: "Tienda online de productos"
 *                 plataforma: "web"
 *                 url_base: "https://mitienda.com"
 *                 configuracion:
 *                   analytics_enabled: true
 *                   max_events_per_session: 1000
 *             app_mobile:
 *               summary: Aplicación móvil
 *               value:
 *                 aplicacion_id: "app_mobile_ios"
 *                 nombre: "App Móvil iOS"
 *                 descripcion: "App nativa para iOS"
 *                 plataforma: "mobile"
 *                 metadata:
 *                   version_ios: "15.0"
 *                   store_url: "https://apps.apple.com/..."
 *     responses:
 *       201:
 *         description: Aplicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Aplicacion'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Aplicación ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  validacion.validar(esquemas.crearAplicacion),
  AplicacionController.crear
);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     tags: [Aplicaciones]
 *     summary: Obtener todas las aplicaciones
 *     description: Lista todas las aplicaciones registradas en el sistema
 *     parameters:
 *       - in: query
 *         name: plataforma
 *         schema:
 *           type: string
 *           enum: ['web', 'mobile', 'desktop']
 *         description: Filtrar por tipo de plataforma
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Filtrar por aplicaciones activas
 *     responses:
 *       200:
 *         description: Lista de aplicaciones obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Aplicacion'
 */
router.get('/',
  AplicacionController.obtenerTodas
);

/**
 * @swagger
 * /api/applications/active:
 *   get:
 *     tags: [Aplicaciones]
 *     summary: Obtener aplicaciones activas
 *     description: Lista solo las aplicaciones que tienen actividad reciente
 *     responses:
 *       200:
 *         description: Lista de aplicaciones activas
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
 *                         $ref: '#/components/schemas/Aplicacion'
 */
router.get('/active',
  AplicacionController.obtenerActivas
);

/**
 * @swagger
 * /api/applications/{aplicacionId}/exists:
 *   get:
 *     tags: [Aplicaciones]
 *     summary: Verificar si una aplicación existe
 *     description: Verifica la existencia de una aplicación por su ID
 *     parameters:
 *       - in: path
 *         name: aplicacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la aplicación a verificar
 *     responses:
 *       200:
 *         description: Resultado de verificación
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
 *                         existe:
 *                           type: boolean
 *                         aplicacion_id:
 *                           type: string
 */
router.get('/:aplicacionId/exists',
  validacion.validar(esquemas.parametrosRuta.aplicacionId, 'params'),
  AplicacionController.verificarExistencia
);

/**
 * @swagger
 * /api/applications/{aplicacionId}/stats:
 *   get:
 *     tags: [Aplicaciones]
 *     summary: Obtener estadísticas de una aplicación
 *     description: Retorna estadísticas detalladas de una aplicación específica
 *     parameters:
 *       - in: path
 *         name: aplicacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la aplicación
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Número de días hacia atrás para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                         aplicacion_id:
 *                           type: string
 *                         nombre:
 *                           type: string
 *                         total_eventos:
 *                           type: number
 *                         usuarios_unicos:
 *                           type: number
 *                         sesiones_totales:
 *                           type: number
 *                         eventos_por_dia:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               fecha:
 *                                 type: string
 *                                 format: date
 *                               eventos:
 *                                 type: number
 *       404:
 *         description: Aplicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
