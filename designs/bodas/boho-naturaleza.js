const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-boho-naturaleza";

const sampleData = {
  novia: "Agatha", novio: "Ulises",
  fecha: "2027-02-23", horaCeremonia: "17:30", lugarCeremonia: "Playa Hotel Blue, Holbox",
  horaFiesta: "21:30", lugarFiesta: "Alma Bar Holbox, Q.R.",
  direccionMapa: "https://maps.google.com/?q=Holbox+Quintana+Roo",
  mensaje: "Entre palmeras, arena y el sonido del mar, queremos celebrar el comienzo de nuestra vida juntos rodeados de quienes más queremos.",
  dressCode: "Casual semi formal, tonos neutros — sin blanco",
  alias: "agatha.ulises.boda",
  whatsapp: "5491100000002",
  coverImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG boho dibujados a mano (inline, sin dependencias externas) ---

// Ramita de hojas pequeña, ancla en la esquina superior-izquierda de su propio
// viewBox. Se reutiliza espejada (vía CSS transform) en las 4 esquinas de
// cualquier sección — mismo truco que el ornamento de esquina de la versión
// Elegante Clásica, pero con forma de hoja/rama en vez de filete geométrico.
function cornerLeaf(extraClass, color) {
  const leafAt = (x, y, r, s = 1) =>
    `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="${color}" opacity=".85"/></g>`;
  return `<svg class="corner-branch ${extraClass}" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 4 C 28 8, 44 24, 53 54" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/>
    ${leafAt(13, 9, 28)}${leafAt(23, 16, 42)}${leafAt(33, 26, 55)}${leafAt(41, 38, 68, 0.9)}${leafAt(48, 52, 80, 0.8)}
  </svg>`;
}
function corners(color) {
  return `${cornerLeaf("cb-tl", color)}${cornerLeaf("cb-tr", color)}${cornerLeaf("cb-bl", color)}${cornerLeaf("cb-br", color)}`;
}

// Rama alta (hojas + espigas tipo pampa) para los laterales del hero —
// se estira verticalmente para acompañar todo el alto de la franja.
function heroBranch(extraClass, color) {
  const leafAt = (x, y, r, s = 1) =>
    `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M0 0 C 8 -6 8 -17 0 -23 C -8 -17 -8 -6 0 0 Z" fill="${color}" opacity=".82"/></g>`;
  const plume = (cx, cy, rot) => {
    const strands = [-16, -8, 0, 8, 16]
      .map((a) => `<path d="M${cx} ${cy} q ${a * 0.6} -26 ${a} -52" stroke="${color}" stroke-width="1" fill="none" opacity=".55"/>`)
      .join("");
    return `<g transform="rotate(${rot} ${cx} ${cy})">${strands}</g>`;
  };
  return `<svg class="hero-branch ${extraClass}" viewBox="0 0 100 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 8 C 40 55, 14 140, 36 210 C 52 265, 22 320, 32 372" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
    ${leafAt(18, 38, -150)}${leafAt(10, 78, -165)}${leafAt(22, 118, 170)}${leafAt(30, 168, 160)}${leafAt(16, 205, -170)}${leafAt(30, 250, 150, 0.9)}${leafAt(20, 300, -160, 0.85)}${leafAt(28, 340, 165, 0.8)}
    ${plume(18, 26, -8)}
    ${plume(34, 226, 20)}
  </svg>`;
}

// Ramita fina de espigas, usada como sprig sobre el monograma del hero.
function sprigSVG(color) {
  const grain = (y, i) => {
    const dx = i % 2 ? -3 : 3;
    const rot = i % 2 ? -18 : 18;
    return `<ellipse cx="${15 + dx}" cy="${y}" rx="2.4" ry="4.6" fill="${color}" opacity=".85" transform="rotate(${rot} ${15 + dx} ${y})"/>`;
  };
  return `<svg class="sprig" viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 48 L15 6" stroke="${color}" stroke-width="1.1"/>
    ${[10, 16, 22, 28, 34].map(grain).join("")}
    <circle cx="15" cy="6" r="1.6" fill="${color}"/>
  </svg>`;
}

// Separador fino con una hoja al centro, usado entre bloques de texto.
function dividerSVG(color) {
  return `<svg class="divider-deco" width="150" height="18" viewBox="0 0 150 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="9" x2="62" y2="9" stroke="${color}" stroke-width="1"/>
    <line x1="88" y1="9" x2="150" y2="9" stroke="${color}" stroke-width="1"/>
    <path d="M75 2 C 82 7 82 11 75 16 C 68 11 68 7 75 2 Z" fill="${color}"/>
  </svg>`;
}

function fechaCorta(fechaISO) {
  if (!fechaISO) return "";
  const [y, m, dd] = String(fechaISO).split("-");
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd}.${m}.${y.slice(2)}`;
}

function inicial(nombre) {
  return esc(String(nombre || "?").trim().charAt(0).toUpperCase());
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#c9b790");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cdboho");
  const gal = galleryWidget(d.galeria, "galboho");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const rsvpMainHTML = `<p class="kicker">Por favor confirmá</p>
    <h2>RSVP</h2>
    ${dividerSVG("#a68f68")}
    ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}`;

  const giftHTML = d.alias
    ? `<p class="kicker">Mesa de regalos</p>
    <h2>¿Un regalo?</h2>
    ${dividerSVG("#a68f68")}
    <p class="gift-text">Lo más lindo para nosotros es contar con ustedes, pero si quieren hacernos un presente, un aporte para nuestra nueva vida juntos nos llena de alegría.</p>
    <div class="alias-box">Alias: ${esc(d.alias)}</div>`
    : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --olive:#565f3c; --olive-dark:#3a4128; --tan:#c9b790; --tan-dark:#a68f68;
    --cream:#f5efe1; --cream-2:#efe6cf; --ink:#3c3524; --tan-accent:${accent};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream);color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;line-height:1.7;}
  h1,h2,h3{font-family:'Fraunces',serif;font-weight:400;margin:0;}
  .amp{font-style:italic;font-weight:300;}
  a{color:inherit;}
  .band{position:relative;overflow:hidden;width:100%;padding:clamp(46px,8vw,86px) 20px;}
  .band-olive{background:var(--olive);color:var(--cream);}
  .band-olive-dark{background:var(--olive-dark);color:var(--cream);}
  .band-tan{background:var(--tan);color:var(--ink);}
  .band-cream{background:var(--cream);color:var(--ink);}
  .wrap{position:relative;z-index:1;max-width:720px;margin:0 auto;text-align:center;}

  .kicker{text-transform:uppercase;letter-spacing:4px;font-size:clamp(.65rem,2vw,.78rem);opacity:.85;margin:0 0 10px;}
  .band-olive .kicker,.band-olive-dark .kicker{color:var(--tan-accent);}
  .band-tan .kicker,.band-cream .kicker{color:var(--olive-dark);}

  /* ---------- ORNAMENTOS DE ESQUINA (ramitas de hoja) ---------- */
  .corner-branch{position:absolute;width:clamp(56px,13vw,104px);height:clamp(56px,13vw,104px);pointer-events:none;z-index:0;opacity:.85;}
  .corner-branch.cb-tl{top:8px;left:8px;}
  .corner-branch.cb-tr{top:8px;right:8px;transform:scaleX(-1);}
  .corner-branch.cb-bl{bottom:8px;left:8px;transform:scaleY(-1);}
  .corner-branch.cb-br{bottom:8px;right:8px;transform:scale(-1,-1);}

  /* ---------- HERO ---------- */
  .hero{text-align:center;padding-top:clamp(50px,9vw,90px);padding-bottom:clamp(50px,9vw,90px);}
  .hero-branch{position:absolute;top:0;width:min(28vw,150px);height:100%;color:var(--tan-accent);opacity:.9;pointer-events:none;z-index:0;}
  .hero-branch.hb-left{left:0;}
  .hero-branch.hb-right{right:0;transform:scaleX(-1);}
  .sprig{display:block;width:26px;height:auto;margin:0 auto 16px;color:var(--tan-accent);}
  .monogram{width:clamp(78px,18vw,100px);height:clamp(78px,18vw,100px);border:1px solid var(--tan-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.25rem,4vw,1.6rem);letter-spacing:1px;color:#fdfbf3;}

  .cover-wrap{background:var(--cream);padding:clamp(24px,5vw,44px) 20px 0;text-align:center;}
  .cover-photo{width:100%;max-width:520px;height:clamp(240px,44vw,400px);object-fit:cover;border-radius:6px 70px 6px 70px;box-shadow:0 14px 30px rgba(60,53,36,.18);}

  .names{font-size:clamp(2.3rem,7vw,3.6rem);margin:6px 0 4px;}
  .fecha-grande{font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.4rem,4.5vw,2.1rem);letter-spacing:2px;margin:12px 0 4px;color:var(--tan-accent);}
  .lugar-chico{font-size:.92rem;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin:2px 0 0;}
  .message{font-size:clamp(1rem,2.3vw,1.15rem);font-style:italic;max-width:560px;margin:14px auto 0;line-height:1.85;}

  .divider-deco{display:block;margin:18px auto;max-width:100%;height:auto;}
  footer .divider-deco{margin:16px auto 0;}

  .mapdress-row{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:20px 34px;max-width:700px;margin:0 auto;padding:clamp(30px,6vw,54px) 20px 0;}
  @media(min-width:600px){.mapdress-row{justify-content:space-between;}}
  .map-link{color:var(--olive-dark);text-decoration:none;border-bottom:1px solid var(--tan-accent);padding-bottom:3px;font-size:.95rem;white-space:nowrap;}
  .map-link:hover{color:var(--tan-dark);}
  .dresscode-box{border:1px solid var(--tan-accent);border-radius:4px;padding:14px 26px;text-align:center;max-width:260px;}
  .dresscode-box .kicker{margin:0 0 6px;}
  .dresscode-box strong{font-family:'Fraunces',serif;font-weight:400;font-size:1.1rem;color:var(--olive-dark);display:block;}

  .pill-btn{display:inline-block;border:1px solid currentColor;border-radius:40px;padding:11px 26px;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:18px;transition:background .2s,color .2s;}
  .band-olive .pill-btn:hover,.band-olive-dark .pill-btn:hover{background:var(--cream);color:var(--olive-dark);}
  .band-tan .pill-btn:hover,.band-cream .pill-btn:hover{background:var(--olive-dark);color:var(--cream);border-color:var(--olive-dark);}

  .itinerary{max-width:480px;margin:24px auto 0;text-align:left;}
  .itin-row{display:flex;gap:18px;align-items:baseline;padding:16px 0;border-bottom:1px solid rgba(60,53,36,.18);flex-wrap:wrap;}
  .itin-row:last-child{border-bottom:none;}
  .itin-time{font-family:'Fraunces',serif;font-size:1.1rem;color:var(--olive-dark);flex:0 0 auto;min-width:74px;}
  .itin-row strong{font-family:'Fraunces',serif;font-size:1.05rem;font-weight:500;}
  .itin-row p{margin:2px 0 0;opacity:.85;font-size:.92rem;}

  /* ---------- COUNTDOWN — insignias circulares ---------- */
  .caps-heading{text-transform:uppercase;letter-spacing:4px;font-size:clamp(1.2rem,4vw,1.65rem);}
  .countdown{display:flex;gap:clamp(10px,4vw,24px);justify-content:center;flex-wrap:wrap;margin:26px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid var(--circle-border, rgba(245,239,225,.4));border-radius:50%;width:clamp(64px,16vw,88px);height:clamp(64px,16vw,88px);}
  .band-cream .countdown div,.band-tan .countdown div{--circle-border:rgba(60,53,36,.32);}
  .cd-num{font-family:'Fraunces',serif;font-size:clamp(1.15rem,4vw,1.65rem);}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1px;opacity:.75;}

  /* ---------- RSVP + regalo, dos columnas ---------- */
  .rsvp-wrap-two{display:grid;grid-template-columns:1fr 1px 1fr;gap:40px;align-items:start;text-align:center;max-width:820px;}
  .rsvp-sep{align-self:stretch;background:linear-gradient(var(--tan) 0, var(--tan-dark) 12%, var(--tan-dark) 88%, var(--tan) 100%);opacity:.6;}
  .rsvp-col h2{margin:0 0 4px;}
  .gift-text{max-width:400px;margin:8px auto 0;opacity:.85;font-size:.92rem;}
  .rsvp-deadline{font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;margin:2px 0 10px;}
  @media(max-width:680px){
    .rsvp-wrap-two{grid-template-columns:1fr;gap:34px;}
    .rsvp-sep{display:none;}
  }

  .alias-box{display:inline-block;margin-top:14px;border:1px dashed var(--tan-accent);border-radius:10px;padding:10px 20px;font-family:'Fraunces',serif;letter-spacing:.5px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;max-width:720px;margin:26px auto 0;padding:0 4px;position:relative;z-index:1;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:6px 34px 6px 34px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.25);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(28,26,17,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:20px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--olive-dark);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;padding:11px 12px;border:1px solid var(--tan-dark);border-radius:10px;margin-top:5px;width:100%;background:var(--cream);color:var(--ink);}
  .rsvp-form button{background:var(--olive-dark);color:var(--cream);border:0;padding:13px;border-radius:30px;letter-spacing:1px;text-transform:uppercase;font-size:.82rem;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--olive);}
  .rsvp-whatsapp{text-align:center;color:var(--olive-dark);font-size:.85rem;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--olive-dark);font-weight:500;}

  footer.band{text-align:center;font-size:.85rem;padding-top:60px;padding-bottom:56px;}
  footer .script{font-family:'Fraunces',serif;font-style:italic;font-size:1.6rem;display:block;margin-bottom:10px;color:var(--tan-accent);}
</style></head>
<body>

  <div class="band band-olive hero">
    ${heroBranch("hb-left", accent)}${heroBranch("hb-right", accent)}
    <div class="wrap">
      ${sprigSVG(accent)}
      <div class="monogram">${inicial(d.novia)}<span class="amp">&amp;</span>${inicial(d.novio)}</div>
      <p class="kicker">Nos casamos</p>
      <h1 class="names">${esc(d.novia)}<span class="amp"> &amp; </span>${esc(d.novio)}</h1>
      <p class="fecha-grande">${fechaCorta(d.fecha)}</p>
      ${(d.lugarFiesta || d.lugarCeremonia) ? `<p class="lugar-chico">${esc(d.lugarFiesta || d.lugarCeremonia)}</p>` : ""}
    </div>
  </div>

  ${(d.direccionMapa || d.dressCode) ? `<div class="mapdress-row">
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
    ${d.dressCode ? `<div class="dresscode-box"><span class="kicker">Dress code</span><strong>${esc(d.dressCode)}</strong></div>` : ""}
  </div>` : ""}

  ${d.coverImage ? `<div class="cover-wrap">
    <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">
  </div>` : ""}

  ${d.mensaje ? `<div class="band band-cream">
    <div class="wrap">
      ${dividerSVG(accent)}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    </div>
  </div>` : ""}

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta) ? `<div class="band band-tan">
    <div class="wrap">
      <p class="kicker">Itinerario</p>
      <h2>¿Cuándo y dónde?</h2>
      <div class="itinerary">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="itin-row">
          ${d.horaCeremonia ? `<span class="itin-time">${esc(d.horaCeremonia)} hs</span>` : ""}
          <div><strong>Ceremonia</strong>${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}</div>
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="itin-row">
          ${d.horaFiesta ? `<span class="itin-time">${esc(d.horaFiesta)} hs</span>` : ""}
          <div><strong>Fiesta</strong>${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}</div>
        </div>` : ""}
      </div>
    </div>
  </div>` : ""}

  <div class="band band-cream">
    ${corners("#8a9463")}
    <div class="wrap">
      ${dividerSVG("#a68f68")}
      <h2 class="caps-heading">Falta poco</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.galeria && d.galeria.length) ? `<div class="band band-olive">
    ${corners(accent)}
    <div class="wrap">
      <p class="kicker">Recuerdos</p>
      <h2>Galería</h2>
      ${dividerSVG(accent)}
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="band band-tan">
    ${corners("#7d6a45")}
    <div class="wrap">
      <div class="${d.alias ? "rsvp-wrap-two" : ""}">
        ${d.alias ? `<div class="rsvp-col">${giftHTML}</div><div class="rsvp-sep" aria-hidden="true"></div><div class="rsvp-col">${rsvpMainHTML}</div>` : rsvpMainHTML}
      </div>
    </div>
  </div>

  <footer class="band band-olive-dark">
    ${corners(accent)}
    <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
    Con todo nuestro cariño, gracias por ser parte de este día.
    ${dividerSVG(accent)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;background:#f1e9d7;overflow:hidden;display:flex;align-items:center;justify-content:center;">
    <svg style="position:absolute;top:-6px;left:-6px;width:70px;height:70px;opacity:.9;" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4 C 28 8, 44 24, 53 54" stroke="#7c8555" stroke-width="1.3" stroke-linecap="round"/>
      <g transform="translate(13,9) rotate(28)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#8a9463"/></g>
      <g transform="translate(23,16) rotate(42)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#8a9463"/></g>
      <g transform="translate(33,26) rotate(55)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68"/></g>
      <g transform="translate(41,38) rotate(68)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68" opacity=".85"/></g>
    </svg>
    <svg style="position:absolute;top:-6px;right:-6px;width:70px;height:70px;opacity:.9;transform:scaleX(-1);" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4 C 28 8, 44 24, 53 54" stroke="#7c8555" stroke-width="1.3" stroke-linecap="round"/>
      <g transform="translate(13,9) rotate(28)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#8a9463"/></g>
      <g transform="translate(23,16) rotate(42)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#8a9463"/></g>
      <g transform="translate(33,26) rotate(55)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68"/></g>
      <g transform="translate(41,38) rotate(68)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68" opacity=".85"/></g>
    </svg>
    <div style="position:relative;z-index:1;text-align:center;padding:0 14px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:1.15rem;color:#3f4a2d;letter-spacing:.5px;">${esc(d.name)}</div>
      <svg width="90" height="12" viewBox="0 0 150 18" style="display:block;margin:6px auto 0;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="0" y1="9" x2="62" y2="9" stroke="#a68f68" stroke-width="1"/>
        <line x1="88" y1="9" x2="150" y2="9" stroke="#a68f68" stroke-width="1"/>
        <path d="M75 2 C 82 7 82 11 75 16 C 68 11 68 7 75 2 Z" fill="#a68f68"/>
      </svg>
    </div>
  </div>`;
}

module.exports = {
  id, category: "bodas", name: "Boho Naturaleza",
  summary: "Verde oliva y beige tierra, tipografía serif elegante y ramitas de hojas dibujadas a mano — boho natural para bodas al aire libre.",
  accent: "#565f3c", accent2: "#c9b790", schema: bodaSchema, sampleData, render, cardPreview,
};
