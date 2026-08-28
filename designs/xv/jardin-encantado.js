const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-jardin-encantado";

const sampleData = {
  nombre: "Delfina Ríos",
  fecha: "2027-11-06",
  horaCeremonia: "18:30",
  lugarCeremonia: "Capilla del Bosque",
  horaFiesta: "20:30",
  lugarFiesta: "Quinta Los Aromos",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Aromos",
  padres: "Sebastián Ríos y Carla Bonetto",
  mensaje: "Como en los cuentos que más me gustan, quiero que esta noche sea mágica. Los invito a celebrar conmigo en un jardín lleno de luces, entre risas y baile.",
  dressCode: "Formal primaveral, tonos pastel bienvenidos",
  whatsapp: "5491100000066",
  fechaLimiteRSVP: "2027-10-10",
  coverImage: "https://images.unsplash.com/photo-1762394947969-b798082075fa?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1675410531788-6f8c355797b0?w=800&q=80",
    "https://images.unsplash.com/photo-1616902601835-7be89a25bc46?w=800&q=80",
    "https://images.unsplash.com/photo-1625107662075-bc9933af04f5?w=800&q=80",
  ],
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// --- Motivos dibujados a mano en SVG inline: enredaderas, hojas finas y
// ornamentos de jardín. Todo currentColor, sin dependencias externas —
// evocan un jardín secreto, no las rosas boho ni las perlas de gala. ---

function vineRowSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 220 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 15 C 40 2, 70 28, 110 15 C 150 2, 180 28, 216 15" stroke="currentColor" stroke-width="1" fill="none"/>
    <ellipse cx="30" cy="9" rx="7" ry="3.2" transform="rotate(-25 30 9)" fill="currentColor" opacity=".85"/>
    <ellipse cx="60" cy="23" rx="7" ry="3.2" transform="rotate(25 60 23)" fill="currentColor" opacity=".85"/>
    <ellipse cx="95" cy="9" rx="7" ry="3.2" transform="rotate(-25 95 9)" fill="currentColor" opacity=".85"/>
    <ellipse cx="130" cy="23" rx="7" ry="3.2" transform="rotate(25 130 23)" fill="currentColor" opacity=".85"/>
    <ellipse cx="165" cy="9" rx="7" ry="3.2" transform="rotate(-25 165 9)" fill="currentColor" opacity=".85"/>
    <ellipse cx="196" cy="23" rx="7" ry="3.2" transform="rotate(25 196 23)" fill="currentColor" opacity=".85"/>
    <circle cx="110" cy="15" r="2.2" fill="currentColor"/>
  </svg>`;
}

function vineCornerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 4 C 42 6, 48 40, 20 56 C 62 50, 72 90, 46 120" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="20" rx="9" ry="4.4" transform="rotate(-30 34 20)" fill="currentColor"/>
    <ellipse cx="13" cy="46" rx="8" ry="4" transform="rotate(50 13 46)" fill="currentColor"/>
    <ellipse cx="52" cy="72" rx="9" ry="4.4" transform="rotate(-20 52 72)" fill="currentColor"/>
    <ellipse cx="37" cy="104" rx="8" ry="4" transform="rotate(40 37 104)" fill="currentColor"/>
    <circle cx="6" cy="4" r="2.4" fill="currentColor"/>
  </svg>`;
}

function leafDividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="13" x2="58" y2="13" stroke="currentColor" stroke-width="1"/>
    <line x1="102" y1="13" x2="160" y2="13" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="80" cy="14" rx="10" ry="5" transform="rotate(-18 80 14)" fill="none" stroke="currentColor" stroke-width="1"/>
    <path d="M80 14 Q80 6 87 3" stroke="currentColor" stroke-width="1" fill="none"/>
    <circle cx="87" cy="3" r="1.6" fill="currentColor"/>
  </svg>`;
}

function iconArchSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 34 V20 C8 11 13 6 20 6 C27 6 32 11 32 20 V34" stroke="currentColor" stroke-width="1.6"/>
    <path d="M8 34 H32" stroke="currentColor" stroke-width="1.6"/>
    <ellipse cx="14" cy="16" rx="3.2" ry="1.6" transform="rotate(-30 14 16)" fill="currentColor"/>
    <ellipse cx="26" cy="16" rx="3.2" ry="1.6" transform="rotate(30 26 16)" fill="currentColor"/>
    <ellipse cx="20" cy="9" rx="3.2" ry="1.6" fill="currentColor"/>
  </svg>`;
}

function iconLanternSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 V9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 9 H28 L25 30 H15 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <line x1="12" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="20" cy="23" r="2" fill="currentColor"/>
    <path d="M15 30 L14 36 H26 L25 30" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function iconDressSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 C17 4 15 7 15 9 L9 15 L13 19 L15 17 V36 H25 V17 L27 19 L31 15 L25 9 C25 7 23 4 20 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="26" cy="6" rx="3" ry="1.5" transform="rotate(-20 26 6)" fill="currentColor"/>
  </svg>`;
}

// --- Campo de luciérnagas: pequeños puntos de luz cálida que flotan muy
// despacio hacia arriba con vaivén lateral y parpadeo, como en un jardín
// al anochecer. Posiciones deterministas (no Math.random) para que el
// render sea estable; cada una usa una de tres variantes de recorrido. ---
function fireflyField(count, idPrefix) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const left = (7 + (i * 61) % 88).toFixed(1);
    const bottom = ((i * 17) % 46).toFixed(1);
    const size = (5 + (i % 4) * 1).toFixed(1);
    const delay = ((i * 0.83) % 9).toFixed(2);
    const dur = (6 + (i % 5) * 1).toFixed(2);
    const variant = (i % 3) + 1;
    items.push(
      `<span class="firefly ff-v${variant}" style="left:${left}%;bottom:${bottom}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;"></span>`
    );
  }
  return `<div class="firefly-field" aria-hidden="true" id="${idPrefix}">${items.join("")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accentOnDusk = getPaletteColor(d.colorPalette, "dark", "#e3cf94");
  const accentOnBlush = getPaletteColor(d.colorPalette, "light", "#6f8256");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-jardin");
  const gal = galleryWidget(d.galeria || [], "gal-jardin");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-").map(Number);
    if (partes.length === 3 && !partes.some(isNaN)) {
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
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
  :root{
    --dusk:#333f2c;
    --dusk-deep:#1c2418;
    --blush:#faf1ea;
    --cream:#fffaf4;
    --ink:#3c3326;
    --ink-soft:#7d715e;
    --accent-dusk:${accentOnDusk};
    --accent-blush:${accentOnBlush};
    --gold:#c9a24d;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--dusk-deep);color:var(--blush);line-height:1.7;font-size:1.05rem;}
  h1,h2{font-family:'Playfair Display',serif;font-weight:400;}
  p{margin:0;}

  .icon{width:clamp(30px,7vw,40px);height:auto;}
  .icon-row{width:clamp(130px,36vw,190px);height:auto;margin:18px auto;display:block;}
  .icon-divider{width:clamp(120px,34vw,160px);height:auto;margin:18px auto;display:block;}

  .vine-corner{position:absolute;width:clamp(70px,20vw,118px);height:auto;opacity:.9;pointer-events:none;z-index:2;}
  .vine-corner.tl{top:20px;left:14px;}
  .vine-corner.tr{top:20px;right:14px;transform:scaleX(-1);}
  .vine-corner.bl{bottom:20px;left:14px;transform:scaleY(-1);}
  .vine-corner.br{bottom:20px;right:14px;transform:scale(-1,-1);}

  /* ---------- luciérnagas: luces cálidas flotando despacio ---------- */
  .firefly-field{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;}
  .firefly{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff7de 0%,var(--gold) 55%,rgba(201,162,77,0) 100%);box-shadow:0 0 8px 2px rgba(201,162,77,.85),0 0 3px 1px rgba(255,247,222,.9);opacity:0;animation-iteration-count:infinite;animation-timing-function:ease-in-out;will-change:transform,opacity;}
  .ff-v1{animation-name:fireflyDrift1;}
  .ff-v2{animation-name:fireflyDrift2;}
  .ff-v3{animation-name:fireflyDrift3;}
  @keyframes fireflyDrift1{
    0%{transform:translate(0,0);opacity:0;}
    8%{opacity:.85;}
    25%{transform:translate(16px,-45px);opacity:.3;}
    45%{opacity:.9;}
    50%{transform:translate(-14px,-95px);opacity:.35;}
    70%{opacity:.85;}
    75%{transform:translate(18px,-150px);opacity:.3;}
    92%{opacity:0;}
    100%{transform:translate(4px,-190px);opacity:0;}
  }
  @keyframes fireflyDrift2{
    0%{transform:translate(0,0);opacity:0;}
    10%{opacity:.8;}
    25%{transform:translate(-18px,-40px);opacity:.3;}
    50%{transform:translate(12px,-90px);opacity:.9;}
    75%{transform:translate(-16px,-135px);opacity:.35;}
    94%{opacity:0;}
    100%{transform:translate(-4px,-170px);opacity:0;}
  }
  @keyframes fireflyDrift3{
    0%{transform:translate(0,0);opacity:0;}
    12%{opacity:.75;}
    30%{transform:translate(10px,-55px);opacity:.4;}
    55%{transform:translate(-12px,-110px);opacity:.85;}
    78%{transform:translate(8px,-160px);opacity:.3;}
    95%{opacity:0;}
    100%{transform:translate(0,-200px);opacity:0;}
  }
  @media (prefers-reduced-motion:reduce){
    .firefly{animation:none !important;opacity:.4 !important;}
  }

  .card-section{position:relative;padding:clamp(56px,10vw,92px) 22px;}
  .card-section.on-dusk{background:radial-gradient(ellipse at 50% -10%,rgba(201,162,77,.16),transparent 60%),linear-gradient(180deg,var(--dusk) 0%,var(--dusk-deep) 100%);color:var(--blush);}
  .card-section.on-dusk-deep{background:var(--dusk-deep);color:var(--blush);}
  .card-section.on-blush{background:var(--blush);color:var(--ink);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:2;}

  .on-dusk .icon,.on-dusk-deep .icon,.on-dusk .icon-row,.on-dusk-deep .icon-row,.on-dusk .icon-divider,.on-dusk-deep .icon-divider,.on-dusk .vine-corner,.on-dusk-deep .vine-corner{color:var(--accent-dusk);}
  .on-blush .icon,.on-blush .icon-row,.on-blush .icon-divider,.on-blush .vine-corner{color:var(--accent-blush);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.64rem,1.6vw,.78rem);margin:0 0 10px;font-style:italic;}
  .on-dusk .eyebrow,.on-dusk-deep .eyebrow{color:var(--accent-dusk);}
  .on-blush .eyebrow{color:var(--accent-blush);}

  h1.brand-title{font-size:clamp(2.2rem,8vw,3.5rem);letter-spacing:2px;margin:6px 0 22px;font-weight:400;color:var(--cream);font-style:italic;}

  .photo-frame{max-width:220px;margin:8px auto 26px;padding:10px;border:1px solid var(--accent-dusk);border-radius:50%;position:relative;}
  .photo-frame .ring{border-radius:50%;overflow:hidden;aspect-ratio:1/1;border:1px solid rgba(250,241,234,.35);}
  .photo-frame img{width:100%;height:100%;display:block;object-fit:cover;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--accent-dusk);opacity:.75;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-dusk);}
  .date-block .day{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,6vw,2.7rem);color:var(--cream);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--accent-dusk);text-align:left;}

  h2{font-size:clamp(1.15rem,3vw,1.55rem);text-transform:uppercase;letter-spacing:4px;font-weight:400;margin:0 0 26px;}
  .on-dusk h2,.on-dusk-deep h2{color:var(--cream);}
  .on-blush h2{color:var(--ink);}
  h2 .sub{display:block;font-family:'Cormorant Garamond',serif;text-transform:none;letter-spacing:0;font-style:italic;font-size:.74rem;margin-top:6px;}
  .on-dusk h2 .sub,.on-dusk-deep h2 .sub{color:rgba(250,241,234,.65);}
  .on-blush h2 .sub{color:var(--ink-soft);}

  .padres{font-style:italic;font-size:clamp(1rem,2.3vw,1.12rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.8rem;margin:0 0 14px;color:var(--accent-blush);}
  .mensaje-txt{font-size:clamp(1rem,2.2vw,1.15rem);max-width:520px;margin:0 auto;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{border:1px solid var(--accent-dusk);border-radius:8px;padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;background:rgba(250,241,234,.03);}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,3.6vw,2rem);color:var(--cream);display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--accent-dusk);}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--accent-blush);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--blush);border:1px solid var(--accent-blush);color:var(--accent-blush);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Playfair Display',serif;font-weight:400;color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-size:.8rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--accent-blush);font-size:.88rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:var(--ink-soft);}

  .btn-outline{display:inline-block;margin-top:22px;padding:12px 28px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;font-weight:600;border-radius:20px;cursor:pointer;transition:background .2s,color .2s;font-family:'Cormorant Garamond',serif;}
  .on-blush .btn-outline{border:1px solid var(--ink);color:var(--ink);}
  .on-blush .btn-outline:hover{background:var(--ink);color:var(--blush);}
  .on-dusk .btn-outline,.on-dusk-deep .btn-outline{border:1px solid var(--cream);color:var(--cream);}
  .on-dusk .btn-outline:hover,.on-dusk-deep .btn-outline:hover{background:var(--cream);color:var(--dusk-deep);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--accent-blush);border-radius:10px;}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;filter:saturate(.95);}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,14,8,.94);z-index:50;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--blush);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border:1px solid #ddd0be;border-radius:6px;background:#fff;color:var(--ink);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#a89e8c;}
  .rsvp-form button{background:var(--ink);border:0;border-radius:20px;color:var(--blush);font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;padding:13px;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:#584a34;}
  .rsvp-whatsapp{color:var(--accent-blush);font-size:.88rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#4f7a48;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-blush);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;}
  footer .thanks{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.3rem,4vw,1.6rem);letter-spacing:1px;color:var(--cream);position:relative;z-index:2;}
  footer small{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.92rem;color:rgba(250,241,234,.75);margin-top:12px;position:relative;z-index:2;}
</style></head>
<body>

  <div class="card-section on-dusk">
    ${fireflyField(14, "ff-hero")}
    ${vineCornerSvg("vine-corner tl")}
    ${vineCornerSvg("vine-corner tr")}
    <div class="inner">
      <p class="eyebrow">Mis quince años</p>
      <h1 class="brand-title">${esc(d.nombre)}</h1>
      ${d.coverImage ? `<div class="photo-frame"><div class="ring"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}" loading="lazy"></div></div>` : ""}
      ${d.fecha ? `<div class="date-block">
        <span class="line"></span>
        <span class="dow">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNumero)}</span>
        <span class="my">${esc(mesAnio)}</span>
        <span class="line"></span>
      </div>` : ""}
    </div>
  </div>

  ${(d.mensaje || d.padres) ? `<div class="card-section on-blush">
    <div class="inner">
      ${leafDividerSvg("icon-divider")}
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-dusk">
    ${fireflyField(8, "ff-countdown")}
    <div class="inner">
      ${vineRowSvg("icon-row")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-blush">
    <div class="inner">
      <p class="eyebrow">Ubicación</p>
      <h2>Cuándo y dónde</h2>
      <div class="timeline">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="node">
          <span class="badge">${iconArchSvg()}</span>
          <strong>Ceremonia</strong>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="node">
          <span class="badge">${iconLanternSvg()}</span>
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
      ${leafDividerSvg("icon-divider")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-blush">
    <div class="inner">
      ${vineRowSvg("icon-row")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-blush">
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer class="on-dusk-deep">
    ${fireflyField(8, "ff-footer")}
    ${vineCornerSvg("vine-corner bl")}
    ${vineCornerSvg("vine-corner br")}
    <p class="thanks">Muchas gracias</p>
    <small>Los espero en el jardín, entre luces y flores</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:radial-gradient(ellipse at 50% -10%,rgba(201,162,77,.22),transparent 60%),linear-gradient(160deg,#333f2c 0%,#1c2418 70%);overflow:hidden;">
    <span style="position:absolute;top:14%;left:18%;width:5px;height:5px;border-radius:50%;background:#c9a24d;box-shadow:0 0 8px 3px rgba(201,162,77,.85);"></span>
    <span style="position:absolute;top:30%;right:20%;width:4px;height:4px;border-radius:50%;background:#f7deac;box-shadow:0 0 6px 2px rgba(201,162,77,.7);"></span>
    <span style="position:absolute;bottom:22%;left:28%;width:4px;height:4px;border-radius:50%;background:#c9a24d;box-shadow:0 0 6px 2px rgba(201,162,77,.7);"></span>
    <svg style="position:absolute;top:8px;left:8px;width:32px;height:32px;color:#e3cf94;opacity:.85;" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 4 C 42 6, 48 40, 20 56" stroke="currentColor" stroke-width="2.2" fill="none"/><ellipse cx="34" cy="20" rx="8" ry="4" fill="currentColor"/></svg>
    <svg style="position:absolute;bottom:8px;right:8px;width:32px;height:32px;color:#e3cf94;opacity:.85;transform:scale(-1,-1);" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 4 C 42 6, 48 40, 20 56" stroke="currentColor" stroke-width="2.2" fill="none"/><ellipse cx="34" cy="20" rx="8" ry="4" fill="currentColor"/></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#e3cf94;">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:1.1rem;letter-spacing:1px;color:#fffaf4;">${esc(d.name)}</span>
    <svg style="width:80px;height:10px;color:#e3cf94;opacity:.85;" viewBox="0 0 220 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 15 C 40 2, 70 28, 110 15 C 150 2, 180 28, 216 15" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="110" cy="15" r="2.2" fill="currentColor"/></svg>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Jardín Encantado",
  summary: "Verde salvia, blush y dorado tenue con luciérnagas flotando despacio al anochecer — un jardín encantado para celebrar los quince.",
  accent: "#8a9b6f", accent2: "#c9a24d", schema: xvSchema, sampleData, render, cardPreview,
};
