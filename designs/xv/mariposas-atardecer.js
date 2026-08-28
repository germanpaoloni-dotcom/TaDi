const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-mariposas-atardecer";

const sampleData = {
  nombre: "Zoe Fernández",
  fecha: "2027-04-03",
  horaCeremonia: "18:00",
  lugarCeremonia: "Parroquia San José",
  horaFiesta: "20:00",
  lugarFiesta: "Quinta Girasoles",
  direccionMapa: "https://maps.google.com/?q=Quinta+Girasoles",
  padres: "Nicolás Fernández y Paula Ibáñez",
  mensaje: "Como las mariposas al atardecer, quiero que esta noche sea liviana, cálida y llena de color. Los invito a celebrar conmigo el comienzo de esta nueva etapa.",
  dressCode: "Formal primaveral, tonos cálidos bienvenidos",
  whatsapp: "5491100000068",
  fechaLimiteRSVP: "2027-03-05",
  coverImage: "https://images.unsplash.com/photo-1597976618063-810eb50c84fb?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1619296740635-5d0a8afcc221?w=800&q=80",
    "https://images.unsplash.com/photo-1616280560177-79c8155e556f?w=800&q=80",
    "https://images.unsplash.com/photo-1737953600058-e7c5eeafb4f1?w=800&q=80",
  ],
};

// Arrays en español para calcular la fecha a mano (sin depender del
// locale es-AR de Node, que puede no estar instalado en producción).
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Mariposa dibujada a mano en SVG de línea fina / silueta simple: dos
// pares de alas simétricas (dos elipses por lado, superior e inferior)
// alrededor de un cuerpo fino central y dos antenas. Las alas tienen
// clases .wing-left / .wing-right para poder targetearlas con la
// animación de aleteo (scaleX) por separado del cuerpo.
function butterflySvg(color = "currentColor") {
  return `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="wing wing-left" style="transform-origin:50px 40px;">
      <path d="M50 34 C 30 6, 4 8, 6 30 C 8 46, 28 44, 50 40 Z" fill="${color}" opacity=".92"/>
      <path d="M50 46 C 34 60, 12 62, 12 48 C 12 36, 30 38, 50 42 Z" fill="${color}" opacity=".62"/>
    </g>
    <g class="wing wing-right" style="transform-origin:50px 40px;">
      <path d="M50 34 C 70 6, 96 8, 94 30 C 92 46, 72 44, 50 40 Z" fill="${color}" opacity=".92"/>
      <path d="M50 46 C 66 60, 88 62, 88 48 C 88 36, 70 38, 50 42 Z" fill="${color}" opacity=".62"/>
    </g>
    <path d="M50 26 C 47 34, 47 48, 50 58 C 53 48, 53 34, 50 26 Z" fill="${color}"/>
    <path d="M49 27 C 46 22, 40 18, 36 18" stroke="${color}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M51 27 C 54 22, 60 18, 64 18" stroke="${color}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// Ramita fina de apoyo (no protagonista): unas pocas hojas de línea,
// usada como ornamento discreto entre secciones.
function sprigSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 20 C 60 4, 120 4, 176 20" stroke="currentColor" stroke-width="1" opacity=".8"/>
    <circle cx="90" cy="14" r="3" fill="currentColor"/>
    <ellipse cx="60" cy="18" rx="8" ry="4" transform="rotate(-18 60 18)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="120" cy="18" rx="8" ry="4" transform="rotate(18 120 18)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="40" cy="24" rx="6" ry="3" transform="rotate(-30 40 24)" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="140" cy="24" rx="6" ry="3" transform="rotate(30 140 24)" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}

function ornamentSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="15" x2="80" y2="15" stroke="currentColor" stroke-width="1"/>
    <line x1="120" y1="15" x2="200" y2="15" stroke="currentColor" stroke-width="1"/>
    ${butterflySvg("currentColor")}
  </svg>`;
}

function iconChurchSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 L20 12 M16 8 L24 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M8 34 V18 L20 10 L32 18 V34" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M16 34 V24 H24 V34" stroke="currentColor" stroke-width="1.6"/>
    <line x1="4" y1="34" x2="36" y2="34" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function iconPartySvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 36 L16 16 L24 16 L30 36" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M14 16 C 14 8, 26 8, 26 16" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="20" cy="6" r="2" fill="currentColor"/>
    <line x1="6" y1="36" x2="34" y2="36" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function iconDressSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 C17 4 15 7 15 9 L9 15 L13 19 L15 17 V36 H25 V17 L27 19 L31 15 L25 9 C25 7 23 4 20 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`;
}

// Genera las mariposas flotantes del hero: cada una es un <div> con su
// propia animación de "vuelo" (posición inicial + keyframes propios,
// duración y delay distintos) que envuelve el <svg> de la mariposa (que
// a su vez tiene la animación de "aleteo" en sus alas vía CSS global).
// Las posiciones/tamaños están pensadas para quedarse SIEMPRE dentro del
// contenedor del hero (que tiene overflow:hidden) incluso en mobile.
function heroButterflies() {
  const specs = [
    { top: "10%", left: "8%", size: 34, dur: "11s", delay: "0s", flightClass: "fly-a", color: "#fff4e6" },
    { top: "18%", left: "78%", size: 26, dur: "9s", delay: "1.2s", flightClass: "fly-b", color: "#ffe0c2" },
    { top: "62%", left: "12%", size: 22, dur: "13s", delay: "2.4s", flightClass: "fly-c", color: "#f6c99a" },
    { top: "70%", left: "82%", size: 30, dur: "10s", delay: "0.6s", flightClass: "fly-a", color: "#fff4e6" },
    { top: "36%", left: "48%", size: 20, dur: "14s", delay: "3s", flightClass: "fly-b", color: "#ffd9b0" },
    { top: "84%", left: "45%", size: 24, dur: "12s", delay: "1.8s", flightClass: "fly-c", color: "#fbe4c8" },
  ];
  return specs
    .map(
      (b, i) => `<div class="bfly ${b.flightClass}" style="top:${b.top};left:${b.left};width:${b.size}px;height:${Math.round(b.size * 0.8)}px;animation-duration:${b.dur};animation-delay:${b.delay};" aria-hidden="true">${butterflySvg(b.color)}</div>`
    )
    .join("");
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Dos tonos afinados de la misma gama: uno para leerse sobre el cielo
  // de atardecer (secciones cálidas) y otro sobre el marfil (secciones
  // claras), así el diseño mantiene contraste sea cual sea la paleta.
  const accentOnDusk = getPaletteColor(d.colorPalette, "dark", "#ffe3c2");
  const accentOnIvory = getPaletteColor(d.colorPalette, "light", "#c05a3a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-mariposas");
  const gal = galleryWidget(d.galeria || [], "gal-mariposas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Fecha calculada a mano (sin toLocaleDateString) por portabilidad.
  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-").map(Number);
    if (partes.length === 3 && !partes.some(Number.isNaN)) {
      const [y, m, day] = partes;
      const dt = new Date(y, m - 1, day);
      if (!isNaN(dt.getTime())) {
        diaSemana = DIAS[dt.getDay()];
        diaNumero = String(dt.getDate());
        mesAnio = `${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;
      }
    }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
