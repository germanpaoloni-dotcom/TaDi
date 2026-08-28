const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-pool-party";

const sampleData = {
  nombre: "Bruno",
  edad: "30",
  fecha: "2027-01-23",
  hora: "13:30",
  lugar: "Casa de Bruno, Nordelta",
  direccionMapa: "https://maps.google.com/?q=Nordelta+Buenos+Aires",
  mensaje: "Cumplo 30 y lo quiero festejar como se debe: pileta, buena música, tragos fríos y toda la gente que quiero. Traigan malla, protector solar y ganas de mojarse.",
  dressCode: "Malla y ropa de verano, se sube a la pileta sí o sí",
  whatsapp: "5491100000070",
  fechaLimiteRSVP: "2027-01-16",
  coverImage: "https://images.unsplash.com/photo-1780631742148-13fe417205d9?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1752435465708-4872db65303b?w=800&q=80",
    "https://images.unsplash.com/photo-1785870467643-310877fa7cd1?w=800&q=80",
    "https://images.unsplash.com/photo-1760754726327-e89d00f6283a?w=800&q=80",
  ],
};

// ---------- Motivos dibujados a mano en SVG inline (sin íconos externos) ----------
// Un flotador/dona de pileta: dos círculos concéntricos con "gajos" a rayas
// alrededor del aro, como los flotadores inflables de verano.
function floatieSVG(uid) {
  const gajos = Array.from({ length: 10 })
    .map((_, i) => {
      const fill = i % 2 === 0 ? "#ffffff" : "currentColor";
      return `<rect x="-9" y="-60" width="18" height="26" rx="9" fill="${fill}" opacity="${i % 2 === 0 ? ".92" : "1"}" transform="rotate(${i * 36})"/>`;
    })
    .join("");
  return `<svg class="motif motif-floatie" viewBox="-70 -70 140 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="0" cy="0" r="63" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/>
    <g>${gajos}</g>
    <circle cx="0" cy="0" r="63" fill="none" stroke="currentColor" stroke-width="4"/>
    <circle cx="0" cy="0" r="25" fill="#eaf9fb" stroke="currentColor" stroke-width="4"/>
  </svg>`;
}

