const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-tropical-sunset";

const sampleData = {
  nombre: "Juanpa",
  edad: "35",
  fecha: "2027-02-13",
  hora: "18:00",
  lugar: "El Farolito Beach Club, Pinamar",
  direccionMapa: "https://maps.google.com/?q=Beach+Club+Pinamar",
  mensaje: "Un año más, un atardecer menos para desperdiciar. Vengan con onda, con ganas de bailar descalzos y a brindar conmigo mirando el sol caer sobre el mar.",
  dressCode: "Colores tropicales, ropa de verano — nada de trajes",
  whatsapp: "5491100000035",
  fechaLimiteRSVP: "2027-02-06",
  coverImage: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1400&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
    "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&q=80",
  ],
};

// Tragos fijos del diseño (no vienen del schema): cócteles tropicales
// inventados para la sección "Tragos de la casa".
const TRAGOS = [
  { emoji: "🍍", nombre: "Piña Colada de Autor", desc: "Ron añejo, piña bien madura y crema de coco, con un toque de vainilla." },
  { emoji: "🍹", nombre: "Mojito de Maracuyá", desc: "Ron blanco, maracuyá fresco, menta de la huerta y soda bien helada." },
  { emoji: "🌅", nombre: "Atardecer Tropical", desc: "Tequila, jugo de naranja y granadina en capas — se brinda mirando el sol caer." },
  { emoji: "🍸", nombre: "Sunset Spritz Sin Alcohol", desc: "Pomelo rosado, jengibre y soda: la opción fresca para los que no toman." },
];

// Hoja de palmera dibujada a mano en SVG: un abanico de foliolos con
// relleno sólido en degradé (verde → turquesa), sin líneas finas ni
// dependencias externas. `uid` evita que los ids de gradiente choquen
// cuando se dibuja más de una hoja en la misma página.
function palmFrondSVG(uid, colorA, colorB, mirror) {
  const gid = `leafGrad-${uid}`;
  const angles = [-70, -46, -22, 2, 26, 50, 74];
  const leaves = angles
    .map((angle) => {
      const len = 108 - Math.abs(angle - 2) * 0.45;
      return `<g transform="rotate(${angle})"><path d="M0,0 C-20,${-len * 0.32} -12,${-len * 0.72} 0,${-len} C12,${-len * 0.72} 20,${-len * 0.32} 0,0 Z" fill="url(#${gid})"/></g>`;
    })
    .join("");
  return `<svg class="frond${mirror ? " mirror" : ""}" viewBox="-96 -112 192 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="-112" x2="0" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${colorA}"/>
        <stop offset="1" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <path d="M0,14 C-5,-28 -3,-70 0,-102" stroke="${colorB}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${leaves}
  </svg>`;
}

// Sol/círculo decorativo con degradé radial cítrico.
function sunSVG(uid, colorA, colorB) {
  const gid = `sunGrad-${uid}`;
  return `<svg class="sun-badge" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="${gid}" cx="48%" cy="42%" r="62%">
        <stop offset="0%" stop-color="#FFF3D6"/>
        <stop offset="48%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="96" fill="url(#${gid})"/>
  </svg>`;
}

// Pequeño ícono de ubicación (pin) con relleno sólido, para la tarjeta de datos.
function pinSVG(color) {
  return `<svg class="pin" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 2 C31 2 39 10 39 21 C39 35 20 50 20 50 C20 50 1 35 1 21 C1 10 9 2 20 2 Z" fill="${color}"/>
    <circle cx="20" cy="21" r="8" fill="#FFF8EE"/>
  </svg>`;
}

