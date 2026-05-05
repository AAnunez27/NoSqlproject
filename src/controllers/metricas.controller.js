const EventoModel = require('../models/evento.model');
const UsuarioModel = require('../models/usuario.model');
const SesionModel = require('../models/sesion.model');
const AplicacionModel = require('../models/aplicacion.model');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Controlador para métricas generales del sistema
 */
const MetricasController = {
  /**
   * Obtener métricas básicas del sistema
   * @route GET /api/metrics/basic
   */
  obtenerBasicas: asyncHandler(async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId, aplicacionId } = req.query;

    const filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fechaInicio = fechaInicio;
      filtros.fechaFin = fechaFin;
    }
    if (usuarioId) filtros.usuarioId = usuarioId;
    if (aplicacionId) filtros.aplicacionId = aplicacionId;

    // Obtener métricas de eventos
    const metricsEventos = await EventoModel.obtenerMetricasBasicas(filtros);

    // Obtener métricas de sesiones
    const metricasSesiones = await SesionModel.obtenerMetricas(filtros);

    // Obtener eventos agrupados por tipo
    const eventosPorTipo = await EventoModel.obtenerEventosPorTipo(filtros);

    res.json({
      success: true,
      data: {
        eventos: metricsEventos,
        sesiones: metricasSesiones,
        eventos_por_tipo: eventosPorTipo,
        filtros: req.query,
        periodo_consulta: {
          inicio: fechaInicio || 'Sin filtro',
          fin: fechaFin || 'Sin filtro'
        }
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener resumen general del sistema
   * @route GET /api/metrics/summary
   */
  obtenerResumen: asyncHandler(async (req, res) => {
    const fechaActual = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaActual.getDate() - 30); // Últimos 30 días

    // Métricas de eventos (últimos 30 días)
    const metricsEventos = await EventoModel.obtenerMetricasBasicas({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaActual.toISOString()
    });

    // Métricas de sesiones (últimos 30 días)
    const metricasSesiones = await SesionModel.obtenerMetricas({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaActual.toISOString()
    });

    // Total de usuarios registrados
    const totalUsuarios = await UsuarioModel.getCollection().countDocuments({});

    // Total de aplicaciones activas
    const totalAppsActivas = await AplicacionModel.getCollection().countDocuments({ activa: true });

    // Eventos por día (últimos 7 días)
    const hace7dias = new Date();
    hace7dias.setDate(fechaActual.getDate() - 7);

    const eventosPorDia = await EventoModel.getCollection().aggregate([
      {
        $match: {
          timestamp: {
            $gte: hace7dias,
            $lte: fechaActual
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        resumen_30_dias: {
          eventos: metricsEventos,
          sesiones: metricasSesiones
        },
        totales: {
          usuarios_registrados: totalUsuarios,
          aplicaciones_activas: totalAppsActivas
        },
        eventos_ultimos_7_dias: eventosPorDia,
        periodo_analisis: {
          inicio: fechaInicio.toISOString(),
          fin: fechaActual.toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener métricas por aplicación
   * @route GET /api/metrics/by-application
   */
  obtenerPorAplicacion: asyncHandler(async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    // Obtener estadísticas para todas las aplicaciones activas
    const aplicacionesActivas = await AplicacionModel.obtenerActivas();

    const estadisticasPorApp = [];

    for (const app of aplicacionesActivas) {
      const filtros = {};
      if (fechaInicio && fechaFin) {
        filtros.fechaInicio = fechaInicio;
        filtros.fechaFin = fechaFin;
      }

      const stats = await AplicacionModel.obtenerEstadisticas(app.aplicacion_id, filtros);
      estadisticasPorApp.push({
        aplicacion: {
          id: app.aplicacion_id,
          nombre: app.nombre,
          plataforma: app.plataforma
        },
        estadisticas: stats
      });
    }

    res.json({
      success: true,
      data: {
        aplicaciones: estadisticasPorApp,
        total_aplicaciones: aplicacionesActivas.length,
        filtros: req.query
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener métricas de usuarios más activos
   * @route GET /api/metrics/top-users
   */
  obtenerUsuariosActivos: asyncHandler(async (req, res) => {
    const { fechaInicio, fechaFin, limite } = req.query;
    const limiteNum = parseInt(limite) || 10;

    const pipeline = [];

    // Filtro de fecha si se especifica
    if (fechaInicio && fechaFin) {
      pipeline.push({
        $match: {
          timestamp: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
          }
        }
      });
    }

    // Agrupar por usuario y contar eventos
    pipeline.push({
      $group: {
        _id: '$usuario_id',
        total_eventos: { $sum: 1 },
        tipos_eventos: { $addToSet: '$tipo_evento' },
        aplicaciones: { $addToSet: '$aplicacion_id' },
        primer_evento: { $min: '$timestamp' },
        ultimo_evento: { $max: '$timestamp' }
      }
    });

    // Proyectar y ordenar
    pipeline.push({
      $project: {
        usuario_id: '$_id',
        total_eventos: 1,
        tipos_eventos_unicos: { $size: '$tipos_eventos' },
        aplicaciones_usadas: { $size: '$aplicaciones' },
        primer_evento: 1,
        ultimo_evento: 1,
        _id: 0
      }
    });

    pipeline.push({
      $sort: { total_eventos: -1 }
    });

    pipeline.push({
      $limit: limiteNum
    });

    const usuariosActivos = await EventoModel.getCollection().aggregate(pipeline).toArray();

    res.json({
      success: true,
      data: {
        usuarios_activos: usuariosActivos,
        filtros: req.query,
        limite: limiteNum
      },
      timestamp: new Date().toISOString()
    });
  }),

  /**
   * Obtener estado de salud del sistema
   * @route GET /api/metrics/health
   */
  obtenerSaludSistema: asyncHandler(async (req, res) => {
    const databaseConfig = require('../config/database');

    // Verificar conexión a la base de datos
    const dbStatus = await databaseConfig.ping();

    // Contar documentos en las colecciones principales
    const counts = {
      eventos: await EventoModel.contar(),
      usuarios: await UsuarioModel.getCollection().countDocuments({}),
      sesiones: await SesionModel.getCollection().countDocuments({}),
      aplicaciones: await AplicacionModel.getCollection().countDocuments({})
    };

    // Verificar eventos recientes (última hora)
    const hace1Hora = new Date();
    hace1Hora.setHours(hace1Hora.getHours() - 1);

    const eventosRecientes = await EventoModel.contar({
      timestamp: { $gte: hace1Hora }
    });

    const health = {
      status: dbStatus.status === 'connected' ? 'healthy' : 'unhealthy',
      database: dbStatus,
      collections: counts,
      actividad_reciente: {
        eventos_ultima_hora: eventosRecientes,
        timestamp: new Date()
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health,
      timestamp: new Date().toISOString()
    });
  })
};

module.exports = MetricasController;
