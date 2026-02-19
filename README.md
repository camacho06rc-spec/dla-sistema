# 🏢 Sistema DLA - Distribuidora de Abarrotes

Sistema completo de gestión para distribuidoras de abarrotes con módulos de catálogo, inventario, clientes y pedidos.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey)](https://expressjs.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos](#-módulos)
- [Base de Datos](#-base-de-datos)

---

## ✨ Características

### 🛒 Gestión de Catálogo
- ✅ Categorías con slug automático
- ✅ Marcas con activación/desactivación
- ✅ Productos con precios multi-tier (EVENTUAL/FRECUENTE/VIP)
- ✅ Historial automático de cambios de precio
- ✅ Galería de imágenes por producto
- ✅ Productos retornables con sistema de depósitos

### 📦 Control de Inventario
- ✅ Stock dual (cajas + piezas separadas)
- ✅ Abrir cajas automáticamente (conversión cajas → piezas)
- ✅ Kardex completo con auditoría
- ✅ Stock mínimo y alertas automáticas
- ✅ Múltiples tipos de movimientos (IN, OUT, SALE, RETURN, ADJUSTMENT, TRANSFER)

### 👥 Gestión de Clientes
- ✅ Tipos: B2B / Eventos
- ✅ Tiers de precio: EVENTUAL / FRECUENTE / VIP
- ✅ Direcciones múltiples con dirección por defecto
- ✅ Control de crédito (límite de crédito y días)
- ✅ Bloqueo/desbloqueo con motivo
- ✅ Validaciones únicas (teléfono, email)

### 🛍️ Sistema de Pedidos
- ✅ Cálculo automático de precios según tier del cliente
- ✅ Validaciones completas (cliente activo, stock suficiente)
- ✅ Descuento automático de inventario al confirmar pedido
- ✅ Devolución automática de inventario al cancelar
- ✅ Cálculo de depósitos de retornables
- ✅ Flujo de estados: CREATED → CONFIRMED → PREPARING → IN_ROUTE → DELIVERED
- ✅ Historial completo de cambios de estado con auditoría

---

## 🛠️ Tecnologías

- **Backend**: Node.js 20+ con TypeScript
- **Framework**: Express.js
- **ORM**: Prisma 5.20
- **Base de Datos**: PostgreSQL 16
- **Validación**: Zod
- **Autenticación**: JWT + bcrypt
- **Containerización**: Docker + Docker Compose

---

## 📦 Requisitos Previos

- **Node.js** 20 o superior
- **Docker** y **Docker Compose**
- **Git**
- **PowerShell** (Windows) o Terminal (Mac/Linux)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/camacho06rc-spec/dla-sistema.git
cd dla-sistema
```

### 2. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
# Base de datos
DATABASE_URL="postgresql://dla_user:dla_password_2026@localhost:5433/dla_db"

# JWT
JWT_SECRET="tu_secret_key_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
```

### 3. Levantar base de datos con Docker

```bash
docker-compose up -d
```

Esto levanta PostgreSQL en el puerto **5433**.

### 4. Instalar dependencias

```bash
npm install
```

### 5. Ejecutar migraciones y seed

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar base de datos con datos de prueba
npm run db:seed
```

### 6. Iniciar servidor

```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3001**

---

## ⚙️ Configuración

### Datos de Prueba (Seed)

Después de ejecutar `npm run db:seed`, tendrás:

#### **Usuario Admin:**
- Email: `admin@dla.com`
- Password: `Admin123!`

#### **Sucursal:**
- Nombre: Sucursal Principal
- Código: MAIN

#### **Categoría:**
- Bebidas

#### **Marca:**
- Coca Cola

#### **Producto:**
- Cerveza Corona Mega 1.2L
- SKU: CC600ET
- Precios por tier:
  - EVENTUAL: $560 MXN/pieza
  - FRECUENTE: $535 MXN/pieza
  - VIP: $510 MXN/pieza
- Retornable con depósito de $5 MXN por envase

#### **Cliente:**
- Juan Pérez - Abarrotes El Buen Precio
- Código: CLI-1771372653733-S17
- Tier: EVENTUAL
- Tipo: B2B

#### **Inventario:**
- 8 cajas + 53 piezas de Coca Cola 600ml
- Stock total: 245 piezas

---

## 📖 Uso

### 1. Login

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@dla.com",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@dla.com",
      "firstName": "Admin",
      "lastName": "Sistema"
    }
  }
}
```

Guarda el `token` para usarlo en las siguientes peticiones.

---

### 2. Crear un Pedido

```bash
POST http://localhost:3001/api/orders
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "customerId": "uuid-del-cliente",
  "branchId": "uuid-de-la-sucursal",
  "addressId": "uuid-de-la-direccion",
  "paymentMethod": "CASH",
  "items": [
    {
      "productId": "uuid-del-producto",
      "boxes": 2,
      "pieces": 5
    }
  ],
  "notes": "Entregar en horario de mañana"
}
```

El sistema automáticamente:
- ✅ Calcula el precio según el tier del cliente
- ✅ Valida que hay stock suficiente
- ✅ Calcula el depósito de retornables
- ✅ Crea el pedido en estado CREATED

---

### 3. Confirmar Pedido (Descuenta Inventario)

```bash
PATCH http://localhost:3001/api/orders/{orderId}/status
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Pedido confirmado"
}
```

Esto automáticamente:
- ✅ Descuenta el stock del inventario
- ✅ Registra movimiento en kardex tipo SALE
- ✅ Guarda historial de cambio de estado

---

## 🔌 API Endpoints

### **Autenticación**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con email y password |
| POST | `/api/auth/register` | Registrar nuevo usuario |

---

### **Categorías**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/catalog/categories` | Listar categorías | ✅ |
| POST | `/api/catalog/categories` | Crear categoría | ✅ |
| PUT | `/api/catalog/categories/:id` | Actualizar categoría | ✅ |
| DELETE | `/api/catalog/categories/:id` | Eliminar categoría | ✅ |
| PATCH | `/api/catalog/categories/:id/toggle-active` | Activar/desactivar | ✅ |

