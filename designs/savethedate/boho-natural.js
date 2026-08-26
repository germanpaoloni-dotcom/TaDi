const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-boho-natural";

const sampleData = {
  novia: "Agatha", novio: "Ulises",
  fecha: "2027-04-10",
  lugar: "Tandil, Buenos Aires",
  mensaje: "¡Nos casamos! Todavía falta, pero queríamos que lo tengas agendado desde ya — la invitación con todos los detalles llega más adelante.",
  instagram: "agatha.ulises.boda",
  whatsapp: "5491100000051",
  coverImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG boho dibujados a mano (inline, sin dependencias externas) ---

// Ramita de hojas pequeña, ancla en la esquina superior-izquierda de su propio
// viewBox. Se reutiliza espejada (vía CSS transform) en las 4 esquinas de
// cualquier sección.
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

// Ramita fina de espigas, usada como sprig sobre el hero.
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

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#565f3c");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T18:00:00` : sampleData.fecha, "cdstdboho");
  const gal = galleryWidget(d.galeria, "galstdboho");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} se casan`,
    dateISO: d.fecha,
    time: "18:00",
    location: d.lugar,
  });
  const fechaLegible = formatFechaCorta(d.fecha);

  const contactoHTML = (d.instagram || d.whatsapp)
    ? `<div class="band band-cream">
      <div class="wrap">
        <p class="kicker">¿Dudas?</p>
        <h2>Contacto</h2>
        ${dividerSVG("#a68f68")}
        <div class="contact-links">
          ${d.instagram ? `<a class="pill-btn pill-outline" href="https://instagram.com/${esc(d.instagram)}" target="_blank" rel="noopener">📷 @${esc(d.instagram)}</a>` : ""}
          ${d.whatsapp ? `<a class="pill-btn pill-outline" href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
        </div>
      </div>
    </div>`
    : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Save the Date &mdash; ${esc(d.novia)} &amp; ${esc(d.novio)}</title>
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
  .band-tan{background:var(--tan);color:var(--ink);}
  .band-cream{background:var(--cream);color:var(--ink);}
  .wrap{position:relative;z-index:1;max-width:640px;margin:0 auto;text-align:center;}

  .kicker{text-transform:uppercase;letter-spacing:4px;font-size:clamp(.65rem,2vw,.78rem);opacity:.85;margin:0 0 10px;}
  .band-olive .kicker{color:var(--tan-accent);}
  .band-tan .kicker,.band-cream .kicker{color:var(--olive-dark);}

  /* ---------- ORNAMENTOS DE ESQUINA (ramitas de hoja) ---------- */
  .corner-branch{position:absolute;width:clamp(56px,13vw,104px);height:clamp(56px,13vw,104px);pointer-events:none;z-index:0;opacity:.85;}
  .corner-branch.cb-tl{top:8px;left:8px;}
  .corner-branch.cb-tr{top:8px;right:8px;transform:scaleX(-1);}
  .corner-branch.cb-bl{bottom:8px;left:8px;transform:scaleY(-1);}
  .corner-branch.cb-br{bottom:8px;right:8px;transform:scale(-1,-1);}

  /* ---------- HERO ---------- */
  .hero{text-align:center;padding-top:clamp(50px,9vw,90px);padding-bottom:0;}
  .sprig{display:block;width:26px;height:auto;margin:0 auto 14px;color:var(--tan-accent);}
  .std-tag{display:inline-block;border:1px solid var(--tan-accent);border-radius:30px;padding:6px 20px;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:var(--tan-accent);margin-bottom:18px;}

  .cover-wrap{background:var(--olive);padding:clamp(24px,5vw,40px) 20px 0;text-align:center;}
  .cover-photo{width:100%;max-width:520px;height:clamp(220px,42vw,380px);object-fit:cover;border-radius:6px 70px 6px 70px;box-shadow:0 14px 30px rgba(60,53,36,.25);}

  .names{font-size:clamp(2.1rem,6.5vw,3.2rem);margin:6px 0 4px;}
  .fecha-grande{font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.3rem,4vw,1.9rem);letter-spacing:2px;margin:12px 0 4px;color:var(--tan-accent);}
  .lugar-chico{font-size:.92rem;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin:2px 0 0;}
  .message{font-size:clamp(1rem,2.3vw,1.15rem);font-style:italic;max-width:540px;margin:14px auto 0;line-height:1.85;}

  .divider-deco{display:block;margin:18px auto;max-width:100%;height:auto;}
  footer .divider-deco{margin:16px auto 0;}

  .pill-btn{display:inline-block;border:1px solid currentColor;border-radius:40px;padding:11px 26px;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:18px;transition:background .2s,color .2s;}
  .band-olive .pill-btn:hover{background:var(--cream);color:var(--olive-dark);}
  .band-tan .pill-btn:hover,.band-cream .pill-btn:hover{background:var(--olive-dark);color:var(--cream);border-color:var(--olive-dark);}
  .pill-outline{color:var(--olive-dark);border-color:var(--tan-accent);margin:6px 8px 0;}

  .contact-links{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 10px;}

  .caps-heading{text-transform:uppercase;letter-spacing:4px;font-size:clamp(1.15rem,4vw,1.55rem);}
  .countdown{display:flex;gap:clamp(10px,4vw,24px);justify-content:center;flex-wrap:wrap;margin:26px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid var(--circle-border, rgba(245,239,225,.4));border-radius:50%;width:clamp(64px,16vw,88px);height:clamp(64px,16vw,88px);}
  .band-cream .countdown div,.band-tan .countdown div{--circle-border:rgba(60,53,36,.32);}
  .cd-num{font-family:'Fraunces',serif;font-size:clamp(1.15rem,4vw,1.65rem);}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1px;opacity:.75;}

  .lugar-box{border:1px solid var(--tan-accent);border-radius:4px;padding:16px 30px;display:inline-block;margin-top:8px;}
  .lugar-box strong{font-family:'Fraunces',serif;font-weight:400;font-size:1.15rem;color:var(--olive-dark);display:block;}

  .nota-fija{font-size:.85rem;opacity:.8;max-width:420px;margin:22px auto 0;font-style:italic;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;max-width:680px;margin:26px auto 0;padding:0 4px;position:relative;z-index:1;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:6px 34px 6px 34px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.25);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(28,26,17,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  footer.band{text-align:center;font-size:.85rem;padding-top:56px;padding-bottom:50px;}
  footer .script{font-family:'Fraunces',serif;font-style:italic;font-size:1.5rem;display:block;margin-bottom:10px;color:var(--tan-accent);}
</style></head>
<body>

  <div class="band band-olive hero">
    <div class="wrap">
      ${sprigSVG(accent)}
      <span class="std-tag">Save the Date</span>
      <h1 class="names">${esc(d.novia)}<span class="amp"> &amp; </span>${esc(d.novio)}</h1>
      <p class="fecha-grande">${fechaCorta(d.fecha)}</p>
      ${d.lugar ? `<p class="lugar-chico">${esc(d.lugar)}</p>` : ""}
    </div>
  </div>

  ${d.coverImage ? `<div class="cover-wrap">
    <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">
  </div>` : ""}

  ${d.mensaje ? `<div class="band band-cream">
    <div class="wrap">
      ${dividerSVG(accent)}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    </div>
  </div>` : ""}

  <div class="band band-tan">
    ${corners("#8a9463")}
    <div class="wrap">
      <p class="kicker">Faltan</p>
      <h2 class="caps-heading">Falta poco</h2>
      ${cd.html}
      ${calLink ? `<a class="pill-btn" style="color:var(--olive-dark);border-color:var(--olive-dark);" href="${esc(calLink)}" target="_blank" rel="noopener">📅 Agregar a mi calendario</a>` : ""}
    </div>
  </div>

  ${d.lugar ? `<div class="band band-cream">
    <div class="wrap">
      <p class="kicker">D&oacute;nde va a ser</p>
      <div class="lugar-box"><strong>${esc(d.lugar)}</strong></div>
      <p class="nota-fija">La invitaci&oacute;n con todos los detalles llega m&aacute;s adelante &mdash; por ahora, &iexcl;agend&aacute; la fecha!</p>
    </div>
  </div>` : `<div class="band band-cream">
    <div class="wrap">
      <p class="nota-fija">La invitaci&oacute;n con todos los detalles llega m&aacute;s adelante &mdash; por ahora, &iexcl;agend&aacute; la fecha!</p>
    </div>
  </div>`}

  ${contactoHTML}

  ${(d.galeria && d.galeria.length) ? `<div class="band band-olive">
    ${corners(accent)}
    <div class="wrap">
      <p class="kicker">Nosotros</p>
      <h2>Galer&iacute;a</h2>
      ${dividerSVG(accent)}
      ${gal.html}
    </div>
  </div>` : ""}

  <footer class="band band-tan">
    ${corners("#7d6a45")}
    <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
    ${fechaLegible ? `Nos vemos el ${esc(fechaLegible)} &mdash; ` : ""}&iexcl;gracias por acompa&ntilde;arnos!
    ${dividerSVG("#7d6a45")}
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;background:${esc(d.accent2 || "#c9b790")};overflow:hidden;display:flex;align-items:center;justify-content:center;">
    <svg style="position:absolute;top:-6px;left:-6px;width:66px;height:66px;opacity:.9;" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4 C 28 8, 44 24, 53 54" stroke="${esc(d.accent || "#565f3c")}" stroke-width="1.3" stroke-linecap="round"/>
      <g transform="translate(13,9) rotate(28)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="${esc(d.accent || "#565f3c")}"/></g>
      <g transform="translate(23,16) rotate(42)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="${esc(d.accent || "#565f3c")}"/></g>
      <g transform="translate(33,26) rotate(55)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68"/></g>
      <g transform="translate(41,38) rotate(68)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68" opacity=".85"/></g>
    </svg>
    <svg style="position:absolute;bottom:-6px;right:-6px;width:66px;height:66px;opacity:.9;transform:scale(-1,-1);" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4 C 28 8, 44 24, 53 54" stroke="${esc(d.accent || "#565f3c")}" stroke-width="1.3" stroke-linecap="round"/>
      <g transform="translate(13,9) rotate(28)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="${esc(d.accent || "#565f3c")}"/></g>
      <g transform="translate(23,16) rotate(42)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="${esc(d.accent || "#565f3c")}"/></g>
      <g transform="translate(33,26) rotate(55)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68"/></g>
      <g transform="translate(41,38) rotate(68)"><path d="M0 0 C 6 -5 6 -13 0 -17 C -6 -13 -6 -5 0 0 Z" fill="#a68f68" opacity=".85"/></g>
    </svg>
    <div style="position:relative;z-index:1;text-align:center;padding:0 14px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:${esc(d.accent || "#565f3c")};margin-bottom:6px;">Save the Date</div>
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
  id, category: "savethedate", name: "Boho Natural",
  summary: "Verde oliva y beige tierra, tipografía serif elegante y ramitas de hojas dibujadas a mano — el save the date boho natural que acompaña a la invitación de boda.",
  accent: "#565f3c", accent2: "#c9b790", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
