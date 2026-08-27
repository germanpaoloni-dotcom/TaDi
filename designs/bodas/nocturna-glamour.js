const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-nocturna-glamour";

const sampleData = {
  novia: "Valentina",
  novio: "Ignacio",
  fecha: "2027-11-13",
  horaCeremonia: "20:00",
  lugarCeremonia: "Catedral de San Isidro",
  horaFiesta: "22:00",
  lugarFiesta: "Salón Alvear Gala, Recoleta",
  direccionMapa: "https://maps.google.com/?q=Salon+Alvear+Gala+Recoleta+Buenos+Aires",
  mensaje: "Bajo las luces de la noche y rodeados de flores y estrellas, queremos brindar con ustedes por el comienzo de esta nueva vida juntos. Los esperamos para celebrar una noche inolvidable.",
  dressCode: "Elegante noche — negro y dorado",
  alias: "valen.ignacio.boda",
  whatsapp: "5491133445566",
  fechaLimiteRSVP: "2027-10-01",
  coverImage: "https://images.unsplash.com/photo-1769038936373-07c4806ee247?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  ],
};

// Color de acento dorado del diseño (fallback cuando no hay gama de
// colores personalizada elegida). El mockup del cliente pide un look
// negro + dorado de gala, así que el fallback es dorado — sigue viajando
// por getPaletteColor() como cualquier otro diseño, nunca hardcodeado.
const GOLD_FALLBACK = "#c9a45c";

// --- Ornamentos dibujados a mano en SVG inline (sin dependencias externas),
// todos con currentColor para heredar el dorado vía CSS. ---

// Destello / estrella de 4 puntas, usado como marca decorativa suelta
// (dentro de la caja de la frase, entre secciones, etc).
function sparkleIcon(size = 18) {
  return `<svg class="spark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 1.5c0 6.2 2.3 8.5 8.5 8.5-6.2 0-8.5 2.3-8.5 8.5 0-6.2-2.3-8.5-8.5-8.5 6.2 0 8.5-2.3 8.5-8.5Z" fill="currentColor"/>
  </svg>`;
}

// Dos copas de champagne brindando, para la tarjeta de Ceremonia.
function champagneIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="rotate(-14 8 12)">
      <path d="M5.6 4h5l-.6 5.3a2.1 2.1 0 0 1-1.9 1.8v4.9M8 17.5v2.6M6.1 20.1h3.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g transform="rotate(14 16 12)">
      <path d="M13.4 4h5l-.6 5.3a2.1 2.1 0 0 1-1.9 1.8v4.9M16 17.5v2.6M14.1 20.1h3.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

// Esferita de espejos ("bola de fiesta") colgando, para la tarjeta de Fiesta.
function discoIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2v2.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="12" cy="14" r="7.4" stroke="currentColor" stroke-width="1.3"/>
    <path d="M4.9 11.2h14.2M4.6 14h14.8M4.9 16.8h14.2" stroke="currentColor" stroke-width=".8"/>
    <path d="M8.3 7.4C7 9.2 6.3 11.5 6.3 14s.7 4.8 2 6.6M15.7 7.4c1.3 1.8 2 4.1 2 6.6s-.7 4.8-2 6.6" stroke="currentColor" stroke-width=".8"/>
  </svg>`;
}

// Caja de regalo con moño, para la sección de Detalles.
function giftIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="10" width="16" height="9.4" stroke="currentColor" stroke-width="1.2"/>
    <path d="M3.6 7.2h16.8v3.1H3.6z" stroke="currentColor" stroke-width="1.2"/>
    <path d="M12 7.2v12.2" stroke="currentColor" stroke-width="1.1"/>
    <path d="M12 7.2c-1.9 0-3.6-1.1-3.6-2.8A2.1 2.1 0 0 1 10.5 2.3c1.7 0 2.7 1.8 2.7 3.6M12 7.2c1.9 0 3.6-1.1 3.6-2.8A2.1 2.1 0 0 0 13.5 2.3c-1.7 0-2.7 1.8-2.7 3.6" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/>
  </svg>`;
}

