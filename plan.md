# Plan del Proyecto - API MongoDB para Análisis de Comportamiento de Usuarios

## 📋 Información General

**Proyecto:** API REST para registro y análisis de eventos de usuario
**Responsable:** Aaron Nuñez Torres
**Fecha de inicio:** 4 de mayo de 2026
**Base de datos:** MongoDB Atlas
**Stack principal:** Node.js + Express.js + MongoDB

## 🎯 Objetivos del Proyecto

### Objetivo Principal
Desarrollar una API REST que permita registrar, almacenar y consultar eventos de comportamiento de usuarios para facilitar la toma de decisiones basada en datos.

### Objetivos Específicos
- Implementar un MVP funcional para validar la solución
- Establecer una base de datos flexible con MongoDB
- Proporcionar endpoints para registro y consulta de eventos
- Implementar testing automatizado con cobertura adecuada
- Documentar la arquitectura y funcionalidades

## 🚀 Fases del Proyecto

### FASE 1: Levantamiento y Configuración Inicial
**Duración:** 1 semana
**Objetivo:** Establecer la base técnica del proyecto

#### Actividades:
1. **Configuración del entorno de desarrollo**
   - Configuración de variables de entorno (.env)
   - Conexión a MongoDB Atlas
   - Estructura inicial del proyecto

2. **Diseño de la base de datos**
   - Implementación del modelo de datos definido en spec.md
   - Creación de colecciones: usuarios, aplicaciones, sesiones, eventos
   - Configuración de índices propuestos

3. **Configuración de testing**
   - Setup de entorno de pruebas con variables de entorno
   - Configuración de base de datos de testing
   - Framework de testing (Jest/Mocha)

#### Entregables:
- [x] Repositorio configurado con estructura inicial
- [x] Conexión exitosa a MongoDB Atlas
- [x] Variables de entorno configuradas
- [x] Documentación de setup inicial

#### Configuración de Testing:
```javascript
// Variables de entorno para testing (basadas en .env)
DATABASE_URL_TEST=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/test_database?appName=Cluster0
COLECCION_TEST=TEST_DATABASE
NODE_ENV=test
```

### FASE 2: Desarrollo del MVP
**Duración:** 2 semanas
**Objetivo:** Implementar las funcionalidades mínimas viables

#### Sprint 1: Core API (Semana 1)
**Funcionalidades Must (MoSCoW):**

1. **Registrar eventos de usuario**
   - Endpoint: `POST /api/events`
   - Validación de datos de entrada
   - Almacenamiento en colección `eventos`

2. **Consultar eventos por usuario**
   - Endpoint: `GET /api/events/user/:userId`
   - Filtros básicos

3. **Consultar eventos por fecha**
   - Endpoint: `GET /api/events/date/:date`
   - Rango de fechas

#### Sprint 2: Funcionalidades Complementarias (Semana 2)
**Funcionalidades Should (MoSCoW):**

1. **Filtrar eventos por tipo**
   - Endpoint: `GET /api/events/type/:eventType`
   - Filtros combinados

2. **Métricas básicas**
   - Endpoint: `GET /api/metrics/basic`
   - Contadores y agrupaciones simples

#### Entregables MVP:
- [x] API REST funcional con endpoints básicos
- [x] Modelo de datos implementado en MongoDB
- [x] Identificación de usuario y sesión
- [x] Validación de datos de entrada
- [x] Tests unitarios básicos
- [x] Documentación de endpoints

#### Criterios de Aceptación MVP:
- ✅ La API puede registrar eventos con metadata variable
- ✅ Los eventos se almacenan correctamente en MongoDB
- ✅ Es posible consultar eventos por usuario y fecha
- ✅ Los tests pasan correctamente
- ✅ La API responde en menos de 500ms para consultas básicas

### FASE 3: Testing y Calidad
**Duración:** 1 semana
**Objetivo:** Asegurar la calidad y confiabilidad del MVP

#### Actividades:
1. **Testing Integral**
   - Tests unitarios (cobertura mínima 70%)
   - Tests de integración con MongoDB
   - Tests de endpoints API

2. **Configuración de testing con variables de entorno:**
   ```javascript
   // test.config.js
   module.exports = {
     database: {
       url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
       collection: process.env.COLECCION || 'test_collection'
     },
     environment: 'test'
   };
   ```

3. **Validación de rendimiento**
   - Pruebas de carga básicas
   - Optimización de consultas

4. **Documentación técnica**
   - README detallado
   - Documentación de API
   - Guía de instalación y uso

