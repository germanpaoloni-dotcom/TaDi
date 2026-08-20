const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

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
  mensaje: "Bajo las luces de la noche y rodeados de flores oscuras, queremos brindar con ustedes por el comienzo de esta nueva vida juntos. Los esperamos para celebrar una noche inolvidable.",
  dressCode: "Elegante noche — verde esmeralda, negro y marfil",
  alias: "valen.nacho.boda",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  ],
};

// --- Paleta base (compartida entre el CSS y los SVG generados acá) ---
const DEEP = "#0e1f18";   // negro-verdoso, fondo principal oscuro
const DEEP2 = "#173328";  // verde esmeralda oscuro, tarjetas/paneles
const EMER = "#2f5c46";   // verde esmeralda medio, líneas/bordes
const CREAM = "#ddd2b8";  // beige/crema, fondo claro
const CREAM2 = "#efe8d6"; // crema claro, tarjetas sobre crema
const INK = "#152a20";    // verde muy oscuro, texto sobre crema
const ROSE_DARK = "#1c3b2c"; // pétalos oscuros del ramo
const ROSE_WHITE = "#f5f1e4"; // pétalos claros del ramo
const LEAF = "#31593f";   // hojas

// --- Ornamentos dibujados a mano en SVG inline (sin dependencias externas) ---

// Una rosa abstracta armada con círculos superpuestos.
function roseSVG(cx, cy, r, fill) {
  return `<g opacity=".96">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>
    <circle cx="${cx - r * 0.45}" cy="${cy - r * 0.2}" r="${r * 0.62}" fill="${fill}" opacity=".82"/>
    <circle cx="${cx + r * 0.45}" cy="${cy - r * 0.15}" r="${r * 0.6}" fill="${fill}" opacity=".82"/>
    <circle cx="${cx}" cy="${cy - r * 0.55}" r="${r * 0.55}" fill="${fill}" opacity=".78"/>
    <circle cx="${cx}" cy="${cy + r * 0.1}" r="${r * 0.36}" fill="${fill}" opacity=".95"/>
  </g>`;
}

