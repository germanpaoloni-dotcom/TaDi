const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-invierno-nevado";

const sampleData = {
  novia: "Antonella", novio: "Franco",
  fecha: "2027-07-24", horaCeremonia: "17:00", lugarCeremonia: "Capilla San Eduardo, Bariloche",
  horaFiesta: "20:00", lugarFiesta: "Hotel Llao Llao, Bariloche",
  direccionMapa: "https://www.google.com/maps/search/?api=1&query=Hotel+Llao+Llao+Bariloche",
  mensaje: "Entre montañas nevadas y el calor de los que amamos, queremos compartir con vos el día en que decimos que sí para siempre.",
  dressCode: "Elegante de invierno — abrigo lindo, gama de azules y plateados",
  alias: "franco.antonella.boda",
  whatsapp: "5491100000043",
  fechaLimiteRSVP: "2027-06-20",
  coverImage: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&q=80",
    "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&q=80",
    "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=800&q=80",
  ],
};

// ---------- Copo de nieve (SVG, 6 puntas finas con pequeñas ramas) ----------
function snowflakeSVG(extraClass, size) {
  return `<svg class="${extraClass}" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
      <path d="M20 2v36M20 2l-4.5 4.5M20 2l4.5 4.5M20 38l-4.5-4.5M20 38l4.5-4.5"/>
      <path d="M3.7 11l32.6 18M3.7 11l6.2-1M3.7 11l3 5.8M36.3 29l-6.2 1M36.3 29l-3-5.8"/>
      <path d="M3.7 29l32.6-18M3.7 29l3-5.8M3.7 29l6.2 1M36.3 11l-3 5.8M36.3 11l-6.2-1"/>
    </g>
  </svg>`;
}

