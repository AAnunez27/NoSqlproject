const UsuarioModel = require('../models/usuario.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Controlador para la gestión de usuarios
 */
const UsuarioController = {
  /**
   * Crear un nuevo usuario
   * @route POST /api/users
   */
  crear: asyncHandler(async (req, res) => {
    const { usuario_id, nombre, email, metadata } = req.body;

    // Verificar si ya existe un usuario con el mismo ID o email
    if (usuario_id) {
      const usuarioExiste = await UsuarioModel.existe(usuario_id);
      if (usuarioExiste) {
        throw new AppError('Ya existe un usuario con este ID', 400);
      }
    }

    const usuarioExistePorEmail = await UsuarioModel.obtenerPorEmail(email);
    if (usuarioExistePorEmail) {
      throw new AppError('Ya existe un usuario con este email', 400);
    }

    const usuario = await UsuarioModel.crear({
      usuario_id,
      nombre,
      email,
      metadata
    });

    // No enviar datos sensibles en la respuesta
    const { _id, ...usuarioRespuesta } = usuario;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioRespuesta,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener usuario por ID
   * @route GET /api/users/:usuarioId
   */
  obtenerPorId: asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;

    const usuario = await UsuarioModel.obtenerPorId(usuarioId);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: usuario,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener usuario por email
   * @route GET /api/users/email/:email
   */
  obtenerPorEmail: asyncHandler(async (req, res) => {
    const { email } = req.params;

    const usuario = await UsuarioModel.obtenerPorEmail(email);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: usuario,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener todos los usuarios
   * @route GET /api/users
   */
  obtenerTodos: asyncHandler(async (req, res) => {
    const { limite, offset } = req.query;

    const opciones = {
      limite: limite || 50,
      offset: offset || 0
    };

    const usuarios = await UsuarioModel.obtenerTodos(opciones);

    res.json({
      success: true,
      data: {
        usuarios,
        total: usuarios.length,
        paginacion: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Actualizar último acceso del usuario
   * @route PATCH /api/users/:usuarioId/ultimo-acceso
   */
  actualizarUltimoAcceso: asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;

    // Verificar que el usuario existe
    const usuarioExiste = await UsuarioModel.existe(usuarioId);
    if (!usuarioExiste) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const resultado = await UsuarioModel.actualizarUltimoAcceso(usuarioId);

    if (resultado.modifiedCount === 0) {
      throw new AppError('No se pudo actualizar el último acceso', 400);
    }

    res.json({
      success: true,
      message: 'Último acceso actualizado exitosamente',
      data: {
        usuario_id: usuarioId,
        ultimo_acceso: new Date()
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Verificar si un usuario existe
   * @route GET /api/users/:usuarioId/exists
   */
  verificarExistencia: asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;

    const existe = await UsuarioModel.existe(usuarioId);

    res.json({
      success: true,
      data: {
        usuario_id: usuarioId,
        existe: existe
      },
      timestamp: new Date().toISOString()
    });
  })
};

module.exports = UsuarioController;