function divider() {
  return `<div class="divider"><span class="wave">🌊</span><span class="divider-line"></span><span class="wave">🌊</span></div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#FF6B4A");
  const accent2 = "#17B8A6";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "18:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-trop");
  const gal = galleryWidget(d.galeria, "gal-trop");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "cumpleanos", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --coral:${accent};
    --turquoise:${accent2};
    --sunset-1:#FFD37A;
    --sunset-2:${accent};
    --sunset-3:#FF4F6D;
    --sunset-4:${accent2};
    --sunset-5:#0E8F82;
    --cream:#FFF8EE;
    --cream-dim:rgba(255,248,238,.82);
    --ink:#2A2A2A;
    --panel:rgba(255,255,255,.18);
    --panel-strong:rgba(255,255,255,.94);
    --panel-border:rgba(255,255,255,.4);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Nunito',system-ui,sans-serif;font-weight:600;color:var(--cream);
    background:linear-gradient(180deg,var(--sunset-1) 0%,var(--sunset-2) 26%,var(--sunset-3) 46%,var(--sunset-4) 74%,var(--sunset-5) 100%);}
  img{max-width:100%;}
  a{color:inherit;}
  h1,h2,h3{font-family:'Baloo 2','Nunito',system-ui,sans-serif;font-weight:800;}

  .frond{position:absolute;width:clamp(120px,26vw,220px);height:auto;filter:drop-shadow(0 10px 18px rgba(0,0,0,.18));}
  .frond.mirror{transform:scaleX(-1);}
  .sun-badge{position:absolute;width:clamp(220px,46vw,420px);height:auto;opacity:.85;}
  .pin{width:36px;height:auto;flex:0 0 auto;}

  /* brisa suave sobre las hojas de palmera del hero, y resplandor tenue del sol */
  @keyframes frond-sway{0%,100%{transform:rotate(-2.5deg);}50%{transform:rotate(2.5deg);}}
  @keyframes frond-sway-mirror{0%,100%{transform:scaleX(-1) rotate(1.5deg);}50%{transform:scaleX(-1) rotate(6.5deg);}}
  @keyframes sun-glow{0%,100%{transform:translateX(-50%) scale(1);opacity:.85;filter:drop-shadow(0 0 0 rgba(255,211,122,0));}50%{transform:translateX(-50%) scale(1.015);opacity:.95;filter:drop-shadow(0 0 30px rgba(255,211,122,.5));}}
  .hero .frond.tl{transform-origin:50% 92%;animation:frond-sway 8s ease-in-out infinite;animation-delay:.3s;}
  .hero .frond.br{transform-origin:50% 92%;animation:frond-sway-mirror 9.5s ease-in-out infinite;animation-delay:1.6s;}
  .hero .sun-badge{animation:sun-glow 10s ease-in-out infinite;}
  @media (prefers-reduced-motion: reduce){
    .hero .frond.tl,.hero .frond.br,.hero .sun-badge{animation:none;}
  }

  .divider{display:flex;align-items:center;justify-content:center;gap:10px;max-width:220px;margin:0 auto 26px;}
  .divider-line{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.5);}
  .wave{font-size:1.1rem;}

  /* ---------- HERO ---------- */
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:70px 18px;text-align:center;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,143,90,.35) 0%,rgba(255,79,109,.55) 45%,rgba(14,143,130,.82) 100%);}
  .hero .sun-badge{top:6%;left:50%;transform:translateX(-50%);z-index:1;}
  .hero .frond.tl{top:-18px;left:-26px;z-index:2;}
  .hero .frond.br{bottom:-18px;right:-26px;transform:scaleX(-1) rotate(4deg);z-index:2;}
  .hero-panel{position:relative;z-index:3;max-width:520px;width:100%;background:var(--panel);border:1.5px solid var(--panel-border);backdrop-filter:blur(6px);border-radius:34px;padding:clamp(30px,7vw,48px) clamp(22px,6vw,38px);box-shadow:0 20px 50px rgba(0,0,0,.18);}
  .eyebrow{letter-spacing:.14em;text-transform:uppercase;font-weight:800;font-size:clamp(.72rem,2vw,.86rem);color:#FFF3D6;margin:0 0 8px;}
  .hero-panel h1{font-size:clamp(2.6rem,10vw,4.4rem);margin:0 0 6px;line-height:1;color:var(--cream);text-shadow:0 6px 18px rgba(0,0,0,.22);}
  .hero-age{display:inline-block;margin:6px 0 14px;padding:8px 22px;border-radius:999px;background:var(--sunset-1);color:#7a3d00;font-weight:800;font-size:clamp(1rem,3vw,1.3rem);}
  .hero-msg{font-size:clamp(.94rem,2.6vw,1.08rem);line-height:1.65;color:var(--cream-dim);margin:0 0 16px;font-weight:600;}
  .hero-date{display:inline-block;padding:9px 20px;border-radius:999px;background:rgba(255,255,255,.22);border:1px solid var(--panel-border);letter-spacing:.04em;font-weight:700;font-size:clamp(.78rem,2.2vw,.92rem);}

  section{padding:76px 20px;text-align:center;position:relative;overflow:hidden;}
  .sec-inner{max-width:760px;margin:0 auto;position:relative;z-index:1;}
  .kicker{letter-spacing:.24em;text-transform:uppercase;font-size:.7rem;font-weight:800;color:#FFF3D6;margin:0 0 8px;}
  h2{font-size:clamp(1.7rem,5vw,2.4rem);margin:0 0 10px;color:var(--cream);text-shadow:0 4px 12px rgba(0,0,0,.18);}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:clamp(10px,3.5vw,20px);justify-content:center;flex-wrap:wrap;margin-top:10px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:72px;background:var(--panel-strong);border-radius:20px;padding:16px 14px;box-shadow:0 10px 24px rgba(0,0,0,.16);}
  .countdown div:nth-child(1) .cd-num{color:var(--coral);}
  .countdown div:nth-child(2) .cd-num{color:var(--turquoise);}
  .countdown div:nth-child(3) .cd-num{color:#FF4F6D;}
  .countdown div:nth-child(4) .cd-num{color:#E0A62A;}
  .cd-num{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:clamp(1.7rem,5vw,2.5rem);line-height:1;}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:1.4px;color:#6b5a4a;margin-top:6px;font-weight:800;}

  /* ---------- DATOS ---------- */
  .datos-card{display:inline-flex;flex-direction:column;align-items:center;gap:10px;background:var(--panel-strong);border-radius:28px;padding:34px 32px;max-width:100%;box-shadow:0 14px 30px rgba(0,0,0,.16);color:var(--ink);}
  .datos-card .lugar{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:clamp(1.15rem,3.4vw,1.5rem);color:#c14a2c;}
  .datos-card .cuando{color:#6b5a4a;font-weight:700;font-size:.96rem;}
  .maplink{display:inline-block;margin-top:10px;padding:11px 24px;background:linear-gradient(90deg,var(--coral),var(--turquoise));color:#fff !important;text-decoration:none;border-radius:999px;font-weight:800;font-size:.86rem;box-shadow:0 8px 18px rgba(0,0,0,.14);}
  .dress-note{margin-top:14px;padding-top:14px;border-top:2px dashed rgba(0,0,0,.12);width:100%;}
  .dress-note .label{display:block;letter-spacing:1.6px;text-transform:uppercase;font-size:.66rem;font-weight:800;color:var(--turquoise);margin-bottom:6px;}
  .dress-note p{margin:0;color:#6b5a4a;font-weight:700;font-size:.92rem;}

  /* ---------- TRAGOS ---------- */
  .tragos-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-top:14px;text-align:left;}
  .trago-card{background:var(--panel-strong);border-radius:22px;padding:24px 22px;color:var(--ink);box-shadow:0 12px 26px rgba(0,0,0,.15);}
  .trago-card .emoji{font-size:1.9rem;display:block;margin-bottom:10px;}
  .trago-card h3{margin:0 0 8px;font-size:1.05rem;color:#c14a2c;}
  .trago-card p{margin:0;line-height:1.6;font-size:.88rem;color:#6b5a4a;font-weight:600;}
  .trago-card:nth-child(2n) h3{color:#0f8577;}

  /* ---------- GALERIA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px;}
  .gallery-item{border-radius:18px;overflow:hidden;border:2px solid rgba(255,255,255,.4);}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,10,10,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:14px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* ---------- RSVP ---------- */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:16px auto 0;text-align:left;background:var(--panel-strong);border-radius:26px;padding:28px 26px;color:var(--ink);box-shadow:0 14px 30px rgba(0,0,0,.18);}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:.06em;color:#8a7563;font-weight:800;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Nunito',sans-serif;padding:11px 12px;border:2px solid rgba(0,0,0,.08);border-radius:14px;margin-top:5px;width:100%;background:#fff;color:var(--ink);}
  .rsvp-form button{background:linear-gradient(90deg,var(--coral),#FF4F6D);color:#fff;border:0;padding:14px;border-radius:999px;letter-spacing:.03em;text-transform:uppercase;cursor:pointer;font-size:.86rem;font-weight:800;box-shadow:0 10px 20px rgba(255,79,109,.35);}
  .rsvp-form button:hover{filter:brightness(1.06);}
  .rsvp-whatsapp{font-size:.86rem;color:#0f8577;text-align:center;text-decoration:none;font-weight:800;}
  .rsvp-status{text-align:center;color:#0f8577;font-weight:800;}

  /* ---------- FOOTER ---------- */
  footer{text-align:center;padding:50px 22px 44px;position:relative;overflow:hidden;}
  footer .frond{position:static;width:56px;filter:none;}
  footer .foot-fronds{display:flex;justify-content:center;align-items:flex-end;gap:16px;margin-bottom:12px;}
  footer p{margin:0;font-weight:700;color:var(--cream);}
  footer .brand{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.4rem;color:#FFF3D6;margin-bottom:6px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    ${sunSVG("hero", "#FFD37A", accent)}
    <div class="frond tl">${palmFrondSVG("tl", "#0E8F82", accent2)}</div>
    <div class="frond br mirror">${palmFrondSVG("br", "#0E8F82", accent2)}</div>
    <div class="hero-panel">
      <p class="eyebrow">¡Cumple tropical!</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">Cumple ${esc(d.edad)}</div>` : ""}
      ${d.mensaje ? `<p class="hero-msg">${esc(d.mensaje)}</p>` : ""}
      ${fechaLarga ? `<div class="hero-date">${esc(fechaLarga)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>` : ""}
    </div>
  </div>

  <section>
    <div class="sec-inner">
      <p class="kicker">Faltan solo</p>
      <h2>Cuenta regresiva para el brindis</h2>
      ${divider()}
      ${cd.html}
    </div>
  </section>

  ${(d.lugar || d.hora || d.direccionMapa || d.dressCode || fechaLarga) ? `
  <section>
    <div class="sec-inner">
      <p class="kicker">Anotá la fecha</p>
      <h2>¿Dónde y cuándo?</h2>
      ${divider()}
      <div class="datos-card">
        ${pinSVG(accent)}
        ${d.lugar ? `<span class="lugar">${esc(d.lugar)}</span>` : ""}
        <span class="cuando">${fechaLarga ? esc(fechaLarga) : ""}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</span>
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
        ${d.dressCode ? `<div class="dress-note"><span class="label">Dress code</span><p>${esc(d.dressCode)}</p></div>` : ""}
      </div>
    </div>
  </section>` : ""}

  <section>
    <div class="sec-inner">
      <p class="kicker">Para ir entrando en clima</p>
      <h2>Tragos de la casa</h2>
      ${divider()}
      <div class="tragos-grid">
        ${TRAGOS.map((t) => `<div class="trago-card"><span class="emoji">${t.emoji}</span><h3>${esc(t.nombre)}</h3><p>${esc(t.desc)}</p></div>`).join("")}
      </div>
    </div>
  </section>

  ${(d.galeria && d.galeria.length) ? `
  <section>
    <div class="sec-inner">
      <p class="kicker">Previa</p>
      <h2>Momentos al sol</h2>
      ${divider()}
      ${gal.html}
    </div>
  </section>` : ""}

  <section>
    <div class="sec-inner">
      <p class="kicker">Última llamada</p>
      <h2>Confirmá tu lugar en la playa</h2>
      ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.9;font-weight:800;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${divider()}
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="foot-fronds">${palmFrondSVG("fa", "#FFF3D6", accent)}${palmFrondSVG("fb", "#FFF3D6", accent2, true)}</div>
    <p class="brand">Cumpleaños de ${esc(d.nombre)}</p>
    <p>¡Los esperamos para brindar mirando el atardecer!</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(180deg, #FFD37A 0%, ${d.accent} 45%, ${d.accent2} 100%);">
    <svg viewBox="0 0 200 200" width="70" height="70" style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);opacity:.85;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><radialGradient id="cpSun" cx="48%" cy="42%" r="62%">
        <stop offset="0%" stop-color="#FFF3D6"/>
        <stop offset="55%" stop-color="#FFD37A"/>
        <stop offset="100%" stop-color="${d.accent}"/>
      </radialGradient></defs>
      <circle cx="100" cy="100" r="96" fill="url(#cpSun)"/>
    </svg>
    <svg viewBox="-70 -80 140 96" width="58" height="40" style="position:absolute;bottom:-10px;left:-14px;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="cpLeaf" x1="0" y1="-80" x2="0" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0E8F82"/>
        <stop offset="1" stop-color="${d.accent2}"/>
      </linearGradient></defs>
      <g transform="rotate(-46)"><path d="M0,0 C-16,-26 -10,-58 0,-82 C10,-58 16,-26 0,0 Z" fill="url(#cpLeaf)"/></g>
      <g transform="rotate(-16)"><path d="M0,0 C-16,-26 -10,-58 0,-82 C10,-58 16,-26 0,0 Z" fill="url(#cpLeaf)"/></g>
      <g transform="rotate(14)"><path d="M0,0 C-16,-26 -10,-58 0,-82 C10,-58 16,-26 0,0 Z" fill="url(#cpLeaf)"/></g>
    </svg>
    <div style="position:relative;font-family:Verdana,Arial,sans-serif;font-weight:800;font-size:1.15rem;color:#FFF8EE;line-height:1.1;text-shadow:0 2px 6px rgba(0,0,0,.25);">${esc(d.name)}</div>
    <div style="position:relative;font-family:Verdana,Arial,sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:#FFF3D6;">tropical sunset</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Tropical Sunset",
  summary: "Cumpleaños de adultos con onda tiki y atardecer playero, colores cítricos, hojas de palmera y tragos de la casa para brindar mirando el sol caer.",
  accent: "#FF6B4A", accent2: "#17B8A6", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
