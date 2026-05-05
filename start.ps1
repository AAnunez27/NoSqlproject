# Script de inicio rápido para Windows PowerShell
# Ejecutar después de instalar Node.js

Write-Host "🚀 Iniciando API MongoDB para Análisis de Comportamiento de Usuarios" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js no está instalado. Descargar desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Verificar configuración
Write-Host "⚙️ Verificando configuración..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Configuración verificada" -ForegroundColor Green

# Ejecutar tests
Write-Host "🧪 Ejecutando tests..." -ForegroundColor Yellow
try {
    npm test
    Write-Host "✅ Tests ejecutados correctamente" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Algunos tests fallaron - revisar configuración de BD" -ForegroundColor Yellow
}

# Iniciar servidor
Write-Host "`n🚀 Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "📊 La API estará disponible en:" -ForegroundColor Cyan
Write-Host "   - Health check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   - Documentación: http://localhost:3000/" -ForegroundColor White
Write-Host "   - Eventos: http://localhost:3000/api/events" -ForegroundColor White
Write-Host "`n🛑 Para detener el servidor: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

npm run dev
