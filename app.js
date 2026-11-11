/* CIOB — motor del universo: idiomas, entrada, cámara 2.5D, portales, ficha y exploración */
(() => {
  'use strict';

  const CFG = Object.assign({ exploreMin: 8 }, window.CIOB_CONFIG);
  const CATS = window.CIOB_CATEGORIES || {};
  const PROJECTS = (window.CIOB_PROJECTS || []).filter(p => p && p.name && p.url);
  const Art = window.CIOBArt;
  const LANGS = ['es', 'pt-BR'];

  /* ---------------------------------------------------------------- textos */
  const UI = {
    es: {
      skip: 'Omitir introducción ›', enter: 'Entrar al universo',
      slogan: '{n} mundos. Un universo.',
      hint: 'Arrastra, usa las flechas o toca un portal',
      open: 'Visitar proyecto', close: 'Cerrar',
      prev: 'Proyecto anterior', next: 'Proyecto siguiente',
      explore: 'Explorar todo', exploreTitle: 'Explorar el universo',
      search: 'Buscar proyectos…', searchLabel: 'Buscar proyectos', filterLabel: 'Filtrar por categoría',
      all: 'Todos', count: '{n} proyectos', countOne: '1 proyecto',
      none: 'Ningún proyecto coincide con tu búsqueda.',
      center: 'Centrar el universo', lang: 'Idioma', navLabel: 'Proyectos del universo',
      goTo: 'Ir a {name}', newTab: '(se abre en una pestaña nueva)', of: '{i} de {n}'
    },
    'pt-BR': {
      skip: 'Pular introdução ›', enter: 'Entrar no universo',
      slogan: '{n} mundos. Um universo.',
      hint: 'Arraste, use as setas ou toque num portal',
      open: 'Visitar projeto', close: 'Fechar',
      prev: 'Projeto anterior', next: 'Próximo projeto',
      explore: 'Explorar tudo', exploreTitle: 'Explorar o universo',
      search: 'Buscar projetos…', searchLabel: 'Buscar projetos', filterLabel: 'Filtrar por categoria',
      all: 'Todos', count: '{n} projetos', countOne: '1 projeto',
      none: 'Nenhum projeto corresponde à sua busca.',
      center: 'Centralizar o universo', lang: 'Idioma', navLabel: 'Projetos do universo',
      goTo: 'Ir para {name}', newTab: '(abre em uma nova aba)', of: '{i} de {n}'
    }
  };

  /* --------------------------------------------------------------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const qs = new URLSearchParams(location.search);
  const body = document.body;

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mqReduce.matches;
  const mqWide = window.matchMedia('(min-width: 820px)');

  /* ---------------------------------------------------------------- idioma */
  let lang = 'es';
  try { const s = localStorage.getItem('ciob.lang'); if (LANGS.includes(s)) lang = s; } catch (e) { /* sin almacenamiento */ }

  function t(key, vars) {
    let s = (UI[lang] && UI[lang][key]) || UI.es[key] || key;
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }
  function loc(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.es || Object.values(v)[0] || '';
  }
  const catLabel = key => (CATS[key] ? loc(CATS[key]) : String(key));

  function applyStatic() {
    const vars = { n: PROJECTS.length };
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, vars); });
    $$('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim(), vars));
      });
    });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  function setLang(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem('ciob.lang', l); } catch (e) { /* ignorar */ }
    applyStatic();
    refreshDynamic();
  }

  /* ------------------------------------------------------------- referencias */
  const universe = $('#universe');
  const worldEl = $('#world');
  const backEl = $('#layers-back');
  const frontEl = $('#layers-front');
  const panel = $('#panel');
  const panelTitle = $('#panel-title');
  const dock = $('#dock');
  const hint = $('#hint');
  const intro = $('#intro');
  const explore = $('#explore');

  let portalEls = [];
  let dockEls = [];
  let layers = [];
  let pos = [];
  let camBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  let home = { x: 0, y: 0 };
  let vw = innerWidth, vh = innerHeight, S = 150;
  let sel = -1;
  let exploreOpen = false;
  let introActive = true;
  let restoreFocus = null;

  const showExplore = PROJECTS.length >= CFG.exploreMin || qs.has('explore');

  /* ----------------------------------------------------------------- portales */
  function buildPortals() {
    worldEl.textContent = '';
    portalEls = PROJECTS.map((p, i) => {
      const v = Art.visual(p);
      const li = document.createElement('li');
      li.className = 'portal shape-' + v.shape;
      li.style.setProperty('--i', i);
      li.style.setProperty('--c1', v.colors[2]);
      li.style.setProperty('--c2', v.colors[3]);
      li.style.setProperty('--c3', v.colors[4]);
      const h = Art.hash(String(p.id || p.name));
      li.style.setProperty('--fd', (6 + (h % 40) / 10).toFixed(1) + 's');
      li.style.setProperty('--fl', (-(h % 70) / 10).toFixed(1) + 's');
      li.style.setProperty('--rot', ((h % 5) - 2 || 1.6) + 'deg');
      li.innerHTML =
        '<button type="button" class="portal-btn" data-index="' + i + '">' +
        '<span class="portal-float"><span class="portal-ring"></span>' +
        '<span class="portal-art">' + Art.render(p, 'p' + i) + '</span>' +
        '<span class="portal-num" aria-hidden="true">' + pad(i + 1) + '</span></span>' +
        '<span class="portal-label"><b class="pl-name"></b><i class="pl-cat"></i></span></button>';
      $('.pl-name', li).textContent = p.name;
      worldEl.appendChild(li);
      return li;
    });
    layers = [{ el: worldEl, d: 1 }];
  }

  function buildDock() {
    dock.textContent = '';
    dockEls = [];
    if (PROJECTS.length <= CFG.exploreMin) {
      PROJECTS.forEach((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dock-btn';
        b.dataset.index = i;
        b.style.setProperty('--c1', Art.visual(p).colors[2]);
        b.textContent = pad(i + 1);
        dock.appendChild(b);
        dockEls.push(b);
      });
    }
    if (showExplore) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dock-btn dock-explore';
      b.id = 'open-explore';
      b.textContent = t('explore');
      dock.appendChild(b);
    }
  }

  function refreshDynamic() {
    PROJECTS.forEach((p, i) => {
      const cat = catLabel(p.category);
      const li = portalEls[i];
      $('.pl-cat', li).textContent = cat;
      $('.portal-btn', li).setAttribute('aria-label', pad(i + 1) + '. ' + p.name + ' — ' + cat);
      if (dockEls[i]) dockEls[i].setAttribute('aria-label', t('goTo', { name: p.name }));
    });
    const ex = $('#open-explore');
    if (ex) ex.textContent = t('explore');
    if (sel >= 0) fillPanel(sel);
    if (exploreOpen) renderExplore();
  }

  /* ------------------------------------------------------------------ layout */
  function computeLayout() {
    vw = innerWidth; vh = innerHeight;
    S = clamp(Math.min(vw, vh) * 0.26, 104, 190);
    document.documentElement.style.setProperty('--s', S + 'px');
    const aspect = vw / vh;
    const n = PROJECTS.length;
    const padT = 76, padB = 130, padX = 36;
    const availW = vw - 2 * padX, availH = vh - padT - padB;
    const cellH = S + 100; /* alto de un portal con su etiqueta */
    if (n <= 1) {
      pos = PROJECTS.map(() => ({ x: 0, y: 0 }));
    } else if (aspect < 0.8) {
      /* vertical (móvil): zigzag descendente */
      const a = Math.max(S * 0.35, availW / 2 - S * 0.85);
      const gap = clamp((availH - cellH) / (n - 1), cellH * 0.62, cellH * 0.95);
      pos = PROJECTS.map((p, i) => ({ x: (i % 2 ? 1 : -1) * a * (n === 2 ? 0.5 : 1), y: (i - (n - 1) / 2) * gap }));
    } else if (n <= 7) {
      /* horizontal: primer proyecto al centro, el resto en anillo elíptico */
      const rx = Math.max(S * 0.9, availW / 2 - S * 0.85);
      const ry = Math.max(S * 0.9, availH / 2 - cellH / 2);
      pos = PROJECTS.map((p, i) => {
        if (i === 0) return { x: 0, y: 0 };
        const m = n - 1, ang = (-135 + (i - 1) * 360 / m) * Math.PI / 180;
        return { x: Math.cos(ang) * rx * (m === 1 ? 0.5 : 1), y: Math.sin(ang) * ry * (m === 1 ? 0.5 : 1) };
      });
    } else {
      /* muchos proyectos: espiral que crece sin límite */
      const sx = clamp(aspect * 0.85, 1, 1.7);
      const sy = clamp(0.8 / aspect, 1, 1.7);
      const c = S * 1.75;
      pos = PROJECTS.map((p, i) => {
        if (i === 0) return { x: 0, y: 0 };
        const r = c * Math.sqrt(i), a = i * 2.39996 + 0.6;
        return { x: Math.cos(a) * r * sx, y: Math.sin(a) * r * sy * 0.92 };
      });
    }
    pos.forEach((q, i) => {
      portalEls[i].style.setProperty('--x', q.x.toFixed(1) + 'px');
      portalEls[i].style.setProperty('--y', q.y.toFixed(1) + 'px');
    });
    const xs = pos.map(q => q.x), ys = pos.map(q => q.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    home = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 + 30 - (padT + (vh - padT - padB) / 2 - vh / 2) };
    const m = Math.max(vw * 0.35, S);
    camBounds = { minX: minX - m, maxX: maxX + m, minY: minY - m, maxY: maxY + m };
    buildBackdrop();
  }

  const clampCam = (x, y) => ({
    x: clamp(x, camBounds.minX, camBounds.maxX),
    y: clamp(y, camBounds.minY, camBounds.maxY)
  });

  /* ------------------------------------------------------ fondo multicapa 2.5D */
  function shapeSVG(type, col) {
    const a = 'viewBox="0 0 40 40"';
    switch (type) {
      case 'ring': return `<svg ${a}><circle cx="20" cy="20" r="15" fill="none" stroke="${col}" stroke-width="5"/></svg>`;
      case 'dot': return `<svg ${a}><circle cx="20" cy="20" r="16" fill="${col}"/></svg>`;
      case 'tri': return `<svg ${a}><polygon points="20,5 36,34 4,34" fill="none" stroke="${col}" stroke-width="5" stroke-linejoin="round"/></svg>`;
      case 'trif': return `<svg ${a}><polygon points="20,4 37,35 3,35" fill="${col}" stroke="${col}" stroke-width="2" stroke-linejoin="round"/></svg>`;
      case 'plus': return `<svg ${a}><path d="M20 5v30M5 20h30" stroke="${col}" stroke-width="6" stroke-linecap="round"/></svg>`;
      case 'wave': return `<svg ${a}><path d="M3 24c6-14 11-14 17 0s11 14 17 0" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/></svg>`;
      case 'half': return `<svg ${a}><path d="M4 28a16 16 0 0 1 32 0z" fill="${col}"/></svg>`;
      case 'sq': return `<svg ${a}><rect x="7" y="7" width="26" height="26" rx="4" fill="none" stroke="${col}" stroke-width="5"/></svg>`;
      default: {
        let d = '';
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) d += `<circle cx="${8 + c * 12}" cy="${8 + r * 12}" r="2.6" fill="${col}"/>`;
        return `<svg ${a}>${d}</svg>`;
      }
    }
  }
  const SHAPE_TYPES = ['ring', 'dot', 'tri', 'trif', 'plus', 'wave', 'half', 'sq', 'grid'];

  function buildBackdrop() {
    backEl.textContent = '';
    frontEl.textContent = '';
    layers = [{ el: worldEl, d: 1 }];
    const rand = Art.rng(20260);
    const pal = Art.PAL;
    const defs = [
      { host: backEl, d: 0.12, kind: 'blob', n: 6 },
      { host: backEl, d: 0.38, kind: 'shape', per: 60000, lo: 14, hi: 44, size: [14, 34], op: 0.6 },
      { host: backEl, d: 0.7, kind: 'shape', per: 95000, lo: 10, hi: 30, size: [26, 62], op: 0.85 },
      { host: frontEl, d: 1.45, kind: 'shape', per: 400000, lo: 3, hi: 8, size: [70, 150], op: 0.16 }
    ];
    defs.forEach(def => {
      const layer = document.createElement('div');
      layer.className = 'layer';
      const x0 = camBounds.minX * def.d - vw / 2 - 60, x1 = camBounds.maxX * def.d + vw / 2 + 60;
      const y0 = camBounds.minY * def.d - vh / 2 - 60, y1 = camBounds.maxY * def.d + vh / 2 + 60;
      const n = def.kind === 'blob' ? def.n : clamp(Math.round(((x1 - x0) * (y1 - y0)) / def.per), def.lo, def.hi);
      for (let i = 0; i < n; i++) {
        const el = document.createElement('span');
        const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0);
        const col = pal[Math.floor(rand() * pal.length)];
        if (def.kind === 'blob') {
          const sz = 360 + rand() * 360;
          el.className = 'bg-blob';
          el.style.cssText = `left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px;background:radial-gradient(closest-side,${col}40,transparent)`;
        } else {
          const sz = def.size[0] + rand() * (def.size[1] - def.size[0]);
          el.className = 'bg-shape';
          el.innerHTML = shapeSVG(SHAPE_TYPES[Math.floor(rand() * SHAPE_TYPES.length)], col);
          el.style.cssText = `left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px;opacity:${def.op};` +
            `--r0:${Math.floor(rand() * 360)}deg;--r1:${Math.floor(rand() * 360)}deg;--dx:${Math.floor(rand() * 24 - 12)}px;--dy:${Math.floor(rand() * 30 - 15)}px;` +
            `--dd:${(9 + rand() * 9).toFixed(1)}s;--dl:${(-rand() * 12).toFixed(1)}s`;
        }
        layer.appendChild(el);
      }
      def.host.appendChild(layer);
      layers.push({ el: layer, d: def.d });
    });
    applyTransforms();
  }

  /* ------------------------------------------------------------------- cámara */
  const cam = { x: 0, y: 0, tx: 0, ty: 0 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let raf = 0;

  function applyTransforms() {
    for (const L of layers) {
      L.el.style.transform = `translate3d(${(-cam.x * L.d + mouse.x * L.d * 18).toFixed(2)}px,${(-cam.y * L.d + mouse.y * L.d * 18).toFixed(2)}px,0)`;
    }
  }
  function frame() {
    raf = 0;
    const k = reduce ? 1 : 0.16;
    cam.x += (cam.tx - cam.x) * k;
    cam.y += (cam.ty - cam.y) * k;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    if (Math.abs(cam.tx - cam.x) < 0.2) cam.x = cam.tx;
    if (Math.abs(cam.ty - cam.y) < 0.2) cam.y = cam.ty;
    if (Math.abs(mouse.tx - mouse.x) < 0.003) mouse.x = mouse.tx;
    if (Math.abs(mouse.ty - mouse.y) < 0.003) mouse.y = mouse.ty;
    applyTransforms();
    if (cam.x !== cam.tx || cam.y !== cam.ty || mouse.x !== mouse.tx || mouse.y !== mouse.ty) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  function moveCam(x, y, instant) {
    cam.tx = x; cam.ty = y;
    if (instant) { cam.x = x; cam.y = y; applyTransforms(); } else kick();
  }

  /* centra la cámara en un portal (con hueco para la ficha si está abierta) */
  function focusCam(i, withPanel) {
    const p = pos[i];
    if (!p) return;
    let dx = vw / 2, dy = vh / 2;
    if (withPanel) {
      if (mqWide.matches) {
        const pw = Math.min(440, vw * 0.38) + 24;
        dx = (vw - pw) / 2;
      } else {
        const ph = panel.offsetHeight + 10;
        dy = (64 + vh - ph) / 2;
      }
    }
    moveCam(p.x + vw / 2 - dx, p.y + vh / 2 - dy);
  }

  /* ---------------------------------------------------------- arrastre y teclado */
  let drag = null, suppress = false, hintDone = false;

  function hideHint() {
    if (hintDone) return;
    hintDone = true;
    hint.classList.add('off');
  }

  universe.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: cam.tx, cy: cam.ty, moved: false, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0 };
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && !drag && !reduce && introDone) {
      mouse.tx = (e.clientX / vw - 0.5) * 2;
      mouse.ty = (e.clientY / vh - 0.5) * 2;
      kick();
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 7) return;
      drag.moved = true;
      try { universe.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
      universe.classList.add('dragging');
      hideHint();
    }
    const now = performance.now(), dt = Math.max(1, now - drag.lt);
    drag.vx = (drag.lx - e.clientX) / dt * 16;
    drag.vy = (drag.ly - e.clientY) / dt * 16;
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
    const c = clampCam(drag.cx - dx, drag.cy - dy);
    moveCam(c.x, c.y, true);
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    universe.classList.remove('dragging');
    if (!d.moved) return;
    suppress = true;
    setTimeout(() => { suppress = false; }, 60);
    if (!reduce && performance.now() - d.lt < 90) {
      const c = clampCam(cam.tx + d.vx * 14, cam.ty + d.vy * 14);
      moveCam(c.x, c.y);
    }
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  universe.addEventListener('wheel', e => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : 1;
    const c = clampCam(cam.tx + e.deltaX * k, cam.ty + e.deltaY * k);
    moveCam(c.x, c.y);
    hideHint();
  }, { passive: false });

  function panBy(dx, dy) {
    const c = clampCam(cam.tx + dx, cam.ty + dy);
    moveCam(c.x, c.y);
    hideHint();
  }

  /* ----------------------------------------------------------- selección / ficha */
  function fillPanel(i) {
    const p = PROJECTS[i];
    const v = Art.visual(p);
    panel.style.setProperty('--c1', v.colors[2]);
    panel.style.setProperty('--c2', v.colors[3]);
    $('#panel-art').innerHTML = Art.render(p, 'pn');
    $('#panel-num').textContent = pad(i + 1);
    $('#panel-cat').textContent = catLabel(p.category);
    panelTitle.textContent = p.name;
    $('#panel-desc').textContent = loc(p.description);
    const a = $('#panel-open');
    a.href = p.url;
    a.setAttribute('aria-label', t('open') + ': ' + p.name + ' ' + t('newTab'));
    let host = p.url;
    try { host = new URL(p.url).host; } catch (e) { /* url relativa */ }
    $('#panel-url').textContent = host;
    $('#panel-of').textContent = t('of', { i: i + 1, n: PROJECTS.length });
    const multi = PROJECTS.length > 1;
    $('#prev').hidden = !multi; $('#next').hidden = !multi; $('#panel-of').hidden = !multi;
  }

  function select(i, opts) {
    if (i < 0 || i >= PROJECTS.length) return;
    const o = opts || {};
    if (sel < 0 && !restoreFocus) restoreFocus = document.activeElement;
    sel = i;
    portalEls.forEach((el, k) => el.classList.toggle('is-sel', k === i));
    dockEls.forEach((el, k) => el.setAttribute('aria-current', k === i ? 'true' : 'false'));
    universe.classList.add('has-sel');
    body.classList.add('has-panel');
    fillPanel(i);
    panel.classList.add('open');
    hideHint();
    requestAnimationFrame(() => focusCam(i, true));
    if (o.focus !== false) setTimeout(() => panelTitle.focus({ preventScroll: true }), 60);
  }

  function closePanel() {
    if (sel < 0) return;
    sel = -1;
    portalEls.forEach(el => el.classList.remove('is-sel'));
    universe.classList.remove('has-sel');
    body.classList.remove('has-panel');
    panel.classList.remove('open');
    const f = restoreFocus;
    restoreFocus = null;
    if (f && f.focus && document.contains(f) && panel.contains(document.activeElement)) f.focus({ preventScroll: true });
  }

  worldEl.addEventListener('click', e => {
    if (suppress) return;
    const b = e.target.closest('.portal-btn');
    if (b) select(+b.dataset.index);
  });
  worldEl.addEventListener('focusin', e => {
    const b = e.target.closest && e.target.closest('.portal-btn');
    if (b && sel < 0 && b.matches(':focus-visible')) focusCam(+b.dataset.index, false);
  });
  universe.addEventListener('click', e => {
    if (suppress) return;
    if (sel >= 0 && !e.target.closest('.portal')) closePanel();
  });
  dock.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'open-explore') openExplore();
    else if (b.dataset.index != null) select(+b.dataset.index);
  });
  $('#panel-close').addEventListener('click', closePanel);
  $('#prev').addEventListener('click', () => select((sel - 1 + PROJECTS.length) % PROJECTS.length, { focus: false }));
  $('#next').addEventListener('click', () => select((sel + 1) % PROJECTS.length, { focus: false }));
  $('#brand').addEventListener('click', () => {
    closePanel();
    moveCam(home.x, home.y);
  });

  /* ----------------------------------------------------------------- exploración */
  const exFilter = { q: '', cat: 'all' };

  function renderExplore() {
    const cats = [];
    PROJECTS.forEach(p => { if (!cats.includes(p.category)) cats.push(p.category); });
    const chips = $('#chips');
    chips.textContent = '';
    ['all'].concat(cats).forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.cat = c;
      b.textContent = c === 'all' ? t('all') : catLabel(c);
      b.setAttribute('aria-pressed', String(exFilter.cat === c));
      chips.appendChild(b);
    });
    const q = norm(exFilter.q.trim());
    const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => {
      if (exFilter.cat !== 'all' && p.category !== exFilter.cat) return false;
      if (!q) return true;
      const hay = norm([p.name, catLabel(p.category), loc(p.description), p.id || ''].join(' '));
      return q.split(/\s+/).every(w => hay.includes(w));
    });
    $('#explore-count').textContent = list.length === 1 ? t('countOne') : t('count', { n: list.length });
    const grid = $('#explore-grid');
    grid.textContent = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'explore-none';
      li.textContent = t('none');
      grid.appendChild(li);
      return;
    }
    list.forEach(({ p, i }) => {
      const v = Art.visual(p);
      const li = document.createElement('li');
      li.innerHTML = '<button type="button" class="xcard" data-index="' + i + '"><span class="xcard-art">' + Art.render(p, 'ex' + i) +
        '</span><b class="xcard-name"></b><i class="xcard-cat"></i></button>';
      const btn = $('.xcard', li);
      btn.style.setProperty('--c1', v.colors[2]);
      $('.xcard-name', li).textContent = p.name;
      $('.xcard-cat', li).textContent = catLabel(p.category);
      btn.setAttribute('aria-label', pad(i + 1) + '. ' + p.name + ' — ' + catLabel(p.category));
      grid.appendChild(li);
    });
    if (reduce) pauseArt();
  }

  function openExplore() {
    exploreOpen = true;
    restoreFocus = document.activeElement;
    renderExplore();
    explore.classList.add('open');
    universe.inert = true;
    setTimeout(() => $('#q').focus({ preventScroll: true }), 80);
  }
  function closeExplore(keepFocus) {
    if (!exploreOpen) return;
    exploreOpen = false;
    explore.classList.remove('open');
    universe.inert = false;
    const f = restoreFocus;
    if (!keepFocus) restoreFocus = null;
    if (!keepFocus && f && f.focus && document.contains(f)) f.focus({ preventScroll: true });
  }

  $('#explore-close').addEventListener('click', () => closeExplore());
  $('#q').addEventListener('input', e => { exFilter.q = e.target.value; renderExplore(); });
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    exFilter.cat = b.dataset.cat;
    renderExplore();
  });
  $('#explore-grid').addEventListener('click', e => {
    const b = e.target.closest('.xcard');
    if (!b) return;
    closeExplore(true);
    restoreFocus = null;
    select(+b.dataset.index);
  });

  /* -------------------------------------------------------------------- teclado */
  document.addEventListener('keydown', e => {
    if (introActive) {
      if (e.key === 'Escape') enterUniverse();
      return;
    }
    if (exploreOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeExplore(); return; }
      if (e.key === 'Tab') {
        const f = $$('button, input', explore).filter(el => !el.hidden && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === 'Escape' && sel >= 0) { closePanel(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const step = e.shiftKey ? 260 : 110;
    const keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (keys[e.key]) {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      panBy(keys[e.key][0], keys[e.key][1]);
    }
  });

  /* ------------------------------------------------------------ selector de idioma */
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ------------------------------------------------------------------- entrada */
  let introDone = false;
  const timers = [];

  function enterUniverse(instant) {
    if (!introActive) return;
    introActive = false;
    timers.splice(0).forEach(clearTimeout);
    body.classList.add('in');
    const hadFocus = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#intro'));
    const finish = () => {
      introDone = true;
      intro.hidden = true;
      intro.setAttribute('inert', '');
      const first = $('.portal-btn', worldEl);
      if (first && hadFocus) first.focus({ preventScroll: true });
    };
    if (instant || reduce) {
      intro.classList.add('leaving');
      finish();
    } else {
      intro.classList.add('leaving');
      timers.push(setTimeout(finish, 950));
    }
    timers.push(setTimeout(() => hint.classList.toggle('off', hintDone), 1200));
    timers.push(setTimeout(hideHint, 14000));
  }
  $('#skip').addEventListener('click', () => enterUniverse());
  $('#enter').addEventListener('click', () => enterUniverse());

  /* --------------------------------------------------- movimiento reducido (SMIL) */
  function pauseArt() {
    $$('svg').forEach(s => { if (s.pauseAnimations) s.pauseAnimations(); });
  }
  function playArt() {
    $$('svg').forEach(s => { if (s.unpauseAnimations) s.unpauseAnimations(); });
  }
  const onReduce = e => { reduce = e.matches; if (reduce) { mouse.tx = mouse.ty = 0; pauseArt(); } else playArt(); kick(); };
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduce);
  else if (mqReduce.addListener) mqReduce.addListener(onReduce);

  /* ------------------------------------------------------------------- tamaño */
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      computeLayout();
      if (sel >= 0) focusCam(sel, true);
      else { const c = clampCam(cam.tx, cam.ty); moveCam(c.x, c.y, true); }
      if (reduce) pauseArt();
    }, 150);
  });

  /* --------------------------------------------------------------------- inicio */
  function init() {
    buildPortals();
    buildDock();
    computeLayout();
    applyStatic();
    refreshDynamic();
    moveCam(home.x, home.y, true);
    if (reduce) pauseArt();
    if (qs.get('intro') === '0') {
      enterUniverse(true);
    } else {
      if (!reduce) timers.push(setTimeout(() => enterUniverse(), 7200));
      $('#skip').focus({ preventScroll: true });
    }
  }
  init();

  /* utilidades para pruebas manuales desde la consola */
  window.CIOB = { select, closePanel, setLang, openExplore, closeExplore, get lang() { return lang; } };
})();
