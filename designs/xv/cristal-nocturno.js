const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-cristal-nocturno";
const name = "Cristal Nocturno";
const summary = "Azul medianoche casi negro con destellos de cristal titilando muy despacio, como un salón bajo mil luces — una gala de quince años entre diamantes.";
const accent = "#b9c6d9";
const accent2 = "#0a0e1a";

const sampleData = {
  nombre: "Abril Sofía",
  fecha: "2027-06-19",
  horaCeremonia: "19:00",
  lugarCeremonia: "Parroquia Nuestra Señora del Valle",
  horaFiesta: "21:00",
  lugarFiesta: "Salón Cristal, Nordelta",
  direccionMapa: "https://maps.google.com/?q=Salon+Cristal+Nordelta",
  padres: "Martín Aguirre y Yésica Domínguez",
  mensaje: "Bajo mil luces quiero celebrar con ustedes el comienzo de una nueva etapa. Los espero para brindar juntos por esta noche que voy a recordar toda la vida.",
  dressCode: "Formal de gala, tonos plateados y azules bienvenidos",
  whatsapp: "5491100000065",
  fechaLimiteRSVP: "2027-05-20",
  coverImage: "https://images.unsplash.com/photo-1597149864436-a2849142dff5?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1672941201884-983aae70d4c9?w=800&q=80",
    "https://images.unsplash.com/photo-1612355576977-07116cdf8325?w=800&q=80",
    "https://images.unsplash.com/photo-1654514437164-05febbc085ad?w=800&q=80",
  ],
};

// Motivos geométricos de cristal: facetas de diamante, gemas de línea
// fina y esquirlas angulares — nada de flores ni perlas en fila. Todo
// en SVG inline, currentColor, sin dependencias externas.

// Gema faceteada usada como separador central bajo cada título de sección.
function gemDividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="17" x2="76" y2="17" stroke="currentColor" stroke-width="1"/>
    <line x1="124" y1="17" x2="200" y2="17" stroke="currentColor" stroke-width="1"/>
    <path d="M100 4 L114 17 L100 30 L86 17 Z" stroke="currentColor" stroke-width="1.1"/>
    <path d="M100 4 L100 30 M86 17 L114 17" stroke="currentColor" stroke-width=".7" opacity=".65"/>
    <path d="M92 12 L100 4 L108 12 Z" fill="currentColor" opacity=".45"/>
  </svg>`;
}

// Fila de pequeñas facetas romboidales, para encabezar la galería.
function facetRowSvg(cls = "") {
  const gems = Array.from({ length: 7 })
    .map((_, i) => {
      const cx = 14 + i * 32;
      return `<path d="M${cx} 4 L${cx + 8} 14 L${cx} 24 L${cx - 8} 14 Z" fill="currentColor" opacity="${i % 2 === 0 ? 1 : 0.5}"/>`;
    })
    .join("");
  return `<svg class="${cls}" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="14" x2="220" y2="14" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    ${gems}
  </svg>`;
}

// Esquirla de cristal para las esquinas del hero y del pie: facetas
// angulares dibujadas con líneas, evocando un fragmento de hielo o gema
// tallada — el equivalente geométrico de la flor de esquina, sin flores.
function cornerCrystalSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1" stroke-linejoin="round" fill="none">
      <path d="M6 6 L36 6 L36 36 L6 36 Z"/>
      <path d="M6 6 L36 36 M36 6 L6 36"/>
      <path d="M42 4 L64 20 L48 44 L26 30 Z"/>
      <path d="M4 46 L24 64 L8 84 Z"/>
      <path d="M54 48 L70 58 L60 74 L44 64 Z"/>
      <circle cx="86" cy="16" r="2" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="94" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="66" cy="10" r="1.3" fill="currentColor" stroke="none"/>
    </g>
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

// Estrella de cuatro puntas (glifo de "destello"), usada para algunos de
// los puntitos del campo de brillos — el resto son círculos simples.
function sparkleStarSvg() {
  return `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 0 C10 5.2 14.8 10 20 10 C14.8 10 10 14.8 10 20 C10 14.8 5.2 10 0 10 C5.2 10 10 5.2 10 0 Z" fill="currentColor"/></svg>`;
}

