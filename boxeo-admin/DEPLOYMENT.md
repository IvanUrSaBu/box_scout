# 🚀 Guía de Despliegue - BoxeoApp

Esta guía proporciona instrucciones detalladas para desplegar BoxeoApp en diferentes plataformas de producción.

## 📋 Prerrequisitos

- **Node.js 18+**
- **PostgreSQL 14+**
- **Dominio configurado** (opcional)
- **SSL Certificate** (recomendado)

## 🌐 Opciones de Despliegue

### 1. 🎯 Render (Recomendado)

**Pasos para desplegar en Render:**

1. **Crear cuenta en Render.com**
2. **Conectar repositorio de GitHub**
3. **Crear servicio PostgreSQL**:
   ```
   Database Name: boxeo_app
   User: postgres
   Password: [generar automáticamente]
   ```

4. **Crear Web Service**:
   ```yaml
   Build Command: bun install && bun run build
   Start Command: bun run start
   Environment: Node
   ```

5. **Configurar variables de entorno**:
   ```env
   NODE_ENV=production
   PORT=3001
   DB_HOST=[URL de PostgreSQL de Render]
   DB_PORT=5432
   DB_NAME=boxeo_app
   DB_USER=postgres
   DB_PASSWORD=[password generado]
   JWT_SECRET=[generar secret seguro]
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://tu-app.onrender.com
   ```

6. **Deploy automático** desde main branch

### 2. 🚂 Railway

**Configuración en Railway:**

1. **Instalar Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Inicializar proyecto**:
   ```bash
   railway init
   railway add postgresql
   ```

3. **Configurar variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=tu_secret_aqui
   railway variables set FRONTEND_URL=https://tu-app.railway.app
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

### 3. ▲ Vercel + Supabase

**Para el frontend en Vercel:**

1. **Conectar repositorio** en Vercel Dashboard
2. **Configurar Build Settings**:
   ```
   Framework Preset: Vite
   Build Command: cd frontend && bun run build
   Output Directory: frontend/dist
   ```

3. **Variables de entorno**:
   ```env
   VITE_API_URL=https://tu-backend.railway.app
   ```

**Para la base de datos en Supabase:**

1. **Crear proyecto** en Supabase
2. **Ejecutar SQL** del esquema
3. **Configurar Row Level Security**
4. **Obtener connection string**

### 4. 🐳 Docker + VPS

**Dockerfile del backend**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar Bun
RUN npm install -g bun

# Copiar archivos de dependencias
COPY package.json bun.lockb ./
COPY backend/package.json ./backend/

# Instalar dependencias
RUN bun install

# Copiar código fuente
COPY . .

# Construir aplicación
RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]
```

**docker-compose.yml completo**:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=boxeo_app
      - DB_USER=postgres
      - DB_PASSWORD=password
      - JWT_SECRET=tu_secret_super_seguro
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=boxeo_app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

## 🔧 Configuración de Nginx

**nginx.conf**:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3001;
    }

    server {
        listen 80;
        server_name tu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name tu-dominio.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://app/api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 🗄️ Configuración de Base de Datos

### Migración a Producción

1. **Exportar datos de desarrollo**:
   ```bash
   pg_dump boxeo_app > backup.sql
   ```

2. **Crear base de datos en producción**:
   ```bash
   createdb boxeo_app_prod
   ```

3. **Ejecutar schema**:
   ```bash
   psql boxeo_app_prod < backend/src/database/schema.sql
   ```

4. **Poblar con datos iniciales**:
   ```bash
   bun run db:seed
   ```

### Backup Automático

**Script de backup diario**:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://tu-bucket/backups/
rm backup_$DATE.sql
```

**Crontab**:
```bash
0 2 * * * /path/to/backup_script.sh
```

## 🔐 Configuración de Seguridad

### Variables de Entorno Críticas

```env
# OBLIGATORIAS
NODE_ENV=production
JWT_SECRET=generar_con_openssl_rand_base64_32
DB_PASSWORD=password_super_seguro

# RECOMENDADAS
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15
CORS_ORIGIN=https://tu-dominio.com
HELMET_CSP=strict
```

### Generación de JWT Secret

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Rate Limiting

```javascript
// En el backend
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas peticiones, intenta más tarde'
});

app.use('/api', limiter);
```

## 📊 Monitoreo y Logs

### Configuración de Logs

```javascript
// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Checks

```javascript
// En el servidor
app.get('/health', async (req, res) => {
  try {
    // Verificar base de datos
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 🚀 Optimizaciones de Rendimiento

### Configuración de Producción

```javascript
// En producción
app.use(compression());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Cache estático
app.use(express.static('public', {
  maxAge: '1y',
  etag: false
}));
```

### Database Optimization

```sql
-- Índices adicionales para producción
CREATE INDEX CONCURRENTLY idx_fights_date ON fights(fecha_combate);
CREATE INDEX CONCURRENTLY idx_tournaments_status ON tournaments(estado);
CREATE INDEX CONCURRENTLY idx_boxers_active ON boxers(activo) WHERE activo = true;

-- Configuración PostgreSQL
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

## 📈 Escalabilidad

### Load Balancing

```nginx
upstream app_servers {
    server app1:3001;
    server app2:3001;
    server app3:3001;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

### Redis para Sesiones

```javascript
import redis from 'redis';
import session from 'express-session';
import RedisStore from 'connect-redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

## 🛡️ Checklist de Seguridad

- [ ] **HTTPS** configurado con certificados válidos
- [ ] **Environment variables** no expuestas en código
- [ ] **Rate limiting** implementado
- [ ] **CORS** configurado correctamente
- [ ] **Helmet** para headers de seguridad
- [ ] **Input validation** en todos los endpoints
- [ ] **SQL injection** protección con queries parametrizadas
- [ ] **XSS** protección con sanitización
- [ ] **JWT** con expiración apropiada
- [ ] **Database** con usuario limitado
- [ ] **Logs** de seguridad activados
- [ ] **Backup** automático configurado

## 🔍 Troubleshooting

### Problemas Comunes

**Error de conexión a DB**:
```bash
# Verificar conectividad
pg_isready -h $DB_HOST -p $DB_PORT

# Verificar credenciales
psql $DATABASE_URL
```

**Error de CORS**:
```javascript
// Verificar configuración
console.log('CORS Origin:', process.env.FRONTEND_URL);
```

**Error de JWT**:
```bash
# Verificar secret
echo $JWT_SECRET | base64 -d
```

### Logs Útiles

```bash
# Logs de aplicación
tail -f /var/log/boxeo-app/combined.log

# Logs de Nginx
tail -f /var/log/nginx/access.log

# Logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

## 📞 Soporte Post-Despliegue

- **Documentación API**: `/api/docs`
- **Health Check**: `/health`
- **Status Page**: `/status`
- **Admin Panel**: `/admin`

---

**¡Listo para combatir en producción! 🥊**