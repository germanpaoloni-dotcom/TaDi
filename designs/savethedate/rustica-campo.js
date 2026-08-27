const { esc, countdownWidget, galleryWidget, formatFechaCorta, tadiFooterWidget, googleCalendarLink } = require("../widgets");
const { saveTheDateSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "std-rustica-campo";

// Misma paleta, tipografía y motivos exactos que designs/bodas/rustica-campo.js,
// porque este save the date acompaña a esa invitación de boda.
const ACCENT_FALLBACK = "#b5651d";
const ACCENT2 = "#7c8f6e";

const sampleData = {
  novia: "Florencia", novio: "Tomás",
  fecha: "2027-11-13",
  lugar: "Cañuelas, Buenos Aires",
  mensaje: "Guardá la fecha: nos gusta pensar el amor como algo que se cultiva de a poco. Después de un tiempo sembrando esta historia juntos, queremos celebrar la cosecha rodeados de las personas que más queremos.",
  instagram: "flor.tomas.boda",
  whatsapp: "5491100000041",
  coverImage: "https://images.unsplash.com/photo-1646366045654-ed6b2b355dc9?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
  ],
};

// --- Ornamentos dibujados a mano en SVG: los mismos motivos rústicos que
// designs/bodas/rustica-campo.js — flores silvestres de trazo orgánico,
// textura de papel kraft y un cordel/piolín como separador. Todo inline. ---

// Ramita de flores silvestres: tallo curvo asimétrico, un par de hojas y
// una florcita tipo margarita de pétalos desparejos + un capullo chico,
// como dibujado a mano con pluma.
function wildflowerSprigSVG(w = 140, rotate = 0, accent = "#b5651d", accent2 = "#7c8f6e") {
  return `<svg class="sprig" width="${w}" height="${Math.round(w * 0.56)}" viewBox="0 0 160 90" style="transform:rotate(${rotate}deg)" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 82 C 36 72, 66 62, 90 34 C 104 20, 120 12, 152 7" fill="none" stroke="${accent2}" stroke-width="2.1" stroke-linecap="round" opacity=".85"/>
    <path d="M40 76 C 29 69, 24 58, 32 49 C 43 55, 47 67, 40 76 Z" fill="${accent2}" opacity=".78"/>
    <path d="M66 58 C 57 49, 55 38, 65 29 C 75 37, 76 50, 66 58 Z" fill="${accent2}" opacity=".7"/>
    <g transform="translate(110,22)">
      <path d="M0 -12 C 4 -8 4 -2 0 0 C -4 -2 -4 -8 0 -12Z" fill="#f4ead4"/>
      <path d="M12 -1 C 7 3 2 3 0 0 C 2 -4 7 -4 12 -1Z" fill="#f4ead4"/>
      <path d="M1 12 C -3 7 -3 2 0 0 C 4 2 4 7 1 12Z" fill="#f4ead4"/>
      <path d="M-11 2 C -6 -3 -1 -3 0 0 C -3 3 -7 4 -11 2Z" fill="#f4ead4"/>
      <path d="M8 -8 C 5 -4 2 -2 0 0 C 2 -3 4 -6 8 -8Z" fill="#f4ead4" opacity=".9"/>
      <path d="M-7 8 C -4 4 -2 2 0 0 C -2 3 -3 6 -7 8Z" fill="#f4ead4" opacity=".9"/>
      <circle cx="0" cy="0" r="3.6" fill="${accent}"/>
    </g>
    <g transform="translate(140,9) scale(.62)">
      <circle cx="0" cy="-8" r="4.6" fill="${accent}" opacity=".92"/>
      <circle cx="6" cy="-2" r="4.6" fill="${accent}" opacity=".82"/>
      <circle cx="-6" cy="-2" r="4.6" fill="${accent}" opacity=".82"/>
      <circle cx="0" cy="4" r="4.6" fill="${accent}" opacity=".88"/>
      <circle cx="0" cy="-2" r="3" fill="#6e4415"/>
    </g>
  </svg>`;
}

