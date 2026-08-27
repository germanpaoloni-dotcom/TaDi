const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { halloweenSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "hall-noche-embrujada";

const sampleData = {
  nombre: "Noche de Brujas en lo de los Fernández",
  fecha: "2027-10-31",
  hora: "20:00",
  lugar: "Quinta El Cuervo, San Isidro",
  direccionMapa: "https://www.google.com/maps/search/?api=1&query=Quinta+El+Cuervo+San+Isidro",
  mensaje: "Cuando cae la noche y sale la luna llena, las puertas de esta casa se abren para los más valientes. Traigan su disfraz más terrorífico: hay sidra de manzana, algo rico para comer y música hasta que salgan los fantasmas a bailar.",
  disfraz: "Disfraz obligatorio, cuanto más terrorífico mejor",
  whatsapp: "5491100000066",
  fechaLimiteRSVP: "2027-10-24",
  coverImage: "https://images.unsplash.com/photo-1477516561410-f0b5dd8319e4?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=800&q=80",
    "https://images.unsplash.com/photo-1476370648495-3533f64427a2?w=800&q=80",
    "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=800&q=80",
    "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=80",
  ],
};

// ---------- Motivos dibujados a mano en SVG inline (currentColor) ----------

// Murciélago: cuerpo central + alas en zigzag, silueta simple y prolija.
function batSVG(extraClass) {
  return `<svg class="bat ${extraClass || ""}" viewBox="0 0 32 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 8c-1-3-5-6-9-5 2 1 3 3 3 5-4-2-8-1-10 1 3 0 5 1 6 3-3 0-5 2-6 4 3-1 6-1 8 0-1 2-1 4 0 6 1-3 3-5 6-6 0 2 1 4 2 5 1-1 2-3 2-5 3 1 5 3 6 6 1-2 1-4 0-6 2-1 5-1 8 0-1-2-3-4-6-4 1-2 3-3 6-3-2-2-6-3-10-1 0-2 1-4 3-5-4-1-8 2-9 5z"/>
  </svg>`;
}

// Telaraña de rincón: hilos radiales + arcos concéntricos, para ubicar en
// esquinas (como un rincón de techo real donde una araña tejió su tela).
function webSVG(extraClass) {
  return `<svg class="web ${extraClass || ""}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1">
      <path d="M0 0L100 0M0 0L92 38M0 0L70 70M0 0L38 92M0 0L0 100"/>
      <path d="M18 0A18 18 0 0 1 0 18"/>
      <path d="M42 0A42 42 0 0 1 0 42"/>
      <path d="M68 0A68 68 0 0 1 0 68"/>
      <path d="M100 0A100 100 0 0 1 0 100"/>
    </g>
  </svg>`;
}

// Luna llena, con algunas manchas sutiles de cráteres.
function moonSVG() {
  return `<svg class="moon-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="100" r="92" fill="currentColor"/>
    <circle cx="68" cy="66" r="15" fill="rgba(20,10,35,.08)"/>
    <circle cx="132" cy="58" r="9" fill="rgba(20,10,35,.06)"/>
    <circle cx="122" cy="122" r="21" fill="rgba(20,10,35,.07)"/>
    <circle cx="58" cy="128" r="11" fill="rgba(20,10,35,.06)"/>
    <circle cx="145" cy="105" r="6" fill="rgba(20,10,35,.05)"/>
  </svg>`;
}

// Casa embrujada en silueta, con ventanas que brillan naranja.
function houseSVG() {
  return `<svg class="house-svg" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="currentColor">
      <path d="M40 220V128l68-40V50h20v26l34-28 34 28V50h20v38l68 40v92z"/>
      <rect x="184" y="150" width="34" height="70"/>
      <rect x="60" y="72" width="18" height="36"/>
      <polygon points="60,72 60,42 78,42 78,58"/>
    </g>
    <g class="house-windows" fill="var(--pumpkin)">
      <rect x="82" y="150" width="16" height="20" rx="1"/>
      <rect x="300" y="150" width="16" height="20" rx="1"/>
      <rect x="150" y="86" width="14" height="18" rx="1"/>
      <rect x="240" y="86" width="14" height="18" rx="1"/>
      <rect x="64" y="80" width="10" height="14" rx="1"/>
    </g>
  </svg>`;
}

