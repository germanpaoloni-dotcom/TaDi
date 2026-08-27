const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-elegante-perlas";

const sampleData = {
  nombre: "Carla Lizhet",
  fecha: "2027-05-26",
  horaCeremonia: "19:30",
  lugarCeremonia: "Salón Garden House",
  horaFiesta: "21:00",
  lugarFiesta: "Salón Garden House, Montero",
  direccionMapa: "https://maps.google.com/?q=Salon+Garden+House+Montero",
  padres: "Rodrigo Gómez Flores y Jhoana Pérez Mendieta",
  mensaje: "Con el corazón lleno de ilusión, quiero compartir con ustedes la noche en la que cumplo un sueño. Los espero para celebrar juntos esta nueva etapa.",
  dressCode: "Formal, tonos azul noche y marfil",
  whatsapp: "5491155556666",
  coverImage: "https://images.unsplash.com/photo-1763959949927-b86ed20b3290?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  ],
};

// Motivos dibujados a mano en SVG inline: perlas, filete ornamental,
// flores de línea fina para las esquinas y un borde de "papel rasgado"
// entre secciones. Sin dependencias externas, todo currentColor.
function pearlRowSvg(cls = "") {
  const pearls = Array.from({ length: 9 })
    .map((_, i) => `<circle cx="${10 + i * 25}" cy="14" r="5.4" fill="currentColor" opacity="${i % 2 === 0 ? 1 : 0.5}"/>`)
    .join("");
  return `<svg class="${cls}" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="14" x2="220" y2="14" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    ${pearls}
  </svg>`;
}

function ornamentSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="15" x2="80" y2="15" stroke="currentColor" stroke-width="1"/>
    <line x1="120" y1="15" x2="200" y2="15" stroke="currentColor" stroke-width="1"/>
    <circle cx="100" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1"/>
    <circle cx="100" cy="15" r="1.5" fill="currentColor"/>
    <path d="M86 15 Q93 8 100 15 Q107 8 114 15" stroke="currentColor" stroke-width="1" fill="none"/>
  </svg>`;
}

// Flor de línea fina para las esquinas (estilo botánico dibujado a mano,
// evoca las orquídeas/flores pálidas de la referencia).
function cornerFloralSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.1" fill="none" stroke-linecap="round">
      <path d="M4 40 C 30 10, 60 6, 90 4"/>
      <path d="M6 60 C 40 40, 55 30, 60 4"/>
      <ellipse cx="34" cy="18" rx="13" ry="8" transform="rotate(-30 34 18)"/>
      <ellipse cx="34" cy="18" rx="13" ry="8" transform="rotate(30 34 18)"/>
      <ellipse cx="34" cy="18" rx="13" ry="8" transform="rotate(90 34 18)"/>
      <circle cx="34" cy="18" r="4" fill="currentColor" stroke="none"/>
      <ellipse cx="72" cy="26" rx="10" ry="6" transform="rotate(-20 72 26)"/>
      <ellipse cx="72" cy="26" rx="10" ry="6" transform="rotate(40 72 26)"/>
      <circle cx="72" cy="26" r="3" fill="currentColor" stroke="none"/>
      <path d="M12 48 Q22 44 26 54 Q16 56 12 48Z"/>
      <path d="M20 66 Q30 60 38 68 Q28 74 20 66Z"/>
      <circle cx="88" cy="10" r="2.4" fill="currentColor" stroke="none"/>
      <circle cx="8 " cy="70" r="2" fill="currentColor" stroke="none"/>
    </g>
  </svg>`;
}