---

### **Marcas**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/catalog/brands` | Listar marcas | ✅ |
| POST | `/api/catalog/brands` | Crear marca | ✅ |
| PUT | `/api/catalog/brands/:id` | Actualizar marca | ✅ |
| DELETE | `/api/catalog/brands/:id` | Eliminar marca | ✅ |
| PATCH | `/api/catalog/brands/:id/toggle-active` | Activar/desactivar | ✅ |

---

### **Productos**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/catalog/products` | Listar productos (con filtros) | ✅ |
| GET | `/api/catalog/products/:id` | Ver producto específico | ✅ |
| POST | `/api/catalog/products` | Crear producto | ✅ |
| PUT | `/api/catalog/products/:id` | Actualizar producto | ✅ |
| PATCH | `/api/catalog/products/:id/toggle-active` | Activar/desactivar | ✅ |
| PATCH | `/api/catalog/products/:id/prices` | Actualizar precios | ✅ |
| GET | `/api/catalog/products/:id/price-history` | Historial de precios | ✅ |

---

### **Inventario**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/inventory/:productId/:branchId` | Ver inventario | ✅ |
| POST | `/api/inventory/adjust` | Ajustar inventario | ✅ |
| POST | `/api/inventory/open-box` | Abrir caja (convertir a piezas) | ✅ |
| GET | `/api/inventory/:productId/:branchId/movements` | Ver kardex | ✅ |
| GET | `/api/inventory/alerts` | Ver alertas de stock mínimo | ✅ |

---

### **Clientes**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/customers` | Listar clientes (con filtros) | ✅ |
| GET | `/api/customers/:id` | Ver cliente específico | ✅ |
| POST | `/api/customers` | Crear cliente | ✅ |
| PUT | `/api/customers/:id` | Actualizar cliente | ✅ |
| PATCH | `/api/customers/:id/toggle-active` | Activar/desactivar | ✅ |
| PATCH | `/api/customers/:id/toggle-block` | Bloquear/desbloquear | ✅ |
| PATCH | `/api/customers/:id/change-tier` | Cambiar tier | ✅ |
| GET | `/api/customers/:id/addresses` | Listar direcciones | ✅ |
| POST | `/api/customers/:id/addresses` | Agregar dirección | ✅ |
| PUT | `/api/customers/:id/addresses/:addressId` | Actualizar dirección | ✅ |
| DELETE | `/api/customers/:id/addresses/:addressId` | Eliminar dirección | ✅ |
| PATCH | `/api/customers/:id/addresses/:addressId/set-default` | Marcar como default | ✅ |

---

### **Pedidos**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Listar pedidos (con filtros) | ✅ |
| GET | `/api/orders/:id` | Ver pedido con historial | ✅ |
| POST | `/api/orders` | Crear pedido | ✅ |
| PATCH | `/api/orders/:id/status` | Actualizar estado | ✅ |

---

## 📁 Estructura del Proyecto

