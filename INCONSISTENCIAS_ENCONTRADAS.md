# 🔍 Inconsistencias encontradas entre OpenAPI y Frontend

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **REPARACIONES - Estados incorrectos**

**OpenAPI (líneas 968-974, 1016-1022):**
```json
"enum": ["INGRESADO", "EN_PROCESO", "ESPERANDO_REPUESTO", "COMPLETADO", "ENTREGADO"]
```

**Frontend actual:**
```typescript
'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA'
```

**❌ Problema**: Los estados no coinciden. El frontend usa estados que no existen en el backend.

---

### 2. **REPARACIONES - Campos requeridos**

**OpenAPI (líneas 995-998):**
```json
"required": ["descripcionProblema", "equipoId"]
```

**Frontend actual:**
- Requiere: `descripcionProblema`, `fechaIngreso`, `estado`, `equipoId`

**❌ Problema**: El frontend requiere `estado` y `fechaIngreso` pero el backend NO los requiere.

---

### 3. **REPUESTOS - Estructura completamente diferente**

**OpenAPI (líneas 910-931):**
```json
{
  "nombre": "string (required)",
  "descripcion": "string (optional)",
  "precio": "number (required)",
  "reparacionId": "integer (optional)"
}
```

**Frontend actual:**
```typescript
{
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;  // ❌ NO existe en OpenAPI
  categoria?: string;  // ❌ NO existe en OpenAPI
}
```

**❌ Problema**: 
- El frontend tiene `stock` y `categoria` que NO existen en el backend
- El backend tiene `reparacionId` que NO existe en el frontend

---

### 4. **CLIENTES - Email no requerido**

**OpenAPI (líneas 1141-1145):**
```json
"required": ["apellido", "nombre", "telefono"]
```

**Frontend actual:**
- Requiere: `nombre`, `apellido`, `email`, `telefono`

**❌ Problema**: El frontend requiere `email` pero el backend NO lo requiere (aunque tiene validación de formato email).

---

### 5. **REPARACIONES - PUT endpoint con error en OpenAPI**

**OpenAPI (líneas 188-195):**
```json
{
  "name": "request",
  "in": "query",  // ❌ Debería ser "body"
  "required": true,
  "schema": {
    "$ref": "#/components/schemas/ReparacionRequestDTO"
  }
}
```

**❌ Problema**: El parámetro está en `query` cuando debería estar en el `requestBody`. Esto parece un error en el OpenAPI generado.

---

## ✅ CORRECCIONES NECESARIAS

1. Actualizar estados de Reparaciones
2. Hacer `estado` y `fechaIngreso` opcionales en Reparaciones
3. Eliminar `stock` y `categoria` de Repuestos, agregar `reparacionId`
4. Hacer `email` opcional en Clientes
5. Verificar el endpoint PUT de Reparaciones

