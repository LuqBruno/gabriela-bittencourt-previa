(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- WhatsApp: link com mensagem pronta + eventos de conversão ---- */
  var PHONE = '5548991113297';
  var MSG = 'Olá, Dra. Gabriela! Vim pelo site e gostaria de agendar uma avaliação';
  function waHref(cidade) {
    var t = MSG + (cidade ? ' em ' + cidade : '') + '.';
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t);
  }
  function track(name, params) {
    try {
      (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
      if (typeof window.gtag === 'function') window.gtag('event', name, params);
      if (typeof window.fbq === 'function' && name === 'click_whatsapp') window.fbq('track', 'Contact', params);
    } catch (e) { /* analytics nunca deve quebrar a página */ }
  }
  doc.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waHref(a.dataset.cidade);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      track('click_whatsapp', { origem: a.dataset.origem || 'site', cidade: a.dataset.cidade || '' });
    });
  });
  doc.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_' + a.dataset.track, {}); });
  });

  /* ---- Header ---- */
  var header = doc.querySelector('.site-header');
  var menuBtn = doc.querySelector('.menu-btn');
  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    doc.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('nav-open')); });
  doc.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (innerWidth > 1100) setMenu(false); });

  /* ---- Scroll: header sólido + deriva do monograma ---- */
  var hero = doc.querySelector('.hero'), ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    header.classList.toggle('is-solid', y > 40);
    if (hero && !reduce) {
      var p = Math.min(1, Math.max(0, y / (hero.offsetHeight || 1)));
      hero.style.setProperty('--p', p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- Revelar ao rolar ---- */
  var items = doc.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Accordions (tratamentos e FAQ) ---- */
  doc.querySelectorAll('.acc').forEach(function (btn, i) {
    var panel = btn.nextElementSibling;
    if (panel) {
      var id = 'acc-p-' + i;
      panel.id = id;
      btn.setAttribute('aria-controls', id);
    }
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---- Galeria ---- */
  var gal = doc.querySelector('.gallery');
  doc.querySelectorAll('[data-gal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var step = Math.min(gal.clientWidth * 0.8, 420) * Number(b.dataset.gal);
      gal.scrollBy({ left: step, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---- Depoimentos: só avaliações reais, com autorização ----
     Preencher com { texto, nome } quando as avaliações do Google forem liberadas. */
  var REVIEWS = [];
  var slidesEl = doc.getElementById('slides'), ctl = doc.getElementById('slide-ctl'), dotsEl = doc.getElementById('dots');
  function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  if (!REVIEWS.length) {
    var s = el('div', 'slide on empty-slide');
    s.appendChild(el('p', '', 'As avaliações reais de pacientes entram aqui, com autorização, assim que forem liberadas.'));
    var a = el('a', '', 'Acompanhar no Instagram');
    a.href = 'https://www.instagram.com/dra.gabrielabittencourt/'; a.target = '_blank'; a.rel = 'noopener';
    s.appendChild(a);
    slidesEl.appendChild(s);
  } else {
    var cur = 0, slides = [], dots = [];
    REVIEWS.forEach(function (r, i) {
      var s2 = el('figure', 'slide' + (i ? '' : ' on'));
      s2.appendChild(el('blockquote', '', r.texto));
      s2.appendChild(el('cite', '', r.nome));
      slidesEl.appendChild(s2); slides.push(s2);
      var d = el('button', 'dot'); d.type = 'button'; d.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(d); dots.push(d);
    });
    var go = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (x, i) { x.classList.toggle('on', i === cur); });
      dots.forEach(function (x, i) { x.setAttribute('aria-current', String(i === cur)); });
    };
    ctl.hidden = REVIEWS.length < 2;
    ctl.querySelectorAll('[data-s]').forEach(function (b) { b.addEventListener('click', function () { go(cur + Number(b.dataset.s)); }); });
    go(0);
  }
})();
