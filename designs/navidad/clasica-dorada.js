const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { navidadSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "nav-clasica-dorada";

const sampleData = {
  nombre: "Cena de Navidad en lo de los Ibáñez",
  fecha: "2026-12-24",
  hora: "21:00",
  lugar: "Casa de la familia Ibáñez, San Isidro",
  direccionMapa: "https://www.google.com/maps/search/?api=1&query=San+Isidro+Buenos+Aires",
  mensaje: "Después de un año movido, no hay nada mejor que juntarnos en familia para brindar, comer rico y agradecer todo lo lindo que tuvimos. Las puertas de casa están abiertas para pasar una Nochebuena como las de antes.",
  amigoInvisible: "Trajimos algo para el amigo invisible, tope $8000",
  whatsapp: "5491100000050",
  fechaLimiteRSVP: "2026-12-18",
  coverImage: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80",
    "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80",
    "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=80",
    "https://images.unsplash.com/photo-1544273677-6e4ffcd061cc?w=800&q=80",
  ],
};

// ============================================================
// Motivos navideños dibujados a mano en SVG — currentColor / var(),
// sin depender de librerías de íconos ni imágenes externas.
// ============================================================

// ---------- Guirnalda de pino en swag (rama colgante entre "clavos"),
// con bolitas doradas/guinda intercaladas y un moño en el centro.
// Se precalcula una sola vez (no depende de los datos del usuario).
const GARLAND_W = 640, GARLAND_H = 56, GARLAND_MIDY = 26, GARLAND_AMP = 14, GARLAND_PERIOD = 160;
function garlandY(x) {
  return GARLAND_MIDY - GARLAND_AMP * Math.cos((2 * Math.PI * x) / GARLAND_PERIOD);
}
function buildGarlandRope() {
  let d = `M0,${garlandY(0).toFixed(1)}`;
  for (let x = 8; x <= GARLAND_W; x += 8) d += ` L${x},${garlandY(x).toFixed(1)}`;
  return d;
}
function pineTuftAt(x, y) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" stroke="var(--garland-pine)" stroke-width="1.3" stroke-linecap="round" fill="none">
    <path d="M0,0 L-7,11"/><path d="M0,0 L7,11"/><path d="M0,0 L0,13"/>
  </g>`;
}
function ornamentBallAt(x, y, guinda) {
  const fill = guinda ? "var(--guinda-light)" : "var(--gold-light)";
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
    <line x1="0" y1="0" x2="0" y2="5" stroke="var(--gold-dark)" stroke-width="1"/>
    <circle cx="0" cy="10" r="5" fill="${fill}" stroke="var(--gold-dark)" stroke-width=".8"/>
    <circle cx="-1.6" cy="8.3" r="1.3" fill="#fff" opacity=".55"/>
  </g>`;
}
function buildGarlandOrnaments() {
  let out = "";
  let i = 0;
  for (let x = 20; x < GARLAND_W; x += 40, i++) {
    const y = garlandY(x);
    if (i % 3 === 1) out += ornamentBallAt(x, y, (i % 6) === 1);
    else out += pineTuftAt(x, y);
  }
  return out;
}
const GARLAND_BOW = `<g transform="translate(${GARLAND_W / 2},${garlandY(GARLAND_W / 2).toFixed(1)})">
  <path d="M0,-1 C-13,-13 -22,-2 -10,3 C-22,7 -13,17 0,6 C13,17 22,7 10,3 C22,-2 13,-13 0,-1Z" fill="var(--guinda)" stroke="var(--guinda-dark)" stroke-width=".8"/>
  <circle cx="0" cy="1.5" r="3.2" fill="var(--gold-light)" stroke="var(--gold-dark)" stroke-width=".7"/>
</g>`;
const GARLAND_ROPE_D = buildGarlandRope();
const GARLAND_INNER = `<path d="${GARLAND_ROPE_D}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/>${buildGarlandOrnaments()}${GARLAND_BOW}`;
function garlandSVG(extraClass) {
  return `<svg class="garland ${extraClass || ""}" viewBox="0 0 ${GARLAND_W} ${GARLAND_H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${GARLAND_INNER}</svg>`;
}

