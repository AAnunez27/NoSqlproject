const Joi = require('joi');

/**
 * Middleware para validación de datos usando Joi
 */
const validacion = {
  /**
   * Validar datos de entrada contra un esquema Joi
   * @param {Object} schema - Esquema Joi para validación
   * @param {string} source - Fuente de datos (body, query, params)
   * @returns {Function} - Middleware de validación
   */
  validar: (schema, source = 'body') => {
    return (req, res, next) => {
      const datos = req[source];

      const { error, value } = schema.validate(datos, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errores = error.details.map(detail => ({
          campo: detail.path.join('.'),
          mensaje: detail.message,
          valor: detail.context.value
        }));

        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: errores,
          timestamp: new Date().toISOString()
        });
      }

      // Reemplazar los datos originales con los datos validados y limpios
      req[source] = value;
      next();
    };
  }
};

/**
 * Esquemas de validación para diferentes endpoints
 */
const esquemas = {
  // Esquema para crear eventos
  crearEvento: Joi.object({
    usuario_id: Joi.string().required().min(1).max(100),
    sesion_id: Joi.string().required().min(1).max(100),
    aplicacion_id: Joi.string().required().min(1).max(100),
    tipo_evento: Joi.string().required().min(1).max(50),
    metadata: Joi.object().default({}),
    ip_usuario: Joi.string().ip().optional(),
    user_agent: Joi.string().max(500).optional(),
    url_origen: Joi.string().uri().max(500).optional()
  }),

  // Esquema para actualizar metadata de eventos
  actualizarEventoMetadata: Joi.object({
    metadata: Joi.object().required()
  }),

  // Esquema para crear usuarios
  crearUsuario: Joi.object({
    usuario_id: Joi.string().optional().min(1).max(100),
    nombre: Joi.string().required().min(1).max(100),
    email: Joi.string().email().required().max(255),
    metadata: Joi.object().default({})
  }),

  // Esquema para crear sesiones
  crearSesion: Joi.object({
    sesion_id: Joi.string().optional().min(1).max(100),
    usuario_id: Joi.string().required().min(1).max(100),
    aplicacion_id: Joi.string().required().min(1).max(100),
    ip_usuario: Joi.string().ip().optional(),
    user_agent: Joi.string().max(500).optional(),
    plataforma: Joi.string().valid('web', 'mobile', 'desktop').optional(),
    dispositivo: Joi.string().max(100).optional(),
    metadata: Joi.object().default({})
  }),

  // Esquema para crear aplicaciones
  crearAplicacion: Joi.object({
    aplicacion_id: Joi.string().optional().min(1).max(100),
    nombre: Joi.string().required().min(1).max(100),
    descripcion: Joi.string().max(500).default(''),
    version: Joi.string().max(20).default('1.0.0'),
    plataforma: Joi.string().valid('web', 'mobile', 'desktop').required(),
    url_base: Joi.string().uri().max(500).optional().allow(null),
    configuracion: Joi.object().default({}),
    metadata: Joi.object().default({})
  }),

  // Esquemas para parámetros de consulta
  parametrosConsulta: {
    // Parámetros comunes de paginación
    paginacion: Joi.object({
      limite: Joi.number().integer().min(1).max(1000).default(50),
      offset: Joi.number().integer().min(0).default(0)
    }),

    // Parámetros de filtrado por fechas
    filtroFecha: Joi.object({
      fechaInicio: Joi.date().iso().optional(),
      fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).optional(),
      limite: Joi.number().integer().min(1).max(1000).default(50),
      offset: Joi.number().integer().min(0).default(0)
    }).with('fechaFin', 'fechaInicio'),

    // Parámetros para consultas de eventos
    consultaEventos: Joi.object({
      usuarioId: Joi.string().min(1).max(100).optional(),
      tipoEvento: Joi.string().min(1).max(50).optional(),
      fechaInicio: Joi.date().iso().optional(),
      fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).optional(),
      limite: Joi.number().integer().min(1).max(1000).default(50),
      offset: Joi.number().integer().min(0).default(0)
    }),

    // Parámetros para métricas
    parametrosMetricas: Joi.object({
      fechaInicio: Joi.date().iso().optional(),
      fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).optional(),
      usuarioId: Joi.string().min(1).max(100).optional(),
      aplicacionId: Joi.string().min(1).max(100).optional()
    })
  },

  // Esquemas para parámetros de ruta
  parametrosRuta: {
    eventoId: Joi.object({
      eventoId: Joi.string().required().min(1).max(100)
    }),

    usuarioId: Joi.object({
      usuarioId: Joi.string().required().min(1).max(100)
    }),

    sesionId: Joi.object({
      sesionId: Joi.string().required().min(1).max(100)
    }),

    aplicacionId: Joi.object({
      aplicacionId: Joi.string().required().min(1).max(100)
    }),

    tipoEvento: Joi.object({
      tipoEvento: Joi.string().required().min(1).max(50)
    }),

    fecha: Joi.object({
      fecha: Joi.date().iso().required()
    })
  }
};

module.exports = {
  validacion,
  esquemas
};
