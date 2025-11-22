# 🛠️ MVGR Reparaciones - Frontend

Sistema de gestión de reparaciones desarrollado con React, TypeScript y Vite. Aplicación web moderna y profesional para administrar clientes, equipos, reparaciones y repuestos.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Autenticación](#-autenticación)
- [Módulos Principales](#-módulos-principales)
- [Componentes Reutilizables](#-componentes-reutilizables)
- [Variables de Entorno](#-variables-de-entorno)
- [Desarrollo](#-desarrollo)
- [Build para Producción](#-build-para-producción)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Características

- 🔐 **Autenticación JWT** - Sistema de login seguro con tokens
- 📊 **Dashboard Interactivo** - Vista general con estadísticas en tiempo real
- 👥 **Gestión de Clientes** - CRUD completo de clientes
- 💻 **Gestión de Equipos** - Administración de equipos de clientes
- 🔧 **Gestión de Reparaciones** - Control completo del ciclo de vida de reparaciones
- 📦 **Gestión de Repuestos** - Inventario y control de repuestos
- 🎨 **UI Moderna** - Diseño limpio y profesional con TailwindCSS
- 📱 **Responsive Design** - Adaptable a todos los dispositivos
- ⚡ **Alto Rendimiento** - Optimizado con React Query y Vite
- 🔒 **Rutas Protegidas** - Sistema de autenticación por ruta
- ✅ **Validación Robusta** - Formularios validados con Zod y React Hook Form
- 🎯 **100% Tipado** - TypeScript en todo el proyecto

---

## 🛠️ Stack Tecnológico

### Core
- **React 19.2.0** - Biblioteca de UI
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.2.4** - Build tool y dev server

### Estado y Datos
- **Zustand 5.0.8** - Gestión de estado global (autenticación)
- **React Query 5.90.10** - Gestión de estado del servidor y caché
- **Axios 1.13.2** - Cliente HTTP con interceptores

### Routing y Formularios
- **React Router 7.9.6** - Enrutamiento
- **React Hook Form 7.66.1** - Manejo de formularios
- **Zod 4.1.12** - Validación de esquemas
- **@hookform/resolvers 5.2.2** - Integración Zod + React Hook Form

### Estilos
- **TailwindCSS 4.1.17** - Framework CSS utility-first
- **@tailwindcss/vite 4.1.17** - Plugin de Vite para Tailwind

### Desarrollo
- **ESLint** - Linter de código
- **TypeScript ESLint** - Reglas específicas de TypeScript
- **React Query DevTools** - Herramientas de desarrollo

---

## 📦 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o **yarn** / **pnpm**)
- **Backend Spring Boot** corriendo en `http://localhost:8080` (o configurar URL personalizada)

---

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd mvgr-reparaciones-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL base de la API del backend
VITE_API_BASE_URL=http://localhost:8080/api
```

**Nota:** Si no defines `VITE_API_BASE_URL`, el sistema usará `http://localhost:8080/api` por defecto.

### Configuración del Backend

Asegúrate de que tu backend Spring Boot tenga:

- ✅ CORS configurado para permitir peticiones desde `http://localhost:5173`
- ✅ Endpoints REST disponibles en `/api/*`
- ✅ Autenticación JWT funcionando en `/api/auth/login`
- ✅ Endpoints CRUD para:
  - `/api/clientes`
  - `/api/equipos`
  - `/api/reparaciones`
  - `/api/repuestos`

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con HMR

# Build
npm run build        # Compila para producción (TypeScript + Vite)
npm run preview      # Previsualiza el build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint para verificar código
```

---

## 📁 Estructura del Proyecto

```
mvgr-reparaciones-frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── api/               # Configuración de API y llamadas
│   │   ├── axios.ts       # Cliente Axios con interceptores JWT
│   │   ├── queries/       # React Query queries (GET)
│   │   │   ├── clientes.queries.ts
│   │   │   ├── equipos.queries.ts
│   │   │   ├── reparaciones.queries.ts
│   │   │   └── repuestos.queries.ts
│   │   └── mutations/     # React Query mutations (POST/PUT/DELETE)
│   │       ├── auth.mutations.ts
│   │       ├── clientes.mutations.ts
│   │       ├── equipos.mutations.ts
│   │       ├── reparaciones.mutations.ts
│   │       └── repuestos.mutations.ts
│   ├── components/        # Componentes reutilizables
│   │   ├── DataTable.tsx  # Tabla de datos genérica
│   │   ├── FormField.tsx  # Campo de formulario con validación
│   │   ├── Loader.tsx     # Spinner de carga
│   │   ├── Modal.tsx      # Modal reutilizable
│   │   ├── Navbar.tsx     # Barra de navegación superior
│   │   └── Sidebar.tsx    # Menú lateral
│   ├── hooks/             # Custom hooks (vacío, listo para usar)
│   ├── layouts/           # Layouts de página
│   │   └── DashboardLayout.tsx  # Layout principal con Sidebar + Navbar
│   ├── pages/             # Páginas de la aplicación
│   │   ├── ClientesPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EquiposPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ReparacionesPage.tsx
│   │   └── RepuestosPage.tsx
│   ├── router/            # Configuración de rutas
│   │   └── index.tsx      # Rutas públicas y protegidas
│   ├── store/             # Estado global (Zustand)
│   │   └── auth.store.ts  # Store de autenticación
│   ├── types/             # Definiciones de tipos TypeScript
│   │   └── index.ts       # Interfaces y tipos compartidos
│   ├── utils/             # Utilidades (vacío, listo para usar)
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── docs/                  # Documentación
│   └── openapi.json       # Especificación OpenAPI del backend
├── .env                   # Variables de entorno (crear manualmente)
├── package.json
├── tsconfig.json          # Configuración TypeScript
├── tsconfig.app.json      # Config TypeScript para app
├── tsconfig.node.json     # Config TypeScript para Node
├── vite.config.ts         # Configuración de Vite
└── README.md
```

---

## 🏗️ Arquitectura

### Patrón de Arquitectura

El proyecto sigue una **arquitectura modular y escalable**:

```
┌─────────────────────────────────────────┐
│           PAGES (UI Layer)              │
│  LoginPage | DashboardPage | CRUD Pages │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      COMPONENTS (Reusable UI)           │
│  DataTable | Modal | FormField | etc.   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      HOOKS (Business Logic)             │
│  useQueries | useMutations              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      API LAYER (Data Fetching)          │
│  Axios Client | Queries | Mutations     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      STATE MANAGEMENT                   │
│  Zustand (Auth) | React Query (Server)  │
└─────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario interactúa** → Página/Componente
2. **Componente llama** → Hook (useQuery/useMutation)
3. **Hook ejecuta** → Función de API (query/mutation)
4. **API envía** → Request HTTP (Axios)
5. **Axios intercepta** → Agrega JWT automáticamente
6. **Backend responde** → Datos
7. **React Query cachea** → Actualiza UI automáticamente

---

## 🔐 Autenticación

### Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. React Hook Form valida con Zod
3. Se envía `POST /api/auth/login` con `{ username, password }`
4. Backend responde con `{ token, username }`
5. Token se guarda en Zustand (persistido en localStorage)
6. Redirección automática a `/dashboard`

### Protección de Rutas

```typescript
// Rutas públicas
/login

// Rutas protegidas (requieren JWT válido)
/dashboard
/clientes
/equipos
/reparaciones
/repuestos
```

### Interceptores Axios

- **Request Interceptor**: Agrega automáticamente `Authorization: Bearer <token>` a todas las peticiones
- **Response Interceptor**: Si recibe `401 Unauthorized`, hace logout automático y redirige a `/login`

---

## 📦 Módulos Principales

### 1. Clientes

**Rutas:** `/clientes`

**Funcionalidades:**
- ✅ Listar todos los clientes
- ✅ Crear nuevo cliente
- ✅ Editar cliente existente
- ✅ Eliminar cliente
- ✅ Validación de campos (nombre, apellido, email, teléfono, dirección)

**Campos:**
- `nombre` (requerido, max 60)
- `apellido` (requerido, max 60)
- `email` (opcional, formato email, max 120)
- `telefono` (requerido, max 20)
- `direccion` (opcional, max 255)

### 2. Equipos

**Rutas:** `/equipos`

**Funcionalidades:**
- ✅ Listar todos los equipos
- ✅ Crear nuevo equipo
- ✅ Editar equipo existente
- ✅ Eliminar equipo
- ✅ Asociar equipo a cliente
- ✅ Mostrar nombre del cliente en la tabla

**Campos:**
- `marca` (requerido, max 60)
- `modelo` (requerido, max 60)
- `imei` (opcional, max 30)
- `color` (opcional, max 40)
- `descripcion` (opcional, max 255)
- `clienteId` (requerido)

### 3. Reparaciones

**Rutas:** `/reparaciones`

**Funcionalidades:**
- ✅ Listar todas las reparaciones
- ✅ Crear nueva reparación
- ✅ Editar reparación existente
- ✅ Eliminar reparación
- ✅ Cambiar estado de reparación
- ✅ Asociar reparación a equipo
- ✅ Gestionar fechas y precios

**Campos:**
- `equipoId` (requerido)
- `descripcionProblema` (requerido)
- `estado` (opcional): `INGRESADO` | `EN_PROCESO` | `ESPERANDO_REPUESTO` | `COMPLETADO` | `ENTREGADO`
- `fechaIngreso` (opcional, formato date)
- `fechaEstimadaEntrega` (opcional, formato date)
- `fechaEntrega` (opcional, formato date)
- `precioEstimado` (opcional, number)
- `precioFinal` (opcional, number)

### 4. Repuestos

**Rutas:** `/repuestos`

**Funcionalidades:**
- ✅ Listar todos los repuestos
- ✅ Crear nuevo repuesto
- ✅ Editar repuesto existente
- ✅ Eliminar repuesto
- ✅ Asociar repuesto a reparación

**Campos:**
- `nombre` (requerido)
- `descripcion` (opcional)
- `precio` (requerido, number)
- `reparacionId` (opcional)

### 5. Dashboard

**Rutas:** `/dashboard`

**Funcionalidades:**
- ✅ Estadísticas en tiempo real:
  - Total de clientes
  - Total de equipos
  - Reparaciones activas
  - Total de repuestos
- ✅ Acciones rápidas
- ✅ Vista general del sistema

---

## 🧩 Componentes Reutilizables

### DataTable

Tabla genérica y reutilizable para mostrar datos.

**Props:**
- `data`: Array de objetos con `id`
- `columns`: Array de columnas con `header` y `accessor`
- `onEdit`: Función opcional para editar
- `onDelete`: Función opcional para eliminar
- `isLoading`: Estado de carga
- `emptyMessage`: Mensaje cuando no hay datos

**Ejemplo:**
```typescript
<DataTable
  data={clientes}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={isLoading}
  emptyMessage="No hay clientes registrados"
/>
```

### Modal

Modal reutilizable con diferentes tamaños.

**Props:**
- `isOpen`: Boolean para controlar visibilidad
- `onClose`: Función para cerrar
- `title`: Título del modal
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `children`: Contenido del modal

### FormField

Campo de formulario con label y manejo de errores.

**Props:**
- `label`: Texto del label
- `error`: Mensaje de error (opcional)
- `required`: Boolean para mostrar asterisco
- `htmlFor`: ID del input asociado
- `children`: Input/Select/Textarea

### Loader

Spinner de carga con diferentes tamaños.

**Props:**
- `size`: `'sm' | 'md' | 'lg'`

---

## 🔧 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base del backend API | `http://localhost:8080/api` |

**Ejemplo de `.env`:**
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 💻 Desarrollo

### Estructura de un Módulo CRUD

Cada módulo (Clientes, Equipos, etc.) sigue esta estructura:

1. **Types** (`src/types/index.ts`)
   ```typescript
   export interface Entity {
     id: number;
     // campos...
   }
   
   export interface EntityCreate {
     // campos sin id...
   }
   
   export interface EntityUpdate {
     id: number;
     // campos opcionales...
   }
   ```

2. **Queries** (`src/api/queries/entity.queries.ts`)
   ```typescript
   export const useEntitiesQuery = () => {
     return useQuery({
       queryKey: ['entities'],
       queryFn: fetchEntities,
     });
   };
   ```

3. **Mutations** (`src/api/mutations/entity.mutations.ts`)
   ```typescript
   export const useCreateEntityMutation = () => {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: createEntity,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['entities'] });
       },
     });
   };
   ```

4. **Page** (`src/pages/EntityPage.tsx`)
   - Schema de validación con Zod
   - Formulario con React Hook Form
   - Tabla con DataTable
   - Modal para crear/editar

### Agregar un Nuevo Módulo

1. Agregar tipos en `src/types/index.ts`
2. Crear queries en `src/api/queries/`
3. Crear mutations en `src/api/mutations/`
4. Crear página en `src/pages/`
5. Agregar ruta en `src/router/index.tsx`
6. Agregar item en `src/components/Sidebar.tsx`

---

## 🏭 Build para Producción

```bash
# Compilar proyecto
npm run build

# El resultado estará en la carpeta dist/
# Contiene:
# - index.html
# - assets/ (JS y CSS optimizados y minificados)
```

**Optimizaciones automáticas:**
- ✅ Minificación de código
- ✅ Tree-shaking (elimina código no usado)
- ✅ Code splitting automático
- ✅ Optimización de assets
- ✅ Compresión gzip

---

## 🐛 Troubleshooting

### Problema: No se conecta al backend

**Solución:**
1. Verificar que el backend esté corriendo en `http://localhost:8080`
2. Verificar CORS en el backend
3. Revisar `VITE_API_BASE_URL` en `.env`
4. Revisar la consola del navegador para errores

### Problema: Token no se guarda

**Solución:**
1. Verificar que el backend devuelva `{ token, username }`
2. Revisar localStorage en DevTools
3. Verificar que Zustand esté configurado correctamente

### Problema: Rutas protegidas redirigen al login

**Solución:**
1. Verificar que el token esté guardado en localStorage
2. Verificar que el token no haya expirado
3. Revisar interceptores de Axios

### Problema: Formularios no validan

**Solución:**
1. Verificar que los schemas de Zod estén correctos
2. Verificar que React Hook Form esté configurado con `zodResolver`
3. Revisar mensajes de error en la consola

---

## 📝 Notas de Desarrollo

- El proyecto usa **React 19** con las últimas características
- **TypeScript** está configurado en modo estricto
- Todos los componentes están **100% tipados**
- El código sigue **buenas prácticas** de React
- **React Query** maneja automáticamente el caché y la sincronización
- **Zustand** se usa solo para autenticación (estado mínimo)
- Los formularios usan **validación en tiempo real** con Zod

---

## 🎯 Próximas Mejoras

- [ ] Filtros y búsqueda en tablas
- [ ] Paginación para listas grandes
- [ ] Exportación a Excel/PDF
- [ ] Notificaciones toast
- [ ] Modo oscuro
- [ ] Tests unitarios
- [ ] Tests E2E

---

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

## 👨‍💻 Autor

Desarrollado para MVGR Reparaciones

---