const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-destino-playa";

const sampleData = {
  novia: "Valentina", novio: "Tomás",
  fecha: "2027-01-16", horaCeremonia: "18:30", lugarCeremonia: "Playa Brava, José Ignacio, Uruguay",
  horaFiesta: "20:30", lugarFiesta: "Medio y Medio Beach Club, José Ignacio",
  direccionMapa: "https://www.google.com/maps/search/?api=1&query=Jose+Ignacio+Uruguay",
  mensaje: "Nos casamos frente al mar y queremos que este viaje lo hagamos juntos. Vengan unos días antes si pueden, quédense unos días después: el destino es la excusa, ustedes son el motivo.",
  dressCode: "Elegante playero — nada de tacos, la ceremonia es en la arena",
  alias: "vale.tomas.boda",
  whatsapp: "5491100000042",
  fechaLimiteRSVP: "2026-11-01",
  coverImage: "https://images.unsplash.com/photo-1606495185824-688328ed7871?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
  ],
};

// Líneas de olas suaves, en SVG inline, sin ids (se puede repetir varias
// veces en la misma página sin colisiones). Colores fijos de la paleta
// turquesa/arena del diseño — no dependen de la gama elegida por el
// usuario, igual que las decoraciones de otros diseños de la categoría.
const WAVE_LINES = `
<svg viewBox="0 0 600 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,46 C75,18 150,74 225,46 C300,18 375,74 450,46 C500,26 550,26 600,46" fill="none" stroke="#2fa8a3" stroke-width="2" opacity="0.4"/>
  <path d="M0,62 C75,34 150,90 225,62 C300,34 375,90 450,62 C500,42 550,42 600,62" fill="none" stroke="#2fa8a3" stroke-width="1.4" opacity="0.22"/>
  <path d="M0,28 C75,58 150,-2 225,28 C300,58 375,-2 450,28 C500,48 550,48 600,28" fill="none" stroke="#c9a978" stroke-width="1.4" opacity="0.5"/>
</svg>`;

// Hoja de palmera fina y elegante (no tropical-fiestera), trazo simple con
// fronda ahusada a cada lado del tallo. Colores fijos turquesa.
const PALM_FROND = `
<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <path d="M100 300 C 96 220 92 140 76 58" fill="none" stroke="#2c8f8a" stroke-width="2" opacity="0.55"/>
  <g opacity="0.88">
    <path d="M100,292 C60,254 32,204 22,146 C56,170 86,208 100,258 Z" fill="#2fa8a3"/>
    <path d="M100,266 C52,232 18,176 12,114 C51,142 86,190 100,238 Z" fill="#4fc0b8"/>
    <path d="M100,238 C50,200 26,144 34,82 C68,116 93,168 100,216 Z" fill="#2fa8a3"/>
    <path d="M100,208 C60,170 48,116 66,58 C89,96 100,150 100,192 Z" fill="#4fc0b8"/>
    <path d="M100,292 C140,254 168,204 178,146 C144,170 114,208 100,258 Z" fill="#2fa8a3" opacity="0.92"/>
    <path d="M100,266 C148,232 182,176 188,114 C149,142 114,190 100,238 Z" fill="#4fc0b8" opacity="0.92"/>
    <path d="M100,238 C150,200 174,144 166,82 C132,116 107,168 100,216 Z" fill="#2fa8a3" opacity="0.92"/>
  </g>
</svg>`;

// Textura muy sutil de arena (puntitos dispersos), para dar calidez a los
// fondos claros sin agregar ruido visual.
const SAND_TEXTURE = `
<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <g fill="#c9a978" opacity="0.35">
    <circle cx="18" cy="24" r="1.3"/><circle cx="64" cy="52" r="1"/><circle cx="112" cy="18" r="1.4"/>
    <circle cx="150" cy="70" r="1"/><circle cx="196" cy="30" r="1.3"/><circle cx="238" cy="60" r="1"/>
    <circle cx="280" cy="20" r="1.4"/><circle cx="40" cy="100" r="1"/><circle cx="90" cy="130" r="1.3"/>
    <circle cx="140" cy="104" r="1"/><circle cx="184" cy="140" r="1.4"/><circle cx="230" cy="112" r="1"/>
    <circle cx="270" cy="150" r="1.3"/><circle cx="20" cy="168" r="1"/><circle cx="70" cy="180" r="1.4"/>
    <circle cx="160" cy="176" r="1"/><circle cx="210" cy="182" r="1.3"/><circle cx="290" cy="170" r="1"/>
  </g>
</svg>`;

