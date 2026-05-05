const { v4: uuidv4 } = require('uuid');
const databaseConfig = require('../config/database');

/**
 * Modelo para la colección de sesiones
 * Representa sesiones de usuario en aplicaciones
 */
class SesionModel {
  constructor() {
    this.collectionName = 'sesiones';
  }

  /**
   * Obtener la colección de sesiones
   */
  getCollection() {
    return databaseConfig.getCollection(this.collectionName);
  }

  /**
   * Crear una nueva sesión
   * @param {Object} sesionData - Datos de la sesión
   * @returns {Object} - Sesión creada
   */
  async crear(sesionData) {
    const sesion = {
      sesion_id: sesionData.sesion_id || uuidv4(),
      usuario_id: sesionData.usuario_id,
      aplicacion_id: sesionData.aplicacion_id,
      inicio_sesion: new Date(),
      fin_sesion: null,
      ip_usuario: sesionData.ip_usuario,
      user_agent: sesionData.user_agent,
      plataforma: sesionData.plataforma,
      dispositivo: sesionData.dispositivo,
      duracion: null,
      activa: true,
      metadata: sesionData.metadata || {},
      created_at: new Date(),
      updated_at: new Date()
    };

    const resultado = await this.getCollection().insertOne(sesion);

    return {
      ...sesion,
      _id: resultado.insertedId
    };
  }

  /**
   * Obtener sesión por ID
   * @param {string} sesionId - ID de la sesión
   * @returns {Object|null} - Sesión encontrada
   */
  async obtenerPorId(sesionId) {
    return await this.getCollection().findOne({ sesion_id: sesionId });
  }

  /**
   * Obtener sesiones por usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Object} opciones - Opciones de filtrado
   * @returns {Array} - Lista de sesiones
   */
  async obtenerPorUsuario(usuarioId, opciones = {}) {
    const filtro = { usuario_id: usuarioId };

    if (opciones.activa !== undefined) {
      filtro.activa = opciones.activa;
    }

    const consulta = this.getCollection()
      .find(filtro)
      .sort({ inicio_sesion: -1 });

    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    return await consulta.toArray();
  }

  /**
   * Finalizar una sesión
   * @param {string} sesionId - ID de la sesión
   * @returns {Object} - Resultado de la actualización
   */
  async finalizar(sesionId) {
    const sesion = await this.obtenerPorId(sesionId);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    const finSesion = new Date();
    const duracion = Math.floor((finSesion - sesion.inicio_sesion) / 1000); // Duración en segundos

    return await this.getCollection().updateOne(
      { sesion_id: sesionId },
      {
        $set: {
          fin_sesion: finSesion,
          duracion: duracion,
          activa: false,
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Verificar si una sesión está activa
   * @param {string} sesionId - ID de la sesión
   * @returns {boolean} - True si está activa, false si no
   */
  async estaActiva(sesionId) {
    const sesion = await this.getCollection().findOne({
      sesion_id: sesionId,
      activa: true
    });
    return sesion !== null;
  }

  /**
   * Obtener sesiones activas por aplicación
   * @param {string} aplicacionId - ID de la aplicación
   * @returns {Array} - Lista de sesiones activas
   */
  async obtenerActivasPorAplicacion(aplicacionId) {
    return await this.getCollection()
      .find({
        aplicacion_id: aplicacionId,
        activa: true
      })
      .toArray();
  }

  /**
   * Obtener métricas de sesiones
   * @param {Object} filtros - Filtros para las métricas
   * @returns {Object} - Métricas de sesiones
   */
  async obtenerMetricas(filtros = {}) {
    const pipeline = [];

    // Filtro de fecha si se especifica
    if (filtros.fechaInicio && filtros.fechaFin) {
      pipeline.push({
        $match: {
          inicio_sesion: {
            $gte: new Date(filtros.fechaInicio),
            $lte: new Date(filtros.fechaFin)
          }
        }
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalSesiones: { $sum: 1 },
        sesionesActivas: {
          $sum: { $cond: [{ $eq: ['$activa', true] }, 1, 0] }
        },
        usuariosUnicos: { $addToSet: '$usuario_id' },
        aplicacionesUnicas: { $addToSet: '$aplicacion_id' },
        duracionPromedio: { $avg: '$duracion' },
        duracionMaxima: { $max: '$duracion' },
        duracionMinima: { $min: '$duracion' }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        totalSesiones: 1,
        sesionesActivas: 1,
        usuariosUnicos: { $size: '$usuariosUnicos' },
        aplicacionesUnicas: { $size: '$aplicacionesUnicas' },
        duracionPromedio: { $round: ['$duracionPromedio', 2] },
        duracionMaxima: 1,
        duracionMinima: 1
      }
    });

    const resultado = await this.getCollection().aggregate(pipeline).toArray();

    return resultado[0] || {
      totalSesiones: 0,
      sesionesActivas: 0,
      usuariosUnicos: 0,
      aplicacionesUnicas: 0,
      duracionPromedio: 0,
      duracionMaxima: 0,
      duracionMinima: 0
    };
  }

  /**
   * Actualizar metadata de una sesión
   * @param {string} sesionId - ID de la sesión
   * @param {Object} nuevaMetadata - Nueva metadata
   * @returns {Object} - Resultado de la actualización
   */
  async actualizarMetadata(sesionId, nuevaMetadata) {
    return await this.getCollection().updateOne(
      { sesion_id: sesionId },
      {
        $set: {
          metadata: nuevaMetadata,
          updated_at: new Date()
        }
      }
    );
  }
}

module.exports = new SesionModel();