// Campo de destellos: posiciones y tiempos fijados a mano para que la
// dispersión se vea natural (nunca en fila ni en grilla) y las duraciones
// varíen punto a punto, como pide el efecto de "cielo de diamantes".
const SPARKLE_POINTS = [
  { top: 6, left: 10, size: 3, dur: 5.4, delay: 0.2, type: "dot", tone: "ice" },
  { top: 9, left: 82, size: 10, dur: 6.8, delay: 1.4, type: "star", tone: "crystal" },
  { top: 14, left: 46, size: 2, dur: 4.6, delay: 2.6, type: "dot", tone: "crystal" },
  { top: 18, left: 66, size: 3, dur: 7.2, delay: 0.9, type: "dot", tone: "ice" },
  { top: 22, left: 18, size: 12, dur: 5.9, delay: 3.3, type: "star", tone: "ice" },
  { top: 27, left: 90, size: 2, dur: 8.4, delay: 1.1, type: "dot", tone: "crystal" },
  { top: 31, left: 34, size: 3, dur: 6.1, delay: 4.0, type: "dot", tone: "ice" },
  { top: 35, left: 8, size: 10, dur: 4.9, delay: 2.0, type: "star", tone: "crystal" },
  { top: 38, left: 74, size: 2, dur: 7.7, delay: 0.5, type: "dot", tone: "ice" },
  { top: 44, left: 54, size: 11, dur: 5.2, delay: 3.7, type: "star", tone: "ice" },
  { top: 48, left: 16, size: 2, dur: 8.9, delay: 1.8, type: "dot", tone: "crystal" },
  { top: 52, left: 88, size: 3, dur: 6.4, delay: 2.9, type: "dot", tone: "ice" },
  { top: 57, left: 40, size: 10, dur: 4.3, delay: 0.7, type: "star", tone: "crystal" },
  { top: 61, left: 70, size: 2, dur: 7.0, delay: 3.4, type: "dot", tone: "ice" },
  { top: 65, left: 12, size: 3, dur: 5.7, delay: 1.3, type: "dot", tone: "crystal" },
  { top: 70, left: 60, size: 12, dur: 8.1, delay: 2.5, type: "star", tone: "ice" },
  { top: 75, left: 86, size: 2, dur: 4.8, delay: 0.4, type: "dot", tone: "ice" },
  { top: 80, left: 30, size: 3, dur: 6.6, delay: 3.9, type: "dot", tone: "crystal" },
  { top: 86, left: 52, size: 10, dur: 7.5, delay: 1.6, type: "star", tone: "crystal" },
  { top: 91, left: 20, size: 2, dur: 5.1, delay: 2.2, type: "dot", tone: "ice" },
];

