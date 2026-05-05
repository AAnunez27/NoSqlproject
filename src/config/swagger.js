const swaggerJSDoc = require('swagger-jsdoc');

// Configuración dinámica de servidores basada en el entorno
const getServers = () => {
  const servers = [];
  
  // Servidor local (siempre disponible en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    servers.push({
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo local'
    });
  }
  
  // Servidor de producción en Render
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar la URL real de Render
    const renderUrl = process.env.RENDER_EXTERNAL_URL || 'https://nosql-api.onrender.com';
    servers.push({
      url: renderUrl,
      description: 'Servidor de producción en Render'
    });
  } else {
    // En desarrollo, mostrar también el servidor de producción como referencia
    servers.push({
      url: 'https://nosql-api.onrender.com',
      description: 'Servidor de producción en Render (referencia)'
    });
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
            usuarioId: {
              type: 'string',
              description: 'ID del usuario que generó el evento'
            },
            aplicacionId: {
              type: 'string',
              description: 'ID de la aplicación donde ocurrió el evento'
            },
            tipoEvento: {
              type: 'string',
              enum: ['click', 'view', 'scroll', 'form_submit', 'purchase', 'search', 'download', 'custom'],
              description: 'Tipo de evento registrado'
            },
            datos: {
              type: 'object',
              description: 'Datos específicos del evento (estructura flexible)',
              properties: {
                elemento: { type: 'string', description: 'Elemento interactuado' },
                valor: { type: 'string', description: 'Valor asociado' },
                url: { type: 'string', description: 'URL donde ocurrió el evento' },
                metadata: { type: 'object', description: 'Metadatos adicionales' }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Momento exacto del evento'
            },
            ip: {
              type: 'string',
              description: 'Dirección IP del usuario'
            },
            userAgent: {
              type: 'string',
              description: 'User-Agent del navegador'
            }
          },
          required: ['usuarioId', 'aplicacionId', 'tipoEvento', 'timestamp']
        },

        // Schema para crear evento
        EventoCrear: {
          type: 'object',
          properties: {
            usuarioId: {
              type: 'string',
              description: 'ID del usuario (requerido)',
              example: 'user_12345'
            },
            aplicacionId: {
              type: 'string',
              description: 'ID de la aplicación (requerido)',
              example: 'app_ecommerce'
            },
            tipoEvento: {
              type: 'string',
              enum: ['click', 'view', 'scroll', 'form_submit', 'purchase', 'search', 'download', 'custom'],
              description: 'Tipo de evento',
              example: 'click'
            },
            datos: {
              type: 'object',
              description: 'Datos del evento',
              example: {
                elemento: 'boton_comprar',
                valor: 'producto_123',
                url: '/productos/123',
                precio: 29.99
              }
            }
          },
          required: ['usuarioId', 'aplicacionId', 'tipoEvento']
        },

        // Schema para usuario
        Usuario: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            usuarioId: {
              type: 'string',
              description: 'ID externo del usuario'
            },
            propiedades: {
              type: 'object',
              description: 'Propiedades del usuario',
              properties: {
                nombre: { type: 'string' },
                email: { type: 'string', format: 'email' },
                edad: { type: 'number' },
                genero: { type: 'string' },
                ubicacion: { type: 'string' }
              }
            },
            fechaRegistro: {
              type: 'string',
              format: 'date-time'
            },
            ultimaActividad: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Schema para aplicación
        Aplicacion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la aplicación'
            },
            aplicacionId: {
              type: 'string',
              description: 'ID externo de la aplicación'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la aplicación'
            },
            dominio: {
              type: 'string',
              description: 'Dominio principal'
            },
            configuracion: {
              type: 'object',
              description: 'Configuración específica'
            },
            fechaCreacion: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Schema para métricas
        MetricasBasicas: {
          type: 'object',
          properties: {
            totalEventos: {
              type: 'number',
              description: 'Total de eventos registrados'
            },
            usuariosActivos: {
              type: 'number',
              description: 'Usuarios activos únicos'
            },
            aplicacionesActivas: {
              type: 'number',
              description: 'Aplicaciones con actividad'
            },
            eventosPorTipo: {
              type: 'object',
              description: 'Distribución de eventos por tipo',
              additionalProperties: {
                type: 'number'
              }
            },
            periodo: {
              type: 'object',
              properties: {
                inicio: { type: 'string', format: 'date-time' },
                fin: { type: 'string', format: 'date-time' }
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
