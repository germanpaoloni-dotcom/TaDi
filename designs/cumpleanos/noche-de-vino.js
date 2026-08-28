const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-noche-de-vino";

const sampleData = {
  nombre: "Julieta",
  edad: "38",
  fecha: "2027-04-09",
  hora: "20:30",
  lugar: "Casa de Julieta, Villa Devoto",
  direccionMapa: "https://maps.google.com/?q=Villa+Devoto+Buenos+Aires",
  mensaje: "Este año quiero festejar distinto: una mesa larga, buen vino, velas encendidas y las personas que más quiero cerca. Nada de fiesta grande, solo nosotros y una linda noche.",
  dressCode: "Elegante casual, tonos tierra y vino bienvenidos",
  whatsapp: "5491100000069",
  fechaLimiteRSVP: "2027-04-02",
  coverImage: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1562050344-f7ad946cee35?w=800&q=80",
    "https://images.unsplash.com/photo-1519756719377-e084f8333a83?w=800&q=80",
    "https://images.unsplash.com/photo-1562050147-fda1cc9a6378?w=800&q=80",
  ],
};

// Motivos de cena íntima dibujados a mano en SVG inline: una vela encendida
// con su llama, una copa de vino y una ramita fina de vid — nada de copas
// de champagne ni confeti, para que se sienta más chico e íntimo.
const candleSVG = `<svg class="motif motif-candle" viewBox="0 0 40 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path class="flame" d="M20 8 C24 14 25 19 21.5 23 C19 25.5 17.5 23.5 18.5 21 C16.5 23 16 27 20 29 C24.5 27 25 20 20 8 Z" fill="currentColor"/>
  <line x1="20" y1="29" x2="20" y2="32" stroke="currentColor" stroke-width="1"/>
  <path d="M11 34 C11 30 29 30 29 34 L27 78 C27 82 13 82 13 78 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <ellipse cx="20" cy="34" rx="9" ry="2.6" stroke="currentColor" stroke-width="1.1"/>
  <ellipse cx="20" cy="82" rx="14" ry="3.6" stroke="currentColor" stroke-width="1.3"/>
</svg>`;

const wineGlassSVG = `<svg class="motif motif-wineglass" viewBox="0 0 40 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M9 6 C9 24 9 32 14 36 C17 38.5 23 38.5 26 36 C31 32 31 24 31 6 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M10.5 20 C10.5 28 13 33 20 35 C27 33 29.5 28 29.5 20 Z" fill="currentColor" opacity=".55"/>
  <line x1="20" y1="37" x2="20" y2="72" stroke="currentColor" stroke-width="1.3"/>
  <ellipse cx="20" cy="76" rx="13" ry="4" stroke="currentColor" stroke-width="1.3"/>
</svg>`;

function vineSVG(extraClass) {
  return `<svg class="motif motif-vine${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 22 C 30 6, 50 34, 76 20 C 100 8, 118 30, 142 18 C 160 10, 176 24, 196 16" stroke="currentColor" stroke-width="1" fill="none"/>
    <circle cx="30" cy="12" r="2.6" fill="currentColor"/>
    <circle cx="34" cy="17" r="1.7" fill="currentColor"/>
    <circle cx="72" cy="28" r="2.4" fill="currentColor"/>
    <circle cx="77" cy="23" r="1.6" fill="currentColor"/>
    <circle cx="118" cy="12" r="2.6" fill="currentColor"/>
    <circle cx="123" cy="17" r="1.7" fill="currentColor"/>
    <circle cx="164" cy="26" r="2.4" fill="currentColor"/>
    <circle cx="169" cy="21" r="1.6" fill="currentColor"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${vineSVG()}${candleSVG.replace('motif-candle', 'motif-candle motif-candle-small')}${vineSVG("flip")}</div>`;
}