// Pequeño divisor ondulado (en vez de una línea recta), para separar
// bloques de texto dentro de una misma sección.
const WAVE_DIVIDER = `<svg class="wave-divider" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M0 10 C 10 2 20 2 30 10 C 40 18 50 18 60 10 C 70 2 80 2 90 10 C 100 18 110 18 120 10" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

const SUITCASE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3.5" y="8" width="17" height="12.5" rx="1.4"/>
  <path d="M9 8V5.8a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 5.8V8"/>
  <path d="M3.5 13.5h17"/>
</svg>`;

const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="4.6"/>
  <path d="M12 2.6v2.4M12 19v2.4M4.4 12H2M22 12h-2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/>
</svg>`;

const GIFT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3.5" y="8.2" width="17" height="4" rx=".6"/>
  <rect x="4.7" y="12.2" width="14.6" height="8.6" rx=".6"/>
  <path d="M12 8.2 V20.8"/>
  <path d="M12 8.2c-2.6 0-4-1.4-4-2.8 0-1.3 1-1.9 1.9-1.5 1.4.6 2.1 2.5 2.1 4.3Z"/>
  <path d="M12 8.2c2.6 0 4-1.4 4-2.8 0-1.3-1-1.9-1.9-1.5-1.4.6-2.1 2.5-2.1 4.3Z"/>
</svg>`;

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#2fa8a3");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cdplaya");
  const gal = galleryWidget(d.galeria, "galplaya");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "bodas", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  let fechaObj = null;
  if (d.fecha && /^\d{4}-\d{2}-\d{2}/.test(d.fecha)) {
    const [y, m, day] = d.fecha.split("-").map(Number);
    fechaObj = new Date(y, m - 1, day);
  }
  const diaSemana = fechaObj ? DIAS_ES[fechaObj.getDay()] : "";
  const diaNum = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "";
  const mesLabel = fechaObj ? MESES_ES[fechaObj.getMonth()] : "";
  const anioLabel = fechaObj ? fechaObj.getFullYear() : "";

  const wave = (cls) => `<div class="wave-deco ${cls}" aria-hidden="true">${WAVE_LINES}</div>`;
  const palm = (cls) => `<div class="palm-deco ${cls}" aria-hidden="true">${PALM_FROND}</div>`;
  const sand = (cls) => `<div class="sand-deco ${cls}" aria-hidden="true">${SAND_TEXTURE}</div>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --turquoise:${accent};
    --turquoise-dark:color-mix(in srgb, ${accent}, black 28%);
    --arena:#e8d5b5;
    --arena-soft:#faf3e6;
    --foam:#eaf7f6;
    --cream:#fffdf9;
    --ink:#2e4342;
    --line:#dde7e3;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;overflow-x:hidden;font-family:'Jost',sans-serif;color:var(--ink);background:linear-gradient(180deg,var(--foam) 0%,var(--cream) 40%,var(--arena-soft) 100%);line-height:1.65;}
  a{color:inherit;}

  .band{width:100%;position:relative;overflow:hidden;}
  .band.bg-foam{background:linear-gradient(180deg,var(--foam),var(--cream));}
  .band.bg-cream{background:var(--cream);}
  .band.bg-arena{background:linear-gradient(180deg,var(--arena-soft),var(--cream));}
  .section{position:relative;max-width:640px;margin:0 auto;padding:56px 24px;}
  .section.tight{padding-top:34px;padding-bottom:34px;}
  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--turquoise-dark);font-weight:500;margin:0 0 10px;}
  .section-title{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.4rem,4.2vw,2rem);color:var(--turquoise-dark);margin:0 0 28px;}
  .section-title.tight{margin-bottom:12px;}

  .wave-divider{width:120px;height:16px;color:var(--turquoise);opacity:.8;display:block;margin:0 auto 26px;position:relative;z-index:1;}

  .wave-deco{position:absolute;left:0;right:0;pointer-events:none;z-index:0;line-height:0;overflow:hidden;}
  .wave-deco svg{width:calc(100% + 24px);height:100%;display:block;margin-left:-12px;animation:waveDrift 9s ease-in-out infinite;}
  .wave-top{top:-1px;height:60px;transform:scaleY(-1);}
  .wave-bottom{bottom:-1px;height:60px;}
  .wave-bottom svg{animation-duration:10.5s;animation-delay:-4s;}

  .palm-deco{position:absolute;pointer-events:none;z-index:0;opacity:.9;}
  .palm-deco svg{width:100%;height:100%;display:block;transform-origin:50% 100%;animation:palmSway 7.5s ease-in-out infinite;}
  .palm-tr{top:-18px;right:-16px;width:110px;height:170px;}
  .palm-bl{bottom:-18px;left:-16px;width:100px;height:150px;transform:scaleX(-1);}
  .palm-bl svg{animation-duration:8.5s;animation-delay:-3s;}

  @keyframes waveDrift{
    0%,100%{transform:translateX(0);}
    50%{transform:translateX(12px);}
  }
  @keyframes palmSway{
    0%,100%{transform:rotate(-2deg);}
    50%{transform:rotate(2deg);}
  }

  .sand-deco{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.7;}
  .sand-deco svg{width:100%;height:100%;display:block;}

  /* --- hero / portada --- */
  .hero{padding-top:64px;padding-bottom:54px;}
  .hero-inner{position:relative;z-index:1;max-width:460px;margin:0 auto;}
  .hero blockquote{margin:14px auto 0;max-width:420px;text-align:center;font-size:.9rem;line-height:1.85;color:#3d5654;font-style:italic;font-family:'Cormorant Garamond',serif;}
  .hero-label{text-align:center;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--turquoise-dark);margin:18px 0 0;}

  .cover-photo{width:100%;height:min(72vw,470px);object-fit:cover;display:block;}

  .names-intro{text-align:center;font-size:.78rem;letter-spacing:1px;color:#5a716f;max-width:420px;margin:0 auto 24px;text-transform:uppercase;position:relative;z-index:1;}
  .names-script{position:relative;z-index:1;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;text-align:center;color:var(--turquoise-dark);line-height:1.08;}
  .names-script .name{display:block;font-size:clamp(2.7rem,9.5vw,3.8rem);}
  .names-script .amp{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(1.4rem,5vw,1.9rem);margin:.1em 0;color:var(--turquoise);font-style:normal;}
  .honor-text{text-align:center;max-width:400px;margin:0 auto;font-size:.85rem;color:#4d6462;position:relative;z-index:1;}

  .month-label{text-align:center;letter-spacing:5px;font-size:.8rem;text-transform:uppercase;color:var(--turquoise-dark);margin:32px 0 12px;position:relative;z-index:1;}
  .date-block{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 auto;position:relative;z-index:1;}
  .date-block .weekday,.date-block .year{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--turquoise-dark);border-top:1px solid var(--turquoise);border-bottom:1px solid var(--turquoise);padding:8px 6px;white-space:nowrap;}
  .date-block .day{font-family:'Cormorant Garamond',serif;font-size:clamp(3.2rem,11vw,4.6rem);color:var(--turquoise-dark);line-height:1;}

  /* --- countdown --- */
  .countdown-intro{text-align:center;font-size:.85rem;color:#3d5654;max-width:380px;margin:0 auto 26px;position:relative;z-index:1;}
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:#fff;border:1px solid var(--line);min-width:74px;padding:16px 8px;border-radius:12px;text-align:center;box-shadow:0 6px 16px rgba(47,168,163,.12);}
  .cd-num{display:block;font-family:'Cormorant Garamond',serif;font-size:clamp(1.7rem,5vw,2.3rem);color:var(--turquoise-dark);font-weight:600;}
  .cd-label{font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#7f9694;}

  /* --- itinerario --- */
  .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;position:relative;z-index:1;}
  .info-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px 22px 24px;text-align:center;}
  .info-card .info-time{font-size:.72rem;letter-spacing:2px;color:var(--turquoise);text-transform:uppercase;}
  .info-card h3{margin:6px 0 2px;font-family:'Cormorant Garamond',serif;font-size:1.3rem;letter-spacing:1px;text-transform:uppercase;color:var(--turquoise-dark);}
  .info-card p{margin:0;font-size:.85rem;color:#5a716f;font-style:italic;}
  .info-card .wave-divider{margin:14px auto 16px;}
  .btn-map{display:inline-block;background:var(--turquoise-dark);color:#fff;text-decoration:none;font-size:.68rem;letter-spacing:2px;text-transform:uppercase;padding:12px 22px;border-radius:20px;}
  .btn-map:hover{background:var(--turquoise);}
  .dress-note{text-align:center;margin-top:30px;font-size:.85rem;color:#4d6462;position:relative;z-index:1;}
  .dress-note strong{color:var(--turquoise-dark);}

  /* --- recomendaciones para el viaje --- */
  .travel-box{position:relative;z-index:1;background:#fff;border:1px solid var(--line);border-radius:18px;padding:32px 24px;margin-top:30px;}
  .travel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;}
  .travel-item{text-align:center;}
  .travel-item .ico{width:26px;height:26px;margin:0 auto 10px;color:var(--turquoise-dark);}
  .travel-item h4{margin:0 0 8px;font-family:'Jost',sans-serif;font-weight:600;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:var(--turquoise-dark);}
  .travel-item p{margin:0;font-size:.84rem;color:#526866;}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;border-radius:12px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;transition:transform .35s ease;}
  .gallery-item:hover img{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,38,37,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* --- regalo --- */
  .gift-box{position:relative;z-index:1;background:#fff;border:1px solid var(--line);border-radius:18px;padding:40px 26px;text-align:center;max-width:420px;margin:0 auto;}
  .gift-box .ico{width:26px;height:26px;margin:0 auto 10px;color:var(--turquoise-dark);}
  .gift-box h4{margin:0 0 12px;font-family:'Jost',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--turquoise-dark);}
  .gift-box p{margin:0;font-size:.85rem;color:#4d6462;}
  .alias-pill{display:inline-block;margin-top:14px;padding:8px 18px;border:1px solid var(--turquoise);border-radius:20px;font-size:.8rem;letter-spacing:1px;color:var(--turquoise-dark);}

  /* --- rsvp --- */
  .rsvp-deadline{text-align:center;margin:0 0 6px;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--turquoise);position:relative;z-index:1;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;position:relative;z-index:1;max-width:420px;margin:0 auto;}
  .rsvp-form label{font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--turquoise-dark);display:flex;flex-direction:column;gap:6px;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;font-size:.9rem;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:#fff;width:100%;color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--turquoise);}
  .rsvp-form textarea{min-height:80px;resize:vertical;}
  .rsvp-form button{background:var(--turquoise-dark);color:#fff;border:0;padding:14px;text-transform:uppercase;letter-spacing:2px;font-size:.75rem;border-radius:24px;cursor:pointer;margin-top:4px;}
  .rsvp-form button:hover{background:var(--turquoise);}
  .rsvp-whatsapp{display:inline-block;text-align:center;font-size:.78rem;letter-spacing:1px;color:var(--turquoise-dark);text-decoration:none;border:1px solid var(--turquoise);border-radius:24px;padding:10px;}
  .rsvp-status{text-align:center;font-weight:600;color:var(--turquoise-dark);min-height:1em;}

  footer{text-align:center;padding:40px 24px 50px;font-size:.78rem;color:#7f9694;letter-spacing:1px;}
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:var(--turquoise-dark);display:block;margin-bottom:10px;}

  @media (max-width:420px){
    .section{padding-left:18px;padding-right:18px;}
    .palm-tr{width:80px;height:130px;}
    .palm-bl{width:76px;height:116px;}
  }

  @media (prefers-reduced-motion: reduce){
    .wave-deco svg,.palm-deco svg{animation:none !important;transform:none !important;}
    .palm-deco svg{transform-origin:initial;}
  }
</style></head>
<body>

  <!-- Portada -->
  <div class="band bg-foam">
    ${sand("sand-deco")}
    ${palm("palm-tr")}
    <section class="section hero">
      <div class="hero-inner">
        <p class="eyebrow">Nos casamos frente al mar</p>
        ${d.mensaje ? `<blockquote>${esc(d.mensaje)}</blockquote>` : ""}
        <p class="hero-label">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
      </div>
    </section>
    ${wave("wave-bottom")}
  </div>

  <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">

  <!-- Nombres -->
  <div class="band bg-cream">
    ${palm("palm-bl")}
    <section class="section">
      <p class="names-intro">Con el mar de testigo, tenemos el honor de invitarte a celebrar</p>
      <div class="names-script">
        <span class="name">${esc(d.novia)}</span>
        <span class="amp">&amp;</span>
        <span class="name">${esc(d.novio)}</span>
      </div>
      <div class="wave-divider">${WAVE_DIVIDER}</div>
      <p class="honor-text">Nos encantaría que armes las valijas y vengas a compartir este viaje con nosotros.</p>
      ${fechaObj ? `
      <p class="month-label">${esc(mesLabel)}</p>
      <div class="date-block">
        <span class="weekday">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNum)}</span>
        <span class="year">${esc(anioLabel)}</span>
      </div>` : ""}
    </section>
  </div>

  <!-- Cuenta regresiva -->
  <div class="band bg-arena">
    ${wave("wave-top")}
    <section class="section tight">
      <h2 class="section-title">Cuenta regresiva para el viaje</h2>
      <p class="countdown-intro">Faltan estos días para hacer las valijas, cruzar hasta la costa y brindar todos juntos frente al mar.</p>
      ${cd.html}
    </section>
  </div>

  <!-- Info para viajar -->
  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.dressCode) ? `<div class="band bg-cream">
    <section class="section">
      <p class="eyebrow">Info para viajar</p>
      <h2 class="section-title tight">Todo lo que necesitás saber</h2>
      <div class="wave-divider">${WAVE_DIVIDER}</div>
      ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="info-grid">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="info-card">
          ${d.horaCeremonia ? `<span class="info-time">${esc(d.horaCeremonia)}</span>` : ""}
          <h3>Ceremonia</h3>
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
          <div class="wave-divider">${WAVE_DIVIDER}</div>
          ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="info-card">
          ${d.horaFiesta ? `<span class="info-time">${esc(d.horaFiesta)}</span>` : ""}
          <h3>Fiesta</h3>
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
          <div class="wave-divider">${WAVE_DIVIDER}</div>
          ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
        </div>` : ""}
      </div>` : ""}
      ${d.dressCode ? `<p class="dress-note">Código de vestimenta: <strong>${esc(d.dressCode)}</strong></p>` : ""}

      <div class="travel-box">
        <div class="travel-grid">
          <div class="travel-item">
            <div class="ico">${SUITCASE_ICON}</div>
            <h4>Alojamiento</h4>
            <p>Te recomendamos reservar con anticipación: hay opciones para todos los presupuestos a pocos minutos a pie de la playa. Cuanto antes reserves, mejor tarifa.</p>
          </div>
          <div class="travel-item">
            <div class="ico">${SUN_ICON}</div>
            <h4>Qué llevar</h4>
            <p>Ropa liviana, calzado cómodo para la arena, protector solar, algo de abrigo para la noche y muchas ganas de disfrutar el mar.</p>
          </div>
        </div>
      </div>
    </section>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="band bg-arena">
    ${wave("wave-top")}
    <section class="section">
      <p class="eyebrow">Recuerdos</p>
      <h2 class="section-title tight">Nuestros momentos</h2>
      <div class="wave-divider">${WAVE_DIVIDER}</div>
      ${gal.html}
    </section>
  </div>` : ""}

  <!-- Regalo -->
  <div class="band bg-cream">
    <section class="section">
      <div class="gift-box">
        <div class="ico">${GIFT_ICON}</div>
        <h4>Sugerencia de regalo</h4>
        <p>Lo único que necesitamos es que vengas a celebrar con nosotros frente al mar. Si de todas formas querés hacernos un presente, nos harías muy felices ayudándonos con este viaje.</p>
        ${d.alias ? `<span class="alias-pill">Alias: ${esc(d.alias)}</span>` : ""}
      </div>
    </section>
  </div>

  <!-- RSVP -->
  <div class="band bg-arena">
    ${wave("wave-top")}
    <section class="section">
      <p class="eyebrow">Confirmación</p>
      <h2 class="section-title tight">Contanos si te sumás al viaje</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </section>
  </div>

  <footer>
    <span class="thanks">Gracias por venir hasta la costa a celebrar con nosotros</span>
    ${esc(d.novia)} &amp; ${esc(d.novio)}${fechaObj ? ` — ${esc(diaSemana)} ${diaNum} de ${esc(mesLabel)} de ${anioLabel}` : ""}
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:linear-gradient(180deg,#eaf7f6 0%,#fffdf9 55%,#faf3e6 100%);display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 600 90" preserveAspectRatio="none" style="position:absolute;left:0;right:0;bottom:0;height:40%;width:100%;" aria-hidden="true">
      <path d="M0,46 C75,18 150,74 225,46 C300,18 375,74 450,46 C500,26 550,26 600,46" fill="none" stroke="${esc(d.accent)}" stroke-width="2" opacity="0.4"/>
      <path d="M0,62 C75,34 150,90 225,62 C300,34 375,90 450,62 C500,42 550,42 600,62" fill="none" stroke="${esc(d.accent)}" stroke-width="1.4" opacity="0.22"/>
      <path d="M0,28 C75,58 150,-2 225,28 C300,58 375,-2 450,28 C500,48 550,48 600,28" fill="none" stroke="${esc(d.accent2)}" stroke-width="1.4" opacity="0.6"/>
    </svg>
    <div style="position:absolute;top:-16px;right:-14px;width:90px;height:130px;opacity:.92;">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <path d="M100 300 C 96 220 92 140 76 58" fill="none" stroke="${esc(d.accent)}" stroke-width="2" opacity="0.55"/>
        <g opacity="0.88">
          <path d="M100,292 C60,254 32,204 22,146 C56,170 86,208 100,258 Z" fill="${esc(d.accent)}"/>
          <path d="M100,266 C52,232 18,176 12,114 C51,142 86,190 100,238 Z" fill="${esc(d.accent2)}"/>
          <path d="M100,292 C140,254 168,204 178,146 C144,170 114,208 100,258 Z" fill="${esc(d.accent)}" opacity="0.92"/>
          <path d="M100,266 C148,232 182,176 188,114 C149,142 114,190 100,238 Z" fill="${esc(d.accent2)}" opacity="0.92"/>
        </g>
      </svg>
    </div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:0 18px;">
      <span style="font-size:.5rem;letter-spacing:2.5px;text-transform:uppercase;color:${esc(d.accent)};font-family:Georgia,'Times New Roman',serif;">Boda destino</span>
      <span style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-weight:600;font-size:1.35rem;color:#2e4342;line-height:1.15;">${esc(d.name)}</span>
      <div style="display:flex;align-items:center;gap:6px;width:64px;margin-top:2px;">
        <span style="flex:1;height:1px;background:${esc(d.accent)};opacity:.6;"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:${esc(d.accent2)};flex:none;"></span>
        <span style="flex:1;height:1px;background:${esc(d.accent)};opacity:.6;"></span>
      </div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Destino Playa",
  summary: "Paleta turquesa y arena con olas y una hoja de palmera fina, sección de info para viajar y aire relajado, ideal para una boda frente al mar.",
  accent: "#2fa8a3", accent2: "#e8d5b5", schema: bodaSchema, sampleData, render, cardPreview,
};
