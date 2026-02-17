# Guía de Despliegue - Sistema DLA

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- npm o yarn
- Git

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/camacho06rc-spec/dla-sistema.git
cd dla-sistema
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copiar el archivo de ejemplo y editar con tus valores:

```bash
cp .env.example .env
```

Editar `.env` con tu editor favorito:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dla_sistema?schema=public"
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
JWT_EXPIRES_IN=7d
```

**Importante:** Cambia `usuario`, `contraseña` y `JWT_SECRET` por valores reales y seguros.

### 4. Crear Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE dla_sistema;

# Salir de psql
\q
```

### 5. Ejecutar Migraciones de Prisma

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones (crear tablas)
npm run prisma:migrate
```

### 6. (Opcional) Crear Usuario Admin Inicial

Ejecuta el siguiente script SQL en tu base de datos para crear un usuario admin inicial:

```sql
-- Nota: La contraseña en este ejemplo es "Admin123!" hasheada con bcrypt
-- Deberás generar tu propio hash usando bcrypt
INSERT INTO users (id, email, phone, password, "firstName", "lastName", role, "isActive")
VALUES (
  gen_random_uuid(),
  'admin@dla.com',
  '1234567890',
  '$2b$10$ejemplo.hash.de.bcrypt.aqui',
  'Admin',
  'Sistema',
  'ADMIN',
  true
);
```

Para generar el hash de contraseña, puedes usar este script de Node.js:

```javascript
const bcrypt = require('bcrypt');
const password = 'Admin123!';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash:', hash);
});
```

### 7. Iniciar el Servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

### 8. Verificar Instalación

Abre tu navegador o usa curl para verificar que el API está funcionando:

```bash
curl http://localhost:3001/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-02-17T..."
}
```

## Probar la API

Usa el archivo `test-catalog.http` incluido con la extensión REST Client de VS Code, o usa Postman/Insomnia.

### Obtener Token JWT (después de crear usuario)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "admin@dla.com",
    "password": "Admin123!"
  }'
```

### Crear una Categoría

```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Bebidas",
    "imageUrl": "https://example.com/bebidas.jpg",
    "order": 1
  }'
```

## Despliegue en Producción

### Consideraciones de Seguridad

1. **Variables de Entorno:**
   - Usar JWT_SECRET fuerte y aleatorio (mínimo 32 caracteres)
   - No incluir el archivo `.env` en el repositorio

2. **Base de Datos:**
   - Usar conexiones SSL a PostgreSQL
   - Implementar backups regulares
   - Usar usuarios con permisos mínimos necesarios

3. **Servidor:**
   - Ejecutar detrás de un proxy inverso (nginx/Apache)
   - Habilitar HTTPS/TLS con certificado válido
   - Configurar firewall para permitir solo puertos necesarios

4. **Monitoreo:**
   - Implementar logging centralizado
   - Configurar alertas para errores críticos
   - Monitorear métricas de rendimiento

### Ejemplo de Despliegue con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar el proyecto
npm run build

# Iniciar con PM2
pm2 start dist/index.js --name dla-sistema

# Configurar inicio automático
pm2 startup
pm2 save
```

### Ejemplo de Configuración Nginx

```nginx
server {
    listen 80;
    server_name api.dla-sistema.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Mantenimiento

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar dependencias mayores (con cuidado)
npm install package@latest
```

### Backups de Base de Datos

```bash
# Crear backup
pg_dump -U usuario dla_sistema > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -U usuario dla_sistema < backup_20240217_120000.sql
```

### Ver Logs con PM2

```bash
pm2 logs dla-sistema
pm2 logs dla-sistema --lines 100
```

## Solución de Problemas

### Error: "Cannot connect to database"

- Verificar que PostgreSQL está corriendo
- Verificar DATABASE_URL en `.env`
- Verificar credenciales de acceso

### Error: "Port 3001 already in use"

- Cambiar el puerto en `.env`
- O detener el proceso que está usando el puerto

### Error de Migración de Prisma

```bash
# Resetear la base de datos (¡CUIDADO! Borra todos los datos)
npm run prisma:migrate reset

# O crear una nueva migración
npx prisma migrate dev --name nombre_de_la_migracion
```

## Soporte

Para preguntas o problemas, crear un issue en el repositorio de GitHub.
