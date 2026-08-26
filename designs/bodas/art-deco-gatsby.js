const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-art-deco-gatsby";

const sampleData = {
  novia: "Sofía",
  novio: "Joaquín",
  fecha: "2027-04-24",
  horaCeremonia: "19:30",
  lugarCeremonia: "Basílica del Socorro, Recoleta",
  horaFiesta: "21:30",
  lugarFiesta: "Palacio Duhau, Park Hyatt Buenos Aires",
  direccionMapa: "https://maps.google.com/?q=Palacio+Duhau+Park+Hyatt+Buenos+Aires",
  mensaje: "En los años veinte todo era jazz, brillo y grandes gestos de amor. Así queremos vivir esta noche: entre luces doradas, música en vivo y risas, celebrando el comienzo de nuestra historia juntos. Gracias por ser parte de esta noche inolvidable.",
  dressCode: "Gala años 20 — negro, dorado y plumas bienvenidas",
  alias: "sofia.joaquin.boda",
  whatsapp: "5491100000040",
  fechaLimiteRSVP: "2027-03-01",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
  ],
};

// Color de acento dorado del diseño (fallback cuando no hay gama de colores
// personalizada elegida). Sigue viajando por getPaletteColor() como
// cualquier otro diseño, nunca hardcodeado en el HTML.
const GOLD_FALLBACK = "#c9a24a";
const EMERALD = "#0b3d2e";

// --- Ornamentos art déco dibujados a mano en SVG inline, todos con
// currentColor para heredar el dorado vía CSS. Geometría pura: nada de
// curvas orgánicas, todo simétrico y de trazo preciso. ---

// Bracket escalonado de esquina (motivo clásico art déco). Se posiciona en
// las 4 esquinas de una tarjeta rotándolo 0/90/180/270deg vía CSS.
function stepCorner(size = 30) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 39V1H39" stroke="currentColor" stroke-width="1.3"/>
    <path d="M1 27V13H15" stroke="currentColor" stroke-width="1.3"/>
    <path d="M1 20H8M20 1V8" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

// Las 4 esquinas escalonadas de un "deco-frame" (ver CSS .corner).
function decoCorners() {
  const c = stepCorner(30);
  return `<span class="corner tl">${c}</span><span class="corner tr">${c}</span><span class="corner br">${c}</span><span class="corner bl">${c}</span>`;
}

// Abanico solar radial (motivo de fachada art déco), usado detrás del
// monograma del hero.
function sunburstSVG(size = 360, rays = 20) {
  let lines = "";
  for (let i = 0; i < rays; i++) {
    const angle = (360 / rays) * i;
    lines += `<line x1="0" y1="0" x2="0" y2="${-(size / 2)}" stroke="currentColor" stroke-width="1" transform="rotate(${angle})"/>`;
  }
  return `<svg class="sunburst" width="${size}" height="${size}" viewBox="${-(size / 2)} ${-(size / 2)} ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g opacity="0.5">${lines}</g></svg>`;
}

