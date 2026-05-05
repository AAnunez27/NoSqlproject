const { v4: uuidv4 } = require('uuid');
const databaseConfig = require('../config/database');

/**
 * Modelo para la colección de eventos
 * Basado en la especificación del documento técnico
 */
class EventoModel {
  constructor() {
    this.collectionName = 'eventos';
  }

  /**
   * Obtener la colección de eventos
   */
  getCollection() {
    return databaseConfig.getCollection(this.collectionName);
  }

  /**
   * Crear un nuevo evento
   * @param {Object} eventData - Datos del evento
   * @returns {Object} - Evento creado
   */
  async crear(eventData) {
    const evento = {
      evento_id: uuidv4(),
      usuario_id: eventData.usuario_id,
      sesion_id: eventData.sesion_id,
      aplicacion_id: eventData.aplicacion_id,
      tipo_evento: eventData.tipo_evento,
      timestamp: new Date(),
      metadata: eventData.metadata || {},
      ip_usuario: eventData.ip_usuario,
      user_agent: eventData.user_agent,
      url_origen: eventData.url_origen,
      created_at: new Date(),
      updated_at: new Date()
    };

    const resultado = await this.getCollection().insertOne(evento);

    return {
      ...evento,
      _id: resultado.insertedId
    };
  }

  /**
   * Obtener evento por ID
   * @param {string} eventoId - ID del evento
   * @returns {Object|null} - Evento encontrado
   */
  async obtenerPorId(eventoId) {
    return await this.getCollection().findOne({ evento_id: eventoId });
  }

  /**
   * Obtener eventos por usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Object} opciones - Opciones de filtrado y paginación
   * @returns {Array} - Lista de eventos
   */
  async obtenerPorUsuario(usuarioId, opciones = {}) {
    const filtro = { usuario_id: usuarioId };

    // Filtros adicionales
    if (opciones.fechaInicio && opciones.fechaFin) {
      filtro.timestamp = {
        $gte: new Date(opciones.fechaInicio),
        $lte: new Date(opciones.fechaFin)
      };
    }

    if (opciones.tipoEvento) {
      filtro.tipo_evento = opciones.tipoEvento;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ timestamp: -1 });

    // Paginación
    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    if (opciones.offset) {
      consulta.skip(parseInt(opciones.offset));
    }

