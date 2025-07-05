# 🥊 BoxeoApp - Sistema Completo de Gestión de Boxeo Amateur

**Una aplicación web fullstack para la gestión profesional de competiciones de boxeo amateur en España**

## 🌟 Características Principales

### ✨ Gestión Integral
- **Administración de Clubes**: Registro, gestión y control de clubes de boxeo
- **Perfiles de Boxeadores**: Historial completo, estadísticas y seguimiento de rendimiento
- **Torneos y Competiciones**: Creación y gestión de eventos públicos y privados
- **Programación de Combates**: Emparejamiento por categorías de peso y gestión de resultados
- **Sistema de Roles**: Control granular de acceso (Admin General, Admin Club, Boxeador)
- **Analytics y Reportes**: Dashboards interactivos con métricas en tiempo real

### 🎯 Diseño y Experiencia
- **Interfaz Moderna**: Diseño responsive con ShadCN UI y TailwindCSS
- **Totalmente en Español**: Adaptado específicamente para España
- **Mobile-First**: Optimizado para dispositivos móviles y tablets
- **Accesibilidad**: Cumple estándares de accesibilidad web
- **Tema Personalizable**: Soporte para modo oscuro

## 🏗️ Arquitectura Técnica

### Frontend
- **React 19** con TypeScript
- **Vite** como bundler
- **TailwindCSS V4** para estilos
- **ShadCN UI** para componentes
- **Lucide React** para iconografía
- **React Hook Form** para formularios
- **React Query** para gestión de estado servidor

### Backend (Diseño Completo)
- **Node.js** con Express
- **PostgreSQL** con esquemas relacionales
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas
- **Joi** para validación de datos
- **TypeScript** en todo el stack

### Base de Datos
- **PostgreSQL** con relaciones optimizadas
- **Triggers automáticos** para estadísticas
- **Índices** para rendimiento
- **Tipos enumerados** para categorías de peso
- **Constraints** para integridad de datos

## 👥 Roles y Permisos

### 🔴 Administrador General
- Gestión completa del sistema
- Control de todos los clubes y usuarios
- Acceso a todas las analíticas
- Configuración del sistema

### 🔵 Administrador de Club
- Gestión de su club específico
- Administración de boxeadores del club
- Creación de torneos
- Acceso a estadísticas del club

### 🟢 Boxeador
- Vista de perfil personal
- Historial de combates
- Estadísticas personales
- Participación en torneos

## 📊 Funcionalidades del Dashboard

### Panel Principal
- **Estadísticas en Tiempo Real**: Usuarios, clubes, boxeadores, torneos activos
- **Actividad Reciente**: Últimos combates y eventos
- **Distribución por Categorías**: Análisis visual de categorías de peso
- **Métricas de Crecimiento**: Tendencias y progreso

### Gestión de Entidades
- **CRUD Completo** para todas las entidades
- **Filtros Avanzados** y búsqueda en tiempo real
- **Exportación de Datos** en múltiples formatos
- **Validación de Formularios** exhaustiva

### Analytics Avanzadas
- **Gráficos Interactivos** de actividad
- **Reportes Personalizables** por período
- **Métricas de Rendimiento** por club y boxeador
- **Tendencias Históricas** y proyecciones

## 🎨 Diseño Visual

### Paleta de Colores
- **Rojo Principal**: Representa la pasión del boxeo
- **Amarillo/Dorado**: Simboliza la victoria y los trofeos
- **Grises Neutros**: Para información secundaria
- **Verdes/Azules**: Para estados y categorías

### Componentes UI
- **Cards Interactivas** con efectos hover
- **Tablas Responsivas** con paginación
- **Badges Coloridos** para estados
- **Botones con Iconografía** Lucide
- **Formularios Intuitivos** con validación

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones Móviles
- **Sidebar Colapsible** con overlay
- **Navegación Táctil** optimizada
- **Tablas Horizontales** con scroll
- **Formularios Adaptados** para pantallas pequeñas

## 🔐 Seguridad

### Autenticación
- **JWT Tokens** con expiración configurable
- **Hash Bcrypt** para contraseñas
- **Validación de Roles** en cada endpoint
- **Refresh Tokens** para sesiones prolongadas

### Autorización
- **Middleware de Permisos** granular
- **Verificación por Entidad** (club ownership)
- **Sanitización de Datos** en formularios
- **Rate Limiting** para APIs

## 📊 Categorías de Peso

El sistema maneja las siguientes categorías oficiales:
- **Peso Mosca**: hasta 51kg
- **Peso Gallo**: 51-54kg
- **Peso Pluma**: 54-57kg
- **Peso Ligero**: 57-60kg
- **Peso Súper Ligero**: 60-64kg
- **Peso Welter**: 64-69kg
- **Peso Súper Welter**: 69-75kg
- **Peso Mediano**: 75-81kg
- **Peso Súper Mediano**: 81-91kg
- **Peso Pesado**: más de 91kg

