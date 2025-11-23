# 📸 Guía para Agregar Imágenes a Casos Clínicos

## 🎯 Estructura de carpetas

Las imágenes se almacenan en:
```
public/resources/cases/
├── anticoncepcion/
├── its/
├── consejeria/
└── climaterio/
```

## 📝 Cómo agregar imágenes a un caso

### 1️⃣ Preparar la imagen

**Requisitos:**
- Formato: JPG, PNG o WebP (preferir WebP por tamaño)
- Tamaño máximo: 500 KB
- Dimensiones recomendadas: 1200x800px máximo
- Nombre descriptivo en kebab-case: `vph-condilomas-vulva.jpg`

**Herramientas de optimización:**
- [TinyPNG](https://tinypng.com/) - Compresión online
- [Squoosh](https://squoosh.app/) - Convertir a WebP
- ImageMagick: `convert imagen.jpg -quality 85 -resize 1200x imagen-optimized.jpg`

### 2️⃣ Subir la imagen

Coloca la imagen en la carpeta correspondiente:
```bash
public/resources/cases/its/vph-condilomas-vulva.jpg
```

### 3️⃣ Agregar al caso en JSON5

#### Imágenes en la VIGNETA del caso:

```json5
{
  id: "its-vph-condilomas",
  modulo: "ITS",
  titulo: "Condilomas acuminados en APS",
  vigneta: "Mujer de 24 años consulta por lesiones...",
  
  // 👇 Agregar aquí
  imagenes: [
    {
      url: "/resources/cases/its/vph-condilomas-vulva.jpg",
      alt: "Condilomas acuminados en región vulvar",
      caption: "Lesiones papilomatosas características de VPH 6/11",
      order: 1
    }
  ],
  
  pasos: [...]
}
```

#### Imágenes en una PREGUNTA específica:

```json5
{
  id: "p1",
  tipo: "mcq",
  enunciado: "¿Qué características observas en la imagen?",
  
  // 👇 Agregar aquí
  imagenes: [
    {
      url: "/resources/cases/its/vph-condilomas-detalle.jpg",
      alt: "Detalle de condiloma acuminado",
      caption: "Aumento de lesión verrugosa típica",
      order: 1
    }
  ],
  
  opciones: [...]
}
```

### 4️⃣ Múltiples imágenes

Puedes agregar varias imágenes con el campo `order`:

```json5
imagenes: [
  {
    url: "/resources/cases/its/condilomas-antes.jpg",
    alt: "Lesiones antes del tratamiento",
    caption: "Condilomas previo a crioterapia",
    order: 1
  },
  {
    url: "/resources/cases/its/condilomas-despues.jpg",
    alt: "Área tratada post crioterapia",
    caption: "Control a 3 semanas post tratamiento",
    order: 2
  }
]
```

## 🔍 Propiedades de imagen

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `url` | string | ✅ | Ruta relativa desde `/public` |
| `alt` | string | ✅ | Texto alternativo (accesibilidad) |
| `caption` | string | ❌ | Leyenda que aparece bajo la imagen |
| `order` | number | ❌ | Orden de visualización (default: 0) |

## ✅ Buenas prácticas

### ✔️ Hacer:
- ✅ Usar nombres descriptivos: `diu-insercion-pasos.jpg`
- ✅ Incluir siempre `alt` text para accesibilidad
- ✅ Optimizar imágenes antes de subirlas
- ✅ Usar WebP cuando sea posible
- ✅ Agregar `caption` explicativos para contexto educativo

### ❌ Evitar:
- ❌ Imágenes sin desidentificar (rostros, datos personales)
- ❌ Archivos pesados (>500KB)
- ❌ Nombres genéricos: `imagen1.jpg`, `foto.png`
- ❌ Olvidar el `alt` text
- ❌ Usar imágenes con derechos de autor sin permiso

## 📚 Fuentes de imágenes recomendadas

**Libres de derechos:**
- [DermNet NZ](https://dermnetnz.org/) - Creative Commons
- [CDC Public Health Image Library](https://phil.cdc.gov/) - Dominio público
- [Wikimedia Commons Medical](https://commons.wikimedia.org/wiki/Category:Medicine) - CC licenses
- [OpenStax](https://openstax.org/) - CC BY 4.0

**Propias del MINSAL:**
- Guías clínicas con imágenes autorizadas
- Material educativo institucional

## 🎨 Ejemplo completo

```json5
{
  id: "ac-media-implante-insercion",
  modulo: "Anticoncepción",
  dificultad: "Media",
  titulo: "Técnica de inserción de implante subdérmico",
  vigneta: "Mujer de 22 años solicita implante anticonceptivo...",
  
  imagenes: [
    {
      url: "/resources/cases/anticoncepcion/implante-brazo-marcacion.jpg",
      alt: "Marcación anatómica en cara interna del brazo",
      caption: "Punto de inserción: 6-8 cm del epicóndilo medial",
      order: 1
    }
  ],
  
  pasos: [
    {
      id: "p1",
      tipo: "mcq",
      enunciado: "¿Cuál es el sitio de inserción correcto según la imagen?",
      imagenes: [
        {
          url: "/resources/cases/anticoncepcion/implante-anatomia.jpg",
          alt: "Anatomía del brazo para inserción de implante",
          caption: "Esquema anatómico: evitar nervios y vasos",
          order: 1
        }
      ],
      opciones: [...]
    }
  ]
}
```

## 🚀 Visualización en la plataforma

Las imágenes se mostrarán:

1. **En la vigneta**: Panel izquierdo junto al texto del caso
2. **En preguntas**: Justo encima de las opciones de respuesta
3. **Lightbox**: Click en cualquier imagen para verla ampliada
4. **Navegación**: Flechas izq/der si hay múltiples imágenes
5. **Responsivo**: Se adapta a móviles y desktop

## 🛠️ Migración de base de datos

Si ya tienes casos en la DB, las imágenes se almacenarán automáticamente al crear/actualizar casos desde JSON5.

**No requiere migración manual** - El schema ya está actualizado con:
- `CaseImage` (imágenes de vigneta)
- `QuestionImage` (imágenes de preguntas)

---

**¿Preguntas?** Revisa `app/components/ImageViewer.tsx` para el componente de visualización.
