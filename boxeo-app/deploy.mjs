#!/usr/bin/env node

// BoxeoApp - Script de Deployment Automático
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Funciones de logging
const log = (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);
const success = (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`);
const warning = (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`);
const error = (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`);

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options });
  } catch (err) {
    return null;
  }
}

function checkCommand(command) {
  return runCommand(`which ${command}`) !== null;
}

async function main() {
  console.log('🥊 BoxeoApp - Deployment Script');
  console.log('================================\n');

  // Verificar que estamos en el directorio correcto
  if (!existsSync('package.json')) {
    error('No se encontró package.json. Ejecuta este script desde el directorio boxeo-app/');
    process.exit(1);
  }

  log('Verificando dependencias...');

  // Verificar package manager
  let packageManager = 'npm';
  if (checkCommand('bun')) {
    packageManager = 'bun';
    success('Bun encontrado');
  } else if (checkCommand('yarn')) {
    packageManager = 'yarn';
    success('Yarn encontrado');
  } else {
    warning('Usando npm como fallback');
  }

  // Instalar dependencias si es necesario
  if (!existsSync('node_modules')) {
    log('Instalando dependencias...');
    const installResult = runCommand(`${packageManager} install`);
    if (installResult === null) {
      error('Error instalando dependencias');
      process.exit(1);
    }
    success('Dependencias instaladas');
  }

  // Build del proyecto
  log('Construyendo proyecto para producción...');
  const buildResult = runCommand(`${packageManager} run build`);
  
  if (buildResult === null) {
    error('Error en el build');
    process.exit(1);
  }
  
  success('Build completado exitosamente');

  // Verificar que el build existe
  if (!existsSync('dist')) {
    error('Directorio dist/ no encontrado después del build');
    process.exit(1);
  }

  log('Verificando archivos del build...');
  const requiredFiles = ['dist/index.html', 'dist/assets'];
  const optionalFiles = ['dist/sitemap.xml', 'dist/robots.txt', 'dist/404.html'];
  
  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      success(`✓ ${file}`);
    } else {
      error(`✗ ${file} (requerido)`);
    }
  });

  optionalFiles.forEach(file => {
    if (existsSync(file)) {
      success(`✓ ${file}`);
    } else {
      warning(`✗ ${file} (opcional)`);
    }
  });

  // Mostrar tamaño del build
  const sizeResult = runCommand('du -sh dist/');
  if (sizeResult) {
    log(`Tamaño del build: ${sizeResult.trim()}`);
  }

  console.log('\n🎉 Build listo para deployment!');
  console.log('================================\n');
  
  console.log('🚀 Opciones de deployment:\n');
  
  console.log('1. 🌐 Vercel (Recomendado):');
  console.log('   - Arrastra la carpeta dist/ a vercel.com');
  console.log('   - O ejecuta: npx vercel --prod\n');
  
  console.log('2. 🎨 Netlify:');
  console.log('   - Arrastra la carpeta dist/ a netlify.com');
  console.log('   - O ejecuta: npx netlify deploy --prod --dir=dist\n');
  
  console.log('3. ⚡ Surge.sh:');
  console.log('   - Ejecuta: npx surge dist/\n');
  
  console.log('4. 🖥️  Servidor local (para pruebas):');
  console.log(`   - Ejecuta: ${packageManager} run preview`);
  console.log('   - Visita: http://localhost:4173\n');

  // Crear ZIP
  log('Creando archivo ZIP para deployment manual...');
  const zipResult = runCommand('zip -r ../boxeo-app-production.zip dist/');
  if (zipResult !== null) {
    success('ZIP creado: ../boxeo-app-production.zip');
    const zipSize = runCommand('du -sh ../boxeo-app-production.zip');
    if (zipSize) {
      console.log(`   Tamaño: ${zipSize.split('\t')[0]}`);
    }
  }

  console.log('\n📖 Para más detalles, consulta: DEPLOYMENT.md');
  console.log(`\n${colors.green}¡Deployment preparado exitosamente!${colors.reset}`);
  
  // Preguntar si quiere abrir el preview
  console.log('\n🔍 ¿Quieres ver el preview local? (Ctrl+C para cancelar)');
  console.log(`Ejecutando: ${packageManager} run preview\n`);
  
  setTimeout(() => {
    try {
      runCommand(`${packageManager} run preview`, { stdio: 'inherit' });
    } catch (err) {
      log('Preview cerrado por el usuario');
    }
  }, 2000);
}

main().catch(console.error);