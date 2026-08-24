const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-romantica-jardin";

const sampleData = {
  novia: "Camila", novio: "Ignacio",
  fecha: "2027-10-23", horaCeremonia: "17:30", lugarCeremonia: "Capilla del Rosedal, Palermo",
  horaFiesta: "20:00", lugarFiesta: "Invernadero El Jardín Secreto, Escobar",
  direccionMapa: "https://maps.google.com/?q=El+Jardin+Secreto+Escobar",
  mensaje: "Entre flores y buenos deseos, queremos celebrar el comienzo de esta nueva etapa junto a las personas que más queremos. Nos encantaría que nos acompañen en este día tan especial.",
  dressCode: "Elegante, tonos tierra",
  alias: "novios.mp",
  whatsapp: "5491122334455",
  coverImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1521543387237-06b2f9b578a2?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&q=80",
  ],
};

// --- Ornamentos dibujados a mano en SVG (paleta vino/oliva/oro, inline sin dependencias) ---

let _sealCounter = 0;

// Sello de lacre dorado con las iniciales de los novios, como en tarjetería clásica.
function waxSealSVG(size = 64, initials = "", gold = "#b8923f") {
  _sealCounter++;
  const gid = `goldGrad${_sealCounter}`;
  return `<svg class="wax-seal" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${gid}" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ecd49a"/>
        <stop offset="55%" stop-color="${gold}"/>
        <stop offset="100%" stop-color="#83621f"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#${gid})"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="#5f4415" stroke-width="1" stroke-dasharray="1.5 3.5" opacity=".6"/>
    <circle cx="50" cy="50" r="37" fill="none" stroke="#5f4415" stroke-width=".7" opacity=".5"/>
    <text x="50" y="60" font-family="'Playfair Display',serif" font-size="30" fill="#4a3510" text-anchor="middle">${esc(initials)}</text>
  </svg>`;
}

// Flor de anturio estilizada (corazón oscuro con espádice dorado), motivo recurrente de la referencia.
function anthuriumSVG(size = 46) {
  return `<svg class="anthurium" width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 8 C 10 8, 3 30, 12 47 C 18 59, 26 67, 30 76 C 34 67, 42 59, 48 47 C 57 30, 50 8, 30 8 Z" fill="#5c1f28"/>
    <path d="M30 8 C 10 8, 3 30, 12 47 C 18 59, 26 67, 30 76 C 34 67, 42 59, 48 47 C 57 30, 50 8, 30 8 Z" fill="none" stroke="#38121a" stroke-width="1" opacity=".5"/>
    <path d="M30 20 C 33 34, 29 52, 33 70" fill="none" stroke="#c9a227" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="33" cy="70" r="2.2" fill="#c9a227"/>
    <path d="M14 8 C 8 22, 10 34, 16 44" fill="none" stroke="#6f7a52" stroke-width="2" stroke-linecap="round" opacity=".8"/>
  </svg>`;
}

// Ramita de hojas oliva usada como divisor entre secciones.
function sprigSVG(w = 130, rotate = 0, gold = "#b8923f") {
  return `<svg class="sprig" width="${w}" height="${Math.round(w * 0.5)}" viewBox="0 0 130 65" style="transform:rotate(${rotate}deg)" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 58 C 32 40, 58 46, 124 8" fill="none" stroke="#6f7a52" stroke-width="1.5" stroke-linecap="round"/>
    <g fill="#7f8a5f" opacity=".85">
      <path d="M32 45 C 26 38, 24 30, 30 24 C 36 30, 34 38, 32 45 Z"/>
      <path d="M56 34 C 50 27, 48 20, 54 14 C 60 20, 58 27, 56 34 Z"/>
      <path d="M80 22 C 74 16, 73 9, 79 4 C 85 9, 83 16, 80 22 Z"/>
    </g>
    <g transform="translate(108,10)">
      <circle cx="0" cy="0" r="6" fill="#8a2432" opacity=".85"/>
      <circle cx="7" cy="4" r="5" fill="${gold}" opacity=".8"/>
      <circle cx="-2" cy="7" r="5" fill="#8a2432" opacity=".7"/>
    </g>
  </svg>`;
}

