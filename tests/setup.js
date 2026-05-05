/**
 * Configuración de setup para tests
 * Se ejecuta antes de todos los tests
 */

require('dotenv').config();
const databaseConfig = require('../src/config/database');

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
process.env.COLECCION_TEST = process.env.COLECCION_TEST || 'test_database';

// Configurar timeouts para tests
jest.setTimeout(30000);

// Setup global antes de todos los tests
beforeAll(async () => {
  try {
    console.log('🧪 Configurando entorno de testing...');

    // Conectar a la base de datos de testing
    await databaseConfig.connect();

    // Limpiar la base de datos antes de empezar
    await databaseConfig.clearDatabase();

    console.log('✅ Entorno de testing configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando entorno de testing:', error);
    throw error;
  }
});

// Cleanup después de todos los tests
afterAll(async () => {
  try {
    console.log('🧹 Limpiando entorno de testing...');

    // Limpiar la base de datos después de los tests
    if (databaseConfig.isConnected) {
      await databaseConfig.clearDatabase();
      await databaseConfig.disconnect();
    }

    console.log('✅ Entorno de testing limpiado correctamente');
  } catch (error) {
    console.error('❌ Error limpiando entorno de testing:', error);
  }
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  if (databaseConfig.isConnected) {
    await databaseConfig.clearDatabase();
  }
});

// Suprimir logs durante testing (excepto errores)
const originalConsole = {
  log: console.log,
  warn: console.warn,
  info: console.info
};

if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
}

// Configuración global para tests
global.testConfig = {
  database: {
    url: process.env.DATABASE_URL_TEST,
    collection: process.env.COLECCION_TEST
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000
  }
};
