const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-asadito-fernet";

const sampleData = {
  nombre: "Nacho",
  edad: "35",
  fecha: "2027-03-14",
  hora: "13:00",
  lugar: "Quinta de la familia, Pilar",
  direccionMapa: "https://maps.google.com/?q=Pilar+Buenos+Aires",
  mensaje: "Cumplo 35 y quiero festejarlo como se debe: con un buen asado, fernet bien cargado y la gente que quiero. Traigan hambre y ganas de quedarse hasta tarde.",
  dressCode: "Cómodo, de entrecasa — nada de vestirse elegante para el asado",
  whatsapp: "5491100000068",
  fechaLimiteRSVP: "2027-03-07",
  coverImage: "https://images.unsplash.com/photo-1749429600130-d799b74f0a72?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1697654762049-2d4362af8fc5?w=800&q=80",
    "https://images.unsplash.com/photo-1613425660663-c9b3a17af241?w=800&q=80",
    "https://images.unsplash.com/photo-1602613308947-dc3e5a026270?w=800&q=80",
  ],
};

// Motivos de asado dibujados a mano en SVG inline: una parrilla criolla con
// brasas, cubiertos de asado cruzados y una botella de fernet junto al vaso
// con hielo, en vez de las copas de champagne de la línea de gala.
const parrillaSVG = `<svg class="motif motif-parrilla" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="30" y1="14" x2="70" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <line x1="70" y1="14" x2="30" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <line x1="150" y1="14" x2="190" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <line x1="190" y1="14" x2="150" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <rect x="20" y="62" width="180" height="14" rx="3" stroke="currentColor" stroke-width="2.4"/>
  <line x1="36" y1="62" x2="36" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="56" y1="62" x2="56" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="76" y1="62" x2="76" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="96" y1="62" x2="96" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="116" y1="62" x2="116" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="136" y1="62" x2="136" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="156" y1="62" x2="156" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <line x1="176" y1="62" x2="176" y2="76" stroke="currentColor" stroke-width="1.6"/>
  <ellipse cx="60" cy="94" rx="10" ry="4" fill="#ff6b35" opacity=".85"/>
  <ellipse cx="90" cy="98" rx="13" ry="4.4" fill="#ffb347" opacity=".8"/>
  <ellipse cx="125" cy="97" rx="11" ry="4" fill="#ff6b35" opacity=".75"/>
  <ellipse cx="155" cy="93" rx="9" ry="3.6" fill="#ffb347" opacity=".8"/>
</svg>`;

const cuchilloTenedorSVG = `<svg class="motif motif-cubiertos" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g transform="rotate(-40 50 50)">
    <line x1="50" y1="10" x2="50" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 10 L44 26 M50 10 L50 26 M56 10 L56 26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <g transform="rotate(40 50 50)">
    <path d="M50 8 C58 8 60 20 54 30 L52 46 L48 46 L46 30 C40 20 42 8 50 8 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
    <line x1="50" y1="46" x2="50" y2="88" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

const bottleGlassSVG = `<svg class="motif motif-bottleglass" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g>
    <path d="M34 6 h10 v10 l6 8 v58 a6 6 0 0 1 -6 6 h-10 a6 6 0 0 1 -6 -6 v-58 l6 -8 z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="34" y="30" width="10" height="24" fill="currentColor" opacity=".22"/>
    <line x1="30" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1"/>
    <line x1="30" y1="46" x2="48" y2="46" stroke="currentColor" stroke-width="1"/>
  </g>
  <g transform="translate(66 20)">
    <path d="M10 4 L50 4 L42 74 Q30 80 18 74 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="20" y="16" width="12" height="12" rx="1.6" fill="currentColor" opacity=".18" stroke="currentColor" stroke-width="1" transform="rotate(-10 26 22)"/>
    <rect x="30" y="30" width="10" height="10" rx="1.6" fill="currentColor" opacity=".18" stroke="currentColor" stroke-width="1" transform="rotate(8 35 35)"/>
  </g>
</svg>`;

// Vaso de fernet con hielo, usado como base fija (no currentColor en el
// líquido) para el widget de burbujas que sube desde el fondo del vaso.
const vasoFernetSVG = `<svg viewBox="0 0 64 104" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M15 32 L49 32 L44 90 Q32 96 20 90 Z" fill="#3c2413" opacity=".92"/>
  <path d="M10 14 L54 14 L46 92 Q32 100 18 92 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <rect x="19" y="24" width="11" height="11" rx="2" fill="rgba(255,255,255,.3)" stroke="currentColor" stroke-width="1" transform="rotate(-8 24.5 29.5)"/>
  <rect x="32" y="34" width="9" height="9" rx="2" fill="rgba(255,255,255,.25)" stroke="currentColor" stroke-width="1" transform="rotate(10 36.5 38.5)"/>
  <ellipse cx="32" cy="14" rx="22" ry="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

