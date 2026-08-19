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
  mensaje: "Bajo las luces de la noche y al ritmo de una orquesta, queremos brindar con ustedes por el comienzo de esta nueva vida juntos. Los esperamos vestidos de gala para una noche inolvidable.",
  dressCode: "Riguroso de gala — negro y dorado",
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

// --- Motivos Art Decó dibujados a mano en SVG inline (sin dependencias externas) ---

function sunburstSVG(size = 90, color = "#c9a15a") {
  const rays = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n;
    const inner = 18;
    const outer = i % 2 === 0 ? 44 : 34;
    const x1 = 50 + inner * Math.cos(angle);
    const y1 = 50 + inner * Math.sin(angle);
    const x2 = 50 + outer * Math.cos(angle);
    const y2 = 50 + outer * Math.sin(angle);
    rays.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="1.4"/>`);
  }
  return `<svg class="deco-sunburst" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="10" fill="none" stroke="${color}" stroke-width="1.4"/>
    ${rays.join("")}
  </svg>`;
}

function fanSVG(width = 140, color = "#c9a15a") {
  const blades = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const angle = Math.PI * (i / n);
    const x = 70 - 66 * Math.cos(angle);
    const y = 70 - 66 * Math.sin(angle);
    blades.push(`<line x1="70" y1="70" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="${color}" stroke-width="1.2"/>`);
  }
  return `<svg class="deco-fan" width="${width}" height="${width * 0.55}" viewBox="0 0 140 76" aria-hidden="true">
    <path d="M4,70 A66,66 0 0 1 136,70" fill="none" stroke="${color}" stroke-width="1.4"/>
    ${blades.join("")}
    <path d="M20,70 A50,50 0 0 1 120,70" fill="none" stroke="${color}" stroke-width="1"/>
  </svg>`;
}

function chevronDividerSVG(width = 220, color = "#c9a15a") {
  return `<svg class="deco-chevron" width="${width}" height="26" viewBox="0 0 220 26" aria-hidden="true">
    <line x1="0" y1="13" x2="80" y2="13" stroke="${color}" stroke-width="1.2"/>
    <line x1="140" y1="13" x2="220" y2="13" stroke="${color}" stroke-width="1.2"/>
    <path d="M90,2 L110,13 L90,24" fill="none" stroke="${color}" stroke-width="1.4"/>
    <path d="M130,2 L110,13 L130,24" fill="none" stroke="${color}" stroke-width="1.4"/>
    <circle cx="110" cy="13" r="3" fill="${color}"/>
  </svg>`;
}

function cornerFrameSVG(color = "#c9a15a") {
  // esquina decorativa Art Decó reutilizada 4 veces con rotación via CSS
  return `<svg class="deco-corner" width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
    <path d="M2,2 L2,26 M2,2 L26,2" fill="none" stroke="${color}" stroke-width="2"/>
    <path d="M10,2 L10,16 M2,10 L16,10" fill="none" stroke="${color}" stroke-width="1"/>
    <path d="M2,2 L20,20" fill="none" stroke="${color}" stroke-width="1"/>
    <circle cx="30" cy="2" r="2" fill="${color}"/>
    <circle cx="2" cy="30" r="2" fill="${color}"/>
  </svg>`;
}

function starSVG(size = 22, color = "#c9a15a") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 1 L14.5 9 L23 9 L16 14.5 L18.5 23 L12 17.5 L5.5 23 L8 14.5 L1 9 L9.5 9 Z" fill="none" stroke="${color}" stroke-width="1"/>
  </svg>`;
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
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&amp;family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --black:#1a1410;
    --black2:#100c09;
    --gold:#c9a15a;
    --gold-light:#e6cf9e;
    --burgundy:#6b1f2a;
    --cream:#f2e9d8;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--black);color:var(--cream);font-family:'Cormorant Garamond',serif;line-height:1.6;}
  h1,h2,h3{font-family:'Cinzel',serif;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0;color:var(--gold-light);}
  a{color:var(--gold);}
  img{max-width:100%;display:block;}

  .deco-corner{position:absolute;opacity:.85;}
  .frame{position:relative;}
  .frame .deco-corner.tl{top:14px;left:14px;}
  .frame .deco-corner.tr{top:14px;right:14px;transform:scaleX(-1);}
  .frame .deco-corner.bl{bottom:14px;left:14px;transform:scaleY(-1);}
  .frame .deco-corner.br{bottom:14px;right:14px;transform:scale(-1,-1);}

  .hero{position:relative;min-height:clamp(480px,90vh,900px);display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(180deg,rgba(16,12,9,.45),rgba(16,12,9,.85)),url('${esc(d.coverImage)}') center/cover no-repeat;}
  .hero-content{position:relative;z-index:1;padding:24px;max-width:640px;}
  .hero-content .eyebrow{letter-spacing:6px;font-size:clamp(.7rem,1.6vw,.85rem);color:var(--gold);text-transform:uppercase;margin-bottom:18px;}
  .hero-content h1{font-size:clamp(2.2rem,7vw,4rem);color:#fff;}
  .hero-content .amp{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;color:var(--gold);font-size:clamp(1.4rem,4vw,2rem);text-transform:none;letter-spacing:0;margin:6px 0;}
  .hero-date{margin-top:22px;letter-spacing:3px;text-transform:uppercase;font-size:clamp(.85rem,2vw,1.05rem);color:var(--gold-light);}
  .hero .fan-top{margin:0 auto 10px;opacity:.9;}

  section{max-width:820px;margin:0 auto;padding:clamp(40px,7vw,80px) 24px;text-align:center;}
  .section-dark{background:var(--black2);}
  .section-burgundy{background:linear-gradient(180deg,var(--burgundy),#4a1520);}

  .chevron{margin:0 auto 26px;display:block;}
  h2{font-size:clamp(1.2rem,3vw,1.7rem);margin-bottom:8px;}
  .subtitle{color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:.75rem;margin-bottom:26px;}

  .message{font-size:clamp(1.1rem,2.4vw,1.35rem);font-style:italic;color:var(--gold-light);max-width:640px;margin:0 auto;}
  .fan-icon{margin:0 auto 20px;}

  .countdown{display:flex;gap:clamp(12px,3vw,32px);justify-content:center;flex-wrap:wrap;margin:30px 0 10px;}
  .countdown div{display:flex;flex-direction:column;min-width:60px;}
  .cd-num{font-family:'Cinzel',serif;font-size:clamp(1.6rem,5vw,2.6rem);color:var(--gold);}
  .cd-label{font-size:.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold-light);margin-top:4px;}

  .timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;margin-top:20px;text-align:left;}
  .timeline .card{position:relative;border:1px solid var(--gold);padding:30px 26px;background:rgba(201,161,90,.06);}
  .timeline .card h3{color:var(--gold);font-size:1.05rem;margin-bottom:10px;}
  .timeline .card p{margin:0;color:var(--cream);}
  .timeline .card .hora{display:block;color:var(--gold-light);font-family:'Cinzel',serif;font-size:1.3rem;letter-spacing:1px;margin-bottom:6px;}
  .map-link{display:inline-block;margin-top:24px;letter-spacing:1px;text-transform:uppercase;font-size:.85rem;border-bottom:1px solid var(--gold);padding-bottom:2px;}

  .badge-dresscode{display:inline-flex;align-items:center;gap:10px;margin-top:6px;border:1px solid var(--gold);padding:10px 22px;letter-spacing:1px;text-transform:uppercase;font-size:.8rem;color:var(--gold-light);}

  .gift-box{border:1px solid var(--gold);padding:34px 24px;max-width:420px;margin:0 auto;}
  .gift-box .alias{font-family:'Cinzel',serif;color:var(--gold);font-size:1.3rem;letter-spacing:1px;margin-top:10px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:24px;}
  .gallery img{width:100%;height:180px;object-fit:cover;cursor:pointer;border:1px solid var(--gold);filter:sepia(.12) saturate(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,7,5,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--gold);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--gold);font-size:2.2rem;cursor:pointer;line-height:1;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:26px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold-light);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:11px;border:1px solid var(--gold);background:rgba(255,255,255,.03);color:var(--cream);border-radius:2px;margin-top:5px;width:100%;}
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{background:var(--gold);color:var(--black2);border:0;padding:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:'Cinzel',serif;font-size:.85rem;}
  .rsvp-form button:hover{background:var(--gold-light);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--gold-light);font-weight:bold;}

  footer{text-align:center;padding:50px 24px;font-size:.85rem;color:#a8967a;background:var(--black2);}
  footer .foot-names{font-family:'Cinzel',serif;color:var(--gold);letter-spacing:2px;font-size:1rem;margin-top:10px;}
  footer .sun{margin:0 auto 16px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-content">
      ${fanSVG(150, "#e6cf9e")}
      <p class="eyebrow">Nos casamos</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
    </div>
  </div>

  <section class="section-dark">
    ${chevronDividerSVG(200, "#c9a15a")}
    <p class="subtitle">Cuenta regresiva</p>
    ${cd.html}
  </section>

  <section>
    <div class="fan-icon">${starSVG(26, "#c9a15a")}</div>
    <p class="message">${esc(d.mensaje)}</p>
  </section>

  <section class="section-burgundy">
    ${chevronDividerSVG(200, "#e6cf9e")}
    <h2>Cronograma de la noche</h2>
    <div class="timeline">
      <div class="card frame">
        ${cornerFrameSVG("#e6cf9e")}
        <h3>Ceremonia</h3>
        <span class="hora">${esc(d.horaCeremonia)}</span>
        <p>${esc(d.lugarCeremonia)}</p>
      </div>
      <div class="card frame">
        ${cornerFrameSVG("#e6cf9e")}
        <h3>Fiesta &amp; Gala</h3>
        <span class="hora">${esc(d.horaFiesta)}</span>
        <p>${esc(d.lugarFiesta)}</p>
      </div>
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    <div><span class="badge-dresscode">${starSVG(16, "#e6cf9e")} Dress code: ${esc(d.dressCode)}</span></div>
  </section>

  <section class="section-dark">
    ${sunburstSVG(90, "#c9a15a")}
    <h2>Un brindis por el amor</h2>
    <p class="subtitle">Mesa de regalos</p>
    <div class="gift-box">
      <p>Si quieren acompañarnos con un regalo, lo más lindo es un aporte para nuestra nueva vida juntos.</p>
      <p class="alias">Alias: ${esc(d.alias)}</p>
    </div>
  </section>

  <section>
    ${chevronDividerSVG(200, "#c9a15a")}
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section class="section-burgundy">
    ${chevronDividerSVG(200, "#e6cf9e")}
    <h2>Confirmá tu asistencia</h2>
    <p class="subtitle">Tu presencia es el mejor regalo</p>
    ${rsvp.html}
  </section>

  <footer>
    ${sunburstSVG(70, "#c9a15a")}
    <p>Con amor y toda la gala del mundo</p>
    <p class="foot-names">${esc(d.novia)} &amp; ${esc(d.novio)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Nocturna Glamour",
  summary: "Boda de noche estilo gala Art Decó, en negro, dorado y borgoña, con motivos geométricos dibujados a mano.",
  accent: "#c9a15a", schema: bodaSchema, sampleData, render,
};
