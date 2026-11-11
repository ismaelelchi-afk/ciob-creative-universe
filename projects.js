/* ==========================================================================
   CIOB — DATOS DEL UNIVERSO
   --------------------------------------------------------------------------
   Para agregar un proyecto nuevo, añade un objeto al final de CIOB_PROJECTS.
   No hay que tocar index.html, styles.css ni app.js.

   Campos de cada proyecto:
     id           texto único, sin espacios (ej. "mi-proyecto")
     name         nombre oficial (NO se traduce)
     category     clave de CIOB_CATEGORIES (ver abajo). Si usas una clave nueva,
                  añádela a CIOB_CATEGORIES con sus textos ES y PT-BR.
     description  { es: "...", "pt-BR": "..." }
     url          dirección completa del proyecto
     visual       identidad visual del proyecto:
        colors  [fondo1, fondo2, acento1, acento2, acento3]
                (acento1 también tiñe botones y etiquetas de ese proyecto)
        motif   "store" | "screen" | "target" | "infinity" | "scan" | "auto"
                ("auto" genera una composición abstracta única desde el id)
        shape   "circle" | "squircle" | "arch" | "blob" | "hex"
   ========================================================================== */

window.CIOB_CONFIG = {
  // Cuando hay este número de proyectos (o más) aparece el botón
  // "Explorar todo" con búsqueda y filtros por categoría.
  // Para verlo ya mismo: abre la página con ?explore=1
  exploreMin: 8
};

window.CIOB_CATEGORIES = {
  experience3d:      { es: '3D EXPERIENCE',       'pt-BR': '3D EXPERIENCE' },
  interactiveGame:   { es: 'INTERACTIVE GAME',    'pt-BR': 'INTERACTIVE GAME' },
  digitalExperience: { es: 'DIGITAL EXPERIENCE',  'pt-BR': 'DIGITAL EXPERIENCE' },
  digitalTool:       { es: 'DIGITAL TOOL',        'pt-BR': 'DIGITAL TOOL' }
};

window.CIOB_PROJECTS = [
  {
    id: 'ac-store-3d',
    name: 'A/C STORE 3D',
    category: 'experience3d',
    description: {
      es: 'Una tienda digital tridimensional donde puedes explorar un espacio comercial e interactuar con sus ambientes.',
      'pt-BR': 'Uma loja digital tridimensional onde você pode explorar um espaço comercial e interagir com seus ambientes.'
    },
    url: 'https://ac-store-3d.ismaelelchi.workers.dev/',
    visual: {
      motif: 'store',
      shape: 'squircle',
      colors: ['#0a2a8a', '#06133f', '#ffc83d', '#3fa0ff', '#ffffff']
    }
  },
  {
    id: 'ramsons-3d',
    name: 'RAMSONS 3D',
    category: 'experience3d',
    description: {
      es: 'Una experiencia de comercio digital que transforma una tienda de tecnología en un espacio tridimensional explorable.',
      'pt-BR': 'Uma experiência de comércio digital que transforma uma loja de tecnologia em um espaço tridimensional explorável.'
    },
    url: 'https://ramsons-3d.pages.dev/',
    visual: {
      motif: 'screen',
      shape: 'arch',
      colors: ['#12002b', '#3a0070', '#ff3d9a', '#29e0ff', '#ffd23f']
    }
  },
  {
    id: 'surpresa-na-area',
    name: 'SURPRESA NA ÁREA',
    category: 'interactiveGame',
    description: {
      es: 'Un pequeño desafío de reflejos que transforma una sorpresa cotidiana en una experiencia divertida e interactiva.',
      'pt-BR': 'Um pequeno desafio de reflexos que transforma uma surpresa cotidiana em uma experiência divertida e interativa.'
    },
    url: 'https://surpresa-na-area.ismaelelchi.workers.dev/',
    visual: {
      motif: 'target',
      shape: 'blob',
      colors: ['#ffd23f', '#ff9a1f', '#ff3d9a', '#29e0ff', '#ffffff']
    }
  },
  {
    id: 'ramsons-infinite',
    name: 'RAMSONS INFINITE',
    category: 'digitalExperience',
    description: {
      es: 'Un concepto de experiencias digitales que combina tecnología, arte 3D y creatividad.',
      'pt-BR': 'Um conceito de experiências digitais que combina tecnologia, arte 3D e criatividade.'
    },
    url: 'https://ramsons-infinite-ciob.pages.dev/',
    visual: {
      motif: 'infinity',
      shape: 'circle',
      colors: ['#07031a', '#1c0a4d', '#29e0ff', '#8a5cff', '#b6f23a']
    }
  },
  {
    id: 'ramsons-conferencia',
    name: 'RAMSONS CONFERÊNCIA',
    category: 'digitalTool',
    description: {
      es: 'Una herramienta digital para consultar, organizar y gestionar información de productos mediante un sistema de conferencia.',
      'pt-BR': 'Uma ferramenta digital para consultar, organizar e gerenciar informações de produtos por meio de um sistema de conferência.'
    },
    url: 'https://ramsons-conferencia.onrender.com/index.html',
    visual: {
      motif: 'scan',
      shape: 'hex',
      colors: ['#03241f', '#0b5a4a', '#2cf0b0', '#b6f23a', '#ff5a3d']
    }
  }

  /* Ejemplo de un proyecto nuevo (descomenta y edita):
  ,{
    id: 'mi-nuevo-proyecto',
    name: 'MI NUEVO PROYECTO',
    category: 'digitalTool',
    description: { es: 'Descripción en español.', 'pt-BR': 'Descrição em português.' },
    url: 'https://ejemplo.com/',
    visual: { motif: 'auto', shape: 'blob', colors: ['#14082e', '#34106b', '#ff8a1f', '#29e0ff', '#ffd23f'] }
  }
  */
];
