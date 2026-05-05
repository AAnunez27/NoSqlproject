require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.mockMode = true; // Modo simulado para desarrollo sin MongoDB
  }

  /**
   * Simula conexión a MongoDB cuando no está disponible
   */
  async connect() {
    try {
      const mongoUrl = process.env.DATABASE_URL;

      if (!mongoUrl) {
        console.log('⚠️  DATABASE_URL no configurada, ejecutando en modo simulado');
        return await this.connectMockMode();
      }

      // Intentar conexión real (puede fallar)
      try {
        const { MongoClient } = require('mongodb');
        this.client = new MongoClient(mongoUrl, {
          serverSelectionTimeoutMS: 3000, // Solo 3 segundos para prueba rápida
          connectTimeoutMS: 3000,
        });

        await this.client.connect();

        const databaseName = process.env.COLECCION || 'DATABASE';
        this.db = this.client.db(databaseName);
        this.isConnected = true;
        this.mockMode = false;

        console.log('✅ Conectado exitosamente a MongoDB Atlas');
        return { status: 'connected', mode: 'real' };

      } catch (mongoError) {
        console.log('⚠️  No se pudo conectar a MongoDB Atlas, usando modo simulado');
        console.log('   Razón:', mongoError.message);
        return await this.connectMockMode();
      }

    } catch (error) {
      console.log('⚠️  Error de configuración, usando modo simulado');
      return await this.connectMockMode();
    }
  }

  /**
   * Modo simulado para desarrollo sin MongoDB
   */
  async connectMockMode() {
    this.mockMode = true;
    this.isConnected = true; // Simular que está conectado

    console.log('🔧 Ejecutando en MODO SIMULADO (sin MongoDB)');
    console.log('   → Los datos se almacenan solo en memoria');
    console.log('   → Perfecto para desarrollo y testing de la API');

    return { status: 'mock', mode: 'simulated' };
  }

  /**
   * Obtiene referencia a una colección (real o simulada)
   */
  collection(name) {
    if (this.mockMode) {
      return new MockCollection(name);
    }

    if (!this.isConnected || !this.db) {
      throw new Error('Base de datos no conectada');
    }

    return this.db.collection(name);
  }

  /**
   * Ping a la base de datos
   */
  async ping() {
    if (this.mockMode) {
      return {
        status: 'mock_ok',
        message: 'Modo simulado activo',
        timestamp: new Date().toISOString()
      };
    }

    if (!this.isConnected || !this.db) {
      throw new Error('Base de datos no conectada');
    }

    try {
      await this.db.admin().ping();
      return {
        status: 'ok',
        message: 'MongoDB respondiendo correctamente',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error en ping a MongoDB: ${error.message}`);
    }
  }

  /**
   * Cierra la conexión
   */
  async disconnect() {
    if (this.mockMode) {
      console.log('🔒 Cerrando modo simulado');
      return;
    }

    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✅ Conexión MongoDB cerrada correctamente');
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  isReady() {
    return this.isConnected;
  }

  /**
   * Obtiene información de estado
   */
  getStatus() {
    return {
      connected: this.isConnected,
      mode: this.mockMode ? 'simulated' : 'real',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Clase que simula una colección de MongoDB para desarrollo
 */
class MockCollection {
  constructor(name) {
    this.name = name;
    this.data = [];
    console.log(`📄 Colección simulada creada: ${name}`);
  }

  async insertOne(doc) {
    const newDoc = {
      _id: Math.random().toString(36).substr(2, 9),
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.data.push(newDoc);
    console.log(`📝 Documento insertado en ${this.name}:`, newDoc._id);

    return {
      insertedId: newDoc._id,
      acknowledged: true
    };
  }

  async find(query = {}) {
    console.log(`🔍 Búsqueda en ${this.name}`, query);

    return {
      toArray: async () => {
        return this.data.filter(item => {
          if (Object.keys(query).length === 0) return true;

          return Object.keys(query).every(key =>
            item[key] === query[key]
          );
        });
      },

      limit: (num) => ({
        toArray: async () => this.data.slice(0, num)
      }),

      sort: (sortObj) => ({
        toArray: async () => {
          const sorted = [...this.data];
          const key = Object.keys(sortObj)[0];
          const direction = sortObj[key];

          return sorted.sort((a, b) => {
            if (direction === 1) return a[key] > b[key] ? 1 : -1;
            return a[key] < b[key] ? 1 : -1;
          });
        }
      })
    };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query).toArray();
    return results.length;
  }

  async deleteMany(query) {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => {
      return !Object.keys(query).every(key =>
        item[key] === query[key]
      );
    });

    const deleted = initialLength - this.data.length;
    console.log(`🗑️  ${deleted} documentos eliminados de ${this.name}`);

    return { deletedCount: deleted };
  }
}

// Crear instancia única
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig;