// Vela con llama animable (clase .flame para el parpadeo por CSS).
function candleSVG(extraClass) {
  return `<svg class="candle ${extraClass || ""}" viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="6" y="60" width="12" height="4" rx="1" fill="currentColor" opacity=".55"/>
    <rect x="8" y="26" width="8" height="34" rx="1.5" fill="currentColor" opacity=".92"/>
    <line x1="12" y1="26" x2="12" y2="19" stroke="currentColor" stroke-width="1.2"/>
    <path class="flame" d="M12 2c3.4 4.6 4.6 8 4.6 10.8a4.6 4.6 0 1 1-9.2 0C7.4 10 8.6 6.6 12 2z" fill="var(--pumpkin-2)"/>
  </svg>`;
}

const pumpkinIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 3v2.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M8.2 4.4c1 .2 1.5 1.1 1.5 2M15.8 4.4c-1 .2-1.5 1.1-1.5 2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  <path d="M4 13.4c0-4.6 3.6-7.3 8-7.3s8 2.7 8 7.3-3.6 8.1-8 8.1-8-3.5-8-8.1z" stroke="currentColor" stroke-width="1.3"/>
  <path d="M12 6.5v14.8" stroke="currentColor" stroke-width="1"/>
  <path d="M8.5 12.4l1.6 2.1 1.6-2.1M12.3 12.4l1.6 2.1 1.6-2.1" fill="currentColor"/>
  <path d="M9 16.8c1 .8 2 1.2 3 1.2s2-.4 3-1.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
</svg>`;

const maskIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M4 10.2C4 6 7.6 3 12 3s8 3 8 7.2c0 5.3-3.2 9.4-8 9.4s-8-4.1-8-9.4z" stroke="currentColor" stroke-width="1.3"/>
  <path d="M8 10l2 2 2-2M14 10l2 2 2-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 16c1 1 2 1.6 3 1.6s2-.6 3-1.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

const clockIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.3"/>
  <path d="M12 7.4V12l3.2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const tombIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 21V11c0-3.3 2.7-6 6-6s6 2.7 6 6v10" stroke="currentColor" stroke-width="1.3"/>
  <path d="M4.5 21h15M10 12h4M10 15.2h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
</svg>`;

