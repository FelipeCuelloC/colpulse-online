/* ColPulse: medicion de visitas con Google Analytics 4, solo con consentimiento.
 *
 * Una sola etiqueta <script defer src="analytics.js" data-ga-id="G-..."> por pagina. Este archivo hace todo:
 * aviso de consentimiento, carga de Analytics y eventos. Reglas:
 *  - Sin data-ga-id valido: no hace nada (sin aviso, sin peticiones).
 *  - En localhost, 127.0.0.1 o file: no hace nada.
 *  - Nada de Google se carga y ninguna cookie se guarda hasta que la persona pulsa "Aceptar".
 *    Lo unico que sabe Google de este sitio es lo que sale de loadGtag(), que solo se llama desde
 *    enableMeasurement(), que solo se llama con la decision "granted".
 *  - La decision se guarda en localStorage (cp_analytics_consent). Si localStorage falla, se trata como
 *    no decidido y no se mide.
 *  - Global Privacy Control o No rastrear = rechazo por defecto; la persona puede aceptar a proposito.
 *  - Ningun evento lleva montos, valores escritos, nombres ni correos.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) { return; }
  var ID = script.getAttribute('data-ga-id') || '';
  if (!/^G-[A-Z0-9]{4,20}$/.test(ID)) { return; }

  // Compuerta local: las vistas de desarrollo y de prueba no ensucian las estadisticas reales.
  var EXCLUDE_LOCAL = true;
  var host = location.hostname;
  if (location.protocol === 'file:' || !host) { return; }
  if (EXCLUDE_LOCAL && (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1' || /\.localhost$/.test(host))) { return; }

  var KEY = 'cp_analytics_consent';
  var srcAttr = script.getAttribute('src') || 'analytics.js';
  var PREFIX = srcAttr.replace(/analytics\.js.*$/, '');
  var PRIVACY_PATH = PREFIX + 'methodology.html#privacidad';

  var TEXT = {
    es: {
      region: 'Aviso de privacidad y medición',
      msg: 'Medimos las visitas y el uso de las herramientas con Google Analytics, que usa cookies. Solo ocurre si aceptas. No guardamos nombres, correos ni lo que escribes en el simulador.',
      more: 'Privacidad y medición',
      accept: 'Aceptar',
      reject: 'Rechazar',
      prefs: 'Preferencias de privacidad',
      none: 'Aún no has decidido: no se mide nada.',
      granted: 'Tu decisión actual: aceptaste la medición.',
      denied: 'Tu decisión actual: rechazaste la medición.',
      signal: 'Tu navegador envía una señal de privacidad (GPC o No rastrear). La tratamos como rechazo mientras no aceptes.'
    },
    en: {
      region: 'Privacy and measurement notice',
      msg: 'We measure visits and the use of the tools with Google Analytics, which uses cookies. This only happens if you accept. We do not store names, emails or anything you type in the simulator.',
      more: 'Privacy and measurement',
      accept: 'Accept',
      reject: 'Decline',
      prefs: 'Privacy preferences',
      none: 'You have not decided yet: nothing is measured.',
      granted: 'Your current choice: you accepted measurement.',
      denied: 'Your current choice: you declined measurement.',
      signal: 'Your browser sends a privacy signal (GPC or Do Not Track). We treat it as a refusal until you accept.'
    }
  };

  function lang() {
    return String(document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'es';
  }
  function t(key) { return TEXT[lang()][key]; }

  // ------------------------------------------------------------------ decision

  function readDecision() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch (e) { return null; }
  }
  function writeDecision(v) {
    try { window.localStorage.setItem(KEY, v); return true; } catch (e) { return false; }
  }
  function browserSignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  }

  var state = { decision: readDecision(), started: false, usedSim: false, lastRisk: null, lastView: null };

  // ------------------------------------------------------------------ cookies

  function clearGaCookies() {
    var names = [];
    var parts = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].split('=')[0].replace(/^\s+/, '');
      if (/^_ga/.test(name) || name === '_gid') { names.push(name); }
    }
    if (!names.length) { return; }
    var labels = host.split('.');
    var domains = [''];
    for (var d = 0; d < labels.length - 1; d++) {
      var dom = labels.slice(d).join('.');
      domains.push(dom, '.' + dom);
    }
    for (var n = 0; n < names.length; n++) {
      for (var k = 0; k < domains.length; k++) {
        document.cookie = names[n] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
          (domains[k] ? '; domain=' + domains[k] : '');
      }
    }
  }

  // ------------------------------------------------------------------ measurement

  function isHome() { return location.pathname === '/' || /\/index\.html$/.test(location.pathname); }
  function homeView() {
    var h = location.hash;
    return /^#[a-z0-9_-]{1,40}$/i.test(h) ? h.slice(1).toLowerCase() : 'inicio';
  }
  function pageLocation() {
    var keep = [];
    var q = location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < q.length; i++) {
      if (/^utm_(source|medium|campaign|term|content)=[^&]{0,80}$/.test(q[i])) { keep.push(q[i]); }
    }
    return location.origin + location.pathname + (keep.length ? '?' + keep.join('&') : '');
  }

  function loadGtag() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
  }

  function sendPageView() {
    var params = { page_location: pageLocation(), page_path: location.pathname, page_title: document.title };
    if (isHome()) {
      var view = homeView();
      state.lastView = view;
      params.vista = view;
      if (view !== 'inicio') {
        params.page_location += '#' + view;
        params.page_path += '#' + view;
      }
    }
    window.gtag('event', 'page_view', params);
  }

  function enableMeasurement() {
    window['ga-disable-' + ID] = false;
    if (state.started) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      sendPageView();
      return;
    }
    state.started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('config', ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    sendPageView();
    loadGtag();
  }

  function disableMeasurement() {
    window['ga-disable-' + ID] = true;
    if (state.started && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    clearGaCookies();
  }

  function measuring() { return state.started && state.decision === 'granted' && typeof window.gtag === 'function'; }

  function send(name, params) {
    if (!measuring()) { return false; }
    window.gtag('event', name, params || {});
    return true;
  }

  function decide(value) {
    state.decision = value;
    writeDecision(value); // si falla, la eleccion vale solo para esta pagina
    if (value === 'granted') { enableMeasurement(); } else { disableMeasurement(); }
  }

  // ------------------------------------------------------------------ events (delegated)

  function riskBucket(v) {
    var n = Number(v);
    if (!isFinite(n)) { return null; }
    if (n <= 20) { return 'muy_bajo'; }
    if (n <= 40) { return 'bajo'; }
    if (n <= 60) { return 'medio'; }
    if (n <= 80) { return 'alto'; }
    return 'muy_alto';
  }

  function onControl(e, released) {
    var el = e.target;
    if (!el || !el.closest || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || !el.closest('.sim')) { return; }
    if (!state.usedSim && send('simulador_uso', { herramienta: 'simulador' })) { state.usedSim = true; }
    if (released && el.id === 'riesgo') {
      var bucket = riskBucket(el.value);
      if (bucket && bucket !== state.lastRisk && send('simulador_riesgo', { nivel_riesgo: bucket })) { state.lastRisk = bucket; }
    }
  }

  function onLinkClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) { return; }
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') { return; }
    if (u.hostname === host) { return; }
    send('clic_saliente', { dominio_destino: u.hostname.replace(/^www\./, ''), transport_type: 'beacon' });
  }

  document.addEventListener('input', function (e) { onControl(e, false); }, true);
  document.addEventListener('change', function (e) { onControl(e, true); }, true);
  document.addEventListener('click', onLinkClick, true);
  document.addEventListener('auxclick', onLinkClick, true);
  window.addEventListener('hashchange', function () {
    if (!isHome() || !measuring()) { return; }
    // La portada actualiza document.title despues del cambio de vista: se espera un instante.
    window.setTimeout(function () {
      if (measuring() && homeView() !== state.lastView) { sendPageView(); }
    }, 250);
  });

  // ------------------------------------------------------------------ banner

  // Tokens del sistema visual (chrome.DESIGN_TOKENS_CSS) con respaldo literal para paginas sin ellos.
  // Botones con la forma de .ui-btn (--outline): aceptar y rechazar pesan lo mismo, sin empujar una opcion.
  var CSS = [
    '#cp-consent{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp-3,12px) var(--sp-5,24px);padding:var(--sp-3,12px) max(var(--sp-4,16px),env(safe-area-inset-right)) max(var(--sp-3,12px),env(safe-area-inset-bottom)) max(var(--sp-4,16px),env(safe-area-inset-left));background:var(--white,#ffffff);color:var(--ink,#172c2b);border-top:1px solid var(--border,#dce1d9);box-shadow:0 -6px 20px rgba(23,44,43,0.10);font:400 var(--fs-small,14px)/1.5 var(--sans,"IBM Plex Sans",Arial,sans-serif)}',
    '#cp-consent .cp-c-body{flex:1 1 420px;min-width:0;margin:0}',
    '#cp-consent p{margin:0}',
    '#cp-consent .cp-c-status{margin-top:var(--sp-1,4px);color:var(--muted,#5f6d68);font-size:var(--fs-label,13px)}',
    '#cp-consent a{color:var(--accent-deep,#3f652c);text-decoration:underline;text-underline-offset:2px}',
    '#cp-consent a:hover{color:var(--ink,#172c2b)}',
    '#cp-consent .cp-c-btns{display:flex;gap:var(--sp-3,12px);flex:0 0 auto}',
    '#cp-consent .ui-btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:112px;min-height:44px;padding:11px 17px;border:1px solid var(--control,#78867e);border-radius:var(--radius-2,4px);background:transparent;color:var(--ink,#172c2b);font:500 var(--fs-label,13px)/1.3 var(--sans,"IBM Plex Sans",Arial,sans-serif);cursor:pointer}',
    '#cp-consent .ui-btn:hover{background:var(--soft,#eef2e9);color:var(--ink,#172c2b)}',
    '#cp-consent a:focus-visible,#cp-consent .ui-btn:focus-visible{outline:3px solid var(--focus,#548c34);outline-offset:2px}',
    '@media (max-width:520px){#cp-consent{gap:var(--sp-2,8px);font-size:var(--fs-label,13px);line-height:1.45}#cp-consent .cp-c-body{flex-basis:100%}#cp-consent .cp-c-btns{flex:1 1 100%;gap:var(--sp-2,8px)}#cp-consent .ui-btn{flex:1 1 0;min-width:0;padding:10px 12px}}',
    '.cp-prefs,button[data-cp-privacy]{font:inherit;color:inherit;background:none;border:0;padding:6px 0;margin:0;min-height:32px;text-decoration:underline;cursor:pointer;text-align:left}',
    'button[data-cp-privacy]{border:1px solid var(--control,currentColor);border-radius:var(--radius-2,4px);padding:8px 14px;min-height:44px;text-decoration:none;font-weight:500;color:var(--ink,inherit)}',
    'button[data-cp-privacy]:hover{background:var(--soft,transparent)}',
    '.cp-prefs:focus-visible,button[data-cp-privacy]:focus-visible{outline:3px solid var(--focus,#548c34);outline-offset:2px}',
    '@media print{#cp-consent,.cp-prefs{display:none!important}}'
  ].join('\n');

  var banner = null;
  var opener = null;
  var savedPadding = null;

  function injectStyle() {
    if (document.getElementById('cp-consent-style')) { return; }
    var st = document.createElement('style');
    st.id = 'cp-consent-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function statusText() {
    if (state.decision === 'granted') { return t('granted'); }
    if (state.decision === 'denied') { return t('denied'); }
    return browserSignal() ? t('signal') : t('none');
  }

  function fillBanner(withStatus) {
    if (!banner) { return; }
    banner.setAttribute('aria-label', t('region'));
    banner.querySelector('.cp-c-msg').textContent = t('msg') + ' ';
    var link = banner.querySelector('.cp-c-link');
    link.textContent = t('more');
    link.setAttribute('href', PRIVACY_PATH);
    banner.querySelector('[data-cp="accept"]').textContent = t('accept');
    banner.querySelector('[data-cp="reject"]').textContent = t('reject');
    var status = banner.querySelector('.cp-c-status');
    status.textContent = withStatus ? statusText() : '';
    status.hidden = !withStatus;
  }

  function reservePadding() {
    if (!banner || !document.body) { return; }
    if (savedPadding === null) { savedPadding = document.body.style.paddingBottom; }
    document.body.style.paddingBottom = banner.offsetHeight + 'px';
  }

  function closeBanner(restoreFocus) {
    if (!banner) { return; }
    var had = banner.contains(document.activeElement);
    banner.parentNode.removeChild(banner);
    banner = null;
    if (savedPadding !== null) { document.body.style.paddingBottom = savedPadding; savedPadding = null; }
    if (restoreFocus && had && opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function openBanner(withStatus, from) {
    injectStyle();
    if (banner) { fillBanner(withStatus); return; }
    opener = from || null;
    banner = document.createElement('div');
    banner.id = 'cp-consent';
    banner.setAttribute('role', 'region');
    var body = document.createElement('div');
    body.className = 'cp-c-body';
    var p = document.createElement('p');
    var msg = document.createElement('span');
    msg.className = 'cp-c-msg';
    var link = document.createElement('a');
    link.className = 'cp-c-link';
    p.appendChild(msg);
    p.appendChild(link);
    var status = document.createElement('p');
    status.className = 'cp-c-status';
    body.appendChild(p);
    body.appendChild(status);
    var btns = document.createElement('div');
    btns.className = 'cp-c-btns';
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'ui-btn ui-btn--outline';
    accept.setAttribute('data-cp', 'accept');
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'ui-btn ui-btn--outline';
    reject.setAttribute('data-cp', 'reject');
    btns.appendChild(accept);
    btns.appendChild(reject);
    banner.appendChild(body);
    banner.appendChild(btns);
    accept.addEventListener('click', function () { decide('granted'); closeBanner(true); });
    reject.addEventListener('click', function () { decide('denied'); closeBanner(true); });
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.decision && opener) { closeBanner(true); }
    });
    fillBanner(withStatus);
    document.body.insertBefore(banner, document.body.firstChild);
    reservePadding();
    if (from) { accept.focus(); }
  }

  // ------------------------------------------------------------------ permanent footer link

  function ensurePrefsLink() {
    var existing = document.querySelector('.cp-prefs');
    if (existing) { existing.textContent = t('prefs'); return; }
    var holder = document.querySelector('.footer .links') || document.querySelector('footer nav') ||
      document.querySelector('footer');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cp-prefs';
    btn.textContent = t('prefs');
    btn.addEventListener('click', function () { openBanner(true, btn); });
    if (holder) {
      var sib = holder.querySelector('a');
      if (sib && window.getComputedStyle) {
        var cs = window.getComputedStyle(sib);
        btn.style.color = cs.color;
        btn.style.fontSize = cs.fontSize;
        btn.style.fontFamily = cs.fontFamily;
      }
      holder.appendChild(btn);
    } else if (document.body) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'padding:8px 16px;font-size:13px';
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
    }
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target && e.target.closest ? e.target.closest('[data-cp-privacy]') : null;
    if (trigger) { e.preventDefault(); openBanner(true, trigger); }
  });

  // ------------------------------------------------------------------ start

  function start() {
    injectStyle();
    if (state.decision === 'granted') {
      enableMeasurement();
    } else {
      clearGaCookies();
      if (state.decision === null && !browserSignal()) { openBanner(false, null); }
    }
    ensurePrefsLink();
    if (window.MutationObserver) {
      var queued = false;
      new MutationObserver(function () {
        if (queued) { return; }
        queued = true;
        window.requestAnimationFrame(function () { queued = false; ensurePrefsLink(); });
      }).observe(document.body, { childList: true, subtree: true });
      new MutationObserver(function () {
        ensurePrefsLink();
        if (banner) { fillBanner(!!banner.querySelector('.cp-c-status').textContent); }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
    window.addEventListener('resize', function () { if (banner) { reservePadding(); } });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }
})();
