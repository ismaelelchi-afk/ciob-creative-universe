# CIOB — Creative Digital Universe

Página estática (HTML + CSS + JavaScript, sin dependencias ni backend). Lista para Cloudflare Pages: sin paso de build, directorio de salida = raíz del proyecto.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Estilos, animaciones y `prefers-reduced-motion` |
| `projects.js` | **Datos de los proyectos y categorías (único archivo a editar para crecer)** |
| `art.js` | Ilustraciones SVG conceptuales de cada proyecto |
| `app.js` | Motor: idiomas ES / PT-BR, entrada, cámara 2.5D, ficha, exploración |

## Agregar un proyecto

Añade un objeto al final de `window.CIOB_PROJECTS` en `projects.js` (hay un ejemplo comentado):

```js
{
  id: 'mi-proyecto',
  name: 'MI PROYECTO',                 // no se traduce
  category: 'digitalTool',             // clave de CIOB_CATEGORIES
  description: { es: '…', 'pt-BR': '…' },
  url: 'https://…',
  visual: { motif: 'auto', shape: 'blob', colors: [fondo1, fondo2, acento1, acento2, acento3] }
}
```

- `motif`: `store`, `screen`, `target`, `infinity`, `scan` o `auto` (composición abstracta única generada desde el `id`).
- `shape`: `circle`, `squircle`, `arch`, `blob`, `hex`.
- Categoría nueva: añádela a `CIOB_CATEGORIES` con sus textos `es` y `pt-BR`.
- La disposición se recalcula sola. Con 8 proyectos o más aparece **Explorar todo** (búsqueda + filtros por categoría); el umbral es `exploreMin`.

## Parámetros de URL útiles para pruebas

- `?intro=0` salta la introducción.
- `?explore=1` muestra ya el botón de exploración completa.