// Ramo de esquina, más grande y con dos ramitas cruzadas, para las
// esquinas del hero (como flores silvestres atadas apoyadas en el marco).
function cornerBouquetSVG(w = 128, mirror = false, accent = "#b5651d", accent2 = "#7c8f6e") {
  const flip = mirror ? "scaleX(-1)" : "none";
  return `<div style="transform:${flip};line-height:0;">
    <svg width="${w}" height="${Math.round(w * 0.85)}" viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 112 C 34 96, 44 70, 40 40 C 38 24, 44 12, 58 4" fill="none" stroke="${accent2}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
      <path d="M8 112 C 40 108, 60 88, 66 58 C 70 40, 82 26, 100 18" fill="none" stroke="${accent2}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="M30 78 C 20 72, 15 62, 22 52 C 32 57, 37 68, 30 78 Z" fill="${accent2}" opacity=".78"/>
      <path d="M52 46 C 43 39, 41 29, 49 20 C 58 27, 60 39, 52 46 Z" fill="${accent2}" opacity=".7"/>
      <g transform="translate(58,10)">
        <path d="M0 -13 C 4 -9 4 -2 0 0 C -4 -2 -4 -9 0 -13Z" fill="#f4ead4"/>
        <path d="M13 -1 C 8 3 2 3 0 0 C 2 -4 8 -4 13 -1Z" fill="#f4ead4"/>
        <path d="M1 13 C -3 8 -3 2 0 0 C 4 2 4 8 1 13Z" fill="#f4ead4"/>
        <path d="M-12 2 C -7 -3 -1 -3 0 0 C -3 3 -8 4 -12 2Z" fill="#f4ead4"/>
        <circle cx="0" cy="0" r="4" fill="${accent}"/>
      </g>
      <g transform="translate(96,16) scale(.7)">
        <circle cx="0" cy="-8" r="4.8" fill="${accent}" opacity=".92"/>
        <circle cx="6" cy="-2" r="4.8" fill="${accent}" opacity=".82"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${accent}" opacity=".82"/>
        <circle cx="0" cy="4" r="4.8" fill="${accent}" opacity=".88"/>
        <circle cx="0" cy="-2" r="3.1" fill="#6e4415"/>
      </g>
      <g transform="translate(20,60) scale(.55)">
        <circle cx="0" cy="-8" r="4.8" fill="${accent2}" opacity=".85"/>
        <circle cx="6" cy="-2" r="4.8" fill="${accent2}" opacity=".78"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${accent2}" opacity=".78"/>
        <circle cx="0" cy="4" r="4.8" fill="${accent2}" opacity=".82"/>
        <circle cx="0" cy="-2" r="3" fill="#4a5a3e"/>
      </g>
    </svg>
  </div>`;
}

// Separador de sección tipo cordel de arpillera: una línea sinuosa doble
// (como una soga) con un lacito de piolín anudado en el centro.
function twineDividerSVG(width = 200, color = "#a9835a") {
  return `<svg class="twine-divider" width="${width}" height="26" viewBox="0 0 200 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14 C 38 4, 68 24, 94 13" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <path d="M106 13 C 132 2, 162 22, 196 12" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <g transform="translate(100,13)">
      <path d="M-11 -7 C -16 -11 -15 3 -10 7 C -5 3 -6 -9 0 0 C 6 -9 5 3 10 7 C 15 3 16 -11 11 -7 C 6 -3 -6 -3 -11 -7Z" fill="none" stroke="${color}" stroke-width="1.7"/>
      <circle cx="0" cy="0" r="2.3" fill="${color}"/>
    </g>
  </svg>`;
}