// Filete decorativo con hojas y punto dorado central, usado como separador de línea.
function leafDividerSVG(gold = "#b8923f") {
  return `<svg class="leaf-divider" width="180" height="22" viewBox="0 0 180 22" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 11 C 60 2, 120 20, 178 11" fill="none" stroke="#6f7a52" stroke-width="1.2"/>
    <g fill="#7f8a5f">
      <path d="M42 11 C 47 4, 55 4, 59 11 C 55 18, 47 18, 42 11 Z"/>
      <path d="M121 11 C 126 4, 134 4, 138 11 C 134 18, 126 18, 121 11 Z"/>
    </g>
    <circle cx="90" cy="11" r="4" fill="${gold}"/>
  </svg>`;
}

// Icono floral pequeño en oro/vino para encabezar tarjetas (ceremonia, fiesta, etc).
function goldBlossomSVG(size = 22, gold = "#b8923f") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="${gold}">
      <ellipse cx="20" cy="10" rx="6.5" ry="8.5" opacity=".9"/>
      <ellipse cx="20" cy="30" rx="6.5" ry="8.5" opacity=".9"/>
      <ellipse cx="10" cy="20" rx="8.5" ry="6.5" opacity=".9"/>
      <ellipse cx="30" cy="20" rx="8.5" ry="6.5" opacity=".9"/>
    </g>
    <circle cx="20" cy="20" r="4.5" fill="#5c1f28"/>
  </svg>`;
}

// Textura de "papel de toile" muy sutil: mini escena botánica en vino sobre crudo, repetida como fondo.
function toileTileSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
    <rect width="260" height="260" fill="#efe8d8"/>
    <g fill="none" stroke="#3d1620" stroke-width="1" opacity="0.09">
      <path d="M30 235 C 30 150, 62 120, 42 60 C 32 28, 52 8, 74 18"/>
      <path d="M60 235 C 82 190, 70 150, 92 120 C 112 88, 100 48, 132 26"/>
      <circle cx="72" cy="36" r="15"/>
      <circle cx="128" cy="205" r="11"/>
      <path d="M205 235 C 205 150, 235 120, 215 60 C 205 28, 225 8, 247 18"/>
      <circle cx="222" cy="42" r="13"/>
      <path d="M170 235 C 190 195, 178 160, 195 130" opacity=".7"/>
    </g>
  </svg>`;
}

