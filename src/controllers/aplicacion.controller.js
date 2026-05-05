const AplicacionModel = require('../models/aplicacion.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Controlador para la gestión de aplicaciones
 */
const AplicacionController = {
  /**
   * Crear una nueva aplicación
   * @route POST /api/applications
   */
  crear: asyncHandler(async (req, res) => {
    const { aplicacion_id, nombre, descripcion, version, plataforma, url_base, configuracion, metadata } = req.body;

    // Verificar si ya existe una aplicación con el mismo ID o nombre
    if (aplicacion_id) {
      const aplicacionExiste = await AplicacionModel.existe(aplicacion_id);
      if (aplicacionExiste) {
        throw new AppError('Ya existe una aplicación con este ID', 400);
      }
    }

    const aplicacionExistePorNombre = await AplicacionModel.obtenerPorNombre(nombre);
    if (aplicacionExistePorNombre) {
      throw new AppError('Ya existe una aplicación con este nombre', 400);
    }

    const aplicacion = await AplicacionModel.crear({
      aplicacion_id,
      nombre,
      descripcion,
      version,
      plataforma,
      url_base,
      configuracion,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Aplicación creada exitosamente',
      data: aplicacion,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener aplicación por ID
   * @route GET /api/applications/:aplicacionId
   */
  obtenerPorId: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;

    const aplicacion = await AplicacionModel.obtenerPorId(aplicacionId);

    if (!aplicacion) {
      throw new AppError('Aplicación no encontrada', 404);
    }

    res.json({
      success: true,
      data: aplicacion,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener todas las aplicaciones
   * @route GET /api/applications
   */
  obtenerTodas: asyncHandler(async (req, res) => {
    const { activa, plataforma, limite, offset } = req.query;

    const opciones = {
      activa: activa !== undefined ? activa === 'true' : undefined,
      plataforma,
      limite: limite || 50,
      offset: offset || 0
    };

    const aplicaciones = await AplicacionModel.obtenerTodas(opciones);

    res.json({
      success: true,
      data: {
        aplicaciones,
        total: aplicaciones.length,
        filtros: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener aplicaciones activas
   * @route GET /api/applications/active
   */
  obtenerActivas: asyncHandler(async (req, res) => {
    const { plataforma, limite } = req.query;

    const opciones = {
      plataforma,
      limite: limite || 50
    };

    const aplicaciones = await AplicacionModel.obtenerActivas(opciones);

    res.json({
      success: true,
      data: {
        aplicaciones,
        total: aplicaciones.length,
        filtros: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Actualizar configuración de una aplicación
   * @route PUT /api/applications/:aplicacionId/config
   */
  actualizarConfiguracion: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;
    const { configuracion } = req.body;

    // Verificar que la aplicación existe
    const aplicacionExiste = await AplicacionModel.existe(aplicacionId);
    if (!aplicacionExiste) {
      throw new AppError('Aplicación no encontrada', 404);
    }

    const resultado = await AplicacionModel.actualizarConfiguracion(aplicacionId, configuracion);

    if (resultado.modifiedCount === 0) {
      throw new AppError('No se pudo actualizar la configuración', 400);
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: {
        aplicacion_id: aplicacionId,
        configuracion
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Activar una aplicación
   * @route PATCH /api/applications/:aplicacionId/activate
   */
  activar: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;

    const aplicacionExiste = await AplicacionModel.existe(aplicacionId);
    if (!aplicacionExiste) {
      throw new AppError('Aplicación no encontrada', 404);
    }

    const resultado = await AplicacionModel.activar(aplicacionId);

    if (resultado.modifiedCount === 0) {
      throw new AppError('No se pudo activar la aplicación', 400);
    }

    res.json({
      success: true,
      message: 'Aplicación activada exitosamente',
      data: {
        aplicacion_id: aplicacionId,
        activa: true
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Desactivar una aplicación
   * @route PATCH /api/applications/:aplicacionId/deactivate
   */
  desactivar: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;

    const aplicacionExiste = await AplicacionModel.existe(aplicacionId);
    if (!aplicacionExiste) {
      throw new AppError('Aplicación no encontrada', 404);
    }

    const resultado = await AplicacionModel.desactivar(aplicacionId);

    if (resultado.modifiedCount === 0) {
      throw new AppError('No se pudo desactivar la aplicación', 400);
    }

    res.json({
      success: true,
      message: 'Aplicación desactivada exitosamente',
      data: {
        aplicacion_id: aplicacionId,
        activa: false
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener estadísticas de uso de una aplicación
   * @route GET /api/applications/:aplicacionId/stats
   */
  obtenerEstadisticas: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const aplicacionExiste = await AplicacionModel.existe(aplicacionId);
    if (!aplicacionExiste) {
      throw new AppError('Aplicación no encontrada', 404);
    }

    const filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fechaInicio = fechaInicio;
      filtros.fechaFin = fechaFin;
    }

    const estadisticas = await AplicacionModel.obtenerEstadisticas(aplicacionId, filtros);

    res.json({
      success: true,
      data: estadisticas,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Verificar si una aplicación existe
   * @route GET /api/applications/:aplicacionId/exists
   */
  verificarExistencia: asyncHandler(async (req, res) => {
    const { aplicacionId } = req.params;

    const existe = await AplicacionModel.existe(aplicacionId);

    res.json({
      success: true,
      data: {
        aplicacion_id: aplicacionId,
        existe: existe
      },
      timestamp: new Date().toISOString()
    });
  })
};

module.exports = AplicacionController;
