const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");

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

// Motivos de casino dibujados a mano en SVG inline: cartas, dados, fichas y
// ases, sin depender de ningún ícono externo.

function cardSVG(rank, suit, extraClass) {
  const suits = {
    spade: `<path d="M18 6 C 26 15, 30 21, 24 27 C 21 30, 15 30, 13 26 C 11 30, 12 33 15 34 H 21 C 24 33 25 30 23 26 C 21 30 15 30 12 27 C 6 21 10 15 18 6 Z" fill="currentColor"/>`,
    heart: `<path d="M18 30 C 4 20, 4 9, 13 8 C 17 7.5, 18 11, 18 13 C 18 11, 19 7.5, 23 8 C 32 9, 32 20, 18 30 Z" fill="currentColor"/>`,
    diamond: `<path d="M18 6 L27 20 L18 34 L9 20 Z" fill="currentColor"/>`,
    club: `<path d="M18 12 A5 5 0 1 1 13 19 A5 5 0 1 1 12 12 A5 5 0 1 1 24 12 A5 5 0 1 1 23 19 A5 5 0 1 1 18 12 Z" fill="currentColor"/><rect x="15.5" y="18" width="5" height="12" fill="currentColor"/>`,
  };
  const color = suit === "heart" || suit === "diamond" ? "var(--red)" : "var(--ink-card)";
  return `<svg class="motif motif-card${extraClass ? " " + extraClass : ""}" viewBox="0 0 62 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
  const pips = (n) => pipPositions[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="var(--ink-card)"/>`).join("");
  return `<svg class="motif motif-dice${extraClass ? " " + extraClass : ""}" viewBox="0 0 76 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="rotate(-8 18 18)">
      <rect x="1" y="1" width="34" height="34" rx="7" fill="#f6efe0" stroke="var(--red)" stroke-width="2"/>
      ${pips(pipsA)}
    </g>
    <g transform="translate(40,4) rotate(10 18 18)">
      <rect x="1" y="1" width="34" height="34" rx="7" fill="#f6efe0" stroke="var(--red)" stroke-width="2"/>
      ${pips(pipsB)}
    </g>
  </svg>`;
}

