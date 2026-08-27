const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-jazz-vinilo";

const sampleData = {
  nombre: "Martín",
  edad: "45",
  fecha: "2027-06-05",
  hora: "21:30",
  lugar: "The Basement Bar, San Telmo",
  direccionMapa: "https://maps.google.com/?q=San+Telmo+Buenos+Aires",
  mensaje: "Cuarenta y cinco años de buena música. Quiero festejarlo en un lugar con onda, entre tragos, jazz de verdad y la gente que más quiero. Va a ser una noche larga.",
  dressCode: "Elegante casual, algo de negro o bronce viene bien",
  whatsapp: "5491100000071",
  fechaLimiteRSVP: "2027-05-25",
  coverImage: "https://images.unsplash.com/photo-1757889693368-2a598dac33db?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1781078687115-115e4247216e?w=800&q=80",
    "https://images.unsplash.com/photo-1574101412892-7e945f20b282?w=800&q=80",
    "https://images.unsplash.com/photo-1549477606-43a329b26066?w=800&q=80",
  ],
};

const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Motivos de bar de jazz dibujados a mano en SVG inline: un vinilo con
// brazo de bandeja, un saxofón de línea fina y unas notas musicales
// sueltas. Nada de copas ni confeti — la fiesta acá se dibuja con vinilos.
function vinylSVG(extraClass) {
  return `<svg class="motif motif-vinyl${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="vinyl-spin">
      <circle cx="100" cy="100" r="92" fill="#0e0709" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="100" cy="100" r="76" stroke="currentColor" stroke-width=".6" opacity=".55"/>
      <circle cx="100" cy="100" r="62" stroke="currentColor" stroke-width=".6" opacity=".5"/>
      <circle cx="100" cy="100" r="48" stroke="currentColor" stroke-width=".6" opacity=".45"/>
      <circle cx="100" cy="100" r="34" fill="currentColor" opacity=".92"/>
      <circle cx="100" cy="100" r="6" fill="#0e0709"/>
    </g>
    <g class="vinyl-arm" transform="translate(150 46)">
      <circle cx="0" cy="0" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <line x1="5" y1="5" x2="42" y2="46" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="44" cy="48" r="2.6" fill="currentColor"/>
    </g>
  </svg>`;
}

const saxSVG = `<svg class="motif motif-sax" viewBox="0 0 90 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M52 6 C58 6 62 10 62 16 C62 22 58 26 52 26 L44 26" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M44 26 L44 92 C44 108 34 118 34 130 C34 137 40 140 46 138 C54 135 56 126 52 118 C44 104 44 92 44 92" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="44" cy="46" r="2.2" fill="currentColor"/>
  <circle cx="44" cy="58" r="2.2" fill="currentColor"/>
  <circle cx="44" cy="70" r="2.2" fill="currentColor"/>
  <circle cx="49" cy="82" r="2.2" fill="currentColor"/>
  <circle cx="52" cy="94" r="2.2" fill="currentColor"/>
  <path d="M8 30 Q26 20 44 26" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <ellipse cx="8" cy="30" rx="4.5" ry="7" transform="rotate(-30 8 30)" stroke="currentColor" stroke-width="1.2"/>
</svg>`;

function notesSVG(extraClass) {
  return `<svg class="motif motif-notes${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="currentColor">
      <ellipse cx="16" cy="46" rx="7" ry="5" transform="rotate(-18 16 46)"/>
      <rect x="21.5" y="10" width="2" height="37"/>
      <ellipse cx="52" cy="38" rx="6" ry="4.4" transform="rotate(-18 52 38)"/>
      <rect x="57" y="8" width="1.8" height="31"/>
      <path d="M57 8 L74 14 L74 20 L57 14 Z"/>
      <ellipse cx="150" cy="40" rx="6.4" ry="4.6" transform="rotate(-18 150 40)"/>
      <rect x="155.4" y="10" width="1.8" height="31"/>
      <ellipse cx="184" cy="46" rx="7" ry="5" transform="rotate(-18 184 46)"/>
      <rect x="189.5" y="12" width="2" height="35"/>
      <path d="M189.5 12 L205 18" stroke="currentColor" stroke-width="1.6" fill="none"/>
    </g>
  </svg>`;
}

