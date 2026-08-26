const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "desp-vegas-casino";

const sampleData = {
  nombre: "Cami",
  fecha: "2027-03-13",
  hora: "21:00",
  lugar: "Salón Royal Flush, Palermo",
  direccionMapa: "https://maps.google.com/?q=Salon+Royal+Flush+Palermo+Buenos+Aires",
  plan: "Arrancamos con tragos de bienvenida y fichas de regalo para cada invitado, después mesas de póker, black jack y ruleta toda la noche con crupier en vivo. Habrá premios para los que se lleven más fichas, DJ hasta que se acaben las apuestas y una sorpresa especial a medianoche. Lo que pasa en Vegas... se cuenta igual, así que vengan con toda la energía.",
  dressCode: "Elegante casual, brillos bienvenidos — acá se juega en grande",
  organizadores: "Las amigas de siempre",
  whatsapp: "5491122334455",
  coverImage: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&q=80",
    "https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&q=80",
    "https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&q=80",
    "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=800&q=80",
  ],
};

// Motivos de casino dibujados a mano en SVG inline: cartas, dados y fichas,
// sin depender de ningún ícono externo. El "cartel de luces" del hero se
// resuelve aparte con CSS (radial-gradient a modo de foquitos), no con SVG,
// para evitar cualquier problema de tamaño intrínseco.

function cardSVG(rank, suit, extraClass) {
  const suits = {
    spade: `<path d="M18 6 C 26 15, 30 21, 24 27 C 21 30, 15 30, 13 26 C 11 30, 12 33 15 34 H 21 C 24 33 25 30 23 26 C 21 30 15 30 12 27 C 6 21 10 15 18 6 Z" fill="currentColor"/>`,
    heart: `<path d="M18 30 C 4 20, 4 9, 13 8 C 17 7.5, 18 11, 18 13 C 18 11, 19 7.5, 23 8 C 32 9, 32 20, 18 30 Z" fill="currentColor"/>`,
    diamond: `<path d="M18 6 L27 20 L18 34 L9 20 Z" fill="currentColor"/>`,
    club: `<path d="M18 12 A5 5 0 1 1 13 19 A5 5 0 1 1 12 12 A5 5 0 1 1 24 12 A5 5 0 1 1 23 19 A5 5 0 1 1 18 12 Z" fill="currentColor"/><rect x="15.5" y="18" width="5" height="12" fill="currentColor"/>`,
  };
  const color = suit === "heart" || suit === "diamond" ? "var(--red-br)" : "var(--ink-card)";
  return `<svg class="motif motif-card${extraClass ? " " + extraClass : ""}" viewBox="0 0 62 90" width="62" height="90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1.5" y="1.5" width="59" height="87" rx="6" fill="#fbf5e6" stroke="var(--gold)" stroke-width="2"/>
    <rect x="5.5" y="5.5" width="51" height="79" rx="4" fill="none" stroke="var(--gold)" stroke-width="0.7" stroke-dasharray="2 3"/>
    <text x="9" y="20" font-family="Georgia,serif" font-size="15" fill="${color}" font-weight="bold">${rank}</text>
    <g transform="translate(13,20) scale(0.7)" fill="${color}" color="${color}">${suits[suit]}</g>
    <g transform="translate(31,45) scale(1.15)" fill="${color}" color="${color}">${suits[suit]}</g>
    <g transform="translate(53,80) rotate(180) scale(0.7)" fill="${color}" color="${color}">${suits[suit]}</g>
    <text x="53" y="86" font-family="Georgia,serif" font-size="15" fill="${color}" font-weight="bold" transform="rotate(180 53 78)">${rank}</text>
  </svg>`;
}