function chipSVG(extraClass, color) {
  return `<svg class="motif motif-chip${extraClass ? " " + extraClass : ""}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : `${sampleData.fecha}T21:00:00`, "cdvegas");
  const gal = galleryWidget(d.galeria, "galvegas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

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
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --green:#0b3d2e;
    --green-dk:#072a20;
    --gold:#d4af37;
    --gold-lt:#f3d878;
    --red:#c62828;
    --ink-card:#1c1c1c;
    --cream:#f6efe0;
    --night:#0a0a10;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--night);color:var(--cream);font-family:'Poppins',sans-serif;}
  img{max-width:100%;}

  .neon-font{font-family:'Bebas Neue',cursive;letter-spacing:3px;}

  .motif{display:inline-block;}
  .motif-card{width:clamp(52px,10vw,86px);height:auto;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5));}
  .motif-dice{width:clamp(46px,9vw,72px);height:auto;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5));}
  .motif-chip{width:clamp(34px,7vw,52px);height:auto;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5));}
  .motif-chip.mini,.motif-dice.mini{width:clamp(24px,5vw,34px);}

  .divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 26px;}
  .divider-line{width:clamp(30px,10vw,80px);height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}

  /* HERO */
  .hero{position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:
    radial-gradient(circle at 50% 30%, rgba(11,61,46,.35), rgba(6,6,10,.88)),
    linear-gradient(180deg, rgba(6,6,10,.35) 0%, rgba(6,6,10,.85) 100%);}
  .hero-felt-border{position:absolute;inset:16px;border:2px solid var(--gold);border-radius:14px;box-shadow:0 0 22px rgba(212,175,55,.35), inset 0 0 22px rgba(212,175,55,.2);pointer-events:none;}
  .hero-felt-border::before,.hero-felt-border::after{content:"";position:absolute;width:14px;height:14px;border:2px solid var(--gold);}
  .hero-content{position:relative;z-index:1;max-width:640px;}
  .hero-motifs{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:14px;flex-wrap:wrap;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-size:clamp(.7rem,1.8vw,.9rem);color:var(--gold-lt);margin:0 0 6px;}
  .hero-content h1{font-family:'Bebas Neue',cursive;letter-spacing:5px;font-size:clamp(3.2rem,12vw,6.5rem);margin:6px 0;color:var(--gold-lt);text-shadow:0 0 18px rgba(212,175,55,.55), 0 0 40px rgba(198,40,40,.25);line-height:1;}
  .hero-sub{font-size:clamp(.95rem,2.4vw,1.2rem);color:var(--cream);opacity:.92;margin:6px 0 4px;}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.78rem,2vw,.95rem);color:var(--gold);margin-top:14px;border:1px solid var(--gold);display:inline-block;padding:8px 20px;border-radius:30px;background:rgba(11,61,46,.4);}

  section{max-width:820px;margin:0 auto;padding:64px 22px;text-align:center;position:relative;}
  h2{font-family:'Bebas Neue',cursive;letter-spacing:4px;text-transform:uppercase;font-size:clamp(1.6rem,4.5vw,2.3rem);color:var(--gold-lt);margin:0 0 30px;text-shadow:0 0 12px rgba(212,175,55,.3);}

  /* COUNTDOWN */
  .countdown-wrap{background:radial-gradient(ellipse at center, var(--green) 0%, var(--green-dk) 75%);border:2px solid var(--gold);border-radius:18px;padding:34px 20px;box-shadow:0 0 30px rgba(212,175,55,.25), inset 0 0 40px rgba(0,0,0,.4);}
  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:58px;}
  .cd-num{font-family:'Bebas Neue',cursive;font-size:clamp(1.8rem,5vw,2.6rem);color:var(--gold-lt);text-shadow:0 0 10px rgba(212,175,55,.5);}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:2px;color:var(--cream);opacity:.75;}

  /* PLAN + DRESS CODE */
  .felt-card{background:linear-gradient(160deg, var(--green) 0%, var(--green-dk) 100%);border:2px solid var(--gold);border-radius:16px;padding:clamp(24px,5vw,44px);box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 0 50px rgba(0,0,0,.25);position:relative;}
  .felt-card::before{content:"";position:absolute;inset:8px;border:1px dashed rgba(212,175,55,.5);border-radius:10px;pointer-events:none;}
  .plan-text{font-size:clamp(1rem,2.4vw,1.15rem);line-height:1.85;color:var(--cream);opacity:.95;}
  .dresscode{margin-top:26px;display:inline-flex;align-items:center;gap:10px;background:rgba(198,40,40,.18);border:1px solid var(--red);color:var(--gold-lt);padding:10px 22px;border-radius:30px;font-size:.92rem;letter-spacing:.5px;}

  /* LUGAR */
  .place-card{display:flex;flex-direction:column;gap:14px;align-items:center;}
  .place-name{font-family:'Bebas Neue',cursive;font-size:clamp(1.4rem,4vw,1.9rem);letter-spacing:2px;color:var(--gold-lt);}
  .maplink{display:inline-block;margin-top:6px;color:var(--night);background:var(--gold);text-decoration:none;letter-spacing:1px;font-size:.85rem;font-weight:600;padding:12px 26px;border-radius:30px;transition:transform .15s;}
  .maplink:hover{transform:translateY(-2px);}

  /* ORGANIZA */
  .organiza-names{font-size:clamp(1.2rem,3vw,1.6rem);color:var(--gold-lt);font-family:'Bebas Neue',cursive;letter-spacing:2px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid var(--gold);filter:saturate(1.05) contrast(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,5,8,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--gold);border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold-lt);font-size:2rem;cursor:pointer;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold-lt);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px;border:1px solid var(--gold);border-radius:8px;margin-top:5px;width:100%;background:#12120f;color:var(--cream);}
  .rsvp-form button{background:var(--red);color:#fff;border:0;padding:14px;border-radius:30px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-size:.88rem;font-weight:600;box-shadow:0 6px 18px rgba(198,40,40,.4);}
  .rsvp-form button:hover{background:#a91f1f;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold-lt);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--gold-lt);font-weight:bold;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--cream);opacity:.7;border-top:1px solid rgba(212,175,55,.3);}
  footer .motif-chip{margin:0 auto 14px;}

  @media (max-width:480px){
    .hero-motifs{gap:8px;}
    .countdown{gap:10px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-felt-border"></div>
    <div class="hero-content">
      <div class="hero-motifs">
        ${cardSVG("A", "spade")}
        ${diceSVG("", 6, 3)}
        ${cardSVG("K", "heart")}
      </div>
      <p class="eyebrow">Última noche de solteria/o</p>
      <h1>${esc(d.nombre)}</h1>
      <p class="hero-sub">Se apuesta todo — noche de casino</p>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  <section>
    ${neonDivider()}
    <h2>La cuenta regresiva</h2>
    <div class="countdown-wrap">${cd.html}</div>
  </section>

  <section>
    ${neonDivider()}
    <h2>El plan</h2>
    <div class="felt-card">
      <p class="plan-text">${esc(d.plan)}</p>
      ${d.dressCode ? `<div class="dresscode">${chipSVG("mini", "var(--gold)")} ${esc(d.dressCode)}</div>` : ""}
    </div>
  </section>

  <section>
    ${neonDivider()}
    <h2>Dónde se juega</h2>
    <div class="place-card">
      ${diceSVG("", 4, 2)}
      <p class="place-name">${esc(d.lugar)}</p>
      ${d.hora ? `<p style="opacity:.85;margin:0;">Encuentro ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section>
    ${neonDivider()}
    <h2>Organiza la banca</h2>
    <p class="organiza-names">${esc(d.organizadores)}</p>
  </section>

  <section>
    ${neonDivider()}
    <h2>Fotos de la previa</h2>
    ${gal.html}
  </section>

  <section>
    ${neonDivider()}
    <h2>Confirmá tu lugar en la mesa</h2>
    ${rsvp.html}
  </section>

  <footer>
    ${chipSVG("", "var(--red)")}
    Que gane la banca del amor — nos vemos en la mesa de ${esc(d.nombre)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Vegas Casino",
  summary: "Noche de casino en Las Vegas con paño verde, dorado y neón rojo, cartas, dados y fichas dibujadas a mano.",
  accent: "#d4af37", schema: despedidaSchema, sampleData, render,
};