```
dla-sistema/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de base de datos
│   │   └── seed.ts             # Datos de prueba
│   ├── src/
│   │   ├── config/             # Configuraciones
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── middleware/         # Middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── modules/            # Módulos del sistema
│   │   │   ├── auth/
│   │   │   ├── brands/
│   │   │   ├── categories/
│   │   │   ├── customers/
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── users/
│   │   ├── utils/              # Utilidades
│   │   │   ├── bcrypt.ts
│   │   │   ├── jwt.ts
│   │   │   ├── response.ts
│   │   │   └── slug.ts
│   │   ├── app.ts              # Configuración de Express
│   │   └── server.ts           # Servidor principal
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🎯 Módulos

### 1. **Catálogo** (`/api/catalog`)
Gestión de categorías, marcas y productos con precios multi-tier.

### 2. **Inventario** (`/api/inventory`)
Control de stock dual (cajas/piezas) con kardex completo.

### 3. **Clientes** (`/api/customers`)
Gestión de clientes B2B con tiers de precio y direcciones.

### 4. **Pedidos** (`/api/orders`)
Sistema completo de pedidos con integración de inventario.

---

## 🗄️ Base de Datos

### Diagrama de Relaciones Principales

```
User
  ├── Orders (createdBy)
  ├── InventoryMovements (userId)
  └── OrderStatusHistory (userId)

Customer
  ├── Orders
  └── Addresses

Product
  ├── ProductPrices (3 tiers)
  ├── Inventory
  ├── OrderItems
  └── ProductImages

Branch
  ├── Inventory
  └── Orders

Order
  ├── OrderItems
  ├── OrderStatusHistory
  ├── Customer
  ├── Branch
  └── Address
```

---

## 🔐 Autenticación

Todos los endpoints (excepto login/register) requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer {token}
```

---

## 🧪 Testing

```bash
# Ver los datos en Prisma Studio
npm run db:studio
```

Esto abre una interfaz visual en **http://localhost:5555** para ver la base de datos.

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Inicia servidor en modo desarrollo

# Base de datos
npm run db:migrate          # Ejecuta migraciones
npm run db:seed             # Pobla datos de prueba
npm run db:studio           # Abre Prisma Studio
npx prisma generate         # Genera cliente de Prisma

# Docker
docker-compose up -d        # Levanta PostgreSQL
docker-compose down         # Detiene PostgreSQL
docker-compose logs -f      # Ver logs de PostgreSQL
```

---

## 🚦 Estados del Pedido

```
CREATED → CONFIRMED → PREPARING → IN_ROUTE → DELIVERED
   ↓
CANCELLED (puede cancelarse desde cualquier estado)
```

- **CREATED**: Pedido creado, NO descuenta inventario
- **CONFIRMED**: Pedido confirmado, **DESCUENTA inventario automáticamente**
- **PREPARING**: En preparación
- **IN_ROUTE**: En camino
- **DELIVERED**: Entregado
- **CANCELLED**: Cancelado, **REGRESA inventario si estaba CONFIRMED**

---

## 🎨 Tiers de Cliente

| Tier | Descripción | Precio Ejemplo (Coca Cola 600ml) |
|------|-------------|----------------------------------|
| **EVENTUAL** | Clientes ocasionales | $560 MXN/pieza |
| **FRECUENTE** | Clientes regulares | $535 MXN/pieza |
| **VIP** | Clientes preferenciales | $510 MXN/pieza |

---

## 🛡️ Seguridad

- ✅ Passwords encriptados con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de datos con Zod
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting

---

## 📊 Características del Inventario

### Stock Dual
- **Cajas**: Unidades completas
- **Piezas**: Unidades sueltas

### Abrir Cajas
Convierte cajas en piezas automáticamente:
- 1 caja de 24 piezas = -1 caja, +24 piezas
- Registra en kardex como ADJUSTMENT

### Kardex
Registra TODOS los movimientos con:
- ✅ Tipo de movimiento (IN, OUT, SALE, RETURN, etc.)
- ✅ Usuario que lo realizó
- ✅ Fecha y hora
- ✅ Razón del movimiento
- ✅ Referencia (ID de pedido, compra, etc.)

---

## 📞 Soporte

Para preguntas o problemas, contacta a:
- **Email**: camacho.06rc@gmail.com
- **GitHub**: [@camacho06rc-spec](https://github.com/camacho06rc-spec)

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.

---

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional con:
- ✅ 4 módulos completos
- ✅ 40+ endpoints
- ✅ ~5,000 líneas de código
- ✅ Pruebas exitosas
- ✅ Datos de ejemplo
- ✅ Documentación completa

**¡Empieza a usarlo ahora!** 🚀