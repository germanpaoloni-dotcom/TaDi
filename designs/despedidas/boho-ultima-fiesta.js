const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");

const id = "desp-boho-ultima-fiesta";

const sampleData = {
  nombre: "Caro",
  fecha: "2027-03-13",
  hora: "18:30",
  lugar: "Quinta El Ombú, Ruta 6 km 42, Luján",
  direccionMapa: "https://maps.google.com/?q=Quinta+El+Ombu+Lujan",
  plan: "Nos juntamos temprano para armar el fuego, picar algo rico al sol y brindar mientras cae la tarde. Después asado a las brasas, música en vivo, fogata y baile hasta que el cuerpo aguante. Última fiesta de solteras/os antes del gran sí, ¡así que vengan con toda la energía!",
  dressCode: "Boho casual, colores tierra: terracota, mostaza, verde salvia y blanco crudo. Nada de tacos, el piso es de pasto.",
  organizadores: "Male, Flor y Justi",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    "https://images.unsplash.com/photo-1504387103978-e4ee71416c38?w=800&q=80",
  ],
};

// Motivos boho dibujados a mano en SVG inline: arco de atardecer, hojas
// orgánicas, luna y líneas sueltas. Sin depender de íconos externos.
function archSunSVG() {
  return `<svg class="motif motif-arch" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 150 V70 C10 25, 55 6, 110 6 C165 6, 210 25, 210 70 V150" stroke="currentColor" stroke-width="2.4"/>
    <path d="M28 150 V78 C28 40, 63 22, 110 22 C157 22, 192 40, 192 78 V150" stroke="currentColor" stroke-width="1.2" opacity=".6"/>
    <circle cx="110" cy="38" r="14" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

function leafSVG(flip) {
  return `<svg class="motif motif-leaf${flip ? " flip" : ""}" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 4 C 52 22, 52 60, 30 96 C 8 60, 8 22, 30 4 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M30 12 V88" stroke="currentColor" stroke-width="1" opacity=".7"/>
    <path d="M30 30 C 22 34, 16 40, 14 48" stroke="currentColor" stroke-width="1" opacity=".7"/>
    <path d="M30 48 C 38 52, 44 58, 46 66" stroke="currentColor" stroke-width="1" opacity=".7"/>
    <path d="M30 66 C 22 70, 17 76, 16 82" stroke="currentColor" stroke-width="1" opacity=".7"/>
  </svg>`;
}

function moonSVG() {
  return `<svg class="motif motif-moon" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M38 6 C 22 6, 9 19, 9 35 C 9 51, 22 54, 30 54 C 15 47, 15 15, 38 6 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="50" cy="12" r="1.6" fill="currentColor"/>
    <circle cx="44" cy="22" r="1" fill="currentColor"/>
  </svg>`;
}

function wavySVG() {
  return `<svg class="motif motif-wave" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 10 C 20 -2, 35 22, 52 10 C 69 -2, 84 22, 101 10 C 118 -2, 133 22, 150 10 C 167 -2, 182 22, 198 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

function sunburstSVG() {
  const rays = Array.from({ length: 12 }).map((_, i) => {
    const a = (i * Math.PI * 2) / 12;
    const x1 = 50 + Math.cos(a) * 24;
    const y1 = 50 + Math.sin(a) * 24;
    const x2 = 50 + Math.cos(a) * 34;
    const y2 = 50 + Math.sin(a) * 34;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`;
  }).join("");
  return `<svg class="motif motif-sunburst" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="18" stroke="currentColor" stroke-width="1.6"/>
    ${rays}
  </svg>`;
}

function divider() {
  return `<div class="divider">${wavySVG()}${moonSVG()}${wavySVG()}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "19:00"}:00` : sampleData.fecha, "cd-boho");
  const gal = galleryWidget(d.galeria, "gal-boho");
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
<title>Última fiesta de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Marcellus&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --terracota:#c9704f;
    --terracota-dark:#a1583b;
    --salvia:#8a9a6b;
    --salvia-dark:#6c7c50;
    --crema:#f4ede0;
    --crema2:#ece1cd;
    --ink:#4a3b2f;
    --ink-soft:#7a6a57;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--crema);color:var(--ink);line-height:1.5;}
  img{max-width:100%;display:block;}
  h1,h2,h3{font-family:'Marcellus',serif;font-weight:400;}
  .script-word{font-family:'Caveat',cursive;}

  .motif{color:var(--terracota);}
  .motif-arch{width:100%;height:auto;color:var(--crema);}
  .motif-leaf{width:clamp(26px,6vw,40px);height:auto;color:var(--salvia);}
  .motif-leaf.flip{transform:scaleX(-1);}
  .motif-moon{width:clamp(22px,5vw,30px);height:auto;color:var(--terracota);flex:0 0 auto;}
  .motif-wave{width:clamp(50px,14vw,90px);height:14px;color:var(--terracota-dark);opacity:.6;flex:0 0 auto;}
  .motif-sunburst{width:clamp(34px,8vw,50px);height:auto;color:var(--terracota);}
  .divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto 26px;}

  /* ---------- HERO ---------- */
  .hero{position:relative;min-height:92vh;display:flex;align-items:flex-end;justify-content:center;text-align:center;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(74,59,47,.18) 0%,rgba(74,59,47,.15) 40%,rgba(41,30,22,.78) 100%);}
  .hero-arch{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(92vw,640px);z-index:1;pointer-events:none;}
  .hero-content{position:relative;z-index:2;color:#fbf5ea;padding:0 24px clamp(48px,9vh,90px);max-width:600px;}
  .hero-content .motif-leaf{color:#e9dcc4;margin:0 10px;}
  .hero-leaves{display:flex;justify-content:center;margin-bottom:10px;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.78rem);opacity:.92;}
  .hero-content h1{font-size:clamp(2.8rem,9vw,5rem);margin:12px 0 8px;letter-spacing:1px;}
  .hero-content .sub{font-family:'Caveat',cursive;font-size:clamp(1.4rem,4vw,2rem);color:#f0d9c4;margin:0 0 14px;}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.72rem,2vw,.88rem);color:#f0d9c4;}

  section{max-width:760px;margin:0 auto;padding:clamp(50px,9vw,80px) 24px;text-align:center;position:relative;}
  h2{letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.1rem,2.8vw,1.5rem);color:var(--terracota-dark);margin:0 0 30px;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{display:flex;gap:clamp(14px,4vw,30px);justify-content:center;margin:10px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:60px;background:#fff8ee;border:1px solid var(--crema2);border-radius:14px;padding:14px 10px;box-shadow:0 4px 14px rgba(169,88,59,.08);}
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.6rem,4.4vw,2.3rem);color:var(--terracota-dark);}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);margin-top:2px;}

  /* ---------- PLAN / DRESS CODE ---------- */
  .plan-card{background:#fff8ee;border:1px solid var(--crema2);border-radius:22px;padding:clamp(28px,6vw,44px);position:relative;overflow:hidden;}
  .plan-card::before{content:"";position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(201,112,79,.14),transparent 70%);}
  .plan-text{font-size:clamp(1rem,2.4vw,1.15rem);line-height:1.85;color:var(--ink-soft);position:relative;z-index:1;}
  .dress-row{margin-top:26px;padding-top:22px;border-top:1px dashed var(--terracota);display:flex;flex-direction:column;gap:6px;align-items:center;position:relative;z-index:1;}
  .dress-label{letter-spacing:2px;text-transform:uppercase;font-size:.7rem;color:var(--salvia-dark);}
  .dress-text{font-family:'Caveat',cursive;font-size:clamp(1.3rem,3.4vw,1.6rem);color:var(--ink);max-width:460px;}

  /* ---------- LUGAR ---------- */
  .lugar-card{display:flex;flex-direction:column;align-items:center;gap:14px;}
  .lugar-name{font-family:'Marcellus',serif;font-size:clamp(1.3rem,3.4vw,1.7rem);color:var(--ink);}
  .lugar-hora{font-size:.95rem;color:var(--ink-soft);}
  .maplink{display:inline-flex;align-items:center;gap:8px;margin-top:10px;color:#fff;background:var(--salvia-dark);text-decoration:none;padding:12px 26px;border-radius:999px;letter-spacing:.5px;font-size:.9rem;transition:background .2s;}
  .maplink:hover{background:var(--terracota-dark);}

  /* ---------- ORGANIZA ---------- */
  .organiza-text{font-family:'Caveat',cursive;font-size:clamp(1.5rem,4vw,2rem);color:var(--terracota-dark);}

  /* ---------- GALLERY ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:16px;cursor:pointer;filter:saturate(1.05) sepia(.06);transition:transform .25s;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(41,30,22,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fbf5ea;font-size:2rem;cursor:pointer;}

  /* ---------- RSVP ---------- */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px 12px;border:1px solid var(--crema2);border-radius:10px;margin-top:5px;width:100%;background:#fff8ee;color:var(--ink);}
  .rsvp-form button{background:var(--terracota);color:#fff;border:0;padding:14px;border-radius:999px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;font-size:.85rem;transition:background .2s;}
  .rsvp-form button:hover{background:var(--terracota-dark);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--salvia-dark);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--salvia-dark);font-weight:600;}

  footer{text-align:center;padding:44px 24px 56px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid var(--crema2);}
  footer .motif-sunburst{margin:0 auto 12px;}
  footer .script-word{font-size:1.2rem;color:var(--terracota-dark);}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-arch">${archSunSVG()}</div>
    <div class="hero-content">
      <div class="hero-leaves">${leafSVG(false)}${leafSVG(true)}</div>
      <p class="eyebrow">Última fiesta juntos</p>
      <h1>${esc(d.nombre)}</h1>
      <p class="sub script-word">antes del gran sí</p>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</p>` : ""}
    </div>
  </div>

  <section>
    ${divider()}
    <h2>Faltan</h2>
    ${cd.html}
  </section>

  <section>
    ${divider()}
    <h2>El plan</h2>
    <div class="plan-card">
      <p class="plan-text">${esc(d.plan)}</p>
      ${d.dressCode ? `
      <div class="dress-row">
        <span class="dress-label">Dress code</span>
        <span class="dress-text">${esc(d.dressCode)}</span>
      </div>` : ""}
    </div>
  </section>

  <section>
    ${divider()}
    <h2>Dónde nos juntamos</h2>
    <div class="lugar-card">
      ${sunburstSVG()}
      <p class="lugar-name">${esc(d.lugar)}</p>
      ${d.hora ? `<p class="lugar-hora">Nos encontramos desde las ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section>
    ${divider()}
    <h2>Organiza</h2>
    <p class="organiza-text script-word">${esc(d.organizadores)}</p>
  </section>

  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    ${divider()}
    <h2>Confirmá tu lugar</h2>
    ${rsvp.html}
  </section>

  <footer>
    ${sunburstSVG()}
    <p class="script-word">Nos vemos al atardecer ✧</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Boho Última Fiesta",
  summary: "Invitación boho de atardecer en terracota, salvia y crema, con arcos y hojas dibujados a mano para la última fiesta juntos antes del gran día.",
  accent: "#c9704f", schema: despedidaSchema, sampleData, render,
};
