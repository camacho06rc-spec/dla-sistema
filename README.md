# DLA Sistema

Sistema integral de distribución y logística de alimentos.

## Estructura del Proyecto

```
dla-sistema/
├── backend/        # Backend API (Node.js, TypeScript, Express, Prisma, PostgreSQL)
└── README.md       # Este archivo
```

## Backend

El backend está completamente implementado y funcional. Consulta la [documentación del backend](./backend/README.md) para:

- Instrucciones de instalación
- Configuración de PostgreSQL con Docker
- Endpoints disponibles
- Estructura de la base de datos
- Guía de desarrollo

### Inicio Rápido

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Características Implementadas

✅ Sistema de autenticación con JWT  
✅ Registro y login de usuarios (email/phone)  
✅ Hash de contraseñas con bcrypt  
✅ Middleware de autenticación  
✅ Manejo global de errores  
✅ Validación de datos con Zod  
✅ Rate limiting  
✅ CORS configurado  
✅ Health checks (servidor y base de datos)  
✅ Schema completo de base de datos con 39 tablas  
✅ Seed de datos iniciales  
✅ Docker Compose para PostgreSQL  
✅ TypeScript con compilación estricta  

## Tecnologías

- **Backend**: Node.js, TypeScript, Express
- **Base de Datos**: PostgreSQL 16, Prisma ORM
- **Autenticación**: JWT, bcryptjs
- **Validación**: Zod
- **Seguridad**: Helmet, CORS, Express Rate Limit
- **Contenedores**: Docker, Docker Compose

## Licencia

Este proyecto es privado y confidencial.