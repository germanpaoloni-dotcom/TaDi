const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-glam-rosa";

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const sampleData = {
  nombre: "Abigail",
  fecha: "2027-09-23",
  horaCeremonia: "",
  lugarCeremonia: "",
  horaFiesta: "17:30",
  lugarFiesta: "Salón Cristal",
  direccionMapa: "https://maps.google.com/?q=Salon+Cristal",
  padres: "Sus padres, Laura y Diego",
  mensaje: "Hoy dejo atrás mi niñez para comenzar un nuevo capítulo, rodeada del amor de quienes más quiero. Atesoro en mi corazón miles de recuerdos viejos y recientes. Por ser parte de ellos, es importante que estés en mis 15 años.",
  dressCode: "Formal",
  whatsapp: "5491100000003",
  coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    "https://images.unsplash.com/photo-1640827013600-1f5411ec366b?w=900&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80",
  ],
};

// Motivos "glam rosa" dibujados a mano en SVG inline (currentColor): moño,
// rama floral de esquina, tiara con corazón, corazón para la fecha, arco
// de texto para el título, copas de brindis, siluetas de gala y un sobre
// con moño. Sin dependencias externas ni imágenes decorativas.
function bowSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 20c-3-9-13-13-19-9-5 3-4 11 3 12 5 1 12-1 16-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M30 20c3-9 13-13 19-9 5 3 4 11-3 12-5 1-12-1-16-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="30" cy="20" r="3.2" fill="currentColor"/>
    <path d="M30 23c-1 5-2 9-5 12M30 23c1 5 2 9 5 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function floralCornerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 8c30 4 55 16 70 38 12 18 16 40 12 66" stroke="currentColor" stroke-width="1.3" fill="none" opacity=".85"/>
    <path d="M20 14c14 10 20 24 16 40" stroke="currentColor" stroke-width="1.1" fill="none" opacity=".7"/>
    <circle cx="26" cy="24" r="9" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <circle cx="26" cy="24" r="3" fill="currentColor" opacity=".6"/>
    <circle cx="48" cy="42" r="7" stroke="currentColor" stroke-width="1.1" fill="none"/>
    <circle cx="66" cy="66" r="10" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <circle cx="66" cy="66" r="3.2" fill="currentColor" opacity=".6"/>
    <path d="M40 30c6 4 8 10 6 16-8-2-12-8-6-16Z" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M58 52c6 3 9 9 7 15-8-1-13-7-7-15Z" stroke="currentColor" stroke-width="1" fill="none"/>
    <ellipse cx="90" cy="30" rx="10" ry="5" stroke="currentColor" stroke-width="1" fill="none" transform="rotate(-25 90 30)" opacity=".7"/>
  </svg>`;
}

function tiaraSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 78c0-30 6-46 14-46 6 0 6 14 12 14s8-24 20-24 12 22 20 22 10-30 20-30 12 30 20 30 14-22 20-22 6 24 12 24 14-16 14 46" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M10 78h180" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M92 30c4-6 12-6 16 0 4-6 12-6 16 0-3 8-9 12-16 16-7-4-13-8-16-16Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <circle cx="46" cy="46" r="2.6" fill="currentColor"/>
    <circle cx="154" cy="46" r="2.6" fill="currentColor"/>
    <circle cx="20" cy="60" r="2" fill="currentColor"/>
    <circle cx="180" cy="60" r="2" fill="currentColor"/>
  </svg>`;
}

function heartSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M50 82C50 82 6 54 6 24C6 8 20 2 32 6C42 9 48 18 50 26C52 18 58 9 68 6C80 2 94 8 94 24C94 54 50 82 50 82Z" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
  </svg>`;
}

// Título arqueado "MIS QUINCEAÑOS" con el "15" apoyado sobre la curva,
// como en la referencia. archId debe ser único por render (se usa como
// id del <path> que sirve de guía para el texto).
function archSvg(archId) {
  return `<svg class="hero-arch" viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><path id="${archId}" d="M14,108 C14,36 84,8 150,8 C216,8 286,36 286,108" fill="none"/></defs>
    <text class="arch-text"><textPath href="#${archId}" startOffset="50%" text-anchor="middle">MIS QUINCEAÑOS</textPath></text>
    <text class="arch-num" x="150" y="112" text-anchor="middle">15</text>
  </svg>`;
}

function glassesSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M40 14c0 16 10 24 10 24s10-8 10-24" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M35 12h30" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 38v34" stroke="currentColor" stroke-width="1.6"/>
    <path d="M36 76h28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M90 20c0 18 12 26 12 26s12-8 12-26" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M84 18h36" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M102 46v28" stroke="currentColor" stroke-width="1.6"/>
    <path d="M88 78h28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M96 30l3 3 5-6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="70" cy="14" r="1.4" fill="currentColor"/>
    <circle cx="120" cy="10" r="1.4" fill="currentColor"/>
    <circle cx="78" cy="24" r="1" fill="currentColor"/>
  </svg>`;
}

function coupleSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="52" cy="16" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M52 25c-14 0-20 10-20 24 3 2 5 3 8 3l2 40h20l2-40c3 0 5-1 8-3 0-14-6-24-20-24Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M40 49l-8 20M64 49l8 20" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="112" cy="14" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M112 23c-8 0-12 4-12 10 0 4 2 6 4 8-10 8-12 22-8 51h32c4-29 2-43-8-51 2-2 4-4 4-8 0-6-4-10-12-10Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M100 33l-10 14M124 33l10 14" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function envelopeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="14" y="30" width="112" height="60" rx="4" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M14 34l56 38 56-38" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M60 6c-3-6-12-6-13 1-1 6 6 9 13 9 7 0 14-3 13-9-1-7-10-7-13-1Z" stroke="currentColor" stroke-width="1.3" fill="none"/>
    <path d="M60 16c-1 3-1 7 0 10M60 16c1 3 1 7 0 10" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

function sparkleSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4c1 7 3 11 12 12-9 1-11 5-12 12-1-7-3-11-12-12 9-1 11-5 12-12Z" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c9536c");
  const targetISO = d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha;
  const cd = countdownWidget(targetISO, "cd-glam");
  const gal = galleryWidget(d.galeria || [], "gal-glam");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);
  const archId = "arch-" + Math.random().toString(36).slice(2, 8);

  let diaSemana = "", diaNum = "", mesNombre = "";
  if (d.fecha) {
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      diaSemana = DIAS_ES[dt.getDay()];
      diaNum = String(day);
      mesNombre = MESES_ES[dt.getMonth()];
    } catch { /* ignore */ }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --blush:#eec2c8;
    --blush-soft:#f7dfe2;
    --ivory:#fffbfa;
    --rose:${accent};
    --rose-deep:color-mix(in srgb, ${accent}, black 18%);
    --rose-light:color-mix(in srgb, ${accent}, white 50%);
    --gold:#b6924f;
    --gold-light:#d9c396;
    --ink:#4a2f37;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Montserrat',sans-serif;color:var(--ink);line-height:1.65;
    background:linear-gradient(180deg,#e3a9ad 0%,var(--blush) 14%,var(--blush) 100%);
  }
  h1,h2,h3{font-family:'Playfair Display',serif;margin:0;}
  .script{font-family:'Great Vibes',cursive;line-height:1.2;}
  .icon{color:var(--rose-light);}
  .icon-gold{color:var(--gold);width:28px;height:28px;display:inline-block;}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}

  section{max-width:720px;margin:0 auto;padding:clamp(30px,7vw,58px) 20px;text-align:center;position:relative;}
  .eyebrow{
    font-family:'Great Vibes',cursive;color:var(--gold);
    font-size:clamp(1.6rem,5vw,2.3rem);margin-bottom:10px;display:block;
  }

  /* ---------- ORNAMENTO DE ESQUINA reutilizable ---------- */
  .deco-corner{position:absolute;width:clamp(60px,18vw,110px);height:auto;color:var(--rose-light);opacity:.55;pointer-events:none;z-index:0;}
  .deco-corner.tl{top:0;left:0;}
  .deco-corner.tr{top:0;right:0;transform:scaleX(-1);}
  .deco-corner.bl{bottom:0;left:0;transform:scaleY(-1);}
  .deco-corner.br{bottom:0;right:0;transform:scale(-1,-1);}

  /* ---------- HERO ---------- */
  .hero-wrap{position:relative;padding:34px 16px 44px;}
  .hero-wrap .deco-corner{width:clamp(90px,26vw,150px);opacity:.9;}
  .hero-wrap .deco-corner.tl{top:2px;left:2px;}
  .hero-wrap .deco-corner.tr{top:2px;right:2px;}
  .hero-wrap .deco-corner.bl{bottom:2px;left:2px;}
  .hero-wrap .deco-corner.br{bottom:2px;right:2px;}

  .hero-card{
    position:relative;z-index:1;max-width:480px;margin:0 auto;
    background:var(--ivory);
    border:1px solid var(--gold-light);
    border-radius:38px 38px 90px 90px/38px 38px 60px 60px;
    padding:clamp(26px,6vw,42px) clamp(18px,6vw,36px) clamp(34px,8vw,50px);
    box-shadow:0 18px 40px color-mix(in srgb, var(--rose-deep) 12%, transparent);
  }
  .hero-card::before{
    content:"";position:absolute;inset:10px;
    border:1px solid var(--rose-light);
    border-radius:32px 32px 80px 80px/32px 32px 52px 52px;
    pointer-events:none;
  }
  .hero-arch{width:100%;max-width:270px;height:auto;display:block;margin:0 auto;overflow:visible;position:relative;}
  .arch-text{font-family:'Playfair Display',serif;font-weight:600;font-size:15px;letter-spacing:4px;fill:var(--rose-deep);}
  .arch-num{font-family:'Playfair Display',serif;font-weight:700;font-size:70px;fill:var(--gold);}
  .hero-divider{width:clamp(64px,18vw,92px);height:auto;color:var(--rose-light);margin:2px auto 10px;display:block;}
  .hero-name{
    font-family:'Great Vibes',cursive;color:var(--rose);
    font-size:clamp(2.6rem,10vw,4.2rem);margin:2px 0 10px;
  }
  .hero-sub{color:var(--gold);font-weight:600;letter-spacing:.5px;font-size:clamp(.9rem,2.4vw,1.05rem);margin:0 0 20px;}
  .hero-date{
    display:inline-flex;align-items:center;gap:10px;
    color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-weight:600;
    font-size:clamp(.7rem,2vw,.85rem);
  }
  .hero-date .badge{
    position:relative;display:inline-flex;align-items:center;justify-content:center;
    width:clamp(38px,9vw,48px);height:clamp(34px,8vw,44px);
  }
  .hero-date .badge svg{position:absolute;inset:0;width:100%;height:100%;color:var(--rose);}
  .hero-date .badge-num{position:relative;z-index:1;font-family:'Playfair Display',serif;font-weight:700;color:var(--rose-deep);font-size:clamp(.9rem,2.4vw,1.05rem);margin-top:-2px;}
  .hero-tiara{width:clamp(150px,46vw,220px);height:auto;color:var(--rose-light);margin:22px auto 0;display:block;}

  /* ---------- FOTOS + MENSAJE ---------- */
  .section-blush{background:linear-gradient(180deg,var(--blush-soft),transparent);display:flex;flex-direction:column;align-items:center;}
  .photo-strip{display:flex;align-items:center;justify-content:center;gap:16px;margin:4px 0 32px;position:relative;z-index:1;}
  .sidebar-label{
    writing-mode:vertical-rl;transform:rotate(180deg);
    font-family:'Playfair Display',serif;font-weight:600;letter-spacing:5px;text-transform:uppercase;
    color:var(--rose);font-size:.78rem;white-space:nowrap;flex-shrink:0;
  }
  .gallery{display:flex;flex-direction:column;align-items:center;gap:0;}
  .gallery-item{
    background:var(--ivory);padding:8px 8px 22px;border-radius:2px;
    box-shadow:0 10px 20px rgba(74,47,55,.2);width:140px;margin-top:-30px;position:relative;
  }
  .gallery-item:first-child{margin-top:0;z-index:2;}
  .gallery-item:nth-child(2){z-index:1;}
  .gallery-item:nth-child(odd){transform:rotate(-3deg);}
  .gallery-item:nth-child(even){transform:rotate(2.5deg);}
  .gallery-item img{width:100%;height:150px;object-fit:cover;cursor:pointer;display:block;}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(74,47,55,.92);
    z-index:50;align-items:center;justify-content:center;cursor:zoom-out;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:6px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--ivory);font-size:2rem;cursor:pointer;}

  .quote-card{
    max-width:320px;margin:0;background:var(--ivory);
    border:1px dashed var(--rose-light);border-radius:16px;
    padding:32px 22px 24px;position:relative;
  }
  .quote-card .ribbon{position:absolute;top:-15px;left:50%;transform:translateX(-50%);width:30px;height:auto;background:var(--blush-soft);padding:2px 8px;border-radius:8px;}
  .quote-card p{font-size:clamp(.9rem,2.2vw,1rem);color:var(--rose-deep);margin:0 0 12px;font-style:italic;line-height:1.75;}
  .quote-card .padres{font-family:'Great Vibes',cursive;color:var(--gold);font-size:clamp(1.3rem,3.6vw,1.6rem);font-style:normal;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{
    display:flex;justify-content:center;align-items:stretch;flex-wrap:wrap;
    background:var(--ivory);border:1px solid var(--gold-light);border-radius:14px;
    max-width:400px;margin:0 auto;padding:8px 6px;
  }
  .countdown > div{
    flex:1;min-width:64px;padding:12px 8px;position:relative;
  }
  .countdown > div + div::before{
    content:":";position:absolute;left:-4px;top:9px;
    font-family:'Playfair Display',serif;font-weight:700;color:var(--gold);
    font-size:clamp(1.3rem,4vw,1.8rem);line-height:1;
  }
  .cd-num{display:block;font-family:'Playfair Display',serif;font-weight:700;color:var(--gold);font-size:clamp(1.5rem,5vw,2.1rem);}
  .cd-label{display:block;margin-top:4px;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:var(--rose);}

  /* ---------- DETALLES: tarjetas ---------- */
  .detail-card{
    max-width:320px;margin:0 auto 26px;background:var(--ivory);
    border:1px solid var(--gold-light);border-radius:20px;
    padding:36px 24px 30px;position:relative;
    box-shadow:0 14px 30px color-mix(in srgb, var(--rose-deep) 10%, transparent);
  }
  .detail-card::before{
    content:"";position:absolute;inset:7px;border:1px solid var(--rose-light);border-radius:14px;pointer-events:none;
  }
  .detail-card .ribbon,.rsvp-card .ribbon{
    position:absolute;top:-15px;left:50%;transform:translateX(-50%);
    width:30px;height:auto;color:var(--rose);
    background:var(--blush-soft);padding:2px 8px;border-radius:8px;display:block;
  }
  .detail-card h3{
    font-family:'Great Vibes',cursive;font-weight:400;color:#2a2020;
    font-size:clamp(1.6rem,4.4vw,2rem);margin-bottom:2px;
  }
  .detail-card .glass-icon{width:86px;height:auto;color:var(--rose);margin:8px auto 10px;display:block;}
  .detail-card .hora{color:var(--rose);font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.3rem,3.6vw,1.6rem);margin:4px 0;}
  .detail-card .lugar{font-weight:600;color:var(--ink);margin-bottom:16px;}
  .detail-card .cta{
    display:inline-block;background:var(--rose);color:var(--ivory);
    text-decoration:none;padding:10px 26px;border-radius:20px;
    text-transform:uppercase;letter-spacing:1.5px;font-size:.72rem;font-weight:700;
    border:1px solid var(--rose-deep);
  }
  .detail-card .couple-icon{width:78px;height:auto;color:var(--rose);margin:6px auto 8px;display:block;}
  .detail-card .dresscode-label{
    text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:var(--ink);font-size:1rem;margin-bottom:2px;
  }
  .detail-card .dresscode-value{font-family:'Great Vibes',cursive;color:var(--rose);font-size:clamp(1.5rem,4.4vw,1.9rem);}

  /* ---------- RSVP ---------- */
  .rsvp-card{
    max-width:380px;margin:0 auto;background:var(--ivory);
    border:1px solid var(--gold-light);border-radius:20px;
    padding:36px 24px 34px;position:relative;
    box-shadow:0 14px 30px color-mix(in srgb, var(--rose-deep) 10%, transparent);
  }
  .rsvp-card::before{content:"";position:absolute;inset:7px;border:1px solid var(--rose-light);border-radius:14px;pointer-events:none;}
  .rsvp-card .envelope{width:64px;height:auto;color:var(--rose);margin:6px auto 10px;display:block;}
  .rsvp-card h3{font-family:'Great Vibes',cursive;color:var(--rose);font-size:clamp(1.8rem,5vw,2.3rem);font-weight:400;margin-bottom:4px;}
  .rsvp-card > p{font-size:.9rem;color:var(--ink);margin-bottom:14px;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin-top:6px;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Montserrat',sans-serif;font-size:.95rem;
    padding:10px 12px;border-radius:10px;border:1px solid var(--rose-light);
    background:var(--blush-soft);color:var(--ink);margin-top:5px;width:100%;
  }
  .rsvp-form textarea{min-height:70px;resize:vertical;}
  .rsvp-form button{
    background:var(--rose);border:1px solid var(--rose-deep);color:var(--ivory);font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;font-size:.8rem;
    padding:13px;border-radius:22px;cursor:pointer;transition:background .2s;
  }
  .rsvp-form button:hover{background:var(--rose-deep);}
  .rsvp-whatsapp{color:var(--gold);font-size:.85rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#4a7a4a;font-weight:600;}

  /* ---------- FOOTER ---------- */
  footer{
    text-align:center;padding:60px 20px 50px;position:relative;overflow:hidden;
  }
  footer .big-num{
    font-family:'Playfair Display',serif;font-weight:700;color:var(--rose-light);
    font-size:clamp(4.5rem,22vw,8rem);opacity:.55;line-height:1;
  }
  footer .name-over{
    font-family:'Great Vibes',cursive;color:var(--rose);
    font-size:clamp(2.2rem,9vw,3.6rem);margin-top:-1.1em;position:relative;
  }
  footer small{
    display:block;margin-top:10px;letter-spacing:2px;text-transform:uppercase;
    color:var(--gold);font-size:.7rem;font-weight:600;
  }

  /* ---------- ANIMACIONES SUTILES ---------- */
  /* Brillo dorado en la tiara: pulso lento de brillo + resplandor suave. */
  .hero-tiara{ animation:tiaraShimmer 6s ease-in-out infinite; }
  @keyframes tiaraShimmer{
    0%,100%{ filter:brightness(1) drop-shadow(0 0 0 rgba(182,146,79,0)); }
    50%{ filter:brightness(1.15) drop-shadow(0 0 5px rgba(182,146,79,.4)); }
  }

  /* Balanceo leve de los moños, con el nudo (centro del svg) como eje.
     Se usa la propiedad "rotate" independiente de "transform" para no
     pisar el transform:translateX(-50%) que centra los moños-ribbon. */
  .hero-divider,
  .quote-card .ribbon,
  .detail-card .ribbon,
  .rsvp-card .ribbon{
    transform-origin:50% 50%;
    animation:bowSway 8s ease-in-out infinite;
  }
  .quote-card .ribbon{ animation-delay:.6s; }
  .detail-card .ribbon{ animation-delay:1.4s; }
  .rsvp-card .ribbon{ animation-delay:2.2s; }
  @keyframes bowSway{
    0%,100%{ rotate:-2deg; }
    50%{ rotate:2deg; }
  }

  /* Destello dorado suave en el sparkle del pie. */
  .icon-gold{ animation:sparkleTwinkle 4.5s ease-in-out infinite; }
  @keyframes sparkleTwinkle{
    0%,100%{ opacity:.6; transform:scale(.92); }
    50%{ opacity:1; transform:scale(1.08); }
  }

  @media (prefers-reduced-motion: reduce){
    .hero-tiara,.hero-divider,.quote-card .ribbon,.detail-card .ribbon,.rsvp-card .ribbon,.icon-gold{
      animation:none !important;
    }
  }
</style></head>
<body>

  <div class="hero-wrap">
    ${floralCornerSvg("deco-corner tl")}
    ${floralCornerSvg("deco-corner tr")}
    ${floralCornerSvg("deco-corner bl")}
    ${floralCornerSvg("deco-corner br")}
    <div class="hero-card">
      ${archSvg(archId)}
      <span class="sr-only">Mis Quinceaños</span>
      ${bowSvg("hero-divider")}
      <h1 class="hero-name">${esc(d.nombre)}</h1>
      <p class="hero-sub">Estás invitada a celebrar conmigo</p>
      <div class="hero-date">
        <span>${esc(diaSemana)}</span>
        <span class="badge">${heartSvg()}<span class="badge-num">${esc(diaNum)}</span></span>
        <span>${esc(mesNombre)}</span>
      </div>
      ${tiaraSvg("hero-tiara")}
    </div>
  </div>

  ${(d.mensaje || d.padres || (d.galeria && d.galeria.length)) ? `
  <section class="section-blush">
    ${(d.galeria && d.galeria.length) ? `
    <div class="photo-strip">
      <div class="sidebar-label">Mis Quinceaños</div>
      ${gal.html}
    </div>` : ""}
    ${(d.mensaje || d.padres) ? `
    <div class="quote-card">
      ${bowSvg("ribbon")}
      ${d.mensaje ? `<p>${esc(d.mensaje)}</p>` : ""}
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
    </div>` : ""}
  </section>` : ""}

  <section>
    <span class="eyebrow">Faltan</span>
    ${cd.html}
  </section>

  <section>
    ${floralCornerSvg("deco-corner tr")}
    <span class="eyebrow">Detalles</span>

    ${(d.horaCeremonia || d.lugarCeremonia) ? `
    <div class="detail-card">
      ${bowSvg("ribbon")}
      <h3>Ceremonia</h3>
      ${glassesSvg("glass-icon")}
      ${d.horaCeremonia ? `<p class="hora">${esc(d.horaCeremonia)}</p>` : ""}
      ${d.lugarCeremonia ? `<p class="lugar">${esc(d.lugarCeremonia)}</p>` : ""}
      ${d.direccionMapa ? `<a class="cta" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>` : ""}

    ${(d.horaFiesta || d.lugarFiesta) ? `
    <div class="detail-card">
      ${bowSvg("ribbon")}
      <h3>Recepción</h3>
      ${glassesSvg("glass-icon")}
      ${d.horaFiesta ? `<p class="hora">${esc(d.horaFiesta)}</p>` : ""}
      ${d.lugarFiesta ? `<p class="lugar">${esc(d.lugarFiesta)}</p>` : ""}
      ${d.direccionMapa ? `<a class="cta" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>` : ""}

    ${d.dressCode ? `
    <div class="detail-card">
      ${bowSvg("ribbon")}
      ${coupleSvg("couple-icon")}
      <p class="dresscode-label">Código de vestimenta</p>
      <p class="dresscode-value">${esc(d.dressCode)}</p>
    </div>` : ""}

    <div class="rsvp-card">
      ${bowSvg("ribbon")}
      <h3>Confirmar asistencia</h3>
      ${envelopeSvg("envelope")}
      <p>Esperamos contar con tu presencia en este día tan especial para mí.</p>
      ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </section>

  <footer>
    ${sparkleSvg("icon-gold")}
    <div class="big-num">15</div>
    <div class="name-over">${esc(d.nombre)}</div>
    <small>Gracias por acompañarme</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
    background:linear-gradient(160deg,#f3d3d8 0%,#e6b3b9 55%,#f3d3d8 100%);">
    <svg viewBox="0 0 200 90" width="66" height="30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:#c9536c;opacity:.85;">
      <path d="M14 78c0-30 6-46 14-46 6 0 6 14 12 14s8-24 20-24 12 22 20 22 10-30 20-30 12 30 20 30 14-22 20-22 6 24 12 24 14-16 14 46" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linejoin="round"/>
      <path d="M10 78h180" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    </svg>
    <div style="font-family:'Great Vibes','Brush Script MT','Segoe Script',cursive;font-size:1.55rem;color:#c9536c;line-height:1;">${esc(d.name)}</div>
    <div style="font-size:.52rem;letter-spacing:3px;text-transform:uppercase;color:#a87a2f;font-family:Georgia,'Times New Roman',serif;font-weight:600;">Mis Quince Años</div>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Glam Rosa",
  summary: "Frame floral en rosa y dorado, tiara y moños dibujados a mano, con tarjetas tipo souvenir para cada detalle.",
  accent: "#c9536c", accent2: "#b6924f", schema: xvSchema, sampleData, render, cardPreview,
};
