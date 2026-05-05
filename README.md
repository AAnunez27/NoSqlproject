# API MongoDB para Análisis de Comportamiento de Usuarios

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Tests-Jest-red.svg)](https://jestjs.io/)

API REST desarrollada en Node.js con Express.js y MongoDB para el registro, almacenamiento y análisis de eventos de comportamiento de usuarios. Este proyecto implementa un MVP (Minimum Viable Product) funcional siguiendo las especificaciones técnicas definidas en el documento de planificación.

## 📋 Descripción

Esta API permite a las aplicaciones registrar eventos de usuarios (clicks, navegación, uso de funcionalidades) y proporciona endpoints para consultar y analizar estos datos. Está diseñada para ayudar a Product Owners, desarrolladores y analistas a tomar decisiones basadas en datos reales de comportamiento de usuarios.

## 🎯 Características Principales (MVP)

### ✅ Funcionalidades Must (Implementadas)
- **Registrar eventos de usuario**: Endpoint para capturar eventos con metadata flexible
- **Consultar eventos por usuario**: Filtrado de eventos por ID de usuario
- **Consultar eventos por fecha**: Filtrado de eventos por rangos de fecha
- **Identificación de usuario y sesión**: Asociación de eventos a origen específico
- **Almacenamiento en MongoDB**: Persistencia flexible con esquemas dinámicos

### ✅ Funcionalidades Should (Implementadas)
- **Filtrar eventos por tipo**: Segmentación de eventos por categorías
- **Métricas básicas agrupadas**: Contadores y estadísticas para análisis

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.x o superior
- MongoDB Atlas (o instancia local de MongoDB)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/AAnunez27/NoSqlproject.git
cd NoSqlproject
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# El archivo .env ya existe con la configuración de MongoDB Atlas
# Verificar que las credenciales sean correctas
```

4. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

5. **Verificar funcionamiento**
```bash
curl http://localhost:3000/health
```

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y completa tus credenciales:

```bash
cp .env.example .env
```

```env
# Base de datos principal
DATABASE_URL=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/?appName=Cluster0
COLECCION=DATABASE

# Base de datos para testing
DATABASE_URL_TEST=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/test_database?appName=Cluster0
COLECCION_TEST=TEST_DATABASE

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

### Estructura del Proyecto

```
NoSqlproject/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── controllers/
│   │   ├── evento.controller.js # Controlador principal de eventos
│   │   ├── usuario.controller.js
│   │   ├── aplicacion.controller.js
│   │   └── metricas.controller.js
│   ├── models/
│   │   ├── evento.model.js      # Modelo principal de eventos
│   │   ├── usuario.model.js
│   │   ├── sesion.model.js
│   │   └── aplicacion.model.js
│   ├── routes/
│   │   ├── eventos.routes.js    # Rutas de eventos
│   │   ├── usuarios.routes.js
│   │   ├── aplicaciones.routes.js
│   │   └── metricas.routes.js
│   ├── middleware/
│   │   ├── validacion.js        # Validación con Joi
│   │   └── errorHandler.js      # Manejo de errores
│   └── server.js                # Servidor principal
├── tests/
│   ├── integration/             # Tests de integración
│   ├── unit/                    # Tests unitarios
│   └── setup.js                 # Configuración de tests
├── docs/                        # Documentación
├── plan.md                      # Plan del proyecto
├── spec.md                      # Especificación técnica
├── .env                         # Variables de entorno
├── package.json
└── README.md
```

## 📡 Endpoints de la API

### Eventos (Principal)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/events` | Crear un nuevo evento |
| GET | `/api/events` | Listar eventos con filtros |
| GET | `/api/events/:id` | Obtener evento por ID |
| GET | `/api/events/user/:userId` | Eventos por usuario |
| GET | `/api/events/date/:fecha` | Eventos por fecha |
| GET | `/api/events/type/:tipo` | Eventos por tipo |
| PUT | `/api/events/:id/metadata` | Actualizar metadata |
| DELETE | `/api/events/:id` | Eliminar evento |
| GET | `/api/events/metrics/basic` | Métricas de eventos |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users` | Crear usuario |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario |
| GET | `/api/users/:id/exists` | Verificar existencia |

### Aplicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/applications` | Crear aplicación |
| GET | `/api/applications` | Listar aplicaciones |
| GET | `/api/applications/active` | Aplicaciones activas |
| GET | `/api/applications/:id/stats` | Estadísticas |

### Métricas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/metrics/basic` | Métricas básicas |
| GET | `/api/metrics/summary` | Resumen del sistema |
| GET | `/api/metrics/health` | Estado de salud |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Información de la API |

## 📝 Ejemplos de Uso

### Crear un Evento

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "user123",
    "sesion_id": "session456",
    "aplicacion_id": "app789",
    "tipo_evento": "click_button",
    "metadata": {
      "button_id": "btn-submit",
      "page": "/checkout"
    },
    "ip_usuario": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "url_origen": "https://example.com/checkout"
  }'
```

### Consultar Eventos de un Usuario

```bash
curl "http://localhost:3000/api/events/user/user123?limite=10&tipoEvento=click_button"
```

### Obtener Métricas Básicas

```bash
curl "http://localhost:3000/api/metrics/basic?fechaInicio=2026-05-01&fechaFin=2026-05-07"
```

### Consultar Eventos por Fecha

```bash
curl "http://localhost:3000/api/events/date/2026-05-04"
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Solo tests de integración
npm run test:integration
```

### Estructura de Testing

- **Tests unitarios**: Validan la lógica de modelos y funciones
- **Tests de integración**: Validan endpoints completos end-to-end
- **Cobertura objetivo**: Mínimo 70%

## 📊 Modelo de Datos

### Estructura de Eventos

```json
{
  "evento_id": "uuid-v4",
  "usuario_id": "string",
  "sesion_id": "string",
  "aplicacion_id": "string",
  "tipo_evento": "string",
  "timestamp": "Date",
  "metadata": {
    "button_id": "string",
    "page": "string",
    "custom_field": "any"
  },
  "ip_usuario": "string",
  "user_agent": "string",
  "url_origen": "string",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Colecciones MongoDB

- **eventos**: Colección principal con todos los eventos
- **usuarios**: Información de usuarios registrados
- **sesiones**: Sesiones de usuario por aplicación
- **aplicaciones**: Aplicaciones que registran eventos

## 🔧 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| start | `npm start` | Iniciar en producción |
| dev | `npm run dev` | Iniciar en desarrollo (nodemon) |
| test | `npm test` | Ejecutar tests |
| test:watch | `npm run test:watch` | Tests en modo watch |
| test:coverage | `npm run test:coverage` | Tests con cobertura |
| test:integration | `npm run test:integration` | Solo tests de integración |
| lint | `npm run lint` | Ejecutar ESLint |
| lint:fix | `npm run lint:fix` | Corregir problemas de lint |

## 📈 Métricas y Monitoreo

### Health Check

```bash
GET /health
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 3600,
    "timestamp": "2026-05-04T10:00:00.000Z"
  }
}
```

## 👤 Autor

**Aaron Nuñez Torres**
- GitHub: [@AAnunez27](https://github.com/AAnunez27)
- Proyecto: Plan Especial de Titulación - Ingeniería en Informática
- Asignatura: Bases de Datos No Estructuradas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 📚 Documentación Técnica Completa

Para información detallada sobre:
- **Especificación técnica completa**: Ver [spec.md](spec.md)
- **Plan de desarrollo**: Ver [plan.md](plan.md)

---

**Estado del Proyecto**: ✅ MVP Completado - Listo para testing y validación