// Una sola hoja "outline" (sin relleno), rotable — para armar la rama.
function leafOutline(cx, cy, rot) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0,-15 C9,-9 9,9 0,15 C-9,9 -9,-9 0,-15 Z" stroke="currentColor" stroke-width="1"/>
    <line x1="0" y1="-12" x2="0" y2="12" stroke="currentColor" stroke-width=".6"/>
  </g>`;
}

// Rama decorativa dorada, vertical, para el costado del formulario de RSVP.
function branchSVG(w = 150, h = 430) {
  return `<svg class="deco-branch" width="${w}" height="${h}" viewBox="0 0 150 430" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M78 420C58 350 48 270 66 200C84 130 58 70 96 12" stroke="currentColor" stroke-width="1.2"/>
    ${leafOutline(64, 372, -34)}
    ${leafOutline(84, 332, 26)}
    ${leafOutline(58, 290, -30)}
    ${leafOutline(80, 250, 28)}
    ${leafOutline(62, 205, -32)}
    ${leafOutline(84, 165, 26)}
    ${leafOutline(66, 120, -28)}
    ${leafOutline(90, 80, 24)}
    ${leafOutline(78, 40, -22)}
  </svg>`;
}

// Línea fina con un destello dorado en el medio, usada entre secciones.
function starDivider() {
  return `<div class="star-divider">${sparkleIcon(16)}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const GOLD = getPaletteColor(d.colorPalette, "dark", GOLD_FALLBACK);
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "20:00"}:00` : sampleData.fecha, "cd1");
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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --black:#0a0a0a;
    --black2:#131110;
    --black3:#1a1613;
    --gold:${GOLD};
    --gold-soft:color-mix(in srgb, ${GOLD}, white 38%);
    --gold-dim:color-mix(in srgb, ${GOLD}, black 30%);
    --ivory:#f3ead7;
    --muted:#b6a888;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--black);color:var(--ivory);font-family:'Cormorant Garamond',serif;line-height:1.7;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:600;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .eyebrow{font-family:'Jost',sans-serif;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.78rem);color:var(--gold-soft);margin:0 0 14px;}
  h2{font-size:clamp(1.4rem,4vw,2.1rem);font-style:italic;margin-bottom:6px;color:#fbf6ea;}
  .subtitle{font-family:'Jost',sans-serif;font-size:.76rem;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin:0 0 30px;}
  .spark{color:var(--gold);}

  .star-divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 6px;width:200px;max-width:70%;}
  .star-divider::before,.star-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim));}
  .star-divider::after{background:linear-gradient(90deg,var(--gold-dim),transparent);}

  section{max-width:860px;margin:0 auto;padding:clamp(38px,6vw,72px) 24px;text-align:center;position:relative;}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:clamp(480px,92vh,860px);
    display:flex;align-items:flex-end;justify-content:center;text-align:center;
    background:
      radial-gradient(circle at 14% 18%, rgba(255,255,255,.09) 0%, transparent 4%),
      radial-gradient(circle at 78% 12%, rgba(255,255,255,.07) 0%, transparent 3%),
      radial-gradient(circle at 88% 30%, rgba(255,255,255,.05) 0%, transparent 5%),
      radial-gradient(circle at 22% 42%, rgba(255,255,255,.05) 0%, transparent 6%),
      radial-gradient(circle at 65% 55%, rgba(255,255,255,.04) 0%, transparent 7%),
      radial-gradient(circle at 10% 78%, rgba(255,255,255,.04) 0%, transparent 5%),
      radial-gradient(circle at 30% 66%, color-mix(in srgb, ${GOLD} 30%, transparent) 0%, transparent 16%),
      radial-gradient(circle at 90% 82%, rgba(255,255,255,.03) 0%, transparent 6%),
      linear-gradient(180deg, rgba(6,6,5,.4) 0%, rgba(6,6,5,.72) 55%, var(--black) 100%),
      url('${esc(d.coverImage)}') center/cover no-repeat;
  }
  /* Destellos dorados titilando, como luces de gala desenfocadas al fondo del hero */
  .gala-lights{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}
  .gala-lights span{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--gold);box-shadow:0 0 14px 4px color-mix(in srgb, var(--gold), transparent 35%);opacity:.14;animation:galaFlicker 8s ease-in-out infinite;}
  @keyframes galaFlicker{
    0%,100%{opacity:.12;}
    50%{opacity:.6;}
  }
  @media(prefers-reduced-motion:reduce){
    .gala-lights span{animation:none !important;opacity:.32;}
  }

  .hero-content{position:relative;z-index:1;padding:0 24px 34px;max-width:640px;}
  .hero-content h1{font-size:clamp(2rem,8vw,3.6rem);color:var(--gold-soft);font-weight:600;line-height:1.16;letter-spacing:4px;text-transform:uppercase;}
  .hero-content .amp{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:.5em;letter-spacing:0;color:var(--gold);margin:6px 0;text-transform:none;}
  .hero-divider{width:78px;height:1px;background:var(--gold-dim);margin:24px auto;}
  .hero-date{font-family:'Jost',sans-serif;margin-top:2px;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.76rem,2vw,.92rem);color:var(--muted);}

  /* ---------- CAJA DE FRASE (con destello) ---------- */
  .quote-box{position:relative;border:1px solid var(--gold-dim);padding:clamp(34px,5vw,50px) clamp(22px,5vw,54px) clamp(26px,4vw,36px);max-width:640px;margin:0 auto;background:var(--black2);}
  .quote-box .quote-star{position:absolute;top:0;left:50%;transform:translate(-50%,-52%);background:var(--black2);padding:0 10px;color:var(--gold);}
  .message{font-size:clamp(1rem,2.2vw,1.22rem);font-style:italic;color:var(--ivory);max-width:560px;margin:0 auto;}
  .welcome-date{margin-top:20px;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:clamp(1rem,2.4vw,1.2rem);color:var(--gold-soft);letter-spacing:1px;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:clamp(10px,2.6vw,18px);justify-content:center;flex-wrap:wrap;margin:8px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:64px;padding:16px 10px;border:1px solid var(--gold-dim);background:var(--black2);}
  @media(min-width:480px){.countdown div{min-width:80px;padding:20px 14px;}}
  .cd-num{font-family:'Playfair Display',serif;font-weight:600;font-size:clamp(1.5rem,5vw,2.3rem);color:var(--gold);line-height:1;}
  .cd-label{font-family:'Jost',sans-serif;font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-top:8px;}

  /* ---------- TIMING ---------- */
  .timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:clamp(28px,5vw,40px);margin-top:30px;text-align:left;}
  .tl-wrap{position:relative;padding-top:26px;}
  .tl-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--black);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;color:var(--gold);z-index:2;}
  .tl-badge svg{width:22px;height:22px;}
  .card{border:1px solid var(--gold-dim);padding:34px 24px 24px;background:var(--black2);text-align:center;}
  .card h3{color:var(--gold-soft);font-size:.82rem;font-style:normal;font-family:'Jost',sans-serif;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;}
  .card p{margin:4px 0 0;color:var(--ivory);opacity:.85;}
  .card .hora{display:block;font-family:'Playfair Display',serif;font-weight:600;font-size:1.5rem;color:#fbf6ea;margin-bottom:2px;}
  .map-link{display:inline-block;margin-top:30px;font-family:'Jost',sans-serif;letter-spacing:2px;text-transform:uppercase;font-size:.76rem;color:var(--gold);border:1px solid var(--gold);border-radius:999px;padding:13px 30px;transition:background .2s,color .2s;text-decoration:none;}
  .map-link:hover{background:var(--gold);color:var(--black);}

  /* ---------- DRESS CODE ---------- */
  .swatches{display:flex;justify-content:center;gap:10px;margin:0 0 24px;flex-wrap:wrap;}
  .swatches span{width:30px;height:30px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.18);}
  .badge-dresscode{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--gold);border-radius:999px;padding:12px 28px;font-family:'Jost',sans-serif;letter-spacing:1.5px;text-transform:uppercase;font-size:.78rem;color:var(--gold-soft);}

  /* ---------- DETALLES / REGALO ---------- */
  .gift-wrap{position:relative;padding-top:26px;max-width:440px;margin:0 auto;}
  .gift-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--black);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;color:var(--gold);z-index:2;}
  .gift-badge svg{width:22px;height:22px;}
  .gift-box{border:1px solid var(--gold-dim);padding:36px 26px 26px;background:var(--black2);}
  .gift-box p{margin:0 0 16px;color:var(--ivory);opacity:.9;font-size:1.02rem;}
  .gift-box .alias{display:inline-block;font-family:'Jost',sans-serif;font-size:.8rem;letter-spacing:1px;border:1px solid var(--gold-dim);border-radius:999px;padding:9px 20px;color:var(--gold-soft);}

  /* ---------- GALERÍA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px;}
  .gallery img{width:100%;height:190px;object-fit:cover;cursor:pointer;border:1px solid var(--gold-dim);filter:saturate(.92) contrast(1.04) brightness(.95);transition:transform .35s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(4,4,4,.95);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-soft);font-size:2.2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP (asimétrico: form ancho + rama decorativa) ---------- */
  .rsvp-grid{max-width:900px;display:grid;grid-template-columns:1.4fr .9fr;gap:clamp(24px,4vw,54px);align-items:start;text-align:left;}
  .rsvp-side h2,.rsvp-side .subtitle{text-align:left;}
  .rsvp-deadline{font-family:'Jost',sans-serif;margin:-16px 0 22px;font-size:.76rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold-soft);}
  .rsvp-branch{display:flex;align-items:flex-start;justify-content:center;color:var(--gold-dim);padding-top:8px;}
  @media(max-width:720px){
    .rsvp-grid{grid-template-columns:1fr;}
    .rsvp-branch{display:none;}
  }

  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin:6px 0 0;text-align:left;}
  .rsvp-form label{font-family:'Jost',sans-serif;font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:11px 12px;border:1px solid var(--gold-dim);background:var(--black2);color:var(--ivory);border-radius:2px;margin-top:6px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#8a7d63;}
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{background:var(--gold);color:var(--black);border:0;padding:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:'Jost',sans-serif;font-size:.8rem;}
  .rsvp-form button:hover{background:var(--gold-soft);}
  .rsvp-whatsapp{font-family:'Jost',sans-serif;font-size:.8rem;text-align:center;text-decoration:none;color:var(--gold-soft);border-bottom:1px solid var(--gold-dim);padding-bottom:2px;align-self:center;}
  .rsvp-status{text-align:center;font-weight:bold;color:var(--gold-soft);}

  .gold-rule{height:1px;max-width:860px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-dim) 15%,var(--gold-dim) 85%,transparent);opacity:.7;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;overflow:hidden;text-align:center;padding:52px 24px 46px;background:var(--black);}
  footer::before,footer::after{content:"";position:absolute;bottom:0;width:150px;height:100px;background-image:radial-gradient(circle, var(--gold) 1px, transparent 1.6px);background-size:16px 16px;opacity:.3;pointer-events:none;}
  footer::before{left:0;}
  footer::after{right:0;background-position:7px 9px;}
  .foot-mono{width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-family:'Playfair Display',serif;font-size:.85rem;letter-spacing:1px;color:var(--gold-soft);position:relative;z-index:1;}
  .foot-names{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;letter-spacing:1px;font-size:1.3rem;color:var(--gold-soft);margin-bottom:8px;position:relative;z-index:1;}
  .foot-thanks{font-family:'Jost',sans-serif;font-size:.78rem;letter-spacing:.5px;color:var(--muted);position:relative;z-index:1;margin:0;}
</style></head>
<body>

  <div class="hero">
    <div class="gala-lights" aria-hidden="true">
      <span style="top:16%;left:12%;animation-duration:8.5s;animation-delay:0s;"></span>
      <span style="top:10%;left:78%;width:3px;height:3px;animation-duration:9.5s;animation-delay:1.3s;"></span>
      <span style="top:32%;left:88%;animation-duration:7.2s;animation-delay:2.6s;"></span>
      <span style="top:44%;left:20%;width:3px;height:3px;animation-duration:10s;animation-delay:.7s;"></span>
      <span style="top:62%;left:68%;animation-duration:8s;animation-delay:3.4s;"></span>
      <span style="top:70%;left:8%;width:3px;height:3px;animation-duration:9s;animation-delay:1.9s;"></span>
    </div>
    <div class="hero-content">
      <p class="eyebrow">Nos casamos</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="hero-divider"></div>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="quote-box">
      <div class="quote-star">${sparkleIcon(18)}</div>
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${fechaLarga ? `<p class="welcome-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Faltan</p>
    ${cd.html}
  </section>
  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? starDivider() : ""}

  ${
    (d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa)
      ? `<section>
    <p class="eyebrow">Timing</p>
    <h2 style="margin-bottom:30px;">Programa de la noche</h2>
    ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="tl-wrap">
        <div class="tl-badge">${champagneIcon()}</div>
        <div class="card">
          <h3>Ceremonia</h3>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="tl-wrap">
        <div class="tl-badge">${discoIcon()}</div>
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
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Vestimenta</h2>
    <div class="swatches">
      <span style="background:#0a0a0a"></span>
      <span style="background:#4b4b4b"></span>
      <span style="background:${GOLD}"></span>
      <span style="background:#c3c7cc"></span>
      <span style="background:#f4ecd8"></span>
    </div>
    <div class="badge-dresscode">${esc(d.dressCode)}</div>
  </section>` : ""}

  ${d.alias ? `<section>
    <p class="eyebrow">Detalles</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Para tener en cuenta</h2>
    <div class="gift-wrap">
      <div class="gift-badge">${giftIcon()}</div>
      <div class="gift-box">
        <p>Tu presencia es nuestro mejor regalo. Si deseás hacernos un presente, podés hacerlo por transferencia.</p>
        <span class="alias">Alias: ${esc(d.alias)}</span>
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Momentos</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Nuestra historia en fotos</h2>
    ${gal.html}
  </section>` : ""}

  ${starDivider()}

  <section>
    <div class="rsvp-grid">
      <div class="rsvp-side">
        <p class="eyebrow">Questionnaire</p>
        <h2>Confirmar asistencia</h2>
        ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : `<div style="margin-bottom:20px;"></div>`}
        ${rsvp.html}
      </div>
      <div class="rsvp-branch">${branchSVG(140, 400)}</div>
    </div>
  </section>

  <div class="gold-rule"></div>

  <footer>
    <div class="foot-mono">${esc(inicialNovia)}&nbsp;|&nbsp;${esc(inicialNovio)}</div>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    <p class="foot-thanks">Con todo nuestro cariño, gracias por ser parte de este día.</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:
      radial-gradient(circle at 20% 20%, rgba(255,255,255,.05), transparent 45%),
      radial-gradient(circle at 82% 82%, rgba(255,255,255,.05), transparent 45%),
      linear-gradient(160deg,#141210 0%,#070706 55%,#181310 100%);">
    <div style="font-family:'Jost',Georgia,sans-serif;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#e9d9ad;">Nos casamos</div>
    <div style="font-family:Georgia,'Playfair Display',serif;font-size:1rem;letter-spacing:2.5px;text-transform:uppercase;color:#f4e6c2;line-height:1.3;text-align:center;">${esc(d.name)}</div>
    <div style="width:44px;height:1px;background:#c9a45c;margin-top:2px;"></div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Nocturna Glamour",
  summary: "Boda de gala en negro y dorado: nombres en serif de trazo ancho, cajas con destellos, cronograma con insignias circulares y una rama dorada junto al formulario de RSVP.",
  accent: GOLD_FALLBACK, accent2: "#0a0a0a", schema: bodaSchema, sampleData, render, cardPreview,
};
