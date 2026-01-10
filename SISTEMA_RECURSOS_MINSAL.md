# 📚 Sistema de Recursos MINSAL - Arquitectura

## 🎯 Descripción General

Sistema profesional de gestión y visualización de recursos PDF (normativas, guías clínicas y documentos técnicos) con arquitectura escalable, búsqueda avanzada y filtros dinámicos.

---

## 📁 Estructura de Archivos

```
lib/
├── types/
│   └── resources.ts                    # Definiciones TypeScript
└── data/
    └── minsal-resources.ts             # Base de datos de recursos (source of truth)

app/
├── api/
│   └── resources/
│       └── minsal/
│           └── route.ts                # API REST para recursos
└── recursos/
    └── minsal/
        └── page.tsx                    # UI del centro de recursos

public/
└── resources/
    └── cases/
        └── normas-minsal/              # Almacenamiento de PDFs
            ├── VIH-Adolescentes.pdf
            ├── GPC-CaCU.pdf
            └── ... (más PDFs)
```

---

## 🏗️ Arquitectura

### **Capa de Datos** (`lib/data/minsal-resources.ts`)

- **Base de datos en código**: Todos los metadatos de PDFs centralizados
- **Funciones utilitarias**:
  - `getResources(filters)`: Obtener recursos con filtros opcionales
  - `getResourceById(id)`: Buscar por ID único
  - `getResourceStats()`: Estadísticas agregadas
- **Ventajas**:
  - Sin base de datos externa necesaria
  - Deploy inmediato sin migrations
  - Fácil de mantener y actualizar

### **Capa de Tipos** (`lib/types/resources.ts`)

```typescript
interface Resource {
  id: string;              // Identificador único
  title: string;           // Título descriptivo
  description: string;     // Descripción detallada
  fileName: string;        // Nombre del archivo PDF
  fileUrl: string;         // Ruta pública al PDF
  category: ResourceCategory;
  source: ResourceSource;
  year: number;
  tags: string[];          // Etiquetas para búsqueda
  isPremium?: boolean;     // Para futuras restricciones
}
```

**Categorías disponibles**:
- Adolescencia
- Anticoncepción
- ITS/VIH
- Embarazo y Parto
- Puerperio
- Climaterio
- Cáncer Ginecológico
- Salud Reproductiva

### **API REST** (`app/api/resources/minsal/route.ts`)

**Endpoint**: `GET /api/resources/minsal`

**Query Parameters**:
- `?search=texto` - Búsqueda en título, descripción y tags
- `?category=Adolescencia` - Filtro por categoría
- `?source=MINSAL` - Filtro por fuente
- `?stats=true` - Obtener solo estadísticas

**Respuestas**:
```json
// Recursos
{
  "success": true,
  "count": 25,
  "resources": [...]
}

// Estadísticas
{
  "totalResources": 25,
  "byCategory": { "Adolescencia": 3, ... },
  "bySource": { "MINSAL": 20, "OMS": 3, ... },
  "popularTags": ["VIH", "prevención", ...]
}
```

### **Frontend** (`app/recursos/minsal/page.tsx`)

**Características**:
- ✅ Búsqueda en tiempo real
- ✅ Filtros por categoría y fuente
- ✅ Sistema de etiquetas clickeables
- ✅ Estadísticas en tiempo real
- ✅ Diseño responsive
- ✅ Tema rojo consistente
- ✅ Descarga directa de PDFs

**Hooks y Estado**:
```typescript
const [search, setSearch] = useState('');
const [selectedCategory, setSelectedCategory] = useState('Todos');
const [selectedSource, setSelectedSource] = useState('Todos');
const [selectedTags, setSelectedTags] = useState<string[]>([]);
```

---

## 🚀 Cómo Agregar Nuevos PDFs

### **1. Subir el archivo PDF**

```bash
cp nuevo-documento.pdf public/resources/cases/normas-minsal/
```

### **2. Agregar metadatos**

Editar `lib/data/minsal-resources.ts`:

```typescript
{
  id: 'id-unico-kebab-case',
  title: 'Título Descriptivo del Documento',
  description: 'Descripción detallada que explica el contenido...',
  fileName: 'nombre-archivo.pdf',
  fileUrl: '/resources/cases/normas-minsal/nombre-archivo.pdf',
  category: 'Categoría Apropiada',
  source: 'MINSAL',
  year: 2024,
  tags: ['etiqueta1', 'etiqueta2', 'etiqueta3'],
}
```

### **3. Deploy automático**

