const EventoModel = require('../models/evento.model');
const UsuarioModel = require('../models/usuario.model');
const SesionModel = require('../models/sesion.model');
const AplicacionModel = require('../models/aplicacion.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Controlador para la gestión de eventos
 */
const EventoController = {
  /**
   * Crear un nuevo evento
   * @route POST /api/events
   */
  crear: asyncHandler(async (req, res) => {
    const { usuario_id, sesion_id, aplicacion_id, tipo_evento, metadata, ip_usuario, user_agent, url_origen } = req.body;

    // Verificar que el usuario existe o crearlo si no existe
    const usuarioExiste = await UsuarioModel.existe(usuario_id);
    if (!usuarioExiste) {
      // Auto-crear usuario básico si no existe
      await UsuarioModel.crear({
        usuario_id: usuario_id,
        nombre: `Usuario_${usuario_id}`,
        email: `${usuario_id}@temp.com`
      });
    }

    // Verificar que la aplicación existe
    const aplicacionExiste = await AplicacionModel.existe(aplicacion_id);
    if (!aplicacionExiste) {
      throw new AppError(`La aplicación ${aplicacion_id} no existe`, 400);
    }

    // Verificar que la sesión existe y está activa
    const sesionActiva = await SesionModel.estaActiva(sesion_id);
    if (!sesionActiva) {
      // Auto-crear sesión si no existe
      await SesionModel.crear({
        sesion_id: sesion_id,
        usuario_id: usuario_id,
        aplicacion_id: aplicacion_id,
        ip_usuario: ip_usuario,
        user_agent: user_agent
      });
    }

    // Crear el evento
    const evento = await EventoModel.crear({
      usuario_id,
      sesion_id,
      aplicacion_id,
      tipo_evento,
      metadata,
      ip_usuario: ip_usuario || req.ip,
      user_agent: user_agent || req.get('User-Agent'),
      url_origen
    });

    // Actualizar último acceso del usuario
    await UsuarioModel.actualizarUltimoAcceso(usuario_id);

    res.status(201).json({
      success: true,
      message: 'Evento registrado exitosamente',
      data: {
        evento_id: evento.evento_id,
        timestamp: evento.timestamp,
        tipo_evento: evento.tipo_evento
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener un evento por ID
   * @route GET /api/events/:eventoId
   */
  obtenerPorId: asyncHandler(async (req, res) => {
    const { eventoId } = req.params;

    const evento = await EventoModel.obtenerPorId(eventoId);

    if (!evento) {
      throw new AppError('Evento no encontrado', 404);
    }

    res.json({
      success: true,
      data: evento,
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener eventos por usuario
   * @route GET /api/events/user/:usuarioId
   */
  obtenerPorUsuario: asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;
    const { fechaInicio, fechaFin, tipoEvento, limite, offset } = req.query;

    // Verificar que el usuario existe
    const usuarioExiste = await UsuarioModel.existe(usuarioId);
    if (!usuarioExiste) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const opciones = {
      fechaInicio,
      fechaFin,
      tipoEvento,
      limite: limite || 50,
      offset: offset || 0
    };

    const eventos = await EventoModel.obtenerPorUsuario(usuarioId, opciones);
    const total = await EventoModel.contar({ usuario_id: usuarioId });

    res.json({
      success: true,
      data: {
        eventos,
        total,
        usuario_id: usuarioId,
        filtros: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener eventos por fecha
   * @route GET /api/events/date/:fecha
   */
  obtenerPorFecha: asyncHandler(async (req, res) => {
    const { fecha } = req.params;
    const { fechaFin, usuarioId, tipoEvento, limite } = req.query;

    const opciones = {
      usuarioId,
      tipoEvento,
      limite: limite || 100
    };

    const eventos = await EventoModel.obtenerPorFecha(fecha, fechaFin, opciones);

    res.json({
      success: true,
      data: {
        eventos,
        fecha_consulta: fecha,
        fecha_fin: fechaFin,
        total: eventos.length,
        filtros: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener eventos por tipo
   * @route GET /api/events/type/:tipoEvento
   */
  obtenerPorTipo: asyncHandler(async (req, res) => {
    const { tipoEvento } = req.params;
    const { fechaInicio, fechaFin, usuarioId, limite } = req.query;

    const opciones = {
      fechaInicio,
      fechaFin,
      usuarioId,
      limite: limite || 100
    };

    const eventos = await EventoModel.obtenerPorTipo(tipoEvento, opciones);

    res.json({
      success: true,
      data: {
        eventos,
        tipo_evento: tipoEvento,
        total: eventos.length,
        filtros: opciones
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Listar eventos con filtros dinámicos
   * @route GET /api/events
   */
  listar: asyncHandler(async (req, res) => {
    const {
      usuarioId,
      tipoEvento,
      aplicacionId,
      sesionId,
      fechaInicio,
      fechaFin,
      limite,
      offset
    } = req.query;

    // Construir filtros dinámicos
    const filtros = {};

    if (usuarioId) filtros.usuario_id = usuarioId;
    if (tipoEvento) filtros.tipo_evento = tipoEvento;
    if (aplicacionId) filtros.aplicacion_id = aplicacionId;
    if (sesionId) filtros.sesion_id = sesionId;

    if (fechaInicio && fechaFin) {
      filtros.timestamp = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    // Paginación
    const limiteNum = parseInt(limite) || 50;
    const offsetNum = parseInt(offset) || 0;

    // Obtener eventos
    const eventos = await EventoModel.getCollection()
      .find(filtros)
      .sort({ timestamp: -1 })
      .skip(offsetNum)
      .limit(limiteNum)
      .toArray();

    // Contar total
    const total = await EventoModel.contar(filtros);

    res.json({
      success: true,
      data: {
        eventos,
        total,
        filtros: req.query,
        paginacion: {
          limite: limiteNum,
          offset: offsetNum,
          pagina: Math.floor(offsetNum / limiteNum) + 1,
          total_paginas: Math.ceil(total / limiteNum)
        }
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Actualizar metadata de un evento
   * @route PUT /api/events/:eventoId/metadata
   */
  actualizarMetadata: asyncHandler(async (req, res) => {
    const { eventoId } = req.params;
    const { metadata } = req.body;

    // Verificar que el evento existe
    const eventoExiste = await EventoModel.obtenerPorId(eventoId);
    if (!eventoExiste) {
      throw new AppError('Evento no encontrado', 404);
    }

    const resultado = await EventoModel.actualizarMetadata(eventoId, metadata);

    if (resultado.modifiedCount === 0) {
      throw new AppError('No se pudo actualizar el evento', 400);
    }

    res.json({
      success: true,
      message: 'Metadata del evento actualizada exitosamente',
      data: {
        evento_id: eventoId,
        metadata
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Eliminar un evento
   * @route DELETE /api/events/:eventoId
   */
  eliminar: asyncHandler(async (req, res) => {
    const { eventoId } = req.params;

    // Verificar que el evento existe
    const eventoExiste = await EventoModel.obtenerPorId(eventoId);
    if (!eventoExiste) {
      throw new AppError('Evento no encontrado', 404);
    }

    const resultado = await EventoModel.eliminar(eventoId);

    if (resultado.deletedCount === 0) {
      throw new AppError('No se pudo eliminar el evento', 400);
    }

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente',
      data: {
        evento_id: eventoId
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener métricas básicas de eventos
   * @route GET /api/events/metrics/basic
   */
  metricas: asyncHandler(async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId, aplicacionId } = req.query;

    const filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fechaInicio = fechaInicio;
      filtros.fechaFin = fechaFin;
    }
    if (usuarioId) filtros.usuarioId = usuarioId;
    if (aplicacionId) filtros.aplicacionId = aplicacionId;

    // Obtener métricas básicas
    const metricas = await EventoModel.obtenerMetricasBasicas(filtros);

    // Obtener eventos agrupados por tipo
    const eventosPorTipo = await EventoModel.obtenerEventosPorTipo(filtros);

    res.json({
      success: true,
      data: {
        resumen: metricas,
        eventos_por_tipo: eventosPorTipo,
        filtros: req.query
      },
      timestamp: new Date().toISOString()
    });
  })
};

module.exports = EventoController;
