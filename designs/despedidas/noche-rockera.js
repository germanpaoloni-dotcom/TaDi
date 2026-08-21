const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta } = require("../widgets");
const { despedidaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "desp-noche-rockera";

const sampleData = {
  nombre: "Cami",
  fecha: "2027-03-13",
  hora: "22:00",
  lugar: "The Roxy Bar, Palermo",
  direccionMapa: "https://maps.google.com/?q=The+Roxy+Bar+Palermo+Buenos+Aires",
  plan: "Arrancamos con tragos y previa en el bar a las 22, después banda en vivo tocando covers de rock hasta la madrugada, y cerramos la noche bailando en la pista hasta que el cuerpo aguante. Última noche de libertad, así que vengan con pilas.",
  dressCode: "Total black. Tachas, cuero y accesorios de rock a piacere.",
  organizadores: "Male, Fede y el resto de la banda",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31d?w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80",
  ],
};

// Motivos rockeros dibujados a mano en SVG inline, sin depender de íconos
// externos: guitarra eléctrica, calavera, estrella, rayo y triángulo. Todos
// llevan width/height explícitos (en el propio <svg> y reforzados por CSS)
// para evitar que el navegador los infle a su tamaño intrínseco.
const guitarSVG = `<svg class="motif motif-guitar" width="40" height="94" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="27" y="2" width="6" height="56" rx="2" stroke="currentColor" stroke-width="2"/>
  <line x1="30" y1="6" x2="30" y2="52" stroke="currentColor" stroke-width="1"/>
  <circle cx="22" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="38" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="22" cy="22" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="38" cy="22" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <path d="M30 58 C 10 66, 4 88, 14 104 C 8 108, 6 118, 12 128 C 20 138, 40 138, 48 128 C 56 118, 52 106, 44 102 C 54 88, 50 66, 30 58 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="30" cy="104" r="12" stroke="currentColor" stroke-width="1.6"/>
  <line x1="18" y1="70" x2="42" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="16" y1="78" x2="44" y2="78" stroke="currentColor" stroke-width="1"/>
</svg>`;

const skullSVG = `<svg class="motif motif-skull" width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 3 C10 3 4 10 4 19 C4 25 7 28 9 30 L9 34 C9 36 10.5 37 12 37 L14 37 L14 33 L16 33 L16 37 L24 37 L24 33 L26 33 L26 37 L28 37 C29.5 37 31 36 31 34 L31 30 C33 28 36 25 36 19 C36 10 30 3 20 3 Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="13.5" cy="18" r="3.4" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="26.5" cy="18" r="3.4" stroke="currentColor" stroke-width="1.6"/>
  <path d="M20 20 L18 26 L22 26 Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M14 29 L26 29" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

const starSVG = `<svg class="motif motif-star" width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 2 L23.6 15.2 L37 16.4 L26.6 25 L29.8 38 L20 30.4 L10.2 38 L13.4 25 L3 16.4 L16.4 15.2 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;

