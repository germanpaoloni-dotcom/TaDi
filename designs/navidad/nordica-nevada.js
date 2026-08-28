const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { navidadSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "nav-nordica-nevada";

const sampleData = {
  nombre: "Brindis de Navidad — Familia Lindqvist-Rossi",
  fecha: "2027-12-24",
  hora: "20:30",
  lugar: "Casa Quinta El Pinar, Cardales",
  direccionMapa: "https://maps.google.com/?q=Casa+Quinta+El+Pinar+Cardales",
  mensaje: "Después de un año largo, nos encantaría cerrarlo juntos: turrón, sidra y mucho cariño alrededor de la mesa.",
  amigoInvisible: "Amigo invisible con tope de $15.000 — anotate en el grupo de WhatsApp antes del 15/12.",
  whatsapp: "5491100000031",
  fechaLimiteRSVP: "2027-12-15",
  coverImage: "https://images.unsplash.com/photo-1544273677-6e4b999de2a1?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80",
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80",
    "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=80",
    "https://images.unsplash.com/photo-1607354054934-1f61c85e0ba3?w=800&q=80",
  ],
};

// "Estrella de fiordo" — copo/estrella geométrico de 8 puntas hecho con
// trazos rectos finos (sin curvas), en currentColor. Es el motivo central
// del diseño: se usa como divisor entre secciones y como decoración de
// esquina en el hero y el footer.
const FIORD_STAR = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M50 6 V94"/>
  <path d="M6 50 H94"/>
  <path d="M19 19 L81 81"/>
  <path d="M81 19 L19 81"/>
  <path d="M50 6 L44 16 M50 6 L56 16"/>
  <path d="M50 94 L44 84 M50 94 L56 84"/>
  <path d="M6 50 L16 44 M6 50 L16 56"/>
  <path d="M94 50 L84 44 M94 50 L84 56"/>
  <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none"/>
</svg>`;

// Ramita de pino en trazo muy fino: un tallo diagonal recto con pares de
// agujas dispuestas a intervalos regulares. Se genera de forma paramétrica
// (no a mano) para que quede simétrica y prolija en cualquier tamaño.
function pineBranchSvg(width = 220, height = 70, needles = 9) {
  const x0 = 8, y0 = height - 10, x1 = width - 8, y1 = 10;
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  let needlesPath = "";
  for (let i = 1; i < needles; i++) {
    const t = i / needles;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    const nlen = 13 - (i % 2) * 2;
    const backX = -ux * 9, backY = -uy * 9;
    const lx = x + backX + px * nlen, ly = y + backY + py * nlen;
    const rx = x + backX - px * nlen, ry = y + backY - py * nlen;
    needlesPath += `M${x.toFixed(1)} ${y.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)} M${x.toFixed(1)} ${y.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)} `;
  }
  return `<svg class="pine-sprig" viewBox="0 0 ${width} ${height}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M${x0} ${y0} L${x1} ${y1}"/>
    <path d="${needlesPath.trim()}"/>
  </svg>`;
}
const PINE_SPRIG = pineBranchSvg(220, 70, 9);
const PINE_SPRIG_SM = pineBranchSvg(140, 46, 7);

// Silueta de reno minimalista, un solo trazo fino, sin relleno.
const DEER_LINE = `<svg viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M18 70 L34 40 L70 36 L92 50 L100 46"/>
  <path d="M92 50 L96 34 M92 50 L102 38"/>
  <path d="M96 34 L92 22 M96 34 L104 24"/>
  <path d="M102 38 L100 26 M102 38 L110 30"/>
  <path d="M34 40 L30 20 M34 40 L42 18"/>
  <path d="M30 20 L24 8 M30 20 L34 6"/>
  <path d="M42 18 L38 4 M42 18 L48 4"/>
  <path d="M40 46 L36 84 M52 44 L50 86 M64 40 L64 82 M78 42 L80 84"/>
  <circle cx="88" cy="45" r="1.6" fill="currentColor" stroke="none"/>
</svg>`;

// Silueta de cabaña con humo fino saliendo de la chimenea, línea simple.
const CABIN_LINE = `<svg viewBox="0 0 140 90" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 84 L20 46 L50 24 L80 46 L80 84"/>
  <path d="M12 50 L50 20 L88 50"/>
  <path d="M42 84 L42 62 L58 62 L58 84"/>
  <path d="M68 40 L68 26"/>
  <path d="M68 26 C 64 20, 70 14, 66 8"/>
  <path d="M96 84 L96 58 L100 46 L104 58 L104 84"/>
  <path d="M92 70 L108 70 M90 78 L110 78"/>
