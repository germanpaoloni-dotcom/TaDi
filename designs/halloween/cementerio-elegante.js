const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { halloweenSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "hall-cementerio-elegante";

const sampleData = {
  nombre: "Camila Duarte",
  fecha: "2027-10-30",
  hora: "21:00",
  lugar: "Quinta Los Cipreses, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Cipreses+San+Isidro+Buenos+Aires",
  mensaje: "Entre velas, hiedra y luz de luna, los invito a una noche distinta: el Baile de las Sombras. Una fiesta de gala para adultos, con la elegancia oscura que solo Halloween sabe dar. Los espero.",
  disfraz: "Código de vestimenta: gótico elegante — negro, terciopelo y un detalle dorado",
  whatsapp: "5491122334455",
  fechaLimiteRSVP: "2027-10-20",
  coverImage: "https://images.unsplash.com/photo-1698520899168-4f9d10d85cc9?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
    "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  ],
};

// Dorado envejecido — acento único del diseño. Sigue viajando por
// getPaletteColor() como cualquier otro diseño: "original" usa este
// fallback, cualquier otra gama toma su tono "dark" (pensado para
// fondos oscuros, que es lo que tiene esta tarjeta).
const GOLD_FALLBACK = "#a8863e";
const BLACK_FALLBACK = "#0d0d0f";

// --- Ornamentos SVG inline, trazo fino tipo grabado, todos con
// currentColor para heredar el dorado vía CSS. Sin dependencias externas. ---

// Pequeño rombo con punto central — el "destello" de este diseño, más
// afilado y sobrio que una estrella.
function gemIcon(size = 13) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 .8 10.2 7 7 13.2 3.8 7Z" stroke="currentColor" stroke-width="1"/>
    <circle cx="7" cy="7" r="1.3" fill="currentColor"/>
  </svg>`;
}

// Línea fina con un rombo dorado en el medio, para dividir secciones.
function gemDivider() {
  return `<div class="ornament-divider">${gemIcon(13)}</div>`;
}

// Lápida de líneas finas, arco superior — usada como insignia circular
// sobre las tarjetas de Fecha / Hora / Lugar.
function gravestoneIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6.2 21V11.4C6.2 6.7 8.8 4 12 4s5.8 2.7 5.8 7.4V21" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.6 21h14.8" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>
    <path d="M12 8.6v5M9.6 11.1h4.8" stroke="currentColor" stroke-width=".95" stroke-linecap="round"/>
  </svg>`;
}

// Vela derritiéndose, con llama — para el encabezado del countdown y el
// pie de página. Trazo fino, llama sólida en currentColor.
function candleIcon() {
  return `<svg class="candle-ico" viewBox="0 0 24 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="flame" d="M12 1.4c1.7 2.3 2.5 4 2.5 5.5a2.5 2.5 0 1 1-5 0c0-1.5.8-3.2 2.5-5.5Z" fill="currentColor"/>
    <line x1="12" y1="8.6" x2="12" y2="11.2" stroke="currentColor" stroke-width=".9"/>
    <path d="M7.8 11.2h8.4v22.2c0 1-.8 1.8-1.8 1.8H9.6c-1 0-1.8-.8-1.8-1.8V11.2Z" stroke="currentColor" stroke-width="1.05"/>
    <path d="M9.5 11.2c-.3 2.9-1.3 4-1.3 6.3 0 1.2.8 1.9.8 1.9M14.7 11.2c.4 3.8-1 5.1-1 7.8 0 1.5.9 2.3.9 2.3" stroke="currentColor" stroke-width=".75" stroke-linecap="round"/>
  </svg>`;
}

// Cuervo en silueta simple, estilizado — un solo trazo cerrado relleno.
function ravenIcon() {
  return `<svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="currentColor" d="M2 21c3.5.6 6-1 6.7-3.9C10.3 12 15 8.6 20.4 9c-.2-1.6.7-3 2.2-3.6 2.1-.8 4.4.1 5.4 2.1-1 .1-1.9.6-2.5 1.5 3.4.3 6.2 2.8 6.6 6.2.3 2.5-.7 4.7-2.6 6-1.2-.5-2.6-.3-3.6.6.3 1.2-.2 2.4-1.3 3.1-1.7-.4-2.9-1.7-3.3-3.4-1.4.4-2.4 1.5-2.8 2.9-2.2-.5-3.8-2.3-4.1-4.5-3.2.9-6.7-.1-8.8-2.6-.9 1.6-2.6 2.5-4.4 2.2Z"/>
    <circle cx="27.6" cy="12.1" r=".9" fill="#0d0d0f"/>
  </svg>`;
}