// Filete dorado fino y sinuoso para las esquinas del hero (como en la
// tarjetería de referencia): una sola curva, currentColor para heredar el
// color de acento vía CSS.
function squiggleSVG() {
  return `<svg class="corner-squiggle" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 4C64 4 2 56 42 80C78 100 30 126 74 156" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#b8923f");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "17:00"}:00` : sampleData.fecha, "cdjardin");
  const gal = galleryWidget(d.galeria, "galjardin");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const iniciales = `${(d.novia || "").charAt(0)}${(d.novio || "").charAt(0)}`.toUpperCase();
  const toileURI = `data:image/svg+xml,${encodeURIComponent(toileTileSVG())}`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --wine:#3d1620; --wine-deep:#2a0f16; --wine-light:#6b2632;
    --olive:#6f7a52; --olive-dark:#565f3f;
    --gold:${accent}; --gold-light:color-mix(in srgb, ${accent}, white 40%);
    --cream:#efe8d8; --paper:#fbf7ef; --ink:#3a2a20;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream) url('${toileURI}');background-size:260px 260px;color:var(--ink);font-family:'Cormorant Garamond',serif;font-weight:400;font-size:1.08rem;line-height:1.65;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:500;color:var(--wine);margin:0;}
  .script{font-family:'Mrs Saint Delafield',cursive;color:var(--wine);}
  a{color:var(--wine);}
  section{max-width:760px;margin:0 auto;padding:clamp(38px,6vw,68px) clamp(18px,5vw,26px);text-align:center;}

  .eyebrow{letter-spacing:4px;text-transform:uppercase;font-size:.75rem;color:var(--olive-dark);font-family:'Cormorant Garamond',serif;font-weight:600;}
  .eyebrow.on-dark{color:var(--gold-light);}
  h2.section-title{font-size:clamp(1.5rem,4vw,2.1rem);letter-spacing:1px;margin:6px 0 20px;}
  .divider-flor{display:flex;justify-content:center;margin:8px 0 4px;}
  .sprig{max-width:100%;height:auto;}
  .leaf-divider{max-width:100%;height:auto;margin:0 auto;display:block;}

  /* HERO */
  .hero{position:relative;background:radial-gradient(120% 100% at 50% 0%,var(--wine-light),var(--wine) 55%,var(--wine-deep));padding:clamp(46px,8vw,80px) 18px clamp(56px,9vw,90px);text-align:center;overflow:hidden;}
  .hero::before{content:"";position:absolute;inset:0;background:url('${toileURI}');background-size:260px 260px;opacity:.06;mix-blend-mode:screen;pointer-events:none;}
  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}

  /* Ornamentos de esquina del hero: filete dorado + ramita de rosa/hoja. */
  .corner-squiggle{position:absolute;width:64px;height:74px;color:var(--gold);opacity:.55;pointer-events:none;z-index:1;}
  @media(min-width:480px){.corner-squiggle{width:90px;height:104px;}}
  .corner-squiggle.cs-tl{top:0;left:0;}
  .corner-squiggle.cs-br{bottom:0;right:0;transform:rotate(180deg);}
  .corner-sprig{position:absolute;pointer-events:none;z-index:1;opacity:.92;}
  .corner-sprig .sprig{width:70px;}
  @media(min-width:480px){.corner-sprig .sprig{width:96px;}}
  .corner-sprig.cs-tr{top:12px;right:6px;}
  .corner-sprig.cs-bl{bottom:12px;left:6px;transform:scale(-1,-1);}
  .hero .eyebrow{color:var(--gold-light);}
  .hero h1{font-size:clamp(2rem,7vw,3.4rem);letter-spacing:clamp(1px,.6vw,4px);text-transform:uppercase;color:var(--paper);margin:12px 0;}
  .hero h1 .amp{font-family:'Mrs Saint Delafield',cursive;text-transform:none;font-size:1.3em;color:var(--gold-light);padding:0 .12em;display:inline-block;}
  .hero-frame{width:min(78%,300px);aspect-ratio:4/5;margin:22px auto;border-radius:50% 50% 6px 6px/28% 28% 6px 6px;overflow:hidden;border:3px solid var(--gold);box-shadow:0 18px 40px rgba(0,0,0,.35);position:relative;}
  .hero-frame img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.92);}
  .hero-seal{margin:-30px auto 0;position:relative;z-index:2;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));}
  .hero .fecha-linda{margin-top:18px;font-size:clamp(1rem,3vw,1.2rem);letter-spacing:2px;color:var(--gold-light);text-transform:uppercase;font-family:'Cormorant Garamond',serif;font-weight:600;}

  /* Tarjeta oscura tipo "itinerario/faltan" de la referencia */
  .dark-card{position:relative;overflow:hidden;background:linear-gradient(165deg,var(--wine-light),var(--wine) 60%,var(--wine-deep));border-radius:20px;padding:clamp(28px,5vw,46px) clamp(20px,5vw,36px);color:var(--paper);box-shadow:0 16px 34px rgba(61,22,32,.28);text-align:left;}
  .dark-card h2,.dark-card h3{color:var(--paper);}
  .dark-card p{color:var(--gold-light);}
  .dark-card .corner-squiggle{width:60px;height:80px;opacity:.4;}
  .dark-card .corner-squiggle.cs-tl{top:-6px;left:-6px;}
  .dark-card .corner-sprig{opacity:.85;}
  .dark-card .corner-sprig .sprig{width:74px;}
  .dark-card .corner-sprig.cs-br{bottom:-4px;right:-8px;}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,3vw,20px);justify-content:center;flex-wrap:wrap;margin:22px 0 0;}
  .countdown div{display:flex;flex-direction:column;background:rgba(255,255,255,.06);border:1px solid color-mix(in srgb, var(--gold-light) 35%, transparent);border-radius:14px;width:clamp(62px,16vw,84px);height:clamp(62px,16vw,84px);align-items:center;justify-content:center;}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.15rem,4vw,1.6rem);color:var(--gold-light);}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--paper);opacity:.75;margin-top:3px;}

  /* CITA / MENSAJE tipo papel rasgado */
  .paper-card{background:var(--paper);max-width:560px;margin:0 auto;padding:30px clamp(20px,5vw,40px);border-radius:2px;position:relative;box-shadow:0 14px 30px rgba(61,22,32,.14);transform:rotate(-0.6deg);}
  .paper-card::before,.paper-card::after{content:"";position:absolute;left:10%;right:10%;height:8px;background:repeating-linear-gradient(100deg,var(--cream) 0 6px,transparent 6px 10px);}
  .paper-card::before{top:-4px;}
  .paper-card::after{bottom:-4px;}
  .message{font-size:clamp(1.05rem,2.3vw,1.3rem);font-style:italic;color:var(--wine);margin:0;}

  /* CRONOGRAMA */
  .timeline{list-style:none;margin:26px 0 0;padding:0;text-align:left;display:flex;flex-direction:column;gap:0;position:relative;}
  .timeline::before{content:"";position:absolute;left:20px;top:6px;bottom:6px;width:1px;background:color-mix(in srgb, var(--gold-light) 40%, transparent);}
  .timeline li{position:relative;padding:0 0 26px 52px;}
  .timeline li:last-child{padding-bottom:0;}
  .timeline li::before{content:"";position:absolute;left:14px;top:4px;width:13px;height:13px;border-radius:50%;background:var(--gold);border:2px solid var(--wine);}
  .timeline .t-hora{font-family:'Playfair Display',serif;color:var(--gold-light);font-size:1.02rem;letter-spacing:.5px;}
  .timeline .t-label{margin:2px 0 0;color:var(--paper);opacity:.92;}
  .info-row{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:center;margin-top:20px;text-align:left;}
  .info-row .item{display:flex;align-items:center;gap:8px;color:var(--paper);}
  .map-link{display:inline-block;margin-top:26px;padding:11px 26px;border:1px solid var(--gold);color:var(--gold-light);border-radius:30px;text-decoration:none;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;transition:background .2s,color .2s;}
  .map-link:hover{background:var(--gold);color:var(--wine-deep);}

  /* DETALLES: dress code + regalo, tags estilo oliva con colgante dorado */
  .pill-row{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;margin-top:10px;}
  .pill{background:var(--paper);border-radius:16px;padding:28px 24px 22px;max-width:300px;flex:1 1 240px;text-align:center;box-shadow:0 12px 26px rgba(61,22,32,.12);position:relative;}
  .pill .tag{display:inline-block;background:var(--olive);color:var(--cream);border-radius:10px;padding:6px 16px;font-size:.72rem;letter-spacing:1.6px;text-transform:uppercase;margin-bottom:14px;position:relative;}
  .pill .tag::after{content:"";position:absolute;left:50%;bottom:-14px;width:2px;height:14px;background:var(--gold);transform:translateX(-50%);}
  .pill h3{margin:6px 0 8px;font-size:1.15rem;}
  .pill p{margin:0;opacity:.9;font-size:.98rem;}
  .alias-box{display:inline-block;margin-top:12px;background:var(--cream);border:1px dashed var(--olive-dark);border-radius:10px;padding:8px 18px;font-weight:600;color:var(--wine);letter-spacing:.6px;font-family:'Playfair Display',serif;}

  /* GALERÍA */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:24px;}
  .gallery-item{position:relative;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:4px;cursor:pointer;border:3px solid var(--paper);box-shadow:0 10px 22px rgba(61,22,32,.18);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(42,15,22,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:6px;border:4px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-light);font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-deadline{margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;color:var(--olive-dark);}
  .rsvp-cols{display:grid;grid-template-columns:1fr 1px 1fr;gap:clamp(20px,4vw,44px);align-items:center;margin-top:30px;text-align:left;}
  .rsvp-divider{align-self:stretch;background:linear-gradient(var(--cream) 0,var(--gold) 12%,var(--gold) 88%,var(--cream) 100%);opacity:.6;}
  .rsvp-deco-col{display:flex;align-items:center;justify-content:center;color:var(--gold);}
  .rsvp-deco-col .sprig{width:min(100%,180px);}
  @media(max-width:640px){
    .rsvp-cols{grid-template-columns:1fr;gap:8px;}
    .rsvp-divider{display:none;}
    .rsvp-deco-col{display:none;}
  }
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.3px;color:var(--olive-dark);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:11px 12px;border:1px solid #d8c9a8;border-radius:8px;margin-top:5px;width:100%;background:var(--paper);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:2px solid var(--gold);border-color:var(--gold);}
  .rsvp-form button{background:var(--wine);color:var(--gold-light);border:0;padding:14px;border-radius:30px;letter-spacing:1.6px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:600;transition:background .2s;}
  .rsvp-form button:hover{background:var(--wine-light);}
  .rsvp-whatsapp{display:block;margin-top:14px;font-size:.88rem;color:var(--olive-dark);text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--wine);font-weight:600;margin-top:10px;}

  footer{position:relative;text-align:center;padding:56px 20px 44px;color:var(--gold-light);background:linear-gradient(165deg,var(--wine-light),var(--wine) 60%,var(--wine-deep));overflow:hidden;}
  footer::before{content:"";position:absolute;inset:0;background:url('${toileURI}');background-size:260px 260px;opacity:.06;mix-blend-mode:screen;pointer-events:none;}
  footer .inner{position:relative;z-index:1;}
  footer .script{font-size:clamp(2rem,6vw,2.6rem);display:block;margin-bottom:10px;color:var(--paper);}
  footer p{margin:0;font-size:.92rem;opacity:.85;}
  .corner-deco{display:flex;justify-content:center;margin-top:18px;opacity:.9;}
