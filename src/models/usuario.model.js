const { v4: uuidv4 } = require('uuid');
const databaseConfig = require('../config/database');

/**
 * Modelo para la colección de usuarios
 * Referencia para identificar usuarios únicos en el sistema
 */
class UsuarioModel {
  constructor() {
    this.collectionName = 'usuarios';
  }

  /**
   * Obtener la colección de usuarios
   */
  getCollection() {
    return databaseConfig.getCollection(this.collectionName);
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} - Usuario creado
   */
  async crear(userData) {
    const usuario = {
      usuario_id: userData.usuario_id || uuidv4(),
      nombre: userData.nombre,
      email: userData.email,
      metadata: userData.metadata || {},
      fecha_registro: new Date(),
      ultimo_acceso: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const resultado = await this.getCollection().insertOne(usuario);

    return {
      ...usuario,
      _id: resultado.insertedId
    };
  }

  /**
   * Obtener usuario por ID
   * @param {string} usuarioId - ID del usuario
   * @returns {Object|null} - Usuario encontrado
   */
  async obtenerPorId(usuarioId) {
    return await this.getCollection().findOne({ usuario_id: usuarioId });
  }

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @returns {Object|null} - Usuario encontrado
   */
  async obtenerPorEmail(email) {
    return await this.getCollection().findOne({ email: email });
  }

  /**
   * Actualizar último acceso del usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Object} - Resultado de la actualización
   */
  async actualizarUltimoAcceso(usuarioId) {
    return await this.getCollection().updateOne(
      { usuario_id: usuarioId },
      {
        $set: {
          ultimo_acceso: new Date(),
          updated_at: new Date()
        }
      }
    );
  }

  /**
   * Verificar si un usuario existe
   * @param {string} usuarioId - ID del usuario
   * @returns {boolean} - True si existe, false si no
   */
  async existe(usuarioId) {
    const count = await this.getCollection().countDocuments({ usuario_id: usuarioId });
    return count > 0;
  }

  /**
   * Obtener todos los usuarios (con paginación)
   * @param {Object} opciones - Opciones de paginación
   * @returns {Array} - Lista de usuarios
   */
  async obtenerTodos(opciones = {}) {
    const consulta = this.getCollection()
      .find({})
      .sort({ fecha_registro: -1 });

    if (opciones.limite) {
      consulta.limit(parseInt(opciones.limite));
    }

    if (opciones.offset) {
      consulta.skip(parseInt(opciones.offset));
    }

    return await consulta.toArray();
  }
}

module.exports = new UsuarioModel();
