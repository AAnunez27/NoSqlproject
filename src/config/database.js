require('dotenv').config();
const { MongoClient } = require('mongodb');

class DatabaseConfig {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Establece conexión con MongoDB Atlas usando variables de entorno
   */
  async connect() {
    try {
      const isTestEnvironment = process.env.NODE_ENV === 'test';

      // Usar variables de entorno según el ambiente
      const mongoUrl = isTestEnvironment
        ? process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
        : process.env.DATABASE_URL;

      const databaseName = isTestEnvironment
        ? process.env.COLECCION_TEST || 'test_database'
        : process.env.COLECCION || 'DATABASE';

      if (!mongoUrl) {
        throw new Error('DATABASE_URL no está definida en las variables de entorno');
      }

      this.client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(databaseName);
      this.isConnected = true;

      console.log(`✅ Conectado a MongoDB: ${databaseName} (${isTestEnvironment ? 'TEST' : 'PROD'})`);

      // Crear índices al conectar
      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Crear índices según la especificación del proyecto
   */
  async createIndexes() {
    try {
      // Índices para la colección eventos (principal)
      await this.db.collection('eventos').createIndex({ 'usuario_id': 1 });
      await this.db.collection('eventos').createIndex({ 'sesion_id': 1 });
      await this.db.collection('eventos').createIndex({ 'timestamp': -1 });
      await this.db.collection('eventos').createIndex({ 'tipo_evento': 1 });
      await this.db.collection('eventos').createIndex({ 'aplicacion_id': 1 });

      // Índice compuesto para consultas frecuentes
      await this.db.collection('eventos').createIndex({
        'usuario_id': 1,
        'timestamp': -1
      });

      // Índices para otras colecciones
      await this.db.collection('usuarios').createIndex({ 'usuario_id': 1 }, { unique: true });
      await this.db.collection('sesiones').createIndex({ 'sesion_id': 1 }, { unique: true });
      await this.db.collection('aplicaciones').createIndex({ 'aplicacion_id': 1 }, { unique: true });

      console.log('✅ Índices creados correctamente');
    } catch (error) {
      console.error('⚠️ Error creando índices:', error.message);
    }
  }

  /**
   * Obtener instancia de la base de datos
   */
  getDb() {
    if (!this.isConnected) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }
    return this.db;
  }

  /**
   * Obtener colección específica
   */
  getCollection(collectionName) {
    return this.getDb().collection(collectionName);
  }

  /**
   * Cerrar conexión
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 Desconectado de MongoDB');
    }
  }

  /**
   * Limpiar base de datos (solo para testing)
   */
  async clearDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('clearDatabase solo puede ejecutarse en entorno de testing');
    }

    const collections = ['eventos', 'usuarios', 'sesiones', 'aplicaciones'];

    for (const collectionName of collections) {
      await this.db.collection(collectionName).deleteMany({});
    }

    console.log('🧹 Base de datos de testing limpiada');
  }

  /**
   * Verificar estado de conexión
   */
  async ping() {
    try {
      await this.db.admin().ping();
      return { status: 'connected', timestamp: new Date() };
    } catch (error) {
      return { status: 'disconnected', error: error.message, timestamp: new Date() };
    }
  }
}

// Singleton para mantener una sola instancia
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig;