function sparkleFieldHtml() {
  const points = SPARKLE_POINTS.map((p) => {
    const style = `top:${p.top}%;left:${p.left}%;width:${p.size}px;height:${p.size}px;--dur:${p.dur}s;--delay:${p.delay}s;color:var(--${p.tone === "ice" ? "ice" : "crystal"});`;
    if (p.type === "star") {
      return `<div class="sparkle star" style="${style}">${sparkleStarSvg()}</div>`;
    }
    return `<div class="sparkle" style="${style}"></div>`;
  }).join("");
  return `<div class="sparkle-field" aria-hidden="true">${points}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Dos tonos de la misma gama: uno afinado para leerse sobre el azul
  // medianoche (secciones oscuras) y otro para leerse sobre el hielo
  // claro (secciones "frost") — así el detalle nunca pierde contraste al
  // cambiar de sección, sea cual sea la gama elegida.
  const accentOnMidnight = getPaletteColor(d.colorPalette, "dark", "#b9c6d9");
  const accentOnFrost = getPaletteColor(d.colorPalette, "light", "#3c4a70");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-cristal");
  const gal = galleryWidget(d.galeria || [], "gal-cristal");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Fecha calculada a mano (sin toLocaleDateString) por portabilidad: el
  // Node de producción puede no tener el locale es-AR instalado completo.
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const y = Number(partes[0]);
      const m = Number(partes[1]);
      const day = Number(partes[2]);
      const dt = new Date(y, m - 1, day);
      if (!isNaN(dt.getTime())) {
        diaSemana = DIAS[dt.getDay()];
        diaNumero = String(dt.getDate());
        mesAnio = `${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;
      }
    }
  }

  const sparkles = sparkleFieldHtml();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --midnight:#0a0e1a;
    --abyss:#05070f;
    --frost:#eef3fb;
    --frost-dim:#c9d3e4;
    --ice:${accent};
    --crystal:#f4f8ff;
    --ink:#141c2c;
    --ink-dim:#4a5468;
    --accent-dark:${accentOnMidnight};
    --accent-light:${accentOnFrost};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--midnight);color:var(--crystal);line-height:1.7;font-size:1.02rem;font-weight:300;}
  h1,h2{font-family:'Playfair Display',serif;font-weight:400;}
  p{margin:0 0 0;}

  .icon{width:clamp(30px,7vw,40px);height:auto;}
  .icon-row{width:clamp(120px,34vw,190px);height:auto;margin:18px auto;display:block;}
  .icon-ornament{width:clamp(140px,40vw,190px);height:auto;margin:20px auto;display:block;}

  .corner-crystal{position:absolute;width:clamp(64px,18vw,104px);height:auto;opacity:.85;pointer-events:none;z-index:1;}
  .corner-crystal.tl{top:20px;left:16px;}
  .corner-crystal.tr{top:20px;right:16px;transform:scaleX(-1);}
  .corner-crystal.bl{bottom:20px;left:16px;transform:scaleY(-1);}
  .corner-crystal.br{bottom:20px;right:16px;transform:scale(-1,-1);}

  /* ---------- campo de destellos: titilar lento, nunca parpadeo brusco ---------- */
  .sparkle-field{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}
  .sparkle{position:absolute;border-radius:50%;background:radial-gradient(circle,#ffffff 0%,var(--ice) 70%,transparent 100%);box-shadow:0 0 4px 1px rgba(233,240,255,.55);animation:destello ease-in-out infinite;animation-duration:var(--dur,6s);animation-delay:var(--delay,0s);opacity:.15;pointer-events:none;}
  .sparkle.star{background:none;box-shadow:none;}
  .sparkle.star svg{display:block;width:100%;height:100%;}
  @keyframes destello{0%,100%{opacity:.15;transform:scale(.7);}50%{opacity:1;transform:scale(1.15);}}
  @media (prefers-reduced-motion: reduce){
    .sparkle{animation:none !important;opacity:.5 !important;transform:none !important;}
  }

  .card-section{position:relative;padding:clamp(56px,10vw,92px) 22px;overflow:hidden;}
  .card-section::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(185,198,217,.5),transparent);pointer-events:none;}
  .card-section.on-midnight{background:var(--midnight);color:var(--crystal);}
  .card-section.on-abyss{background:var(--abyss);color:var(--crystal);}
  .card-section.on-frost{background:var(--frost);color:var(--ink);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .on-midnight .icon,.on-abyss .icon,.on-midnight .icon-row,.on-abyss .icon-row,.on-midnight .icon-ornament,.on-abyss .icon-ornament,.on-midnight .corner-crystal,.on-abyss .corner-crystal{color:var(--accent-dark);}
  .on-frost .icon,.on-frost .icon-row,.on-frost .icon-ornament,.on-frost .corner-crystal{color:var(--accent-light);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.8rem);margin:0 0 10px;}
  .on-midnight .eyebrow,.on-abyss .eyebrow{color:var(--accent-dark);}
  .on-frost .eyebrow{color:var(--accent-light);}

  h1.brand-title{font-size:clamp(2.1rem,8vw,3.5rem);letter-spacing:4px;margin:6px 0 22px;text-transform:uppercase;font-weight:400;color:var(--crystal);}

  .photo-frame{position:relative;max-width:250px;margin:8px auto 26px;padding:8px;border:1px solid var(--accent-dark);box-shadow:0 0 0 1px rgba(185,198,217,.15),0 0 30px rgba(185,198,217,.18);}
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;position:relative;z-index:1;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--accent-dark);opacity:.7;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-dark);}
  .date-block .day{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,6vw,2.7rem);color:var(--crystal);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-dark);text-align:left;}

  h2{font-size:clamp(1.15rem,3vw,1.55rem);text-transform:uppercase;letter-spacing:5px;font-weight:400;margin:0 0 26px;}
  .on-midnight h2,.on-abyss h2{color:var(--crystal);}
  .on-frost h2{color:var(--ink);}
  h2 .sub{display:block;font-family:'Jost',sans-serif;text-transform:none;letter-spacing:.3px;font-style:italic;font-weight:300;font-size:.72rem;margin-top:6px;}
  .on-midnight h2 .sub,.on-abyss h2 .sub{color:var(--ice);opacity:.75;}
  .on-frost h2 .sub{color:var(--ink-dim);}

  .padres{font-style:italic;font-family:'Playfair Display',serif;font-size:clamp(1rem,2.3vw,1.15rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.76rem;margin:0 0 14px;color:var(--accent-light);}
  .mensaje-txt{font-size:clamp(1rem,2.2vw,1.12rem);max-width:520px;margin:0 auto;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown div{border:1px solid var(--accent-dark);background:rgba(185,198,217,.05);padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,3.6vw,2rem);color:var(--crystal);display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent-dark);}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--accent-light);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--frost);border:1px solid var(--accent-light);color:var(--accent-light);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Playfair Display',serif;font-weight:400;color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-size:.8rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--accent-light);font-size:.88rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:var(--ink-dim);}

  .btn-outline{display:inline-block;margin-top:22px;padding:12px 28px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;font-weight:500;border-radius:0;cursor:pointer;transition:background .2s,color .2s;font-family:'Jost',sans-serif;}
  .on-frost .btn-outline{border:1px solid var(--ink);color:var(--ink);}
  .on-frost .btn-outline:hover{background:var(--ink);color:var(--frost);}
  .on-midnight .btn-outline,.on-abyss .btn-outline{border:1px solid var(--crystal);color:var(--crystal);}
  .on-midnight .btn-outline:hover,.on-abyss .btn-outline:hover{background:var(--crystal);color:var(--midnight);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--accent-dark);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;filter:saturate(.92) brightness(.98);}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(4,6,14,.95);z-index:50;align-items:center;justify-content:center;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--crystal);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;font-size:1rem;padding:10px;border:1px solid var(--frost-dim);background:#fff;color:var(--ink);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#9aa4b8;}
  .rsvp-form button{background:var(--ink);border:0;color:var(--frost);font-weight:500;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;padding:13px;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--midnight);}
  .rsvp-whatsapp{color:var(--accent-light);font-size:.88rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#2f7a5c;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-light);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;}
  footer .thanks{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,4vw,1.5rem);letter-spacing:2px;text-transform:uppercase;color:var(--crystal);position:relative;z-index:1;}
  footer small{display:block;font-family:'Jost',sans-serif;font-style:italic;font-weight:300;font-size:.92rem;color:var(--ice);opacity:.85;margin-top:12px;position:relative;z-index:1;}