    return await consulta.toArray();
  }

  /**
   * Obtener eventos por fecha
   * @param {Date|string} fechaInicio - Fecha de inicio
   * @param {Date|string} fechaFin - Fecha de fin (opcional)
   * @param {Object} opciones - Opciones adicionales
   * @returns {Array} - Lista de eventos
   */
  async obtenerPorFecha(fechaInicio, fechaFin = null, opciones = {}) {
    const filtro = {};

    if (fechaFin) {
      filtro.timestamp = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    } else {
      // Si solo se proporciona una fecha, buscar eventos de todo ese día
      const fecha = new Date(fechaInicio);
      const siguienteDia = new Date(fecha);
      siguienteDia.setDate(fecha.getDate() + 1);

      filtro.timestamp = {
        $gte: fecha,
        $lt: siguienteDia
      };
    }

    // Filtros adicionales
    if (opciones.usuarioId) {
      filtro.usuario_id = opciones.usuarioId;
    }

    if (opciones.tipoEvento) {
      filtro.tipo_evento = opciones.tipoEvento;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ timestamp: -1 });

    // Paginación
    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    return await consulta.toArray();
  }

  /**
   * Obtener eventos por tipo
   * @param {string} tipoEvento - Tipo de evento
   * @param {Object} opciones - Opciones de filtrado
   * @returns {Array} - Lista de eventos
   */
  async obtenerPorTipo(tipoEvento, opciones = {}) {
    const filtro = { tipo_evento: tipoEvento };

    // Filtros adicionales
    if (opciones.fechaInicio && opciones.fechaFin) {
      filtro.timestamp = {
        $gte: new Date(opciones.fechaInicio),
        $lte: new Date(opciones.fechaFin)
      };
    }

    if (opciones.usuarioId) {
      filtro.usuario_id = opciones.usuarioId;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ timestamp: -1 });

    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    return await consulta.toArray();
  }

  /**
   * Actualizar metadata de un evento
   * @param {string} eventoId - ID del evento
   * @param {Object} nuevaMetadata - Nueva metadata
   * @returns {Object} - Resultado de la actualización
   */
  async actualizarMetadata(eventoId, nuevaMetadata) {
    return await this.getCollection().updateOne(
      { evento_id: eventoId },
      {
        $set: {
          metadata: nuevaMetadata,
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Eliminar un evento
   * @param {string} eventoId - ID del evento
   * @returns {Object} - Resultado de la eliminación
   */
  async eliminar(eventoId) {
    return await this.getCollection().deleteOne({ evento_id: eventoId });
  }

  /**
   * Obtener métricas básicas
   * @param {Object} filtros - Filtros para las métricas
   * @returns {Object} - Métricas calculadas
   */
  async obtenerMetricasBasicas(filtros = {}) {
    const pipeline = [];

    // Filtro de fecha si se especifica
    if (filtros.fechaInicio && filtros.fechaFin) {
      pipeline.push({
        $match: {
          timestamp: {
            $gte: new Date(filtros.fechaInicio),
            $lte: new Date(filtros.fechaFin)
          }
        }
      });
    }

    // Agregar filtro de usuario si se especifica
    if (filtros.usuarioId) {
      pipeline.push({
        $match: { usuario_id: filtros.usuarioId }
      });
    }

    // Agregar métricas básicas
    pipeline.push({
      $group: {
        _id: null,
        totalEventos: { $sum: 1 },
        usuariosUnicos: { $addToSet: '$usuario_id' },
        tiposEventos: { $addToSet: '$tipo_evento' },
        aplicacionesUnicos: { $addToSet: '$aplicacion_id' },
        sesionesUnicas: { $addToSet: '$sesion_id' },
        fechaMin: { $min: '$timestamp' },
        fechaMax: { $max: '$timestamp' }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        totalEventos: 1,
        usuariosUnicos: { $size: '$usuariosUnicos' },
        tiposEventos: { $size: '$tiposEventos' },
        aplicacionesUnicos: { $size: '$aplicacionesUnicos' },
        sesionesUnicas: { $size: '$sesionesUnicas' },
        fechaMin: 1,
        fechaMax: 1
      }
    });

    const resultado = await this.getCollection().aggregate(pipeline).toArray();

    return resultado[0] || {
      totalEventos: 0,
      usuariosUnicos: 0,
      tiposEventos: 0,
      aplicacionesUnicos: 0,
      sesionesUnicas: 0,
      fechaMin: null,
      fechaMax: null
    };
  }

  /**
   * Obtener eventos agrupados por tipo
   * @param {Object} filtros - Filtros para la agrupación
   * @returns {Array} - Eventos agrupados por tipo
   */
  async obtenerEventosPorTipo(filtros = {}) {
    const pipeline = [];

    // Filtro de fecha si se especifica
    if (filtros.fechaInicio && filtros.fechaFin) {
      pipeline.push({
        $match: {
          timestamp: {
            $gte: new Date(filtros.fechaInicio),
            $lte: new Date(filtros.fechaFin)
          }
        }
      });
    }

    pipeline.push({
      $group: {
        _id: '$tipo_evento',
        cantidad: { $sum: 1 },
        usuariosUnicos: { $addToSet: '$usuario_id' }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        tipoEvento: '$_id',
        cantidad: 1,
        usuariosUnicos: { $size: '$usuariosUnicos' }
      }
    });

    pipeline.push({
      $sort: { cantidad: -1 }
    });

    return await this.getCollection().aggregate(pipeline).toArray();
  }

  /**
   * Contar total de eventos con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {number} - Número total de eventos
   */
  async contar(filtros = {}) {
    return await this.getCollection().countDocuments(filtros);
  }
}

module.exports = new EventoModel();