## 🚀 Instalación y Desarrollo

### Prerrequisitos
```bash
Node.js 18+
PostgreSQL 14+
Bun (recomendado) o npm
```

### Configuración Rápida
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd boxeo-app

# Instalar dependencias
bun install

# Configurar base de datos
createdb boxeo_app
cp backend/.env.example backend/.env
# Editar backend/.env con credenciales

# Inicializar base de datos
bun run db:setup
bun run db:migrate
bun run db:seed

# Ejecutar en desarrollo
bun run dev
```

### URLs de Desarrollo
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📦 Scripts Disponibles

```bash
# Desarrollo
bun run dev              # Frontend + Backend paralelo
bun run frontend:dev     # Solo frontend
bun run backend:dev      # Solo backend

# Construcción
bun run build           # Construir todo
bun run frontend:build  # Construir frontend
bun run backend:build   # Construir backend

# Base de datos
bun run db:setup        # Configurar esquema
bun run db:migrate      # Ejecutar migraciones
bun run db:seed         # Datos de prueba

# Producción
bun run start           # Ejecutar en producción
```

## 🌐 Despliegue en Producción

### Plataformas Soportadas
- **Render**: Deploy automático con PostgreSQL
- **Railway**: Configuración de un click
- **Vercel**: Frontend + Serverless API
- **VPS Propio**: Docker Compose incluido

### Variables de Entorno Críticas
```env
NODE_ENV=production
JWT_SECRET=tu_secret_super_seguro
DB_HOST=tu_host_postgresql
DB_PASSWORD=tu_password_postgresql
FRONTEND_URL=https://tu-dominio.com
```

### Proceso de Despliegue
1. **Configurar Variables** de entorno
2. **Ejecutar Migraciones** de base de datos
3. **Construir Aplicación** para producción
4. **Configurar NGINX** (si aplica)
5. **Verificar SSL/HTTPS** en producción

## 🔮 Funcionalidades Futuras

### Fase 2 - Expansión
- [ ] **Soporte Multi-Deporte** (MMA, Kickboxing)
- [ ] **Rankings Nacionales** automatizados
- [ ] **Sistema de Certificaciones** para árbitros
- [ ] **Integración con Federaciones** oficiales

### Fase 3 - Digitalización
- [ ] **App Móvil Nativa** (iOS/Android)
- [ ] **Streaming en Vivo** de combates
- [ ] **Sistema de Apuestas** regulado
- [ ] **IA para Análisis** de rendimiento

### Fase 4 - Ecosistema
- [ ] **API Pública** para terceros
- [ ] **Marketplace** de equipamiento
- [ ] **Red Social** para boxeadores
- [ ] **Sistema de Becas** y patrocinios

## 🧪 Testing

### Datos de Prueba Incluidos
```
Admin General:
📧 admin@boxeoapp.com
🔑 admin123

Admin Club Madrid:
📧 club1@boxeoapp.com  
🔑 clubadmin123

Boxeadores:
📧 boxer1@boxeoapp.com
🔑 boxer123
```

### Funcionalidades de Demo
- ✅ 4 clubes configurados
- ✅ 5 boxeadores con historiales
- ✅ 3 torneos en diferentes estados
- ✅ Múltiples combates de ejemplo
- ✅ Estadísticas realistas
- ✅ Todos los roles funcionales

## 🤝 Contribución

### Guías de Contribución
1. **Fork** el repositorio
2. **Crear rama** feature/nueva-funcionalidad
3. **Seguir estándares** de código TypeScript
4. **Escribir tests** para nuevas funcionalidades
5. **Documentar cambios** en README
6. **Crear Pull Request** con descripción detallada

### Estándares de Código
- **TypeScript** estricto
- **ESLint** + Prettier
- **Conventional Commits**
- **Tests unitarios** obligatorios
- **Documentación** JSDoc

## 📄 Licencia

**MIT License** - Libre para uso comercial y no comercial

## 🙏 Agradecimientos

- **Federación Española de Boxeo** por las especificaciones
- **Comunidad de Boxeo Amateur** por el feedback
- **Scout/Scrapybara** por la plataforma de desarrollo
- **ShadCN** por los componentes UI
- **Lucide** por la iconografía

## 📞 Soporte

- **Email**: soporte@boxeoapp.com
- **Discord**: #boxeoapp-support
- **Documentación**: /docs
- **Issues**: GitHub Issues

---

**🥊 Desarrollado con pasión para la comunidad del boxeo español** ⚡

*\"Cada campeón fue una vez un principiante que se negó a rendirse\"*