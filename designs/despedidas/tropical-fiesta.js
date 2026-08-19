const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");

const id = "desp-tropical-fiesta";

const sampleData = {
  nombre: "Euge",
  fecha: "2027-01-16",
  hora: "17:00",
  lugar: "Complejo La Bahía, Costa Esmeralda",
  direccionMapa: "https://maps.google.com/?q=Complejo+La+Bahia+Costa+Esmeralda",
  plan:
    "Arrancamos a las 17 hs con recepción junto a la pileta del complejo (traigan protector solar y ganas de bailar). A las 20 hs, asado con barra libre de tragos tropicales y música en vivo. Después de la cena, DJ hasta que el cuerpo aguante, con juegos, desafíos y sorpresas para la festejada. No puede faltar la remera de la despedida, ¡así que confirmen su talle al anotarse!",
  dressCode: "Total white o estampado tropical — nada de negro, ¡queremos playa y color!",
  organizadores: "Male, Sole y las chicas del grupo",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
  ],
};

// Motivos tropicales dibujados a mano en SVG inline (sol, hojas de palmera,
// olas) para no depender de ningún set de íconos externo.
const sunSVG = `<svg class="motif motif-sun" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="50" cy="50" r="19" fill="currentColor"/>
  <g stroke="currentColor" stroke-width="4.5" stroke-linecap="round">
    <line x1="50" y1="4" x2="50" y2="17"/>
    <line x1="50" y1="83" x2="50" y2="96"/>
    <line x1="4" y1="50" x2="17" y2="50"/>
    <line x1="83" y1="50" x2="96" y2="50"/>
    <line x1="17.5" y1="17.5" x2="26.5" y2="26.5"/>
    <line x1="73.5" y1="73.5" x2="82.5" y2="82.5"/>
    <line x1="82.5" y1="17.5" x2="73.5" y2="26.5"/>
    <line x1="26.5" y1="73.5" x2="17.5" y2="82.5"/>
  </g>
</svg>`;

