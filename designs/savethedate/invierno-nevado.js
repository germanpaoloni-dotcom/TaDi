const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-invierno-nevado";

// Misma paleta exacta que designs/bodas/invierno-nevado.js, porque este
// save the date acompaña a esa invitación de boda.
const sampleData = {
  novia: "Antonella", novio: "Franco",
  fecha: "2027-07-24",
  lugar: "Bariloche",
  mensaje: "Guardá la fecha: entre montañas nevadas y el calor de los que amamos, queremos compartir con vos el día en que decimos que sí para siempre.",
  instagram: "franco.antonella.boda",
  whatsapp: "5491100000043",
  coverImage: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&q=80",
    "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&q=80",
  ],
};

// ---------- Copo de nieve (SVG, 6 puntas finas con pequeñas ramas) ----------
// Copiado tal cual de designs/bodas/invierno-nevado.js — es el motivo
// decorativo distintivo de este diseño y tiene que verse idéntico.
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

// Ícono de calendario, en línea con el resto de los íconos del diseño.
function calendarIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:18px;height:18px;vertical-align:-4px;margin-right:8px;">
    <rect x="3" y="5" width="18" height="16" stroke="currentColor" stroke-width="1.2"/>
    <path d="M3 10h18" stroke="currentColor" stroke-width="1.2"/>
    <path d="M7 2v6M17 2v6" stroke="currentColor" stroke-width="1.2"/>
    <rect x="7.5" y="13" width="3" height="3" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#1c3a5e");
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} — Save the date`,
    dateISO: d.fecha,
    time: "20:00",
    location: d.lugar,
  });

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  // Fecha calculada a mano (sin Intl/toLocaleDateString) para portabilidad.
  let fechaLarga = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        fechaLarga = `${dias[dt.getDay()]} ${Number(partes[2])} de ${meses[dt.getMonth()]} de ${partes[0]}`;
      }
    }
  }

  // Copos de nieve cayendo — capa fija, decorativa, CSS puro (sin JS).
  // Mismo sistema que designs/bodas/invierno-nevado.js.
  const flakeSizes = [14, 10, 18, 8, 16, 11, 20, 9, 13, 17, 10, 15];
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

  const hasContact = d.instagram || d.whatsapp;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
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
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--white);color:var(--ink);}
  h1,h2,h3{font-family:'Marcellus',serif;font-weight:400;}
  .eyebrow,.cd-label,footer .alias-label{text-transform:uppercase;letter-spacing:3px;font-size:.7rem;}

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
    font-size:clamp(2.1rem,8.4vw,3.5rem);
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
  section{max-width:720px;margin:0 auto;padding:clamp(40px,7vw,64px) 22px;text-align:center;position:relative;}
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
  .message{font-family:'Cormorant',serif;font-style:italic;font-size:1.3rem;line-height:1.8;color:var(--navy-3);margin:0;}

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

  /* ---------- BOTÓN CALENDARIO ---------- */
  .cal-btn{
    display:inline-flex;align-items:center;margin-top:30px;
    font-size:.8rem;letter-spacing:2.5px;text-transform:uppercase;
    color:var(--navy-2);background:transparent;
    border:1px solid var(--accent);padding:13px 28px;
    text-decoration:none;transition:background .25s,color .25s;
  }
  .cal-btn:hover{background:var(--accent);color:#fff;}

  /* ---------- LUGAR / NOTA FIJA ---------- */
  .lugar-badge{
    display:inline-block;font-size:.9rem;letter-spacing:2px;text-transform:uppercase;
    color:var(--navy-2);border:1px solid var(--accent);padding:12px 30px;margin-top:4px;
    font-family:'Marcellus',serif;
  }
  .nota-fija{max-width:480px;margin:26px auto 0;font-family:'Cormorant',serif;font-style:italic;font-size:1.05rem;line-height:1.7;color:var(--navy-3);}

  /* ---------- CONTACTO ---------- */
  .contact-row{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:26px;}
  .contact-row a{font-size:.86rem;letter-spacing:1px;color:var(--navy-2);text-decoration:none;border-bottom:1px solid var(--accent);padding-bottom:3px;}
  .contact-row a:hover{color:var(--accent);}

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

  /* ---------- GALLERY (widget) ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px;}
  .gallery-item{border:1px solid var(--ice);overflow:hidden;}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;filter:saturate(.92);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,13,22,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border:1px solid var(--ice);}
  .lightbox-close{position:absolute;top:18px;right:24px;color:var(--ice-2);font-size:2rem;cursor:pointer;line-height:1;}

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
  footer .thanks{font-family:'Cormorant',serif;font-style:italic;font-size:1.2rem;color:#fbfdff;margin:0 0 6px;}
  footer .foot-names{font-family:'Marcellus',serif;letter-spacing:2px;text-transform:uppercase;font-size:.95rem;color:#fbfdff;margin:0;}
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
      <p class="eyebrow">Guardá la fecha</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="thin-divider"></div>
      <p class="date-line">${fechaLarga ? esc(fechaLarga) : esc(d.fecha)}</p>
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="message-row">
      ${pineLeft}
      <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
      ${pineRight}
    </div>
  </section>` : ""}

  <section>
    <div class="mini-divider"></div>
    <h2>Falta muy poco</h2>
    ${cd.html}
    ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIcon()}Agregar a mi calendario</a>` : ""}
  </section>

  <section>
    <div class="divider-ice"></div>
    ${d.lugar ? `<h2>Dónde va a ser</h2><div class="lugar-badge">${esc(d.lugar)}</div>` : ""}
    <p class="nota-fija">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
    ${hasContact ? `<div class="contact-row">
      ${d.instagram ? `<a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">📷 @${esc(String(d.instagram).replace(/^@/, ""))}</a>` : ""}
      ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
    </div>` : ""}
  </section>

  ${(d.galeria && d.galeria.length) ? `<section class="dark">
    ${corners}
    <h2 class="on-dark">Momentos</h2>
    <div class="divider-ice"></div>
    ${gal.html}
  </section>` : ""}

  <footer>
    <div class="monogram-mini">${esc(inicialNovia)}&amp;${esc(inicialNovio)}</div>
    <p class="thanks">Con amor,</p>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  const accent = d.accent || "#1c3a5e";
  const accent2 = d.accent2 || "#c7d2dc";
  const dots = [
    [26, 24], [270, 30], [20, 160], [278, 148], [42, 86], [250, 92],
    [128, 20], [180, 172], [60, 36],
  ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${accent2}" fill-opacity=".65"/>`).join("");
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block;">
    <rect x="0" y="0" width="300" height="200" fill="${accent}"/>
    ${dots}
    <rect x="14" y="14" width="272" height="172" fill="none" stroke="${accent2}" stroke-width="1" opacity=".5"/>
    <g transform="translate(150,74)" stroke="${accent2}" stroke-width="1.5" stroke-linecap="round" fill="none">
      <path d="M0 -34v68M0 -34l-8 8M0 -34l8 8M0 34l-8-8M0 34l8-8"/>
      <path d="M-29.4 -17l58.8 34M-29.4 -17l11.2-1.9M-29.4 -17l5.6 10.8M29.4 17l-11.2 1.9M29.4 17l-5.6-10.8"/>
      <path d="M-29.4 17l58.8-34M-29.4 17l5.6-10.8M-29.4 17l11.2 1.9M29.4 -17l-5.6 10.8M29.4 -17l-11.2-1.9"/>
    </g>
    <text x="150" y="128" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="10" letter-spacing="3" fill="${accent2}" opacity=".85">SAVE THE DATE</text>
    <text x="150" y="156" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="18" fill="${accent2}" letter-spacing="1">${esc(d.name)}</text>
  </svg>`;
}

module.exports = {
  id, category: "savethedate", name: "Invierno Nevado",
  summary: "Azul noche, plata y una nieve que cae en animación sutil — el save the date de invierno que acompaña a la invitación de boda de montaña.",
  accent: "#1c3a5e", accent2: "#c7d2dc", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
