# DLA Sistema - Backend

Backend completo para el Sistema DLA construido con Node.js, TypeScript, Express, Prisma y PostgreSQL.

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Docker y Docker Compose
- Git

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/camacho06rc-spec/dla-sistema.git
cd dla-sistema/backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones. Las variables por defecto son:

```env
DATABASE_URL="postgresql://dla_user:dla_password_2026@localhost:5432/dla_db"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Iniciar PostgreSQL con Docker

```bash
docker-compose up -d
```

Verifica que PostgreSQL esté corriendo:

```bash
docker ps
```

### 5. Ejecutar migraciones de Prisma

```bash
npm run db:generate
npm run db:push
```

### 6. Ejecutar seed de datos iniciales

```bash
npm run db:seed
```

Esto creará:
- Rol ADMIN y MANAGER
- Usuario admin (email: `admin@dla.com`, password: `Admin123!`)
- Sucursal principal (code: `MAIN`)

### 7. Iniciar el servidor en modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run db:generate` - Genera el cliente Prisma
- `npm run db:migrate` - Ejecuta migraciones de Prisma
- `npm run db:push` - Sincroniza el schema sin crear migraciones
- `npm run db:seed` - Ejecuta el seed de datos iniciales
- `npm run db:studio` - Abre Prisma Studio (GUI para base de datos)

## 🔌 Endpoints API

### Health Check

**GET** `/api/health`
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-17T20:31:00.000Z",
    "uptime": 123.456
  }
}
```

**GET** `/api/health/db`
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-02-17T20:31:00.000Z"
  }
}
```

### Autenticación

**POST** `/api/auth/register`

Registro de nuevo usuario (requiere email o phone)

```json
{
  "email": "user@example.com",
  "phone": "5551234567",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "5551234567",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2026-02-17T20:31:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

**POST** `/api/auth/login`

Login de usuario (con email o phone)

```json
{
  "email": "admin@dla.com",
  "password": "Admin123!"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@dla.com",
      "firstName": "Admin",
      "lastName": "User",
      "isActive": true,
      "createdAt": "2026-02-17T20:31:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Usuarios

**GET** `/api/users/profile`

Obtener perfil del usuario autenticado (requiere JWT token)

Headers:
```
Authorization: Bearer <jwt-token>
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@dla.com",
    "phone": null,
    "firstName": "Admin",
    "lastName": "User",
    "isActive": true,
    "createdAt": "2026-02-17T20:31:00.000Z",
    "updatedAt": "2026-02-17T20:31:00.000Z"
  }
}
```

## 🗄️ Estructura de Base de Datos

El sistema incluye las siguientes tablas organizadas por módulos:

### Seguridad y Auditoría
- `users` - Usuarios del sistema
- `roles` - Roles de usuarios
- `permissions` - Permisos del sistema
- `user_roles` - Relación usuarios-roles
- `role_permissions` - Relación roles-permisos
- `audit_logs` - Logs de auditoría

### Sucursales
- `branches` - Sucursales/locales

### Catálogo
- `categories` - Categorías de productos
- `brands` - Marcas
- `products` - Productos
- `product_images` - Imágenes de productos
- `product_prices` - Precios de productos
- `product_price_history` - Historial de precios

### Inventario Dual
- `inventory` - Inventario por producto/sucursal
- `inventory_movements` - Movimientos de inventario
- `stock_rules` - Reglas de stock mínimo
- `stock_alerts` - Alertas de stock

### Clientes
- `customers` - Clientes
- `addresses` - Direcciones de clientes

### Pedidos
- `orders` - Pedidos
- `order_items` - Items de pedidos
- `order_status_history` - Historial de estados

### Pagos
- `payments` - Pagos

### Crédito
- `credit_accounts` - Cuentas de crédito
- `credit_movements` - Movimientos de crédito

### Retornables
- `returnables_ledger` - Libro mayor de retornables
- `returnables_events` - Eventos de retornables

### Lealtad/Puntos
- `loyalty_rules` - Reglas de lealtad
- `loyalty_wallets` - Billeteras de puntos
- `loyalty_movements` - Movimientos de puntos

### Promociones
- `promotions` - Promociones

### Entregas
- `deliveries` - Entregas

### POS/Caja
- `cash_register_sessions` - Sesiones de caja

### Proveedores y Compras
- `suppliers` - Proveedores
- `goods_receipts` - Recibos de mercancía
- `goods_receipt_items` - Items de recibos
- `product_cost_history` - Historial de costos

### Gastos Operativos
- `expense_categories` - Categorías de gastos
- `expenses` - Gastos

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **TypeScript** - Superset tipado de JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Hash de contraseñas
- **Zod** - Validación de schemas
- **Helmet** - Seguridad HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Protección contra ataques

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Configuración de Prisma
│   │   └── env.ts               # Validación de variables de entorno
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Middleware de autenticación JWT
│   │   ├── error.middleware.ts  # Manejo global de errores
│   │   └── validation.middleware.ts  # Validación con Zod
│   ├── modules/
│   │   ├── auth/                # Módulo de autenticación
│   │   ├── users/               # Módulo de usuarios
│   │   └── health/              # Módulo de health checks
│   ├── utils/
│   │   ├── jwt.ts               # Utilidades JWT
│   │   ├── bcrypt.ts            # Utilidades de hash
│   │   └── response.ts          # Respuestas estandarizadas
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── app.ts                   # Configuración de Express
│   └── server.ts                # Punto de entrada
├── prisma/
│   ├── schema.prisma            # Schema de base de datos
│   └── seed.ts                  # Datos iniciales
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore
├── docker-compose.yml           # Configuración de PostgreSQL
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Rate limiting en endpoints
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de datos con Zod
- ✅ Variables de entorno protegidas

## 🧪 Pruebas

### Probar Health Check

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
```

### Probar Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dla.com",
    "password": "Admin123!"
  }'
```

### Probar Perfil (requiere token)

```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <tu-jwt-token>"
```

## 📝 Notas de Desarrollo

- El servidor usa `tsx watch` para hot-reload en desarrollo
- Prisma Studio disponible con `npm run db:studio`
- Logs detallados en desarrollo, solo errores en producción
- Rate limiting: 100 requests por 15 minutos por IP
- Tokens JWT expiran en 7 días por defecto

## 🐳 Docker

Para detener PostgreSQL:
```bash
docker-compose down
```

Para eliminar todos los datos:
```bash
docker-compose down -v
```

Para ver logs de PostgreSQL:
```bash
docker logs dla-postgres
```

## 📮 Soporte

Para problemas o preguntas, abrir un issue en el repositorio.

## 📄 Licencia

Este proyecto es privado y confidencial.