// Un par de anteojos de sol bien redondeados, con un brillito en cada lente.
function sunniesSVG() {
  return `<svg class="motif motif-sunnies" viewBox="0 0 150 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0 16 L10 12" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M150 16 L140 12" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M46 20 C56 8 94 8 104 20" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <rect x="8" y="18" width="42" height="32" rx="16" fill="currentColor"/>
    <rect x="100" y="18" width="42" height="32" rx="16" fill="currentColor"/>
    <path d="M18 28 q8 -8 18 -3" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M110 28 q8 -8 18 -3" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}

// Sombrillita de trago (paper umbrella): abanico con costillas + palito.
function umbrellaSVG() {
  return `<svg class="motif motif-umbrella" viewBox="0 0 60 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 32 C3 10 57 10 57 32 Z" fill="currentColor"/>
    <path d="M3 32 L13 25 L23 32 L30 25 L37 32 L47 25 L57 32" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".75" stroke-linecap="round"/>
    <circle cx="30" cy="18" r="3" fill="#ffffff" opacity=".8"/>
    <line x1="30" y1="32" x2="30" y2="70" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 70 C23 70 18 65 18 60" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// Ondas de agua, para separadores de sección.
function wavesSVG(extraClass) {
  return `<svg class="motif motif-waves${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0 13 Q 12.5 4 25 13 T 50 13 T 75 13 T 100 13 T 125 13 T 150 13 T 175 13 T 200 13" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${wavesSVG()}${floatieSVG().replace("motif-floatie", "motif-floatie motif-floatie-small")}${wavesSVG("flip")}</div>`;
}

// ---------- Reflejos de sol temblando sobre el agua ----------
// Manchas de luz ovaladas y difusas que se desplazan despacio en horizontal
// (con un leve vaivén vertical) y pulsan de opacidad, como el brillo del sol
// temblando sobre la superficie de una pileta. Las posiciones/duraciones
// están fijas a mano (no dependen de datos del usuario).
const GLINTS = [
  { top: "6%", left: "8%", w: "180px", h: "70px", dx: "40px", dy: "10px", dur: 7.5, delay: 0 },
  { top: "18%", left: "62%", w: "140px", h: "56px", dx: "-34px", dy: "8px", dur: 6.2, delay: 1.1 },
  { top: "34%", left: "24%", w: "210px", h: "80px", dx: "50px", dy: "-12px", dur: 8.4, delay: 2 },
  { top: "50%", left: "72%", w: "160px", h: "64px", dx: "-44px", dy: "12px", dur: 7, delay: .6 },
  { top: "64%", left: "10%", w: "150px", h: "58px", dx: "36px", dy: "-8px", dur: 6.8, delay: 2.8 },
  { top: "78%", left: "48%", w: "200px", h: "76px", dx: "-46px", dy: "10px", dur: 9, delay: 1.6 },
  { top: "90%", left: "80%", w: "130px", h: "52px", dx: "30px", dy: "-9px", dur: 5.6, delay: 3.4 },
];

function sunGlintsHTML() {
  return `<div class="sun-glints" aria-hidden="true">${GLINTS.map(
    (g) =>
      `<div class="glint" style="top:${g.top};left:${g.left};width:${g.w};height:${g.h};--dx:${g.dx};--dy:${g.dy};animation-duration:${g.dur}s;animation-delay:${g.delay}s;"></div>`
  ).join("")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#17a3b8");
  const accent2 = "#f2c14e";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "13:30"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-pool");
  const gal = galleryWidget(d.galeria, "gal-pool");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "cumpleanos", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  const momentos = [
    { titulo: "Llegada y primer trago", detalle: "Nos recibimos con algo fresco en la mano, música suave de fondo y toallas a mano para cuando a alguien no le aguanten las ganas de tirarse." },
    { titulo: "A la pileta", detalle: "Malla puesta y protector solar aplicado: es hora de meterse de lleno, jugar y refrescarse a pleno sol." },
    { titulo: "Picoteo bajo el sol", detalle: "Salimos un rato del agua para comer algo rico bajo la sombrilla, sin dejar de mojarnos los pies." },
    { titulo: "Atardecer y after en la reposera", detalle: "Cuando el sol empieza a bajar seguimos en las reposeras, con más música y la fiesta que no para." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --water:${accent};
    --water-deep:color-mix(in srgb, ${accent}, black 28%);
    --water-light:color-mix(in srgb, ${accent}, white 35%);
    --water-pale:color-mix(in srgb, ${accent}, white 70%);
    --lemon:${accent2};
    --lemon-soft:color-mix(in srgb, ${accent2}, white 45%);
    --ink:#0b3a42;
    --ink-soft:#3f6a70;
    --cream:#fffaf0;
    --panel:rgba(255,255,255,.94);
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Nunito',system-ui,sans-serif;font-weight:600;color:var(--cream);
    background:linear-gradient(160deg, var(--water-light) 0%, var(--water) 45%, var(--water-deep) 100%);position:relative;}
  img{max-width:100%;}
  a{color:inherit;}
  h1,h2,h3{font-family:'Baloo 2','Nunito',system-ui,sans-serif;font-weight:800;}

  /* ---------- Reflejos de sol sobre el agua ---------- */
  .sun-glints{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;}
  .glint{position:absolute;border-radius:50%;background:radial-gradient(circle, rgba(255,255,255,.6), transparent 70%);
    filter:blur(6px);transform:scaleY(.4);opacity:.28;
    animation-name:glintDrift;animation-timing-function:ease-in-out;animation-iteration-count:infinite;}
  @keyframes glintDrift{
    0%{transform:translate(0,0) scaleY(.4);opacity:.2;}
    25%{opacity:.6;}
    50%{transform:translate(var(--dx),var(--dy)) scaleY(.4);opacity:.85;}
    75%{opacity:.5;}
    100%{transform:translate(0,0) scaleY(.4);opacity:.2;}
  }
  @media (prefers-reduced-motion: reduce){
    .glint{animation:none !important;opacity:.4;}
  }

  .site{position:relative;z-index:1;}

  .motif{color:var(--lemon);}
  .motif-floatie{width:clamp(64px,16vw,110px);height:auto;}
  .motif-floatie-small{width:clamp(46px,11vw,64px);}
  .motif-sunnies{width:clamp(70px,16vw,110px);height:auto;}
  .motif-umbrella{width:clamp(46px,11vw,64px);height:auto;}
  .motif-waves{width:clamp(56px,15vw,120px);height:auto;flex:1 1 auto;color:var(--cream);}
  .motif-waves.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 28px;}

  /* ---------- HERO ---------- */
  .hero{position:relative;min-height:96vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,163,184,.15) 0%,rgba(23,163,184,.4) 55%,rgba(13,116,132,.82) 100%);}
  .hero-glints{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;}
  .hero-motif{position:absolute;z-index:2;opacity:.92;filter:drop-shadow(0 8px 16px rgba(0,60,70,.25));}
  .hero-motif.tl{top:4%;left:-4%;}
  .hero-motif.br{bottom:6%;right:-2%;transform:rotate(-8deg);}
  .hero-panel{position:relative;z-index:3;max-width:560px;width:100%;background:var(--panel);border-radius:32px;padding:clamp(30px,7vw,48px) clamp(24px,6vw,40px);box-shadow:0 20px 50px rgba(6,60,68,.28);color:var(--ink);}
  .eyebrow{letter-spacing:.28em;text-transform:uppercase;font-weight:800;font-size:clamp(.68rem,1.8vw,.82rem);color:var(--water);margin:0 0 10px;}
  .hero-panel h1{font-size:clamp(2.4rem,9vw,4rem);margin:0 0 6px;line-height:1;color:var(--ink);}
  .hero-age{display:inline-block;margin:8px 0 16px;padding:8px 26px;border-radius:999px;background:var(--lemon);color:var(--ink);font-weight:800;font-size:clamp(1rem,3vw,1.3rem);}
  .hero-date{display:inline-block;padding:9px 22px;border-radius:999px;background:var(--water-pale);color:var(--water-deep);letter-spacing:.03em;font-weight:800;font-size:clamp(.78rem,2.2vw,.92rem);}

  section{max-width:760px;margin:0 auto;padding:66px 24px;text-align:center;position:relative;z-index:1;}
  h2{font-weight:800;font-size:clamp(1.4rem,4vw,2rem);color:var(--cream);margin:0 0 30px;text-shadow:0 4px 14px rgba(6,60,68,.25);}

  .quote-wrap{max-width:600px;margin:0 auto;background:var(--panel);border-radius:26px;padding:clamp(24px,5vw,36px);color:var(--ink);box-shadow:0 14px 30px rgba(6,60,68,.2);}
  .quote-wrap p{font-size:clamp(1rem,2.4vw,1.18rem);line-height:1.75;margin:0;font-weight:700;}

  .countdown{display:flex;gap:clamp(10px,3.5vw,20px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:70px;background:var(--panel);border-radius:20px;padding:16px 12px;box-shadow:0 10px 22px rgba(6,60,68,.2);}
  .cd-num{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:clamp(1.7rem,5vw,2.4rem);line-height:1;color:var(--water-deep);}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--ink-soft);margin-top:6px;font-weight:800;}

  .agenda{list-style:none;margin:0;padding:0;max-width:520px;margin:0 auto;text-align:left;position:relative;}
  .agenda::before{content:"";position:absolute;left:19px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg, var(--lemon), transparent);}
  .agenda li{position:relative;padding:0 0 34px 58px;}
  .agenda li:last-child{padding-bottom:0;}
  .agenda-num{position:absolute;left:0;top:-2px;width:42px;height:42px;border-radius:50%;background:var(--lemon);display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;color:var(--ink);font-size:1.05rem;box-shadow:0 6px 16px rgba(6,60,68,.25);}
  .agenda h3{margin:2px 0 6px;font-size:1.08rem;font-weight:800;color:var(--cream);letter-spacing:.2px;}
  .agenda p{margin:0;color:rgba(255,250,240,.85);line-height:1.6;font-size:.92rem;font-weight:600;}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:var(--panel);box-shadow:0 14px 30px rgba(6,60,68,.22);padding:32px;border-radius:26px;text-align:center;color:var(--ink);}
  .venue-card h3{margin:0 0 10px;font-weight:800;letter-spacing:.3px;color:var(--water-deep);font-size:1.2rem;}
  .venue-card p{margin:0 0 6px;line-height:1.7;color:var(--ink-soft);font-weight:700;}
  .maplink{display:inline-block;margin-top:16px;padding:11px 24px;border-radius:999px;background:var(--water);color:#fff !important;text-decoration:none;font-weight:800;font-size:.86rem;box-shadow:0 8px 18px rgba(6,60,68,.2);}
  .dresscode-row{margin-top:18px;padding-top:16px;border-top:2px dashed color-mix(in srgb, var(--water) 35%, transparent);}
  .dresscode-row .label{display:block;letter-spacing:1.6px;text-transform:uppercase;font-size:.66rem;font-weight:800;color:var(--water-deep);margin-bottom:6px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery-item{border-radius:20px;overflow:hidden;box-shadow:0 10px 22px rgba(6,60,68,.2);}
  .gallery img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(6,40,46,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:16px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;background:var(--panel);border-radius:26px;padding:28px 26px;color:var(--ink);box-shadow:0 14px 30px rgba(6,60,68,.22);}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);font-weight:800;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Nunito',sans-serif;padding:11px;border:2px solid color-mix(in srgb, var(--water) 20%, transparent);border-radius:14px;margin-top:5px;width:100%;background:#fff;color:var(--ink);}
  .rsvp-form button{background:var(--lemon);color:var(--ink);border:0;padding:14px;border-radius:999px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-size:.84rem;font-weight:800;box-shadow:0 10px 20px rgba(242,193,78,.4);transition:filter .2s;}
  .rsvp-form button:hover{filter:brightness(1.06);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--water-deep);text-align:center;text-decoration:none;font-weight:800;}
  .rsvp-status{text-align:center;color:var(--water-deep);font-weight:800;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--cream);position:relative;z-index:1;}
  footer .motif-umbrella{width:34px;height:auto;margin:0 auto 14px;}
</style></head>
<body>
${sunGlintsHTML()}
<div class="site">

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-glints">${GLINTS.slice(0, 4)
      .map(
        (g) =>
          `<div class="glint" style="top:${g.top};left:${g.left};width:${g.w};height:${g.h};--dx:${g.dx};--dy:${g.dy};animation-duration:${g.dur}s;animation-delay:${g.delay}s;"></div>`
      )
      .join("")}</div>
    <div class="hero-motif tl">${sunniesSVG()}</div>
    <div class="hero-motif br">${floatieSVG()}</div>
    <div class="hero-panel">
      <p class="eyebrow">Pool Party</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">Cumple ${esc(d.edad)}</div>` : ""}
      ${fechaLarga ? `<div class="hero-date">${esc(fechaLarga)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>` : ""}
    </div>
  </div>

  ${d.mensaje ? `
  <section>
    ${divider()}
    <div class="quote-wrap"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Faltan para tirarnos al agua</h2>
    ${cd.html}
  </section>

  <section>
    ${divider()}
    <h2>Así va a ser el día</h2>
    <ol class="agenda">
      ${momentos.map((m, i) => `<li><span class="agenda-num">${i + 1}</span><h3>${esc(m.titulo)}</h3><p>${esc(m.detalle)}</p></li>`).join("")}
    </ol>
  </section>

  ${(d.lugar || d.hora || d.direccionMapa || d.dressCode) ? `
  <section>
    ${divider()}
    <h2>Dónde y cuándo</h2>
    <div class="venue-grid">
      <div class="venue-card">
        ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
        <p>${d.hora ? `Te esperamos a las ${esc(d.hora)} hs` : "Horario a confirmar"}</p>
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
        ${d.dressCode ? `<div class="dresscode-row"><span class="label">Dress code</span><p>${esc(d.dressCode)}</p></div>` : ""}
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${divider()}
    <h2>Momentos al sol</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.9;color:var(--lemon);font-weight:800;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${umbrellaSVG()}
    Nos vemos en la pileta, ${esc(d.nombre)} — ¡traé malla!
  </footer>

</div>
  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, color-mix(in srgb, ${d.accent}, white 35%) 0%, ${d.accent} 55%, color-mix(in srgb, ${d.accent}, black 25%) 100%);">
    <svg viewBox="-70 -70 140 140" width="46" height="46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="0" cy="0" r="63" fill="none" stroke="${d.accent2}" stroke-width="4"/>
      <circle cx="0" cy="0" r="25" fill="#eaf9fb" stroke="${d.accent2}" stroke-width="4"/>
    </svg>
    <div style="font-family:Verdana,Arial,sans-serif;font-weight:800;font-size:1.15rem;color:#fffaf0;line-height:1.1;text-shadow:0 2px 6px rgba(0,40,46,.3);">${esc(d.name)}</div>
    <div style="font-family:Verdana,Arial,sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:${d.accent2};">pool party</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Pool Party",
  summary: "Turquesa y limón bien luminosos, con reflejos de sol temblando despacio sobre el agua — una pool party de mediodía para festejar a puro sol.",
  accent: "#17a3b8", accent2: "#f2c14e", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