#### Entregables:
- [ ] Suite de tests completa con cobertura > 70%
- [ ] Reportes de testing automatizados
- [ ] Documentación técnica completa
- [ ] Validación de rendimiento básica

### FASE 4: Entrega y Validación
**Duración:** 0.5 semanas
**Objetivo:** Preparar entrega final y validar funcionamiento

#### Actividades:
1. **Despliegue de prueba**
   - Configuración en plataforma PaaS (Render/Railway)
   - Verificación de conexión con MongoDB Atlas
   - Pruebas en entorno desplegado

2. **Validación final**
   - Verificación de todos los criterios de aceptación
   - Pruebas de usuario básicas
   - Documentación final

#### Entregables:
- [ ] MVP desplegado y funcional
- [ ] Documentación final del proyecto
- [ ] Informe de validación
- [ ] Plan de evolución hacia producto final

## 🛠️ Configuración Técnica

### Variables de Entorno (.env)
```env
# Producción
DATABASE_URL=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/?appName=Cluster0
COLECCION=DATABASE

# Testing
DATABASE_URL_TEST=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/test_database?appName=Cluster0
COLECCION_TEST=TEST_DATABASE
NODE_ENV=test
PORT=3000
```

### Estructura del Proyecto
```
NoSqlproject/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
├── .env
├── .env.test
├── package.json
└── README.md
```

## 📊 Cronograma General

| Fase | Duración | Inicio | Fin | Entregables Clave |
|------|----------|--------|-----|-------------------|
| Levantamiento | 1 semana | Sem 1 | Sem 1 | Setup inicial, DB configurada |
| MVP Sprint 1 | 1 semana | Sem 2 | Sem 2 | Core API, endpoints básicos |
| MVP Sprint 2 | 1 semana | Sem 3 | Sem 3 | Funcionalidades complementarias |
| Testing y Calidad | 1 semana | Sem 4 | Sem 4 | Suite de tests, documentación |
| Entrega | 0.5 semana | Sem 5 | Sem 5 | MVP desplegado |

**Duración total:** 4.5 semanas

## 🧪 Estrategia de Testing

### Configuración de Testing con Variables de Entorno

1. **Setup de Testing Database:**
   ```javascript
   // test/setup.js
   const { MongoClient } = require('mongodb');

   const testConfig = {
     url: process.env.DATABASE_URL_TEST,
     dbName: process.env.COLECCION_TEST,
   };

   module.exports = testConfig;
   ```

2. **Tests de Integración:**
   - Conexión a DB de testing usando `DATABASE_URL_TEST`
   - Limpieza de datos entre tests
   - Validación de operaciones CRUD

3. **Tests de Endpoints:**
   - Registro de eventos
   - Consultas por usuario/fecha
   - Validación de respuestas

### Tipos de Testing:
- **Unitarios:** Lógica de negocio, validaciones
- **Integración:** Operaciones con MongoDB
- **API:** Endpoints y contratos
- **Performance:** Tiempo de respuesta básico

## 📈 Criterios de Éxito

### MVP Funcional:
- [x] API REST operativa con todos los endpoints Must
- [x] Conexión estable con MongoDB Atlas
- [x] Tests con cobertura > 70%
- [x] Documentación completa
- [x] Tiempo de respuesta < 500ms

### Técnicos:
- [x] Código limpio y mantenible
- [x] Manejo adecuado de errores
- [x] Validación de datos de entrada
- [x] Logs básicos implementados

## 🚧 Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Problemas de conexión MongoDB | Alto | Medio | Configurar múltiples strings de conexión |
| Sobrecarga en pruebas | Medio | Alto | Usar DB de testing separada |
| Retrasos en desarrollo | Alto | Medio | Buffer de tiempo en cronograma |
| Problemas de rendimiento | Medio | Bajo | Tests de carga básicos |

## 🔄 Evolución Post-MVP

### Funcionalidades Should/Could (Futuras):
- Exportar datos CSV/JSON
- Dashboard básico
- Métricas avanzadas
- Observabilidad con OpenTelemetry

### Arquitectura Objetivo:
- Migración a NestJS
- Servicios analíticos con FastAPI
- CI/CD con GitHub Actions
- Documentación con Swagger/OpenAPI

---

**Notas:**
- Este plan se basa en la especificación técnica detallada en `spec.md`
- Las variables de entorno están configuradas según el archivo `.env` del proyecto
- El MVP se enfoca únicamente en funcionalidades "Must" según metodología MoSCoW
- La evolución hacia producto final queda documentada para fases posteriores