// ---------- Ramita de pino con escarcha (izquierda / derecha, espejable) ----------
function pineBranchSVG(extraClass) {
  return `<svg class="pine ${extraClass}" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 118V8" stroke="currentColor" stroke-width="1.3"/>
    <path d="M30 20L13 33M30 20L47 33M30 40L11 55M30 40L49 55M30 62L9 79M30 62L51 79M30 84L13 99M30 84L47 99" stroke="currentColor" stroke-width="1"/>
    <circle cx="13" cy="33" r="1.4" fill="currentColor"/><circle cx="47" cy="33" r="1.4" fill="currentColor"/>
    <circle cx="11" cy="55" r="1.4" fill="currentColor"/><circle cx="49" cy="55" r="1.4" fill="currentColor"/>
    <circle cx="9" cy="79" r="1.4" fill="currentColor"/><circle cx="51" cy="79" r="1.4" fill="currentColor"/>
    <circle cx="13" cy="99" r="1.4" fill="currentColor"/><circle cx="47" cy="99" r="1.4" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#1c3a5e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  let fechaLarga = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        fechaLarga = `${dias[dt.getDay()]} ${Number(partes[2])} de ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][dt.getMonth()]} de ${partes[0]}`;
      }
    }
  }

  // Copos de nieve cayendo — capa fija, decorativa, CSS puro (sin JS).
  const flakeSizes = [14, 10, 18, 8, 16, 11, 20, 9, 13, 17, 10, 15, 8, 19];
  const snowLayer = `<div class="snow" aria-hidden="true">
    ${flakeSizes.map((sz, i) => {
      const left = ((i * 137.5) % 100).toFixed(1);
      const dur = (14 + (i % 6) * 3.4).toFixed(1);
      const delay = (-(i * 1.9) % 20).toFixed(1);
      const drift = (i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 6);
      return `<span class="flake" style="left:${left}%;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;opacity:${(0.35 + (i % 4) * 0.12).toFixed(2)}">${snowflakeSVG("", sz)}</span>`;
    }).join("")}
  </div>`;

  const pineLeft = pineBranchSVG("pine-left");
  const pineRight = pineBranchSVG("pine-right");
  const cornerFlake = (extraClass) => `<span class="corner-flake ${extraClass}">${snowflakeSVG("", 30)}</span>`;
  const corners = `${cornerFlake("cf-tl")}${cornerFlake("cf-tr")}${cornerFlake("cf-bl")}${cornerFlake("cf-br")}`;

  const ringIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="9" cy="15" r="5.2" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="16" cy="15" r="5.2" stroke="currentColor" stroke-width="1.3"/>
    <path d="M11 6l1.5-3 1.5 3" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;
  const toastIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 3h5l-.7 8.5a3.3 3.3 0 0 1-6.6 0L4 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 3h-5l.6 8a2.9 2.9 0 0 0 5.8 0L19 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.5 11.8V20M15.5 11V20M6 20h13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
  const giftIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="9" width="16" height="11" stroke="currentColor" stroke-width="1.2"/>
    <path d="M3 9h18v3.2H3z" stroke="currentColor" stroke-width="1.2"/>
    <path d="M12 9v11M12 9C9.5 9 8 7.4 8 5.7 8 4.3 9 3.4 10.1 3.4c1.4 0 1.9 1.3 1.9 2.6M12 9c2.5 0 4-1.6 4-3.3 0-1.4-1-2.3-2.1-2.3-1.4 0-1.9 1.3-1.9 2.6" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&amp;family=Cormorant:ital@0;1&amp;family=Jost:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --navy-1:#0a1726;
    --navy-2:#122740;
    --navy-3:#1c3a5e;
    --ice:#c7d2dc;
    --ice-2:color-mix(in srgb, #c7d2dc, white 35%);
    --white:#f7f9fb;
    --ink:#1f2c3d;
    --accent:${accent};
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--white);color:var(--ink);overflow-x:hidden;}
  h1,h2,h3{font-family:'Marcellus',serif;font-weight:400;}
  .eyebrow,.tl-time,.cd-label,.dresscode span,.on-dark .sub,.rsvp-sub-label,footer .alias-label{
    text-transform:uppercase;letter-spacing:3px;font-size:.7rem;
  }

  /* ---------- NIEVE CAYENDO (capa fija, decorativa, sólo CSS) ---------- */
  .snow{position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;}
  .flake{position:absolute;top:-8%;color:var(--ice-2);animation-name:caer;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
  .flake svg{display:block;width:100%;height:100%;}
  @keyframes caer{
    0%{transform:translate3d(0,-10vh,0) rotate(0deg);}
    100%{transform:translate3d(var(--drift,20px),115vh,0) rotate(220deg);}
  }
  @media (prefers-reduced-motion: reduce){ .flake{animation:none;display:none;} }

  /* ---------- ORNAMENTO DE ESQUINA ---------- */
  .corner-flake{position:absolute;width:26px;height:26px;color:var(--ice);opacity:.8;pointer-events:none;z-index:2;}
  .corner-flake svg{width:100%;height:100%;}
  @media(min-width:480px){.corner-flake{width:34px;height:34px;}}
  .corner-flake.cf-tl{top:16px;left:16px;}
  .corner-flake.cf-tr{top:16px;right:16px;transform:rotate(30deg);}
  .corner-flake.cf-bl{bottom:16px;left:16px;transform:rotate(-30deg);}
  .corner-flake.cf-br{bottom:16px;right:16px;transform:rotate(90deg);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:100vh;
    padding:56px 20px 70px;
    display:flex;align-items:center;justify-content:center;text-align:center;
    background-image:
      linear-gradient(180deg, rgba(10,23,38,.72) 0%, rgba(10,23,38,.55) 45%, rgba(10,23,38,.88) 100%),
      url('${esc(d.coverImage)}');
    background-size:cover;background-position:center;
    color:var(--white);
    overflow:hidden;
  }
  .hero::after{
    content:"";position:absolute;inset:14px;
    border:1px solid color-mix(in srgb, var(--ice) 55%, transparent);
    pointer-events:none;
  }
  .hero-content{position:relative;z-index:1;max-width:540px;}
  .pine-row{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:22px;}
  .pine{width:24px;height:50px;color:var(--ice);}
  @media(min-width:480px){.pine{width:30px;height:62px;}}
  .monogram-circle{
    width:78px;height:78px;border-radius:50%;
    border:1px solid var(--ice);
    display:flex;align-items:center;justify-content:center;
    font-family:'Marcellus',serif;font-size:1.15rem;letter-spacing:2px;color:var(--ice-2);
    flex-shrink:0;background:rgba(199,210,220,.06);
  }
  @media(min-width:480px){.monogram-circle{width:92px;height:92px;font-size:1.35rem;}}
  .monogram-circle .amp-small{color:var(--ice);margin:0 4px;font-style:italic;font-size:.9em;}
  .eyebrow{color:var(--ice-2);margin:0 0 14px;}
  .hero-content h1{
    margin:0;
    font-size:clamp(2.3rem,9vw,3.7rem);
    line-height:1.16;
    color:#fbfdff;
    letter-spacing:1px;
  }
  .hero-content h1 .amp{
    display:block;
    font-family:'Cormorant',serif;font-style:italic;
    color:var(--ice);
    font-size:.5em;
    margin:4px 0;
  }
  .thin-divider{width:70px;height:1px;background:var(--ice);margin:26px auto;position:relative;}
  .thin-divider::before{content:"❄";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.7rem;color:var(--ice-2);background:transparent;line-height:1;}
  .date-line{margin:0;color:var(--ice-2);letter-spacing:2.5px;font-size:.9rem;text-transform:capitalize;}

  /* ---------- SECTIONS (blanco / hielo) ---------- */
  section{max-width:720px;margin:0 auto;padding:64px 22px;text-align:center;position:relative;}
  h2{
    letter-spacing:3px;text-transform:uppercase;
    font-size:clamp(1.1rem,4vw,1.5rem);
    color:var(--navy-2);
    margin:0 0 8px;
  }
  .divider-ice{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);margin:22px auto;position:relative;}
  .divider-ice::before{content:"❄";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.6rem;color:var(--accent);line-height:1;}
  .mini-divider{width:70px;height:1px;background:var(--accent);margin:0 auto 22px;position:relative;}
  .mini-divider::before{content:"❄";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.65rem;color:var(--accent);line-height:1;}

  /* ---------- QUOTE / MENSAJE ---------- */
  .message-row{display:flex;align-items:center;justify-content:center;gap:14px;}
  .message-row .pine{width:18px;height:56px;flex-shrink:0;opacity:.9;color:var(--accent);}
  @media(min-width:480px){.message-row .pine{width:24px;height:72px;}}
  .message{font-family:'Cormorant',serif;font-style:italic;font-size:1.35rem;line-height:1.8;color:var(--navy-3);margin:0;}

  /* ---------- COUNTDOWN "copo de nieve" (widget) ---------- */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:28px 0 4px;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:linear-gradient(160deg,#ffffff,#eef2f6);
    color:var(--navy-2);
    min-width:70px;padding:18px 10px 14px;
    border:1px solid var(--accent);
    border-radius:2px;
    position:relative;
    box-shadow:0 8px 18px rgba(28,58,94,.08);
  }
  .countdown div::before{content:"❄";position:absolute;top:-9px;left:50%;transform:translate(-50%,0);font-size:.75rem;color:var(--accent);background:var(--white);padding:0 4px;line-height:1;}
  @media(min-width:480px){.countdown div{min-width:84px;padding:22px 14px 16px;}}
  .cd-num{font-family:'Marcellus',serif;font-size:1.8rem;color:var(--navy-2);line-height:1;}
  .cd-label{color:var(--accent);margin-top:8px;font-size:.6rem;}

  /* ---------- TIMELINE (ceremonia / fiesta) ---------- */
  .timeline{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;margin-top:34px;}
  .tl-card{
    background:#fff;
    border:1px solid #e2e8ee;
    padding:30px 26px;min-width:220px;flex:1 1 220px;max-width:280px;
    box-shadow:0 10px 24px rgba(10,23,38,.06);
  }
  .tl-icon{
    width:46px;height:46px;border-radius:50%;
    background:var(--navy-2);color:var(--ice-2);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 14px;
  }
  .tl-icon svg{width:20px;height:20px;}
  .tl-card h3{margin:0 0 10px;color:var(--navy-2);font-size:1.02rem;letter-spacing:2px;text-transform:uppercase;font-family:'Marcellus',serif;font-weight:400;}
  .tl-time{color:var(--accent);font-weight:500;letter-spacing:2px;margin:0 0 6px;}
  .tl-place{margin:0;color:#526074;font-size:.92rem;line-height:1.5;}

  .gran-dia-footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:22px 34px;margin-top:34px;}
  .map-link{display:inline-block;color:var(--navy-2);text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:2px;font-size:.9rem;letter-spacing:1px;}
  .map-link:hover{color:var(--accent);}
  .dresscode{
    display:inline-flex;flex-direction:column;gap:4px;
    border:1px solid var(--accent);padding:14px 30px;max-width:340px;
  }
  .dresscode span{color:var(--accent);}
  .dresscode strong{font-family:'Marcellus',serif;font-weight:400;font-size:1rem;color:var(--navy-2);line-height:1.4;}

  /* ---------- REGALO / ALIAS ---------- */
  .gift-card{
    display:inline-flex;align-items:center;gap:16px;
    border:1px solid var(--accent);padding:18px 30px;background:#fff;
    box-shadow:0 8px 18px rgba(28,58,94,.06);
  }
  .gift-icon{width:38px;height:38px;border-radius:50%;background:var(--navy-2);color:var(--ice-2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .gift-icon svg{width:18px;height:18px;}
  .gift-text{text-align:left;}
  .gift-text .gift-label{display:block;color:var(--accent);text-transform:uppercase;letter-spacing:2px;font-size:.66rem;margin-bottom:4px;}
  .gift-text .gift-alias{font-family:'Marcellus',serif;color:var(--navy-2);font-size:1.05rem;letter-spacing:.5px;}

  /* ---------- DARK SECTIONS (galería) ---------- */
  .dark{
    position:relative;
    max-width:none;
    background:
      radial-gradient(circle at 15% 15%, rgba(199,210,220,.06), transparent 40%),
      radial-gradient(circle at 90% 85%, rgba(199,210,220,.05), transparent 42%),
      linear-gradient(160deg,var(--navy-2),var(--navy-1) 55%,var(--navy-3));
    color:var(--white);
    padding:64px 22px;
  }
  .dark > *{max-width:720px;margin-left:auto;margin-right:auto;}
  .dark h2.on-dark{color:#fbfdff;}
  .on-dark.sub{color:var(--ice-2);font-size:.85rem;letter-spacing:2px;margin:0 0 30px;text-transform:uppercase;}

  /* ---------- GALLERY (widget) ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px;}
  .gallery-item{border:1px solid var(--ice);overflow:hidden;}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;filter:saturate(.92);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,13,22,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border:1px solid var(--ice);}
  .lightbox-close{position:absolute;top:18px;right:24px;color:var(--ice-2);font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP (hielo, dos columnas) ---------- */
  .rsvp-section{max-width:820px;display:grid;grid-template-columns:minmax(180px,240px) 1px 1fr;gap:40px;align-items:center;text-align:center;}
  .rsvp-divider{align-self:stretch;background:linear-gradient(var(--white) 0, var(--accent) 12%, var(--accent) 88%, var(--white) 100%);opacity:.5;}
  .rsvp-side h2{margin:0 0 10px;}
  .rsvp-sub-label{color:var(--navy-3);margin:0;line-height:1.8;text-transform:none;letter-spacing:normal;font-size:.95rem;}
  .rsvp-deadline{color:var(--accent);font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 0;}
  @media(max-width:680px){
    .rsvp-section{grid-template-columns:1fr;gap:30px;}
    .rsvp-divider{display:none;}
  }

  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:left;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--navy-3);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Jost',sans-serif;font-size:.95rem;
    background:#fff;
    color:var(--ink);
    padding:11px 12px;border:1px solid color-mix(in srgb, var(--accent) 40%, #dfe6ec);
    width:100%;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#9aa7b6;}
  .rsvp-form button{
    background:transparent;color:var(--navy-2);
    border:1px solid var(--accent);padding:13px;
    letter-spacing:3px;text-transform:uppercase;font-size:.76rem;
    cursor:pointer;transition:background .25s, color .25s;
  }
  .rsvp-form button:hover{background:var(--accent);color:#fff;}
  .rsvp-whatsapp{font-size:.82rem;color:var(--navy-3);text-align:center;text-decoration:none;letter-spacing:1px;border-bottom:1px solid var(--accent);padding-bottom:2px;}
  .rsvp-whatsapp:hover{color:var(--accent);}
  .rsvp-status{text-align:center;color:var(--navy-3);font-weight:500;letter-spacing:1px;}

  /* ---------- FOOTER ---------- */
  footer{
    position:relative;
    text-align:center;padding:50px 22px 60px;
    background:var(--navy-1);color:var(--ice-2);
  }
  footer .monogram-mini{
    width:52px;height:52px;border-radius:50%;border:1px solid var(--ice);
    display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
    font-family:'Marcellus',serif;font-size:.85rem;letter-spacing:1px;color:var(--ice-2);
  }
  footer .thanks{font-family:'Cormorant',serif;font-style:italic;font-size:1.2rem;color:#fbfdff;margin:0 0 10px;}
  footer .alias-label{color:var(--ice);}
  footer .alias-value{font-family:'Marcellus',serif;letter-spacing:1px;color:#fbfdff;}
</style></head>
<body>

  ${snowLayer}

  <div class="hero">
    ${corners}
    <div class="hero-content">
      <div class="pine-row">
        ${pineLeft}
        <div class="monogram-circle">${esc(inicialNovia)}<span class="amp-small">&amp;</span>${esc(inicialNovio)}</div>
        ${pineRight}
      </div>
      <p class="eyebrow">Nos casamos en invierno</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="thin-divider"></div>
      <p class="date-line">${fechaLarga ? esc(fechaLarga) : esc(d.fecha)}</p>
    </div>
  </div>

  <section>
    <div class="mini-divider"></div>
    <h2>Falta muy poco</h2>
    ${cd.html}
  </section>

  ${d.mensaje ? `<section>
    <div class="message-row">
      ${pineLeft}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${pineRight}
    </div>
  </section>` : ""}

  ${
    (d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa || d.dressCode)
      ? `<section>
    <h2>El gran día</h2>
    <div class="divider-ice"></div>
    ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="tl-card">
        <div class="tl-icon">${ringIcon}</div>
        <h3>Ceremonia</h3>
        ${d.horaCeremonia ? `<p class="tl-time">${esc(d.horaCeremonia)}</p>` : ""}
        ${d.lugarCeremonia ? `<p class="tl-place">${esc(d.lugarCeremonia)}</p>` : ""}
      </div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="tl-card">
        <div class="tl-icon">${toastIcon}</div>
        <h3>Fiesta</h3>
        ${d.horaFiesta ? `<p class="tl-time">${esc(d.horaFiesta)}</p>` : ""}
        ${d.lugarFiesta ? `<p class="tl-place">${esc(d.lugarFiesta)}</p>` : ""}
      </div>` : ""}
    </div>` : ""}
    ${(d.direccionMapa || d.dressCode) ? `<div class="gran-dia-footer">
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
      ${d.dressCode ? `<div class="dresscode"><span>Dress code</span><strong>${esc(d.dressCode)}</strong></div>` : ""}
    </div>` : ""}
  </section>`
      : ""
  }

  ${d.alias ? `<section>
    <div class="gift-card">
      <div class="gift-icon">${giftIcon}</div>
      <div class="gift-text">
        <span class="gift-label">Alias para regalo</span>
        <span class="gift-alias">${esc(d.alias)}</span>
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section class="dark">
    ${corners}
    <h2 class="on-dark">Momentos</h2>
    <div class="divider-ice"></div>
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
    <div class="monogram-mini">${esc(inicialNovia)}&amp;${esc(inicialNovio)}</div>
    <p class="thanks">Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    ${d.alias ? `<p><span class="alias-label">Alias para regalo&nbsp;</span><span class="alias-value">${esc(d.alias)}</span></p>` : ""}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const accent = d.accent || "#1c3a5e";
  const accent2 = d.accent2 || "#c7d2dc";
  const dots = [
    [30, 26], [268, 34], [22, 168], [274, 150], [46, 90], [252, 96],
    [130, 22], [178, 176], [64, 40], [236, 160],
  ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${accent2}" fill-opacity=".7"/>`).join("");
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block;">
    <rect x="0" y="0" width="300" height="200" fill="${accent}"/>
    ${dots}
    <g transform="translate(150,88)" stroke="${accent2}" stroke-width="1.6" stroke-linecap="round" fill="none">
      <path d="M0 -46v92M0 -46l-11 11M0 -46l11 11M0 46l-11-11M0 46l11-11"/>
      <path d="M-39.8 -23l79.6 46M-39.8 -23l15.2-2.6M-39.8 -23l7.6 14.6M39.8 23l-15.2 2.6M39.8 23l-7.6-14.6"/>
      <path d="M-39.8 23l79.6-46M-39.8 23l7.6-14.6M-39.8 23l15.2 2.6M39.8 -23l-7.6 14.6M39.8 -23l-15.2-2.6"/>
    </g>
    <text x="150" y="160" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="19" fill="${accent2}" letter-spacing="1">${esc(d.name)}</text>
  </svg>`;
}

module.exports = {
  id, category: "bodas", name: "Invierno Nevado",
  summary: "Azul noche, plata y una nieve que cae en animación sutil — una boda de invierno elegante y luminosa, ideal para una fiesta de montaña.",
  accent: "#1c3a5e", accent2: "#c7d2dc", schema: bodaSchema, sampleData, render, cardPreview,
};