El sistema detecta el nuevo recurso automáticamente. No se requiere:
- ❌ Migrations de base de datos
- ❌ Restart del servidor
- ❌ Configuración adicional

---

## 🔍 Sistema de Búsqueda

### **Algoritmo de Filtrado**

```typescript
1. Filtro por categoría (si seleccionada)
2. Filtro por fuente (si seleccionada)
3. Búsqueda de texto en:
   - Título (case-insensitive)
   - Descripción
   - Tags
4. Filtro por tags seleccionados (OR lógico)
```

### **Rendimiento**

- 🚀 Búsqueda en memoria (< 1ms)
- 📦 Sin queries a BD
- 💾 Sin overhead de red
- ⚡ Instant search experience

---

## 📊 Estadísticas

El sistema genera automáticamente:

```typescript
{
  totalResources: 25,
  byCategory: {
    'Adolescencia': 3,
    'ITS/VIH': 5,
    ...
  },
  bySource: {
    'MINSAL': 20,
    'OMS': 3,
    ...
  },
  popularTags: ['VIH', 'prevención', 'adolescentes', ...]
}
```

Actualizadas en tiempo real sin recálculo manual.

---

## 🎨 Diseño

### **Tema Rojo Consistente**

- Gradiente de fondo: `from-red-50 to-rose-100`
- Botones primarios: `from-red-600 to-red-700`
- Acentos: `red-100`, `red-600`, `red-700`
- Bordes: `border-red-100`, `border-red-200`

### **Componentes**

- `ResourceCard`: Tarjeta individual con metadatos
- Filtros colapsables en móvil
- Tags interactivos
- Badges de categoría
- Iconos Heroicons

---

## 🔐 Seguridad

### **Actual**
- ✅ PDFs públicamente accesibles (apropiado para normas oficiales)
- ✅ Validación de query params con Zod
- ✅ Rate limiting a nivel de API

### **Futuro (si se requiere)**
- 🔒 Restricción por suscripción (`isPremium: true`)
- 🔑 Autenticación con Clerk
- 📊 Tracking de descargas
- 🎯 Recomendaciones personalizadas

---

## 📈 Escalabilidad

### **Límites Actuales**
- ✅ Hasta ~100 recursos sin problema
- ✅ PDFs hasta 50MB cada uno
- ✅ Vercel: 250MB límite de tamaño total

### **Si Creces Más**
1. **Vercel Blob Storage**: PDFs en CDN separado
2. **Base de datos**: Prisma para metadatos
3. **Full-text search**: Algolia o similar
4. **Analytics**: Tracking de descargas

---

## 🛠️ Mantenimiento

### **Actualizar Recurso Existente**

```typescript
// Encontrar en MINSAL_RESOURCES array
{
  id: 'recurso-existente',
  // ... cambiar campos necesarios
  year: 2025, // ← actualizar
}
```

### **Cambiar Categoría/Tags**

```typescript
// Simplemente editar el objeto
category: 'Nueva Categoría',
tags: ['nuevo-tag', 'otro-tag'],
```

### **Eliminar Recurso**

1. Remover del array `MINSAL_RESOURCES`
2. Opcionalmente eliminar PDF físico
3. Deploy automático

---

## 🧪 Testing

```bash
# Verificar tipos
npm run type-check

# Compilar
npm run build

# Iniciar dev server
npm run dev
```

**URLs de prueba**:
- UI: `http://localhost:3000/recursos/minsal`
- API: `http://localhost:3000/api/resources/minsal`
- Stats: `http://localhost:3000/api/resources/minsal?stats=true`

---

## 📝 Checklist de Calidad

- [x] TypeScript strict mode
- [x] Tipos compartidos entre frontend/backend
- [x] Validación de inputs (Zod)
- [x] Error handling robusto
- [x] UI responsive
- [x] Accesibilidad básica
- [x] SEO-friendly
- [x] Performance optimizado
- [x] Código documentado
- [x] Diseño consistente

---

## 🎯 Próximos Pasos

1. **Analytics**: Tracking de PDFs más descargados
2. **Favoritos**: Sistema de marcadores por usuario
3. **Historial**: PDFs recientemente vistos
4. **Compartir**: Links directos a recursos
5. **Notas**: Usuarios pueden agregar anotaciones
6. **Versiones**: Control de versiones de documentos

---

## 📞 Soporte

Si necesitas agregar recursos o modificar la estructura:

1. Edita `lib/data/minsal-resources.ts`
2. Verifica tipos en `lib/types/resources.ts`
3. Prueba en desarrollo
4. Deploy a producción

**Documentación adicional**: Ver comentarios JSDoc en el código fuente.
