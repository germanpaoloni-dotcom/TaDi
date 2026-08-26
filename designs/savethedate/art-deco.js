const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-art-deco";

// Misma paleta exacta que designs/bodas/art-deco-gatsby.js, porque este
// save the date acompaña a esa invitación de boda.
const GOLD_FALLBACK = "#c9a24a";
const EMERALD = "#0b3d2e";

const sampleData = {
  novia: "Sofía",
  novio: "Joaquín",
  fecha: "2027-04-24",
  lugar: "Buenos Aires",
  mensaje: "Guardá la fecha: en los años veinte todo era jazz, brillo y grandes gestos de amor. Así queremos empezar nuestra historia juntos, y nos encantaría que estés ahí.",
  instagram: "sofia.joaquin.boda",
  whatsapp: "5491100000052",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
};

// --- Ornamentos art déco en SVG inline, con currentColor para heredar el
// dorado vía CSS. Mismo espíritu geométrico que la boda que acompaña. ---

function stepCorner(size = 26) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 39V1H39" stroke="currentColor" stroke-width="1.3"/>
    <path d="M1 27V13H15" stroke="currentColor" stroke-width="1.3"/>
    <path d="M1 20H8M20 1V8" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;
}

function decoCorners() {
  const c = stepCorner(26);
  return `<span class="corner tl">${c}</span><span class="corner tr">${c}</span><span class="corner br">${c}</span><span class="corner bl">${c}</span>`;
}