function fernetWidget() {
  return `<div class="fernet-widget" aria-hidden="true">
    ${vasoFernetSVG}
    <span class="burbuja b1"></span>
    <span class="burbuja b2"></span>
    <span class="burbuja b3"></span>
    <span class="burbuja b4"></span>
    <span class="burbuja b5"></span>
  </div>`;
}

function chispasSVG(extraClass) {
  return `<svg class="motif motif-chispas${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="20" r="2" fill="currentColor"/>
    <circle cx="34" cy="10" r="1.6" fill="currentColor"/>
    <circle cx="62" cy="24" r="1.8" fill="currentColor"/>
    <path d="M92 14 l2.6 5.4 l5.4 2.6 l-5.4 2.6 l-2.6 5.4 l-2.6 -5.4 l-5.4 -2.6 l5.4 -2.6 z" fill="currentColor" opacity=".9"/>
    <circle cx="128" cy="12" r="1.7" fill="currentColor"/>
    <circle cx="152" cy="26" r="1.5" fill="currentColor"/>
    <circle cx="186" cy="16" r="2" fill="currentColor"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${chispasSVG()}${cuchilloTenedorSVG.replace('motif-cubiertos', 'motif-cubiertos motif-cubiertos-small')}${chispasSVG("flip")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#c0392b");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "13:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-asado");
  const gal = galleryWidget(d.galeria, "gal-asado");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${meses[m - 1]} de ${y}`;
  })();

  const momentos = [
    { titulo: "Se prende el fuego", detalle: "Arrancamos temprano cebando el fuego y armando las brasas para que estén a punto." },
    { titulo: "Picoteo y primera ronda de fernet", detalle: "Mientras el fuego agarra fuerza, picoteo, fernet con coca bien cargado y las primeras charlas." },
    { titulo: "Sale el asado", detalle: "Chorizo, morcilla, achuras y el asado en su punto — todos a la mesa (o al pasto)." },
    { titulo: "Sobremesa hasta que caiga el sol", detalle: "Postre, más fernet y sobremesa larga hasta que el cielo se pinte de naranja." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --ember:${accent};
    --ember-soft:color-mix(in srgb, ${accent}, white 25%);
    --gold-glow:#f2a93b;
    --carbon:#221a15;
    --carbon-2:#2c2119;
    --cream:#f5ede1;
    --cream-dim:#cbb9a4;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--carbon);color:var(--cream);font-family:'Nunito',sans-serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,h3,.hero-age{font-family:'Bebas Neue',Impact,sans-serif;letter-spacing:1px;}

  .motif{color:var(--ember-soft);}
  .motif-bottleglass{width:clamp(30px,7vw,44px);height:auto;}
  .motif-cubiertos{width:clamp(70px,16vw,110px);height:auto;margin:0 auto;}
  .motif-cubiertos-small{width:clamp(46px,11vw,70px);}
  .motif-chispas{width:clamp(60px,16vw,130px);height:auto;flex:1 1 auto;}
  .motif-chispas.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 28px;}

  .hero{position:relative;min-height:96vh;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:48px 20px 40px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(34,26,21,.35) 0%,rgba(34,26,21,.6) 45%,rgba(34,26,21,.94) 100%);}
  .humo{position:absolute;left:0;right:0;bottom:0;height:260px;overflow:hidden;pointer-events:none;z-index:1;}
  .voluta{position:absolute;bottom:18px;border-radius:50%;background:radial-gradient(circle, rgba(245,238,227,.6) 0%, rgba(245,238,227,0) 70%);filter:blur(8px);opacity:0;animation:subirHumo 8s ease-in-out infinite;}
  .v1{left:36%;width:70px;height:70px;animation-duration:9s;animation-delay:0s;}
  .v2{left:48%;width:50px;height:50px;animation-duration:7s;animation-delay:1.4s;}
  .v3{left:57%;width:60px;height:60px;animation-duration:8.5s;animation-delay:2.8s;}
  .v4{left:43%;width:40px;height:40px;animation-duration:6.5s;animation-delay:4.2s;}
  .v5{left:61%;width:45px;height:45px;animation-duration:9.5s;animation-delay:5.6s;}
  .v6{left:33%;width:55px;height:55px;animation-duration:7.8s;animation-delay:3.2s;}
  @keyframes subirHumo{
    0%{transform:translate(0,0);opacity:0;}
    12%{opacity:.18;}
    50%{transform:translate(14px,-90px);opacity:.35;}
    78%{transform:translate(-10px,-140px);opacity:.16;}
    100%{transform:translate(6px,-180px);opacity:0;}
  }
  .hero-content{position:relative;z-index:2;max-width:680px;}
  .eyebrow{letter-spacing:.35em;text-transform:uppercase;font-family:'Oswald',sans-serif;font-weight:500;font-size:clamp(.62rem,1.6vw,.78rem);color:var(--gold-glow);margin:0 0 10px;}
  .hero-content h1{font-size:clamp(2.8rem,10vw,5rem);margin:0 0 2px;color:var(--cream);}
  .hero-age{font-size:clamp(5rem,22vw,9rem);line-height:.85;color:var(--ember);margin:4px 0;text-shadow:0 10px 40px rgba(0,0,0,.55);}
  .hero-date{letter-spacing:.22em;text-transform:uppercase;font-family:'Oswald',sans-serif;font-size:clamp(.7rem,2vw,.88rem);color:var(--cream-dim);margin-top:12px;}
  .hero-parrilla{width:clamp(160px,42vw,240px);margin:26px auto 0;color:var(--ember-soft);position:relative;z-index:2;}

  section{max-width:760px;margin:0 auto;padding:64px 24px;text-align:center;}
  h2{font-weight:400;letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.3rem,3.4vw,1.9rem);color:var(--ember);margin:0 0 28px;}

  .quote-wrap{max-width:600px;margin:0 auto;}
  .quote-wrap p{font-family:'Nunito',sans-serif;font-style:italic;font-weight:600;font-size:clamp(1.02rem,2.5vw,1.28rem);line-height:1.75;color:var(--cream);}
  .quote-wrap p::before,.quote-wrap p::after{color:var(--ember);}
  .quote-wrap p::before{content:"“";}
  .quote-wrap p::after{content:"”";}

  .countdown{display:flex;gap:clamp(10px,4vw,30px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:56px;}
  .cd-num{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(2rem,5.5vw,2.9rem);color:var(--ember);}
  .cd-label{font-family:'Oswald',sans-serif;font-size:.64rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--cream-dim);}

  .fernet-widget{position:relative;width:56px;height:92px;margin:26px auto 0;overflow:hidden;color:var(--cream-dim);}
  .fernet-widget svg{position:absolute;inset:0;width:100%;height:100%;}
  .burbuja{position:absolute;bottom:14%;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.8);opacity:0;animation:burbujear 3s ease-in-out infinite;}
  .b1{left:30%;animation-duration:2.6s;animation-delay:0s;}
  .b2{left:45%;animation-duration:3.2s;animation-delay:.6s;}
  .b3{left:55%;animation-duration:2.8s;animation-delay:1.2s;}
  .b4{left:40%;animation-duration:3.6s;animation-delay:1.8s;}
  .b5{left:60%;animation-duration:3s;animation-delay:2.2s;}
  @keyframes burbujear{
    0%{transform:translate(0,0);opacity:0;}
    10%{opacity:.7;}
    50%{transform:translate(3px,-30px);opacity:.55;}
    90%{opacity:.25;}
    100%{transform:translate(-2px,-55px);opacity:0;}
  }

  .agenda{list-style:none;margin:0;padding:0;max-width:520px;margin:0 auto;text-align:left;position:relative;}
  .agenda::before{content:"";position:absolute;left:19px;top:6px;bottom:6px;width:1px;background:linear-gradient(180deg, var(--ember), transparent);}
  .agenda li{position:relative;padding:0 0 34px 56px;}
  .agenda li:last-child{padding-bottom:0;}
  .agenda-num{position:absolute;left:0;top:-2px;width:40px;height:40px;border-radius:50%;border:1px solid var(--ember);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',Impact,sans-serif;color:var(--ember);font-size:1.1rem;background:var(--carbon);}
  .agenda h3{margin:2px 0 6px;font-size:1.15rem;font-weight:400;color:var(--cream);letter-spacing:.5px;}
  .agenda p{margin:0;color:var(--cream-dim);line-height:1.6;font-size:.92rem;}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:var(--carbon-2);border:1px solid color-mix(in srgb, var(--ember) 35%, transparent);box-shadow:0 6px 26px rgba(0,0,0,.45);padding:32px;border-radius:8px;text-align:center;}
  .venue-card h3{margin:0 0 10px;font-weight:400;letter-spacing:.5px;color:var(--ember);font-size:1.5rem;}
  .venue-card p{margin:0 0 6px;line-height:1.7;color:var(--cream-dim);}
  .maplink{display:inline-block;margin-top:16px;color:var(--ember-soft);text-decoration:none;border-bottom:1px solid var(--ember-soft);letter-spacing:.5px;font-size:.9rem;}
  .dresscode-row{margin-top:16px;padding-top:16px;border-top:1px dashed color-mix(in srgb, var(--ember) 45%, transparent);}
  .dresscode-row .label{display:block;font-family:'Oswald',sans-serif;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--ember-soft);margin-bottom:6px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:6px;cursor:pointer;filter:saturate(1.1) brightness(.96) contrast(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(15,10,7,.95);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:4px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-family:'Oswald',sans-serif;font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--cream-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Nunito',sans-serif;padding:11px;border:1px solid color-mix(in srgb, var(--ember) 40%, transparent);border-radius:5px;margin-top:5px;width:100%;background:var(--carbon-2);color:var(--cream);}
  .rsvp-form button{background:var(--ember);color:var(--cream);border:0;padding:14px;border-radius:5px;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:700;transition:opacity .2s;}
  .rsvp-form button:hover{opacity:.86;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--ember-soft);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#9fd08a;font-weight:bold;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--cream-dim);border-top:1px solid color-mix(in srgb, var(--ember) 30%, transparent);background:var(--carbon-2);}
  footer .motif-bottleglass{width:34px;height:auto;margin:0 auto 14px;}

  @media (prefers-reduced-motion: reduce){
    .voluta{animation:none !important;opacity:.3;}
    .burbuja{animation:none !important;opacity:.6;transform:none !important;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="humo" aria-hidden="true">
      <span class="voluta v1"></span>
      <span class="voluta v2"></span>
      <span class="voluta v3"></span>
      <span class="voluta v4"></span>
      <span class="voluta v5"></span>
      <span class="voluta v6"></span>
    </div>
    <div class="hero-content">
      <p class="eyebrow">Nos juntamos a comer asado</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">${esc(d.edad)}</div>` : ""}
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-parrilla">${parrillaSVG}</div>
    </div>
  </div>

  ${d.mensaje ? `
  <section>
    ${divider()}
    ${bottleGlassSVG}
    <div class="quote-wrap"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Faltan para el asado</h2>
    ${cd.html}
    ${fernetWidget()}
  </section>

  <section>
    ${divider()}
    <h2>Así va a ser la previa</h2>
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
        ${d.dressCode ? `<div class="dresscode-row"><span class="label">Cómo venir vestido</span><p>${esc(d.dressCode)}</p></div>` : ""}
      </div>
    </div>
  </section>` : ""}

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-family:'Oswald',sans-serif;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.9;color:var(--ember-soft);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${bottleGlassSVG}
    Nos vemos en el asado, ${esc(d.nombre)} — ¡llevá hambre!
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, ${d.accent2} 0%, #33261c 100%);">
    <svg viewBox="0 0 220 110" width="60" height="30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="30" y1="14" x2="70" y2="70" stroke="${d.accent}" stroke-width="4"/>
      <line x1="70" y1="14" x2="30" y2="70" stroke="${d.accent}" stroke-width="4"/>
      <line x1="150" y1="14" x2="190" y2="70" stroke="${d.accent}" stroke-width="4"/>
      <line x1="190" y1="14" x2="150" y2="70" stroke="${d.accent}" stroke-width="4"/>
      <rect x="20" y="62" width="180" height="14" rx="3" stroke="${d.accent}" stroke-width="3"/>
      <ellipse cx="70" cy="94" rx="12" ry="4.4" fill="#ff6b35" opacity=".85"/>
      <ellipse cx="120" cy="97" rx="13" ry="4.6" fill="#ffb347" opacity=".8"/>
      <ellipse cx="155" cy="93" rx="10" ry="3.8" fill="#ff6b35" opacity=".8"/>
    </svg>
    <div style="font-family:Impact,'Arial Narrow',sans-serif;font-weight:700;letter-spacing:1px;font-size:1.3rem;color:${d.accent};line-height:1.1;text-transform:uppercase;">${esc(d.name)}</div>
    <div style="font-family:Arial,sans-serif;font-size:.62rem;letter-spacing:2.5px;text-transform:uppercase;color:#e8d9c6;">asado &amp; fernet</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Asadito y Fernet",
  summary: "Rojo brasa y carbón con volutas de humo subiendo despacio de la parrilla y burbujitas de fernet — la previa y el asado de domingo, con toda la onda.",
  accent: "#c0392b", accent2: "#221a15", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