<style>
  :root{
    --dusk1:#e8825a;
    --dusk2:#f2a35f;
    --dusk3:#f7c873;
    --dusk4:#6b3fa0;
    --ivory:#fff8f0;
    --ivory-dim:#f3e3d3;
    --accent-dusk:${accentOnDusk};
    --accent-ivory:${accentOnIvory};
    --ink:#4a2f2a;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--ivory);color:var(--ink);line-height:1.7;font-size:1.05rem;}
  h1,h2{font-family:'Playfair Display',serif;font-weight:500;}
  p{margin:0;}

  .icon{width:clamp(30px,7vw,40px);height:auto;}
  .icon-row{width:clamp(120px,34vw,190px);height:auto;margin:18px auto;display:block;}
  .icon-ornament{width:clamp(140px,40vw,200px);height:auto;margin:20px auto;display:block;}
  .sprig{width:clamp(110px,32vw,160px);height:auto;margin:18px auto;display:block;opacity:.8;}

  .card-section{position:relative;padding:clamp(56px,10vw,92px) 22px;}
  .card-section.on-dusk{background:linear-gradient(160deg,var(--dusk1) 0%,var(--dusk2) 42%,var(--dusk3) 75%,var(--dusk4) 100%);color:var(--ivory);}
  .card-section.on-dusk-deep{background:linear-gradient(200deg,var(--dusk4) 0%,#8a4f8f 45%,var(--dusk1) 100%);color:var(--ivory);}
  .card-section.on-ivory{background:var(--ivory);color:var(--ink);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .on-dusk .icon,.on-dusk-deep .icon,.on-dusk .icon-row,.on-dusk-deep .icon-row,.on-dusk .icon-ornament,.on-dusk-deep .icon-ornament,.on-dusk .sprig,.on-dusk-deep .sprig{color:var(--accent-dusk);}
  .on-ivory .icon,.on-ivory .icon-row,.on-ivory .icon-ornament,.on-ivory .sprig{color:var(--accent-ivory);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.8rem);margin:0 0 10px;font-style:italic;}
  .on-dusk .eyebrow,.on-dusk-deep .eyebrow{color:var(--ivory);opacity:.92;}
  .on-ivory .eyebrow{color:var(--accent-ivory);}

  h1.brand-title{font-size:clamp(2.2rem,8vw,3.6rem);letter-spacing:2px;margin:6px 0 22px;font-weight:600;color:#fff;text-shadow:0 2px 18px rgba(107,63,160,.35);}

  /* ---------- hero con mariposas flotantes ---------- */
  .hero-section{overflow:hidden;position:relative;}
  .hero-section::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 20%,rgba(255,232,196,.35),transparent 60%);pointer-events:none;}
  .bfly{position:absolute;pointer-events:none;z-index:1;filter:drop-shadow(0 2px 6px rgba(74,47,42,.25));}
  .bfly svg{display:block;width:100%;height:100%;}
  .bfly .wing{transform:scaleX(1);animation:aletear .75s ease-in-out infinite;}
  .bfly .wing-right{animation-delay:.02s;}

  @keyframes aletear{
    0%{transform:scaleX(1);}
    45%{transform:scaleX(.35);}
    100%{transform:scaleX(1);}
  }
  /* Tres trayectorias de vuelo distintas (onduladas, no en línea recta):
     combinan translate% + rotate en varios puntos, lentas e infinitas.
     Se usan porcentajes chicos para no generar overflow en pantallas
     angostas: el contenedor del hero además tiene overflow:hidden. */
  @keyframes flyA{
    0%{transform:translate(0,0) rotate(0deg);}
    25%{transform:translate(6vw,-4vh) rotate(8deg);}
    50%{transform:translate(2vw,3vh) rotate(-6deg);}
    75%{transform:translate(-5vw,-2vh) rotate(5deg);}
    100%{transform:translate(0,0) rotate(0deg);}
  }
  @keyframes flyB{
    0%{transform:translate(0,0) rotate(0deg);}
    25%{transform:translate(-6vw,3vh) rotate(-10deg);}
    50%{transform:translate(-2vw,-4vh) rotate(6deg);}
    75%{transform:translate(4vw,2vh) rotate(-4deg);}
    100%{transform:translate(0,0) rotate(0deg);}
  }
  @keyframes flyC{
    0%{transform:translate(0,0) rotate(0deg);}
    25%{transform:translate(4vw,4vh) rotate(6deg);}
    50%{transform:translate(-3vw,-3vh) rotate(-8deg);}
    75%{transform:translate(3vw,-4vh) rotate(4deg);}
    100%{transform:translate(0,0) rotate(0deg);}
  }
  .fly-a{animation:flyA 11s ease-in-out infinite;}
  .fly-b{animation:flyB 9s ease-in-out infinite;}
  .fly-c{animation:flyC 13s ease-in-out infinite;}

  @media(prefers-reduced-motion:reduce){
    .bfly, .bfly .wing{animation:none !important;}
    .bfly{opacity:.6;}
  }

  .photo-frame{max-width:250px;margin:8px auto 26px;padding:8px;border-radius:50% / 12%;border:1px solid rgba(255,255,255,.6);position:relative;z-index:2;}
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;border-radius:50% / 10%;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;position:relative;z-index:2;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--ivory);opacity:.7;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--ivory);opacity:.9;}
  .date-block .day{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,6vw,2.7rem);color:#fff;line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--ivory);opacity:.9;text-align:left;}

  h2{font-size:clamp(1.2rem,3vw,1.6rem);letter-spacing:2px;font-weight:600;margin:0 0 26px;}
  .on-dusk h2,.on-dusk-deep h2{color:#fff;}
  .on-ivory h2{color:var(--ink);}
  h2 .sub{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;letter-spacing:0;font-style:italic;font-size:.8rem;margin-top:6px;}
  .on-dusk h2 .sub,.on-dusk-deep h2 .sub{color:var(--ivory);opacity:.85;}
  .on-ivory h2 .sub{color:#8a6a55;}

  .padres{font-style:italic;font-size:clamp(1rem,2.3vw,1.12rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.8rem;margin:0 0 14px;color:var(--accent-ivory);}
  .mensaje-txt{font-size:clamp(1rem,2.2vw,1.15rem);max-width:520px;margin:0 auto;font-style:italic;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{border:1px solid rgba(255,255,255,.55);border-radius:10px;padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;background:rgba(255,255,255,.08);}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,3.6vw,2rem);color:#fff;display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--ivory);opacity:.85;}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--accent-ivory);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--ivory);border:1px solid var(--accent-ivory);color:var(--accent-ivory);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Playfair Display',serif;font-weight:600;color:var(--ink);letter-spacing:1px;font-size:.9rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--accent-ivory);font-size:.88rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:#7a5c4e;}

  .btn-outline{display:inline-block;margin-top:22px;padding:12px 28px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;font-weight:600;border-radius:30px;cursor:pointer;transition:background .2s,color .2s;font-family:'Cormorant Garamond',serif;}
  .on-ivory .btn-outline{border:1px solid var(--accent-ivory);color:var(--accent-ivory);}
  .on-ivory .btn-outline:hover{background:var(--accent-ivory);color:#fff;}
  .on-dusk .btn-outline,.on-dusk-deep .btn-outline{border:1px solid #fff;color:#fff;}
  .on-dusk .btn-outline:hover,.on-dusk-deep .btn-outline:hover{background:#fff;color:var(--dusk1);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border-radius:14px;border:1px solid var(--accent-ivory);}
  .gallery-item:nth-child(2){border-radius:50%;}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(74,47,42,.94);z-index:50;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:#8a6a55;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border:1px solid #e6cdb8;border-radius:8px;background:#fff;color:var(--ink);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#c2a893;}
  .rsvp-form button{background:var(--accent-ivory);border:0;border-radius:30px;color:#fff;font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;padding:13px;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--dusk1);}
  .rsvp-whatsapp{color:var(--accent-ivory);font-size:.88rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#3c7a5c;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-ivory);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;}
  footer .thanks{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,4vw,1.5rem);letter-spacing:1px;font-weight:600;color:#fff;position:relative;z-index:1;}
  footer small{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.92rem;color:var(--ivory);opacity:.85;margin-top:12px;position:relative;z-index:1;}
</style></head>
<body>

  <div class="card-section on-dusk hero-section">
    ${heroButterflies()}
    <div class="inner">
      <p class="eyebrow">Mis quince años</p>
      <h1 class="brand-title">${esc(d.nombre)}</h1>
      ${d.coverImage ? `<div class="photo-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}" loading="lazy"></div>` : ""}
      ${d.fecha ? `<div class="date-block">
        <span class="line"></span>
        <span class="dow">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNumero)}</span>
        <span class="my">${esc(mesAnio)}</span>
        <span class="line"></span>
      </div>` : ""}
    </div>
  </div>

  ${(d.mensaje || d.padres) ? `<div class="card-section on-ivory">
    <div class="inner">
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-dusk">
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-ivory">
    <div class="inner">
      <p class="eyebrow">Ubicación</p>
      <h2>Cuándo y dónde</h2>
      <div class="timeline">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="node">
          <span class="badge">${iconChurchSvg()}</span>
          <strong>Ceremonia</strong>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="node">
          <span class="badge">${iconPartySvg()}</span>
          <strong>Fiesta</strong>
          ${d.horaFiesta ? `<span class="hora">${esc(d.horaFiesta)}</span>` : ""}
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
        </div>` : ""}
      </div>
      ${d.direccionMapa ? `<a class="btn-outline" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
  </div>` : ""}

  ${d.dressCode ? `<div class="card-section on-dusk-deep">
    <div class="inner">
      ${sprigSvg("sprig")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-dusk hero-section">
    ${heroButterflies()}
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-ivory">
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer class="on-dusk-deep">
    <p class="thanks">Muchas gracias</p>
    <small>Los espero al atardecer, con el corazón agradecido</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(160deg,#e8825a 0%,#f2a35f 45%,#f7c873 75%,#6b3fa0 100%);overflow:hidden;">
    <svg style="position:absolute;top:10px;left:14px;width:26px;height:22px;opacity:.9;" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 34 C 30 6, 4 8, 6 30 C 8 46, 28 44, 50 40 Z" fill="#fff4e6"/><path d="M50 34 C 70 6, 96 8, 94 30 C 92 46, 72 44, 50 40 Z" fill="#fff4e6"/><path d="M50 26 C 47 34, 47 48, 50 58 C 53 48, 53 34, 50 26 Z" fill="#fff4e6"/></svg>
    <svg style="position:absolute;bottom:14px;right:16px;width:20px;height:16px;opacity:.85;" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 34 C 30 6, 4 8, 6 30 C 8 46, 28 44, 50 40 Z" fill="#ffe0c2"/><path d="M50 34 C 70 6, 96 8, 94 30 C 92 46, 72 44, 50 40 Z" fill="#ffe0c2"/><path d="M50 26 C 47 34, 47 48, 50 58 C 53 48, 53 34, 50 26 Z" fill="#ffe0c2"/></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#fff4e6;">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:1.1rem;letter-spacing:1px;color:#fff;text-shadow:0 1px 8px rgba(107,63,160,.4);">${esc(d.name)}</span>
    <svg style="width:70px;height:12px;opacity:.85;" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="0" y1="15" x2="80" y2="15" stroke="#fff4e6" stroke-width="1"/><line x1="120" y1="15" x2="200" y2="15" stroke="#fff4e6" stroke-width="1"/></svg>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Mariposas al Atardecer",
  summary: "Cielo de atardecer en coral, durazno y dorado con mariposas volando despacio — un XV romántico de golden hour, aleteo suave incluido.",
  accent: "#e8825a", accent2: "#6b3fa0", schema: xvSchema, sampleData, render, cardPreview,
};