function boltSVG(cls) {
  return `<svg class="motif motif-bolt ${cls}" width="18" height="32" viewBox="0 0 26 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 2 L4 26 H13 L9 44 L23 18 H14 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
}

function triangleSVG(cls) {
  return `<svg class="motif motif-triangle ${cls}" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="2,2 18,10 2,18" fill="currentColor"/>
  </svg>`;
}

function divider(alt) {
  return `<div class="divider">${starSVG}<span class="divider-line"></span>${alt ? skullSVG : guitarSVG}<span class="divider-line"></span>${starSVG}</div>`;
}

const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#ef1a78");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "22:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let fechaLarga = "";
  let diaAbbr = "";
  let diaNum = "";
  let mesAbbr = "";
  if (d.fecha) {
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (y && m && day) {
      fechaLarga = `${day} de ${MESES_LARGO[m - 1]} de ${y}`;
      const jsDate = new Date(Date.UTC(y, m - 1, day));
      diaAbbr = DIAS[jsDate.getUTCDay()];
      diaNum = String(day).padStart(2, "0");
      mesAbbr = MESES[m - 1];
    } else {
      fechaLarga = d.fecha;
    }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Despedida de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&family=Oswald:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0a0908;
    --bg2:#18101380;
    --bg2-solid:#181013;
    --pink:${accent};
    --cyan:#1fd0c9;
    --ink:#f6f1f2;
    --ink-soft:#cdb9c2;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Oswald',Arial,sans-serif;font-weight:300;
    background-image:
      radial-gradient(circle at 12% 8%,color-mix(in srgb, ${accent} 10%, transparent),transparent 40%),
      radial-gradient(circle at 90% 85%,rgba(31,208,201,.10),transparent 40%);
  }
  img{max-width:100%;}
  h1,h2,.brand{font-family:'Bebas Neue',Impact,sans-serif;letter-spacing:2px;}
  .script{font-family:'Permanent Marker',cursive;font-weight:400;}

  .motif{color:var(--pink);display:inline-block;}
  .motif-guitar{width:34px;height:80px;filter:drop-shadow(0 0 6px color-mix(in srgb, ${accent} 70%, transparent));}
  .motif-skull{width:24px;height:24px;color:var(--cyan);filter:drop-shadow(0 0 5px rgba(31,208,201,.7));}
  .motif-star{width:15px;height:15px;color:var(--cyan);filter:drop-shadow(0 0 4px rgba(31,208,201,.8));}
  .motif-bolt{width:16px;height:28px;color:var(--cyan);filter:drop-shadow(0 0 5px rgba(31,208,201,.8));}
  .motif-triangle{width:14px;height:14px;color:var(--pink);}

  .divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto 28px;}
  .divider-line{width:clamp(30px,10vw,70px);height:1px;background:linear-gradient(90deg,transparent,var(--pink),transparent);}

  /* ===== HERO ===== */
  .hero{position:relative;min-height:100vh;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;background:#000;padding:26px 18px 40px;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center 20%/cover;filter:saturate(1.05) contrast(1.05);}
  .hero-bg::after{content:"";position:absolute;inset:0;background:
      linear-gradient(100deg,color-mix(in srgb, ${accent} 55%, transparent) 0%,color-mix(in srgb, ${accent} 28%, transparent) 18%,transparent 40%),
      linear-gradient(260deg,rgba(31,208,201,.35) 0%,transparent 38%),
      linear-gradient(180deg,rgba(6,4,5,.15) 0%,rgba(6,4,5,.55) 55%,rgba(6,4,5,.96) 96%);}
  .hero-grain{position:absolute;inset:0;opacity:.5;mix-blend-mode:overlay;pointer-events:none;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>");
    background-size:160px 160px;}
  .hero-badges{position:absolute;top:0;left:0;right:0;display:flex;align-items:flex-start;justify-content:space-between;padding:22px 18px;z-index:2;}
  .badge-date{text-align:left;line-height:1;}
  .badge-date .d-top{display:block;font-family:'Bebas Neue',Impact,sans-serif;font-size:1.1rem;letter-spacing:3px;color:var(--ink);}
  .badge-date .d-mes{color:var(--pink);}
  .badge-date .d-num{display:block;font-family:'Bebas Neue',Impact,sans-serif;font-size:3.2rem;color:var(--ink);text-shadow:0 0 14px color-mix(in srgb, ${accent} 50%, transparent);}
  .badge-tag{text-align:right;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--cyan);line-height:1.5;text-shadow:0 0 8px rgba(31,208,201,.6);}
  .badge-tag strong{display:block;color:var(--ink);font-size:.9rem;letter-spacing:3px;}
  .hero-triangles .motif-triangle{position:absolute;z-index:2;opacity:.85;}
  .tri-a{top:16%;left:46%;color:var(--pink);}
  .tri-b{bottom:30%;right:8%;color:var(--cyan);transform:rotate(180deg);}

  .hero-content{position:relative;z-index:2;max-width:640px;margin:0 auto;text-align:center;width:100%;}
  .hero-content .motif-guitar{margin:0 auto 10px;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-size:clamp(.62rem,1.8vw,.8rem);color:var(--cyan);text-shadow:0 0 10px rgba(31,208,201,.8);margin:0 0 6px;}
  .hero-content h1{font-size:clamp(3.6rem,17vw,7.5rem);line-height:.92;margin:4px 0 0;color:var(--ink);
    text-shadow:2px 2px 0 color-mix(in srgb, ${accent} 90%, transparent),-2px -2px 0 rgba(31,208,201,.4);}
  .hero-script{font-size:clamp(2rem,9vw,3.4rem);color:var(--pink);margin:-4px 0 14px;transform:rotate(-4deg);
    text-shadow:0 0 16px color-mix(in srgb, ${accent} 60%, transparent);border-bottom:3px solid var(--pink);display:inline-block;padding:0 6px 4px;}
  .hero-date{display:inline-block;letter-spacing:.2em;text-transform:uppercase;font-size:clamp(.75rem,2.2vw,.95rem);color:var(--ink);border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.35);padding:9px 20px;border-radius:999px;backdrop-filter:blur(2px);}
  .hero-date b{color:var(--cyan);font-weight:600;}

  section{max-width:780px;margin:0 auto;padding:64px 22px;text-align:center;position:relative;}
  h2{font-size:clamp(1.9rem,6vw,2.8rem);margin:0 0 24px;color:var(--ink);letter-spacing:2px;}
  h2 span{color:var(--pink);}

  /* INFO STRIP */
  .info-strip{display:flex;align-items:stretch;justify-content:center;gap:0;flex-wrap:wrap;background:var(--bg2-solid);border:1px solid color-mix(in srgb, ${accent} 30%, transparent);border-radius:14px;overflow:hidden;}
  .info-col{flex:1 1 220px;padding:26px 22px;text-align:center;}
  .info-col + .info-col{border-top:1px solid color-mix(in srgb, ${accent} 25%, transparent);}
  @media(min-width:520px){
    .info-col + .info-col{border-top:0;border-left:1px solid color-mix(in srgb, ${accent} 25%, transparent);}
  }
  .info-label{display:block;font-size:.68rem;letter-spacing:3px;text-transform:uppercase;color:var(--cyan);margin-bottom:10px;}
  .info-value{display:block;font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.15rem,3.4vw,1.5rem);letter-spacing:1px;color:var(--ink);line-height:1.3;}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,4vw,22px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:62px;background:var(--bg2-solid);border:1px solid color-mix(in srgb, ${accent} 40%, transparent);border-radius:10px;padding:14px 8px;box-shadow:0 0 18px color-mix(in srgb, ${accent} 12%, transparent);}
  .cd-num{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.9rem,5vw,2.6rem);color:var(--pink);text-shadow:0 0 10px color-mix(in srgb, ${accent} 70%, transparent);}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink-soft);margin-top:2px;}

  /* PLAN */
  .plan-card{background:var(--bg2-solid);border:1px solid rgba(31,208,201,.3);border-radius:14px;padding:32px 26px;text-align:left;box-shadow:0 0 26px rgba(31,208,201,.08);}
  .plan-card p{line-height:1.85;color:var(--ink-soft);font-size:clamp(.98rem,2.2vw,1.1rem);margin:0;}

  /* LUGAR */
  .venue-card{display:flex;flex-direction:column;align-items:center;gap:10px;}
  .venue-name{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.6rem,5vw,2.3rem);color:var(--ink);letter-spacing:2px;}
  .maplink{display:inline-block;margin-top:16px;color:#0a0908;background:var(--cyan);text-decoration:none;font-weight:600;letter-spacing:1px;padding:12px 26px;border-radius:999px;box-shadow:0 0 20px rgba(31,208,201,.5);text-transform:uppercase;font-size:.85rem;}
  .maplink:hover{background:#7cf5ef;}
  .contact-box{margin-top:26px;border:1px dashed color-mix(in srgb, ${accent} 60%, transparent);border-radius:12px;padding:16px 24px;display:inline-flex;flex-direction:column;gap:6px;align-items:center;}
  .contact-label{font-size:.68rem;letter-spacing:3px;text-transform:uppercase;color:var(--cyan);}
  .contact-value{font-family:'Bebas Neue',Impact,sans-serif;font-size:1.4rem;letter-spacing:3px;color:var(--ink);text-decoration:none;}

  /* ORGANIZA */
  .organiza-names{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.7rem,5.5vw,2.4rem);color:var(--pink);text-shadow:0 0 10px color-mix(in srgb, ${accent} 50%, transparent);letter-spacing:2px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:8px;cursor:pointer;border:1px solid color-mix(in srgb, ${accent} 35%, transparent);filter:saturate(1.15) contrast(1.05);transition:transform .2s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,4,5,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--pink);border-radius:8px;box-shadow:0 0 40px color-mix(in srgb, ${accent} 50%, transparent);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cyan);font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px rgba(31,208,201,.8);}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Oswald',inherit;padding:11px;border:1px solid rgba(31,208,201,.4);border-radius:8px;margin-top:5px;width:100%;background:var(--bg2-solid);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--pink);box-shadow:0 0 10px color-mix(in srgb, ${accent} 40%, transparent);}
  .rsvp-form button{background:var(--pink);color:#0a0908;border:0;padding:14px;border-radius:999px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-size:.9rem;font-weight:600;box-shadow:0 0 22px color-mix(in srgb, ${accent} 50%, transparent);}
  .rsvp-form button:hover{background:#ff4d97;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--cyan);text-align:center;text-decoration:none;text-shadow:0 0 6px rgba(31,208,201,.5);}
  .rsvp-status{text-align:center;color:var(--cyan);font-weight:bold;}

  footer{text-align:center;padding:46px 22px 56px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid color-mix(in srgb, ${accent} 25%, transparent);letter-spacing:1px;}
  footer .motif-skull{margin:0 auto 14px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grain"></div>
    <div class="hero-badges">
      <div class="badge-date">
        <span class="d-top">${diaAbbr}<span class="d-mes"> ${mesAbbr}</span></span>
        ${diaNum ? `<span class="d-num">${diaNum}</span>` : ""}
      </div>
      <div class="badge-tag">Última<br>noche<br><strong>libre</strong></div>
    </div>
    <div class="hero-triangles">${triangleSVG("tri-a")}${triangleSVG("tri-b")}</div>
    <div class="hero-content">
      ${guitarSVG}
      <p class="eyebrow">Despedida de soltera/o</p>
      <h1>${esc(d.nombre)}</h1>
      <p class="hero-script script">¡se despide!</p><br>
      ${d.hora ? `<span class="hero-date">Puertas <b>${esc(d.hora)} hs</b></span>` : ""}
    </div>
  </div>

  ${d.plan ? `
  <section>
    ${divider()}
    <h2>El <span>plan</span></h2>
    <div class="plan-card"><p>${esc(d.plan)}</p></div>
  </section>` : ""}

  <section>
    ${divider(true)}
    <h2>Faltan</h2>
    ${cd.html}
    ${fechaLarga ? `<p style="margin-top:18px;color:var(--ink-soft);letter-spacing:1px;">${esc(fechaLarga)}</p>` : ""}
  </section>

  ${(d.dressCode || d.organizadores) ? `
  <section>
    ${divider()}
    <div class="info-strip">
      ${d.dressCode ? `
      <div class="info-col">
        <span class="info-label">Dress Code</span>
        <span class="info-value">${esc(d.dressCode)}</span>
      </div>` : ""}
      ${d.organizadores ? `
      <div class="info-col">
        <span class="info-label">Organiza</span>
        <span class="info-value organiza-names">${esc(d.organizadores)}</span>
      </div>` : ""}
    </div>
  </section>` : ""}

  ${(d.lugar || d.direccionMapa || d.whatsapp) ? `
  <section>
    ${divider(true)}
    <h2>Dónde</h2>
    <div class="venue-card">
      ${d.lugar ? `<span class="venue-name">${esc(d.lugar)}</span>` : ""}
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
      ${d.whatsapp ? `<div class="contact-box"><span class="contact-label">Consultas</span><a class="contact-value" href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">WhatsApp →</a></div>` : ""}
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider(true)}
    <h2>Confirmá tu lugar</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${skullSVG}
    Nos vemos en la pista. Última noche de libertad de ${esc(d.nombre)}.
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Noche Rockera",
  summary: "Poster de rock nocturno en negro, magenta y cian: foto full-bleed con textura grunge, tipografía impactante y acentos de guitarra y calavera.",
  accent: "#ef1a78", accent2: "#1fd0c9", schema: despedidaSchema, sampleData, render,
};
