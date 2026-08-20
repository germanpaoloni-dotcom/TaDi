const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
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
  dressCode: "Formal, tonos verde botella y dorado",
  whatsapp: "5491155556666",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  ],
};

// Motivos dibujados a mano en SVG inline: tiara con gemas, hilera de perlas,
// filete ornamental y flores de línea fina para las esquinas. Sin dependencias externas.
function crownSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 58 L16 22 L36 42 L60 14 L84 42 L104 22 L110 58" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <path d="M8 62 L112 62" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M8 68 L112 68" stroke="currentColor" stroke-width="1" opacity=".55"/>
    <circle cx="16" cy="22" r="3.2" fill="currentColor"/>
    <circle cx="60" cy="14" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="60" cy="14" r="1.7" fill="currentColor"/>
    <circle cx="104" cy="22" r="3.2" fill="currentColor"/>
    <circle cx="36" cy="42" r="2" fill="currentColor"/>
    <circle cx="84" cy="42" r="2" fill="currentColor"/>
  </svg>`;
}

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

// Flor de línea fina para las esquinas (estilo botánico dibujado a mano).
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
  const accent = getPaletteColor(d.colorPalette, "dark", "#c9a961");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-perlas");
  const gal = galleryWidget(d.galeria || [], "gal-perlas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  let fechaLarga = "";
  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      fechaLarga = dt.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      diaSemana = dt.toLocaleDateString("es-AR", { weekday: "long" });
      diaNumero = String(dt.getDate());
      mesAnio = dt.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    } catch { fechaLarga = d.fecha; }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Great+Vibes&family=Marcellus&display=swap" rel="stylesheet">
<style>
  :root{
    --green:#1b3b2c;
    --green-deep:#122a1f;
    --gold:${accent};
    --gold-light:color-mix(in srgb, ${accent}, white 48%);
    --cream:#f3ede0;
    --ink:#122a1f;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--green);color:var(--cream);line-height:1.65;}
  h1,h2{font-family:'Marcellus',serif;}
  .script-font{font-family:'Great Vibes',cursive;}
  .icon{color:var(--gold);width:clamp(46px,10vw,66px);height:auto;}
  .icon-row{color:var(--gold);width:clamp(130px,38vw,210px);height:auto;margin:16px auto;display:block;}
  .icon-ornament{color:var(--gold);width:clamp(130px,42vw,190px);height:auto;margin:18px auto;display:block;}

  .corner-floral{position:absolute;width:clamp(80px,22vw,140px);height:auto;color:var(--gold);opacity:.75;pointer-events:none;}
  .corner-floral.tl{top:14px;left:14px;}
  .corner-floral.tr{top:14px;right:14px;transform:scaleX(-1);}
  .corner-floral.bl{bottom:14px;left:14px;transform:scaleY(-1);}
  .corner-floral.br{bottom:14px;right:14px;transform:scale(-1,-1);}

  .card-section{position:relative;padding:clamp(50px,9vw,80px) 22px;overflow:hidden;border-top:1px solid color-mix(in srgb, ${accent} 25%, transparent);}
  .card-section:first-of-type{border-top:none;}
  .card-section.alt{background:var(--green-deep);}

  .card-section > .inner{max-width:720px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .eyebrow{letter-spacing:6px;text-transform:uppercase;font-size:clamp(.68rem,1.6vw,.85rem);color:var(--gold-light);margin:0 0 6px;}
  h1.brand-title{font-size:clamp(1.7rem,6vw,2.7rem);letter-spacing:6px;margin:8px 0 4px;color:var(--gold);text-transform:uppercase;}

  .photo-frame{
    max-width:320px;margin:26px auto;padding:10px;border:1px solid var(--gold);
  }
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;}

  .name-script{font-family:'Great Vibes',cursive;font-size:clamp(2.4rem,9vw,4rem);color:var(--gold);margin:10px 0;}
  .blessing{text-transform:uppercase;letter-spacing:1px;font-size:.85rem;color:var(--gold-light);margin:18px 0 6px;}
  .padres{font-style:italic;font-size:clamp(1rem,2.4vw,1.15rem);color:var(--cream);margin:0 0 18px;}
  .invite-line{text-transform:uppercase;letter-spacing:1px;font-size:.85rem;color:var(--gold-light);margin-top:10px;}
  .invite-line strong{display:block;color:var(--cream);margin-top:4px;letter-spacing:2px;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:14px;margin:26px auto 4px;flex-wrap:wrap;}
  .date-block .line{flex:1;min-width:24px;max-width:70px;height:1px;background:var(--gold);opacity:.6;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.8rem;color:var(--gold-light);}
  .date-block .day{font-family:'Marcellus',serif;font-size:clamp(2.2rem,7vw,3.4rem);color:var(--gold);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.8rem;color:var(--gold-light);text-align:left;}

  h2{
    font-size:clamp(1.05rem,2.6vw,1.4rem);
    color:var(--gold);
    text-transform:uppercase;
    letter-spacing:3px;
    font-weight:500;
    margin:0 0 10px;
  }
  p{font-size:clamp(1rem,2.2vw,1.15rem);}

  .countdown{display:flex;gap:clamp(8px,2vw,18px);justify-content:center;flex-wrap:wrap;}
  .countdown div{
    background:color-mix(in srgb, ${accent} 8%, transparent);
    border:1px solid var(--gold);
    border-radius:4px;
    padding:clamp(10px,2vw,18px) clamp(12px,2.5vw,22px);
    min-width:70px;
  }
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.5rem,4vw,2.2rem);color:var(--gold);display:block;}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold-light);}

  .timeline{max-width:440px;margin:28px auto 0;text-align:left;position:relative;padding-left:36px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--gold);opacity:.6;}
  .timeline .node{position:relative;margin-bottom:30px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{
    position:absolute;left:-36px;top:-2px;width:22px;height:22px;border-radius:50%;
    background:var(--green-deep);border:1px solid var(--gold);color:var(--gold);
    display:flex;align-items:center;justify-content:center;
  }
  .timeline .node .badge svg{width:14px;height:14px;}
  .timeline .node strong{
    display:block;font-family:'Marcellus',serif;color:var(--gold);
    text-transform:uppercase;letter-spacing:2px;font-size:.82rem;margin-bottom:4px;
  }
  .timeline .node .hora{color:var(--gold-light);font-size:.9rem;letter-spacing:1px;}
  .timeline .node p{margin:4px 0 0;color:var(--cream);}

  .btn-gold{
    display:inline-block;margin-top:20px;padding:12px 30px;
    background:var(--gold);color:var(--ink);
    text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.78rem;font-weight:600;
    border:none;border-radius:2px;transition:background .2s,opacity .2s;cursor:pointer;
  }
  .btn-gold:hover{background:var(--gold-light);}

  .dresscode-box{
    display:inline-flex;flex-direction:column;align-items:center;gap:8px;margin-top:8px;
  }
  .dresscode-box p{letter-spacing:1px;color:var(--cream);}

  .gallery{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px;
    margin-top:22px;
  }
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--gold);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(10,20,15,.92);
    z-index:50;align-items:center;justify-content:center;cursor:zoom-out;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:4px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--cream);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold-light);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;
    padding:10px;border-radius:2px;border:1px solid var(--gold);
    background:rgba(243,237,224,.06);color:var(--cream);margin-top:5px;width:100%;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:rgba(243,237,224,.5);}
  .rsvp-form button{
    background:var(--gold);border:0;color:var(--ink);font-weight:600;
    letter-spacing:2px;text-transform:uppercase;font-size:.85rem;
    padding:13px;border-radius:2px;cursor:pointer;transition:background .2s;
  }
  .rsvp-form button:hover{background:var(--gold-light);}
  .rsvp-whatsapp{color:var(--gold-light);font-size:.9rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#9fd39f;font-weight:600;}

  footer{
    position:relative;
    text-align:center;padding:50px 20px;overflow:hidden;
    background:var(--green-deep);color:var(--gold-light);
  }
  footer .thanks{font-family:'Great Vibes',cursive;font-size:clamp(1.8rem,6vw,2.4rem);color:var(--gold);position:relative;z-index:1;}
  footer small{display:block;font-family:'Cormorant Garamond',serif;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold-light);opacity:.8;margin-top:10px;position:relative;z-index:1;}
</style></head>
<body>

  <div class="card-section hero-section">
    ${cornerFloralSvg("corner-floral tl")}
    ${cornerFloralSvg("corner-floral tr")}
    <div class="inner">
      ${crownSvg("icon")}
      <p class="eyebrow">Mis</p>
      <h1 class="brand-title">XV Años</h1>
      <div class="photo-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}" loading="lazy"></div>
      <p class="name-script">${esc(d.nombre)}</p>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      <p class="padres">${esc(d.padres)}</p>
      <p class="invite-line">Les invito cordialmente a celebrar<strong>mis quince años</strong></p>
      ${d.fecha ? `<div class="date-block">
        <span class="line"></span>
        <span class="dow">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNumero)}</span>
        <span class="my">${esc(mesAnio)}</span>
        <span class="line"></span>
      </div>` : ""}
    </div>
  </div>

  <div class="card-section alt">
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  <div class="card-section">
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Cuándo y dónde</h2>
      <div class="timeline">
        ${d.lugarCeremonia ? `<div class="node">
          <span class="badge">${iconChurchSvg()}</span>
          <strong>Ceremonia</strong>
          <span class="hora">${esc(d.horaCeremonia)}</span>
          <p>${esc(d.lugarCeremonia)}</p>
        </div>` : ""}
        <div class="node">
          <span class="badge">${iconPartySvg()}</span>
          <strong>Fiesta</strong>
          <span class="hora">${esc(d.horaFiesta)}</span>
          <p>${esc(d.lugarFiesta)}</p>
        </div>
      </div>
      ${d.direccionMapa ? `<a class="btn-gold" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
  </div>

  <div class="card-section alt">
    <div class="inner">
      ${pearlRowSvg("icon-row")}
      <h2>Un mensaje para ustedes</h2>
      <p>${esc(d.mensaje)}</p>
    </div>
  </div>

  <div class="card-section">
    <div class="inner">
      ${ornamentSvg("icon-ornament")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconDressSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>

  <div class="card-section alt">
    <div class="inner">
      ${pearlRowSvg("icon-row")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>

  <div class="card-section">
    <div class="inner">
      ${crownSvg("icon")}
      <h2>Confirmá tu asistencia</h2>
      ${rsvp.html}
    </div>
  </div>

  <footer>
    ${cornerFloralSvg("corner-floral bl")}
    ${cornerFloralSvg("corner-floral br")}
    <p class="thanks">Muchas Gracias</p>
    <small>Los espero de gala, con el corazón agradecido</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Elegante Perlas",
  summary: "Verde botella profundo y dorado con tiara, perlas y flores de línea fina dibujadas a mano.",
  accent: "#c9a961", accent2: "#1b3b2c", schema: xvSchema, sampleData, render,
};