</style></head>
<body>

  <div class="hero">
    ${squiggleSVG().replace('class="corner-squiggle"', 'class="corner-squiggle cs-tl"')}
    ${squiggleSVG().replace('class="corner-squiggle"', 'class="corner-squiggle cs-br"')}
    <div class="corner-sprig cs-tr">${sprigSVG(96, -20, accent)}</div>
    <div class="corner-sprig cs-bl">${sprigSVG(96, -20, accent)}</div>
    <div class="hero-inner">
      <div class="eyebrow">Nos casamos</div>
      <h1>${esc(d.novia)} <span class="amp">&amp;</span> ${esc(d.novio)}</h1>
      <div class="hero-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}"></div>
      <div class="hero-seal">${waxSealSVG(56, iniciales, accent)}</div>
      <div class="fecha-linda">${fechaLarga(d.fecha)}</div>
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.direccionMapa) ? `<section>
    <div class="divider-flor">${sprigSVG(130, 0, accent)}</div>
    <p class="eyebrow">Ceremonia y recepción</p>
    <h2 class="section-title">¿Dónde y cuándo?</h2>
    <div class="dark-card">
      ${squiggleSVG().replace('class="corner-squiggle"', 'class="corner-squiggle cs-tl"')}
      <div class="corner-sprig cs-br">${sprigSVG(74, -20, accent)}</div>
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="info-row">
        <div class="item">${goldBlossomSVG(20, accent)} <div>${d.horaCeremonia ? `<strong>${esc(d.horaCeremonia)} hs</strong>` : ""}${(d.horaCeremonia && d.lugarCeremonia) ? "<br>" : ""}${d.lugarCeremonia ? esc(d.lugarCeremonia) : ""}</div></div>
      </div>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
  </section>` : ""}

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<section>
    <p class="eyebrow">Agenda del día</p>
    <h2 class="section-title">Itinerario</h2>
    <div class="dark-card">
      ${squiggleSVG().replace('class="corner-squiggle"', 'class="corner-squiggle cs-tl"')}
      <div class="corner-sprig cs-br">${sprigSVG(80, -20, accent)}</div>
      <ul class="timeline">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<li>${d.horaCeremonia ? `<div class="t-hora">${esc(d.horaCeremonia)} hs</div>` : ""}<p class="t-label">Ceremonia${d.lugarCeremonia ? ` — ${esc(d.lugarCeremonia)}` : ""}</p></li>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<li>${d.horaFiesta ? `<div class="t-hora">${esc(d.horaFiesta)} hs</div>` : ""}<p class="t-label">Recepción y fiesta${d.lugarFiesta ? ` — ${esc(d.lugarFiesta)}` : ""}</p></li>` : ""}
        <li><div class="t-hora">&hellip;</div><p class="t-label">¡A festejar hasta que el cuerpo aguante!</p></li>
      </ul>
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Cuenta regresiva</p>
    <h2 class="section-title">Faltan</h2>
    <div class="dark-card">
      ${cd.html}
    </div>
  </section>

  ${d.mensaje ? `<section>
    ${leafDividerSVG(accent)}
    <div class="paper-card">
      <p class="message">${esc(d.mensaje)}</p>
    </div>
  </section>` : ""}

  <section>
    <div class="divider-flor">${sprigSVG(130, 180, accent)}</div>
    <p class="eyebrow">Detalles</p>
    <h2 class="section-title">Para tener en cuenta</h2>
    <div class="pill-row">
      ${d.dressCode ? `<div class="pill">
        <span class="tag">Código de vestimenta</span>
        <h3>${esc(d.dressCode)}</h3>
        <p>Les dejamos esta sugerencia de colores para acompañar la estética del día.</p>
      </div>` : ""}
      <div class="pill">
        <span class="tag">Sugerencia de regalos</span>
        <h3>Un gesto con nosotros</h3>
        <p>El mejor regalo es tu presencia, pero si querés tener un detalle, podés hacerlo por transferencia.</p>
        ${d.alias ? `<div class="alias-box">Alias: ${esc(d.alias)}</div>` : ""}
      </div>
    </div>
    <div class="corner-deco">${anthuriumSVG(46)}</div>
  </section>

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Recuerdos</p>
    <h2 class="section-title">Nuestra historia en fotos</h2>
    ${gal.html}
  </section>` : ""}

  <section class="rsvp-section">
    <div class="divider-flor">${sprigSVG(130, 0, accent)}</div>
    <p class="eyebrow">Por favor confirmá</p>
    <h2 class="section-title">Confirmar asistencia</h2>
    ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-cols">
      <div class="rsvp-form-col">${rsvp.html}</div>
      <div class="rsvp-divider" aria-hidden="true"></div>
      <div class="rsvp-deco-col">${sprigSVG(150, 65, accent)}</div>
    </div>
  </section>

  <footer>
    <div class="inner">
      ${waxSealSVG(46, iniciales, accent)}
      <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
      <p>Con todo nuestro cariño, gracias por ser parte de este día.</p>
    </div>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd} de ${meses[m - 1]} de ${y}`;
}

// Preview en miniatura para la grilla del catálogo (jardin_2.png): panel
// vino con filete dorado sinuoso, ramita de rosa/hoja en la esquina y el
// nombre del diseño centrado con un mini divisor de diamante debajo.
// Solo estilos inline (site.css es compartido y no se toca acá).
function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;background:linear-gradient(160deg,#6b2632 0%,#3d1620 55%,#2a0f16 100%);">
    <svg style="position:absolute;top:0;left:0;width:56px;height:90px;opacity:.55;" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 4C64 4 2 56 42 80C78 100 30 126 74 156" stroke="#d9b56a" stroke-width="1.3"/>
    </svg>
    <div style="position:absolute;top:2px;right:0;transform:scale(.55);transform-origin:top right;">${sprigSVG(120, -18, "#d9b56a")}</div>
    <div style="position:relative;z-index:1;font-family:Georgia,'Times New Roman',serif;font-size:1.1rem;color:#fbf7ef;letter-spacing:.5px;text-align:center;padding:0 16px;">${esc(d.name)}</div>
    <div style="position:relative;width:44px;height:1px;background:#d9b56a;">
      <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.5rem;color:#d9b56a;">&#9670;</span>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Romántica Jardín",
  summary: "Paleta vino y oliva con acentos dorados, tarjetas de itinerario oscuras, sellos de lacre y anturios ilustrados — tono romántico de jardín otoñal inspirado en tarjetería clásica.",
  accent: "#3d1620", accent2: "#6f7a52", schema: bodaSchema, sampleData, render, cardPreview,
};