function divider() {
  return `<div class="divider">${notesSVG()}${vinylSVG("motif-vinyl-small")}${notesSVG("flip")}</div>`;
}

// Volutas de humo/bruma de bar: se posicionan en un contenedor absoluto
// dentro de un padre con position:relative + overflow:hidden. Cada una
// sube muy despacio con un vaivén lateral leve, con delay propio.
function smokeLayer(count, prefix) {
  let out = `<div class="smoke-layer" aria-hidden="true">`;
  for (let i = 0; i < count; i++) {
    out += `<span class="smoke smoke-${prefix}${i}"></span>`;
  }
  out += `</div>`;
  return out;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#b8863b");
  const accent2 = "#1c1013";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:30"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-jazz");
  const gal = galleryWidget(d.galeria, "gal-jazz");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (!y || !m || !day) return d.fecha;
    return `${day} de ${MESES_ES[m - 1]} de ${y}`;
  })();

  const momentos = [
    { titulo: "Apertura de puertas y primer trago", detalle: "Llegamos despacio, buscamos mesa cerca del escenario y pedimos el primer cóctel de la noche." },
    { titulo: "Set en vivo", detalle: "Sube la banda, bajan las luces: jazz de verdad para escuchar de cerca, con un trago en la mano." },
    { titulo: "Brindis de medianoche", detalle: "Un brindis corto, unas palabras y a seguir la noche entre amigos." },
    { titulo: "Última ronda y buena música hasta cerrar", detalle: "El bar se pone íntimo, la barra sigue sirviendo y los vinilos no paran de girar hasta que cierre el lugar." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&display=swap" rel="stylesheet">
<style>
  :root{
    --brass:${accent};
    --brass-soft:color-mix(in srgb, ${accent}, white 30%);
    --wine:${accent2};
    --wine-2:#241419;
    --wine-3:#2c171d;
    --cream:#f2e6d3;
    --cream-dim:#c9b9a6;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--wine);color:var(--cream);font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:1.08rem;}
  img{max-width:100%;}
  h1,h2,h3{font-family:'Playfair Display',Georgia,'Times New Roman',serif;}

  .motif{color:var(--brass);}
  .motif-vinyl{width:clamp(150px,34vw,230px);height:auto;overflow:visible;}
  .motif-vinyl-small{width:clamp(46px,11vw,66px);}
  .motif-sax{width:clamp(30px,8vw,46px);height:auto;}
  .motif-notes{width:clamp(60px,16vw,130px);height:auto;flex:1 1 auto;}
  .motif-notes.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 28px;}

  /* ===== vinilo girando: continuo, lento y parejo, sin easing ===== */
  .vinyl-spin{transform-origin:100px 100px;animation:girar 11s linear infinite;}
  @keyframes girar{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

  /* ===== bruma/humo de bar: volutas finas, muy tenues, muy lentas ===== */
  .smoke-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;}
  .smoke{position:absolute;bottom:-10%;width:10px;height:46%;border-radius:50%;
    background:linear-gradient(180deg, rgba(242,230,211,.22) 0%, rgba(242,230,211,.08) 55%, rgba(242,230,211,0) 100%);
    filter:blur(6px);opacity:0;pointer-events:none;}
  .smoke-a0{left:14%;animation:humo1 9s ease-in-out infinite;animation-delay:0s;}
  .smoke-a1{left:32%;animation:humo2 11s ease-in-out infinite;animation-delay:1.6s;width:8px;}
  .smoke-a2{left:52%;animation:humo1 10s ease-in-out infinite;animation-delay:3.2s;width:12px;}
  .smoke-a3{left:70%;animation:humo2 12s ease-in-out infinite;animation-delay:5s;width:9px;}
  .smoke-a4{left:86%;animation:humo1 8.5s ease-in-out infinite;animation-delay:2.4s;width:7px;}
  .smoke-b0{left:20%;animation:humo1 10s ease-in-out infinite;animation-delay:.8s;}
  .smoke-b1{left:44%;animation:humo2 9.5s ease-in-out infinite;animation-delay:3.6s;width:8px;}
  .smoke-b2{left:68%;animation:humo1 11.5s ease-in-out infinite;animation-delay:1.2s;width:10px;}
  @keyframes humo1{
    0%{opacity:0;transform:translate(0,0);}
    12%{opacity:.16;}
    50%{opacity:.25;transform:translate(14px,-52%);}
    85%{opacity:.05;}
    100%{opacity:0;transform:translate(-6px,-104%);}
  }
  @keyframes humo2{
    0%{opacity:0;transform:translate(0,0);}
    14%{opacity:.12;}
    50%{opacity:.2;transform:translate(-16px,-54%);}
    88%{opacity:.04;}
    100%{opacity:0;transform:translate(8px,-106%);}
  }
  @media (prefers-reduced-motion: reduce){
    .vinyl-spin{animation:none !important;transform:rotate(0deg);}
    .smoke{animation:none !important;opacity:.03 !important;transform:none !important;}
  }

  .hero{position:relative;min-height:96vh;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:48px 20px 60px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,16,19,.4) 0%,rgba(28,16,19,.6) 45%,rgba(28,16,19,.94) 100%);}
  .hero-content{position:relative;z-index:2;max-width:680px;}
  .eyebrow{letter-spacing:.42em;text-transform:uppercase;font-size:clamp(.62rem,1.6vw,.78rem);color:var(--brass-soft);margin:0 0 10px;font-family:'Cormorant Garamond',Georgia,serif;}
  .hero-content h1{font-size:clamp(2.4rem,8vw,4.2rem);font-weight:800;margin:0 0 4px;color:var(--cream);letter-spacing:1px;}
  .hero-age{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:800;font-size:clamp(4.5rem,20vw,8rem);line-height:.85;color:var(--brass);margin:6px 0;text-shadow:0 10px 40px rgba(0,0,0,.55);}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.72rem,2vw,.9rem);color:var(--cream-dim);margin-top:14px;}
  .hero-vinyl-wrap{display:flex;justify-content:center;margin-top:26px;}

  section{max-width:760px;margin:0 auto;padding:66px 24px;text-align:center;position:relative;}
  h2{font-weight:800;letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.1rem,2.8vw,1.5rem);color:var(--brass);margin:0 0 30px;}

  .quote-wrap{max-width:600px;margin:0 auto;}
  .quote-wrap p{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-style:italic;font-size:clamp(1.05rem,2.6vw,1.35rem);line-height:1.75;color:var(--cream);}
  .quote-wrap p::before,.quote-wrap p::after{color:var(--brass);}
  .quote-wrap p::before{content:"“";}
  .quote-wrap p::after{content:"”";}

  .countdown{display:flex;gap:clamp(10px,4vw,30px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:56px;}
  .cd-num{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:clamp(1.8rem,5vw,2.6rem);color:var(--brass);}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--cream-dim);font-family:'Cormorant Garamond',Georgia,serif;}

  .agenda{list-style:none;margin:0;padding:0;max-width:520px;margin:0 auto;text-align:left;position:relative;}
  .agenda::before{content:"";position:absolute;left:19px;top:6px;bottom:6px;width:1px;background:linear-gradient(180deg, var(--brass), transparent);}
  .agenda li{position:relative;padding:0 0 34px 56px;}
  .agenda li:last-child{padding-bottom:0;}
  .agenda-num{position:absolute;left:0;top:-2px;width:40px;height:40px;border-radius:50%;border:1px solid var(--brass);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:800;color:var(--brass);font-size:1rem;background:var(--wine);}
  .agenda h3{margin:2px 0 6px;font-size:1.15rem;font-weight:800;color:var(--cream);letter-spacing:.3px;}
  .agenda p{margin:0;color:var(--cream-dim);line-height:1.6;font-size:.98rem;}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:var(--wine-2);border:1px solid color-mix(in srgb, var(--brass) 35%, transparent);box-shadow:0 6px 26px rgba(0,0,0,.45);padding:32px;border-radius:4px;text-align:center;}
  .venue-card h3{margin:0 0 10px;font-weight:800;letter-spacing:.5px;color:var(--brass);font-size:1.25rem;}
  .venue-card p{margin:0 0 6px;line-height:1.7;color:var(--cream-dim);}
  .maplink{display:inline-block;margin-top:16px;color:var(--brass);text-decoration:none;border-bottom:1px solid var(--brass);letter-spacing:.5px;font-size:.95rem;}
  .dresscode-row{margin-top:16px;padding-top:16px;border-top:1px dashed color-mix(in srgb, var(--brass) 45%, transparent);}
  .dresscode-row .label{display:block;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--brass);margin-bottom:6px;font-family:'Cormorant Garamond',Georgia,serif;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:2px;cursor:pointer;filter:saturate(.9) brightness(.9) sepia(.08);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,6,8,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:2px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--cream-dim);font-family:'Cormorant Garamond',Georgia,serif;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',Georgia,serif;font-size:1rem;padding:11px;border:1px solid color-mix(in srgb, var(--brass) 40%, transparent);border-radius:3px;margin-top:5px;width:100%;background:var(--wine-2);color:var(--cream);}
  .rsvp-form button{background:var(--brass);color:var(--wine);border:0;padding:14px;border-radius:3px;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:600;transition:opacity .2s;font-family:'Cormorant Garamond',Georgia,serif;}
  .rsvp-form button:hover{opacity:.85;}
  .rsvp-whatsapp{font-size:.9rem;color:var(--brass);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#9fd08a;font-weight:bold;}

  footer{position:relative;overflow:hidden;text-align:center;padding:48px 24px 56px;font-size:.95rem;color:var(--cream-dim);border-top:1px solid color-mix(in srgb, var(--brass) 30%, transparent);background:var(--wine-2);}
  footer .footer-text{position:relative;z-index:2;}
  footer .motif-sax{width:30px;height:auto;margin:0 auto 14px;position:relative;z-index:2;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    ${smokeLayer(5, "a")}
    <div class="hero-content">
      <p class="eyebrow">Noche de jazz</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">${esc(d.edad)}</div>` : ""}
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-vinyl-wrap">${vinylSVG()}</div>
    </div>
  </div>

  ${d.mensaje ? `
  <section>
    ${divider()}
    <div class="quote-wrap"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Faltan para el primer trago</h2>
    ${cd.html}
  </section>

  <section>
    ${divider()}
    <h2>Así va a sonar la noche</h2>
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
    <h2>Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.85rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;color:var(--brass);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${smokeLayer(3, "b")}
    <div class="footer-text">
      ${saxSVG}
      Brindamos por ${esc(d.nombre)} — nos vemos en la barra.
    </div>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, ${d.accent2} 0%, #2c171d 100%);">
    <svg viewBox="0 0 200 200" width="46" height="46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="#0e0709" stroke="${d.accent}" stroke-width="2.4"/>
      <circle cx="100" cy="100" r="76" stroke="${d.accent}" stroke-width="1.2" opacity=".5"/>
      <circle cx="100" cy="100" r="62" stroke="${d.accent}" stroke-width="1.2" opacity=".45"/>
      <circle cx="100" cy="100" r="48" stroke="${d.accent}" stroke-width="1.2" opacity=".4"/>
      <circle cx="100" cy="100" r="34" fill="${d.accent}" opacity=".9"/>
      <circle cx="100" cy="100" r="6" fill="#0e0709"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:1.2rem;color:${d.accent};line-height:1.1;">${esc(d.name)}</div>
    <div style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:1rem;color:#e9d6b0;">jazz &amp; vinilo</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Jazz & Vinilo",
  summary: "Borgoña casi negro y bronce, con un vinilo girando despacio y parejo y una bruma tenue de bar — una noche de jazz íntima para festejar con clase.",
  accent: "#b8863b", accent2: "#1c1013", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
