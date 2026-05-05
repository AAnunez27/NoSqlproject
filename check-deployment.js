#!/usr/bin/env node
/**
 * Script de verificación pre-deployment
 * Verifica configuración antes de deployment en Render
 */

require('dotenv').config();

console.log('🔍 Verificando configuración para deployment...\n');

// Variables requeridas
const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'COLECCION': process.env.COLECCION,
  'NODE_ENV': process.env.NODE_ENV || 'development'
};

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
let allEnvVarsPresent = true;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key === 'DATABASE_URL' ? '[CONFIGURADA]' : value}`);
  } else {
    console.log(`❌ ${key}: NO CONFIGURADA`);
    allEnvVarsPresent = false;
  }
}

// Verificar formato de DATABASE_URL
if (requiredEnvVars.DATABASE_URL) {
  const url = requiredEnvVars.DATABASE_URL;

  if (url.includes('mongodb+srv://')) {
    console.log('✅ DATABASE_URL formato correcto (SRV)');

    // Verificar que incluya nombre de base de datos
    if (url.includes('mongodb.net/') && url.split('mongodb.net/')[1]) {
      const dbPart = url.split('mongodb.net/')[1].split('?')[0];
      if (dbPart && dbPart !== '') {
        console.log(`✅ Base de datos especificada: ${dbPart}`);
      } else {
        console.log('⚠️ Base de datos no especificada en URL');
      }
    }
  } else {
    console.log('⚠️ DATABASE_URL podría no tener formato correcto');
  }
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
try {
  const packageJson = require('./package.json');

  const criticalDeps = ['express', 'mongodb', 'dotenv', 'cors'];
  const missingDeps = criticalDeps.filter(dep => !packageJson.dependencies[dep]);

  if (missingDeps.length === 0) {
    console.log('✅ Todas las dependencias críticas están presentes');
  } else {
    console.log(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`);
    allEnvVarsPresent = false;
  }

  // Verificar script start
  if (packageJson.scripts.start === 'node src/server.js') {
    console.log('✅ Script start configurado correctamente');
  } else {
    console.log('⚠️ Script start podría no ser correcto');
  }

} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
  allEnvVarsPresent = false;
}

// Verificar archivos críticos
console.log('\n📁 Verificando archivos críticos...');
const fs = require('fs');
const criticalFiles = [
  'src/server.js',
  'src/config/database.js',
  'package.json'
];

for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} NO EXISTE`);
    allEnvVarsPresent = false;
  }
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (allEnvVarsPresent) {
  console.log('✅ CONFIGURACIÓN LISTA PARA DEPLOYMENT');
  console.log('\n📋 Pasos siguientes:');
  console.log('1. Commit y push a GitHub');
  console.log('2. Configurar variables en Render dashboard');
  console.log('3. Hacer deployment desde Render');
  console.log('\n🔗 Variables para configurar en Render dashboard (NO publicar los valores):');
  console.log('   DATABASE_URL=<tu_mongodb_connection_string>');
  console.log(`   COLECCION=${requiredEnvVars.COLECCION}`);
  console.log('   NODE_ENV=production');
  process.exit(0);
} else {
  console.log('❌ PROBLEMAS DETECTADOS - CORREGIR ANTES DEL DEPLOYMENT');
  console.log('\n📖 Ver DEPLOYMENT.md para más información');
  process.exit(1);
}