function frondSVG(flip) {
  return `<svg class="motif motif-frond${flip ? " flip" : ""}" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 138 C 25 100, 30 58, 35 4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 20 C 8 13, -4 26, 1 41" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 42 C 6 37, -6 52, 0 68" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 64 C 8 61, -3 78, 3 94" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M33 25 C 57 17, 69 30, 64 45" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M33 47 C 58 41, 70 56, 63 72" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M33 69 C 56 66, 66 82, 59 96" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

const squiggleSVG = `<svg class="squiggle" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M2 9 C 12 -1, 22 19, 32 9 C 42 -1, 52 19, 62 9 C 72 -1, 82 19, 92 9 C 102 -1, 112 19, 118 9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const pinSVG = `<svg class="motif motif-pin" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 2 C 30 2, 38 10, 38 20 C 38 33, 20 50, 20 50 C 20 50, 2 33, 2 20 C 2 10, 10 2, 20 2 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="20" cy="20" r="7" stroke="currentColor" stroke-width="2.4"/>
</svg>`;

const glassSVG = `<svg class="motif motif-glass" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 4 H34 L20 30 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <line x1="20" y1="30" x2="20" y2="48" stroke="currentColor" stroke-width="2.4"/>
  <line x1="10" y1="50" x2="30" y2="50" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M13 11 C 16 15, 24 15, 27 11" stroke="currentColor" stroke-width="2"/>
</svg>`;

// Divisor en forma de ola, hecho a mano con curvas Bézier: se usa entre
// franjas de color para dar el efecto de playa/marea sin depender de
// imágenes externas.
function waveSep(prevColorVar, nextColorVar) {
  return `<div class="wave-sep" style="background:${nextColorVar}">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:${prevColorVar}">
      <path d="M0,40 C 220,92 380,2 600,46 C 820,90 980,8 1200,50 C 1320,72 1380,54 1440,44 L1440,100 L0,100 Z" fill="currentColor"/>
    </svg>
  </div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cdesp1");
  const gal = galleryWidget(d.galeria, "galesp1");
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
<title>Despedida de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --coral:#ff6b4a;
    --coral-dark:#e04b30;
    --turquoise:#00c2b8;
    --turquoise-dark:#009a92;
    --yellow:#ffd23f;
    --sand:#fffaf0;
    --tq-soft:#e2f8f6;
    --coral-soft:#ffe9e1;
    --yellow-soft:#fff6d8;
    --ink:#123c3c;
    --ink-soft:#4a6b6a;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Poppins',system-ui,sans-serif;background:var(--sand);color:var(--ink);}
  img{max-width:100%;}
  a{color:inherit;}
  h1,h2,h3{font-family:'Baloo 2',system-ui,sans-serif;}

  .motif{display:block;}
  .motif-sun{width:clamp(46px,9vw,72px);height:auto;color:var(--yellow);}
  .motif-sun.small{width:26px;flex:0 0 auto;}
  .motif-frond{width:clamp(46px,10vw,84px);height:auto;color:#fff;opacity:.85;}
  .motif-frond.flip{transform:scaleX(-1);}
  .motif-pin{width:30px;height:auto;color:var(--coral-dark);flex:0 0 auto;}
  .motif-glass{width:28px;height:auto;color:var(--turquoise-dark);flex:0 0 auto;}
  .squiggle{width:100px;height:14px;color:var(--yellow);}

  /* ---------- HERO ---------- */
  .hero{position:relative;min-height:92vh;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(200deg,rgba(255,107,74,.55),rgba(0,194,184,.55) 55%,rgba(18,60,60,.75));}
  .hero-corner{position:absolute;pointer-events:none;z-index:2;}
  .hero-corner.tl{top:10px;left:6px;}
  .hero-corner.tr{top:10px;right:6px;transform:scaleX(-1);}
  .hero-sun{position:absolute;top:22px;right:22px;z-index:2;}
  .hero-content{position:relative;z-index:2;color:#fff;text-align:center;max-width:640px;margin:0 auto;padding:120px 24px 64px;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-size:clamp(.68rem,1.8vw,.85rem);font-weight:600;color:var(--yellow);}
  .hero-content h1{font-size:clamp(3rem,11vw,6rem);font-weight:800;margin:10px 0 6px;line-height:1;text-shadow:0 6px 24px rgba(0,0,0,.25);}
  .hero-sub{font-size:clamp(.95rem,2.6vw,1.2rem);font-weight:500;opacity:.95;}
  .hero-date{display:inline-block;margin-top:18px;padding:8px 22px;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.65);border-radius:999px;letter-spacing:.12em;text-transform:uppercase;font-size:clamp(.72rem,2vw,.85rem);backdrop-filter:blur(2px);}

  .wave-sep{width:100%;line-height:0;overflow:hidden;}
  .wave-sep svg{display:block;width:100%;height:clamp(34px,7vw,78px);}

  section{padding:64px 22px;text-align:center;}
  .sec-inner{max-width:760px;margin:0 auto;}
  h2{font-weight:700;font-size:clamp(1.6rem,5vw,2.3rem);margin:0 0 8px;color:var(--ink);}
  .squiggle{margin:0 auto 26px;}
  .kicker{letter-spacing:.28em;text-transform:uppercase;font-size:.72rem;font-weight:600;color:var(--turquoise-dark);margin-bottom:6px;}

  /* ---------- COUNTDOWN ---------- */
  .sec-countdown{background:var(--sand);}
  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;flex-wrap:wrap;margin-top:14px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;min-width:64px;background:#fff;border-radius:18px;padding:14px 10px;box-shadow:0 10px 24px rgba(18,60,60,.08);}
  .cd-num{font-family:'Baloo 2',sans-serif;font-size:clamp(1.6rem,5vw,2.4rem);color:var(--coral-dark);line-height:1;}
  .cd-label{font-size:.66rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);margin-top:4px;}

  /* ---------- PLAN ---------- */
  .sec-plan{background:var(--tq-soft);}
  .plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;text-align:left;margin-top:10px;}
  .plan-card{background:#fff;border-radius:22px;padding:28px 26px;box-shadow:0 12px 30px rgba(0,154,146,.12);}
  .plan-card .head{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
  .plan-card h3{margin:0;font-size:1.15rem;color:var(--turquoise-dark);}
  .plan-card p{margin:0;line-height:1.75;color:var(--ink-soft);font-size:.98rem;}
  .plan-card.dress{background:linear-gradient(135deg,var(--coral),var(--coral-dark));color:#fff;}
  .plan-card.dress h3{color:#fff;}
  .plan-card.dress p{color:rgba(255,255,255,.92);}

  /* ---------- LUGAR ---------- */
  .sec-lugar{background:var(--coral-soft);}
  .lugar-card{display:inline-flex;flex-direction:column;align-items:center;gap:10px;background:#fff;border-radius:24px;padding:32px 34px;box-shadow:0 12px 30px rgba(224,75,48,.14);max-width:100%;}
  .lugar-card .lugar-nombre{font-family:'Baloo 2',sans-serif;font-size:clamp(1.2rem,3.4vw,1.5rem);color:var(--ink);}
  .lugar-card .lugar-hora{color:var(--ink-soft);font-size:.95rem;}
  .maplink{display:inline-block;margin-top:8px;padding:10px 24px;background:var(--coral-dark);color:#fff !important;text-decoration:none;border-radius:999px;font-weight:600;font-size:.88rem;letter-spacing:.02em;}

  /* ---------- ORGANIZA ---------- */
  .sec-organiza{background:var(--sand);}
  .organiza-names{font-family:'Baloo 2',sans-serif;font-size:clamp(1.3rem,3.6vw,1.7rem);color:var(--coral-dark);margin-top:4px;}

  /* ---------- GALERIA ---------- */
  .sec-gallery{background:var(--yellow-soft);}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:12px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:16px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(18,60,60,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* ---------- RSVP ---------- */
  .sec-rsvp{background:linear-gradient(160deg,var(--turquoise),var(--turquoise-dark));color:#fff;}
  .sec-rsvp h2, .sec-rsvp .kicker{color:#fff;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:16px auto 0;text-align:left;background:#fff;border-radius:24px;padding:28px 26px;box-shadow:0 16px 34px rgba(0,0,0,.18);}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-soft);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:11px 12px;border:1.5px solid #eadfca;border-radius:12px;margin-top:5px;width:100%;background:var(--sand);color:var(--ink);}
  .rsvp-form button{background:var(--coral);color:#fff;border:0;padding:14px;border-radius:999px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;font-size:.88rem;font-weight:700;}
  .rsvp-form button:hover{background:var(--coral-dark);}
  .rsvp-whatsapp{font-size:.85rem;color:var(--turquoise-dark);text-align:center;text-decoration:none;font-weight:600;}
  .rsvp-status{text-align:center;color:#2f9c65;font-weight:700;}

  /* ---------- FOOTER ---------- */
  footer{background:var(--ink);color:#fdf5e2;text-align:center;padding:48px 22px 40px;position:relative;overflow:hidden;}
  footer .foot-motifs{display:flex;justify-content:center;gap:18px;margin-bottom:14px;}
  footer p{margin:0;font-size:.9rem;opacity:.85;}
  footer .brand{font-family:'Baloo 2',sans-serif;font-size:1.1rem;color:var(--yellow);margin-bottom:4px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-corner tl">${frondSVG(false)}</div>
    <div class="hero-corner tr">${frondSVG(false)}</div>
    <div class="hero-sun">${sunSVG}</div>
    <div class="hero-content">
      <p class="eyebrow">Despedida de soltero/a</p>
      <h1>${esc(d.nombre)}</h1>
      <p class="hero-sub">¡Sol, playa y fiesta para despedir la soltería!</p>
      ${fechaLarga ? `<div class="hero-date">${esc(fechaLarga)}${d.hora ? ` · ${esc(d.hora)} hs` : ""}</div>` : ""}
    </div>
  </div>
  ${waveSep("#fff", "var(--sand)")}

  <section class="sec-countdown">
    <div class="sec-inner">
      <p class="kicker">Faltan solo</p>
      <h2>Cuenta regresiva para la playa</h2>
      ${squiggleSVG}
      ${cd.html}
    </div>
  </section>
  ${waveSep("var(--sand)", "var(--tq-soft)")}

  <section class="sec-plan">
    <div class="sec-inner">
      <p class="kicker">Agenda del día</p>
      <h2>El plan</h2>
      ${squiggleSVG}
      <div class="plan-grid">
        <div class="plan-card">
          <div class="head">${glassSVG}<h3>Itinerario</h3></div>
          <p>${esc(d.plan)}</p>
        </div>
        <div class="plan-card dress">
          <div class="head">${sunSVG.replace('class="motif motif-sun"', 'class="motif motif-sun small"')}<h3>Dress code</h3></div>
          <p>${esc(d.dressCode)}</p>
        </div>
      </div>
    </div>
  </section>
  ${waveSep("var(--tq-soft)", "var(--coral-soft)")}

  <section class="sec-lugar">
    <div class="sec-inner">
      <p class="kicker">Punto de encuentro</p>
      <h2>¿Dónde nos juntamos?</h2>
      ${squiggleSVG}
      <div class="lugar-card">
        ${pinSVG}
        <span class="lugar-nombre">${esc(d.lugar)}</span>
        ${d.hora ? `<span class="lugar-hora">Nos encontramos a las ${esc(d.hora)} hs</span>` : ""}
        ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
      </div>
    </div>
  </section>
  ${waveSep("var(--coral-soft)", "var(--sand)")}

  <section class="sec-organiza">
    <div class="sec-inner">
      <p class="kicker">Con mucho amor</p>
      <h2>Organiza</h2>
      ${squiggleSVG}
      <div class="organiza-names">${esc(d.organizadores)}</div>
    </div>
  </section>
  ${waveSep("var(--sand)", "var(--yellow-soft)")}

  <section class="sec-gallery">
    <div class="sec-inner">
      <p class="kicker">Previa</p>
      <h2>Momentos que nos esperan</h2>
      ${squiggleSVG}
      ${gal.html}
    </div>
  </section>
  ${waveSep("var(--yellow-soft)", "var(--turquoise)")}

  <section class="sec-rsvp">
    <div class="sec-inner">
      <p class="kicker">Última llamada</p>
      <h2>Confirmá tu lugar en la playa</h2>
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="foot-motifs">${frondSVG(false)}${sunSVG}${frondSVG(true)}</div>
    <p class="brand">Despedida de ${esc(d.nombre)}</p>
    <p>Organizado con cariño por ${esc(d.organizadores)}</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Tropical Fiesta",
  summary: "Invitación playera y colorida en coral, turquesa y amarillo, con olas, sol y hojas de palmera dibujadas a mano para despedidas veraniegas.",
  accent: "#ff6b4a", schema: despedidaSchema, sampleData, render,
};
