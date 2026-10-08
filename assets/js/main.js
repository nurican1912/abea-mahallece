/*
 * Mahallece — sayfa davranışları
 *
 * 1) "Gönüllü Ol": Jotform'u başka sayfaya gitmeden, sayfanın içinde açar.
 *    Form ancak butona basılınca yüklenir (sayfa hızlı açılır; ziyaretçi
 *    istemeden Jotform'a bağlantı kurulmaz).
 * 2) Bölümlerin görünür olunca belirmesi.
 *
 * JS çalışmazsa butonlar normal bağlantıdır ve Jotform'u açar.
 */
(function () {
  'use strict';

  var FORM_ID = '262603393965061';
  var FORM_ORIGIN = 'https://form.jotform.com';
  var FORM_URL = FORM_ORIGIN + '/' + FORM_ID;
  /* Jotform'un gömme betiği: çerçevenin yüksekliğini formun sayfasına göre ayarlar. */
  var EMBED_HANDLER = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
  var FRAME_ID = 'JotFormIFrame-' + FORM_ID;

  var panel = document.getElementById('basvuru');
  var frameBox = panel && panel.querySelector('[data-form-frame]');
  var status = panel && panel.querySelector('[data-form-status]');
  var title = document.getElementById('basvuru-baslik');
  var openers = document.querySelectorAll('[data-open-form]');
  var closer = panel && panel.querySelector('[data-close-form]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false; // form bir kez yüklenir; kapatılıp açılınca kaldığı yerden devam eder
  var lastOpener = null;

  /* ---- Form ---------------------------------------------------------------- */

  /*
   * Formu yükler. Sıra önemli: önce Jotform'un gömme betiği, sonra çerçeve.
   * Betik, çerçevenin adresine kendi parametrelerini ekleyip çerçeveyi
   * yenisiyle değiştirir. Çerçeve betikten önce eklenirse form iki kez
   * yüklenir; birlikte, aynı anda verilirse tek yüklemede açılır.
   */
  function loadForm() {
    started = true;

    var script = document.createElement('script');
    script.src = EMBED_HANDLER;
    script.onload = function () {
      addFrame(FORM_URL);
      if (typeof window.jotformEmbedHandler === 'function') {
        window.jotformEmbedHandler("iframe[id='" + FRAME_ID + "']", FORM_ORIGIN + '/');
      }
    };
    // Betik yüklenemezse form yine açılır; yüksekliği aşağıdaki yedek dinleyici ayarlar.
    script.onerror = function () {
      addFrame(FORM_URL + '?isIframeEmbed=1&parentURL=' + encodeURIComponent(window.location.href));
    };
    document.head.appendChild(script);
  }

  function addFrame(src) {
    var frame = document.createElement('iframe');
    frame.id = FRAME_ID;
    frame.title = 'Mahallece gönüllü başvuru formu';
    frame.src = src;
    frame.setAttribute('allow', 'geolocation; microphone; camera; fullscreen');
    frame.setAttribute('scrolling', 'no');
    frame.style.height = '720px'; // Jotform gerçek yüksekliği bildirene kadar
    frameBox.appendChild(frame);
  }

  function formReady() {
    if (status) status.hidden = true;
  }

  // "load" olayı yukarı kabarcıklanmaz; yakalama aşamasında dinlenir. Böylece
  // Jotform'un betiği çerçeveyi yenisiyle değiştirse de yükleme yazısı kalkar.
  if (frameBox) frameBox.addEventListener('load', formReady, true);

  /*
   * Yedek: Jotform'un betiği yüklenemese de çerçeve formun boyuna uysun.
   * Form, "setHeight:1234:<formId>" biçiminde ileti gönderir.
   */
  window.addEventListener('message', function (event) {
    var frame = frameBox && frameBox.querySelector('iframe');
    if (!frame || typeof event.data !== 'string') return;
    if (!/^https:\/\/([a-z0-9-]+\.)*jotform\.com$/.test(event.origin)) return;

    formReady();
    var parts = event.data.split(':');
    if (parts[0] !== 'setHeight') return;
    if (parts[2] && parts[2] !== FORM_ID) return;

    var height = parseInt(parts[1], 10);
    if (height > 0) frame.style.height = height + 'px';
  });

  function setExpanded(open) {
    for (var i = 0; i < openers.length; i++) openers[i].setAttribute('aria-expanded', String(open));
  }

  function openForm(event) {
    if (event) {
      event.preventDefault();
      lastOpener = event.currentTarget;
    }
    panel.hidden = false;
    if (!started) loadForm();
    setExpanded(true);
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    // Ekran okuyucu ve klavye kullanıcıları formun başına gelsin.
    title.focus({ preventScroll: true });
  }

  function closeForm() {
    // Çerçeve silinmez: yeniden açılınca doldurulan yerden devam edilir.
    panel.hidden = true;
    setExpanded(false);
    var target = lastOpener || openers[openers.length - 1];
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }

  if (panel && frameBox) {
    for (var i = 0; i < openers.length; i++) openers[i].addEventListener('click', openForm);
    if (closer) closer.addEventListener('click', closeForm);
    // Doğrudan forma götüren bağlantı: …/#basvuru
    if (window.location.hash === '#basvuru') openForm();
  }

  /* ---- Bölümlerin belirmesi -------------------------------------------------- */

  var reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add('is-visible');
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Aynı anda görünenler (ör. dört hedef kartı) sırayla gelir.
        entry.target.style.setProperty('--reveal-delay', order * 0.08 + 's');
        order += 1;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  for (var k = 0; k < reveals.length; k++) observer.observe(reveals[k]);
})();
