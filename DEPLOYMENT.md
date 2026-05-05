# 🚀 Guía de Deployment en Render

## 📋 Variables de Entorno Requeridas

En Render, configura estas variables en el dashboard:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/DATABASE?appName=Cluster0
COLECCION=DATABASE
CORS_ORIGIN=*
```

> ⚠️ **Nunca pongas credenciales reales en archivos de documentación o código fuente.**
> Configura estas variables directamente en el dashboard de Render.

## 🔧 Configuración de Servicio Render

### Configuración Básica:
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18.x o superior

### Configuración Avanzada:
- **Health Check Path:** `/health`
- **Auto Deploy:** Habilitado
- **Branch:** main

## 📊 Solución de Problemas Comunes

### Error "Exited with status 1"

**Causas posibles:**
1. **Variables de entorno no configuradas**
   - Verificar que DATABASE_URL esté configurada en Render
   - Asegurar que COLECCION esté definida

2. **Problemas de conexión MongoDB**
   - Verificar IP allowlist en MongoDB Atlas
   - Comprobar string de conexión

3. **Dependencias faltantes**
   - Ejecutar `npm install` localmente
   - Revisar package.json

### MongoDB Atlas Configuración

**Pasos importantes:**
1. **Network Access:** Agregar IP `0.0.0.0/0` (todos los IPs)
2. **Database User:** Verificar credenciales
3. **Connection String:** Debe incluir nombre de base de datos

### Variables de Entorno en Render

```bash
# En el dashboard de Render > Environment Variables
DATABASE_URL = mongodb+srv://usuario:password@cluster.mongodb.net/DATABASE?appName=Cluster0
COLECCION = DATABASE
NODE_ENV = production
PORT = 3000
```

## 🏥 Health Check

El endpoint `/health` verifica:
- ✅ Estado del servidor
- ✅ Conexión MongoDB
- ✅ Tiempo de respuesta
- ✅ Información del sistema

## 📈 Monitoreo

**Logs importantes a revistar:**
```bash
# Conexión exitosa
✅ Conectado a MongoDB: DATABASE (PROD)
🚀 Servidor ejecutándose en puerto 3000

# Error común
❌ Error conectando a MongoDB: [mensaje específico]
```

## 🔄 Redeploy

Para redeploy manual:
1. Ir al dashboard de Render
2. Seleccionar el servicio
3. Click "Manual Deploy" > "Deploy latest commit"

## 📞 Endpoints de Testing

Una vez desplegado, probar:
```bash
# Health check
GET https://tu-app.onrender.com/health

# Endpoint principal
GET https://tu-app.onrender.com/

# Crear evento
POST https://tu-app.onrender.com/api/events
```

## ⚠️ Limitaciones Render Plan Free

- **Sleeps:** Servicio duerme tras 15min inactividad
- **Bandwidth:** 100GB/mes
- **Build Time:** 90min/mes
- **Cold Start:** ~30 segundos para despertar

## 🐛 Debug Avanzado

**Logs detallados disponibles en:**
- Dashboard Render > Logs
- Variables de entorno verificadas en startup
- Stack traces completos en errores
