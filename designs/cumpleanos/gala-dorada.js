const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { cumpleanosSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "cum-gala-dorada";

const sampleData = {
  nombre: "Fede",
  edad: "40",
  fecha: "2027-05-15",
  hora: "21:00",
  lugar: "Salón Dorá Eventos, Palermo",
  direccionMapa: "https://maps.google.com/?q=Salón+de+Eventos+Palermo+Buenos+Aires",
  mensaje: "Cuarenta años dan para festejar en grande. Vengan a brindar conmigo, a bailar hasta que salga el sol y a llenar la noche de los que más quiero. ¡Los espero de gala!",
  dressCode: "Elegante sport, dorado y negro",
  whatsapp: "5491100000031",
  fechaLimiteRSVP: "2027-05-01",
  coverImage: "/static/img/samples/cumple-gala-cover.jpg",
  galeria: [
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  ],
};

// Motivos de gala dibujados a mano en SVG inline: copas entrechocando,
// burbujas y una línea de confeti fino dorado, sin depender de íconos externos.
const clinkSVG = `<svg class="motif motif-clink" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g transform="rotate(-16 34 44)">
    <path d="M22 8 C22 24 28 32 34 36 C40 32 46 24 46 8 Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <line x1="34" y1="36" x2="34" y2="72" stroke="currentColor" stroke-width="1.4"/>
    <ellipse cx="34" cy="76" rx="12" ry="3.6" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="30" cy="16" r="1" fill="currentColor"/>
    <circle cx="37" cy="22" r=".8" fill="currentColor"/>
  </g>
  <g transform="rotate(16 126 44)">
    <path d="M114 8 C114 24 120 32 126 36 C132 32 138 24 138 8 Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <line x1="126" y1="36" x2="126" y2="72" stroke="currentColor" stroke-width="1.4"/>
    <ellipse cx="126" cy="76" rx="12" ry="3.6" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="122" cy="16" r="1" fill="currentColor"/>
    <circle cx="130" cy="22" r=".8" fill="currentColor"/>
  </g>
  <circle cx="70" cy="16" r="1.1" fill="currentColor"/>
  <circle cx="78" cy="8" r=".9" fill="currentColor"/>
  <circle cx="86" cy="18" r="1" fill="currentColor"/>
  <circle cx="92" cy="10" r=".8" fill="currentColor"/>
</svg>`;

const champagneSVG = `<svg class="motif motif-champagne" viewBox="0 0 40 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 6 C8 22 14 30 20 34 C26 30 32 22 32 6 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <line x1="20" y1="34" x2="20" y2="72" stroke="currentColor" stroke-width="1.3"/>
  <ellipse cx="20" cy="76" rx="13" ry="4" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="16" cy="14" r="1" fill="currentColor"/>
  <circle cx="22" cy="20" r=".8" fill="currentColor"/>
  <circle cx="18" cy="24" r=".9" fill="currentColor"/>
  <circle cx="24" cy="12" r=".7" fill="currentColor"/>
</svg>`;

function confettiSVG(extraClass) {
  return `<svg class="motif motif-confetti${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="12" r="2" fill="currentColor"/>
    <rect x="34" y="6" width="4" height="4" transform="rotate(30 36 8)" fill="currentColor"/>
    <circle cx="62" cy="20" r="1.6" fill="currentColor"/>
    <path d="M92 26 l3.4 -3.4 l3.4 3.4 l-3.4 3.4 z" fill="currentColor"/>
    <circle cx="128" cy="10" r="1.8" fill="currentColor"/>
    <rect x="152" y="20" width="4" height="4" transform="rotate(-20 154 22)" fill="currentColor"/>
    <circle cx="186" cy="14" r="2" fill="currentColor"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${confettiSVG()}${clinkSVG.replace('motif-clink', 'motif-clink motif-clink-small')}${confettiSVG("flip")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#D4AF37");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd-gala");
  const gal = galleryWidget(d.galeria, "gal-gala");
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
    { titulo: "Recepción y brindis", detalle: "Bienvenida con copas en mano para arrancar la noche a pura elegancia." },
    { titulo: "Cena", detalle: "Nos sentamos a compartir la mesa, entre risas y buenos vinos." },
    { titulo: "Palabras y torta", detalle: "Un brindis especial, algunas palabras y el corte de la torta." },
    { titulo: "Baile hasta que el cuerpo aguante", detalle: "Pista abierta, buena música y fiesta hasta que salga el sol." },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:${accent};
    --gold-soft:color-mix(in srgb, ${accent}, white 30%);
    --ink:#141317;
    --ink-2:#1c1a20;
    --cream:#f6f1e6;
    --cream-dim:#c9c2b3;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--ink);color:var(--cream);font-family:'Montserrat',sans-serif;font-weight:400;}
  img{max-width:100%;}
  h1,h2,h3{font-family:'Playfair Display',Georgia,'Times New Roman',serif;}

  .motif{color:var(--gold);}
  .motif-champagne{width:clamp(26px,6vw,38px);height:auto;}
  .motif-clink{width:clamp(90px,20vw,140px);height:auto;margin:0 auto;}
  .motif-clink-small{width:clamp(60px,14vw,90px);}
  .motif-confetti{width:clamp(60px,16vw,130px);height:auto;flex:1 1 auto;}
  .motif-confetti.flip{transform:scaleX(-1);}
  .divider{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,16px);max-width:520px;margin:0 auto 28px;}

  .hero{position:relative;min-height:96vh;display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:48px 20px 60px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,19,23,.35) 0%,rgba(20,19,23,.55) 45%,rgba(20,19,23,.92) 100%);}
  .hero-content{position:relative;z-index:1;max-width:680px;}
  .eyebrow{letter-spacing:.42em;text-transform:uppercase;font-size:clamp(.62rem,1.6vw,.78rem);color:var(--gold-soft);margin:0 0 10px;}
  .hero-content h1{font-size:clamp(2.4rem,8vw,4.2rem);font-weight:800;margin:0 0 4px;color:var(--cream);letter-spacing:1px;}
  .hero-age{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:800;font-size:clamp(4.5rem,20vw,8rem);line-height:.85;color:var(--gold);margin:6px 0;text-shadow:0 10px 40px rgba(0,0,0,.5);}
  .hero-date{letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.72rem,2vw,.9rem);color:var(--cream-dim);margin-top:14px;}
  .hero-champagnes{display:flex;justify-content:center;gap:18px;margin-top:24px;}

  section{max-width:760px;margin:0 auto;padding:66px 24px;text-align:center;}
  h2{font-weight:800;letter-spacing:2px;text-transform:uppercase;font-size:clamp(1.1rem,2.8vw,1.5rem);color:var(--gold);margin:0 0 30px;}

  .quote-wrap{max-width:600px;margin:0 auto;}
  .quote-wrap p{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-style:italic;font-size:clamp(1.05rem,2.6vw,1.35rem);line-height:1.75;color:var(--cream);}
  .quote-wrap p::before,.quote-wrap p::after{color:var(--gold);}
  .quote-wrap p::before{content:"“";}
  .quote-wrap p::after{content:"”";}

  .countdown{display:flex;gap:clamp(10px,4vw,30px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:56px;}
  .cd-num{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:clamp(1.8rem,5vw,2.6rem);color:var(--gold);}
  .cd-label{font-size:.64rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--cream-dim);}

  .agenda{list-style:none;margin:0;padding:0;max-width:520px;margin:0 auto;text-align:left;position:relative;}
  .agenda::before{content:"";position:absolute;left:19px;top:6px;bottom:6px;width:1px;background:linear-gradient(180deg, var(--gold), transparent);}
  .agenda li{position:relative;padding:0 0 34px 56px;}
  .agenda li:last-child{padding-bottom:0;}
  .agenda-num{position:absolute;left:0;top:-2px;width:40px;height:40px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:800;color:var(--gold);font-size:1rem;background:var(--ink);}
  .agenda h3{margin:2px 0 6px;font-size:1.05rem;font-weight:800;color:var(--cream);letter-spacing:.3px;}
  .agenda p{margin:0;color:var(--cream-dim);line-height:1.6;font-size:.92rem;}

  .venue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;text-align:left;margin-top:8px;}
  .venue-card{background:var(--ink-2);border:1px solid color-mix(in srgb, var(--gold) 35%, transparent);box-shadow:0 6px 26px rgba(0,0,0,.4);padding:32px;border-radius:6px;text-align:center;}
  .venue-card h3{margin:0 0 10px;font-weight:800;letter-spacing:.5px;color:var(--gold);font-size:1.2rem;}
  .venue-card p{margin:0 0 6px;line-height:1.7;color:var(--cream-dim);}
  .maplink{display:inline-block;margin-top:16px;color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold);letter-spacing:.5px;font-size:.9rem;}
  .dresscode-row{margin-top:16px;padding-top:16px;border-top:1px dashed color-mix(in srgb, var(--gold) 45%, transparent);}
  .dresscode-row .label{display:block;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--gold);margin-bottom:6px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:4px;cursor:pointer;filter:saturate(1.05) brightness(.96);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,9,11,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:2px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cream);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.76rem;text-transform:uppercase;letter-spacing:1px;color:var(--cream-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Montserrat',sans-serif;padding:11px;border:1px solid color-mix(in srgb, var(--gold) 40%, transparent);border-radius:3px;margin-top:5px;width:100%;background:var(--ink-2);color:var(--cream);}
  .rsvp-form button{background:var(--gold);color:var(--ink);border:0;padding:14px;border-radius:3px;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;font-size:.82rem;font-weight:600;transition:opacity .2s;}
  .rsvp-form button:hover{opacity:.85;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold);text-align:center;text-decoration:none;}
  .rsvp-status{text-align:center;color:#9fd08a;font-weight:bold;}

  footer{text-align:center;padding:48px 24px 56px;font-size:.85rem;color:var(--cream-dim);border-top:1px solid color-mix(in srgb, var(--gold) 30%, transparent);background:var(--ink-2);}
  footer .motif-champagne{width:28px;height:auto;margin:0 auto 14px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-content">
      <p class="eyebrow">Cumpleaños de gala</p>
      <h1>${esc(d.nombre)}</h1>
      ${d.edad ? `<div class="hero-age">${esc(d.edad)}</div>` : ""}
      ${fechaLarga ? `<p class="hero-date">${esc(fechaLarga)}</p>` : ""}
      <div class="hero-champagnes">${champagneSVG}${champagneSVG}${champagneSVG}</div>
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
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;color:var(--gold);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    ${champagneSVG}
    Brindamos por ${esc(d.nombre)} — ¡nos vemos ahí!
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg, ${d.accent2} 0%, #26232a 100%);">
    <svg viewBox="0 0 160 100" width="52" height="34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="rotate(-16 34 44)">
        <path d="M22 8 C22 24 28 32 34 36 C40 32 46 24 46 8 Z" stroke="${d.accent}" stroke-width="2"/>
        <line x1="34" y1="36" x2="34" y2="72" stroke="${d.accent}" stroke-width="2"/>
        <ellipse cx="34" cy="76" rx="12" ry="3.6" stroke="${d.accent}" stroke-width="2"/>
        <circle cx="30" cy="16" r="1.4" fill="${d.accent}"/>
        <circle cx="37" cy="22" r="1.1" fill="${d.accent}"/>
      </g>
      <g transform="rotate(16 126 44)">
        <path d="M114 8 C114 24 120 32 126 36 C132 32 138 24 138 8 Z" stroke="${d.accent}" stroke-width="2"/>
        <line x1="126" y1="36" x2="126" y2="72" stroke="${d.accent}" stroke-width="2"/>
        <ellipse cx="126" cy="76" rx="12" ry="3.6" stroke="${d.accent}" stroke-width="2"/>
        <circle cx="122" cy="16" r="1.4" fill="${d.accent}"/>
        <circle cx="130" cy="22" r="1.1" fill="${d.accent}"/>
      </g>
      <circle cx="70" cy="16" r="1.6" fill="${d.accent}"/>
      <circle cx="80" cy="8" r="1.3" fill="${d.accent}"/>
      <circle cx="90" cy="18" r="1.4" fill="${d.accent}"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:1.2rem;color:${d.accent};line-height:1.1;">${esc(d.name)}</div>
    <div style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:1rem;color:#efe0b0;">gala</div>
  </div>`;
}

module.exports = {
  id, category: "cumpleanos", name: "Gala Dorada",
  summary: "Cumpleaños de adultos en clave de gala elegante, negro y dorado, con copas de brindis y glamour de gran fiesta.",
  accent: "#D4AF37", accent2: "#141317", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