function diceSVG(extraClass, pipsA, pipsB) {
  const pipPositions = {
    1: [[18, 18]],
    2: [[9, 9], [27, 27]],
    3: [[9, 9], [18, 18], [27, 27]],
    4: [[9, 9], [27, 9], [9, 27], [27, 27]],
    5: [[9, 9], [27, 9], [18, 18], [9, 27], [27, 27]],
    6: [[9, 8], [27, 8], [9, 18], [27, 18], [9, 28], [27, 28]],
  };
  const pips = (n) => pipPositions[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="var(--red)"/>`).join("");
  return `<svg class="motif motif-dice${extraClass ? " " + extraClass : ""}" viewBox="0 0 76 36" width="76" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="rotate(-8 18 18)">
      <rect x="1" y="1" width="34" height="34" rx="7" fill="#fbf5e6" stroke="var(--red)" stroke-width="2"/>
      ${pips(pipsA)}
    </g>
    <g transform="translate(40,4) rotate(10 18 18)">
      <rect x="1" y="1" width="34" height="34" rx="7" fill="#fbf5e6" stroke="var(--red)" stroke-width="2"/>
      ${pips(pipsB)}
    </g>
  </svg>`;
}

function chipSVG(extraClass, color) {
  return `<svg class="motif motif-chip${extraClass ? " " + extraClass : ""}" viewBox="0 0 60 60" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="30" cy="30" r="27" fill="${color}" stroke="#fbf5e6" stroke-width="2.4" stroke-dasharray="6 5"/>
    <circle cx="30" cy="30" r="19" fill="none" stroke="#fbf5e6" stroke-width="1.6"/>
    <circle cx="30" cy="30" r="9" fill="none" stroke="#fbf5e6" stroke-width="1.6"/>
    <text x="30" y="35" font-family="Georgia,serif" font-size="10" fill="#fbf5e6" text-anchor="middle" font-weight="bold">$</text>
  </svg>`;
}

function neonDivider() {
  return `<div class="divider">
    ${chipSVG("mini", "var(--green)")}
    <span class="divider-line"></span>
    ${diceSVG("mini", 5, 2)}
    <span class="divider-line"></span>
    ${chipSVG("mini", "var(--red)")}
  </div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#d4af37");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : `${sampleData.fecha}T21:00:00`, "cdvegas");
  const gal = galleryWidget(d.galeria, "galvegas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Despedida de ${esc(d.nombre)} — Noche de casino</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,600&family=Dancing+Script:wght@600;700&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --night:#070403;
    --night-2:#1a0808;
    --red:#8b1a1a;
    --red-dk:#3d0a0a;
    --red-br:#c62828;
    --gold:${accent};
    --gold-lt:color-mix(in srgb, ${accent}, white 40%);
    --green:#0b3d2e;
    --ink-card:#1c1c1c;
    --cream:#f6efe0;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:radial-gradient(ellipse at 50% 10%, var(--night-2) 0%, var(--night) 65%);color:var(--cream);font-family:'Poppins',sans-serif;}
  img{max-width:100%;}

  .script{font-family:'Dancing Script',cursive;}
  .display{font-family:'Playfair Display',serif;font-weight:900;}

  .motif{display:inline-block;}
  .motif-card{width:clamp(50px,10vw,84px);height:auto;filter:drop-shadow(0 4px 10px rgba(0,0,0,.55));}
  .motif-dice{width:clamp(44px,9vw,70px);height:auto;filter:drop-shadow(0 4px 10px rgba(0,0,0,.55));}
  .motif-chip{width:clamp(34px,7vw,52px);height:auto;filter:drop-shadow(0 3px 8px rgba(0,0,0,.55));}
  .motif-chip.mini,.motif-dice.mini{width:clamp(24px,5vw,34px);}

  .divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 26px;}
  .divider-line{width:clamp(30px,10vw,80px);height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}

  /* HERO */
  .hero{position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:56px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:
    radial-gradient(circle at 50% 35%, rgba(139,26,26,.5), rgba(7,4,3,.92)),
    linear-gradient(180deg, rgba(7,4,3,.4) 0%, rgba(7,4,3,.92) 100%);}
  .hero-content{position:relative;z-index:1;max-width:600px;margin:0 auto;text-align:center;}

  /* Cartel de luces (marquesina) sin SVG: foquitos con radial-gradient, tamaño explícito */
  .marquee{position:relative;margin:0 auto;padding:clamp(26px,6vw,44px) clamp(18px,5vw,34px);border-radius:20px;
    background:linear-gradient(160deg, var(--red) 0%, var(--red-dk) 100%);
    border:2px solid var(--gold);
    box-shadow:0 0 0 6px rgba(7,4,3,.55), 0 18px 40px rgba(0,0,0,.55), inset 0 0 40px rgba(0,0,0,.3);}
  .bulbs-h{position:absolute;left:20px;right:20px;height:12px;background-image:radial-gradient(circle, var(--gold-lt) 3.4px, transparent 4px);background-size:20px 12px;background-repeat:repeat-x;background-position:center;filter:drop-shadow(0 0 3px var(--gold-lt));}
  .bulbs-h.top{top:-7px;}
  .bulbs-h.bottom{bottom:-7px;}
  .bulbs-v{position:absolute;top:20px;bottom:20px;width:12px;background-image:radial-gradient(circle, var(--gold-lt) 3.4px, transparent 4px);background-size:12px 20px;background-repeat:repeat-y;background-position:center;filter:drop-shadow(0 0 3px var(--gold-lt));}
  .bulbs-v.left{left:-7px;}
  .bulbs-v.right{right:-7px;}

  .hero-motifs{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;}
  .script-name{font-size:clamp(1.6rem,6vw,2.4rem);color:var(--cream);margin:0;}
  .casino-title{font-size:clamp(2.6rem,11vw,4.6rem);line-height:1.05;letter-spacing:1px;text-transform:uppercase;color:#fff;margin:6px 0 4px;text-shadow:0 2px 0 var(--gold), 0 0 26px color-mix(in srgb, ${accent} 35%, transparent);}
  .hero-sub{font-size:clamp(.9rem,2.4vw,1.05rem);letter-spacing:.35em;text-transform:uppercase;color:var(--gold-lt);opacity:.95;margin:8px 0 0;}

  .hero-invite{margin:26px auto 0;max-width:520px;font-family:'Playfair Display',serif;color:var(--cream);}
  .hero-invite .lucky{display:block;font-weight:900;font-size:clamp(1.2rem,4vw,1.7rem);color:var(--gold-lt);margin-bottom:8px;letter-spacing:1px;}
  .hero-invite .sub{display:block;font-size:clamp(.9rem,2.6vw,1.1rem);letter-spacing:2px;text-transform:uppercase;line-height:1.7;color:var(--cream);opacity:.92;}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.75rem,2vw,.9rem);color:var(--night);background:var(--gold);display:inline-block;margin-top:20px;padding:9px 22px;border-radius:30px;font-weight:600;}

  section{max-width:820px;margin:0 auto;padding:64px 22px;text-align:center;position:relative;}
  h2{font-family:'Playfair Display',serif;font-weight:900;letter-spacing:.5px;text-transform:uppercase;font-size:clamp(1.5rem,4.5vw,2.1rem);color:var(--gold-lt);margin:0 0 30px;text-shadow:0 0 12px color-mix(in srgb, ${accent} 30%, transparent);}

  /* COUNTDOWN */
  .countdown-wrap{background:linear-gradient(160deg, var(--red) 0%, var(--red-dk) 80%);border:2px solid var(--gold);border-radius:18px;padding:34px 20px;box-shadow:0 0 30px color-mix(in srgb, ${accent} 20%, transparent), inset 0 0 40px rgba(0,0,0,.4);}
  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:58px;}
  .cd-num{font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(1.8rem,5vw,2.6rem);color:var(--gold-lt);text-shadow:0 0 10px color-mix(in srgb, ${accent} 50%, transparent);}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:2px;color:var(--cream);opacity:.8;}

  /* PLAN + DRESS CODE */
  .felt-card{background:linear-gradient(160deg, var(--night-2) 0%, var(--night) 100%);border:2px solid var(--gold);border-radius:16px;padding:clamp(24px,5vw,44px);box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 0 50px rgba(139,26,26,.18);position:relative;}
  .felt-card::before{content:"";position:absolute;inset:8px;border:1px dashed color-mix(in srgb, ${accent} 50%, transparent);border-radius:10px;pointer-events:none;}
  .plan-text{font-size:clamp(1rem,2.4vw,1.15rem);line-height:1.85;color:var(--cream);opacity:.95;}
  .dresscode{margin-top:26px;display:inline-flex;align-items:center;gap:10px;background:rgba(198,40,40,.2);border:1px solid var(--red-br);color:var(--gold-lt);padding:10px 22px;border-radius:30px;font-size:.92rem;letter-spacing:.5px;}

  /* LUGAR */
  .place-card{display:flex;flex-direction:column;gap:14px;align-items:center;}
  .place-name{font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(1.3rem,4vw,1.8rem);letter-spacing:.5px;color:var(--gold-lt);}
  .maplink{display:inline-block;margin-top:6px;color:var(--night);background:var(--gold);text-decoration:none;letter-spacing:1px;font-size:.85rem;font-weight:600;padding:12px 26px;border-radius:30px;transition:transform .15s;}
  .maplink:hover{transform:translateY(-2px);}

  /* ORGANIZA */
  .organiza-names{font-size:clamp(1.15rem,3vw,1.5rem);color:var(--gold-lt);font-family:'Playfair Display',serif;font-weight:700;letter-spacing:.5px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid var(--gold);filter:saturate(1.05) contrast(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,3,3,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--gold);border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-lt);font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold-lt);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px;border:1px solid var(--gold);border-radius:8px;margin-top:5px;width:100%;background:#140a0a;color:var(--cream);}
  .rsvp-form button{background:var(--red-br);color:#fff;border:0;padding:14px;border-radius:30px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-size:.88rem;font-weight:600;box-shadow:0 6px 18px rgba(198,40,40,.4);}
  .rsvp-form button:hover{background:#a91f1f;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold-lt);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--gold-lt);font-weight:bold;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--cream);opacity:.75;border-top:1px solid color-mix(in srgb, ${accent} 30%, transparent);}
  footer .motif-chip{margin:0 auto 14px;}

  @media (max-width:480px){
    .hero-motifs{gap:8px;}
    .countdown{gap:10px;}
    .bulbs-v{display:none;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-content">
      <div class="hero-motifs">
        ${cardSVG("A", "spade")}
        ${diceSVG("", 6, 3)}
        ${cardSVG("K", "heart")}
      </div>

      <div class="marquee">
        <span class="bulbs-h top"></span>
        <span class="bulbs-h bottom"></span>
        <span class="bulbs-v left"></span>
        <span class="bulbs-v right"></span>
        <p class="script-name script">${esc(d.nombre)}</p>
        <h1 class="casino-title display">Noche de<br>Casino</h1>
        <p class="hero-sub">Se apuesta todo</p>
      </div>

      <p class="hero-invite">
        <span class="lucky">¡Suerte echada!</span>
        <span class="sub">Estás invitado/a a celebrar<br>la despedida de ${esc(d.nombre)}</span>
      </p>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  <section>
    ${neonDivider()}
    <h2>La cuenta regresiva</h2>
    <div class="countdown-wrap">${cd.html}</div>
  </section>

  ${(d.plan || d.dressCode) ? `
  <section>
    ${neonDivider()}
    <h2>El plan</h2>
    <div class="felt-card">
      ${d.plan ? `<p class="plan-text">${esc(d.plan)}</p>` : ""}
      ${d.dressCode ? `<div class="dresscode">${chipSVG("mini", "var(--gold)")} ${esc(d.dressCode)}</div>` : ""}
    </div>
  </section>` : ""}

  ${(d.hora || d.lugar) ? `
  <section>
    ${neonDivider()}
    <h2>Dónde se juega</h2>
    <div class="place-card">
      ${diceSVG("", 4, 2)}
      ${d.lugar ? `<p class="place-name">${esc(d.lugar)}</p>` : ""}
      ${d.hora ? `<p style="opacity:.85;margin:0;">Encuentro ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>` : ""}

  ${d.organizadores ? `
  <section>
    ${neonDivider()}
    <h2>Organiza la banca</h2>
    <p class="organiza-names">${esc(d.organizadores)}</p>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${neonDivider()}
    <h2>Fotos de la previa</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${neonDivider()}
    <h2>Confirmá tu lugar en la mesa</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${chipSVG("", "var(--red-br)")}
    Que gane la banca del amor — nos vemos en la mesa de ${esc(d.nombre)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
    background:radial-gradient(ellipse at 50% 0%, ${d.accent} 0%, #3a0a0a 70%);">
    <svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#fdf6e3" stroke="${d.accent2}" stroke-width="1.6" transform="rotate(-8 20 20)"/>
      <circle cx="13" cy="13" r="2.6" fill="${d.accent}" transform="rotate(-8 20 20)"/>
      <circle cx="27" cy="13" r="2.6" fill="${d.accent}" transform="rotate(-8 20 20)"/>
      <circle cx="20" cy="20" r="2.6" fill="${d.accent}" transform="rotate(-8 20 20)"/>
      <circle cx="13" cy="27" r="2.6" fill="${d.accent}" transform="rotate(-8 20 20)"/>
      <circle cx="27" cy="27" r="2.6" fill="${d.accent}" transform="rotate(-8 20 20)"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:1.1rem;color:${d.accent2};line-height:1.1;">${esc(d.name)}</div>
    <div style="font-family:'Segoe Script','Brush Script MT',cursive;font-size:1rem;color:#f3ded0;">despedida</div>
  </div>`;
}

module.exports = {
  id, category: "despedidas", name: "Vegas Casino",
  summary: "Noche de casino en Las Vegas con cartel de luces, terciopelo rojo y dorado, cartas, dados y fichas dibujadas a mano.",
  accent: "#8b1a1a", accent2: "#d4af37", schema: despedidaSchema, sampleData, render, cardPreview,
};
