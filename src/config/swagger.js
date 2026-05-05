const swaggerJSDoc = require('swagger-jsdoc');

// Configuración dinámica de servidores con autodetección inteligente
const getServers = () => {
  const servers = [];
  const currentPort = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Autodetección del servidor actual
  if (nodeEnv === 'production') {
    // PRODUCCIÓN: Detectar automáticamente la URL de Render u otros providers

    // Render proporciona RENDER_EXTERNAL_URL automáticamente
    if (process.env.RENDER_EXTERNAL_URL) {
      servers.push({
        url: process.env.RENDER_EXTERNAL_URL,
        description: 'Servidor de producción (Render + MongoDB Atlas)'
      });
    }
    // Heroku proporciona estas variables
    else if (process.env.HEROKU_APP_NAME) {
      servers.push({
        url: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
        description: 'Servidor de producción (Heroku + MongoDB Atlas)'
      });
    }
    // Vercel proporciona VERCEL_URL
    else if (process.env.VERCEL_URL) {
      servers.push({
        url: `https://${process.env.VERCEL_URL}`,
        description: 'Servidor de producción (Vercel + MongoDB Atlas)'
      });
    }
    // Railway proporciona RAILWAY_STATIC_URL
    else if (process.env.RAILWAY_STATIC_URL) {
      servers.push({
        url: process.env.RAILWAY_STATIC_URL,
        description: 'Servidor de producción (Railway + MongoDB Atlas)'
      });
    }
    // Fallback: construir URL genérica
    else {
      const protocol = process.env.HTTPS ? 'https' : 'http';
      const host = process.env.HOST || 'localhost';
      servers.push({
        url: `${protocol}://${host}:${currentPort}`,
        description: 'Servidor de producción (MongoDB Atlas)'
      });
    }

  } else {
    // DESARROLLO: Servidor local con puerto autodetectado
    servers.push({
      url: `http://localhost:${currentPort}`,
      description: `Servidor de desarrollo local (Puerto ${currentPort} + Datos simulados)`
    });

    // En desarrollo, también mostrar referencia a producción si existe
    if (process.env.RENDER_EXTERNAL_URL) {
      servers.push({
        url: process.env.RENDER_EXTERNAL_URL,
        description: 'Servidor de producción (Render + MongoDB Atlas - Referencia)'
      });
    }
  }

  // Log para debugging (solo en desarrollo)
  if (nodeEnv === 'development') {
    console.log('🌐 Servidores Swagger detectados:', servers.map(s => `${s.url} (${s.description})`));
  }

  return servers;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST para Análisis de Comportamiento de Usuarios',
      version: '1.0.0',
      description: `
        API REST completa para el registro y análisis de eventos de comportamiento de usuarios.
        Construida con Node.js, Express y MongoDB para aplicaciones de analíticas en tiempo real.

        ## Características principales:
        - 📊 Registro de eventos de usuario en tiempo real
        - 👥 Gestión de usuarios y aplicaciones
        - 📈 Métricas y analíticas avanzadas
        - 🔒 Validación robusta de datos
        - ⚡ Respuestas optimizadas para alto rendimiento

        ## Autenticación
        Actualmente la API es pública para desarrollo. En producción se implementará autenticación JWT.

        ## Rate Limiting
        - Máximo 1000 requests por IP cada 15 minutos
        - Headers incluidos: X-RateLimit-Limit, X-RateLimit-Remaining

        ## Formato de respuesta
        Todas las respuestas siguen el formato estándar:
        \`\`\`json
        {
          "success": boolean,
          "message": "string",
          "data": object | array,
          "error": "string (solo en errores)",
          "timestamp": "ISO string"
        }
        \`\`\`
      `,
      contact: {
        name: 'Aaron Nuñez Torres',
        email: 'aaron@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: getServers(),
    tags: [
      {
        name: 'Sistema',
        description: 'Endpoints de estado y salud del sistema'
      },
      {
        name: 'Eventos',
        description: 'Gestión de eventos de comportamiento de usuario'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Aplicaciones',
        description: 'Gestión de aplicaciones registradas'
      },
      {
        name: 'Métricas',
        description: 'Analíticas y métricas del sistema'
      }
    ],
    components: {
      schemas: {
        // Schema para respuesta estándar
        StandardResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo de la operación'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta (estructura varía según endpoint)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp ISO de la respuesta'
            }
          },
          required: ['success', 'message', 'timestamp']
        },

        // Schema para eventos
        Evento: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del evento'
            },
            usuario_id: {
              type: 'string',
              description: 'ID del usuario que generó el evento'
            },
            sesion_id: {
              type: 'string',
              description: 'ID de la sesión del usuario'
            },
            aplicacion_id: {
              type: 'string',
              description: 'ID de la aplicación donde ocurrió el evento'
            },
            tipo_evento: {
              type: 'string',
              description: 'Tipo de evento registrado'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos específicos del evento (estructura flexible)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Momento exacto del evento'
            },
            ip_usuario: {
              type: 'string',
              description: 'Dirección IP del usuario'
            },
            user_agent: {
              type: 'string',
              description: 'User-Agent del navegador'
            },
            url_origen: {
              type: 'string',
              description: 'URL donde se originó el evento'
            }
          },
          required: ['usuario_id', 'sesion_id', 'aplicacion_id', 'tipo_evento', 'timestamp']
        },

        // Schema para crear evento
        EventoCrear: {
          type: 'object',
          properties: {
            usuario_id: {
              type: 'string',
              description: 'ID del usuario (requerido)',
              example: 'user_12345',
              minLength: 1,
              maxLength: 100
            },
            sesion_id: {
              type: 'string',
              description: 'ID de la sesión (requerido)',
              example: 'session_abc123',
              minLength: 1,
              maxLength: 100
            },
            aplicacion_id: {
              type: 'string',
              description: 'ID de la aplicación (requerido)',
              example: 'app_ecommerce',
              minLength: 1,
              maxLength: 100
            },
            tipo_evento: {
              type: 'string',
              description: 'Tipo de evento (requerido)',
              example: 'click',
              minLength: 1,
              maxLength: 50
            },
            metadata: {
              type: 'object',
              description: 'Metadatos del evento',
              example: {
                elemento: 'boton_comprar',
                valor: 'producto_123',
                url: '/productos/123',
                precio: 29.99
              }
            },
            ip_usuario: {
              type: 'string',
              description: 'IP del usuario (opcional)',
              format: 'ipv4'
            },
            user_agent: {
              type: 'string',
              description: 'User-Agent del navegador (opcional)',
              maxLength: 500
            },
            url_origen: {
              type: 'string',
              description: 'URL donde ocurrió el evento (opcional)',
              format: 'uri',
              maxLength: 500
            }
          },
          required: ['usuario_id', 'sesion_id', 'aplicacion_id', 'tipo_evento']
        },

        // Schema para usuario
        Usuario: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario en la base de datos'
            },
            usuario_id: {
              type: 'string',
              description: 'ID externo del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales del usuario'
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del usuario'
            },
            ultima_actividad: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actividad'
            }
          }
        },

        // Schema para crear usuario
        UsuarioCrear: {
          type: 'object',
          properties: {
            usuario_id: {
              type: 'string',
              description: 'ID único del usuario (opcional, se genera si no se proporciona)',
              minLength: 1,
              maxLength: 100
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario (requerido)',
              minLength: 1,
              maxLength: 100,
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario (requerido)',
              maxLength: 255,
              example: 'juan@ejemplo.com'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales del usuario',
              example: {
                edad: 30,
                ciudad: 'Madrid',
                preferencias: { tema: 'oscuro' }
              }
            }
          },
          required: ['nombre', 'email']
        },

        // Schema para aplicación
        Aplicacion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la aplicación en la base de datos'
            },
            aplicacion_id: {
              type: 'string',
              description: 'ID externo de la aplicación'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la aplicación'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción de la aplicación'
            },
            version: {
              type: 'string',
              description: 'Versión de la aplicación'
            },
            plataforma: {
              type: 'string',
              enum: ['web', 'mobile', 'desktop'],
              description: 'Plataforma de la aplicación'
            },
            url_base: {
              type: 'string',
              format: 'uri',
              description: 'URL base de la aplicación'
            },
            configuracion: {
              type: 'object',
              description: 'Configuración específica de la aplicación'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales'
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },

        // Schema para crear aplicación
        AplicacionCrear: {
          type: 'object',
          properties: {
            aplicacion_id: {
              type: 'string',
              description: 'ID único de la aplicación (opcional, se genera si no se proporciona)',
              minLength: 1,
              maxLength: 100
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la aplicación (requerido)',
              minLength: 1,
              maxLength: 100,
              example: 'Mi App E-commerce'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción de la aplicación',
              maxLength: 500,
              example: 'Tienda online de productos electrónicos'
            },
            version: {
              type: 'string',
              description: 'Versión de la aplicación',
              maxLength: 20,
              example: '1.0.0'
            },
            plataforma: {
              type: 'string',
              enum: ['web', 'mobile', 'desktop'],
              description: 'Plataforma de la aplicación (requerido)',
              example: 'web'
            },
            url_base: {
              type: 'string',
              format: 'uri',
              description: 'URL base de la aplicación',
              maxLength: 500,
              example: 'https://miapp.com'
            },
            configuracion: {
              type: 'object',
              description: 'Configuración específica',
              example: {
                analytics_enabled: true,
                max_events_per_session: 1000
              }
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales',
              example: {
                owner: 'team-frontend',
                environment: 'production'
              }
            }
          },
          required: ['nombre', 'plataforma']
        },

        // Schema para sesión
        Sesion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la sesión en la base de datos'
            },
            sesion_id: {
              type: 'string',
              description: 'ID externo de la sesión'
            },
            usuario_id: {
              type: 'string',
              description: 'ID del usuario asociado'
            },
            aplicacion_id: {
              type: 'string',
              description: 'ID de la aplicación'
            },
            ip_usuario: {
              type: 'string',
              description: 'Dirección IP del usuario'
            },
            user_agent: {
              type: 'string',
              description: 'User-Agent del navegador'
            },
            plataforma: {
              type: 'string',
              enum: ['web', 'mobile', 'desktop'],
              description: 'Plataforma utilizada'
            },
            dispositivo: {
              type: 'string',
              description: 'Información del dispositivo'
            },
            fecha_inicio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio de la sesión'
            },
            fecha_fin: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de fin de la sesión'
            },
            activa: {
              type: 'boolean',
              description: 'Si la sesión está activa'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales de la sesión'
            }
          }
        },

        // Schema para crear sesión
        SesionCrear: {
          type: 'object',
          properties: {
            sesion_id: {
              type: 'string',
              description: 'ID único de la sesión (opcional, se genera si no se proporciona)',
              minLength: 1,
              maxLength: 100
            },
            usuario_id: {
              type: 'string',
              description: 'ID del usuario (requerido)',
              minLength: 1,
              maxLength: 100,
              example: 'user_12345'
            },
            aplicacion_id: {
              type: 'string',
              description: 'ID de la aplicación (requerido)',
              minLength: 1,
              maxLength: 100,
              example: 'app_ecommerce'
            },
            ip_usuario: {
              type: 'string',
              format: 'ipv4',
              description: 'Dirección IP del usuario (opcional)'
            },
            user_agent: {
              type: 'string',
              maxLength: 500,
              description: 'User-Agent del navegador (opcional)'
            },
            plataforma: {
              type: 'string',
              enum: ['web', 'mobile', 'desktop'],
              description: 'Plataforma utilizada (opcional)'
            },
            dispositivo: {
              type: 'string',
              maxLength: 100,
              description: 'Información del dispositivo (opcional)'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales',
              example: {
                origen: 'google',
                campana: 'promo_verano'
              }
            }
          },
          required: ['usuario_id', 'aplicacion_id']
        },

        // Schema para métricas
        // Schema para métricas básicas
        MetricasBasicas: {
          type: 'object',
          properties: {
            total_eventos: {
              type: 'number',
              description: 'Total de eventos registrados'
            },
            usuarios_activos: {
              type: 'number',
              description: 'Usuarios activos únicos'
            },
            aplicaciones_activas: {
              type: 'number',
              description: 'Aplicaciones con actividad'
            },
            eventos_por_tipo: {
              type: 'object',
              description: 'Distribución de eventos por tipo',
              additionalProperties: {
                type: 'number'
              },
              example: {
                click: 1500,
                view: 3200,
                purchase: 150
              }
            },
            periodo: {
              type: 'object',
              properties: {
                inicio: { type: 'string', format: 'date-time' },
                fin: { type: 'string', format: 'date-time' }
              },
              description: 'Periodo de tiempo de las métricas'
            },
            promedio_eventos_por_usuario: {
              type: 'number',
              description: 'Promedio de eventos por usuario'
            },
            sesiones_activas: {
              type: 'number',
              description: 'Número de sesiones activas'
            }
          }
        },

        // Schema para resumen de métricas
        MetricasResumen: {
          type: 'object',
          properties: {
            estadisticas_globales: {
              type: 'object',
              properties: {
                total_usuarios: { type: 'number' },
                total_aplicaciones: { type: 'number' },
                total_sesiones: { type: 'number' },
                total_eventos: { type: 'number' }
              }
            },
            tendencias: {
              type: 'object',
              properties: {
                eventos_ultimas_24h: { type: 'number' },
                usuarios_nuevos_hoy: { type: 'number' },
                sesiones_activas_ahora: { type: 'number' }
              }
            },
            salud_sistema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'warning', 'error'] },
                latencia_promedio: { type: 'number' },
                tasa_errores: { type: 'number' }
              }
            }
          }
        },

        // Schema para errores
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error descriptivo'
            },
            error: {
              type: 'string',
              description: 'Detalles técnicos del error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/server.js',
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
