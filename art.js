/* CIOB — representaciones gráficas conceptuales (SVG generado por código).
   Cada "motif" es una ilustración original; "auto" crea una composición
   abstracta única a partir del id del proyecto. */
(() => {
  'use strict';

  const PAL = ['#ff3d9a', '#ff8a1f', '#ffd23f', '#b6f23a', '#29e0ff', '#8a5cff'];
  const INK = '#1b1030';

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const P = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const f1 = n => Math.round(n * 10) / 10;

  function visual(p) {
    const v = p.visual || {};
    const seed = v.seed || hash(String(p.id || p.name));
    const colors = Array.isArray(v.colors) ? v.colors.slice(0, 5) : [];
    if (colors.length < 5) {
      const r = rng(seed);
      const base = ['#16082f', '#34106b'];
      while (colors.length < 5) {
        colors.push(colors.length < 2 ? base[colors.length] : PAL[Math.floor(r() * PAL.length)]);
      }
    }
    return { colors, motif: v.motif || 'auto', shape: v.shape || 'circle', seed };
  }

  /* cubo isométrico: (cx,cy) = vértice superior; s = arista */
  function cube(cx, cy, s, top, left, right) {
    const w = s * 0.866, h = s * 0.5;
    return `<polygon points="${P([[cx, cy], [cx + w, cy + h], [cx, cy + 2 * h], [cx - w, cy + h]])}" fill="${top}"/>` +
      `<polygon points="${P([[cx - w, cy + h], [cx, cy + 2 * h], [cx, cy + 2 * h + s], [cx - w, cy + h + s]])}" fill="${left}"/>` +
      `<polygon points="${P([[cx + w, cy + h], [cx, cy + 2 * h], [cx, cy + 2 * h + s], [cx + w, cy + h + s]])}" fill="${right}"/>`;
  }
  const TONES = {
    blue: ['#4aa8ff', '#1558d6', '#0c3a9e'],
    gold: ['#ffd86b', '#f2aa14', '#b87a00'],
    white: ['#ffffff', '#cfe2ff', '#98b8ee'],
    navy: ['#2a63d8', '#0f338f', '#08205c'],
    cyan: ['#8af3ff', '#29b8d6', '#1a8aa6'],
    pink: ['#ff8fc7', '#d62e7e', '#9c1b5a'],
    mint: ['#9ff7d8', '#27c79a', '#168a6a']
  };
  const cb = (x, y, s, k) => cube(x, y, s, TONES[k][0], TONES[k][1], TONES[k][2]);
  const spark = (x, y, s, col, delay) =>
    `<path class="a-pop" style="animation-delay:${delay}s" transform="translate(${x} ${y}) scale(${s})" d="M0-8 2-2 8 0 2 2 0 8-2 2-8 0-2-2z" fill="${col}"/>`;
  const star = (cx, cy, ro, ri, n, rot) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro, a = Math.PI * i / n + (rot || 0);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return P(pts);
  };

  const MOTIFS = {
    /* 01 — tienda isométrica con taza flotante */
    store(c) {
      return `<circle cx="100" cy="112" r="84" fill="${c[3]}" opacity=".16"/>` +
        `<ellipse cx="100" cy="182" rx="72" ry="9" fill="#000" opacity=".28"/>` +
        cb(77.5, 109, 26, 'blue') + cb(122.5, 109, 26, 'white') + cb(100, 122, 26, 'navy') +
        cb(100, 70, 26, 'gold') + cb(77.5, 83, 26, 'white') + cb(100, 96, 26, 'blue') +
        `<g class="a-float"><path d="M134 40h30l-3 25a6 6 0 0 1-6 5h-12a6 6 0 0 1-6-5z" fill="${c[2]}"/>` +
        `<path d="M164 44h4a6 6 0 0 1 0 14h-6" fill="none" stroke="${c[2]}" stroke-width="3.5" stroke-linecap="round"/>` +
        `<rect x="133" y="50" width="32" height="5" fill="#fff" opacity=".85"/>` +
        `<path class="a-steam" d="M143 33c-4-5 4-8 0-13" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path class="a-steam" style="animation-delay:-1.1s" d="M153 33c-4-5 4-8 0-13" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>` +
        spark(36, 40, 1, c[2], 0) + spark(168, 128, .7, '#fff', -1.2) + spark(26, 130, .6, c[2], -.6);
    },

    /* 02 — pantalla en perspectiva sobre rejilla */
    screen(c, u) {
      let floor = '';
      for (let i = 0; i < 7; i++) {
        const y = f1(118 + i * i * 2.1);
        floor += `<line x1="0" x2="200" y1="${y}" y2="${y}" stroke="${c[3]}" stroke-opacity=".45"/>`;
      }
      for (let x = -120; x <= 320; x += 40) {
        floor += `<line x1="100" y1="112" x2="${x}" y2="200" stroke="${c[3]}" stroke-opacity=".35"/>`;
      }
      return floor +
        `<clipPath id="${u}-sc"><rect x="46" y="40" width="108" height="64" rx="4"/></clipPath>` +
        `<linearGradient id="${u}-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>` +
        `<rect x="38" y="32" width="124" height="80" rx="10" fill="#080014" stroke="#fff" stroke-width="3"/>` +
        `<g clip-path="url(#${u}-sc)"><rect x="46" y="40" width="108" height="64" fill="url(#${u}-sg)"/>` +
        `<circle cx="100" cy="88" r="24" fill="${c[4]}"/>` +
        `<rect x="70" y="86" width="60" height="2.5" fill="${c[1]}"/><rect x="70" y="92" width="60" height="3.5" fill="${c[1]}"/><rect x="70" y="99" width="60" height="5" fill="${c[1]}"/>` +
        `<polygon points="46,40 90,40 62,104 46,104" fill="#fff" opacity=".12"/></g>` +
        `<polygon points="88,112 112,112 120,124 80,124" fill="#fff" opacity=".9"/>` +
        `<g class="a-float">${cb(22, 20, 12, 'cyan')}</g>` +
        `<g class="a-float" style="animation-delay:-2s">${cb(160, 128, 16, 'pink')}</g>` +
        spark(176, 34, .8, c[4], 0) + spark(30, 138, .6, '#fff', -1);
    },

    /* 03 — diana de reflejos con estallido */
    target(c) {
      const conf = [[30, 46, c[3], 10], [168, 40, '#fff', 12], [26, 150, '#fff', 8], [170, 150, c[3], 10], [150, 20, INK, 7], [48, 176, INK, 7]]
        .map((q, i) => `<rect class="a-float" style="animation-delay:${-i * .8}s" x="${q[0]}" y="${q[1]}" width="${q[3]}" height="${f1(q[3] * .5)}" rx="2" fill="${q[2]}" transform="rotate(${i * 33} ${q[0]} ${q[1]})"/>`).join('');
      return `<polygon class="a-spin" points="${star(100, 100, 92, 66, 14, 0)}" fill="${c[2]}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
        `<circle cx="100" cy="100" r="50" fill="${INK}"/><circle cx="100" cy="100" r="42" fill="#fff"/>` +
        `<circle cx="100" cy="100" r="31" fill="${c[3]}"/><circle cx="100" cy="100" r="20" fill="#fff"/>` +
        `<circle class="a-pop" cx="100" cy="100" r="10" fill="${c[2]}" stroke="${INK}" stroke-width="3"/>` +
        `<path d="M100 28v18M100 154v18M28 100h18M154 100h18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` +
        conf;
    },

    /* 04 — lemniscata luminosa con órbitas */
    infinity(c, u, seed) {
      const d = 'M100 100C125 60 175 60 175 100C175 140 125 140 100 100C75 60 25 60 25 100C25 140 75 140 100 100Z';
      const r = rng(seed);
      let stars = '';
      for (let i = 0; i < 22; i++) {
        stars += `<circle cx="${f1(r() * 200)}" cy="${f1(r() * 200)}" r="${f1(.6 + r() * 1.4)}" fill="#fff" opacity="${f1(.25 + r() * .6)}"/>`;
      }
      return stars +
        `<linearGradient id="${u}-ig" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c[2]}"/><stop offset=".5" stop-color="${c[3]}"/><stop offset="1" stop-color="${c[4]}"/></linearGradient>` +
        `<ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="#fff" stroke-opacity=".14" transform="rotate(-24 100 100)"/>` +
        `<ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="#fff" stroke-opacity=".14" transform="rotate(24 100 100)"/>` +
        `<path d="${d}" fill="none" stroke="url(#${u}-ig)" stroke-width="22" stroke-linejoin="round" opacity=".22"/>` +
        `<path d="${d}" fill="none" stroke="url(#${u}-ig)" stroke-width="9" stroke-linejoin="round"/>` +
        `<path class="a-dash" d="${d}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="14 70"/>` +
        [[c[2], 0], [c[4], 2.4], ['#fff', 4.8]].map(q =>
          `<circle r="5.5" fill="${q[0]}"><animateMotion dur="7.2s" begin="-${q[1]}s" repeatCount="indefinite" path="${d}"/></circle>`).join('');
    },

    /* 05 — código de barras, láser y verificación */
    scan(c) {
      const r = rng(11);
      let bars = '', x = 61;
      while (x < 138) {
        const w = 1 + Math.floor(r() * 4);
        bars += `<rect x="${x}" y="54" width="${w}" height="58" fill="#10261f"/>`;
        x += w + 1 + Math.floor(r() * 3);
      }
      return `<g class="a-float" style="animation-duration:7s">` +
        `<g transform="rotate(-8 100 100)">` +
        `<rect x="48" y="34" width="104" height="130" rx="10" fill="#fff"/>` +
        `<rect x="48" y="34" width="104" height="14" rx="10" fill="${c[2]}"/><rect x="48" y="42" width="104" height="6" fill="${c[2]}"/>` +
        bars +
        `<rect x="60" y="122" width="64" height="5" rx="2.5" fill="#cfe9e0"/><rect x="60" y="133" width="42" height="5" rx="2.5" fill="#cfe9e0"/><rect x="60" y="144" width="52" height="5" rx="2.5" fill="#cfe9e0"/>` +
        `<g class="a-scan"><rect x="44" y="50" width="112" height="10" fill="${c[4]}" opacity=".28"/><rect x="44" y="53.5" width="112" height="3" fill="${c[4]}"/></g>` +
        `</g></g>` +
        `<g class="a-pop"><circle cx="152" cy="152" r="23" fill="${c[3]}" stroke="#0b2a22" stroke-width="4"/>` +
        `<path d="M141 152l8 8 15-16" fill="none" stroke="#0b2a22" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g>` +
        `<g class="a-float" style="animation-delay:-1.5s">${cb(30, 142, 13, 'mint')}</g>` +
        spark(166, 34, .8, c[3], 0) + spark(28, 46, .7, '#fff', -.9);
    },

    /* automático — composición abstracta única por proyecto */
    auto(c, u, seed) {
      const r = rng(seed);
      const col = () => c[2 + Math.floor(r() * 3)];
      let out = `<circle cx="${f1(70 + r() * 60)}" cy="${f1(70 + r() * 60)}" r="${f1(46 + r() * 30)}" fill="${c[2]}" opacity=".92"/>`;
      for (let i = 0; i < 8; i++) {
        const x = f1(20 + r() * 160), y = f1(20 + r() * 160), s = f1(14 + r() * 34), k = Math.floor(r() * 4), rot = Math.floor(r() * 90);
        const dl = `style="animation-delay:${f1(-r() * 6)}s"`;
        if (k === 0) out += `<circle class="a-float" ${dl} cx="${x}" cy="${y}" r="${f1(s / 2)}" fill="none" stroke="${col()}" stroke-width="5"/>`;
        else if (k === 1) out += `<rect class="a-float" ${dl} x="${x}" y="${y}" width="${s}" height="${s}" rx="4" fill="${col()}" transform="rotate(${rot} ${x} ${y})"/>`;
        else if (k === 2) out += `<polygon class="a-float" ${dl} points="${P([[x, y - s / 2], [x + s / 2, y + s / 2], [x - s / 2, y + s / 2]])}" fill="none" stroke="${col()}" stroke-width="5" stroke-linejoin="round"/>`;
        else out += `<path class="a-float" ${dl} d="M${x - s / 2} ${y}h${s}M${x} ${y - s / 2}v${s}" stroke="${col()}" stroke-width="6" stroke-linecap="round"/>`;
      }
      return out + spark(f1(30 + r() * 140), f1(30 + r() * 140), .9, '#fff', 0);
    }
  };

  function render(p, uid) {
    const v = visual(p);
    const fn = MOTIFS[v.motif] || MOTIFS.auto;
    return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
      `<defs><linearGradient id="${uid}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${v.colors[0]}"/><stop offset="1" stop-color="${v.colors[1]}"/></linearGradient></defs>` +
      `<rect width="200" height="200" fill="url(#${uid}-bg)"/>` +
      fn(v.colors, uid, v.seed) + `</svg>`;
  }

  window.CIOBArt = { render, visual, hash, rng, PAL, MOTIFS };
})();
