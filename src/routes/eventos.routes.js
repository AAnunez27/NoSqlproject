const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/evento.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Eventos]
 *     summary: Crear un nuevo evento
 *     description: Registra un nuevo evento de comportamiento de usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoCrear'
 *           examples:
 *             click_event:
 *               summary: Evento de click
 *               value:
 *                 usuarioId: "user_12345"
 *                 aplicacionId: "app_ecommerce"
 *                 tipoEvento: "click"
 *                 datos:
 *                   elemento: "boton_comprar"
 *                   valor: "producto_123"
 *                   url: "/productos/123"
 *                   precio: 29.99
 *             view_event:
 *               summary: Evento de visualización
 *               value:
 *                 usuarioId: "user_67890"
 *                 aplicacionId: "app_blog"
 *                 tipoEvento: "view"
 *                 datos:
 *                   elemento: "articulo"
 *                   valor: "articulo_456"
 *                   url: "/blog/articulo-456"
 *                   tiempo_lectura: 120
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Evento'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/',
  validacion.validar(esquemas.crearEvento),
  EventoController.crear
);

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Eventos]
 *     summary: Listar eventos con filtros
 *     description: Obtiene una lista paginada de eventos con filtros opcionales
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Cantidad de eventos por página
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de usuario específico
 *       - in: query
 *         name: aplicacionId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de aplicación
 *       - in: query
 *         name: tipoEvento
 *         schema:
 *           type: string
 *           enum: [click, view, scroll, form_submit, purchase, search, download, custom]
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha y hora de inicio del rango (ISO 8601)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha y hora de fin del rango (ISO 8601)
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida correctamente
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
 *                         eventos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Evento'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total de eventos
 *                             page:
 *                               type: integer
 *                               description: Página actual
 *                             limit:
 *                               type: integer
 *                               description: Límite por página
 *                             totalPages:
 *                               type: integer
 *                               description: Total de páginas
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  validacion.validar(esquemas.parametrosConsulta.consultaEventos, 'query'),
  EventoController.listar
);

/**
 * @swagger
 * /api/events/user/{usuarioId}:
 *   get:
 *     tags: [Eventos]
 *     summary: Obtener eventos por usuario
 *     description: Recupera todos los eventos asociados a un usuario específico
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del usuario
 *         example: "user_12345"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Eventos por página
 *       - in: query
 *         name: tipoEvento
 *         schema:
 *           type: string
 *           enum: [click, view, scroll, form_submit, purchase, search, download, custom]
 *         description: Filtrar por tipo específico de evento
 *     responses:
 *       200:
 *         description: Eventos del usuario obtenidos correctamente
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
 *                         usuarioId:
 *                           type: string
 *                           example: "user_12345"
 *                         eventos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Evento'
 *                         estadisticas:
 *                           type: object
 *                           properties:
 *                             totalEventos:
 *                               type: integer
 *                             eventosPorTipo:
 *                               type: object
 *                               additionalProperties:
 *                                 type: integer
 *       404:
 *         description: Usuario no encontrado o sin eventos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
