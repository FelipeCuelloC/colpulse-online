/* Visor de Colombia (prototipo). Lee solo archivos del propio sitio; la unica peticion a un tercero es el estilo
   del mapa base que indica data/visor.json (basemap). Sin mapa base, sin WebGL o sin la biblioteca del mapa, la
   lista, la ficha y la tabla siguen funcionando. */
(function () {
  "use strict";

  var NO_DATA_LABEL = "Sin dato";
  var COLORS = ["#e6eff3", "#bcd4e0", "#86b1c8", "#4a86a8", "#1f5a7d"];
  var SOLID_BG = "#eef2f1";
  var CIFRAS = [
    { key: "trm", mid: "trm", label: "Dólar (TRM)" },
    { key: "ipc_yoy", mid: "ipc_yoy", label: "Inflación anual" },
    { key: "policy_rate", mid: "policy_rate", label: "Tasa del Banco de la República" },
    { key: "tasa_desocupacion", mid: "tasa_desocupacion", label: "Desempleo" },
    { key: "colcap", mid: "colcap_monthly", label: "Bolsa (COLCAP, mensual)" },
    { key: "ise", mid: "ise", label: "Actividad económica (ISE)" }
  ];
  var MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  var S = { visor: null, regions: null, geo: null, today: null, bvc: null, manifest: null, layerId: null, sel: "", sort: { key: "valor", dir: "desc" }, map: null, mapReady: false, bins: null };
  var DEPTS = {}; // iso -> { iso, name, slug, reg }
  var ORDER = []; // isos, por nombre

  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  // Estados de una seccion (componente ui-state): siempre con una etiqueta visible, nunca solo color.
  var STATE_LABEL = { error: "Error", empty: "Sin datos", loading: "Cargando" };
  function stateBox(text, kind) {
    var n = el("p", { "class": "ui-state ui-state--" + kind });
    n.appendChild(el("span", { "class": "ui-state__label", text: STATE_LABEL[kind] }));
    n.appendChild(document.createTextNode(text));
    return n;
  }
  function setStatus(id, text, isError) {
    var n = $(id); if (!n) return;
    var kind = isError ? "error" : "empty";
    clear(n); n.className = "ui-state ui-state--" + kind;
    if (text) { n.appendChild(el("span", { "class": "ui-state__label", text: STATE_LABEL[kind] })); n.appendChild(document.createTextNode(text)); }
    n.hidden = !text;
  }
  function sourceLine(source, cutText) {
    return el("p", { "class": "ui-source" }, [el("span", { text: "Fuente: " + (source || "no indicada") }), el("time", { text: cutText })]);
  }
  var nfCache = {};
  function fmt(v, dec) {
    var k = dec | 0;
    if (!nfCache[k]) nfCache[k] = new Intl.NumberFormat("es-CO", { minimumFractionDigits: k, maximumFractionDigits: k });
    return nfCache[k].format(v);
  }
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function fdate(iso) {
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(iso || ""));
    if (!m) return String(iso || "sin fecha");
    var mon = MONTHS[parseInt(m[2], 10) - 1] || m[2];
    return (m[3] ? parseInt(m[3], 10) + " " : "") + mon + " " + m[1];
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  /* ---------- datos por capa ---------- */
  var ACCESS = {
    pib: function (reg) { var i = reg && reg.indicators && reg.indicators.pib_departamental_corriente; return i ? i.value : null; },
    participacion: function (reg) { return reg && reg.profile ? reg.profile.gdp_share_pct : null; },
    variacion: function (reg) { return reg && reg.profile ? reg.profile.gdp_nominal_growth_pct : null; }
  };
  function layers() { return (S.visor && S.visor.layers || []).filter(function (l) { return ACCESS[l.id]; }); }
  function layer() { var all = layers(); for (var i = 0; i < all.length; i++) if (all[i].id === S.layerId) return all[i]; return all[0] || null; }
  function valueOf(layerId, iso) {
    var d = DEPTS[iso]; if (!d || !ACCESS[layerId]) return null;
    var v = ACCESS[layerId](d.reg);
    return isNum(v) ? v : null;
  }
  function ranking(layerId) {
    var vals = ORDER.map(function (iso) { return valueOf(layerId, iso); }).filter(isNum);
    return { vals: vals, n: vals.length };
  }
  function rankOf(layerId, iso) {
    var v = valueOf(layerId, iso); if (v === null) return null;
    var r = ranking(layerId), higher = 0;
    r.vals.forEach(function (x) { if (x > v) higher++; });
    return { puesto: higher + 1, de: r.n };
  }
  function valueText(l, v) {
    if (v === null) return NO_DATA_LABEL;
    var t = fmt(v, l.decimals);
    return l.unit === "%" || l.unit === "% nominal" ? t + " " + l.unit : t;
  }

  /* ---------- escala por cuantiles ---------- */
  function computeBins(l) {
    var rows = ORDER.map(function (iso) { return { iso: iso, v: valueOf(l.id, iso) }; });
    var vals = rows.filter(function (r) { return r.v !== null; }).map(function (r) { return r.v; }).sort(function (a, b) { return a - b; });
    var edges = [];
    if (vals.length) {
      for (var i = 1; i < COLORS.length; i++) {
        var pos = (vals.length - 1) * i / COLORS.length, lo = Math.floor(pos), hi = Math.ceil(pos);
        var q = vals[lo] + (vals[hi] - vals[lo]) * (pos - lo);
        if (!edges.length || q > edges[edges.length - 1]) edges.push(q);
      }
    }
    var classes = edges.length + 1, members = [];
    for (var c = 0; c < classes; c++) members.push([]);
    var byIso = {};
    rows.forEach(function (r) {
      if (r.v === null) { byIso[r.iso] = -1; return; }
      var b = 0; while (b < edges.length && r.v > edges[b]) b++;
      byIso[r.iso] = b; members[b].push(r.v);
    });
    // si hay valores repetidos y salen menos clases, los colores se reparten sobre toda la escala
    var colors = [];
    for (var k = 0; k < classes; k++) colors.push(COLORS[classes === 1 ? COLORS.length - 1 : Math.round(k * (COLORS.length - 1) / (classes - 1))]);
    return { byIso: byIso, members: members, colors: colors, count: vals.length };
  }

  /* ---------- cifras nacionales ---------- */
  function staleOf(mid) {
    var list = S.manifest && S.manifest.indicators; if (!Array.isArray(list)) return false;
    for (var i = 0; i < list.length; i++) if (list[i].id === mid) return list[i].fresh === false;
    return false;
  }
  function renderCifras() {
    var ul = $("cifras"); clear(ul);
    var items = (S.today && S.today.items) || [], byKey = {};
    items.forEach(function (it) { byKey[it.key] = it; });
    var shown = 0;
    CIFRAS.forEach(function (c) {
      var value = null, unit = "", cut = "", source = "";
      if (c.key === "colcap") {
        var ix = S.bvc && S.bvc.index;
        if (ix && isNum(ix.value)) { value = ix.value; unit = "índice"; cut = ix.periodLabel || ix.priceDate || ix.updated || ""; source = ix.source || ""; }
      } else if (byKey[c.key] && isNum(byKey[c.key].value)) {
        var it = byKey[c.key]; value = it.value; unit = it.unit || ""; cut = it.cut || ""; source = it.source || "";
      }
      var li = el("li", { "class": "cifra" });
      li.appendChild(el("span", { "class": "et", text: c.label }));
      if (value === null) {
        li.appendChild(el("span", { "class": "val", text: "Sin dato" }));
        li.appendChild(el("span", { "class": "meta", text: "Sin dato: no está en los datos cargados." }));
      } else {
        shown++;
        var dec = unit === "%" ? 2 : unit === "COP/USD" ? 2 : 1;
        var v = el("span", { "class": "val" }, [fmt(value, dec), unit === "%" ? "%" : ""]);
        if (unit && unit !== "%") v.appendChild(el("small", { text: " " + unit }));
        li.appendChild(v);
        li.appendChild(sourceLine(source, "Corte: " + fdate(cut)));
        if (staleOf(c.mid)) li.appendChild(el("span", { "class": "badge", text: "Dato atrasado" }));
      }
      ul.appendChild(li);
    });
    if (!S.today && !S.bvc) setStatus("cifras-estado", "No se pudieron cargar las cifras nacionales. Prueba de nuevo más tarde.", true);
    else setStatus("cifras-estado", shown === 0 ? "No hay cifras nacionales disponibles por ahora." : "", false);
  }

  /* ---------- capas, leyenda, tabla ---------- */
  function renderLayerPicker() {
    var box = $("capas"); clear(box);
    var all = layers();
    if (!all.length) { box.appendChild(stateBox("No se pudieron cargar las capas del mapa.", "error")); return; }
    all.forEach(function (l) {
      var input = el("input", { type: "radio", name: "capa", value: l.id, id: "capa-" + l.id });
      if (l.id === S.layerId) input.checked = true;
      input.addEventListener("change", function () { if (input.checked) setLayer(l.id); });
      box.appendChild(el("label", { "for": "capa-" + l.id }, [input, el("span", { text: l.label + (l.unit ? " (" + l.unit + ")" : "") })]));
    });
  }
  function renderLayerInfo(l) {
    var n = $("capa-info"); clear(n);
    if (!l) return;
    var parts = [l.how, " Fuente: " + l.source + ". Corte: " + (l.cutYear || "sin fecha") + (l.preliminary ? " (preliminar)" : "") + "."];
    if (l.id === "variacion" && l.previousCutYear) parts.push(" Se compara con " + l.previousCutYear + ".");
    var cov = ranking(l.id).n;
    parts.push(" Cobertura: " + cov + " de " + ORDER.length + " departamentos.");
    n.appendChild(document.createTextNode(parts.join("")));
    if (l.stale) n.appendChild(el("span", { "class": "badge", text: "Dato atrasado" }));
  }
  function renderLegend(l) {
    var ul = $("leyenda"); clear(ul);
    if (!l || !S.bins) return;
    S.bins.members.forEach(function (m, i) {
      if (!m.length) return;
      var lo = Math.min.apply(null, m), hi = Math.max.apply(null, m);
      var swatch = el("i", { "aria-hidden": "true" }); swatch.style.background = S.bins.colors[i];
      ul.appendChild(el("li", null, [swatch, el("span", { text: lo === hi ? valueText(l, lo) : fmt(lo, l.decimals) + " a " + fmt(hi, l.decimals) + (l.unit === "%" || l.unit === "% nominal" ? " " + l.unit : "") }), el("span", { "class": "n", text: "(" + m.length + ")" })]));
    });
    var missing = ORDER.length - S.bins.count;
    if (missing > 0) ul.appendChild(el("li", null, [el("i", { "class": "sin", "aria-hidden": "true" }), el("span", { text: NO_DATA_LABEL }), el("span", { "class": "n", text: "(" + missing + ")" })]));
  }
  function sortedRows(l) {
    var rows = ORDER.map(function (iso) { var r = rankOf(l.id, iso); return { iso: iso, name: DEPTS[iso].name, v: valueOf(l.id, iso), puesto: r ? r.puesto : null }; });
    var k = S.sort.key, dir = S.sort.dir === "asc" ? 1 : -1;
    rows.sort(function (a, b) {
      if (k === "nombre") return dir * a.name.localeCompare(b.name, "es");
      var av = k === "puesto" ? a.puesto : a.v, bv = k === "puesto" ? b.puesto : b.v;
      if (av === null && bv === null) return a.name.localeCompare(b.name, "es");
      if (av === null) return 1; if (bv === null) return -1;
      if (k === "puesto") return dir * -1 * (av - bv) || a.name.localeCompare(b.name, "es");
      return dir * (av - bv) || a.name.localeCompare(b.name, "es");
    });
    return rows;
  }
  function renderTable() {
    var t = $("tabla"); clear(t);
    var l = layer();
    if (!l || !ORDER.length) { setStatus("tabla-sub", "No hay datos por departamento para mostrar.", true); return; }
    var sub = $("tabla-sub"); sub.textContent = "Los mismos valores del mapa, en texto. " + l.label + (l.unit ? " (" + l.unit + ")" : "") + ". Fuente: " + l.source + ". Corte " + (l.cutYear || "sin fecha") + (l.preliminary ? " (preliminar)" : "") + ".";
    sub.className = "sub"; sub.hidden = false;
    t.className = "ui-table";
    t.appendChild(el("caption", { text: l.label + " por departamento" }));
    var head = el("tr");
    [["puesto", "Puesto", "num"], ["nombre", "Departamento", ""], ["valor", "Valor" + (l.unit ? " (" + l.unit + ")" : ""), "num"]].forEach(function (c) {
      var th = el("th", { scope: "col", "class": c[2] });
      var b = el("button", { type: "button", text: c[1] });
      b.addEventListener("click", function () {
        if (S.sort.key === c[0]) S.sort.dir = S.sort.dir === "asc" ? "desc" : "asc";
        else S.sort = { key: c[0], dir: c[0] === "nombre" ? "asc" : (c[0] === "puesto" ? "asc" : "desc") };
        renderTable();
        var again = $("tabla").querySelector('th button[data-k="' + c[0] + '"]'); if (again) again.focus();
      });
      b.setAttribute("data-k", c[0]);
      if (S.sort.key === c[0]) th.setAttribute("aria-sort", S.sort.dir === "asc" ? "ascending" : "descending");
      th.appendChild(b); head.appendChild(th);
    });
    t.appendChild(el("thead", null, [head]));
    var body = el("tbody");
    sortedRows(l).forEach(function (r) {
      var tr = el("tr", { "data-iso": r.iso });
      if (r.iso === S.sel) { tr.className = "sel"; tr.setAttribute("aria-current", "true"); }
      var btn = el("button", { type: "button", text: r.name });
      btn.addEventListener("click", function () { selectDept(r.iso, true); });
      tr.appendChild(el("td", { "class": "num", text: r.puesto === null ? "—" : String(r.puesto) }));
      tr.appendChild(el("th", { scope: "row" }, [btn]));
      tr.appendChild(el("td", { "class": "num", text: r.v === null ? NO_DATA_LABEL : fmt(r.v, l.decimals) }));
      body.appendChild(tr);
    });
    t.appendChild(body);
  }

  /* ---------- ficha ---------- */
  function renderFicha() {
    var box = $("ficha"); clear(box);
    var d = DEPTS[S.sel];
    if (!d) { box.appendChild(el("p", { "class": "note", text: "Elige un departamento en el mapa, en la lista o en la tabla." })); return; }
    box.appendChild(el("h3", { "class": "nom", text: d.name }));
    var dl = el("dl", { "class": "ind" }), any = false;
    layers().forEach(function (l) {
      var v = valueOf(l.id, d.iso), r = rankOf(l.id, d.iso);
      var dd = el("dd");
      if (v === null) dd.appendChild(el("span", { "class": "v", text: NO_DATA_LABEL }));
      else {
        any = true;
        var vv = el("span", { "class": "v" }, [fmt(v, l.decimals)]);
        if (l.unit) vv.appendChild(el("small", { text: " " + l.unit }));
        dd.appendChild(vv);
        if (r) dd.appendChild(el("div", { "class": "pos", text: "Puesto " + r.puesto + " de " + r.de }));
      }
      dd.appendChild(sourceLine(l.source, "Corte " + (l.cutYear || "sin fecha") + (l.preliminary ? " (preliminar)" : "")));
      var wrap = el("div", { "class": "ind" }, [el("dt", { text: l.label }), dd]);
      dl.appendChild(wrap);
    });
    box.appendChild(dl);
    if (!any) box.appendChild(stateBox("Este departamento no tiene datos en las capas cargadas.", "empty"));
    var meta = layers()[0];
    if (meta && meta.stale) box.appendChild(el("p", null, [el("span", { "class": "badge", text: "Dato atrasado" })]));
    if (d.slug) box.appendChild(el("p", null, [el("a", { href: "departments/" + d.slug + ".html", text: "Ver la página de " + d.name })]));
    else box.appendChild(el("p", { "class": "note", text: "La página de este departamento no está disponible desde aquí." }));
  }
  function fillSelect() {
    var s = $("depto-sel"); clear(s);
    s.appendChild(el("option", { value: "", text: ORDER.length ? "— Elige un departamento —" : "Sin departamentos" }));
    ORDER.forEach(function (iso) { s.appendChild(el("option", { value: iso, text: DEPTS[iso].name })); });
    s.disabled = !ORDER.length;
    s.addEventListener("change", function () { selectDept(s.value, false); });
  }

  /* ---------- seleccion ---------- */
  function selectDept(iso, scrollToFicha) {
    var prev = S.sel; S.sel = DEPTS[iso] ? iso : "";
    $("depto-sel").value = S.sel;
    renderFicha(); renderTable();
    if (S.mapReady) {
      try {
        if (prev) S.map.setFeatureState({ source: "deptos", id: prev }, { sel: false });
        if (S.sel) S.map.setFeatureState({ source: "deptos", id: S.sel }, { sel: true });
      } catch (e) { /* el mapa no es imprescindible */ }
    }
    if (scrollToFicha && S.sel && window.matchMedia("(max-width: 900px)").matches) {
      var f = $("h-ficha"); if (f && f.scrollIntoView) f.scrollIntoView({ block: "start" });
    }
  }

  function setLayer(id) {
    S.layerId = id;
    var l = layer(); if (!l) return;
    S.bins = computeBins(l);
    renderLayerInfo(l); renderLegend(l); renderTable(); renderFicha();
    applyMapStates();
    $("lectura").textContent = "";
  }

  /* ---------- mapa ---------- */
  function applyMapStates() {
    if (!S.mapReady || !S.bins) return;
    try {
      ORDER.forEach(function (iso) { S.map.setFeatureState({ source: "deptos", id: iso }, { bin: S.bins.byIso[iso], sel: iso === S.sel }); });
      S.map.setPaintProperty("deptos-relleno", "fill-color", fillColorExpr());
    } catch (e) { /* ignorar */ }
  }
  function fillColorExpr() {
    var expr = ["match", ["coalesce", ["feature-state", "bin"], -1]];
    var colors = S.bins ? S.bins.colors : COLORS;
    colors.forEach(function (c, i) { expr.push(i, c); });
    expr.push("#c9cdd0");
    return expr;
  }
  function hatchImage() {
    var size = 8, data = new Uint8Array(size * size * 4);
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var on = ((x + y) % size) < 1, o = (y * size + x) * 4;
      data[o] = on ? 70 : 255; data[o + 1] = on ? 80 : 255; data[o + 2] = on ? 88 : 255; data[o + 3] = 255;
    }
    return { width: size, height: size, data: data };
  }
  function ourLayers() {
    var fillBase = [
      { id: "deptos-relleno", type: "fill", source: "deptos", paint: { "fill-color": fillColorExpr(), "fill-opacity": ["case", ["==", ["coalesce", ["feature-state", "bin"], -1], -1], 0, 0.88] } },
      { id: "deptos-sin-dato", type: "fill", source: "deptos", paint: { "fill-pattern": "hatch", "fill-opacity": ["case", ["==", ["coalesce", ["feature-state", "bin"], -1], -1], 1, 0] } }
    ];
    var lines = [
      { id: "deptos-borde", type: "line", source: "deptos", paint: { "line-color": "#2b3a44", "line-width": 0.7, "line-opacity": 0.8 } },
      { id: "deptos-sel", type: "line", source: "deptos", paint: { "line-color": "#d9480f", "line-width": ["case", ["boolean", ["feature-state", "sel"], false], 3, 0] } },
      { id: "deptos-hit", type: "fill", source: "deptos", paint: { "fill-color": "#000000", "fill-opacity": 0 } }
    ];
    return { fills: fillBase, lines: lines };
  }
  function composeStyle(base) {
    var ours = ourLayers();
    var sources = { deptos: { type: "geojson", data: S.geo, promoteId: "shapeISO" } };
    if (!base || !Array.isArray(base.layers)) {
      return { version: 8, sources: sources, layers: [{ id: "fondo", type: "background", paint: { "background-color": SOLID_BG } }].concat(ours.fills, ours.lines) };
    }
    var baseLayers = base.layers.slice(), idx = -1;
    for (var i = 0; i < baseLayers.length; i++) if (baseLayers[i].type === "symbol") { idx = i; break; }
    if (idx < 0) idx = baseLayers.length;
    var merged = baseLayers.slice(0, idx).concat(ours.fills, baseLayers.slice(idx), ours.lines);
    var style = { version: 8, sources: Object.assign({}, base.sources, sources), layers: merged };
    if (base.glyphs) style.glyphs = base.glyphs;
    if (base.sprite) style.sprite = base.sprite;
    return style;
  }
  function loadBasemap(cfg) {
    if (!cfg || !cfg.styleUrl) return Promise.resolve(null);
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, cfg.timeoutMs || 4000);
    return fetch(cfg.styleUrl, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (!r.ok) throw new Error("estilo " + r.status);
      return r.json();
    }).then(function (j) { clearTimeout(timer); return j; }, function () { clearTimeout(timer); return null; });
  }
  function hostOf(url) { try { return new URL(url).host; } catch (e) { return "el servidor del mapa base"; } }
  function webgl2() {
    try { var c = document.createElement("canvas"); return !!(window.WebGL2RenderingContext && c.getContext("webgl2")); } catch (e) { return false; }
  }
  function mapFail(text) {
    setStatus("mapa-aviso", text, true);
    $("mapa").hidden = true;
    $("basemap-info").textContent = "Mapa base: no se cargó el mapa.";
    $("leyenda").setAttribute("aria-label", "Leyenda de la capa (el mapa no está disponible)");
  }
  function initMap() {
    var aviso = $("mapa-aviso"), info = $("basemap-info");
    if (!S.geo || !Array.isArray(S.geo.features)) return mapFail("No se pudieron cargar los límites de los departamentos. La lista y la tabla siguen funcionando.");
    if (typeof window.maplibregl === "undefined") return mapFail("No se pudo cargar la biblioteca del mapa. La lista y la tabla siguen funcionando.");
    if (!webgl2()) return mapFail("Tu navegador no permite dibujar el mapa (falta WebGL). Usa la lista de departamentos y la tabla: tienen los mismos datos.");
    var cfg = S.visor && S.visor.basemap;
    loadBasemap(cfg).then(function (base) {
      var withBase = !!base;
      var map;
      try {
        map = new window.maplibregl.Map({
          container: "mapa", style: composeStyle(base),
          bounds: [[-82.3, -4.5], [-66.5, 13.8]], fitBoundsOptions: { padding: 6 },
          maxBounds: [[-92, -12], [-56, 22]], minZoom: 3, maxZoom: 9,
          attributionControl: false, cooperativeGestures: true, fadeDuration: 0,
          dragRotate: false, pitchWithRotate: false, touchPitch: false, renderWorldCopies: false,
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MacHelpText": "Usa ⌘ + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
            "NavigationControl.ZoomIn": "Acercar", "NavigationControl.ZoomOut": "Alejar"
          }
        });
      } catch (e) {
        mapFail("No se pudo crear el mapa en este navegador. La lista y la tabla siguen funcionando.");
        return;
      }
      S.map = map;
      map.addControl(new window.maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
      // Con mapa base, la atribucion visible es la que declara la propia fuente de teselas; si no aparece al terminar de
      // cargar, se agrega la de la configuracion (data/visor.json) para que nunca falte.
      map.addControl(new window.maplibregl.AttributionControl({ compact: false, customAttribution: withBase ? "" : "Sin mapa base" }), "bottom-right");
      if (withBase && cfg.attributionHtml) {
        map.once("idle", function () {
          var box = document.querySelector("#mapa .maplibregl-ctrl-attrib");
          if (box && box.textContent.indexOf("OpenStreetMap") < 0) {
            map.addControl(new window.maplibregl.AttributionControl({ compact: false, customAttribution: cfg.attributionHtml }), "bottom-left");
          }
        });
      }
      map.on("styleimagemissing", function (e) { if (e.id === "hatch" && !map.hasImage("hatch")) map.addImage("hatch", hatchImage()); });
      var baseErrors = 0;
      map.on("error", function (e) {
        var sid = e && e.sourceId;
        if (withBase && sid && sid !== "deptos") {
          baseErrors++;
          if (baseErrors === 1) info.textContent = "Mapa base: " + cfg.label + ". Algunas partes no cargaron; los departamentos se ven igual.";
        }
      });
      function markReady() {
        if (S.mapReady) return;
        S.mapReady = true; aviso.hidden = true;
        applyMapStates();
      }
      map.on("sourcedata", function (e) { if (e.sourceId === "deptos" && e.isSourceLoaded) markReady(); });
      map.on("load", markReady);
      map.on("mousemove", function (e) {
        var f = map.queryRenderedFeatures(e.point, { layers: ["deptos-hit"] })[0], out = $("lectura"), l = layer();
        map.getCanvas().style.cursor = f ? "pointer" : "";
        if (!f || !l) { out.textContent = ""; return; }
        var iso = f.properties.shapeISO, d = DEPTS[iso];
        out.textContent = (d ? d.name : f.properties.shapeName) + ": " + valueText(l, valueOf(l.id, iso)) + (valueOf(l.id, iso) !== null && l.unit !== "%" && l.unit !== "% nominal" ? " " + l.unit : "");
      });
      map.on("mouseout", function () { $("lectura").textContent = ""; });
      map.on("click", function (e) {
        var f = map.queryRenderedFeatures(e.point, { layers: ["deptos-hit"] })[0];
        if (f && DEPTS[f.properties.shapeISO]) selectDept(f.properties.shapeISO, true);
      });
      info.textContent = withBase
        ? "Mapa base: " + cfg.label + " (teselas vectoriales abiertas, sin llave). Al abrir esta página tu navegador pide el mapa a " + hostOf(cfg.styleUrl) + "."
        : "Sin mapa base: " + (cfg && cfg.styleUrl ? "no respondió a tiempo" : "no configurado") + ". Se muestran solo los departamentos sobre fondo liso.";
      $("mapa-nota").textContent = "Pasa el cursor o toca un departamento para ver su valor; haz clic para abrir su ficha. En el celular, usa dos dedos para mover el mapa.";
    });
  }

  /* ---------- lo que mas se movio y agenda ---------- */
  function renderMovers() {
    var m = S.visor && S.visor.movers, ul = $("movidos"); clear(ul);
    if (!m) { setStatus("mov-estado", "No se pudo cargar esta sección.", true); return; }
    $("mov-regla").textContent = m.rule || "";
    if (m.status !== "ok" || !m.items.length) { setStatus("mov-estado", m.reason || "Sin datos suficientes.", false); return; }
    setStatus("mov-estado", "", false);
    m.items.forEach(function (it) {
      var up = it.direction === "up", unit = it.changeKind === "points" ? (it.unit === "bp" ? " pb" : " puntos") : "%";
      var change = fmt(Math.abs(it.change), 2) + unit;
      var typical = fmt(it.typicalChange, 2) + unit;
      var li = el("li");
      li.appendChild(el("div", { "class": "nm", text: it.name + (it.stale ? "" : "") }));
      li.appendChild(el("div", { text: (up ? "Subió " : it.direction === "down" ? "Bajó " : "Sin cambio ") + change + " en " + fdate(it.latestPeriod) + " frente a " + fdate(it.previousPeriod) + "." }));
      li.appendChild(el("div", { "class": "raz", text: "Se movió " + fmt(it.ratio, 1) + " veces lo habitual (cambio típico: " + typical + ")." }));
      li.appendChild(sourceLine(it.source, "Dato de " + fdate(it.latestPeriod)));
      if (it.stale) li.appendChild(el("span", { "class": "badge", text: "Dato atrasado" }));
      ul.appendChild(li);
    });
  }
  function renderAgenda() {
    var a = S.visor && S.visor.agenda;
    if (!a) { setStatus("agenda-estado", "No se pudo cargar esta sección.", true); return; }
    setStatus("agenda-estado", a.message || "Aún no hay agenda cargada.", false);
    $("agenda-detalle").textContent = a.detail || "";
  }

  /* ---------- arranque ---------- */
  function buildDepartments() {
    DEPTS = {}; ORDER = [];
    var slugs = {};
    ((S.visor && S.visor.departments) || []).forEach(function (d) { slugs[d.iso] = d.slug; });
    ((S.regions && S.regions.departments) || []).forEach(function (r) {
      if (!r || !r.iso) return;
      DEPTS[r.iso] = { iso: r.iso, name: r.name || r.iso, slug: slugs[r.iso] || "", reg: r };
    });
    ORDER = Object.keys(DEPTS).sort(function (a, b) { return DEPTS[a].name.localeCompare(DEPTS[b].name, "es"); });
  }
  function start() {
    var jobs = {
      visor: getJSON("data/visor.json"), regions: getJSON("data/regions.json"), geo: getJSON("colombia_departments.geojson"),
      today: getJSON("data/today.json"), bvc: getJSON("data/bvc.json"), manifest: getJSON("data/manifest.json")
    };
    var keys = Object.keys(jobs), failed = {};
    Promise.all(keys.map(function (k) {
      return jobs[k].then(function (v) { S[k] = v; }, function () { failed[k] = true; });
    })).then(function () {
      buildDepartments();
      renderCifras();
      renderMovers(); renderAgenda();
      if (failed.visor) {
        setStatus("mapa-aviso", "No se pudo cargar la configuración del visor (data/visor.json).", true);
        $("capas").textContent = "";
        $("basemap-info").textContent = "Mapa base: no se cargó el mapa.";
      }
      if (failed.regions || !ORDER.length) {
        setStatus("mapa-aviso", "No se pudieron cargar los datos por departamento. Prueba de nuevo más tarde.", true);
        clear($("depto-sel")); $("depto-sel").appendChild(el("option", { value: "", text: "Sin datos" }));
        setStatus("tabla-sub", "No hay datos por departamento para mostrar.", true);
        return;
      }
      fillSelect();
      var all = layers();
      S.layerId = all.length ? all[0].id : null;
      renderLayerPicker();
      if (!all.length) { setStatus("tabla-sub", "No hay capas cargadas.", true); return; }
      setLayer(S.layerId);
      if (failed.visor) return;
      initMap();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