</style></head>
<body>

  <div class="card-section on-midnight hero-section">
    ${sparkles}
    ${cornerCrystalSvg("corner-crystal tl")}
    ${cornerCrystalSvg("corner-crystal tr")}
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

  ${(d.mensaje || d.padres) ? `<div class="card-section on-frost">
    <div class="inner">
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-midnight">
    <div class="inner">
      ${gemDividerSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-frost">
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

  ${d.dressCode ? `<div class="card-section on-abyss">
    <div class="inner">
      ${gemDividerSvg("icon-ornament")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-midnight">
    <div class="inner">
      ${facetRowSvg("icon-row")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-frost">
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer class="on-abyss">
    ${sparkles}
    ${cornerCrystalSvg("corner-crystal bl")}
    ${cornerCrystalSvg("corner-crystal br")}
    <p class="thanks">Muchas gracias</p>
    <small>Los espero de gala, entre luces y cristal</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(160deg,#0a0e1a 0%,#05070f 60%,#0d1424 100%);overflow:hidden;">
    <div style="position:absolute;top:14%;left:16%;width:3px;height:3px;border-radius:50%;background:#f4f8ff;opacity:.9;box-shadow:0 0 4px 1px rgba(233,240,255,.6);"></div>
    <div style="position:absolute;top:66%;left:80%;width:2px;height:2px;border-radius:50%;background:#b9c6d9;opacity:.7;box-shadow:0 0 3px 1px rgba(185,198,217,.5);"></div>
    <div style="position:absolute;top:30%;left:86%;width:2px;height:2px;border-radius:50%;background:#f4f8ff;opacity:.6;"></div>
    <div style="position:absolute;top:80%;left:22%;width:2px;height:2px;border-radius:50%;background:#b9c6d9;opacity:.8;"></div>
    <svg style="position:absolute;top:8px;left:8px;width:30px;height:30px;color:#b9c6d9;opacity:.85;" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width="2.2" fill="none"><path d="M6 6 L36 6 L36 36 L6 36 Z"/><path d="M6 6 L36 36 M36 6 L6 36"/></g></svg>
    <svg style="position:absolute;bottom:8px;right:8px;width:30px;height:30px;color:#b9c6d9;opacity:.85;transform:scale(-1,-1);" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width="2.2" fill="none"><path d="M6 6 L36 6 L36 36 L6 36 Z"/><path d="M6 6 L36 36 M36 6 L6 36"/></g></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#b9c6d9;">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;color:#f4f8ff;">${esc(d.name)}</span>
    <svg style="width:70px;height:12px;color:#b9c6d9;opacity:.85;" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="0" y1="17" x2="76" y2="17" stroke="currentColor" stroke-width="1"/><line x1="124" y1="17" x2="200" y2="17" stroke="currentColor" stroke-width="1"/><path d="M100 4 L114 17 L100 30 L86 17 Z" stroke="currentColor" stroke-width="1.4"/></svg>
  </div>`;
}

module.exports = {
  id, category: "xv", name, summary, accent, accent2, schema: xvSchema, sampleData, render, cardPreview,
};