// 8 motitas de polvo dorado flotando muy despacio dentro del hero, cada una
// con su propia posición, duración y demora para que el movimiento se sienta
// orgánico y no repetido en bloque.
function dustMotes() {
  const motes = [
    { l: "8%", t: "70%", dur: "11s", delay: "0s" },
    { l: "18%", t: "30%", dur: "13.5s", delay: "1.2s" },
    { l: "28%", t: "82%", dur: "9.5s", delay: "2.4s" },
    { l: "42%", t: "48%", dur: "14s", delay: ".6s" },
    { l: "58%", t: "20%", dur: "10.5s", delay: "3.1s" },
    { l: "70%", t: "66%", dur: "12.5s", delay: "1.8s" },
    { l: "82%", t: "36%", dur: "8.5s", delay: "2.9s" },
    { l: "91%", t: "74%", dur: "13s", delay: ".2s" },
  ];
  return motes.map((m, i) => `<div class="mote" style="left:${m.l};top:${m.t};animation-duration:${m.dur};animation-delay:${m.delay};"></div>`).join("");
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#d9a94f");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:30"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-vino");
  const gal = galleryWidget(d.galeria, "gal-vino");
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
    { titulo: "Recibimos con una copa", detalle: "Llegan, se acomodan y arrancamos con una copa de vino en la mano." },
    { titulo: "Nos sentamos a la mesa", detalle: "Mesa larga, velas encendidas y platos para compartir entre todos." },
    { titulo: "Un brindis y unas palabras", detalle: "Levantamos la copa, decimos algo lindo y seguimos festejando." },
    { titulo: "Sobremesa larga, como a mí me gusta", detalle: "Café, algo dulce y charla hasta que el vino y las velas se terminen." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:${accent};
    --gold-soft:color-mix(in srgb, ${accent}, white 30%);
    --wine:#4a1220;
    --wine-2:#5a1829;
    --cream:#f3e8da;
    --cream-dim:#cbb8a8;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--wine);color:var(--cream);font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,h3{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-style:italic;}

  .motif{color:var(--gold);}
  .motif-wineglass{width:clamp(24px,6vw,34px);height:auto;}
  .motif-candle{width:clamp(70px,16vw,110px);height:auto;margin:0 auto;}
  .motif-candle-small{width:clamp(46px,11vw,68px);}
  .motif-vine{width:clamp(60px,16vw,130px);height:auto;flex:1 1 auto;}
  .motif-vine.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 28px;}

  /* --- resplandor de vela: titileo orgánico, no un pulso parejo --- */
  @keyframes flicker{
    0%{opacity:.85;transform:scale(1);}
    18%{opacity:1;transform:scale(1.08);}
    34%{opacity:.78;transform:scale(.92);}
    55%{opacity:1.0;transform:scale(1.12);}
    78%{opacity:.9;transform:scale(.97);}
    100%{opacity:.85;transform:scale(1);}
  }
  .flame{transform-origin:20px 20px;animation:flicker 2.6s ease-in-out infinite;}
  .hero-glow{position:absolute;left:50%;top:14%;width:min(70vw,420px);height:min(70vw,420px);
    transform:translateX(-50%);pointer-events:none;
    background:radial-gradient(circle, rgba(217,169,79,.5), transparent 70%);
    filter:blur(38px);
    animation:flicker 3.1s ease-in-out infinite;}

  /* --- motitas de polvo dorado flotando despacio en el hero --- */
  .dust{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
  .mote{position:absolute;width:2.5px;height:2.5px;border-radius:50%;background:var(--gold);opacity:0;
    animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite;}
  @keyframes drift{
    0%{opacity:0;transform:translate(0,0);}
    12%{opacity:.55;}
    50%{opacity:.75;transform:translate(14px,-46px);}
    88%{opacity:.4;}
    100%{opacity:0;transform:translate(-10px,-88px);}
  }

  @media(prefers-reduced-motion:reduce){
    .flame,.hero-glow,.mote{animation:none !important;}
    .flame{opacity:1;transform:scale(1);}
    .hero-glow{opacity:.85;}
    .mote{opacity:.4;}
  }

  .hero{position:relative;min-height:96vh;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:48px 20px 60px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(74,18,32,.4) 0%,rgba(74,18,32,.6) 45%,rgba(30,7,13,.94) 100%);}
  .hero-content{position:relative;z-index:1;max-width:680px;}
  .eyebrow{letter-spacing:.4em;text-transform:uppercase;font-style:normal;font-size:clamp(.6rem,1.6vw,.76rem);color:var(--gold-soft);margin:0 0 10px;}
  .hero-content h1{font-style:italic;font-size:clamp(2.4rem,8vw,4.2rem);font-weight:600;margin:0 0 4px;color:var(--cream);letter-spacing:.5px;}
  .hero-age{font-style:italic;font-weight:600;font-size:clamp(4.2rem,18vw,7.4rem);line-height:.85;color:var(--gold);margin:6px 0;text-shadow:0 10px 40px rgba(0,0,0,.55);}
  .hero-date{letter-spacing:.22em;text-transform:uppercase;font-style:normal;font-size:clamp(.7rem,2vw,.86rem);color:var(--cream-dim);margin-top:14px;}
  .hero-candles{position:relative;display:flex;justify-content:center;gap:14px;margin-top:24px;}

  section{max-width:760px;margin:0 auto;padding:66px 24px;text-align:center;}
  h2{font-weight:600;font-style:italic;letter-spacing:.5px;font-size:clamp(1.3rem,3.4vw,1.8rem);color:var(--gold);margin:0 0 30px;}

  .quote-wrap{max-width:600px;margin:0 auto;}
  .quote-wrap p{font-style:italic;font-size:clamp(1.15rem,2.8vw,1.5rem);line-height:1.75;color:var(--cream);}
  .quote-wrap p::before,.quote-wrap p::after{color:var(--gold);}
  .quote-wrap p::before{content:"“";}
  .quote-wrap p::after{content:"”";}

  .countdown{display:flex;gap:clamp(10px,4vw,30px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:56px;}
  .cd-num{font-style:italic;font-size:clamp(1.8rem,5vw,2.6rem);color:var(--gold);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--cream-dim);font-style:normal;}

  .agenda{list-style:none;margin:0;padding:0;max-width:520px;margin:0 auto;text-align:left;position:relative;}
  .agenda::before{content:"";position:absolute;left:19px;top:6px;bottom:6px;width:1px;background:linear-gradient(180deg, var(--gold), transparent);}
  .agenda li{position:relative;padding:0 0 34px 56px;}
  .agenda li:last-child{padding-bottom:0;}
  .agenda-num{position:absolute;left:0;top:-2px;width:40px;height:40px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-style:italic;font-weight:600;color:var(--gold);font-size:1.1rem;background:var(--wine);}
  .agenda h3{margin:2px 0 6px;font-size:1.1rem;font-weight:600;color:var(--cream);letter-spacing:.2px;}
  .agenda p{margin:0;color:var(--cream-dim);line-height:1.6;font-size:.94rem;font-style:normal;}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:var(--wine-2);border:1px solid color-mix(in srgb, var(--gold) 35%, transparent);box-shadow:0 6px 26px rgba(0,0,0,.4);padding:32px;border-radius:6px;text-align:center;}
  .venue-card h3{margin:0 0 10px;font-weight:600;letter-spacing:.3px;color:var(--gold);font-size:1.3rem;}
  .venue-card p{margin:0 0 6px;line-height:1.7;color:var(--cream-dim);font-style:normal;}
  .maplink{display:inline-block;margin-top:16px;color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold);letter-spacing:.4px;font-size:.92rem;font-style:normal;}
  .dresscode-row{margin-top:16px;padding-top:16px;border-top:1px dashed color-mix(in srgb, var(--gold) 45%, transparent);}
  .dresscode-row .label{display:block;letter-spacing:2px;text-transform:uppercase;font-size:.64rem;color:var(--gold);margin-bottom:6px;font-style:normal;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:4px;cursor:pointer;filter:saturate(1.05) brightness(.92) sepia(.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,5,9,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:2px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;font-style:normal;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--cream-dim);font-style:normal;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',Georgia,serif;font-size:1rem;padding:11px;border:1px solid color-mix(in srgb, var(--gold) 40%, transparent);border-radius:3px;margin-top:5px;width:100%;background:var(--wine-2);color:var(--cream);}
  .rsvp-form button{background:var(--gold);color:var(--wine);border:0;padding:14px;border-radius:3px;letter-spacing:1.6px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-style:normal;font-weight:600;transition:opacity .2s;}
  .rsvp-form button:hover{opacity:.85;}
  .rsvp-whatsapp{font-size:.9rem;color:var(--gold);text-align:center;text-decoration:none;font-style:normal;}
  .rsvp-status{text-align:center;color:#c9d89f;font-weight:bold;font-style:normal;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.9rem;color:var(--cream-dim);font-style:italic;border-top:1px solid color-mix(in srgb, var(--gold) 30%, transparent);background:var(--wine-2);}
  footer .motif-wineglass{width:26px;height:auto;margin:0 auto 14px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="dust">${dustMotes()}</div>
    <div class="hero-content">
      <p class="eyebrow">Cena íntima de cumpleaños</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">${esc(d.edad)}</div>` : ""}
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-candles">
        <div class="hero-glow"></div>
        ${candleSVG}
      </div>
    </div>
  </div>

  ${d.mensaje ? `
  <section>
    ${divider()}
    <div class="quote-wrap"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  <section>
    ${divider()}
    <h2>Faltan para brindar</h2>
    ${cd.html}
  </section>

  <section>
    ${divider()}
    <h2>Así va a ser la noche</h2>
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
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.82rem;letter-spacing:1.4px;text-transform:uppercase;font-style:normal;opacity:.85;color:var(--gold);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${wineGlassSVG}
    Brindamos por ${esc(d.nombre)} — ¡nos vemos ahí!
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, ${d.accent2} 0%, #2a0a12 100%);">
    <svg viewBox="0 0 40 90" width="26" height="58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 8 C24 14 25 19 21.5 23 C19 25.5 17.5 23.5 18.5 21 C16.5 23 16 27 20 29 C24.5 27 25 20 20 8 Z" fill="${d.accent}"/>
      <line x1="20" y1="29" x2="20" y2="32" stroke="${d.accent}" stroke-width="1.4"/>
      <path d="M11 34 C11 30 29 30 29 34 L27 78 C27 82 13 82 13 78 Z" stroke="${d.accent}" stroke-width="2"/>
      <ellipse cx="20" cy="34" rx="9" ry="2.6" stroke="${d.accent}" stroke-width="1.6"/>
      <ellipse cx="20" cy="82" rx="14" ry="3.6" stroke="${d.accent}" stroke-width="2"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:600;font-size:1.2rem;color:${d.accent};line-height:1.1;">${esc(d.name)}</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:.9rem;color:#e3cfa8;">noche de vino</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Noche de Vino",
  summary: "Vino profundo y luz de vela titilando de verdad, con motitas doradas flotando despacio — una cena íntima para festejar entre pocos y queridos.",
  accent: "#d9a94f", accent2: "#4a1220", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