// Borde de papel rasgado entre secciones: un trazo irregular relleno con
// currentColor (el color de fondo de la sección que empieza), superpuesto
// sobre el final de la sección anterior para dar el efecto de "corte" a
// mano, tal como en la referencia (paneles blancos que se rasgan sobre
// el fondo azul noche).
function tornEdgeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 400 28" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0,28 L0,11 L14,18 L26,4 L40,14 L54,2 L68,16 L82,6 L96,20 L110,3 L124,15 L138,8 L152,22 L166,5 L180,17 L194,9 L208,24 L222,4 L236,14 L250,7 L264,19 L278,2 L292,16 L306,10 L320,22 L334,5 L348,15 L362,8 L376,20 L390,4 L400,12 L400,28 Z" fill="currentColor"/>
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

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Dos tonos de la misma gama: uno afinado para leerse sobre el azul
  // noche (secciones oscuras) y otro para leerse sobre el marfil perla
  // (secciones claras) — así el detalle nunca pierde contraste al
  // cambiar de sección, sea cual sea la gama elegida.
  const accentOnNavy = getPaletteColor(d.colorPalette, "dark", "#d9dfec");
  const accentOnPearl = getPaletteColor(d.colorPalette, "light", "#3c4a70");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-perlas");
  const gal = galleryWidget(d.galeria || [], "gal-perlas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      diaSemana = dt.toLocaleDateString("es-AR", { weekday: "long" });
      diaNumero = String(dt.getDate());
      mesAnio = dt.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    } catch { diaNumero = ""; }
  }

  const tornToPearl = `<div class="torn-top" style="color:var(--pearl)">${tornEdgeSvg()}</div>`;
  const tornToNavy = `<div class="torn-top" style="color:var(--navy)">${tornEdgeSvg()}</div>`;
  const tornToNavyDeep = `<div class="torn-top" style="color:var(--navy-deep)">${tornEdgeSvg()}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Marcellus&display=swap" rel="stylesheet">
<style>
  :root{
    --navy:#101a30;
    --navy-deep:#0a1120;
    --pearl:#f8f5ec;
    --pearl-dim:#c9cddb;
    --accent-navy:${accentOnNavy};
    --accent-pearl:${accentOnPearl};
    --ink:#1c2438;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--navy);color:var(--pearl);line-height:1.7;font-size:1.05rem;}
  h1,h2{font-family:'Marcellus',serif;font-weight:400;}
  p{margin:0 0 0;}

  .icon{width:clamp(30px,7vw,40px);height:auto;}
  .icon-row{width:clamp(120px,34vw,190px);height:auto;margin:18px auto;display:block;}
  .icon-row.pearl-shimmer{animation:pearlShimmer 9s ease-in-out infinite;}
  .icon-ornament{width:clamp(120px,38vw,170px);height:auto;margin:20px auto;display:block;}

  .corner-floral{position:absolute;width:clamp(72px,20vw,120px);height:auto;opacity:.9;pointer-events:none;animation:floralGlow 10s ease-in-out infinite;}
  .corner-floral.tl{top:22px;left:16px;}
  .corner-floral.tr{top:22px;right:16px;transform:scaleX(-1);animation-delay:2.5s;}
  .corner-floral.bl{bottom:22px;left:16px;transform:scaleY(-1);animation-delay:5s;}
  .corner-floral.br{bottom:22px;right:16px;transform:scale(-1,-1);animation-delay:7.5s;}

  /* ---------- brillo perlado sutil ---------- */
  @keyframes floralGlow{
    0%,100%{opacity:.62;filter:drop-shadow(0 0 0 transparent);}
    50%{opacity:1;filter:drop-shadow(0 0 5px rgba(217,223,236,.5));}
  }
  @keyframes pearlShimmer{
    0%,100%{filter:brightness(1) drop-shadow(0 0 0 rgba(217,223,236,0));}
    50%{filter:brightness(1.16) drop-shadow(0 0 7px rgba(217,223,236,.4));}
  }
  @media (prefers-reduced-motion: reduce){
    .corner-floral,.photo-frame,.icon-row.pearl-shimmer{animation:none !important;filter:none !important;}
  }

  /* ---------- bordes de "papel rasgado" entre secciones ---------- */
  .torn-top{position:absolute;top:0;left:0;width:100%;height:26px;transform:translateY(-99%);line-height:0;pointer-events:none;z-index:2;}
  .torn-top svg{display:block;width:100%;height:100%;}

  .card-section{position:relative;padding:clamp(56px,10vw,92px) 22px;}
  .card-section.on-navy{background:var(--navy);color:var(--pearl);}
  .card-section.on-navy-deep{background:var(--navy-deep);color:var(--pearl);}
  .card-section.on-pearl{background:var(--pearl);color:var(--ink);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .on-navy .icon,.on-navy-deep .icon,.on-navy .icon-row,.on-navy-deep .icon-row,.on-navy .icon-ornament,.on-navy-deep .icon-ornament,.on-navy .corner-floral,.on-navy-deep .corner-floral{color:var(--accent-navy);}
  .on-pearl .icon,.on-pearl .icon-row,.on-pearl .icon-ornament,.on-pearl .corner-floral{color:var(--accent-pearl);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.8rem);margin:0 0 10px;}
  .on-navy .eyebrow,.on-navy-deep .eyebrow{color:var(--accent-navy);}
  .on-pearl .eyebrow{color:var(--accent-pearl);}

  h1.brand-title{font-size:clamp(2.1rem,8vw,3.4rem);letter-spacing:4px;margin:6px 0 22px;text-transform:uppercase;font-weight:400;color:var(--pearl);}

  .photo-frame{max-width:250px;margin:8px auto 26px;padding:8px;border:1px solid var(--accent-navy);animation:pearlShimmer 8s ease-in-out infinite;}
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--accent-navy);opacity:.7;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-navy);}
  .date-block .day{font-family:'Marcellus',serif;font-size:clamp(1.9rem,6vw,2.7rem);color:var(--pearl);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-navy);text-align:left;}

  h2{font-size:clamp(1.15rem,3vw,1.55rem);text-transform:uppercase;letter-spacing:5px;font-weight:400;margin:0 0 26px;}
  .on-navy h2,.on-navy-deep h2{color:var(--pearl);}
  .on-pearl h2{color:var(--ink);}
  h2 .sub{display:block;font-family:'Cormorant Garamond',serif;text-transform:none;letter-spacing:0;font-style:italic;font-size:.72rem;margin-top:6px;}
  .on-navy h2 .sub,.on-navy-deep h2 .sub{color:var(--pearl-dim);}
  .on-pearl h2 .sub{color:#6a7186;}

  .padres{font-style:italic;font-size:clamp(1rem,2.3vw,1.12rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.8rem;margin:0 0 14px;color:var(--accent-pearl);}
  .mensaje-txt{font-size:clamp(1rem,2.2vw,1.15rem);max-width:520px;margin:0 auto;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{border:1px solid var(--accent-navy);padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;}
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.4rem,3.6vw,2rem);color:var(--pearl);display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent-navy);}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--accent-pearl);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--pearl);border:1px solid var(--accent-pearl);color:var(--accent-pearl);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Marcellus',serif;font-weight:400;color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-size:.8rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--accent-pearl);font-size:.88rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:#4a5066;}

  .btn-outline{display:inline-block;margin-top:22px;padding:12px 28px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;font-weight:600;border-radius:0;cursor:pointer;transition:background .2s,color .2s;font-family:'Cormorant Garamond',serif;}
  .on-pearl .btn-outline{border:1px solid var(--ink);color:var(--ink);}
  .on-pearl .btn-outline:hover{background:var(--ink);color:var(--pearl);}
  .on-navy .btn-outline,.on-navy-deep .btn-outline{border:1px solid var(--pearl);color:var(--pearl);}
  .on-navy .btn-outline:hover,.on-navy-deep .btn-outline:hover{background:var(--pearl);color:var(--navy);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--accent-navy);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;filter:saturate(.92);}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,10,20,.94);z-index:50;align-items:center;justify-content:center;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--pearl);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:#6a7186;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border:1px solid #ccd0dc;background:#fff;color:var(--ink);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#9aa0b3;}
  .rsvp-form button{background:var(--ink);border:0;color:var(--pearl);font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;padding:13px;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--navy);}
  .rsvp-whatsapp{color:var(--accent-pearl);font-size:.88rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#3c7a5c;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-pearl);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;}
  footer .thanks{font-family:'Marcellus',serif;font-size:clamp(1.2rem,4vw,1.5rem);letter-spacing:2px;text-transform:uppercase;color:var(--pearl);position:relative;z-index:1;}
  footer small{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.92rem;color:var(--pearl-dim);opacity:.85;margin-top:12px;position:relative;z-index:1;}
</style></head>
<body>

  <div class="card-section on-navy hero-section">
    ${cornerFloralSvg("corner-floral tl")}
    ${cornerFloralSvg("corner-floral tr")}
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

  ${(d.mensaje || d.padres) ? `<div class="card-section on-pearl">
    ${tornToPearl}
    <div class="inner">
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-navy">
    ${tornToNavy}
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-pearl">
    ${tornToPearl}
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

  ${d.dressCode ? `<div class="card-section on-navy-deep">
    ${tornToNavyDeep}
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-navy">
    ${tornToNavy}
    <div class="inner">
      ${pearlRowSvg("icon-row pearl-shimmer")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-pearl">
    ${tornToPearl}
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer class="on-navy-deep">
    ${tornToNavyDeep}
    ${cornerFloralSvg("corner-floral bl")}
    ${cornerFloralSvg("corner-floral br")}
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
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(160deg,#101a30 0%,#0a1120 60%,#141f38 100%);overflow:hidden;">
    <svg style="position:absolute;top:8px;left:8px;width:34px;height:34px;color:#c9cddb;opacity:.85;" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 40 C 30 10, 60 6, 90 4" stroke="currentColor" stroke-width="2.4" fill="none"/><ellipse cx="34" cy="18" rx="13" ry="8" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="34" cy="18" r="4" fill="currentColor"/></svg>
    <svg style="position:absolute;bottom:8px;right:8px;width:34px;height:34px;color:#c9cddb;opacity:.85;transform:scale(-1,-1);" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 40 C 30 10, 60 6, 90 4" stroke="currentColor" stroke-width="2.4" fill="none"/><ellipse cx="34" cy="18" rx="13" ry="8" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="34" cy="18" r="4" fill="currentColor"/></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#c9cddb;">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;color:#f8f5ec;">${esc(d.name)}</span>
    <svg style="width:80px;height:10px;color:#c9cddb;opacity:.8;" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="0" y1="14" x2="220" y2="14" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="10" cy="14" r="5.4" fill="currentColor"/><circle cx="60" cy="14" r="5.4" fill="currentColor" opacity=".5"/><circle cx="110" cy="14" r="5.4" fill="currentColor"/><circle cx="160" cy="14" r="5.4" fill="currentColor" opacity=".5"/><circle cx="210" cy="14" r="5.4" fill="currentColor"/></svg>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Elegante Perlas",
  summary: "Azul noche profundo y marfil perla, bordes de papel rasgado y flores de línea fina — una boutique de gran elegancia.",
  accent: "#d9dfec", accent2: "#101a30", schema: xvSchema, sampleData, render, cardPreview,
};
