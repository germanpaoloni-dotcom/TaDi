const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-boho-desertica";

// Misma paleta exacta que designs/bodas/boho-desertica.js, porque este
// save the date acompaña a esa invitación de boda.
const TERRACOTA_FALLBACK = "#c1623b";

const sampleData = {
  novia: "Delfina", novio: "Tomás",
  fecha: "2027-04-17",
  lugar: "Cafayate, Salta",
  mensaje: "Guardá la fecha: entre viñedos, cerros ocres y el cielo más grande que vieron, queremos celebrar el comienzo de nuestro camino juntos. Nos encantaría que estés ahí.",
  instagram: "delfina.tomas.boda",
  whatsapp: "5491100000044",
  coverImage: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG desérticos dibujados a mano (inline, sin dependencias),
// reusados tal cual de designs/bodas/boho-desertica.js para que el save the
// date se lea como el compañero exacto de esa invitación. ---

// Cactus columnar (tipo saguaro) en línea fina, con "espinas" como
// pequeños trazos perpendiculares al tallo — estilo boceto, no geométrico.
function cactusSVG(extraClass, color) {
  const spine = (x, y, rot) =>
    `<line x1="${x}" y1="${y}" x2="${x + (rot < 0 ? -3.4 : 3.4)}" y2="${y - 1.6}" stroke="${color}" stroke-width=".9" stroke-linecap="round" opacity=".7"/>`;
  let spines = "";
  for (let y = 24; y <= 100; y += 8) {
    spines += spine(28.5, y, -1) + spine(31.5, y + 3, 1);
  }
  return `<svg class="cactus-deco ${extraClass}" viewBox="0 0 60 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 108 C29.5 84 30 46 30 22 C30 13 24 9 27 3" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 72 C30 72 12 71 11 54 C10 42 19 37 23 44" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M30 52 C30 52 47 51 48 34 C49 23 40 19 36 26" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
    ${spines}
  </svg>`;
}

// Agave: hojas puntiagudas finas irradiando desde la base, cada una un
// pétalo alargado y afilado.
function agaveSVG(extraClass, color) {
  const leaf = (angleDeg, len, w) => {
    const a = (angleDeg * Math.PI) / 180;
    const bx = 50, by = 84;
    const tx = bx + Math.sin(a) * len, ty = by - Math.cos(a) * len;
    const nx = Math.cos(a) * w, ny = Math.sin(a) * w;
    const mx = bx + Math.sin(a) * (len * 0.55), my = by - Math.cos(a) * (len * 0.55);
    return `<path d="M${bx} ${by} Q ${mx + nx} ${my + ny} ${tx} ${ty} Q ${mx - nx} ${my - ny} ${bx} ${by} Z" fill="${color}" opacity=".82"/>`;
  };
  const angles = [-72, -52, -32, -14, 0, 14, 32, 52, 72];
  const leaves = angles.map((a, i) => leaf(a, 46 + (i % 2 ? 6 : 0), 5)).join("");
  return `<svg class="agave-deco ${extraClass}" viewBox="0 0 100 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${leaves}
    <circle cx="50" cy="84" r="4" fill="${color}"/>
  </svg>`;
}

// Guirnalda de macramé: línea superior con "nudos" en rombo y flecos
// colgando — usada como separador entre secciones.
function macrameDivider(color) {
  const knot = (x) => `
    <line x1="${x}" y1="3" x2="${x}" y2="9" stroke="${color}" stroke-width="1"/>
    <path d="M${x - 6} 9 L${x} 15 L${x + 6} 9 L${x} 3 Z" fill="none" stroke="${color}" stroke-width="1.1"/>
    <line x1="${x - 4}" y1="15" x2="${x - 4}" y2="29" stroke="${color}" stroke-width="1"/>
    <line x1="${x}" y1="15" x2="${x}" y2="31" stroke="${color}" stroke-width="1"/>
    <line x1="${x + 4}" y1="15" x2="${x + 4}" y2="27" stroke="${color}" stroke-width="1"/>`;
  return `<svg class="macrame-divider" width="180" height="34" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="6" y1="3" x2="174" y2="3" stroke="${color}" stroke-width="1"/>
    ${[36, 90, 144].map(knot).join("")}
  </svg>`;
}

// Sol/luna del desierto: círculo con degradé de atardecer, decorativo,
// pensado para ir detrás del contenido del hero.
function desertSunSVG(gradId, c1, c2) {
  return `<svg class="desert-sun" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><radialGradient id="${gradId}" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </radialGradient></defs>
    <circle cx="110" cy="110" r="100" fill="url(#${gradId})"/>
  </svg>`;
}

// Ornamento chico de esquina (agave en miniatura), reutilizado en las
// 4 esquinas de cualquier sección vía transform en CSS.
function cornerAgave(extraClass, color) {
  return `<svg class="corner-agave ${extraClass}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(6,74)">
      <path d="M0 0 Q -2 -30 6 -50 Q 8 -30 4 0 Z" fill="${color}" opacity=".82"/>
      <path d="M0 0 Q 6 -26 20 -38 Q 14 -20 6 0 Z" fill="${color}" opacity=".75"/>
      <path d="M0 0 Q 10 -18 26 -20 Q 18 -8 4 0 Z" fill="${color}" opacity=".65"/>
      <circle cx="0" cy="0" r="3" fill="${color}"/>
    </g>
  </svg>`;
}
function corners(color) {
  return `${cornerAgave("ca-tl", color)}${cornerAgave("ca-tr", color)}${cornerAgave("ca-bl", color)}${cornerAgave("ca-br", color)}`;
}

// Ícono de calendario simple para el botón de Google Calendar, con
// currentColor para heredar el color de texto del botón.
function calendarIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:16px;height:16px;vertical-align:-3px;margin-right:8px;">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/>
    <path d="M3 10h18" stroke="currentColor" stroke-width="1.4"/>
    <path d="M7 2v6M17 2v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

function fechaCorta(fechaISO) {
  if (!fechaISO) return "";
  const [y, m, dd] = String(fechaISO).split("-");
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd}.${m}.${y.slice(2)}`;
}

// Fecha larga en español, calculada a mano (sin toLocaleDateString/Intl,
// que pueden no traer el locale es-AR completo en todos los entornos).
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLargaES(fechaISO) {
  if (!fechaISO) return "";
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd || !MESES_ES[m - 1]) return "";
  return `${dd} de ${MESES_ES[m - 1]} de ${y}`;
}

function inicial(nombre) {
  return esc(String(nombre || "?").trim().charAt(0).toUpperCase());
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", TERRACOTA_FALLBACK);
  const cd = countdownWidget(d.fecha ? `${d.fecha}T18:00:00` : sampleData.fecha, "cdstddesert");
  const gal = galleryWidget(d.galeria, "galstddesert");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} se casan`,
    dateISO: d.fecha,
    time: "18:00",
    location: d.lugar,
  });
  const fechaLarga = fechaLargaES(d.fecha);
  const fechaLegible = formatFechaCorta(d.fecha);
  const instaHandle = d.instagram ? String(d.instagram).replace(/^@/, "") : "";
  const hasContact = d.instagram || d.whatsapp;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Save the Date &mdash; ${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --terracota:#c1623b; --terracota-dark:#8f4527; --rosa:#d9a0a0; --rosa-dark:#b97070;
    --sand:#f8ecdd; --sand2:#f1decb; --peach:#e8a87c; --ink:#4a2f22; --cream:#fffaf3;
    --desert-accent:${accent};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--sand);color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;line-height:1.7;}
  h1,h2,h3{font-family:'Marcellus',serif;font-weight:400;margin:0;}
  .amp{font-family:'Cormorant',serif;font-style:italic;font-weight:400;}
  a{color:inherit;}
  img{max-width:100%;display:block;}
  .band{position:relative;overflow:hidden;width:100%;padding:clamp(46px,8vw,86px) 20px;}
  .band-sunset{background:linear-gradient(180deg,#e8a87c 0%,#d9895f 30%,#c1623b 68%,#8f4527 100%);color:#fdf3e7;}
  .band-terracota{background:var(--terracota);color:#fdf3e7;}
  .band-rosa{background:var(--rosa);color:#4a2f22;}
  .band-sand{background:var(--sand);color:var(--ink);}
  .band-sand2{background:var(--sand2);color:var(--ink);}
  .band-dark{background:var(--terracota-dark);color:#f6e4d3;}
  .wrap{position:relative;z-index:1;max-width:640px;margin:0 auto;text-align:center;}

  .kicker{text-transform:uppercase;letter-spacing:4px;font-size:clamp(.65rem,2vw,.78rem);opacity:.85;margin:0 0 10px;}
  .band-sunset .kicker,.band-terracota .kicker,.band-dark .kicker{color:#fbe3cd;}
  .band-sand .kicker,.band-sand2 .kicker,.band-rosa .kicker{color:var(--terracota-dark);}

  /* ---------- ORNAMENTOS DE ESQUINA (mini agave) ---------- */
  .corner-agave{position:absolute;width:clamp(46px,11vw,74px);height:clamp(46px,11vw,74px);pointer-events:none;z-index:0;opacity:.8;}
  .corner-agave.ca-tl{top:6px;left:6px;}
  .corner-agave.ca-tr{top:6px;right:6px;transform:scaleX(-1);}
  .corner-agave.ca-bl{bottom:6px;left:6px;transform:scaleY(-1);}
  .corner-agave.ca-br{bottom:6px;right:6px;transform:scale(-1,-1);}

  /* ---------- HERO ---------- */
  .hero{text-align:center;padding-top:clamp(50px,9vw,90px);padding-bottom:clamp(50px,9vw,90px);}
  .desert-sun{position:absolute;top:6%;left:50%;transform:translateX(-50%);width:min(60vw,320px);height:min(60vw,320px);opacity:.55;pointer-events:none;z-index:0;animation:desertGlowPulse 11s ease-in-out infinite;}

  /* ---------- resplandor de atardecer + polvo dorado (sutiles) ---------- */
  @keyframes desertGlowPulse{
    0%,100%{opacity:.5;filter:brightness(1);}
    50%{opacity:.63;filter:brightness(1.1);}
  }
  .dust-mote{position:absolute;bottom:8%;border-radius:50%;background:radial-gradient(circle,rgba(251,227,205,.95) 0%,rgba(251,227,205,0) 72%);opacity:0;pointer-events:none;z-index:0;animation:dustFloat 15s ease-in-out infinite;}
  .dust-mote.d1{left:16%;width:4px;height:4px;animation-duration:14s;animation-delay:0s;}
  .dust-mote.d2{left:38%;width:6px;height:6px;animation-duration:17s;animation-delay:4s;}
  .dust-mote.d3{left:64%;width:5px;height:5px;animation-duration:13s;animation-delay:8s;}
  .dust-mote.d4{left:83%;width:4px;height:4px;animation-duration:18s;animation-delay:12s;}
  @keyframes dustFloat{
    0%{transform:translate(0,0);opacity:0;}
    14%{opacity:.6;}
    50%{transform:translate(7px,-90px);opacity:.5;}
    88%{opacity:0;}
    100%{transform:translate(-6px,-170px);opacity:0;}
  }
  @media (prefers-reduced-motion: reduce){
    .desert-sun{animation:none !important;opacity:.55;filter:none;}
    .dust-mote{animation:none !important;display:none;}
  }
  .cactus-deco{position:absolute;bottom:0;width:clamp(46px,11vw,84px);height:auto;opacity:.9;pointer-events:none;z-index:0;}
  .cactus-deco.hero-left{left:4%;}
  .cactus-deco.hero-right{right:4%;transform:scaleX(-1);}
  .agave-deco{position:absolute;bottom:0;width:clamp(64px,15vw,120px);height:auto;opacity:.9;pointer-events:none;z-index:0;}
  .agave-deco.hero-left2{left:14%;bottom:-4px;}
  .agave-deco.hero-right2{right:14%;bottom:-4px;transform:scaleX(-1);}

  .sun-badge{width:clamp(78px,18vw,100px);height:clamp(78px,18vw,100px);border-radius:50%;border:1px solid rgba(253,243,231,.7);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-family:'Cormorant',serif;font-style:italic;font-size:clamp(1.25rem,4vw,1.6rem);letter-spacing:1px;color:#fdf3e7;background:radial-gradient(circle at 50% 42%,rgba(253,243,231,.22),rgba(253,243,231,0) 70%);}

  .cover-wrap{background:var(--sand);padding:clamp(24px,5vw,44px) 20px 0;text-align:center;}
  .cover-photo{width:100%;max-width:520px;height:clamp(220px,42vw,380px);object-fit:cover;border-radius:70px 6px 70px 6px;box-shadow:0 14px 30px rgba(74,47,34,.22);}

  .names{font-size:clamp(2.2rem,6.8vw,3.4rem);margin:6px 0 4px;}
  .fecha-grande{font-family:'Cormorant',serif;font-style:italic;font-weight:500;font-size:clamp(1.25rem,4vw,1.9rem);letter-spacing:1.5px;margin:14px 0 4px;}
  .lugar-chico{font-size:.92rem;letter-spacing:1px;text-transform:uppercase;opacity:.9;margin:2px 0 0;}
  .message{font-size:clamp(1rem,2.3vw,1.15rem);font-style:italic;font-family:'Cormorant',serif;max-width:560px;margin:14px auto 0;line-height:1.85;}

  .macrame-divider{display:block;margin:18px auto;max-width:100%;height:auto;}
  footer .macrame-divider{margin:16px auto 0;}

  /* ---------- COUNTDOWN — insignias circulares ---------- */
  .caps-heading{text-transform:uppercase;letter-spacing:4px;font-size:clamp(1.2rem,4vw,1.65rem);}
  .countdown{display:flex;gap:clamp(10px,4vw,24px);justify-content:center;flex-wrap:wrap;margin:26px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid var(--terracota);border-radius:50%;width:clamp(64px,16vw,88px);height:clamp(64px,16vw,88px);background:var(--cream);}
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.15rem,4vw,1.65rem);color:var(--terracota-dark);}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1px;opacity:.75;}

  /* ---------- BOTÓN "AGREGAR AL CALENDARIO" ---------- */
  .cal-btn{display:inline-flex;align-items:center;margin-top:24px;background:var(--terracota-dark);color:#fdf3e7;border:0;padding:13px 26px;border-radius:30px;letter-spacing:1px;text-transform:uppercase;font-size:.78rem;text-decoration:none;transition:background .2s;}
  .cal-btn:hover{background:var(--terracota);}

  /* ---------- LUGAR / NOTA FIJA ---------- */
  .lugar-box{border:1px solid var(--desert-accent);border-radius:4px;padding:16px 30px;display:inline-block;margin-top:8px;}
  .lugar-box strong{font-family:'Marcellus',serif;font-weight:400;font-size:1.15rem;display:block;}
  .nota-fija{font-size:.85rem;opacity:.85;max-width:420px;margin:22px auto 0;font-style:italic;font-family:'Cormorant',serif;}

  /* ---------- CONTACTO ---------- */
  .contact-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 18px;margin-top:22px;}
  .contact-row a{font-size:.85rem;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;max-width:720px;margin:26px auto 0;padding:0 4px;position:relative;z-index:1;}
  .gallery-item img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:34px 6px 34px 6px;cursor:pointer;box-shadow:0 8px 20px rgba(74,47,34,.25);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,22,14,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  footer.band{text-align:center;font-size:.85rem;padding-top:60px;padding-bottom:56px;}
  footer .script{font-family:'Cormorant',serif;font-style:italic;font-weight:500;font-size:1.6rem;display:block;margin-bottom:10px;}
</style></head>
<body>

  <div class="band band-sunset hero">
    ${desertSunSVG("sunGradHeroSTD", "#fbe0b8", accent)}
    ${cactusSVG("hero-left", "#fdf3e7")}
    ${cactusSVG("hero-right", "#fdf3e7")}
    ${agaveSVG("hero-left2", "#fbe3cd")}
    ${agaveSVG("hero-right2", "#fbe3cd")}
    <span class="dust-mote d1" aria-hidden="true"></span>
    <span class="dust-mote d2" aria-hidden="true"></span>
    <span class="dust-mote d3" aria-hidden="true"></span>
    <span class="dust-mote d4" aria-hidden="true"></span>
    <div class="wrap">
      <div class="sun-badge">${inicial(d.novia)}<span class="amp">&amp;</span>${inicial(d.novio)}</div>
      <p class="kicker">Guardá la fecha</p>
      <h1 class="names">${esc(d.novia)}<span class="amp"> &amp; </span>${esc(d.novio)}</h1>
      ${fechaLarga ? `<p class="fecha-grande">${esc(fechaLarga)}</p>` : ""}
      ${d.lugar ? `<p class="lugar-chico">${esc(d.lugar)}</p>` : ""}
    </div>
  </div>

  ${d.coverImage ? `<div class="cover-wrap">
    <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">
  </div>` : ""}

  ${d.mensaje ? `<div class="band band-sand2">
    <div class="wrap">
      ${macrameDivider(accent)}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    </div>
  </div>` : ""}

  <div class="band band-sand">
    ${corners("#c1623b")}
    <div class="wrap">
      ${macrameDivider("#8f4527")}
      <p class="kicker">La cuenta regresiva</p>
      <h2 class="caps-heading">Falta poco</h2>
      ${cd.html}
      ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon()}Agregar a mi calendario</a>` : ""}
    </div>
  </div>

  <div class="band band-terracota">
    ${corners("#fbe3cd")}
    <div class="wrap">
      ${d.lugar ? `<p class="kicker">Dónde va a ser</p><div class="lugar-box"><strong>${esc(d.lugar)}</strong></div>` : ""}
      <p class="nota-fija">La invitación con todos los detalles llega más adelante &mdash; por ahora, &iexcl;agendá la fecha!</p>
      ${hasContact ? `<div class="contact-row">
        ${d.instagram ? `<a href="https://instagram.com/${esc(instaHandle)}" target="_blank" rel="noopener">📷 @${esc(instaHandle)}</a>` : ""}
        ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
      </div>` : ""}
    </div>
  </div>

  ${(d.galeria && d.galeria.length) ? `<div class="band band-rosa">
    ${corners("#8f4527")}
    <div class="wrap">
      <p class="kicker">Recuerdos</p>
      <h2>Nuestra historia en fotos</h2>
      ${macrameDivider("#8f4527")}
      ${gal.html}
    </div>
  </div>` : ""}

  <footer class="band band-dark">
    ${corners("#fbe3cd")}
    <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
    ${fechaLegible ? `Nos vemos el ${esc(fechaLegible)} &mdash; ` : ""}&iexcl;gracias por acompa&ntilde;arnos!
    ${macrameDivider("#fbe3cd")}
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#e8a87c 0%,#d9895f 45%,${d.accent} 100%);overflow:hidden;display:flex;align-items:center;justify-content:center;">
    <svg style="position:absolute;bottom:-4px;left:8px;width:52px;height:auto;opacity:.9;" viewBox="0 0 60 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M30 108 C29.5 84 30 46 30 22 C30 13 24 9 27 3" stroke="${d.accent2}" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 72 C30 72 12 71 11 54 C10 42 19 37 23 44" stroke="${d.accent2}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M30 52 C30 52 47 51 48 34 C49 23 40 19 36 26" stroke="${d.accent2}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
    <svg style="position:absolute;bottom:-4px;right:8px;width:62px;height:auto;opacity:.85;transform:scaleX(-1);" viewBox="0 0 100 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 84 Q48 54 56 34 Q58 54 54 84 Z" fill="${d.accent2}" opacity=".8"/>
      <path d="M50 84 Q56 58 70 46 Q64 64 56 84 Z" fill="${d.accent2}" opacity=".72"/>
      <path d="M50 84 Q44 58 30 46 Q36 64 44 84 Z" fill="${d.accent2}" opacity=".72"/>
      <path d="M50 84 Q60 66 76 64 Q68 76 54 84 Z" fill="${d.accent2}" opacity=".62"/>
      <path d="M50 84 Q40 66 24 64 Q32 76 46 84 Z" fill="${d.accent2}" opacity=".62"/>
      <circle cx="50" cy="84" r="4" fill="${d.accent2}"/>
    </svg>
    <svg style="position:absolute;top:8px;left:50%;transform:translateX(-50%);width:90px;height:90px;opacity:.4;" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="110" cy="110" r="100" fill="#fbe0b8"/>
    </svg>
    <div style="position:relative;z-index:1;text-align:center;padding:0 14px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:#fbe3cd;text-shadow:0 1px 4px rgba(74,47,34,.4);margin-bottom:6px;">Save the Date</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:1.1rem;color:#fffaf3;letter-spacing:.5px;text-shadow:0 1px 4px rgba(74,47,34,.4);">${esc(d.name)}</div>
      <svg width="90" height="12" viewBox="0 0 180 34" style="display:block;margin:6px auto 0;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="6" y1="3" x2="174" y2="3" stroke="#fbe3cd" stroke-width="1"/>
        <path d="M84 9 L90 15 L96 9 L90 3 Z" fill="none" stroke="#fbe3cd" stroke-width="1.1"/>
      </svg>
    </div>
  </div>`;
}

module.exports = {
  id, category: "savethedate", name: "Bohemia Desértica",
  summary: "Terracota y rosa polvoriento al atardecer, cactus y agaves dibujados a mano con detalles de macramé — el save the date boho desértico que acompaña a la invitación de boda.",
  accent: "#c1623b", accent2: "#d9a0a0", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