// Textura de papel kraft muy sutil: fibras y motitas irregulares
// repetidas como fondo, para dar sensación de papel reciclado hecho a mano.
function kraftTextureSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <rect width="180" height="180" fill="#d9c19c"/>
    <g stroke="#8a6a41" stroke-width=".6" opacity=".07">
      <path d="M0 20 C 40 10, 60 34, 100 18 C 140 4, 160 26, 180 14"/>
      <path d="M0 70 C 30 82, 70 58, 110 74 C 145 88, 160 64, 180 76"/>
      <path d="M0 128 C 36 118, 64 142, 104 126 C 138 112, 158 134, 180 122"/>
      <path d="M0 168 C 34 158, 70 178, 112 162 C 146 150, 162 172, 180 160"/>
    </g>
    <g fill="#7c5a34" opacity=".06">
      <circle cx="24" cy="46" r="1.4"/><circle cx="86" cy="12" r="1.1"/>
      <circle cx="150" cy="52" r="1.3"/><circle cx="42" cy="100" r="1.2"/>
      <circle cx="112" cy="96" r="1.4"/><circle cx="164" cy="112" r="1.1"/>
      <circle cx="18" cy="150" r="1.3"/><circle cx="96" cy="154" r="1.2"/>
      <circle cx="140" cy="166" r="1.1"/>
    </g>
  </svg>`;
}

// Ícono chico de calendario para el botón "Agregar a mi calendario",
// con trazo simple que combina con el resto de los íconos manuscritos.
function calendarIconSVG(size = 18, color = "#f6ecd8") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-4px;margin-right:8px;" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="${color}" stroke-width="1.4"/>
    <path d="M3 10h18" stroke="${color}" stroke-width="1.4"/>
    <path d="M7 2v6M17 2v6" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="7.5" y="13" width="3" height="3" fill="${color}"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", ACCENT_FALLBACK);
  const accent2 = ACCENT2;
  const cd = countdownWidget(d.fecha || sampleData.fecha, "cdstdrustica");
  const gal = galleryWidget(d.galeria, "galstdrustica");
  const calLink = googleCalendarLink({
    title: `${d.novia} & ${d.novio} se casan`,
    dateISO: d.fecha,
    time: "18:00",
    location: d.lugar,
  });
  const kraftURI = `data:image/svg+xml,${encodeURIComponent(kraftTextureSVG())}`;
  const hasContact = d.instagram || d.whatsapp;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} — Save the Date</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&amp;family=Bitter:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet">
<style>
  :root{
    --accent:${accent}; --accent2:${accent2};
    --kraft:#cfb488; --kraft-dark:#9c7847; --kraft-deep:#6b4a26;
    --paper:#f6ecd8; --ink:#42311f; --wood:#6b4423; --rope:#a9835a;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--kraft) url('${kraftURI}');background-size:180px 180px;color:var(--ink);font-family:'Bitter',Georgia,serif;font-weight:400;font-size:1.04rem;line-height:1.7;}
  h1,h2,h3{font-family:'Caveat',cursive;font-weight:700;color:var(--kraft-deep);margin:0;}
  .script{font-family:'Caveat',cursive;color:var(--kraft-deep);}
  a{color:var(--accent);}
  img{max-width:100%;display:block;}
  section{max-width:740px;margin:0 auto;padding:clamp(32px,6vw,60px) clamp(18px,5vw,26px);text-align:center;}

  .eyebrow{letter-spacing:3px;text-transform:uppercase;font-size:.72rem;color:var(--accent2);font-family:'Bitter',serif;font-weight:700;}
  h2.section-title{font-size:clamp(1.8rem,5.6vw,2.5rem);margin:4px 0 18px;}
  .divider-flor{display:flex;justify-content:center;margin:6px 0 4px;}
  .sprig{max-width:100%;height:auto;}
  .twine-divider{max-width:100%;height:auto;margin:0 auto;display:block;}

  /* HERO */
  .hero{position:relative;padding:clamp(40px,7vw,72px) 16px clamp(50px,8vw,80px);text-align:center;overflow:hidden;background:linear-gradient(180deg,var(--kraft) 0%,#c3a878 100%);}
  .hero::before{content:"";position:absolute;inset:0;background:url('${kraftURI}');background-size:180px 180px;opacity:.5;pointer-events:none;}
  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}
  .hero-corner{position:absolute;z-index:1;pointer-events:none;opacity:.95;}
  .hero-corner.hc-tl{top:-6px;left:-6px;}
  .hero-corner.hc-br{bottom:-6px;right:-6px;}
  .hero .eyebrow{color:var(--kraft-deep);opacity:.8;}
  .hero h1{font-size:clamp(2.6rem,10vw,4.6rem);line-height:1;color:var(--kraft-deep);margin:10px 0;text-shadow:0 1px 0 rgba(255,255,255,.25);}
  .hero h1 .amp{color:var(--accent);padding:0 .1em;display:inline-block;}
  .hero-frame{width:min(76%,300px);aspect-ratio:4/5;margin:20px auto 8px;background:var(--paper);padding:14px 14px 34px;box-shadow:0 16px 32px rgba(80,55,25,.32),0 0 0 1px rgba(255,255,255,.4) inset;position:relative;transform:rotate(-1.4deg);}
  .hero-frame .frame-img-wrap{width:100%;height:100%;overflow:hidden;}
  .hero-frame img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.94) contrast(1.02);}
  .hero-frame .tape{position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(-2deg);width:74px;height:26px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(240,225,190,.55));border:1px solid rgba(255,255,255,.4);box-shadow:0 2px 4px rgba(0,0,0,.12);}
  .hero .fecha-linda{margin-top:14px;font-size:clamp(1rem,3vw,1.25rem);letter-spacing:2px;color:var(--wood);text-transform:uppercase;font-family:'Bitter',serif;font-weight:600;}

  /* Tarjeta tipo tabla de madera / kraft oscuro */
  .wood-card{position:relative;overflow:hidden;background:linear-gradient(165deg,#8a6136,var(--wood) 55%,#4d3116);border-radius:14px;padding:clamp(26px,5vw,44px) clamp(18px,5vw,32px);color:var(--paper);box-shadow:0 14px 30px rgba(60,38,16,.3);border:1px solid rgba(255,255,255,.08);}
  .wood-card::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(255,255,255,.03) 0 3px,transparent 3px 9px);pointer-events:none;}
  .wood-card h2,.wood-card h3{color:var(--paper);}
  .wood-card p{color:#e6d6b8;}

  /* COUNTDOWN — etiquetas colgantes tipo tag de vidrio/madera */
  .countdown{display:flex;gap:clamp(8px,3vw,18px);justify-content:center;flex-wrap:wrap;margin:22px 0 0;}
  .countdown div{position:relative;display:flex;flex-direction:column;background:rgba(255,255,255,.07);border:1px solid rgba(230,214,184,.35);border-radius:8px;width:clamp(64px,16vw,86px);height:clamp(64px,16vw,86px);align-items:center;justify-content:center;}
  .countdown div::before{content:"";position:absolute;top:6px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:var(--wood);border:1px solid rgba(230,214,184,.5);}
  .cd-num{font-family:'Bitter',serif;font-weight:700;font-size:clamp(1.15rem,4vw,1.5rem);color:var(--accent);margin-top:4px;}
  .cd-label{font-size:.58rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--paper);opacity:.75;margin-top:2px;}

  .cal-btn{display:inline-flex;align-items:center;margin-top:26px;font-family:'Bitter',serif;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;font-size:.8rem;color:var(--paper);background:var(--accent);padding:13px 26px;border-radius:6px;text-decoration:none;transition:background .2s;}
  .cal-btn:hover{background:#9a5216;}

  /* MENSAJE tipo hoja de cuaderno de campo */
  .paper-card{background:var(--paper);max-width:560px;margin:0 auto;padding:30px clamp(20px,5vw,40px);border-radius:2px;position:relative;box-shadow:0 12px 26px rgba(60,38,16,.16);transform:rotate(.5deg);}
  .paper-card::before{content:"";position:absolute;top:-10px;left:50%;transform:translateX(-50%) rotate(-1deg);width:70px;height:24px;background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(240,225,190,.5));border:1px solid rgba(255,255,255,.4);box-shadow:0 2px 4px rgba(0,0,0,.1);}
  .message{font-size:clamp(1.25rem,3vw,1.6rem);font-family:'Caveat',cursive;font-weight:600;color:var(--kraft-deep);margin:0;line-height:1.45;}

  /* LUGAR — etiqueta de equipaje de arpillera */
  .lugar-badge{display:inline-block;background:var(--paper);border:1px dashed var(--kraft-dark);border-radius:6px;padding:12px 26px;margin-top:6px;font-family:'Bitter',serif;font-weight:700;color:var(--kraft-deep);letter-spacing:.5px;box-shadow:0 8px 18px rgba(60,38,16,.14);}
  .nota-fija{max-width:480px;margin:22px auto 0;font-size:.9rem;color:var(--kraft-deep);opacity:.85;font-family:'Caveat',cursive;font-size:1.2rem;font-weight:600;}

  /* CONTACTO */
  .contact-row{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:18px;}
  .contact-row a{font-family:'Bitter',serif;font-weight:600;letter-spacing:.3px;font-size:.88rem;color:var(--accent2);text-decoration:none;border-bottom:1px solid var(--accent2);padding-bottom:2px;}
  .contact-row a:hover{color:var(--accent);border-color:var(--accent);}

  /* GALERÍA — fotos tipo polaroid apiladas prolijamente */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:18px 14px;margin-top:28px;}
  .gallery-item{background:var(--paper);padding:8px 8px 22px;box-shadow:0 10px 20px rgba(60,38,16,.18);position:relative;}
  .gallery-item:nth-child(odd){transform:rotate(-2deg);}
  .gallery-item:nth-child(even){transform:rotate(1.6deg);}
  .gallery-item::before{content:"";position:absolute;top:-9px;left:50%;transform:translateX(-50%) rotate(-3deg);width:46px;height:18px;background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(240,225,190,.5));border:1px solid rgba(255,255,255,.4);}
  .gallery img{width:100%;height:clamp(110px,20vw,170px);object-fit:cover;display:block;cursor:pointer;filter:saturate(.95);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(45,29,12,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:4px;border:6px solid var(--paper);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--paper);font-size:2rem;cursor:pointer;line-height:1;}

  footer{position:relative;text-align:center;padding:54px 20px 42px;color:var(--paper);background:linear-gradient(165deg,#8a6136,var(--wood) 55%,#4d3116);overflow:hidden;}
  footer .inner{position:relative;z-index:1;}
  footer .script{font-size:clamp(2.2rem,7vw,3rem);display:block;margin-bottom:8px;color:var(--paper);}
  footer p{margin:0;font-size:.92rem;opacity:.85;font-family:'Bitter',serif;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-corner hc-tl">${cornerBouquetSVG(100, false, accent, accent2)}</div>
    <div class="hero-corner hc-br">${cornerBouquetSVG(100, true, accent, accent2)}</div>
    <div class="hero-inner">
      <div class="eyebrow">Guardá la fecha</div>
      <h1>${esc(d.novia)} <span class="amp">&amp;</span> ${esc(d.novio)}</h1>
      <div class="hero-frame">
        <div class="tape"></div>
        <div class="frame-img-wrap"><img src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}"></div>
      </div>
      <div class="fecha-linda">${fechaLarga(d.fecha)}</div>
    </div>
  </div>

  ${d.mensaje ? `<section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    <div class="paper-card">
      <p class="message">${esc(d.mensaje)}</p>
    </div>
  </section>` : ""}

  <section>
    <p class="eyebrow">Cuenta regresiva</p>
    <h2 class="section-title">Faltan</h2>
    <div class="wood-card">
      ${cd.html}
      ${calLink ? `<a class="cal-btn" href="${esc(calLink)}" target="_blank" rel="noopener">${calendarIconSVG(18, "#f6ecd8")}Agregar a mi calendario</a>` : ""}
    </div>
  </section>

  <section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    ${d.lugar ? `<p class="eyebrow">Dónde va a ser</p><div class="lugar-badge">${esc(d.lugar)}</div>` : ""}
    <p class="nota-fija">La invitación con todos los detalles llega más adelante — por ahora, ¡agendá la fecha!</p>
    ${hasContact ? `<div class="contact-row">
      ${d.instagram ? `<a href="https://instagram.com/${esc(String(d.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">📷 @${esc(String(d.instagram).replace(/^@/, ""))}</a>` : ""}
      ${d.whatsapp ? `<a href="https://wa.me/${esc(d.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
    </div>` : ""}
  </section>

  ${(d.galeria && d.galeria.length) ? `<section>
    <div class="divider-flor">${twineDividerSVG(190, "#a9835a")}</div>
    <p class="eyebrow">Recuerdos</p>
    <h2 class="section-title">Nuestro camino hasta acá</h2>
    ${gal.html}
  </section>` : ""}

  <footer>
    <div class="inner">
      <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
      <p>Con todo nuestro cariño, ¡esperamos verte pronto!</p>
    </div>
  </footer>

  <script>${cd.script}${gal.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function fechaLarga(fechaISO) {
  if (!fechaISO) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, dd] = String(fechaISO).split("-").map(Number);
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd} de ${meses[m - 1]} de ${y}`;
}

// Preview en miniatura para la grilla del catálogo: fondo cálido tipo
// kraft con una ramita de flores silvestres dibujada a mano en la
// esquina y el nombre del diseño en manuscrita, con buen contraste.
// Solo estilos inline, sin <style> ni var() (site.css es compartido).
function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(160deg,#e2c99a 0%,#c9a876 55%,#a9835a 100%);">
    <svg style="position:absolute;bottom:-6px;left:-8px;width:120px;height:auto;opacity:.95;" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 82 C 36 72, 66 62, 90 34 C 104 20, 120 12, 152 7" fill="none" stroke="${d.accent2}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
      <path d="M40 76 C 29 69, 24 58, 32 49 C 43 55, 47 67, 40 76 Z" fill="${d.accent2}" opacity=".8"/>
      <path d="M66 58 C 57 49, 55 38, 65 29 C 75 37, 76 50, 66 58 Z" fill="${d.accent2}" opacity=".72"/>
      <g transform="translate(110,22)">
        <path d="M0 -12 C 4 -8 4 -2 0 0 C -4 -2 -4 -8 0 -12Z" fill="#f7efdd"/>
        <path d="M12 -1 C 7 3 2 3 0 0 C 2 -4 7 -4 12 -1Z" fill="#f7efdd"/>
        <path d="M1 12 C -3 7 -3 2 0 0 C 4 2 4 7 1 12Z" fill="#f7efdd"/>
        <path d="M-11 2 C -6 -3 -1 -3 0 0 C -3 3 -7 4 -11 2Z" fill="#f7efdd"/>
        <circle cx="0" cy="0" r="3.8" fill="${d.accent}"/>
      </g>
      <g transform="translate(140,9) scale(.65)">
        <circle cx="0" cy="-8" r="4.8" fill="${d.accent}" opacity=".92"/>
        <circle cx="6" cy="-2" r="4.8" fill="${d.accent}" opacity=".82"/>
        <circle cx="-6" cy="-2" r="4.8" fill="${d.accent}" opacity=".82"/>
        <circle cx="0" cy="4" r="4.8" fill="${d.accent}" opacity=".88"/>
        <circle cx="0" cy="-2" r="3.1" fill="#6e4415"/>
      </g>
    </svg>
    <div style="position:relative;z-index:1;font-family:'Segoe Script','Brush Script MT',cursive;font-size:1.1rem;font-weight:700;color:#4a2f12;text-shadow:0 1px 0 rgba(255,255,255,.35);text-align:center;padding:0 18px;">Save the Date</div>
    <div style="position:relative;z-index:1;font-family:'Segoe Script','Brush Script MT',cursive;font-size:1.4rem;font-weight:700;color:#4a2f12;text-shadow:0 1px 0 rgba(255,255,255,.35);text-align:center;padding:0 18px;">${esc(d.name)}</div>
  </div>`;
}

module.exports = {
  id, category: "savethedate", name: "Rústica de Campo",
  summary: "Papel kraft, madera y flores silvestres dibujadas a mano — el save the date rústico y campestre que acompaña a la invitación de boda.",
  accent: ACCENT_FALLBACK, accent2: ACCENT2, schema: saveTheDateSchema, sampleData, render, cardPreview,
};