// ---------- Guirnalda de luces cálidas (bombitas con brillo animado) ----------
const LIGHTS_W = 520, LIGHTS_H = 34, LIGHTS_N = 13;
function buildLights() {
  let out = `<path d="M0,6 Q${LIGHTS_W / 2},16 ${LIGHTS_W},6" fill="none" stroke="var(--gold-dark)" stroke-width="1" opacity=".55"/>`;
  const drops = [10, 18, 14, 20, 12, 16, 22, 10, 18, 14, 20, 12, 16];
  for (let i = 0; i < LIGHTS_N; i++) {
    const x = (LIGHTS_W / (LIGHTS_N - 1)) * i;
    const wireY = 6 + Math.sin((Math.PI * i) / (LIGHTS_N - 1)) * 10;
    const drop = drops[i % drops.length];
    const cy = wireY + drop;
    const delay = (i * 0.31).toFixed(2);
    out += `<line x1="${x.toFixed(1)}" y1="${wireY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(cy - 4).toFixed(1)}" stroke="var(--gold-dark)" stroke-width=".8" opacity=".55"/>
    <circle class="bulb" style="animation-delay:${delay}s" cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.2" fill="var(--gold-light)"/>`;
  }
  return out;
}
const LIGHTS_INNER = buildLights();
function lightsSVG() {
  return `<svg class="lights" viewBox="0 0 ${LIGHTS_W} ${LIGHTS_H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${LIGHTS_INNER}</svg>`;
}

// ---------- Copo de nieve fino (asterisco de 4 líneas, 8 puntas) ----------
function snowflakeSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <path d="M16 2v28M2 16h28M6 6l20 20M26 6L6 26"/>
    </g>
  </svg>`;
}

// ---------- Estrella navideña (5 puntas, sólida) ----------
function starSVG() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 1.5l2.9 7.4 7.9.4-6.2 5 2.2 7.7L12 17.6l-6.8 4.4 2.2-7.7-6.2-5 7.9-.4z"/>
  </svg>`;
}

