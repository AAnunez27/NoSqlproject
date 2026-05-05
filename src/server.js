require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

// Importar configuración y middlewares
const databaseConfig = require('./config/database-mock'); // Usando versión simulada
const swaggerSpec = require('./config/swagger');
const {
  errorHandler,
  notFound,
  requestLogger,
  validateHeaders,
  timeoutHandler
} = require('./middleware/errorHandler');

// Importar rutas
const eventosRoutes = require('./routes/eventos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const aplicacionesRoutes = require('./routes/aplicaciones.routes');
const metricasRoutes = require('./routes/metricas.routes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares de seguridad y configuración
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitado para desarrollo
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(limiter);
app.use(timeoutHandler(30000)); // 30 segundos timeout
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateHeaders);

// Middleware de logging (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Configurar documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API User Behavior - Documentación',
  customfavIcon: '/assets/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true
  }
}));

// Endpoint para obtener el spec JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Sistema]
 *     summary: Health check del sistema
 *     description: Verifica el estado de salud de la API y la conexión a la base de datos
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         environment:
 *                           type: string
 *                           example: "development"
 *                         database:
 *                           type: string
 *                           example: "ok"
 *                         uptime:
 *                           type: number
 *                           description: "Tiempo activo del servidor en segundos"
 *                           example: 145.23
 *             examples:
 *               healthy:
 *                 summary: Sistema saludable
 *                 value:
 *                   success: true
 *                   message: "API funcionando correctamente"
 *                   data:
 *                     status: "healthy"
 *                     timestamp: "2026-05-05T00:56:09.835Z"
 *                     version: "1.0.0"
 *                     environment: "development"
 *                     database: "ok"
 *                     uptime: 145.23
 *       503:
 *         description: Problemas de conectividad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Ruta de health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await databaseConfig.ping();

    res.json({
      success: true,
      message: 'API funcionando correctamente',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus.status,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Problemas de conectividad',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Sistema]
 *     summary: Información principal de la API
 *     description: Endpoint de bienvenida que proporciona información sobre la API y sus endpoints disponibles
 *     responses:
 *       200:
 *         description: Información de la API obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         author:
 *                           type: string
 *                           example: "Aaron Nuñez Torres"
 *                         description:
 *                           type: string
 *                           example: "API para registro y análisis de eventos de usuario con MongoDB"
 *                         endpoints:
 *                           type: object
 *                           properties:
 *                             eventos:
 *                               type: string
 *                               example: "/api/events"
 *                             usuarios:
 *                               type: string
 *                               example: "/api/users"
 *                             aplicaciones:
 *                               type: string
 *                               example: "/api/applications"
 *                             métricas:
 *                               type: string
 *                               example: "/api/metrics"
 *                             salud:
 *                               type: string
 *                               example: "/health"
 *                         documentacion:
 *                           type: string
 *                           example: "/api/docs"
 *             examples:
 *               welcome:
 *                 summary: Respuesta de bienvenida
 *                 value:
 *                   success: true
 *                   message: "API REST para análisis de comportamiento de usuarios"
 *                   data:
 *                     version: "1.0.0"
 *                     author: "Aaron Nuñez Torres"
 *                     description: "API para registro y análisis de eventos de usuario con MongoDB"
 *                     endpoints:
 *                       eventos: "/api/events"
 *                       usuarios: "/api/users"
 *                       aplicaciones: "/api/applications"
 *                       métricas: "/api/metrics"
 *                       salud: "/health"
 *                     documentacion: "/api/docs"
 */
// Ruta principal de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST para análisis de comportamiento de usuarios',
    data: {
      version: '1.0.0',
      author: 'Aaron Nuñez Torres',
      description: 'API para registro y análisis de eventos de usuario con MongoDB',
      endpoints: {
        eventos: '/api/events',
        usuarios: '/api/users',
        aplicaciones: '/api/applications',
        métricas: '/api/metrics',
        salud: '/health'
      },
      documentacion: '/api/docs' // Para futuro Swagger
    },
    timestamp: new Date().toISOString()
  });
});

// Configurar rutas de la API
app.use('/api/events', eventosRoutes);
app.use('/api/users', usuariosRoutes);
app.use('/api/applications', aplicacionesRoutes);
app.use('/api/metrics', metricasRoutes);

// Middleware para rutas no encontradas (debe ir después de todas las rutas)
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Función para iniciar el servidor
async function startServer() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await databaseConfig.connect();

    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📋 Endpoints disponibles:');
      console.log('   POST   /api/events           - Crear evento');
      console.log('   GET    /api/events           - Listar eventos');
      console.log('   GET    /api/events/user/:id  - Eventos por usuario');
      console.log('   GET    /api/metrics/basic    - Métricas básicas');
      console.log('   GET    /api/metrics/health   - Estado del sistema');
      console.log('   GET    /health               - Health check');
    });

    // Configurar timeout del servidor
    server.timeout = 120000; // 2 minutos
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal) => {
      console.log(`\n📝 Recibida señal ${signal}, cerrando servidor...`);

      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado.');

        try {
          await databaseConfig.disconnect();
          console.log('✅ Desconexión limpia completada.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error durante el cierre:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 30 segundos
      setTimeout(() => {
        console.error('⏰ Forzando cierre del servidor...');
        process.exit(1);
      }, 30000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de excepciones no capturadas
    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promise rechazada no manejada en:', promise, 'razón:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    return server;

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('📊 Stack trace completo:', error.stack);
    console.error('🔧 Variables de entorno:');
    console.error(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA'}`);
    console.error(`   COLECCION: ${process.env.COLECCION || 'NO CONFIGURADA'}`);
    console.error(`   PORT: ${process.env.PORT || 'NO CONFIGURADA'}`);
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'NO CONFIGURADA'}`);
    console.error('🔧 Posibles soluciones:');
    console.error('   1. Verificar variables de entorno DATABASE_URL');
    console.error('   2. Comprobar conectividad a MongoDB Atlas');
    console.error('   3. Revisar configuración de red y firewall');

    // Intentar cerrar conexiones antes de salir
    try {
      if (databaseConfig && databaseConfig.disconnect) {
        await databaseConfig.disconnect();
        console.log('✅ Conexión DB cerrada correctamente');
      }
    } catch (disconnectError) {
      console.error('⚠️ Error cerrando conexión DB:', disconnectError.message);
    }

    process.exit(1);
  }
}

// Iniciar servidor si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
