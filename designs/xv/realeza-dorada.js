const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-realeza-dorada";

const sampleData = {
  nombre: "Catalina Duarte",
  fecha: "2027-08-28",
  horaCeremonia: "18:00",
  lugarCeremonia: "Catedral de la Ciudad",
  horaFiesta: "20:30",
  lugarFiesta: "Salón Palace, Recoleta",
  direccionMapa: "https://maps.google.com/?q=Salon+Palace+Recoleta",
  padres: "Fernando Duarte y Silvana Molina",
  mensaje: "Con el corazón lleno de emoción, los invito a acompañarme en la noche en que me corono de quince años. Va a ser una noche de gala que quiero compartir con las personas que más quiero.",
  dressCode: "Formal de gala, se sugieren tonos borgoña y dorado",
  whatsapp: "5491100000067",
  fechaLimiteRSVP: "2027-07-25",
  coverImage: "https://images.unsplash.com/photo-1763828028975-afa6ae9d04de?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1763744068529-7f73c3a209f4?w=800&q=80",
    "https://images.unsplash.com/photo-1787031328898-b880857a632c?w=800&q=80",
    "https://images.unsplash.com/photo-1545237225-2603221cbf0a?w=800&q=80",
  ],
};

// Motivos "Realeza Dorada" dibujados a mano en SVG inline (currentColor):
// una corona con gema central, filigrana de esquina tipo escudo real,
// filete divisorio con gema en rombo, fila de gemas para separadores,
// y los íconos de ceremonia / fiesta / vestimenta a tono con el resto
// de la colección. Sin dependencias externas.

// Silueta de la corona: un único trazo cerrado, reutilizado tanto para
// dibujar el ícono (relleno con degradé dorado) como para "recortar" el
// brillo que se desliza encima (vía CSS mask con la misma silueta).
const CROWN_D = "M10,90 L10,50 L28,64 L40,20 L60,46 L80,20 L92,64 L110,50 L110,90 Z";
const CROWN_BASE_D = "M8,86 H112 V94 H8 Z";

function crownIconSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="crownGoldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbe9ac"/>
        <stop offset="45%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#8f6b1e"/>
      </linearGradient>
    </defs>
    <path d="${CROWN_D}" fill="url(#crownGoldGrad)" stroke="#6e5116" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="${CROWN_BASE_D}" fill="url(#crownGoldGrad)" stroke="#6e5116" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="10" cy="50" r="4.2" fill="#fff6da"/>
    <circle cx="40" cy="20" r="4.8" fill="#fff6da"/>
    <circle cx="80" cy="20" r="4.8" fill="#fff6da"/>
    <circle cx="110" cy="50" r="4.2" fill="#fff6da"/>
    <circle cx="60" cy="66" r="8.4" fill="#7a1030" stroke="#fbe9ac" stroke-width="1.8"/>
    <circle cx="60" cy="66" r="3" fill="#e6889e"/>
  </svg>`;
}

// Misma silueta, esta vez como relleno sólido sobre fondo transparente:
// sirve de máscara CSS (mask-image) para el brillo que se desliza sobre
// la corona — el canal alfa del SVG decide qué parte del brillo se ve.
function crownMaskDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="${CROWN_D}" fill="#000"/><path d="${CROWN_BASE_D}" fill="#000"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Filigrana de esquina tipo "escudo real": ángulo de filete fino + una
// pequeña flor de lis estilizada y una gema.
function cornerRoyalSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 46 V4 H46" stroke="currentColor" stroke-width="1.3"/>
    <path d="M4 26 Q4 4 26 4" stroke="currentColor" stroke-width="1"/>
    <path d="M16 22c5-9 18-9 22 0-4 7-14 9-22 0Z" stroke="currentColor" stroke-width="1.1" fill="none"/>
    <path d="M27 10 V22 M20 15 L34 15" stroke="currentColor" stroke-width="1"/>
    <path d="M20 34 L26 26 L32 34 L26 40 Z" fill="currentColor"/>
    <circle cx="50" cy="10" r="1.6" fill="currentColor"/>
    <circle cx="10" cy="50" r="1.6" fill="currentColor"/>
  </svg>`;
}

