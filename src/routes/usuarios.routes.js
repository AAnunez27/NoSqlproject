const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { validacion, esquemas } = require('../middleware/validacion');

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Public
 */
router.post('/',
  validacion.validar(esquemas.crearUsuario),
  UsuarioController.crear
);

/**
 * @route GET /api/users
 * @desc Obtener todos los usuarios
 * @access Public
 */
router.get('/',
  validacion.validar(esquemas.parametrosConsulta.paginacion, 'query'),
  UsuarioController.obtenerTodos
);

/**
 * @route GET /api/users/:usuarioId/exists
 * @desc Verificar si un usuario existe
 * @access Public
 */
router.get('/:usuarioId/exists',
  validacion.validar(esquemas.parametrosRuta.usuarioId, 'params'),
  UsuarioController.verificarExistencia
);

/**
 * @route GET /api/users/email/:email
 * @desc Obtener usuario por email
 * @access Public
 */
router.get('/email/:email',
  UsuarioController.obtenerPorEmail
);

/**
 * @route GET /api/users/:usuarioId
 * @desc Obtener usuario por ID
 * @access Public
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
