const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear un nuevo usuario
 *     description: Registra un nuevo usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCrear'
 *           examples:
 *             usuario_basico:
 *               summary: Usuario básico
 *               value:
 *                 nombre: "Juan Pérez"
 *                 email: "juan@ejemplo.com"
 *                 metadata:
 *                   edad: 30
 *                   ciudad: "Madrid"
 *             usuario_completo:
 *               summary: Usuario con ID personalizado
 *               value:
 *                 usuario_id: "user_12345"
 *                 nombre: "María García"
 *                 email: "maria@ejemplo.com"
 *                 metadata:
 *                   edad: 28
 *                   ciudad: "Barcelona"
 *                   preferencias:
 *                     tema: "oscuro"
 *                     idioma: "es"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  validacion.validar(esquemas.crearUsuario),
  UsuarioController.crear
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener todos los usuarios
 *     description: Lista todos los usuarios con paginación opcional
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
 *         description: Cantidad de usuarios por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                         usuarios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Usuario'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             pages:
 *                               type: integer
 */
router.get('/',
  validacion.validar(esquemas.parametrosConsulta.paginacion, 'query'),
  UsuarioController.obtenerTodos
);

/**
 * @swagger
 * /api/users/{usuarioId}/exists:
 *   get:
 *     tags: [Usuarios]
 *     summary: Verificar si un usuario existe
 *     description: Verifica la existencia de un usuario por su ID
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a verificar
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
 *                         usuario_id:
 *                           type: string
 */
router.get('/:usuarioId/exists',
  validacion.validar(esquemas.parametrosRuta.usuarioId, 'params'),
  UsuarioController.verificarExistencia
);

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por email
 *     description: Busca un usuario específico por su dirección de email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email del usuario a buscar
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/email/:email',
  UsuarioController.obtenerPorEmail
);

/**
 * @swagger
 * /api/users/{usuarioId}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 *     description: Busca un usuario específico por su ID
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a buscar
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:usuarioId',
  validacion.validar(esquemas.parametrosRuta.usuarioId, 'params'),
  UsuarioController.obtenerPorId
);

/**
 * @route PATCH /api/users/:usuarioId/ultimo-acceso
 * @desc Actualizar último acceso del usuario
 * @access Public
 */
router.patch('/:usuarioId/ultimo-acceso',
  validacion.validar(esquemas.parametrosRuta.usuarioId, 'params'),
  UsuarioController.actualizarUltimoAcceso
);

module.exports = router;