// Filete divisorio con una gema en rombo al centro.
function ornamentDividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="15" x2="82" y2="15" stroke="currentColor" stroke-width="1"/>
    <line x1="118" y1="15" x2="200" y2="15" stroke="currentColor" stroke-width="1"/>
    <path d="M100 5 L110 15 L100 25 L90 15 Z" stroke="currentColor" stroke-width="1.1" fill="none"/>
    <circle cx="100" cy="15" r="1.8" fill="currentColor"/>
  </svg>`;
}

// Fila de gemas en rombo sobre una línea (equivalente ornamental a un
// separador de perlas, pero con corte de diamante en vez de círculos).
function gemRowSvg(cls = "") {
  const gems = Array.from({ length: 7 })
    .map((_, i) => {
      const cx = 15 + i * 32;
      return `<path d="M${cx} 7 L${cx + 6} 14 L${cx} 21 L${cx - 6} 14 Z" fill="currentColor" opacity="${i % 2 === 0 ? 1 : 0.5}"/>`;
    })
    .join("");
  return `<svg class="${cls}" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="14" x2="220" y2="14" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    ${gems}
  </svg>`;
}

function iconCeremoniaSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 L20 11 M16.5 7.5 L23.5 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M10 34 V20 Q10 10 20 10 Q30 10 30 20 V34" stroke="currentColor" stroke-width="1.6"/>
    <path d="M16 34 V24 Q16 20 20 20 Q24 20 24 24 V34" stroke="currentColor" stroke-width="1.6"/>
    <line x1="6" y1="34" x2="34" y2="34" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function iconFiestaSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 6 H28 L25 18 Q20 22 15 18 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <line x1="20" y1="22" x2="20" y2="32" stroke="currentColor" stroke-width="1.6"/>
    <line x1="13" y1="34" x2="27" y2="34" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="20" cy="11" r="1.6" fill="currentColor"/>
  </svg>`;
}

function iconDressSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4c-2.4 0-4 1.8-4 4l-6 7 3.6 3.6L16 16v16h8V16l2.4 2.6L30 15l-6-7c0-2.2-1.6-4-4-4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="20" cy="8" r="1.4" fill="currentColor"/>
  </svg>`;
}

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Dos tonos de la misma gama: uno afinado para leerse sobre el fondo
  // borgoña (secciones oscuras) y otro para leerse sobre el crema marfil
  // (secciones claras), igual que en el resto de la colección.
  const accentOnWine = getPaletteColor(d.colorPalette, "dark", "#f0d488");
  const accentOnCream = getPaletteColor(d.colorPalette, "light", "#8a6a1a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-realeza");
  const gal = galleryWidget(d.galeria || [], "gal-realeza");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Fecha calculada a mano con arrays en español (no toLocaleDateString):
  // el Node de producción puede no tener el locale es-AR instalado.
  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-").map(Number);
    if (partes.length === 3 && partes.every((n) => !isNaN(n))) {
      const [y, m, day] = partes;
      const dt = new Date(y, m - 1, day);
      if (!isNaN(dt.getTime())) {
        diaSemana = DIAS_ES[dt.getDay()];
        diaNumero = String(day);
        mesAnio = `${MESES_ES[m - 1]} ${y}`;
      }
    }
  }

  const crownMask = crownMaskDataUri();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,600&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --wine:#4a1020;
    --wine-deep:#2e0a15;
    --cream:#f7ecd8;
    --cream-dim:#e6d7b4;
    --gold:#d4af37;
    --accent-wine:${accentOnWine};
    --accent-cream:${accentOnCream};
    --ink:#3a1420;
    --ink-dim:#6b4a42;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Montserrat',Arial,sans-serif;font-weight:300;background:var(--wine);color:var(--cream);line-height:1.7;font-size:1rem;}
  h1,h2{font-family:'Playfair Display',Georgia,serif;font-weight:700;}
  p{margin:0;}

  @keyframes shimmer{
    0%{background-position:-120% 0;}
    100%{background-position:220% 0;}
  }

  /* ---------- franjas y brillo de la corona ---------- */
  .gold-bar{position:relative;height:5px;background:linear-gradient(90deg,#7a5c17,var(--gold) 45%,#7a5c17);overflow:hidden;}
  .gold-bar::after{
    content:"";position:absolute;inset:0;
    background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.6) 50%,transparent 70%);
    background-size:200% 100%;
    animation:shimmer 4.5s linear infinite;
  }

  .crown-icon{position:relative;width:clamp(72px,19vw,112px);margin:0 auto 18px;display:block;}
  .crown-icon svg{width:100%;height:auto;display:block;filter:drop-shadow(0 2px 5px rgba(0,0,0,.4));}
  .crown-shine{
    position:absolute;inset:0;
    background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.75) 50%,transparent 70%);
    background-size:200% 100%;
    -webkit-mask-image:url("${crownMask}");mask-image:url("${crownMask}");
    -webkit-mask-size:100% 100%;mask-size:100% 100%;
    -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
    -webkit-mask-position:center;mask-position:center;
    animation:shimmer 5.5s ease-in-out infinite;
    pointer-events:none;
  }
  @media (prefers-reduced-motion: reduce){
    .gold-bar::after,.crown-shine{animation:none !important;background-position:50% 0;}
  }

  .icon{width:clamp(28px,7vw,38px);height:auto;}
  .icon-row{width:clamp(120px,34vw,190px);height:auto;margin:18px auto;display:block;}
  .icon-ornament{width:clamp(120px,38vw,170px);height:auto;margin:20px auto;display:block;}

  .corner-royal{position:absolute;width:clamp(58px,16vw,96px);height:auto;opacity:.9;pointer-events:none;}
  .corner-royal.tl{top:14px;left:14px;}
  .corner-royal.tr{top:14px;right:14px;transform:scaleX(-1);}
  .corner-royal.bl{bottom:14px;left:14px;transform:scaleY(-1);}
  .corner-royal.br{bottom:14px;right:14px;transform:scale(-1,-1);}

  .card-section{position:relative;padding:clamp(52px,10vw,88px) 22px;}
  .card-section.on-wine{background:var(--wine);color:var(--cream);}
  .card-section.on-wine-deep{background:var(--wine-deep);color:var(--cream);}
  .card-section.on-cream{background:var(--cream);color:var(--ink);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .on-wine .icon,.on-wine-deep .icon,.on-wine .icon-row,.on-wine-deep .icon-row,.on-wine .icon-ornament,.on-wine-deep .icon-ornament,.on-wine .corner-royal,.on-wine-deep .corner-royal{color:var(--accent-wine);}
  .on-cream .icon,.on-cream .icon-row,.on-cream .icon-ornament,.on-cream .corner-royal{color:var(--accent-cream);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.64rem,1.6vw,.78rem);margin:0 0 10px;}
  .on-wine .eyebrow,.on-wine-deep .eyebrow{color:var(--accent-wine);}
  .on-cream .eyebrow{color:var(--accent-cream);}

  h1.brand-title{font-size:clamp(2.1rem,8vw,3.5rem);letter-spacing:2px;margin:8px 0 22px;font-weight:900;color:var(--cream);}

  .photo-frame{max-width:250px;margin:8px auto 26px;padding:9px;border:1.4px solid var(--gold);box-shadow:0 0 0 5px var(--wine-deep) inset;position:relative;}
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--gold);opacity:.8;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-wine);}
  .date-block .day{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,6vw,2.7rem);font-weight:700;color:var(--cream);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-wine);text-align:left;}

  h2{font-size:clamp(1.15rem,3vw,1.55rem);text-transform:uppercase;letter-spacing:4px;font-weight:700;margin:0 0 26px;}
  .on-wine h2,.on-wine-deep h2{color:var(--cream);}
  .on-cream h2{color:var(--ink);}
  h2 .sub{display:block;font-family:'Montserrat',sans-serif;text-transform:none;letter-spacing:0;font-style:italic;font-weight:300;font-size:.78rem;margin-top:8px;}
  .on-wine h2 .sub,.on-wine-deep h2 .sub{color:var(--cream-dim);}
  .on-cream h2 .sub{color:var(--ink-dim);}

  .padres{font-family:'Playfair Display',serif;font-style:italic;font-weight:600;font-size:clamp(1rem,2.3vw,1.15rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.76rem;margin:0 0 14px;color:var(--accent-cream);}
  .mensaje-txt{font-size:clamp(.95rem,2.2vw,1.05rem);max-width:520px;margin:0 auto;font-weight:300;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{border:1px solid var(--gold);padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;background:rgba(212,175,55,.06);}
  .cd-num{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.4rem,3.6vw,2rem);color:var(--cream);display:block;}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent-wine);}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--accent-cream);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--cream);border:1px solid var(--accent-cream);color:var(--accent-cream);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Playfair Display',serif;font-weight:700;color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-size:.78rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--accent-cream);font-size:.86rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:var(--ink-dim);font-weight:300;}

  .btn-outline{display:inline-block;margin-top:22px;padding:12px 28px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.72rem;font-weight:600;border-radius:0;cursor:pointer;transition:background .2s,color .2s;font-family:'Montserrat',sans-serif;}
  .on-cream .btn-outline{border:1px solid var(--ink);color:var(--ink);}
  .on-cream .btn-outline:hover{background:var(--ink);color:var(--cream);}
  .on-wine .btn-outline,.on-wine-deep .btn-outline{border:1px solid var(--gold);color:var(--cream);}
  .on-wine .btn-outline:hover,.on-wine-deep .btn-outline:hover{background:var(--gold);color:var(--wine-deep);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;font-weight:300;max-width:360px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1.4px solid var(--gold);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;filter:saturate(.94);}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,4,10,.94);z-index:50;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--cream);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Montserrat',sans-serif;font-size:.95rem;padding:10px;border:1px solid #d8c7a0;background:#fff;color:var(--ink);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#a89a86;}
  .rsvp-form button{background:var(--ink);border:0;color:var(--cream);font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:.78rem;padding:13px;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--wine);}
  .rsvp-whatsapp{color:var(--accent-cream);font-size:.86rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#3c7a5c;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.76rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-cream);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;}
  footer .thanks{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.2rem,4vw,1.5rem);letter-spacing:2px;text-transform:uppercase;color:var(--cream);position:relative;z-index:1;}
  footer small{display:block;font-family:'Montserrat',sans-serif;font-style:italic;font-weight:300;font-size:.9rem;color:var(--cream-dim);opacity:.85;margin-top:12px;position:relative;z-index:1;}
</style></head>
<body>

  <div class="card-section on-wine hero-section">
    <div class="gold-bar" style="position:absolute;top:0;left:0;right:0;"></div>
    ${cornerRoyalSvg("corner-royal tl")}
    ${cornerRoyalSvg("corner-royal tr")}
    <div class="inner">
      <div class="crown-icon">
        ${crownIconSvg()}
        <div class="crown-shine" aria-hidden="true"></div>
      </div>
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
    <div class="gold-bar" style="position:absolute;bottom:0;left:0;right:0;"></div>
  </div>

  ${(d.mensaje || d.padres) ? `<div class="card-section on-cream">
    <div class="inner">
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-wine">
    <div class="inner">
      ${ornamentDividerSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-cream">
    <div class="inner">
      <p class="eyebrow">Ubicación</p>
      <h2>Cuándo y dónde</h2>
      <div class="timeline">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="node">
          <span class="badge">${iconCeremoniaSvg()}</span>
          <strong>Ceremonia</strong>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="node">
          <span class="badge">${iconFiestaSvg()}</span>
          <strong>Fiesta</strong>
          ${d.horaFiesta ? `<span class="hora">${esc(d.horaFiesta)}</span>` : ""}
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
        </div>` : ""}
      </div>
      ${d.direccionMapa ? `<a class="btn-outline" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
  </div>` : ""}

  ${d.dressCode ? `<div class="card-section on-wine-deep">
    <div class="inner">
      ${ornamentDividerSvg("icon-ornament")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-wine">
    <div class="inner">
      ${gemRowSvg("icon-row")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-cream">
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer class="on-wine-deep">
    <div class="gold-bar" style="position:absolute;top:0;left:0;right:0;"></div>
    ${cornerRoyalSvg("corner-royal bl")}
    ${cornerRoyalSvg("corner-royal br")}
    <p class="thanks">Muchas gracias</p>
    <small>Los espero de gala, con el corazón agradecido</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(160deg,#4a1020 0%,#2e0a15 60%,#3a0d1a 100%);overflow:hidden;">
    <svg style="position:absolute;top:8px;left:8px;width:32px;height:32px;color:#d4af37;opacity:.85;" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 46 V4 H46" stroke="currentColor" stroke-width="2.4"/><path d="M16 22c5-9 18-9 22 0-4 7-14 9-22 0Z" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>
    <svg style="position:absolute;bottom:8px;right:8px;width:32px;height:32px;color:#d4af37;opacity:.85;transform:scale(-1,-1);" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 46 V4 H46" stroke="currentColor" stroke-width="2.4"/><path d="M16 22c5-9 18-9 22 0-4 7-14 9-22 0Z" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>
    <svg style="width:30px;height:26px;color:#d4af37;" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10,90 L10,50 L28,64 L40,20 L60,46 L80,20 L92,64 L110,50 L110,90 Z" fill="currentColor"/><path d="M8,86 H112 V94 H8 Z" fill="currentColor"/></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#d4af37;">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;color:#f7ecd8;">${esc(d.name)}</span>
    <span style="width:80px;height:2px;background:linear-gradient(90deg,#7a5c17,#d4af37,#7a5c17);opacity:.85;"></span>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Realeza Dorada",
  summary: "Borgoña profundo y dorado brillante con un halo de luz que recorre lento el marco y la corona, como en un palacio — una coronación de quince años.",
  accent: "#d4af37", accent2: "#4a1020", schema: xvSchema, sampleData, render, cardPreview,
};
