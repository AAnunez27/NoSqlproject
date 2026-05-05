/**
 * Middleware para manejo centralizado de errores
 */

/**
 * Clase para errores de aplicación personalizados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejo de errores 404 (rutas no encontradas)
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware principal para manejo de errores
 */
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log del error para debugging
  console.error(`❌ Error en ${req.method} ${req.originalUrl}:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });

  // Error de MongoDB - ID inválido
  if (error.name === 'CastError') {
    const message = 'ID de recurso inválido';
    err = new AppError(message, 400);
  }

  // Error de MongoDB - Duplicado
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `Ya existe un registro con este ${field}`;
    err = new AppError(message, 400);
  }

  // Error de MongoDB - Validación
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    err = new AppError(`Errores de validación: ${messages.join(', ')}`, 400);
  }

  // Error de conexión a MongoDB
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    err = new AppError('Error de conexión con la base de datos', 503);
  }

  // Error de Joi (validación)
  if (error.isJoi) {
    const message = error.details.map(detail => detail.message).join(', ');
    err = new AppError(`Error de validación: ${message}`, 400);
  }

  // Respuesta de error
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = error;
  }

  // Incluir ID de error para tracking en producción
  if (process.env.NODE_ENV === 'production') {
    response.errorId = generateErrorId();
  }

  res.status(err.statusCode || 500).json(response);
};

/**
 * Wrapper para funciones async para capturar errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Generar ID único para el error (útil para tracking en logs)
 */
const generateErrorId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Middleware para logging de requests en desarrollo
 */
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 ${req.method} ${req.originalUrl}`, {
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * Middleware para validar headers requeridos
 */
const validateHeaders = (req, res, next) => {
  // Validar Content-Type para requests POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return next(new AppError('Content-Type debe ser application/json', 400));
    }
  }

  next();
};

/**
 * Middleware para manejo de timeouts de requests
 */
const timeoutHandler = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        next(new AppError('Request timeout', 408));
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  requestLogger,
  validateHeaders,
  timeoutHandler
};
