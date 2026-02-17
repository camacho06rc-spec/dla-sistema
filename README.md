# DLA Sistema - Backend API

Sistema de gestión para distribuidora con catálogo de productos, inventario, clientes y ventas.

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Zod** - Validación de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar servidor en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📊 Estructura del Proyecto

```
dla-sistema/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── src/
│   ├── index.ts               # Punto de entrada
│   ├── middlewares/
│   │   ├── authenticate.ts    # Autenticación JWT
│   │   └── errorHandler.ts    # Manejo de errores
│   ├── utils/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── AppError.ts        # Clase de errores
│   │   └── responses.ts       # Utilidades de respuesta
│   └── modules/
│       ├── categories/        # Módulo de categorías
│       ├── brands/            # Módulo de marcas
│       └── products/          # Módulo de productos
└── test-catalog.http          # Tests manuales

```

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluir el token en el header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

---

## 📂 Módulo de Catálogo

### **Categorías**

#### Listar Categorías
```http
GET /api/categories
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20, max: 100)
- `search` (opcional): Buscar por nombre
- `isActive` (opcional): Filtrar por estado (true/false)

**Respuesta:**
```json
{
  "success": true,
  "message": "Categorías obtenidas exitosamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Bebidas",
        "slug": "bebidas",
        "imageUrl": "https://...",
        "order": 1,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

#### Obtener Categoría
```http
GET /api/categories/:id
```

#### Crear Categoría
```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bebidas",
  "imageUrl": "https://example.com/bebidas.jpg",
  "order": 1
}
```

#### Actualizar Categoría
```http
PUT /api/categories/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bebidas y Refrescos"
}
```

#### Toggle Categoría (Activar/Desactivar)
```http
PATCH /api/categories/:id/toggle
Authorization: Bearer {token}
```

#### Eliminar Categoría
```http
DELETE /api/categories/:id
Authorization: Bearer {token}
```

---

### **Marcas**

#### Listar Marcas
```http
GET /api/brands
```

**Query Parameters:** Igual que categorías

#### Obtener Marca
```http
GET /api/brands/:id
```

#### Crear Marca
```http
POST /api/brands
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Coca Cola",
  "imageUrl": "https://example.com/coca-cola-logo.jpg"
}
```

#### Actualizar Marca
```http
PUT /api/brands/:id
Authorization: Bearer {token}
```

#### Toggle Marca
```http
PATCH /api/brands/:id/toggle
Authorization: Bearer {token}
```

#### Eliminar Marca
```http
DELETE /api/brands/:id
Authorization: Bearer {token}
```

---

### **Productos**

#### Listar Productos
```http
GET /api/products
```

**Query Parameters:**
- `page`, `limit`, `search` (igual que categorías)
- `categoryId` (opcional): Filtrar por categoría
- `brandId` (opcional): Filtrar por marca
- `isActive` (opcional): Filtrar por estado
- `isReturnable` (opcional): Filtrar retornables

**Respuesta:**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Coca Cola 600ml",
        "slug": "coca-cola-600ml",
        "sku": "CC600",
        "description": "...",
        "categoryId": "uuid",
        "brandId": "uuid",
        "mainImageUrl": "https://...",
        "isReturnable": true,
        "containersPerBox": 24,
        "depositPerContainer": "5.00",
        "piecesPerBox": 24,
        "grantsPoints": true,
        "isActive": true,
        "category": {
          "id": "uuid",
          "name": "Bebidas",
          "slug": "bebidas"
        },
        "brand": {
          "id": "uuid",
          "name": "Coca Cola",
          "slug": "coca-cola"
        },
        "currentPrice": {
          "id": "uuid",
          "priceEventual": "550.00",
          "priceFrecuente": "530.00",
          "priceVip": "500.00"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

#### Obtener Producto
```http
GET /api/products/:id
```

#### Crear Producto
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Coca Cola 600ml",
  "sku": "CC600",
  "description": "Coca Cola botella retornable 600ml",
  "categoryId": "uuid",
  "brandId": "uuid",
  "mainImageUrl": "https://...",
  "isReturnable": true,
  "containersPerBox": 24,
  "depositPerContainer": 5,
  "piecesPerBox": 24,
  "grantsPoints": true,
  "prices": {
    "priceEventual": 550,
    "priceFrecuente": 530,
    "priceVip": 500
  }
}
```

**Validaciones:**
- Si `isReturnable: true`, debe incluir `containersPerBox` y `depositPerContainer`
- SKU debe ser único (si se proporciona)
- Categoría y marca deben existir y estar activas

#### Actualizar Producto
```http
PUT /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Coca Cola 600ml Retornable",
  "description": "Nueva descripción"
}
```

**Nota:** Los precios NO se actualizan aquí. Usar endpoint específico.

#### Toggle Producto
```http
PATCH /api/products/:id/toggle
Authorization: Bearer {token}
```

#### Eliminar Producto
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

---

### **Precios de Productos**

#### Actualizar Precios
```http
PUT /api/products/:id/prices
Authorization: Bearer {token}
Content-Type: application/json

{
  "priceEventual": 560,
  "priceFrecuente": 540,
  "priceVip": 510,
  "reason": "Ajuste por inflación"
}
```

**Comportamiento:**
- Cierra el precio actual en el historial
- Actualiza los precios actuales
- Crea nuevo registro en historial con fecha y usuario

#### Historial de Precios
```http
GET /api/products/:id/price-history
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "priceEventual": "560.00",
      "priceFrecuente": "540.00",
      "priceVip": "510.00",
      "validFrom": "2024-02-01T00:00:00.000Z",
      "validTo": null,
      "reason": "Ajuste por inflación",
      "changedBy": "uuid",
      "changedByUser": {
        "id": "uuid",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@dla.com"
      }
    }
  ]
}
```

---

### **Galería de Imágenes**

#### Agregar Imagen
```http
POST /api/products/:id/images
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "order": 1
}
```

#### Actualizar Orden de Imagen
```http
PUT /api/products/:id/images/:imageId/order
Authorization: Bearer {token}
Content-Type: application/json

{
  "order": 0
}
```

#### Eliminar Imagen
```http
DELETE /api/products/:id/images/:imageId
Authorization: Bearer {token}
```

---

## 🧪 Testing

Usa el archivo `test-catalog.http` con la extensión REST Client de VS Code para probar todos los endpoints.

---

## 📝 Auditoría

Todos los cambios importantes (crear, actualizar, eliminar) se registran automáticamente en la tabla `audit_logs` con:
- Usuario que realizó la acción
- Tipo de acción
- Valores antiguos y nuevos
- Fecha y hora

---

## 🔒 Seguridad

- Autenticación JWT en endpoints protegidos
- Validación de datos con Zod
- Manejo consistente de errores
- Auditoría automática de cambios

---

## 🎯 Próximos Módulos

1. ✅ **Catálogo** - Categorías, Marcas, Productos (COMPLETADO)
2. ⏳ **Inventario** - Stock dual (cajas + piezas) + Kardex
3. ⏳ **Clientes** - Gestión y tiers
4. ⏳ **Ventas** - Pedidos y pagos

---

## 📄 Licencia

ISC