// Una hoja alargada, rotable.
function leafSVG(cx, cy, w, h, rot, fill) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0,${-h / 2} C${w},${-h / 6} ${w},${h / 6} 0,${h / 2} C${-w},${h / 6} ${-w},${-h / 6} 0,${-h / 2} Z" fill="${fill}"/>
    <line x1="0" y1="${-h / 2 + 2}" x2="0" y2="${h / 2 - 2}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
  </g>`;
}

// Ramo horizontal (rosas oscuras + rosas blancas + hojas) para usar como
// remate decorativo al pie del hero, entre secciones o en el footer.
function bouquetSVG(width = 560) {
  const h = Math.round(width * 0.34);
  return `<svg class="deco-bouquet" width="${width}" height="${h}" viewBox="0 0 560 190" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
    ${leafSVG(60, 150, 16, 70, -28, LEAF)}
    ${leafSVG(500, 150, 16, 70, 28, LEAF)}
    ${leafSVG(140, 170, 14, 60, -12, LEAF)}
    ${leafSVG(420, 170, 14, 60, 12, LEAF)}
    ${leafSVG(280, 178, 14, 50, 0, LEAF)}
    ${roseSVG(90, 140, 30, ROSE_DARK)}
    ${roseSVG(180, 158, 24, ROSE_WHITE)}
    ${roseSVG(255, 132, 32, ROSE_DARK)}
    ${roseSVG(330, 150, 22, ROSE_WHITE)}
    ${roseSVG(400, 128, 30, ROSE_DARK)}
    ${roseSVG(470, 152, 24, ROSE_WHITE)}
  </svg>`;
}

// Una sola flor pequeña, usada como separador de sección.
function sprigSVG(size = 46, fill = ROSE_DARK) {
  return `<svg class="deco-sprig" width="${size}" height="${size}" viewBox="0 0 70 70" aria-hidden="true">
    ${leafSVG(20, 50, 8, 30, -20, LEAF)}
    ${leafSVG(50, 50, 8, 30, 20, LEAF)}
    ${roseSVG(35, 34, 18, fill)}
  </svg>`;
}

// Borde de "papel rasgado" entre dos secciones: un svg de ancho completo
// con un trazo dentado, coloreado con el fondo de la sección siguiente,
// para que parezca que un panel se "rasga" sobre el otro.
function tornEdgeSVG(fill, flip = false) {
  const top = flip
    ? "M0,40 L0,14 L40,26 L80,6 L120,22 L160,4 L200,24 L240,8 L280,26 L320,10 L360,24 L400,4 L440,20 L480,2 L520,22 L560,8 L600,26 L640,10 L680,24 L720,4 L760,20 L800,2 L840,22 L880,8 L920,26 L960,10 L1000,24 L1040,4 L1080,20 L1120,2 L1160,22 L1200,12 L1200,40 Z"
    : "M0,0 L0,26 L40,10 L80,32 L120,14 L160,36 L200,16 L240,34 L280,12 L320,30 L360,14 L400,36 L440,18 L480,34 L520,12 L560,30 L600,16 L640,34 L680,14 L720,32 L760,12 L800,34 L840,16 L880,30 L920,12 L960,32 L1000,14 L1040,34 L1080,16 L1120,32 L1160,14 L1200,26 L1200,0 Z";
  return `<svg class="torn" width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true"><path d="${top}" fill="${fill}"/></svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "20:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&amp;family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --deep:${DEEP};
    --deep2:${DEEP2};
    --emer:${EMER};
    --cream:${CREAM};
    --cream2:${CREAM2};
    --ink:${INK};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--deep);color:var(--cream2);font-family:'Cormorant Garamond',serif;line-height:1.65;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:600;margin:0;}
  a{color:inherit;}
  img{max-width:100%;display:block;}

  section{max-width:860px;margin:0 auto;padding:clamp(42px,7vw,84px) 24px;text-align:center;position:relative;}
  section.on-dark{--bg:var(--deep2);--fg:var(--cream2);--muted:#a9c0b1;--line:var(--emer);--card-bg:rgba(255,255,255,.04);background:var(--bg);color:var(--fg);}
  section.on-deep{--bg:var(--deep);--fg:var(--cream2);--muted:#9fb6a8;--line:var(--emer);--card-bg:rgba(255,255,255,.03);background:var(--bg);color:var(--fg);}
  section.on-cream{--bg:var(--cream);--fg:var(--ink);--muted:#4c5f52;--line:var(--ink);--card-bg:var(--cream2);background:var(--bg);color:var(--fg);}

  .torn-wrap{line-height:0;margin-top:-20px;position:relative;z-index:2;}
  .torn-wrap svg{display:block;}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.68rem,1.6vw,.82rem);margin-bottom:14px;color:var(--muted,#c9b98f);}
  h2{font-size:clamp(1.5rem,4vw,2.3rem);font-style:italic;margin-bottom:6px;}
  .subtitle{font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:28px;}

  .sprig{margin:0 auto 18px;display:block;opacity:.95;}

  /* HERO */
  .hero{position:relative;min-height:clamp(480px,92vh,880px);display:flex;align-items:flex-end;justify-content:center;text-align:center;
    background:linear-gradient(180deg,rgba(14,31,24,.25) 0%,rgba(14,31,24,.55) 55%,var(--deep) 100%),url('${esc(d.coverImage)}') center/cover no-repeat;}
  .hero-content{position:relative;z-index:1;padding:0 24px 30px;max-width:640px;}
  .hero-content .eyebrow{color:#e8ddc4;}
  .hero-content h1{font-size:clamp(2.4rem,9vw,4.4rem);color:#fbf7ec;font-weight:700;line-height:1.08;}
  .hero-content .amp{display:block;font-style:italic;font-weight:500;font-size:clamp(1.1rem,3.2vw,1.5rem);color:#cfe0d3;margin:4px 0;}
  .hero-date{margin-top:18px;letter-spacing:3px;text-transform:uppercase;font-size:clamp(.8rem,2vw,1rem);color:#e8ddc4;}

  /* Mensaje de bienvenida */
  .message{font-size:clamp(1.05rem,2.4vw,1.3rem);font-style:italic;max-width:620px;margin:0 auto;}
  .welcome-date{margin-top:26px;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.3rem,3.4vw,1.8rem);}

  /* Countdown */
  .countdown{display:flex;gap:clamp(14px,3vw,34px);justify-content:center;flex-wrap:wrap;margin:26px 0 6px;}
  .countdown div{display:flex;flex-direction:column;min-width:58px;}
  .cd-num{font-family:'Playfair Display',serif;font-weight:600;font-size:clamp(1.7rem,5vw,2.7rem);color:var(--fg);}
  .cd-label{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-top:4px;}

  /* Timeline / cronograma */
  .timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;margin-top:22px;text-align:left;}
  .timeline .card{border:1px solid var(--line);padding:26px 24px;background:var(--card-bg);}
  .timeline .card h3{color:var(--fg);font-size:1rem;font-style:italic;margin-bottom:8px;}
  .timeline .card p{margin:0;color:var(--fg);opacity:.9;}
  .timeline .card .hora{display:block;font-family:'Playfair Display',serif;font-weight:600;font-size:1.5rem;margin-bottom:4px;}
  .map-link{display:inline-block;margin-top:24px;letter-spacing:1px;text-transform:uppercase;font-size:.82rem;border-bottom:1px solid var(--line);padding-bottom:2px;}

  /* Dress code */
  .swatches{display:flex;justify-content:center;gap:10px;margin:22px 0 18px;flex-wrap:wrap;}
  .swatches span{width:34px;height:34px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.25);}
  .badge-dresscode{display:inline-flex;align-items:center;gap:10px;margin-top:4px;border:1px solid var(--line);padding:11px 24px;letter-spacing:1px;text-transform:uppercase;font-size:.78rem;color:var(--fg);}

  /* Regalo / alias */
  .gift-box{border:1px solid var(--line);padding:32px 24px;max-width:420px;margin:0 auto;background:var(--card-bg);}
  .gift-box p{margin:0 0 12px;}
  .gift-box .alias{font-family:'Playfair Display',serif;font-style:italic;font-size:1.3rem;margin-top:6px;}

  /* Galería */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:24px;}
  .gallery img{width:100%;height:190px;object-fit:cover;cursor:pointer;border:1px solid var(--line);filter:grayscale(15%) sepia(8%) hue-rotate(70deg) saturate(1.05) brightness(.94);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(8,16,12,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--emer);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream2);font-size:2.2rem;cursor:pointer;line-height:1;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.74rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:11px;border:1px solid var(--line);background:var(--card-bg);color:var(--fg);border-radius:2px;margin-top:5px;width:100%;}
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{background:var(--fg);color:var(--bg);border:0;padding:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:'Playfair Display',serif;font-size:.82rem;}
  .rsvp-form button:hover{opacity:.85;}
  .rsvp-whatsapp{font-size:.85rem;text-align:center;text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:2px;}
  .rsvp-status{text-align:center;font-weight:bold;}

  footer{text-align:center;padding:56px 24px 40px;font-size:.85rem;color:#9fb6a8;background:var(--deep);}
  footer .foot-names{font-family:'Playfair Display',serif;font-style:italic;letter-spacing:1px;font-size:1.15rem;margin-top:10px;color:#e8ddc4;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-content">
      <p class="eyebrow">Nos casamos</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  <section class="on-cream">
    ${sprigSVG(50, ROSE_DARK)}
    <p class="message">${esc(d.mensaje)}</p>
    ${fechaLarga ? `<p class="welcome-date">${esc(fechaLarga)}</p>` : ""}
  </section>
  <div class="torn-wrap">${tornEdgeSVG(DEEP2)}</div>

  <section class="on-dark">
    <p class="subtitle">Cuenta regresiva</p>
    ${cd.html}
  </section>
  <div class="torn-wrap">${tornEdgeSVG(CREAM)}</div>

  <section class="on-cream">
    <h2>Timing</h2>
    <p class="subtitle">Programa de la noche</p>
    <div class="timeline">
      <div class="card">
        <h3>Ceremonia</h3>
        <span class="hora">${esc(d.horaCeremonia)}</span>
        <p>${esc(d.lugarCeremonia)}</p>
      </div>
      <div class="card">
        <h3>Fiesta</h3>
        <span class="hora">${esc(d.horaFiesta)}</span>
        <p>${esc(d.lugarFiesta)}</p>
      </div>
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
  </section>
  <div class="torn-wrap">${tornEdgeSVG(DEEP)}</div>

  <section class="on-deep">
    <h2>Dress code</h2>
    <p class="subtitle">Vestimenta</p>
    <div class="swatches">
      <span style="background:${DEEP}"></span>
      <span style="background:${DEEP2}"></span>
      <span style="background:${EMER}"></span>
      <span style="background:${CREAM}"></span>
      <span style="background:${ROSE_WHITE}"></span>
    </div>
    <div><span class="badge-dresscode">${esc(d.dressCode)}</span></div>
  </section>
  <div class="torn-wrap">${tornEdgeSVG(CREAM)}</div>

  <section class="on-cream">
    <h2>Detalles</h2>
    <p class="subtitle">Mesa de regalos</p>
    <div class="gift-box">
      <p>Si quieren acompañarnos con un regalo, lo más lindo es un aporte para nuestra nueva vida juntos.</p>
      <p class="alias">Alias: ${esc(d.alias)}</p>
    </div>
  </section>
  <div class="torn-wrap">${tornEdgeSVG(DEEP2)}</div>

  <section class="on-dark">
    <h2>Momentos</h2>
    <p class="subtitle">Galería</p>
    ${gal.html}
  </section>
  <div class="torn-wrap">${tornEdgeSVG(CREAM)}</div>

  <section class="on-cream">
    <h2>Questionnaire</h2>
    <p class="subtitle">Confirmá tu asistencia</p>
    ${rsvp.html}
  </section>

  <footer>
    ${bouquetSVG(460)}
    <p style="margin-top:10px">Con todo nuestro amor</p>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Nocturna Glamour",
  summary: "Boda de noche elegante en verde esmeralda oscuro y crema, con ramos de rosas blancas y oscuras y bordes de papel rasgado entre secciones.",
  accent: "#173328", accent2: "#ddd2b8", schema: bodaSchema, sampleData, render,
};