// Abanico solar radial, detrás del label del hero.
function sunburstSVG(size = 320, rays = 20) {
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

// Ícono de calendario geométrico para el botón de Google Calendar.
function calendarIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:18px;height:18px;vertical-align:-4px;margin-right:8px;">
    <rect x="3" y="5" width="18" height="16" stroke="currentColor" stroke-width="1.3"/>
    <path d="M3 10h18" stroke="currentColor" stroke-width="1.3"/>
    <path d="M7 2v6M17 2v6" stroke="currentColor" stroke-width="1.3"/>
    <rect x="7.5" y="13" width="3" height="3" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const GOLD = getPaletteColor(d.colorPalette, "dark", GOLD_FALLBACK);
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} se casan`,
    dateISO: d.fecha,
    time: "20:00",
    location: d.lugar,
  });

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  const hasContact = d.instagram || d.whatsapp;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Poiret+One&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --black:#060f0b;
    --black2:#0c1a14;
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
  h1,h2{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  .eyebrow{font-family:'Poiret One',cursive;letter-spacing:5px;text-transform:uppercase;font-size:clamp(.78rem,1.8vw,.92rem);color:var(--gold-soft);margin:0 0 14px;}
  h2{font-size:clamp(1.2rem,3.4vw,1.7rem);margin-bottom:8px;color:#f7f1de;letter-spacing:1px;}

  section{max-width:820px;margin:0 auto;padding:clamp(36px,6vw,64px) 24px;text-align:center;position:relative;}

  .zigzag-wrap{color:var(--gold-dim);display:flex;justify-content:center;padding:0 0 4px;}

  /* ---------- ESQUINAS ESCALONADAS ---------- */
  .deco-frame{position:relative;}
  .corner{position:absolute;width:24px;height:24px;color:var(--gold);pointer-events:none;}
  .corner.tl{top:-1px;left:-1px;}
  .corner.tr{top:-1px;right:-1px;transform:rotate(90deg);}
  .corner.br{bottom:-1px;right:-1px;transform:rotate(180deg);}
  .corner.bl{bottom:-1px;left:-1px;transform:rotate(270deg);}

  /* ---------- HERO ---------- */
  .hero{
    position:relative;min-height:clamp(460px,88vh,780px);
    display:flex;align-items:center;justify-content:center;text-align:center;
    background:
      linear-gradient(180deg, rgba(4,10,7,.55) 0%, rgba(4,10,7,.8) 55%, var(--black) 100%),
      ${d.coverImage ? `url('${esc(d.coverImage)}') center/cover no-repeat` : "var(--black)"};
  }
  .hero-content{position:relative;z-index:1;padding:24px;max-width:600px;}
  .hero-content .sunburst{position:absolute;top:50%;left:50%;transform:translate(-50%,-56%);color:var(--gold);z-index:-1;}
  .eyebrow-top{font-family:'Poiret One',cursive;letter-spacing:6px;text-transform:uppercase;font-size:clamp(.72rem,1.8vw,.9rem);color:var(--gold-soft);margin:0 0 20px;}

  .monogram-frame{width:130px;height:130px;position:relative;margin:0 auto 24px;}
  .monogram-outer,.monogram-inner{position:absolute;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);}
  .monogram-outer{inset:0;border:1.5px solid var(--gold);background:rgba(6,15,11,.4);}
  .monogram-inner{inset:8px;border:1px solid var(--gold-dim);display:flex;align-items:center;justify-content:center;}
  .monogram-inner span{font-family:'Cinzel Decorative',Georgia,serif;font-size:1.6rem;color:var(--gold);letter-spacing:1px;}

  .hero-content h1{font-size:clamp(1.7rem,6.6vw,2.8rem);color:var(--gold-soft);font-weight:700;line-height:1.24;letter-spacing:2.5px;text-transform:uppercase;margin-top:14px;}
  .hero-content .amp{display:block;font-family:'Poiret One',cursive;font-weight:400;font-size:.42em;letter-spacing:4px;color:var(--gold);margin:8px 0;text-transform:uppercase;}
  .hero-divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:24px auto;color:var(--gold-dim);}
  .hero-divider .deco-diamond{width:9px;height:9px;background:var(--gold);transform:rotate(45deg);flex:none;}
  .hero-divider::before,.hero-divider::after{content:"";width:48px;height:1px;background:var(--gold-dim);}
  .hero-date{font-family:'Poiret One',cursive;margin-top:2px;letter-spacing:4px;text-transform:uppercase;font-size:clamp(.8rem,2vw,1rem);color:var(--muted);}

  /* ---------- FRASE ---------- */
  .quote-box{padding:clamp(32px,5vw,48px) clamp(24px,5vw,52px) clamp(26px,4vw,34px);max-width:620px;margin:0 auto;background:var(--black2);border:1px solid var(--gold-dim);}
  .message{font-size:clamp(1rem,2.1vw,1.14rem);font-style:italic;font-weight:300;color:var(--ivory);max-width:560px;margin:0 auto;}

  /* ---------- COUNTDOWN "MARQUESINA" ---------- */
  .countdown{display:flex;gap:clamp(10px,2.6vw,18px);justify-content:center;flex-wrap:wrap;margin:8px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:68px;padding:15px 10px 13px;border:1px double var(--gold);background:var(--black2);box-shadow:inset 0 0 0 5px var(--black2), inset 0 0 0 6px var(--gold-dim);}
  @media(min-width:480px){.countdown div{min-width:82px;padding:18px 14px 15px;}}
  .countdown div::before{content:"";display:block;width:100%;height:6px;margin-bottom:11px;background-image:radial-gradient(circle, var(--gold) 1.4px, transparent 1.6px);background-size:11px 11px;background-position:center;opacity:.85;}
  .cd-num{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;font-size:clamp(1.3rem,4.4vw,1.9rem);color:var(--gold);line-height:1;}
  .cd-label{font-family:'Poiret One',cursive;font-size:.64rem;text-transform:uppercase;letter-spacing:2.5px;color:var(--muted);margin-top:8px;}

  /* ---------- CALENDARIO ---------- */
  .cal-btn{display:inline-flex;align-items:center;margin-top:30px;font-family:'Poiret One',cursive;letter-spacing:2.5px;text-transform:uppercase;font-size:.8rem;color:var(--black);background:var(--gold);padding:14px 28px;text-decoration:none;transition:background .2s;}
  .cal-btn:hover{background:var(--gold-soft);}

  /* ---------- LUGAR / NOTA ---------- */
  .lugar-badge{display:inline-block;font-family:'Poiret One',cursive;letter-spacing:2px;text-transform:uppercase;font-size:.86rem;color:var(--gold-soft);border:1px solid var(--gold);padding:12px 28px;margin-top:6px;}
  .nota-fija{max-width:520px;margin:26px auto 0;font-size:.86rem;color:var(--muted);font-style:italic;}

  /* ---------- CONTACTO ---------- */
  .contact-row{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:10px;}
  .contact-row a{font-family:'Poiret One',cursive;letter-spacing:1.5px;font-size:.86rem;color:var(--gold-soft);text-decoration:none;border-bottom:1px solid var(--gold-dim);padding-bottom:3px;}

  /* ---------- GALERÍA ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-top:10px;}
  .gallery-item{border:1px solid var(--gold-dim);background:var(--black2);padding:7px;}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;filter:saturate(.9) contrast(1.05) brightness(.94);transition:opacity .3s ease;}
  .gallery img:hover{opacity:.82;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(3,7,5,.96);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-soft);font-size:2.2rem;cursor:pointer;line-height:1;}

  .gold-rule{height:1px;max-width:820px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-dim) 15%,var(--gold-dim) 85%,transparent);opacity:.7;}

  /* ---------- FOOTER ---------- */
  footer{position:relative;overflow:hidden;text-align:center;padding:50px 24px 42px;background:var(--black);}
  .foot-mono{width:58px;height:58px;position:relative;margin:0 auto 18px;}
  .foot-mono-outer{position:absolute;inset:0;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;}
  .foot-mono-outer span{font-family:'Cinzel Decorative',Georgia,serif;font-size:.8rem;letter-spacing:1px;color:var(--gold-soft);}
  .foot-names{font-family:'Cinzel Decorative',Georgia,serif;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:1.02rem;color:var(--gold-soft);margin-bottom:8px;}
  .foot-thanks{font-family:'Montserrat',sans-serif;font-weight:300;font-size:.78rem;letter-spacing:.5px;color:var(--muted);margin:0;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-content">
      ${sunburstSVG(320, 20)}
      <p class="eyebrow-top">Guardá la fecha</p>
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
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">La cuenta regresiva</p>
    ${cd.html}
    ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon()}Agregar a mi calendario</a>` : ""}
  </section>

  <div class="zigzag-wrap">${zigzagSVG(200, 12)}</div>

  <section>
    ${d.lugar ? `<p class="eyebrow">Dónde va a ser</p><div class="lugar-badge">${esc(d.lugar)}</div>` : ""}
    <p class="nota-fija">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
    ${hasContact ? `<div class="contact-row">
      ${d.instagram ? `<a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">📷 @${esc(String(d.instagram).replace(/^@/, ""))}</a>` : ""}
      ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
    </div>` : ""}
  </section>

  ${(d.galeria && d.galeria.length) ? `<section>
    <p class="eyebrow">Momentos</p>
    <h2 style="font-size:clamp(1.05rem,2.8vw,1.3rem);margin-bottom:26px;">Nuestra historia en fotos</h2>
    ${gal.html}
  </section>` : ""}

  <div class="gold-rule"></div>

  <footer>
    <div class="foot-mono"><div class="foot-mono-outer"><span>${esc(inicialNovia)}&nbsp;&amp;&nbsp;${esc(inicialNovio)}</span></div></div>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    <p class="foot-thanks">Con todo nuestro cariño, esperamos verte pronto.</p>
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;background:${d.accent2};display:flex;align-items:center;justify-content:center;">
    <svg width="100%" height="100%" viewBox="0 0 300 200" style="position:absolute;inset:0;" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="${d.accent2}"/>
      <g stroke="${d.accent}" stroke-width="1" opacity="0.5">
        <circle cx="150" cy="100" r="30" fill="none"/>
        <circle cx="150" cy="100" r="52" fill="none"/>
        <circle cx="150" cy="100" r="74" fill="none"/>
        <circle cx="150" cy="100" r="96" fill="none"/>
      </g>
      <rect x="16" y="16" width="268" height="168" fill="none" stroke="${d.accent}" stroke-width="1" opacity="0.6"/>
      <rect x="24" y="24" width="252" height="152" fill="none" stroke="${d.accent}" stroke-width="1" opacity="0.35"/>
    </svg>
    <div style="position:relative;z-index:1;text-align:center;padding:0 22px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:.8rem;letter-spacing:3px;text-transform:uppercase;color:${d.accent};text-shadow:0 1px 4px rgba(0,0,0,.65);line-height:1.35;margin-bottom:6px;">Save the Date</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:1.02rem;letter-spacing:2px;text-transform:uppercase;color:${d.accent};text-shadow:0 1px 4px rgba(0,0,0,.65);line-height:1.35;">${esc(d.name)}</div>
    </div>
  </div>`;
}

module.exports = {
  id, category: "savethedate", name: "Art Deco",
  summary: "Esmeralda y dorado sobre negro, geometría de abanicos y esquinas escalonadas: el save the date que anticipa una boda de gala años 20.",
  accent: GOLD_FALLBACK, accent2: EMERALD, schema: saveTheDateSchema, sampleData, render, cardPreview,
};
