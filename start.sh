#!/bin/bash
# Script de inicio rápido para la API
# Ejecutar después de instalar Node.js

echo "🚀 Iniciando API MongoDB para Análisis de Comportamiento de Usuarios"
echo "=============================================================="

# Verificar Node.js
echo "📋 Verificando Node.js..."
node --version || { echo "❌ Node.js no está instalado. Instalar desde https://nodejs.org/"; exit 1; }

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install || { echo "❌ Error instalando dependencias"; exit 1; }

# Verificar configuración
echo "⚙️ Verificando configuración..."
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado"
    exit 1
fi

echo "✅ Configuración verificada"

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test || echo "⚠️ Algunos tests fallaron - revisar configuración de BD"

# Iniciar servidor en modo desarrollo
echo "🚀 Iniciando servidor de desarrollo..."
echo "📊 La API estará disponible en:"
echo "   - Health check: http://localhost:3000/health"
echo "   - Documentación: http://localhost:3000/"
echo "   - Eventos: http://localhost:3000/api/events"
echo ""
echo "🛑 Para detener el servidor: Ctrl+C"
echo ""

npm run dev