// ---------- Campana (para "cuándo y dónde") ----------
function bellSVG() {
  return `<svg viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3c-4 0-6.5 3.4-6.5 8v3.2L3 18h18l-2.5-3.8V11c0-4.6-2.5-8-6.5-8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="12" cy="2" r="1.3" fill="currentColor"/>
    <path d="M9 18a3 3 0 0 0 6 0" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
}

// ---------- Ubicación (pin) ----------
function pinSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21s7-7.4 7-12.4A7 7 0 1 0 5 8.6C5 13.6 12 21 12 21Z" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="12" cy="8.6" r="2.4" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

// ---------- Regalo (amigo invisible) ----------
function giftSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="10" width="16" height="10" stroke="currentColor" stroke-width="1.2"/>
    <path d="M3 10h18v3H3z" stroke="currentColor" stroke-width="1.2"/>
    <path d="M12 10v10M12 10c-2.4 0-3.8-1.5-3.8-3 0-1.3.9-2.2 2-2.2 1.3 0 1.8 1.2 1.8 2.4M12 10c2.4 0 3.8-1.5 3.8-3 0-1.3-.9-2.2-2-2.2-1.3 0-1.8 1.2-1.8 2.4" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function miniDivider() {
  return `<div class="mini-divider"><span class="md-line"></span><span class="md-star">${starSVG()}</span><span class="md-line"></span></div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c9a24a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let fechaLarga = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        fechaLarga = `${DIAS[dt.getDay()]} ${Number(partes[2])} de ${MESES[dt.getMonth()]} de ${partes[0]}`;
      }
    }
  }

  // Nieve cayendo — capa fija, decorativa, sólo CSS (respeta prefers-reduced-motion).
  const flakeSizes = [12, 9, 16, 8, 14, 10, 18, 9, 12, 15, 8, 13];
  const snowLayer = `<div class="snow" aria-hidden="true">
    ${flakeSizes.map((sz, i) => {
      const left = ((i * 131.5) % 100).toFixed(1);
      const dur = (16 + (i % 6) * 3.1).toFixed(1);
      const delay = (-(i * 2.1) % 22).toFixed(1);
      const drift = (i % 2 === 0 ? 1 : -1) * (16 + (i % 5) * 5);
      return `<span class="flake" style="left:${left}%;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;opacity:${(0.3 + (i % 4) * 0.11).toFixed(2)}">${snowflakeSVG(sz)}</span>`;
    }).join("")}
  </div>`;

  const cornerStar = (extraClass) => `<span class="corner-star ${extraClass}">${starSVG()}</span>`;
  const corners = `${cornerStar("cs-tl")}${cornerStar("cs-tr")}${cornerStar("cs-bl")}${cornerStar("cs-br")}`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&amp;family=Marcellus&amp;family=Jost:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --pine-deep:#0e2a1f;
    --pine:#153524;
    --pine-2:#1b432c;
    --garland-pine:#5c8a6c;
    --gold:${accent};
    --gold-dark:color-mix(in srgb, ${accent}, black 30%);
    --gold-light:color-mix(in srgb, ${accent}, white 40%);
    --guinda:#8c2f2f;
    --guinda-dark:color-mix(in srgb, #8c2f2f, black 25%);
    --guinda-light:color-mix(in srgb, #8c2f2f, white 25%);
    --cream:#faf3e3;
    --cream2:#f0e3c4;
    --paper:#fffbf1;
    --ink:#2c2417;
    --ink-soft:#6d5f45;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--cream);color:var(--ink);}
  img{max-width:100%;display:block;}
  a{color:inherit;}
  h1,h2,h3{font-family:'Marcellus',serif;font-weight:400;margin:0;}

  /* ---------- NIEVE CAYENDO ---------- */
  .snow{position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;}
  .flake{position:absolute;top:-8%;color:#fdf6e3;animation-name:caer;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
  .flake svg{display:block;width:100%;height:100%;}
  @keyframes caer{
    0%{transform:translate3d(0,-10vh,0) rotate(0deg);}
    100%{transform:translate3d(var(--drift,20px),115vh,0) rotate(200deg);}
  }
  @media (prefers-reduced-motion: reduce){ .flake{animation:none;display:none;} }

  /* ---------- GUIRNALDA DE PINO ---------- */
  .garland{display:block;width:100%;height:44px;color:var(--garland-pine);}
  .garland-top{position:absolute;top:0;left:0;right:0;height:44px;z-index:2;}
  .garland-divider{width:min(260px,70%);height:26px;margin:0 auto 26px;}

  /* ---------- LUCES CÁLIDAS ---------- */
  .lights{display:block;width:100%;height:30px;}
  .bulb{filter:drop-shadow(0 0 1px var(--gold-light));animation:twinkle 2.6s ease-in-out infinite;}
  @keyframes twinkle{
    0%,100%{opacity:.5;filter:drop-shadow(0 0 1px var(--gold-light));}
    50%{opacity:1;filter:drop-shadow(0 0 6px var(--gold-light));}
  }
  @media (prefers-reduced-motion: reduce){ .bulb{animation:none;opacity:.9;} }

  /* ---------- ESTRELLAS DE ESQUINA ---------- */
  .corner-star{position:absolute;width:20px;height:20px;color:var(--gold-light);opacity:.75;pointer-events:none;z-index:2;}
  .corner-star svg{width:100%;height:100%;}
  @media(min-width:480px){.corner-star{width:26px;height:26px;}}
  .corner-star.cs-tl{top:56px;left:18px;}
  .corner-star.cs-tr{top:56px;right:18px;}
  .corner-star.cs-bl{bottom:18px;left:18px;}
  .corner-star.cs-br{bottom:18px;right:18px;}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:100vh;padding:70px 20px 64px;
    display:flex;align-items:center;justify-content:center;text-align:center;
    background-image:
      linear-gradient(180deg, rgba(14,42,31,.80) 0%, rgba(14,42,31,.55) 42%, rgba(14,42,31,.90) 100%),
      url('${esc(d.coverImage)}');
    background-size:cover;background-position:center;
    color:var(--cream);overflow:hidden;
  }
  .hero::after{content:"";position:absolute;inset:16px;border:1px solid color-mix(in srgb, var(--gold-light) 55%, transparent);pointer-events:none;}
  .hero-content{position:relative;z-index:1;max-width:560px;}
  .star-top{width:26px;height:26px;color:var(--gold-light);margin:0 auto 14px;}
  .eyebrow{text-transform:uppercase;letter-spacing:.28em;font-size:clamp(.65rem,2vw,.78rem);color:var(--gold-light);margin:0 0 16px;}
  .hero-content h1{font-size:clamp(2rem,7.5vw,3.1rem);line-height:1.2;color:#fffaf0;}
  .thin-divider{width:74px;height:1px;background:var(--gold);margin:24px auto;position:relative;}
  .thin-divider::before{content:"✧";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.75rem;color:var(--gold-light);line-height:1;}
  .date-line{margin:0 0 22px;color:var(--cream2);letter-spacing:2px;font-size:.92rem;text-transform:capitalize;}
  .hero-lights{max-width:420px;margin:0 auto;}

  /* ---------- SECTIONS ---------- */
  section{max-width:720px;margin:0 auto;padding:60px 22px;text-align:center;position:relative;}
  h2{letter-spacing:2.5px;text-transform:uppercase;font-size:clamp(1.1rem,4vw,1.5rem);color:var(--pine-2);margin:0 0 6px;}
  .subtitle{font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold-dark);margin:0 0 8px;}

  .mini-divider{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 auto 26px;}
  .md-line{width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}
  .md-star{width:16px;height:16px;color:var(--gold);flex-shrink:0;}
  .md-star svg{width:100%;height:100%;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:26px 0 4px;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:linear-gradient(160deg,var(--paper),var(--cream2));
    color:var(--pine-2);min-width:70px;padding:18px 10px 14px;
    border:1px solid var(--gold);border-radius:3px;position:relative;
    box-shadow:0 8px 18px rgba(14,42,31,.10);
  }
  .countdown div::before{content:"❄";position:absolute;top:-9px;left:50%;transform:translate(-50%,0);font-size:.7rem;color:var(--gold-dark);background:var(--cream);padding:0 4px;line-height:1;}
  @media(min-width:480px){.countdown div{min-width:84px;padding:22px 14px 16px;}}
  .cd-num{font-family:'Marcellus',serif;font-size:1.8rem;color:var(--pine-2);line-height:1;}
  .cd-label{color:var(--gold-dark);margin-top:8px;font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;}

  /* ---------- MENSAJE ---------- */
  .message-row{display:flex;align-items:center;justify-content:center;gap:16px;}
  .message-row svg{width:22px;height:22px;color:var(--gold);flex-shrink:0;}
  .message{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.4rem;line-height:1.8;color:var(--pine-2);margin:0;}

  /* ---------- CUÁNDO Y DÓNDE ---------- */
  .info-card{
    display:inline-flex;flex-direction:column;gap:14px;align-items:center;
    background:var(--paper);border:1px solid var(--cream2);border-radius:6px;
    padding:32px 30px;box-shadow:0 10px 24px rgba(14,42,31,.08);max-width:400px;
  }
  .info-icon{width:38px;height:38px;border-radius:50%;background:var(--pine-2);color:var(--gold-light);display:flex;align-items:center;justify-content:center;}
  .info-icon svg{width:19px;height:19px;}
  .info-row{display:flex;flex-direction:column;gap:2px;}
  .info-row .lbl{text-transform:uppercase;letter-spacing:2px;font-size:.62rem;color:var(--gold-dark);}
  .info-row .val{font-size:1rem;color:var(--ink);line-height:1.5;}
  .map-link{display:inline-block;margin-top:4px;color:var(--pine-2);text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px;font-size:.86rem;letter-spacing:.5px;}
  .map-link:hover{color:var(--gold-dark);}

  /* ---------- AMIGO INVISIBLE ---------- */
  .gift-card{
    display:inline-flex;align-items:center;gap:16px;
    border:1px solid var(--guinda);padding:18px 28px;background:var(--paper);
    box-shadow:0 8px 18px rgba(140,47,47,.10);border-radius:4px;max-width:420px;
  }
  .gift-icon{width:40px;height:40px;border-radius:50%;background:var(--guinda);color:var(--cream);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .gift-icon svg{width:19px;height:19px;}
  .gift-text{text-align:left;}
  .gift-text .gift-label{display:block;color:var(--guinda-dark);text-transform:uppercase;letter-spacing:2px;font-size:.64rem;margin-bottom:5px;}
  .gift-text .gift-msg{font-size:.96rem;color:var(--ink);line-height:1.5;}

  /* ---------- DARK SECTION (galería) ---------- */
  .dark{
    position:relative;max-width:none;
    background:
      radial-gradient(circle at 12% 18%, rgba(201,162,74,.08), transparent 40%),
      radial-gradient(circle at 90% 85%, rgba(201,162,74,.06), transparent 42%),
      linear-gradient(165deg,var(--pine-2),var(--pine-deep) 60%,var(--pine));
    color:var(--cream);padding:64px 22px;
  }
  .dark > *{max-width:720px;margin-left:auto;margin-right:auto;}
  .dark h2{color:#fffaf0;}
  .dark .subtitle{color:var(--gold-light);}

  /* ---------- GALLERY (widget) ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:16px;}
  .gallery-item{border:1px solid var(--gold-dark);overflow:hidden;border-radius:2px;}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;filter:saturate(.95);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,15,10,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:18px;right:24px;color:var(--gold-light);font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP ---------- */
  .rsvp-section{max-width:820px;display:grid;grid-template-columns:minmax(180px,240px) 1px 1fr;gap:40px;align-items:center;text-align:center;}
  .rsvp-divider{align-self:stretch;background:linear-gradient(var(--cream) 0, var(--gold) 12%, var(--gold) 88%, var(--cream) 100%);opacity:.5;}
  .rsvp-side h2{margin:0 0 10px;}
  .rsvp-sub-label{color:var(--ink-soft);margin:0;line-height:1.8;font-size:.95rem;}
  .rsvp-deadline{color:var(--guinda-dark);font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 0;}
  @media(max-width:680px){
    .rsvp-section{grid-template-columns:1fr;gap:30px;}
    .rsvp-divider{display:none;}
  }
  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:left;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Jost',sans-serif;font-size:.95rem;background:var(--paper);color:var(--ink);
    padding:11px 12px;border:1px solid color-mix(in srgb, var(--gold) 40%, #e6d9b8);width:100%;border-radius:2px;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#a89a78;}
  .rsvp-form button{
    background:var(--pine-2);color:#fffaf0;border:1px solid var(--pine-2);padding:13px;
    letter-spacing:3px;text-transform:uppercase;font-size:.76rem;cursor:pointer;transition:background .25s,color .25s;border-radius:2px;
  }
  .rsvp-form button:hover{background:var(--gold-dark);border-color:var(--gold-dark);}
  .rsvp-whatsapp{font-size:.82rem;color:var(--pine-2);text-align:center;text-decoration:none;letter-spacing:1px;border-bottom:1px solid var(--gold);padding-bottom:2px;}
  .rsvp-whatsapp:hover{color:var(--gold-dark);}
  .rsvp-status{text-align:center;color:var(--pine-2);font-weight:500;letter-spacing:1px;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;text-align:center;padding:52px 22px 60px;background:var(--pine-deep);color:var(--cream2);}
  footer .foot-star{width:26px;height:26px;color:var(--gold-light);margin:0 auto 16px;}
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.25rem;color:#fffaf0;margin:0 0 8px;}
  footer .host{font-family:'Marcellus',serif;letter-spacing:1px;color:var(--gold-light);}
</style></head>
<body>

  ${snowLayer}

  <div class="hero">
    ${garlandSVG("garland-top")}
    ${corners}
    <div class="hero-content">
      <div class="star-top">${starSVG()}</div>
      <p class="eyebrow">Feliz Navidad</p>
      <h1>${esc(d.nombre)}</h1>
      <div class="thin-divider"></div>
      <p class="date-line">${fechaLarga ? esc(fechaLarga) : esc(d.fecha)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p>
      <div class="hero-lights">${lightsSVG()}</div>
    </div>
  </div>

  <section>
    ${miniDivider()}
    <h2>Cuenta regresiva</h2>
    ${cd.html}
  </section>

  ${d.mensaje ? `<section>
    <div class="message-row">
      ${bellSVG()}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${bellSVG()}
    </div>
  </section>` : ""}

  ${(d.hora || d.lugar || d.direccionMapa) ? `<section>
    ${miniDivider()}
    <h2>Cuándo y dónde</h2>
    <div class="info-card" style="margin-top:22px;">
      <div class="info-icon">${bellSVG()}</div>
      ${fechaLarga ? `<div class="info-row"><span class="lbl">Fecha</span><span class="val">${esc(fechaLarga)}${d.hora ? ` — ${esc(d.hora)} hs` : ""}</span></div>` : ""}
      ${d.lugar ? `<div class="info-row"><span class="lbl">Lugar</span><span class="val">${esc(d.lugar)}</span></div>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">${pinSVG()} Ver ubicación en el mapa</a>` : ""}
    </div>
  </section>` : ""}

  ${d.amigoInvisible ? `<section>
    ${miniDivider()}
    <h2>Amigo invisible</h2>
    <div class="gift-card" style="margin-top:22px;">
      <div class="gift-icon">${giftSVG()}</div>
      <div class="gift-text">
        <span class="gift-label">No te olvides</span>
        <span class="gift-msg">${esc(d.amigoInvisible)}</span>
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section class="dark">
    ${garlandSVG("garland-divider")}
    <h2>Momentos</h2>
    <p class="subtitle">Para ir entrando en clima</p>
    ${gal.html}
  </section>` : ""}

  <section class="rsvp-section">
    <div class="rsvp-side">
      <h2>RSVP</h2>
      <p class="rsvp-sub-label">Confirmá tu asistencia${rsvpDeadline ? "" : " antes de la fecha"}</p>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    </div>
    <div class="rsvp-divider" aria-hidden="true"></div>
    <div class="rsvp-side">${rsvp.html}</div>
  </section>

  <footer>
    <div class="foot-star">${starSVG()}</div>
    <p class="thanks">¡Los esperamos para brindar juntos!</p>
    <p class="host">${esc(d.nombre)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const accent = d.accent || "#c9a24a";
  const accent2 = d.accent2 || "#0e2a1f";
  const dots = [
    [26, 24], [270, 30], [20, 170], [276, 152], [42, 92], [254, 98],
    [128, 20], [176, 178], [60, 44], [238, 158],
  ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${accent}" fill-opacity=".65"/>`).join("");
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block;">
    <rect x="0" y="0" width="300" height="200" fill="${accent2}"/>
    ${dots}
    <path d="M20,20 Q150,50 280,20" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="80" cy="34" r="4" fill="${accent}" opacity=".85"/>
    <circle cx="220" cy="34" r="4" fill="#8c2f2f" opacity=".85"/>
    <g transform="translate(150,88)" fill="${accent}">
      <path d="M12 0l3.2 8.1 8.7.4-6.9 5.5 2.4 8.4L12 17.6l-7.4 4.8 2.4-8.4-6.9-5.5 8.7-.4Z"/>
    </g>
    <text x="150" y="164" text-anchor="middle" font-family="'Marcellus', Georgia, serif" font-size="18" fill="#fffaf0" letter-spacing="1">${esc(d.name)}</text>
  </svg>`;
}

module.exports = {
  id, category: "navidad", name: "Clásica Dorada",
  summary: "Verde pino profundo, dorado navideño y un toque guinda: guirnaldas con moños, luces cálidas titilando y nieve fina cayendo — la Navidad elegante y festiva, la más completa de la categoría.",
  accent: "#c9a24a", accent2: "#0e2a1f", schema: navidadSchema, sampleData, render, cardPreview,
};
