const { v4: uuidv4 } = require('uuid');
const databaseConfig = require('../config/database');

/**
 * Modelo para la colección de aplicaciones
 * Representa las diferentes aplicaciones que registran eventos
 */
class AplicacionModel {
  constructor() {
    this.collectionName = 'aplicaciones';
  }

  /**
   * Obtener la colección de aplicaciones
   */
  getCollection() {
    return databaseConfig.getCollection(this.collectionName);
  }

  /**
   * Crear una nueva aplicación
   * @param {Object} appData - Datos de la aplicación
   * @returns {Object} - Aplicación creada
   */
  async crear(appData) {
    const aplicacion = {
      aplicacion_id: appData.aplicacion_id || uuidv4(),
      nombre: appData.nombre,
      descripcion: appData.descripcion || '',
      version: appData.version || '1.0.0',
      plataforma: appData.plataforma, // web, mobile, desktop
      url_base: appData.url_base || null,
      activa: true,
      configuracion: appData.configuracion || {},
      metadata: appData.metadata || {},
      fecha_registro: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const resultado = await this.getCollection().insertOne(aplicacion);

    return {
      ...aplicacion,
      _id: resultado.insertedId
    };
  }

  /**
   * Obtener aplicación por ID
   * @param {string} aplicacionId - ID de la aplicación
   * @returns {Object|null} - Aplicación encontrada
   */
  async obtenerPorId(aplicacionId) {
    return await this.getCollection().findOne({ aplicacion_id: aplicacionId });
  }

  /**
   * Obtener aplicación por nombre
   * @param {string} nombre - Nombre de la aplicación
   * @returns {Object|null} - Aplicación encontrada
   */
  async obtenerPorNombre(nombre) {
    return await this.getCollection().findOne({ nombre: nombre });
  }

  /**
   * Verificar si una aplicación existe
   * @param {string} aplicacionId - ID de la aplicación
   * @returns {boolean} - True si existe, false si no
   */
  async existe(aplicacionId) {
    const count = await this.getCollection().countDocuments({ aplicacion_id: aplicacionId });
    return count > 0;
  }

  /**
   * Obtener todas las aplicaciones activas
   * @param {Object} opciones - Opciones de filtrado
   * @returns {Array} - Lista de aplicaciones
   */
  async obtenerActivas(opciones = {}) {
    const filtro = { activa: true };

    if (opciones.plataforma) {
      filtro.plataforma = opciones.plataforma;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ fecha_registro: -1 });

    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    return await consulta.toArray();
  }

  /**
   * Obtener todas las aplicaciones (con paginación)
   * @param {Object} opciones - Opciones de paginación y filtrado
   * @returns {Array} - Lista de aplicaciones
   */
  async obtenerTodas(opciones = {}) {
    const filtro = {};

    if (opciones.activa !== undefined) {
      filtro.activa = opciones.activa;
    }

    if (opciones.plataforma) {
      filtro.plataforma = opciones.plataforma;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ fecha_registro: -1 });

    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    if (opciones.offset) {
      consulta.skip(parseInt(opciones.offset));
    }

    return await consulta.toArray();
  }

  /**
   * Actualizar configuración de una aplicación
   * @param {string} aplicacionId - ID de la aplicación
   * @param {Object} nuevaConfiguracion - Nueva configuración
   * @returns {Object} - Resultado de la actualización
   */
  async actualizarConfiguracion(aplicacionId, nuevaConfiguracion) {
    return await this.getCollection().updateOne(
      { aplicacion_id: aplicacionId },
      {
        $set: {
          configuracion: nuevaConfiguracion,
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Desactivar una aplicación
   * @param {string} aplicacionId - ID de la aplicación
   * @returns {Object} - Resultado de la actualización
   */
  async desactivar(aplicacionId) {
    return await this.getCollection().updateOne(
      { aplicacion_id: aplicacionId },
      {
        $set: {
          activa: false,
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Activar una aplicación
   * @param {string} aplicacionId - ID de la aplicación
   * @returns {Object} - Resultado de la actualización
   */
  async activar(aplicacionId) {
    return await this.getCollection().updateOne(
      { aplicacion_id: aplicacionId },
      {
        $set: {
          activa: true,
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Obtener estadísticas de uso por aplicación
   * @param {string} aplicacionId - ID de la aplicación
   * @param {Object} filtros - Filtros adicionales
   * @returns {Object} - Estadísticas de la aplicación
   */
  async obtenerEstadisticas(aplicacionId, filtros = {}) {
    const eventosCollection = databaseConfig.getCollection('eventos');
    const sesionesCollection = databaseConfig.getCollection('sesiones');

    const filtroBase = { aplicacion_id: aplicacionId };

    // Filtro de fecha si se especifica
    if (filtros.fechaInicio && filtros.fechaFin) {
      filtroBase.timestamp = {
        $gte: new Date(filtros.fechaInicio),
        $lte: new Date(filtros.fechaFin)
      };
    }

    // Estadísticas de eventos
    const estadisticasEventos = await eventosCollection.aggregate([
      { $match: filtroBase },
      {
        $group: {
          _id: null,
          totalEventos: { $sum: 1 },
          usuariosUnicos: { $addToSet: '$usuario_id' },
          tiposEventos: { $addToSet: '$tipo_evento' },
          sesionesUnicas: { $addToSet: '$sesion_id' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEventos: 1,
          usuariosUnicos: { $size: '$usuariosUnicos' },
          tiposEventos: { $size: '$tiposEventos' },
          sesionesUnicas: { $size: '$sesionesUnicas' }
        }
      }
    ]).toArray();

    // Estadísticas de sesiones
    const filtroSesiones = { aplicacion_id: aplicacionId };
    if (filtros.fechaInicio && filtros.fechaFin) {
      filtroSesiones.inicio_sesion = {
        $gte: new Date(filtros.fechaInicio),
        $lte: new Date(filtros.fechaFin)
      };
    }

    const estadisticasSesiones = await sesionesCollection.aggregate([
      { $match: filtroSesiones },
      {
        $group: {
          _id: null,
          totalSesiones: { $sum: 1 },
          sesionesActivas: {
            $sum: { $cond: [{ $eq: ['$activa', true] }, 1, 0] }
          },
          duracionPromedio: { $avg: '$duracion' }
        }
      }
    ]).toArray();

    const eventos = estadisticasEventos[0] || {
      totalEventos: 0,
      usuariosUnicos: 0,
      tiposEventos: 0,
      sesionesUnicas: 0
    };

    const sesiones = estadisticasSesiones[0] || {
      totalSesiones: 0,
      sesionesActivas: 0,
      duracionPromedio: 0
    };

    return {
      aplicacion_id: aplicacionId,
      eventos,
      sesiones,
      fecha_consulta: new Date()
    };
  }
}

module.exports = new AplicacionModel();