</svg>`;

// Copo geométrico chico (hexagonal), usado como bala/adorno de texto.
const SNOWFLAKE_MINI = `<svg class="flake-mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 2 V22"/>
  <path d="M3.5 7 L20.5 17"/>
  <path d="M20.5 7 L3.5 17"/>
</svg>`;

const GIFT_LINE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3.5" y="8.2" width="17" height="4" rx=".5"/>
  <rect x="4.7" y="12.2" width="14.6" height="8.6" rx=".5"/>
  <path d="M12 8.2 V20.8"/>
  <path d="M12 8.2c-2.6 0-4-1.4-4-2.8 0-1.3 1-1.9 1.9-1.5 1.4.6 2.1 2.5 2.1 4.3Z"/>
  <path d="M12 8.2c2.6 0 4-1.4 4-2.8 0-1.3-1-1.9-1.9-1.5-1.4.6-2.1 2.5-2.1 4.3Z"/>
</svg>`;

const PIN_LINE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 21s-7-6.4-7-11.6A7 7 0 0 1 19 9.4C19 14.6 12 21 12 21Z"/>
  <circle cx="12" cy="9.4" r="2.4"/>
</svg>`;

const MESES_ES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const DIAS_ES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#a9c4d4");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha, "cd-nn");
  const gal = galleryWidget(d.galeria, "gal-nn");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "navidad", datos: d });
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

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --snow:#fafaf7;
    --ice:${accent};
    --ice-tint:color-mix(in srgb, var(--ice) 16%, white);
    --wood:#d9c4a3;
    --wood-tint:color-mix(in srgb, var(--wood) 22%, white);
    --ink:#2e2e2c;
    --ink-soft:color-mix(in srgb, var(--ink) 62%, white);
    --line:color-mix(in srgb, var(--ink) 14%, white);
    --berry:#b5544a;
    --ice-dark:color-mix(in srgb, var(--ice), black 30%);
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;overflow-x:hidden;font-family:'Jost',-apple-system,'Segoe UI',sans-serif;font-weight:300;color:var(--ink);background:var(--snow);line-height:1.7;}
  a{color:inherit;}
  h1,h2,h3{font-weight:300;margin:0;}

  .band{width:100%;position:relative;overflow:hidden;}
  .band.bg-snow{background:var(--snow);}
  .band.bg-ice{background:var(--ice-tint);}
  .band.bg-wood{background:var(--wood-tint);}
  .section{position:relative;max-width:600px;margin:0 auto;padding:64px 26px;}
  .section.tight{padding-top:40px;padding-bottom:40px;}

  .eyebrow{text-align:center;font-size:.72rem;letter-spacing:5px;text-transform:uppercase;color:var(--ice-dark);font-weight:500;margin:0 0 18px;}
  .section-title{text-align:center;font-size:clamp(1.3rem,4vw,1.65rem);font-weight:300;letter-spacing:.5px;color:var(--ink);margin:0 0 30px;}
  .section-title.tight{margin-bottom:14px;}

  .star-div{width:26px;height:26px;margin:0 auto 30px;color:var(--ice-dark);opacity:.85;}
  .star-div.spin{animation:spin 120s linear infinite;}
  @media (prefers-reduced-motion: reduce){ .star-div.spin{animation:none;} }
  @keyframes spin{ to{ transform:rotate(360deg); } }

  .pine-sprig{color:var(--ink-soft);opacity:.6;display:block;}

  .corner-deco{position:absolute;pointer-events:none;z-index:0;color:var(--ice-dark);opacity:.5;}
  .corner-tr{top:-10px;right:-10px;width:110px;height:110px;}
  .corner-bl{bottom:-10px;left:-10px;width:110px;height:110px;transform:rotate(45deg);}

  .fade-in{animation:fadeUp .9s ease both;}
  @keyframes fadeUp{ from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  @media (prefers-reduced-motion: reduce){ .fade-in{animation:none;} }

  /* --- hero --- */
  .hero{padding-top:74px;padding-bottom:50px;}
  .hero-inner{position:relative;z-index:1;max-width:460px;margin:0 auto;text-align:center;}
  .hero .eyebrow{margin-bottom:22px;}
  .hero h1{font-size:clamp(2rem,7vw,2.9rem);letter-spacing:.3px;line-height:1.22;color:var(--ink);margin-bottom:22px;}
  .hero-pine{display:flex;justify-content:center;margin:0 auto 26px;width:180px;}
  .hero blockquote{margin:0 auto 34px;max-width:400px;font-size:.92rem;font-style:normal;font-weight:300;color:var(--ink-soft);line-height:1.9;}

  .date-line{display:flex;align-items:center;justify-content:center;gap:16px;margin:0 auto 8px;}
  .date-line .ln{flex:1;max-width:56px;height:1px;background:var(--line);}
  .date-line .weekday{font-size:.7rem;letter-spacing:2.5px;text-transform:uppercase;color:var(--ice-dark);white-space:nowrap;}
  .date-num{font-size:clamp(3rem,10vw,4.2rem);font-weight:300;color:var(--ink);line-height:1;margin:6px 0 4px;}
  .date-month-year{font-size:.78rem;letter-spacing:3px;text-transform:uppercase;color:var(--ink-soft);margin-bottom:30px;}

  .meta-row{display:flex;flex-direction:column;gap:10px;align-items:center;font-size:.88rem;color:var(--ink-soft);margin-bottom:26px;}
  .meta-row .meta-item{display:flex;align-items:center;gap:8px;}
  .meta-row svg{width:16px;height:16px;flex:none;color:var(--ice-dark);}

  .btn-map{display:inline-block;background:var(--ink);color:var(--snow);text-decoration:none;font-size:.72rem;letter-spacing:2.5px;text-transform:uppercase;padding:13px 26px;border-radius:2px;transition:background .2s ease;}
  .btn-map:hover{background:var(--ice-dark);}

  /* --- foto de portada --- */
  .cover-photo{width:100%;height:min(62vw,420px);object-fit:cover;display:block;}

  /* --- countdown --- */
  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown > div{background:var(--snow);border:1px solid var(--line);min-width:76px;padding:18px 8px;text-align:center;}
  .cd-num{display:block;font-size:clamp(1.6rem,5vw,2.1rem);font-weight:300;color:var(--ink);}
  .cd-label{font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:var(--ink-soft);}

  /* --- amigo invisible --- */
  .gift-box{position:relative;z-index:1;text-align:center;max-width:420px;margin:0 auto;}
  .gift-icon{width:30px;height:30px;margin:0 auto 16px;color:var(--berry);}
  .gift-box p{margin:0;font-size:.92rem;color:var(--ink-soft);}
  .whatsapp-note{display:inline-block;margin-top:20px;font-size:.76rem;letter-spacing:1px;color:var(--ice-dark);text-decoration:none;border-bottom:1px solid var(--ice-dark);padding-bottom:2px;}

  /* --- mensaje --- */
  .msg-block{text-align:center;max-width:440px;margin:0 auto;position:relative;z-index:1;}
  .msg-block p{font-size:.95rem;color:var(--ink-soft);line-height:1.95;margin:0;}

  /* --- galería --- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;filter:grayscale(.05);transition:transform .5s ease;}
  .gallery-item:hover img{transform:scale(1.04);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(46,46,44,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;font-weight:300;}

  /* --- rsvp --- */
  .rsvp-deadline{text-align:center;margin:0 0 26px;font-size:.76rem;letter-spacing:2px;text-transform:uppercase;color:var(--ice-dark);position:relative;z-index:1;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;position:relative;z-index:1;max-width:400px;margin:0 auto;}
  .rsvp-form label{font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);display:flex;flex-direction:column;gap:6px;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;font-weight:400;font-size:.92rem;padding:11px 12px;border:1px solid var(--line);border-radius:0;background:var(--snow);width:100%;color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--ice-dark);}
  .rsvp-form textarea{min-height:80px;resize:vertical;}
  .rsvp-form button{background:var(--ink);color:var(--snow);border:0;padding:15px;text-transform:uppercase;letter-spacing:2.5px;font-size:.74rem;font-weight:400;border-radius:0;cursor:pointer;margin-top:4px;transition:background .2s ease;}
  .rsvp-form button:hover{background:var(--ice-dark);}
  .rsvp-whatsapp{display:inline-block;text-align:center;font-size:.8rem;letter-spacing:.5px;color:var(--ink);text-decoration:none;border:1px solid var(--line);padding:11px;}
  .rsvp-status{text-align:center;font-weight:400;color:var(--ice-dark);min-height:1em;}

  footer{position:relative;text-align:center;padding:56px 24px 0;overflow:hidden;}
  .footer-decos{display:flex;justify-content:center;align-items:flex-end;gap:34px;color:var(--ink-soft);opacity:.7;margin-bottom:18px;}
  .footer-decos svg:first-child{width:76px;height:auto;}
  .footer-decos svg:last-child{width:64px;height:auto;}
  footer p{margin:0 0 6px;font-size:.9rem;color:var(--ink-soft);letter-spacing:.5px;}
  footer .thanks{font-size:1.2rem;font-weight:300;color:var(--ink);display:block;margin-bottom:10px;}
  footer .foot-meta{font-size:.74rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft);padding-bottom:36px;}

  @media (max-width:420px){
    .section{padding-left:20px;padding-right:20px;}
    .footer-decos{gap:20px;}
  }
</style></head>
<body>

  <div class="band bg-snow">
    <div class="corner-deco corner-tr">${FIORD_STAR}</div>
    <section class="section hero">
      <div class="hero-inner fade-in">
        <p class="eyebrow">Feliz Navidad</p>
        <h1>${esc(d.nombre)}</h1>
        <div class="hero-pine">${PINE_SPRIG}</div>
        ${d.mensaje ? `<blockquote>${esc(d.mensaje)}</blockquote>` : ""}
        ${fechaObj ? `
        <div class="date-line"><span class="ln"></span><span class="weekday">${esc(diaSemana)}</span><span class="ln"></span></div>
        <div class="date-num">${esc(diaNum)}</div>
        <p class="date-month-year">${esc(mesLabel)} ${esc(anioLabel)}</p>` : ""}
        <div class="meta-row">
          ${d.hora ? `<span class="meta-item">${SNOWFLAKE_MINI} ${esc(d.hora)} hs</span>` : ""}
          ${d.lugar ? `<span class="meta-item">${PIN_LINE} ${esc(d.lugar)}</span>` : ""}
        </div>
        ${d.direccionMapa ? `<a class="btn-map" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </div>
    </section>
  </div>

  ${d.coverImage ? `<img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.nombre)}">` : ""}

  <!-- Cuenta regresiva -->
  <div class="band bg-ice">
    <section class="section tight">
      <div class="star-div spin">${FIORD_STAR}</div>
      <h2 class="section-title tight">Falta muy poco</h2>
      ${cd.html}
    </section>
  </div>

  <!-- Amigo invisible -->
  ${d.amigoInvisible ? `<div class="band bg-wood">
    <section class="section tight">
      <div class="gift-box">
        <div class="gift-icon">${GIFT_LINE}</div>
        <h2 class="section-title tight">Amigo invisible</h2>
        <p>${esc(d.amigoInvisible)}</p>
      </div>
    </section>
  </div>` : ""}

  <!-- Galería -->
  ${(d.galeria && d.galeria.length) ? `<div class="band bg-snow">
    <section class="section">
      <div class="star-div">${FIORD_STAR}</div>
      <h2 class="section-title tight">Momentos</h2>
      <div style="display:flex;justify-content:center;margin-bottom:34px;"><div style="width:140px;">${PINE_SPRIG_SM}</div></div>
      ${gal.html}
    </section>
  </div>` : ""}

  <!-- RSVP -->
  <div class="band bg-ice">
    <section class="section">
      <div class="star-div">${FIORD_STAR}</div>
      <h2 class="section-title tight">Confirmá tu asistencia</h2>
      <div class="msg-block" style="margin-bottom:28px;"><p>Nos encantaría saber si nos acompañás para organizar todo con tiempo.</p></div>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </section>
  </div>

  <footer>
    <div class="footer-decos">${CABIN_LINE}${DEER_LINE}</div>
    <span class="thanks">Gracias por acompañarnos</span>
    <p class="foot-meta">${esc(d.nombre)}${d.fecha ? ` — ${esc(d.fecha)}` : ""}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:#fafaf7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-family:'Jost',-apple-system,'Segoe UI',sans-serif;">
    <div style="position:absolute;top:-8px;right:-8px;width:56px;height:56px;color:#a9c4d4;opacity:.5;">${FIORD_STAR}</div>
    <div style="position:absolute;bottom:-6px;left:-6px;width:50px;height:50px;color:#d9c4a3;opacity:.7;">${FIORD_STAR}</div>
    <div style="position:relative;z-index:1;width:20px;height:20px;color:#a9c4d4;">${SNOWFLAKE_MINI}</div>
    <div style="position:relative;z-index:1;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#7a9bb0;font-weight:500;">Feliz Navidad</div>
    <div style="position:relative;z-index:1;font-size:1rem;font-weight:300;letter-spacing:.3px;color:#2e2e2c;text-align:center;max-width:80%;line-height:1.25;">${esc(d.name)}</div>
    <div style="position:relative;z-index:1;width:60px;height:1px;background:#d9c4a3;"></div>
  </div>`;
}

module.exports = {
  id, category: "navidad", name: "Nórdica Nevada",
  summary: "Minimalismo escandinavo de Navidad: blanco nieve, azul hielo y madera clara, con estrellas de fiordo geométricas y ramas de pino en línea fina.",
  accent: "#a9c4d4", accent2: "#2e2e2c", schema: navidadSchema, sampleData, render, cardPreview,
};