function sectionDivider() {
  return `<div class="s-divider" aria-hidden="true">
    <span class="s-divider-line"></span>
    <span class="s-divider-icon">${pumpkinIcon}</span>
    <span class="s-divider-line"></span>
  </div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ff7a1a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-emb");
  const gal = galleryWidget(d.galeria, "gal-emb");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    const dt = new Date(y, m - 1, day);
    if (isNaN(dt.getTime())) return d.fecha;
    return `${dias[dt.getDay()]} ${day} de ${meses[m - 1]} de ${y}`;
  })();

  // Capa fija de niebla (sólo CSS, gradientes desplazándose muy lento).
  const fogLayer = `<div class="fog-layer" aria-hidden="true">
    <div class="fog fog-1"></div>
    <div class="fog fog-2"></div>
    <div class="fog fog-3"></div>
  </div>`;

  // Capa fija de murciélagos volando — igual criterio que la nieve de
  // invierno-nevado.js: posiciones y tiempos generados acá, animación por CSS.
  const batConfigs = [
    { top: 9, size: 30, dur: 21, delay: -3, driftY: 42 },
    { top: 20, size: 20, dur: 27, delay: -11, driftY: -30 },
    { top: 4, size: 25, dur: 24, delay: -16, driftY: 28 },
    { top: 30, size: 17, dur: 31, delay: -6, driftY: -22 },
    { top: 15, size: 23, dur: 19, delay: -20, driftY: 34 },
    { top: 36, size: 15, dur: 34, delay: -9, driftY: -18 },
  ];
  const batsLayer = `<div class="bats-layer" aria-hidden="true">
    ${batConfigs.map((b, i) => `<span class="bat-wrap" style="top:${b.top}%;width:${b.size}px;animation-duration:${b.dur}s;animation-delay:${b.delay}s;--driftY:${b.driftY}px;">${batSVG("bat-" + i)}</span>`).join("")}
  </div>`;

  const cornerWebs = `<span class="corner-web cw-tl">${webSVG()}</span><span class="corner-web cw-tr">${webSVG()}</span>`;

  const candleRow = `<div class="candle-row" aria-hidden="true">${candleSVG("c1")}${candleSVG("c2")}${candleSVG("c3")}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombre)} — Halloween</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&amp;family=Cinzel:wght@400;500;600&amp;family=Jost:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --night-1:#1a0f2e;
    --night-2:#2c1a4d;
    --night-3:color-mix(in srgb, #2c1a4d, white 12%);
    --pumpkin:#ff7a1a;
    --pumpkin-2:#ff9a45;
    --toxic:#8fd94f;
    --cream:#f4ece0;
    --cream-dim:#cabfd8;
    --accent:${accent};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--night-1);color:var(--cream);font-family:'Jost',sans-serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,h3{font-family:'Cinzel',serif;font-weight:600;margin:0;}
  a{color:inherit;}

  /* ---------- NIEBLA (capa fija, decorativa, sólo CSS) ---------- */
  .fog-layer{position:fixed;left:0;right:0;bottom:0;height:42vh;pointer-events:none;z-index:4;overflow:hidden;}
  .fog{position:absolute;left:-25%;width:150%;height:70%;border-radius:50%;
    background:radial-gradient(ellipse at center, rgba(244,236,224,.10), transparent 65%);
    filter:blur(22px);animation:drift 42s ease-in-out infinite;}
  .fog-1{bottom:-6%;animation-duration:46s;opacity:.55;}
  .fog-2{bottom:2%;left:-45%;animation-duration:60s;animation-direction:reverse;opacity:.35;}
  .fog-3{bottom:10%;animation-duration:34s;opacity:.4;}
  @keyframes drift{0%{transform:translateX(-3%);}50%{transform:translateX(3%);}100%{transform:translateX(-3%);}}

  /* ---------- MURCIÉLAGOS (capa fija, decorativa, sólo CSS) ---------- */
  .bats-layer{position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden;}
  .bat-wrap{position:absolute;left:-10%;color:#0c0616;opacity:.8;animation-name:batFly;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
  .bat-wrap svg{display:block;width:100%;height:auto;}
  @keyframes batFly{
    0%{transform:translate(-10vw,0);}
    25%{transform:translate(30vw,var(--driftY));}
    50%{transform:translate(62vw,0);}
    75%{transform:translate(92vw,var(--driftY));}
    100%{transform:translate(118vw,0);}
  }
  @media (prefers-reduced-motion: reduce){
    .fog,.bat-wrap,.flame{animation:none !important;}
    .bat-wrap{display:none;}
  }

  /* ---------- TELARAÑAS DE RINCÓN ---------- */
  .corner-web{position:absolute;width:70px;height:70px;color:rgba(244,236,224,.5);pointer-events:none;z-index:2;}
  .corner-web svg{width:100%;height:100%;}
  @media(min-width:480px){.corner-web{width:96px;height:96px;}}
  .cw-tl{top:0;left:0;}
  .cw-tr{top:0;right:0;transform:scaleX(-1);}

  /* ---------- VELAS PARPADEANTES ---------- */
  .candle-row{display:flex;justify-content:center;gap:22px;margin-top:26px;}
  .candle{width:22px;height:58px;color:var(--cream-dim);}
  .flame{transform-origin:12px 10px;animation:flicker 2.6s ease-in-out infinite;}
  .candle.c2 .flame{animation-duration:2.1s;animation-delay:-.6s;}
  .candle.c3 .flame{animation-duration:3s;animation-delay:-1.3s;}
  @keyframes flicker{
    0%,100%{opacity:1;transform:scale(1) rotate(0deg);filter:brightness(1);}
    30%{opacity:.82;transform:scale(.94,1.04) rotate(-2deg);filter:brightness(1.15);}
    55%{opacity:1;transform:scale(1.05,.96) rotate(2deg);filter:brightness(.92);}
    80%{opacity:.9;transform:scale(.97,1.02) rotate(-1deg);filter:brightness(1.08);}
  }

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:100vh;
    display:flex;align-items:center;justify-content:center;text-align:center;
    padding:56px 20px 70px;overflow:hidden;
  }
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;
    background:
      linear-gradient(180deg, rgba(26,15,46,.72) 0%, rgba(26,15,46,.5) 40%, rgba(26,15,46,.95) 100%),
      linear-gradient(0deg, var(--night-1) 0%, transparent 22%);
  }
  .moon-wrap{position:absolute;top:6%;right:10%;width:120px;height:120px;color:#f3ecd8;opacity:.9;filter:drop-shadow(0 0 34px rgba(243,236,216,.45));}
  @media(min-width:480px){.moon-wrap{width:150px;height:150px;}}
  .moon-wrap svg{width:100%;height:100%;display:block;}
  .house-wrap{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(560px,92vw);color:#0c0616;opacity:.92;}
  .house-wrap svg{width:100%;height:auto;display:block;}

  .hero-content{position:relative;z-index:1;max-width:600px;}
  .eyebrow{text-transform:uppercase;letter-spacing:.38em;font-size:clamp(.62rem,1.7vw,.78rem);color:var(--toxic);margin:0 0 14px;}
  .hero-content h1{font-family:'Cinzel Decorative',serif;font-weight:700;font-size:clamp(2rem,7.6vw,3.4rem);line-height:1.22;color:var(--cream);text-shadow:0 4px 30px rgba(0,0,0,.55);}
  .hero-date{margin:20px 0 0;letter-spacing:.2em;text-transform:capitalize;font-size:clamp(.8rem,2vw,.98rem);color:var(--cream-dim);}
  .hero-meta{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 26px;margin-top:16px;color:var(--cream-dim);font-size:.9rem;}
  .hero-meta span{display:inline-flex;align-items:center;gap:7px;}
  .hero-meta svg{width:16px;height:16px;color:var(--pumpkin);flex-shrink:0;}

  /* ---------- SECCIONES ---------- */
  section{max-width:740px;margin:0 auto;padding:70px 24px;text-align:center;position:relative;}
  h2{letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.05rem,2.8vw,1.5rem);color:var(--pumpkin-2);margin-bottom:8px;}
  .s-divider{display:flex;align-items:center;gap:14px;max-width:220px;margin:0 auto 30px;}
  .s-divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);}
  .s-divider-icon{width:22px;height:22px;color:var(--accent);flex-shrink:0;}
  .s-divider-icon svg{width:100%;height:100%;}

  /* ---------- COUNTDOWN (widget) ---------- */
  .countdown{display:flex;gap:clamp(10px,3.5vw,22px);justify-content:center;flex-wrap:wrap;margin:6px 0 4px;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;min-width:66px;
    background:linear-gradient(160deg, var(--night-2), var(--night-1));
    border:1px solid color-mix(in srgb, var(--accent) 55%, transparent);
    border-radius:6px;padding:16px 10px 12px;position:relative;
    box-shadow:0 10px 26px rgba(0,0,0,.4);
  }
  @media(min-width:480px){.countdown div{min-width:82px;padding:20px 14px 14px;}}
  .cd-num{font-family:'Cinzel',serif;font-size:clamp(1.6rem,4.6vw,2.3rem);color:var(--pumpkin-2);line-height:1;}
  .cd-label{margin-top:8px;font-size:.62rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--cream-dim);}

  /* ---------- MENSAJE ---------- */
  .quote-wrap{max-width:600px;margin:0 auto;}
  .quote-wrap p{font-family:'Cinzel',serif;font-weight:400;font-style:italic;font-size:clamp(1rem,2.4vw,1.22rem);line-height:1.85;color:var(--cream);}
  .quote-wrap p::before{content:"“";color:var(--accent);}
  .quote-wrap p::after{content:"”";color:var(--accent);}

  /* ---------- DÓNDE Y CUÁNDO ---------- */
  .venue-card{
    display:inline-block;text-align:center;background:var(--night-2);
    border:1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius:8px;padding:32px 34px;box-shadow:0 12px 30px rgba(0,0,0,.4);max-width:420px;
  }
  .venue-card h3{font-size:1.15rem;color:var(--cream);margin-bottom:10px;}
  .venue-card p{margin:0 0 6px;color:var(--cream-dim);line-height:1.7;}
  .maplink{display:inline-flex;align-items:center;gap:7px;margin-top:14px;color:var(--pumpkin-2);text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:2px;font-size:.9rem;}
  .maplink svg{width:15px;height:15px;}

  /* ---------- DISFRAZ ---------- */
  .disfraz-card{
    display:inline-flex;align-items:center;gap:18px;text-align:left;
    background:var(--night-2);border:1px solid color-mix(in srgb, var(--toxic) 45%, transparent);
    border-radius:8px;padding:22px 30px;max-width:480px;box-shadow:0 12px 30px rgba(0,0,0,.4);
  }
  .disfraz-icon{width:44px;height:44px;border-radius:50%;background:var(--night-1);color:var(--toxic);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid color-mix(in srgb, var(--toxic) 55%, transparent);}
  .disfraz-icon svg{width:24px;height:24px;}
  .disfraz-text .disfraz-label{display:block;text-transform:uppercase;letter-spacing:2px;font-size:.64rem;color:var(--toxic);margin-bottom:6px;}
  .disfraz-text p{margin:0;color:var(--cream);line-height:1.6;font-size:.98rem;}

  /* ---------- GALERÍA (widget) ---------- */
  .dark-section{position:relative;max-width:none;background:
      radial-gradient(circle at 12% 12%, rgba(143,217,79,.05), transparent 40%),
      radial-gradient(circle at 90% 85%, rgba(255,122,26,.06), transparent 42%),
      linear-gradient(160deg,var(--night-2),var(--night-1) 60%);
    padding:70px 24px;}
  .dark-section > *{max-width:740px;margin-left:auto;margin-right:auto;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px;}
  .gallery-item{border-radius:6px;overflow:hidden;border:1px solid color-mix(in srgb, var(--accent) 35%, transparent);}
  .gallery img{width:100%;height:165px;object-fit:cover;display:block;cursor:pointer;filter:saturate(1.05) brightness(.95);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,6,18,.95);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--cream);font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP (widget) ---------- */
  .rsvp-deadline{color:var(--pumpkin-2);font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 26px;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1.4px;color:var(--cream-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Jost',sans-serif;font-size:.95rem;margin-top:6px;width:100%;
    background:var(--night-2);color:var(--cream);
    border:1px solid color-mix(in srgb, var(--accent) 40%, transparent);border-radius:4px;padding:11px 12px;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#8f83a6;}
  .rsvp-form button{
    background:var(--accent);color:#1a0f2e;border:0;border-radius:4px;padding:14px;
    letter-spacing:2px;text-transform:uppercase;font-size:.8rem;font-weight:600;cursor:pointer;
    transition:filter .2s;
  }
  .rsvp-form button:hover{filter:brightness(1.1);}
  .rsvp-whatsapp{text-align:center;font-size:.86rem;color:var(--toxic);text-decoration:none;border-bottom:1px solid var(--toxic);padding-bottom:2px;align-self:center;}
  .rsvp-status{text-align:center;color:var(--toxic);font-weight:600;letter-spacing:.5px;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;text-align:center;padding:54px 22px 62px;background:var(--night-2);border-top:1px solid color-mix(in srgb, var(--accent) 30%, transparent);}
  footer .footer-icon{width:34px;height:34px;color:var(--pumpkin-2);margin:0 auto 16px;}
  footer .thanks{font-family:'Cinzel Decorative',serif;font-weight:700;font-size:1.15rem;color:var(--cream);margin:0;letter-spacing:.5px;}
  footer .thanks-sub{margin:10px 0 0;color:var(--cream-dim);font-size:.9rem;}
</style></head>
<body>

  ${fogLayer}
  ${batsLayer}

  <div class="hero">
    <div class="hero-bg"></div>
    <span class="moon-wrap">${moonSVG()}</span>
    <span class="house-wrap">${houseSVG()}</span>
    ${cornerWebs}
    <div class="hero-content">
      <p class="eyebrow">Noche de Halloween</p>
      <h1>${esc(d.nombre)}</h1>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-meta">
        ${d.hora ? `<span>${clockIcon}${esc(d.hora)} hs</span>` : ""}
        ${d.lugar ? `<span>${tombIcon}${esc(d.lugar)}</span>` : ""}
      </div>
      ${candleRow}
    </div>
  </div>

  <section>
    ${sectionDivider()}
    <h2>Faltan para la noche de terror</h2>
    ${cd.html}
  </section>

  ${d.mensaje ? `<section>
    ${sectionDivider()}
    <div class="quote-wrap"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  ${(d.lugar || d.hora || d.direccionMapa) ? `<section>
    ${sectionDivider()}
    <h2>Dónde y cuándo</h2>
    <div class="venue-card">
      ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
      <p>${d.hora ? `Te esperamos a las ${esc(d.hora)} hs, si te animás` : "Horario a confirmar"}</p>
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">${tombIcon}Ver ubicación en el mapa &rarr;</a>` : ""}
    </div>
  </section>` : ""}

  ${d.disfraz ? `<section>
    ${sectionDivider()}
    <div class="disfraz-card">
      <div class="disfraz-icon">${maskIcon}</div>
      <div class="disfraz-text">
        <span class="disfraz-label">Consigna de disfraz</span>
        <p>${esc(d.disfraz)}</p>
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section class="dark-section">
    ${cornerWebs}
    ${sectionDivider()}
    <h2>Fotos que dan miedo</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${sectionDivider()}
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}, si sos de los valientes</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <div class="footer-icon">${pumpkinIcon}</div>
    <p class="thanks">Los esperamos con las luces bajas</p>
    <p class="thanks-sub">${esc(d.nombre)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const accent = d.accent || "#ff7a1a";
  const accent2 = d.accent2 || "#2c1a4d";
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
    background:linear-gradient(160deg, ${accent2} 0%, #1a0f2e 100%);">
    <svg viewBox="0 0 200 200" width="46" height="46" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:14px;right:20px;opacity:.9;">
      <circle cx="100" cy="100" r="92" fill="#f4ece0"/>
      <circle cx="68" cy="66" r="15" fill="rgba(20,10,35,.08)"/>
      <circle cx="122" cy="122" r="21" fill="rgba(20,10,35,.07)"/>
    </svg>
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${accent};">
      <path d="M4 13.4c0-4.6 3.6-7.3 8-7.3s8 2.7 8 7.3-3.6 8.1-8 8.1-8-3.5-8-8.1z" stroke="${accent}" stroke-width="1.6"/>
      <path d="M12 6.5v14.8" stroke="${accent}" stroke-width="1.3"/>
      <path d="M8.5 12.4l1.6 2.1 1.6-2.1M12.3 12.4l1.6 2.1 1.6-2.1" fill="${accent}"/>
      <path d="M9 16.8c1 .8 2 1.2 3 1.2s2-.4 3-1.2" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:1.05rem;color:#f4ece0;line-height:1.15;text-align:center;padding:0 20px;">${esc(d.name)}</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:.82rem;color:${accent};">noche embrujada</div>
  </div>`;
}

module.exports = {
  id, category: "halloween", name: "Noche Embrujada",
  summary: "Violeta noche y naranja calabaza con toques de verde tóxico: casa embrujada, luna llena, niebla y murciélagos animados para la fiesta de Halloween más elaborada.",
  accent: "#ff7a1a", accent2: "#2c1a4d", schema: halloweenSchema, sampleData, render, cardPreview,
};