// Una hoja de hiedra "outline", rotable, para armar la enredadera vertical.
function ivyLeaf(cx, cy, rot) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0,-11 C7,-8 8,2 0,12 C-8,2 -7,-8 0,-11 Z" stroke="currentColor" stroke-width=".95"/>
    <path d="M0,-8 L0,9" stroke="currentColor" stroke-width=".55"/>
    <path d="M0,-2 L-4,-5 M0,1.5 L4,-1.5 M0,5 L-3,2.5" stroke="currentColor" stroke-width=".5"/>
  </g>`;
}

// Enredadera decorativa dorada, vertical, junto al formulario de RSVP.
function ivyVine(w = 140, h = 420) {
  return `<svg class="deco-ivy" width="${w}" height="${h}" viewBox="0 0 140 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M70 412C48 340 62 270 42 205C22 140 52 75 34 10" stroke="currentColor" stroke-width="1.05"/>
    ${ivyLeaf(58, 368, -40)}
    ${ivyLeaf(50, 330, 32)}
    ${ivyLeaf(60, 286, -36)}
    ${ivyLeaf(48, 240, 30)}
    ${ivyLeaf(58, 196, -34)}
    ${ivyLeaf(46, 150, 28)}
    ${ivyLeaf(56, 104, -32)}
    ${ivyLeaf(44, 58, 26)}
    ${ivyLeaf(54, 20, -24)}
  </svg>`;
}

// Esquina de marco ornamental art-nouveau-gótico, para encuadrar el hero.
// Se reutiliza rotada por CSS en las 4 esquinas.
function frameCorner() {
  return `<svg class="frame-corner" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 34V9a7 7 0 0 1 7-7h25" stroke="currentColor" stroke-width="1"/>
    <path d="M2 34c9-1.2 14.5 3.3 15.5 12.4" stroke="currentColor" stroke-width="1"/>
    <path d="M16 2c4.4 3.3 4.4 8.6 0 12" stroke="currentColor" stroke-width=".8"/>
    <circle cx="2" cy="2" r="1.9" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const GOLD = getPaletteColor(d.colorPalette, "dark", GOLD_FALLBACK);
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : sampleData.fecha, "cdh1");
  const gal = galleryWidget(d.galeria, "galh1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  const tieneDatos = d.fecha || d.hora || d.lugar || d.direccionMapa;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombre)} — Invitación</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600&family=Cinzel:wght@500;600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --black:${BLACK_FALLBACK};
    --black2:#17161a;
    --black3:#1e1c21;
    --stone:#5c5a56;
    --gold:${GOLD};
    --gold-soft:color-mix(in srgb, ${GOLD}, white 40%);
    --gold-dim:color-mix(in srgb, ${GOLD}, black 30%);
    --bone:#ede7da;
    --muted:#a39c8e;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--black);color:var(--bone);font-family:'Cormorant Garamond',serif;line-height:1.7;}
  h1,h2{font-family:'Cormorant Garamond',serif;font-weight:700;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .eyebrow{font-family:'Cinzel',serif;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.62rem,1.5vw,.72rem);color:var(--gold-soft);margin:0 0 16px;font-weight:600;}
  h2{font-size:clamp(1.5rem,4.4vw,2.2rem);font-style:italic;margin-bottom:8px;color:var(--bone);}
  .subtitle{font-family:'Jost',sans-serif;font-size:.74rem;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin:0 0 30px;}

  .ornament-divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 6px;width:200px;max-width:70%;color:var(--gold-dim);}
  .ornament-divider::before,.ornament-divider::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim));}
  .ornament-divider::after{background:linear-gradient(90deg,var(--gold-dim),transparent);}

  section{max-width:860px;margin:0 auto;padding:clamp(40px,6vw,74px) 24px;text-align:center;position:relative;}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:clamp(500px,94vh,880px);
    display:flex;align-items:center;justify-content:center;text-align:center;
    background:
      linear-gradient(180deg, rgba(6,6,7,.55) 0%, rgba(6,6,7,.8) 60%, var(--black) 100%),
      url('${esc(d.coverImage)}') center/cover no-repeat;
  }
  .hero-frame{position:relative;z-index:1;margin:28px;padding:clamp(30px,6vw,58px) clamp(20px,5vw,46px);max-width:640px;border:1px solid var(--gold-dim);opacity:0;animation:fadeUp 1.1s ease .1s forwards;}
  .frame-corner{position:absolute;width:34px;height:34px;color:var(--gold);}
  .frame-corner.fc-tl{top:-1px;left:-1px;}
  .frame-corner.fc-tr{top:-1px;right:-1px;transform:scaleX(-1);}
  .frame-corner.fc-bl{bottom:-1px;left:-1px;transform:scaleY(-1);}
  .frame-corner.fc-br{bottom:-1px;right:-1px;transform:scale(-1,-1);}
  .hero-content h1{font-size:clamp(2.1rem,7.4vw,3.5rem);color:var(--gold-soft);font-weight:700;font-style:italic;line-height:1.12;letter-spacing:.5px;}
  .hero-sub{font-family:'Cinzel',serif;font-size:clamp(.72rem,1.8vw,.86rem);letter-spacing:5px;text-transform:uppercase;color:var(--stone);margin-top:10px;}
  .hero-divider{width:70px;height:1px;background:var(--gold-dim);margin:26px auto;}
  .hero-date{font-family:'Jost',sans-serif;letter-spacing:3px;text-transform:uppercase;font-size:clamp(.74rem,2vw,.88rem);color:var(--muted);}
  .hero-date b{color:var(--bone);font-weight:500;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @media (prefers-reduced-motion: reduce){.hero-frame{animation:none;opacity:1;}}

  /* ---------- CAJA DE FRASE ---------- */
  .quote-box{position:relative;border:1px solid var(--gold-dim);padding:clamp(34px,5vw,50px) clamp(22px,5vw,54px) clamp(26px,4vw,36px);max-width:640px;margin:0 auto;background:var(--black2);}
  .quote-box .quote-gem{position:absolute;top:0;left:50%;transform:translate(-50%,-52%);background:var(--black2);padding:0 10px;color:var(--gold);}
  .message{font-size:clamp(1rem,2.2vw,1.22rem);font-style:italic;color:var(--bone);max-width:560px;margin:0 auto;}

  /* ---------- COUNTDOWN ---------- */
  .candle-wrap{color:var(--gold);width:24px;margin:0 auto 18px;}
  .candle-ico .flame{transform-origin:12px 4.6px;}
  @media (prefers-reduced-motion: no-preference){
    .candle-ico .flame{animation:flicker 2.6s ease-in-out infinite;}
  }
  @keyframes flicker{
    0%,100%{opacity:1;transform:scale(1) skewX(0deg);}
    30%{opacity:.86;transform:scale(.94,1.04) skewX(-2deg);}
    55%{opacity:1;transform:scale(1.05,.96) skewX(2deg);}
    80%{opacity:.9;transform:scale(.97,1.02) skewX(-1deg);}
  }
  .countdown{display:flex;gap:clamp(10px,2.6vw,18px);justify-content:center;flex-wrap:wrap;margin:8px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:64px;padding:16px 10px;border:1px solid var(--gold-dim);background:var(--black2);}
  @media(min-width:480px){.countdown div{min-width:80px;padding:20px 14px;}}
  .cd-num{font-family:'Cinzel',serif;font-weight:600;font-size:clamp(1.4rem,4.6vw,2.1rem);color:var(--gold);line-height:1;}
  .cd-label{font-family:'Jost',sans-serif;font-size:.6rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-top:8px;}

  /* ---------- FECHA / HORA / LUGAR ---------- */
  .tombs{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:clamp(28px,5vw,40px);margin-top:30px;}
  .tomb-wrap{position:relative;padding-top:26px;}
  .tomb-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--black);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;color:var(--gold);z-index:2;}
  .tomb-badge svg{width:22px;height:22px;}
  .tomb{border:1px solid var(--gold-dim);border-radius:44px 44px 6px 6px;padding:38px 20px 22px;background:var(--black2);text-align:center;}
  .tomb h3{color:var(--gold-soft);font-size:.78rem;font-style:normal;font-family:'Cinzel',serif;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;font-weight:600;}
  .tomb p{margin:0;color:var(--bone);opacity:.88;font-size:1.02rem;}
  .map-link{display:inline-block;margin-top:30px;font-family:'Jost',sans-serif;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;color:var(--gold);border:1px solid var(--gold);border-radius:999px;padding:13px 30px;transition:background .2s,color .2s;text-decoration:none;}
  .map-link:hover{background:var(--gold);color:var(--black);}

  /* ---------- DISFRAZ / CÓDIGO DE VESTIMENTA ---------- */
  .raven-badge{width:52px;height:38px;margin:0 auto 18px;color:var(--gold);}
  .swatches{display:flex;justify-content:center;gap:10px;margin:0 0 22px;flex-wrap:wrap;}
  .swatches span{width:28px;height:28px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.16);}
  .badge-disfraz{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--gold);border-radius:999px;padding:12px 26px;font-family:'Jost',sans-serif;letter-spacing:.6px;font-size:.9rem;color:var(--gold-soft);max-width:92%;}

  /* ---------- GALERÍA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px;}
  .gallery img{width:100%;height:190px;object-fit:cover;cursor:pointer;border:1px solid var(--gold-dim);filter:grayscale(.15) contrast(1.05) brightness(.92);transition:transform .35s ease,filter .35s ease;}
  .gallery img:hover{transform:scale(1.03);filter:grayscale(0) contrast(1.05) brightness(.98);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(4,4,4,.95);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-soft);font-size:2.2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP ---------- */
  .rsvp-grid{max-width:900px;display:grid;grid-template-columns:1.4fr .9fr;gap:clamp(24px,4vw,54px);align-items:start;text-align:left;}
  .rsvp-side h2,.rsvp-side .subtitle{text-align:left;}
  .rsvp-deadline{font-family:'Jost',sans-serif;margin:-16px 0 22px;font-size:.74rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold-soft);}
  .rsvp-ivy{display:flex;align-items:flex-start;justify-content:center;color:var(--gold-dim);padding-top:8px;}
  @media(max-width:720px){
    .rsvp-grid{grid-template-columns:1fr;}
    .rsvp-ivy{display:none;}
  }
  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin:6px 0 0;text-align:left;}
  .rsvp-form label{font-family:'Jost',sans-serif;font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:11px 12px;border:1px solid var(--gold-dim);background:var(--black2);color:var(--bone);border-radius:2px;margin-top:6px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:#726b5c;}
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{background:var(--gold);color:var(--black);border:0;padding:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:'Jost',sans-serif;font-size:.78rem;}
  .rsvp-form button:hover{background:var(--gold-soft);}
  .rsvp-whatsapp{font-family:'Jost',sans-serif;font-size:.78rem;text-align:center;text-decoration:none;color:var(--gold-soft);border-bottom:1px solid var(--gold-dim);padding-bottom:2px;align-self:center;}
  .rsvp-status{text-align:center;font-weight:bold;color:var(--gold-soft);}

  .gold-rule{height:1px;max-width:860px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-dim) 15%,var(--gold-dim) 85%,transparent);opacity:.7;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;text-align:center;padding:52px 24px 46px;background:var(--black);}
  .foot-candle{width:20px;margin:0 auto 16px;color:var(--gold);}
  .foot-name{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:600;letter-spacing:1px;font-size:1.3rem;color:var(--gold-soft);margin-bottom:8px;}
  .foot-thanks{font-family:'Jost',sans-serif;font-size:.76rem;letter-spacing:.5px;color:var(--muted);margin:0;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-frame">
      <span class="frame-corner fc-tl">${frameCorner()}</span>
      <span class="frame-corner fc-tr">${frameCorner()}</span>
      <span class="frame-corner fc-bl">${frameCorner()}</span>
      <span class="frame-corner fc-br">${frameCorner()}</span>
      <div class="hero-content">
        <p class="eyebrow">Los invita</p>
        <h1>${esc(d.nombre)}</h1>
        <p class="hero-sub">Baile de las Sombras</p>
        <div class="hero-divider"></div>
        ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}${d.hora ? ` &middot; <b>${esc(d.hora)}</b> hs` : ""}</p>` : ""}
      </div>
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="quote-box">
      <div class="quote-gem">${gemIcon(18)}</div>
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    </div>
  </section>` : ""}

  <section>
    <div class="candle-wrap">${candleIcon()}</div>
    <p class="eyebrow">Faltan</p>
    ${cd.html}
  </section>

  ${tieneDatos ? gemDivider() : ""}

  ${tieneDatos ? `<section>
    <p class="eyebrow">Cuándo y dónde</p>
    <h2 style="margin-bottom:8px;">Detalles de la noche</h2>
    <p class="subtitle">Reservá la fecha</p>
    <div class="tombs">
      ${fechaLarga ? `<div class="tomb-wrap">
        <div class="tomb-badge">${gravestoneIcon()}</div>
        <div class="tomb">
          <h3>Fecha</h3>
          <p>${esc(fechaLarga)}</p>
        </div>
      </div>` : ""}
      ${d.hora ? `<div class="tomb-wrap">
        <div class="tomb-badge">${gravestoneIcon()}</div>
        <div class="tomb">
          <h3>Hora</h3>
          <p>${esc(d.hora)} hs</p>
        </div>
      </div>` : ""}
      ${d.lugar ? `<div class="tomb-wrap">
        <div class="tomb-badge">${gravestoneIcon()}</div>
        <div class="tomb">
          <h3>Lugar</h3>
          <p>${esc(d.lugar)}</p>
        </div>
      </div>` : ""}
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
  </section>` : ""}

  ${d.disfraz ? `<section>
    <div class="raven-badge">${ravenIcon()}</div>
    <p class="eyebrow">Código de vestimenta</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Gótico elegante</h2>
    <div class="swatches">
      <span style="background:#0d0d0f"></span>
      <span style="background:#3a3834"></span>
      <span style="background:${GOLD}"></span>
      <span style="background:#5c5a56"></span>
      <span style="background:#ede7da"></span>
    </div>
    <div class="badge-disfraz">${esc(d.disfraz)}</div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Instantáneas</p>
    <h2 style="font-size:clamp(1.1rem,3vw,1.4rem);margin-bottom:26px;">Postales de otras noches</h2>
    ${gal.html}
  </section>` : ""}

  ${gemDivider()}

  <section>
    <div class="rsvp-grid">
      <div class="rsvp-side">
        <p class="eyebrow">Confirmación</p>
        <h2>Confirmar asistencia</h2>
        ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : `<div style="margin-bottom:20px;"></div>`}
        ${rsvp.html}
      </div>
      <div class="rsvp-ivy">${ivyVine(140, 400)}</div>
    </div>
  </section>

  <div class="gold-rule"></div>

  <footer>
    <div class="foot-candle">${candleIcon()}</div>
    <p class="foot-name">${esc(d.nombre)}</p>
    <p class="foot-thanks">Con la más elegante de las oscuridades, los espero para brindar juntos.</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:
      radial-gradient(circle at 18% 18%, rgba(168,134,62,.10), transparent 45%),
      radial-gradient(circle at 84% 84%, rgba(255,255,255,.04), transparent 45%),
      linear-gradient(160deg,#141317 0%,#0a0a0c 55%,#17151a 100%);">
    <div style="font-family:'Georgia',serif;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#8f887c;">Baile de las Sombras</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:1.05rem;color:#e6d3a3;line-height:1.3;text-align:center;padding:0 10px;">${esc(d.name)}</div>
    <div style="width:38px;height:1px;background:${d.accent || "#a8863e"};margin-top:2px;"></div>
  </div>`;
}

module.exports = {
  id, category: "halloween", name: "Cementerio Elegante",
  summary: "Halloween gótico-chic para adultos: lápidas de líneas finas, hiedra minimalista, cuervo en silueta y velas derritiéndose sobre negro profundo y dorado envejecido.",
  accent: GOLD_FALLBACK, accent2: BLACK_FALLBACK, schema: halloweenSchema, sampleData, render, cardPreview,
};
