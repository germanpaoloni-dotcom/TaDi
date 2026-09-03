/* ============================================================
   Intro cinemática de marca — TaDi
   ------------------------------------------------------------
   Solo corre en la home ("/"), solo en la primera visita
   (localStorage), y solo si el visitante no pidió menos
   movimiento (prefers-reduced-motion). Nunca bloquea ni
   retrasa el resto de la página: el overlay vive encima del
   contenido ya renderizado y simplemente se descarta al
   terminar (o al saltarla).
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "tadiIntroSeenV1";
  var forceShow = /(?:^|[?&])intro=1(?:&|$)/.test(location.search);
  var alreadySeen = false;
  try { alreadySeen = !!localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (location.pathname !== "/" || (alreadySeen && !forceShow)) return;

  var overlay = document.getElementById("tadiIntro");
  if (!overlay) return;

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}

  overlay.hidden = false;
  document.documentElement.classList.add("intro-lock");

  var skipBtn = overlay.querySelector(".intro-skip");
  var soundBtn = overlay.querySelector(".intro-sound");
  var ring = overlay.querySelector(".intro-ring");
  var seal = overlay.querySelector(".intro-seal");
  var logoRing = overlay.querySelector(".intro-logo .grp-ring circle");
  var timers = [];
  var finished = false;

  function setPhase(p) { overlay.setAttribute("data-phase", p); }

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function finish(instant) {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    stopSound();
    if (instant) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.classList.remove("intro-lock");
      return;
    }
    overlay.classList.add("intro-out");
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.classList.remove("intro-lock");
    }, 480);
  }

  skipBtn.addEventListener("click", function () { finish(false); });

  // Versión sin movimiento: sin animación, sin sonido, se retira casi
  // al instante — respeta la preferencia del visitante sin dejar de
  // marcar la visita como "ya vista".
  if (reduceMotion) {
    overlay.hidden = false;
    setPhase("hold");
    at(650, function () { finish(true); });
    return;
  }

  /* ---------------- FLIP: el anillo viaja del sello del sobre
     hasta su posición real dentro del wordmark ---------------- */
  function flipRingTo(targetEl) {
    if (!targetEl || !ring) return;
    var from = seal.getBoundingClientRect();
    var to = targetEl.getBoundingClientRect();
    var fromCenterX = from.left + from.width / 2;
    var fromCenterY = from.top + from.height / 2;
    var toCenterX = to.left + to.width / 2;
    var toCenterY = to.top + to.height / 2;
    var scale = Math.max(to.width, 1) / Math.max(ring.offsetWidth, 1);

    ring.style.left = toCenterX + "px";
    ring.style.top = toCenterY + "px";
    ring.style.transform =
      "translate(-50%,-50%) translate(" + (fromCenterX - toCenterX) + "px," + (fromCenterY - toCenterY) + "px) scale(" + (1 / scale) + ")";
    // reflow forzado para que el navegador registre el estado inicial
    // antes de animar hacia el estado final (si no, no hay transición).
    // eslint-disable-next-line no-unused-expressions
    ring.offsetHeight;
    ring.style.transform = "translate(-50%,-50%) translate(0,0) scale(1)";
    ring.style.width = to.width + "px";
    ring.style.height = to.height + "px";
  }

  /* ------------------------- sonido -------------------------
     Web Audio API, 100% sintetizado (sin archivos de audio).
     Nunca bloquea la animación visual: si el navegador frena el
     autoplay, la intro sigue igual, solo que en silencio, con
     un ícono discreto para activar el sonido a mano.           */
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var actx = null, master = null, muted = false, audioReady = false;

  function initAudio() {
    if (!AudioCtx || actx) return;
    try {
      actx = new AudioCtx();
      master = actx.createGain();
      master.gain.value = 0.32;
      master.connect(actx.destination);
    } catch (e) { actx = null; }
  }

  function tone(freq, startAt, dur, opts) {
    if (!actx || muted) return;
    opts = opts || {};
    var type = opts.type || "sine";
    var peak = opts.gain != null ? opts.gain : 0.12;
    var attack = opts.attack != null ? opts.attack : 0.012;
    var t0 = actx.currentTime + startAt;
    var osc = actx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(opts.freqFrom || freq, t0);
    if (opts.freqTo) osc.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + dur);
    var filt = null, node = osc;
    if (opts.filterFreq) {
      filt = actx.createBiquadFilter();
      filt.type = opts.filterType || "lowpass";
      filt.frequency.value = opts.filterFreq;
      osc.connect(filt);
      node = filt;
    }
    var g = actx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noiseBurst(startAt, dur, peak, filterFreq, filterType) {
    if (!actx || muted) return;
    var t0 = actx.currentTime + startAt;
    var len = Math.max(1, Math.floor(actx.sampleRate * dur));
    var buf = actx.createBuffer(1, len, actx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = actx.createBufferSource();
    src.buffer = buf;
    var filt = actx.createBiquadFilter();
    filt.type = filterType || "bandpass";
    filt.frequency.value = filterFreq || 2000;
    var g = actx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.04, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  function scheduleSound() {
    if (!actx) return;
    noiseBurst(0.05, 1.0, 0.05, 700, "lowpass");            // atmósfera
    noiseBurst(0.45, 0.22, 0.11, 3200, "bandpass");          // aparece el sobre
    tone(220, 1.2, 0.16, { type: "sine", gain: 0.09, filterFreq: 1200 }); // se abre
    noiseBurst(1.2, 0.16, 0.06, 2000, "highpass");
    tone(320, 2.05, 0.85, { type: "sine", gain: 0.075, freqFrom: 320, freqTo: 980, filterFreq: 2600 }); // giro del anillo
    tone(392.0, 2.85, 0.55, { type: "triangle", gain: 0.12, filterFreq: 2200 });  // "Ta"
    tone(523.25, 3.0, 0.65, { type: "triangle", gain: 0.13, filterFreq: 2600 });  // "Di"
    noiseBurst(3.55, 0.35, 0.045, 6500, "highpass");         // brillo final
  }

  function stopSound() {
    if (master && actx) {
      try {
        var t = actx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0, t + 0.15);
      } catch (e) {}
    }
  }

  initAudio();
  if (actx) {
    actx.resume().then(function () {
      audioReady = actx.state === "running";
      if (audioReady) scheduleSound();
    }).catch(function () {});
  }

  soundBtn.addEventListener("click", function () {
    muted = !muted;
    soundBtn.setAttribute("data-muted", muted ? "1" : "0");
    soundBtn.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
    if (!muted && actx && actx.state !== "running") {
      actx.resume().then(function () {
        audioReady = actx.state === "running";
      }).catch(function () {});
    }
    if (master && actx) {
      try { master.gain.setTargetAtTime(muted ? 0 : 0.32, actx.currentTime, 0.05); } catch (e) {}
    }
  });

  /* ------------------------- timeline ------------------------- */
  setPhase("atmosphere");
  at(250, function () { setPhase("envelope"); });
  at(1100, function () { setPhase("unfold"); });
  at(1950, function () {
    setPhase("transform");
    flipRingTo(logoRing);
  });
  at(2800, function () { setPhase("reveal"); });
  at(3500, function () { setPhase("shine"); });
  at(4000, function () { setPhase("hold"); });
  at(4900, finish);
})();