// Línea en zigzag simétrico — divisor entre secciones.
function zigzagSVG(width = 220, height = 12) {
  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = (width / steps) * i;
    const y = i % 2 === 0 ? 1 : height - 1;
    pts.push(`${x.toFixed(1)},${y}`);
  }
  return `<svg class="zigzag" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polyline points="${pts.join(" ")}" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
}

// Divisor corto: línea — rombo — línea.
function decoDivider() {
  return `<div class="deco-divider"><span class="deco-diamond"></span></div>`;
}

// Arco escalonado tipo "portal de teatro" — para la tarjeta de Ceremonia.
function archIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 20V11a8 8 0 0 1 16 0v9" stroke="currentColor" stroke-width="1.2"/>
    <path d="M7 20v-7a5 5 0 0 1 10 0v7" stroke="currentColor" stroke-width="1"/>
    <path d="M4 20h16" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
}

// Estallido de luces (destello geométrico de 8 puntas) — para Fiesta.
function burstIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.2" stroke-linecap="square">
      <line x1="12" y1="2" x2="12" y2="8"/>
      <line x1="12" y1="16" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="8" y2="12"/>
      <line x1="16" y1="12" x2="22" y2="12"/>
      <line x1="5" y1="5" x2="9" y2="9"/>
      <line x1="15" y1="15" x2="19" y2="19"/>
      <line x1="19" y1="5" x2="15" y2="9"/>
      <line x1="9" y1="15" x2="5" y2="19"/>
    </g>
    <rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
}

// Caja de regalo geométrica con moño romboidal — para el alias de regalo.
function giftIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="10" width="16" height="10" stroke="currentColor" stroke-width="1.2"/>
    <path d="M4 14.5h16" stroke="currentColor" stroke-width="1"/>
    <path d="M12 10v10" stroke="currentColor" stroke-width="1"/>
    <path d="M12 10 6.5 4h4.5l1 6ZM12 10l5.5-6H13l-1 6Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const GOLD = getPaletteColor(d.colorPalette, "dark", GOLD_FALLBACK);
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "19:30"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Boda</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Poiret+One&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --black:#060f0b;
    --black2:#0c1a14;
    --black3:#112419;
    --emerald:${EMERALD};
    --gold:${GOLD};
    --gold-soft:color-mix(in srgb, ${GOLD}, white 40%);
    --gold-dim:color-mix(in srgb, ${GOLD}, black 35%);
    --ivory:#f2ecd9;
    --muted:#a89a78;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--black);color:var(--ivory);font-family:'Montserrat',sans-serif;font-weight:300;line-height:1.75;}
  h1,h2,h3{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .eyebrow{font-family:'Poiret One',cursive;letter-spacing:5px;text-transform:uppercase;font-size:clamp(.78rem,1.8vw,.92rem);color:var(--gold-soft);margin:0 0 14px;}
  h2{font-size:clamp(1.3rem,3.6vw,1.9rem);margin-bottom:8px;color:#f7f1de;letter-spacing:1px;}
  .subtitle{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin:0 0 30px;}

  section{max-width:880px;margin:0 auto;padding:clamp(40px,6vw,76px) 24px;text-align:center;position:relative;}

  .deco-divider{display:flex;align-items:center;justify-content:center;gap:16px;margin:0 auto 6px;width:220px;max-width:70%;}
  .deco-divider::before,.deco-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim));}
  .deco-divider::after{background:linear-gradient(90deg,var(--gold-dim),transparent);}
  .deco-diamond{width:9px;height:9px;background:var(--gold);transform:rotate(45deg);flex:none;}
  .zigzag-wrap{color:var(--gold-dim);display:flex;justify-content:center;padding:0 0 4px;}

  /* ---------- ESQUINAS ESCALONADAS (marco déco reutilizable) ---------- */
  .deco-frame{position:relative;}
  .corner{position:absolute;width:26px;height:26px;color:var(--gold);pointer-events:none;}
  .corner.tl{top:-1px;left:-1px;}
  .corner.tr{top:-1px;right:-1px;transform:rotate(90deg);}
  .corner.br{bottom:-1px;right:-1px;transform:rotate(180deg);}
  .corner.bl{bottom:-1px;left:-1px;transform:rotate(270deg);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:clamp(500px,94vh,880px);
    display:flex;align-items:center;justify-content:center;text-align:center;
    background:
      linear-gradient(180deg, rgba(4,10,7,.55) 0%, rgba(4,10,7,.8) 55%, var(--black) 100%),
      url('${esc(d.coverImage)}') center/cover no-repeat;
  }
  .hero-content{position:relative;z-index:1;padding:24px;max-width:640px;}
  .hero-content .sunburst{position:absolute;top:50%;left:50%;transform:translate(-50%,-56%);color:var(--gold);z-index:-1;}
  .eyebrow-top{font-family:'Poiret One',cursive;letter-spacing:6px;text-transform:uppercase;font-size:clamp(.7rem,1.8vw,.86rem);color:var(--gold-soft);margin:0 0 20px;}

  .monogram-frame{width:150px;height:150px;position:relative;margin:0 auto 26px;}
  .monogram-outer,.monogram-inner{position:absolute;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);}
  .monogram-outer{inset:0;border:1.5px solid var(--gold);background:rgba(6,15,11,.4);}
  .monogram-inner{inset:9px;border:1px solid var(--gold-dim);display:flex;align-items:center;justify-content:center;}
  .monogram-inner span{font-family:'Cinzel Decorative',Georgia,serif;font-size:1.9rem;color:var(--gold);letter-spacing:1px;}

  .hero-content h1{font-size:clamp(1.9rem,7.4vw,3.2rem);color:var(--gold-soft);font-weight:700;line-height:1.24;letter-spacing:3px;text-transform:uppercase;}
  .hero-content .amp{display:block;font-family:'Poiret One',cursive;font-weight:400;font-size:.42em;letter-spacing:4px;color:var(--gold);margin:8px 0;text-transform:uppercase;}
  .hero-divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:26px auto;color:var(--gold-dim);}
  .hero-divider .deco-diamond{background:var(--gold);}
  .hero-divider::before,.hero-divider::after{content:"";width:52px;height:1px;background:var(--gold-dim);}
  .hero-date{font-family:'Poiret One',cursive;margin-top:2px;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.8rem,2vw,.98rem);color:var(--muted);}

  /* ---------- CAJA DE FRASE ---------- */
  .quote-box{padding:clamp(36px,5vw,54px) clamp(24px,5vw,58px) clamp(28px,4vw,38px);max-width:660px;margin:0 auto;background:var(--black2);border:1px solid var(--gold-dim);}
  .message{font-size:clamp(1rem,2.1vw,1.16rem);font-style:italic;font-weight:300;color:var(--ivory);max-width:580px;margin:0 auto;}
  .welcome-date{margin-top:22px;font-family:'Poiret One',cursive;font-size:clamp(1rem,2.2vw,1.14rem);color:var(--gold-soft);letter-spacing:2px;text-transform:uppercase;}

  /* ---------- COUNTDOWN "MARQUESINA" ---------- */
  .countdown{display:flex;gap:clamp(10px,2.6vw,18px);justify-content:center;flex-wrap:wrap;margin:8px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:70px;padding:16px 10px 14px;border:1px double var(--gold);background:var(--black2);box-shadow:inset 0 0 0 5px var(--black2), inset 0 0 0 6px var(--gold-dim);}
  @media(min-width:480px){.countdown div{min-width:86px;padding:20px 14px 16px;}}
  .countdown div::before{content:"";display:block;width:100%;height:6px;margin-bottom:12px;background-image:radial-gradient(circle, var(--gold) 1.4px, transparent 1.6px);background-size:11px 11px;background-position:center;opacity:.85;}
  .cd-num{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;font-size:clamp(1.4rem,4.6vw,2.1rem);color:var(--gold);line-height:1;}
  .cd-label{font-family:'Poiret One',cursive;font-size:.66rem;text-transform:uppercase;letter-spacing:2.5px;color:var(--muted);margin-top:9px;}

  /* ---------- TIMING ---------- */
  .timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:clamp(30px,5vw,44px);margin-top:34px;text-align:left;}
  .tl-wrap{position:relative;padding-top:28px;}
  .tl-badge{position:absolute;top:0;left:50%;width:50px;height:50px;background:var(--black);border:1.5px solid var(--gold);transform:translate(-50%,-50%) rotate(45deg);display:flex;align-items:center;justify-content:center;color:var(--gold);z-index:2;}
  .tl-badge svg{width:20px;height:20px;transform:rotate(-45deg);}
  .card{border:1px solid var(--gold-dim);padding:36px 24px 26px;background:var(--black2);text-align:center;}
  .card h3{color:var(--gold-soft);font-size:.8rem;font-family:'Poiret One',cursive;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;}
  .card p{margin:4px 0 0;color:var(--ivory);opacity:.85;}
  .card .hora{display:block;font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;font-size:1.4rem;color:#f7f1de;margin-bottom:4px;}
  .map-link{display:inline-block;margin-top:32px;font-family:'Poiret One',cursive;letter-spacing:3px;text-transform:uppercase;font-size:.8rem;color:var(--gold);border:1px solid var(--gold);padding:13px 30px;transition:background .2s,color .2s;text-decoration:none;}
  .map-link:hover{background:var(--gold);color:var(--black);}

  /* ---------- DRESS CODE ---------- */
  .swatches{display:flex;justify-content:center;gap:16px;margin:0 0 26px;flex-wrap:wrap;}
  .swatches span{width:22px;height:22px;display:inline-block;border:1px solid rgba(255,255,255,.2);transform:rotate(45deg);}
  .badge-dresscode{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--gold);padding:13px 30px;font-family:'Poiret One',cursive;letter-spacing:2px;text-transform:uppercase;font-size:.82rem;color:var(--gold-soft);}

  /* ---------- DETALLES / REGALO ---------- */
  .gift-wrap{position:relative;padding-top:28px;max-width:440px;margin:0 auto;}
  .gift-badge{position:absolute;top:0;left:50%;width:50px;height:50px;background:var(--black);border:1.5px solid var(--gold);transform:translate(-50%,-50%) rotate(45deg);display:flex;align-items:center;justify-content:center;color:var(--gold);z-index:2;}
  .gift-badge svg{width:20px;height:20px;transform:rotate(-45deg);}
  .gift-box{border:1px solid var(--gold-dim);padding:38px 26px 26px;background:var(--black2);}
  .gift-box p{margin:0 0 18px;color:var(--ivory);opacity:.9;font-size:1rem;}
  .gift-box .alias{display:inline-block;font-family:'Poiret One',cursive;font-size:.86rem;letter-spacing:1.5px;border:1px solid var(--gold-dim);padding:10px 22px;color:var(--gold-soft);}

  /* ---------- GALERÍA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:10px;}
  .gallery-item{border:1px solid var(--gold-dim);background:var(--black2);padding:7px;}
  .gallery img{width:100%;height:180px;object-fit:cover;cursor:pointer;filter:saturate(.9) contrast(1.05) brightness(.94);transition:opacity .3s ease;}
  .gallery img:hover{opacity:.82;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(3,7,5,.96);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-soft);font-size:2.2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP ---------- */
  .rsvp-grid{max-width:640px;margin:0 auto;text-align:left;}
  .rsvp-grid h2,.rsvp-grid .eyebrow{text-align:center;}
  .rsvp-deadline{font-family:'Poiret One',cursive;text-align:center;margin:-16px 0 26px;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold-soft);}

  .rsvp-form{display:flex;flex-direction:column;gap:16px;margin:6px 0 0;text-align:left;padding:clamp(30px,5vw,44px);border:1px solid var(--gold-dim);background:var(--black2);}
  .rsvp-form label{font-family:'Poiret One',cursive;font-size:.74rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Montserrat',sans-serif;font-size:.98rem;padding:11px 4px;border:none;border-bottom:1px solid var(--gold-dim);background:transparent;color:var(--ivory);border-radius:0;margin-top:6px;width:100%;}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-bottom-color:var(--gold);}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#6f6650;}
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form select option{background:var(--black2);color:var(--ivory);}
  .rsvp-form button{background:var(--gold);color:var(--black);border:0;padding:14px;letter-spacing:3px;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:'Poiret One',cursive;font-size:.85rem;margin-top:6px;}
  .rsvp-form button:hover{background:var(--gold-soft);}
  .rsvp-whatsapp{font-family:'Poiret One',cursive;font-size:.82rem;text-align:center;text-decoration:none;color:var(--gold-soft);border-bottom:1px solid var(--gold-dim);padding-bottom:2px;align-self:center;}
  .rsvp-status{text-align:center;font-weight:bold;color:var(--gold-soft);}

  .gold-rule{height:1px;max-width:880px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-dim) 15%,var(--gold-dim) 85%,transparent);opacity:.7;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;overflow:hidden;text-align:center;padding:56px 24px 48px;background:var(--black);}
  .foot-mono{width:64px;height:64px;position:relative;margin:0 auto 20px;}
  .foot-mono-outer{position:absolute;inset:0;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;}
  .foot-mono-outer span{font-family:'Cinzel Decorative',Georgia,serif;font-size:.86rem;letter-spacing:1px;color:var(--gold-soft);}
  .foot-names{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:1.1rem;color:var(--gold-soft);margin-bottom:10px;}
  .foot-thanks{font-family:'Montserrat',sans-serif;font-weight:300;font-size:.8rem;letter-spacing:.5px;color:var(--muted);margin:0;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-content">
      ${sunburstSVG(360, 20)}
      <p class="eyebrow-top">Nos casamos</p>
      <div class="monogram-frame">
        <div class="monogram-outer"></div>
        <div class="monogram-inner"><span>${esc(inicialNovia)}&amp;${esc(inicialNovio)}</span></div>
      </div>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="hero-divider"><span class="deco-diamond"></span></div>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  ${d.mensaje ? `<section class="deco-frame">
    ${decoCorners()}
    <div class="quote-box">
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${fechaLarga ? `<p class="welcome-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">La cuenta regresiva</p>
    ${cd.html}
  </section>
  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="zigzag-wrap">${zigzagSVG(220, 12)}</div>` : ""}

  ${
    (d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa)
      ? `<section>
    <p class="eyebrow">El programa</p>
    <h2 style="margin-bottom:8px;">Ceremonia &amp; fiesta</h2>
    ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="tl-wrap">
        <div class="tl-badge">${archIcon()}</div>
        <div class="card">
          <h3>Ceremonia</h3>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="tl-wrap">
        <div class="tl-badge">${burstIcon()}</div>
        <div class="card">
          <h3>Fiesta</h3>
          ${d.horaFiesta ? `<span class="hora">${esc(d.horaFiesta)}</span>` : ""}
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
        </div>
      </div>` : ""}
    </div>` : ""}
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
  </section>`
      : ""
  }

  ${d.dressCode ? `<section>
    <p class="eyebrow">Dress code</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:28px;">Elegancia de época</h2>
    <div class="swatches">
      <span style="background:#05100b"></span>
      <span style="background:${GOLD}"></span>
      <span style="background:${EMERALD}"></span>
      <span style="background:#3a3a3a"></span>
      <span style="background:#f2ecd9"></span>
    </div>
    <div class="badge-dresscode">${esc(d.dressCode)}</div>
  </section>` : ""}

  ${d.alias ? `<section>
    <p class="eyebrow">Detalles</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:28px;">Para tener en cuenta</h2>
    <div class="gift-wrap">
      <div class="gift-badge">${giftIcon()}</div>
      <div class="gift-box">
        <p>Tu presencia es el mejor regalo de la noche. Si querés hacernos un presente, podés hacerlo por transferencia.</p>
        <span class="alias">Alias: ${esc(d.alias)}</span>
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Momentos</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:28px;">Nuestra historia en fotos</h2>
    ${gal.html}
  </section>` : ""}

  <div class="zigzag-wrap">${zigzagSVG(220, 12)}</div>

  <section>
    <div class="rsvp-grid">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmar asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : `<div style="margin-bottom:20px;"></div>`}
      ${rsvp.html}
    </div>
  </section>

  <div class="gold-rule"></div>

  <footer>
    <div class="foot-mono"><div class="foot-mono-outer"><span>${esc(inicialNovia)}&nbsp;&amp;&nbsp;${esc(inicialNovio)}</span></div></div>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    <p class="foot-thanks">Con todo nuestro cariño, gracias por brindar con nosotros esta noche.</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:${d.accent2};display:flex;align-items:center;justify-content:center;">
    <svg width="100%" height="100%" viewBox="0 0 300 200" style="position:absolute;inset:0;" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="${d.accent2}"/>
      <g stroke="${d.accent}" stroke-width="1" opacity="0.55">
        <line x1="150" y1="210" x2="150" y2="30"/>
        <line x1="150" y1="210" x2="86" y2="40"/>
        <line x1="150" y1="210" x2="214" y2="40"/>
        <line x1="150" y1="210" x2="30" y2="80"/>
        <line x1="150" y1="210" x2="270" y2="80"/>
        <line x1="150" y1="210" x2="0" y2="140"/>
        <line x1="150" y1="210" x2="300" y2="140"/>
      </g>
      <rect x="16" y="16" width="268" height="168" fill="none" stroke="${d.accent}" stroke-width="1" opacity="0.6"/>
      <rect x="24" y="24" width="252" height="152" fill="none" stroke="${d.accent}" stroke-width="1" opacity="0.35"/>
    </svg>
    <div style="position:relative;z-index:1;text-align:center;padding:0 22px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:1.02rem;letter-spacing:3px;text-transform:uppercase;color:${d.accent};text-shadow:0 1px 4px rgba(0,0,0,.65);line-height:1.35;">${esc(d.name)}</div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Art Deco Gatsby",
  summary: "Esmeralda y dorado sobre negro, geometría de abanicos y esquinas escalonadas, monograma dentro de un marco octogonal y countdown estilo marquesina — una boda de gala años 20.",
  accent: GOLD_FALLBACK, accent2: EMERALD, schema: bodaSchema, sampleData, render, cardPreview,
};
