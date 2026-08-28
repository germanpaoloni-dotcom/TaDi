const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-fiesta-serpentinas";

const sampleData = {
  nombre: "Milagros Herrera",
  fecha: "2027-09-11",
  horaCeremonia: "19:30",
  lugarCeremonia: "Parroquia San Cayetano",
  horaFiesta: "21:30",
  lugarFiesta: "Salón Metropolitan",
  direccionMapa: "https://maps.google.com/?q=Salon+Metropolitan",
  padres: "Ariel Herrera y Romina Castro",
  mensaje: "Llegó la noche que tanto soñé. Los invito a bailar, reír y celebrar juntos mis quince años — que no falte nadie en esta fiesta.",
  dressCode: "Formal de fiesta, se aceptan colores vibrantes",
  whatsapp: "5491100000064",
  fechaLimiteRSVP: "2027-08-15",
  coverImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    "https://images.unsplash.com/photo-1584890132374-d69d5d01483e?w=800&q=80",
    "https://images.unsplash.com/photo-1559456474-507a0d806eb7?w=800&q=80",
  ],
};

// Colores fijos "de gala" que acompañan al dorado de la paleta elegida
// (igual que otros diseños suman un segundo/tercer tono propio al acento):
// un magenta joya y un violeta joya, ambos pensados para verse ricos sobre
// fondo casi negro, nunca neón.
const JEWEL_MAGENTA = "#c23f74";
const JEWEL_VIOLET = "#8a4fb8";

// ---------- Motivos dibujados a mano en SVG inline (sin dependencias externas) ----------

function gemDividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="17" x2="76" y2="17" stroke="currentColor" stroke-width="1"/>
    <line x1="124" y1="17" x2="200" y2="17" stroke="currentColor" stroke-width="1"/>
    <path d="M100 4 L113 17 L100 30 L87 17 Z" fill="currentColor"/>
    <path d="M100 4 L106.5 17 L100 30 L93.5 17 Z" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
  </svg>`;
}

function iconChurchSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 3 L20 10 M16.5 6.5 L23.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 35 V17 L20 9 L31 17 V35" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="16" y="24" width="8" height="11" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="20" cy="18.5" r="2.6" stroke="currentColor" stroke-width="1.4"/>
    <line x1="4" y1="35" x2="36" y2="35" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

// Un pequeño estallido tipo fuegos artificiales / brindis de gala — para
// no repetir ni el confeti ni los globos de "Pop Vibrante".
function iconSparkleBurstSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="20" y1="4" x2="20" y2="15"/>
      <line x1="20" y1="25" x2="20" y2="36"/>
      <line x1="4" y1="20" x2="15" y2="20"/>
      <line x1="25" y1="20" x2="36" y2="20"/>
      <line x1="9" y1="9" x2="16" y2="16"/>
      <line x1="24" y1="24" x2="31" y2="31"/>
      <line x1="31" y1="9" x2="24" y2="16"/>
      <line x1="16" y1="24" x2="9" y2="31"/>
    </g>
    <circle cx="20" cy="20" r="4.2" fill="currentColor"/>
  </svg>`;
}

function iconGownSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="7" r="3.6" stroke="currentColor" stroke-width="1.5"/>
    <path d="M15 12 L20 16 L25 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M20 16 C 12 22, 8 30, 7 36 L33 36 C 32 30, 28 22, 20 16 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="20" y1="16" x2="20" y2="36" stroke="currentColor" stroke-width="1" opacity=".5"/>
  </svg>`;
}

function mapPinSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21s7-6.7 7-12a7 7 0 1 0-14 0c0 5.3 7 12 7 12Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="12" cy="9" r="2.4" fill="currentColor"/>
  </svg>`;
}

// ---------- Serpentinas: papel picado cayendo despacio y girando, tipo ----------
// confeti de gala en cámara lenta (no una explosión de cumpleaños infantil).
// Cada tira es un <div> angosto y largo con tres animaciones combinadas:
// caída (top, dentro del contenedor overflow:hidden), balanceo horizontal
// (translate) y giro suave (rotate) — todas con duraciones largas (7-13s)
// y delays negativos distintos para que ya estén "en pleno vuelo" al cargar.
function serpentinasLayer(colors, count = 13, seed = 0) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const n = i + seed;
    const color = colors[i % colors.length];
    const left = (3 + (i * (94 / (count - 1)))).toFixed(1);
    const wide = 6 + (n % 3) * 2; // 6, 8, 10
    const tall = 34 + (n % 4) * 6; // 34, 40, 46, 52
    const fallDur = (8 + (n % 6)).toFixed(1); // 8..13s
    const fallDelay = (-(n % 12) * 0.95).toFixed(2);
    const swayDur = (3.4 + (n % 4) * 0.6).toFixed(1); // 3.4..5.2s
    const swayDelay = (-(n % 7) * 0.5).toFixed(2);
    const spinDur = (4.2 + (n % 5) * 0.8).toFixed(1); // 4.2..7.4s
    const spinDelay = (-(n % 6) * 0.6).toFixed(2);
    const rot = n % 2 === 0 ? "14deg" : "20deg";
    items.push(
      `<div class="serp" style="left:${left}%;width:${wide}px;height:${tall}px;background:${color};` +
      `--rot:${rot};animation-duration:${fallDur}s,${swayDur}s,${spinDur}s;` +
      `animation-delay:${fallDelay}s,${swayDelay}s,${spinDelay}s;"></div>`
    );
  }
  return `<div class="serp-layer" aria-hidden="true">${items.join("")}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  // Todo el diseño vive sobre fondo oscuro joya, así que el acento de la
  // paleta siempre usa el tono pensado para fondos oscuros.
  const gold = getPaletteColor(d.colorPalette, "dark", "#c9a24a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-serp");
  const gal = galleryWidget(d.galeria || [], "gal-serp");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "xv", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Fecha calculada a mano (sin toLocaleDateString: el locale es-AR puede
  // no estar instalado completo en Node de producción).
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  let diaSemana = "", diaNumero = "", mesAnio = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const y = Number(partes[0]), m = Number(partes[1]), day = Number(partes[2]);
      const dt = new Date(y, m - 1, day);
      if (!isNaN(dt.getTime())) {
        diaSemana = DIAS[dt.getDay()];
        diaNumero = String(dt.getDate());
        mesAnio = `${MESES[dt.getMonth()]} ${dt.getFullYear()}`;
      }
    }
  }

  const serpColors = [gold, JEWEL_MAGENTA, JEWEL_VIOLET];
  const heroSerpentinas = serpentinasLayer(serpColors, 13, 0);
  const footerSerpentinas = serpentinasLayer(serpColors, 11, 5);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:${gold};
    --magenta:${JEWEL_MAGENTA};
    --violet:${JEWEL_VIOLET};
    --obsidian:#150711;
    --wine:#3a1230;
    --violet-deep:#33184a;
    --paper:#f6ead e;
    --paper:#f6eadd;
    --paper-dim:#cdb8cb;
    --ink:#1c0d1a;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--obsidian);color:var(--paper);line-height:1.7;font-size:1.05rem;}
  h1,h2{font-family:'Playfair Display',serif;font-weight:700;}
  p{margin:0;}
  img{max-width:100%;}

  .icon{width:clamp(30px,7vw,40px);height:auto;}
  .icon-ornament{width:clamp(120px,36vw,170px);height:auto;margin:18px auto;display:block;}

  /* ---------- Serpentinas: capa decorativa de fondo ---------- */
  .serp-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}
  .serp{
    position:absolute;top:-16%;border-radius:4px;opacity:.88;
    box-shadow:0 0 10px rgba(0,0,0,.25);
    animation-name:serpFall,serpSway,serpSpin;
    animation-timing-function:linear,ease-in-out,linear;
    animation-iteration-count:infinite,infinite,infinite;
  }
  @keyframes serpFall{
    0%{top:-16%;}
    100%{top:116%;}
  }
  @keyframes serpSway{
    0%,100%{translate:-16px;}
    50%{translate:16px;}
  }
  @keyframes serpSpin{
    0%{rotate:calc(-1 * var(--rot,16deg));}
    50%{rotate:var(--rot,16deg);}
    100%{rotate:calc(-1 * var(--rot,16deg));}
  }
  @media (prefers-reduced-motion: reduce){
    .serp{animation:none !important;opacity:.4;}
  }

  .card-section{position:relative;padding:clamp(56px,10vw,92px) 22px;overflow:hidden;}
  .card-section.on-obsidian{background:var(--obsidian);}
  .card-section.on-wine{background:radial-gradient(ellipse at 50% -10%, rgba(201,162,74,.14), transparent 62%), var(--wine);}
  .card-section.on-violet{background:var(--violet-deep);}

  .card-section > .inner{max-width:640px;margin:0 auto;text-align:center;position:relative;z-index:1;}

  .icon,.icon-ornament{color:var(--gold);}

  .eyebrow{letter-spacing:5px;text-transform:uppercase;font-size:clamp(.66rem,1.6vw,.8rem);margin:0 0 10px;color:var(--gold);}

  h1.brand-title{font-size:clamp(2.2rem,8.5vw,3.6rem);letter-spacing:2px;margin:6px 0 24px;text-transform:uppercase;color:var(--paper);text-shadow:0 2px 22px rgba(194,63,116,.35);}

  .photo-frame{position:relative;max-width:250px;margin:6px auto 26px;padding:9px;border:1px solid var(--gold);border-radius:6px;transform:rotate(-1.5deg);z-index:1;}
  .photo-frame img{width:100%;display:block;object-fit:cover;aspect-ratio:3/4;border-radius:2px;}

  .date-block{display:flex;align-items:center;justify-content:center;gap:16px;margin:8px auto 4px;flex-wrap:wrap;position:relative;z-index:1;}
  .date-block .line{flex:1;min-width:20px;max-width:60px;height:1px;background:var(--gold);opacity:.7;}
  .date-block .dow{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--gold);}
  .date-block .day{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,6vw,2.7rem);color:var(--paper);line-height:1;}
  .date-block .my{text-transform:uppercase;letter-spacing:2px;font-size:.78rem;color:var(--gold);text-align:left;}

  h2{font-size:clamp(1.2rem,3.2vw,1.6rem);text-transform:uppercase;letter-spacing:4px;margin:0 0 26px;color:var(--paper);}
  h2 .sub{display:block;font-family:'Cormorant Garamond',serif;text-transform:none;letter-spacing:0;font-style:italic;font-weight:400;font-size:.74rem;margin-top:6px;color:var(--paper-dim);}

  .padres{font-style:italic;font-size:clamp(1rem,2.3vw,1.12rem);margin:0 0 6px;}
  .blessing{text-transform:uppercase;letter-spacing:1.5px;font-size:.8rem;margin:0 0 14px;color:var(--gold);}
  .mensaje-txt{font-size:clamp(1rem,2.2vw,1.15rem);max-width:520px;margin:0 auto;}

  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{border:1px solid var(--gold);border-radius:8px;padding:clamp(10px,2vw,18px) clamp(12px,2.4vw,20px);min-width:66px;background:rgba(0,0,0,.18);}
  .cd-num{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,3.6vw,2rem);color:var(--paper);display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold);}

  .timeline{max-width:420px;margin:0 auto;text-align:left;position:relative;padding-left:34px;}
  .timeline::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;border-left:1px dashed var(--gold);opacity:.55;}
  .timeline .node{position:relative;margin-bottom:28px;}
  .timeline .node:last-child{margin-bottom:0;}
  .timeline .node .badge{position:absolute;left:-34px;top:-2px;width:21px;height:21px;border-radius:50%;background:var(--obsidian);border:1px solid var(--gold);color:var(--gold);display:flex;align-items:center;justify-content:center;}
  .timeline .node .badge svg{width:13px;height:13px;}
  .timeline .node strong{display:block;font-family:'Playfair Display',serif;font-weight:700;color:var(--paper);text-transform:uppercase;letter-spacing:2px;font-size:.8rem;margin-bottom:4px;}
  .timeline .node .hora{color:var(--magenta);font-size:.9rem;letter-spacing:1px;font-weight:600;}
  .timeline .node p{margin:4px 0 0;color:var(--paper-dim);}

  .btn-outline{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:12px 30px;background:transparent;text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.74rem;font-weight:600;border-radius:30px;cursor:pointer;transition:background .2s,color .2s;font-family:'Cormorant Garamond',serif;border:1px solid var(--gold);color:var(--gold);}
  .btn-outline svg{width:15px;height:15px;}
  .btn-outline:hover{background:var(--gold);color:var(--ink);}

  .dresscode-box{display:inline-flex;flex-direction:column;align-items:center;gap:10px;margin-top:4px;}
  .dresscode-box p{letter-spacing:1px;color:var(--paper-dim);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px;position:relative;z-index:1;}
  .gallery-item{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--gold);border-radius:8px;}
  .gallery-item:nth-child(3n+2){transform:rotate(-1.2deg);}
  .gallery-item:nth-child(3n+3){transform:rotate(1.2deg);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;filter:saturate(1.05);}
  .gallery-item img:hover{transform:scale(1.07);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,3,9,.94);z-index:50;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:6px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--paper);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:6px auto 0;text-align:left;position:relative;z-index:1;}
  .rsvp-form label{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--paper-dim);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border:1px solid rgba(201,162,74,.45);border-radius:6px;background:rgba(0,0,0,.22);color:var(--paper);margin-top:5px;width:100%;}
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:rgba(246,234,221,.4);}
  .rsvp-form button{background:linear-gradient(135deg,var(--gold),var(--magenta));border:0;color:var(--ink);font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;padding:13px;border-radius:30px;cursor:pointer;transition:filter .2s,transform .15s;}
  .rsvp-form button:hover{filter:brightness(1.08);transform:translateY(-1px);}
  .rsvp-whatsapp{color:var(--gold);font-size:.88rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#8fd1a5;font-weight:600;}
  .rsvp-deadline{margin:-10px 0 4px;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--magenta);}

  footer{position:relative;text-align:center;padding:56px 20px 60px;overflow:hidden;background:linear-gradient(160deg,var(--wine) 0%,var(--obsidian) 100%);}
  footer .thanks{position:relative;z-index:1;font-family:'Playfair Display',serif;font-size:clamp(1.3rem,4vw,1.7rem);letter-spacing:2px;text-transform:uppercase;color:var(--paper);}
  footer small{position:relative;z-index:1;display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.92rem;color:var(--paper-dim);margin-top:12px;}
</style></head>
<body>

  <div class="card-section on-obsidian hero-section">
    ${heroSerpentinas}
    <div class="inner">
      <p class="eyebrow">Mis quince años</p>
      <h1 class="brand-title">${esc(d.nombre)}</h1>
      ${d.coverImage ? `<div class="photo-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}" loading="lazy"></div>` : ""}
      ${d.fecha ? `<div class="date-block">
        <span class="line"></span>
        <span class="dow">${esc(diaSemana)}</span>
        <span class="day">${esc(diaNumero)}</span>
        <span class="my">${esc(mesAnio)}</span>
        <span class="line"></span>
      </div>` : ""}
    </div>
  </div>

  ${(d.mensaje || d.padres) ? `<div class="card-section on-wine">
    <div class="inner">
      <p class="eyebrow">Bienvenida</p>
      <h2>Queridos invitados<span class="sub">Un mensaje para ustedes</span></h2>
      <p class="blessing">Con la bendición de Dios y mis padres</p>
      ${d.padres ? `<p class="padres">${esc(d.padres)}</p>` : ""}
      ${d.mensaje ? `<p class="mensaje-txt">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>` : ""}

  <div class="card-section on-violet">
    <div class="inner">
      ${gemDividerSvg("icon-ornament")}
      <h2>Cuenta regresiva</h2>
      ${cd.html}
    </div>
  </div>

  ${(d.horaCeremonia || d.lugarCeremonia || d.horaFiesta || d.lugarFiesta || d.direccionMapa) ? `<div class="card-section on-obsidian">
    <div class="inner">
      <p class="eyebrow">Ubicación</p>
      <h2>Cuándo y dónde</h2>
      <div class="timeline">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="node">
          <span class="badge">${iconChurchSvg()}</span>
          <strong>Ceremonia</strong>
          ${d.horaCeremonia ? `<span class="hora">${esc(d.horaCeremonia)}</span>` : ""}
          ${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="node">
          <span class="badge">${iconSparkleBurstSvg()}</span>
          <strong>Fiesta</strong>
          ${d.horaFiesta ? `<span class="hora">${esc(d.horaFiesta)}</span>` : ""}
          ${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}
        </div>` : ""}
      </div>
      ${d.direccionMapa ? `<a class="btn-outline" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">${mapPinSvg()} Ver ubicación</a>` : ""}
    </div>
  </div>` : ""}

  ${d.dressCode ? `<div class="card-section on-wine">
    <div class="inner">
      ${gemDividerSvg("icon-ornament")}
      <h2>Vestimenta</h2>
      <div class="dresscode-box">
        ${iconGownSvg("icon")}
        <p>${esc(d.dressCode)}</p>
      </div>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="card-section on-violet">
    <div class="inner">
      ${gemDividerSvg("icon-ornament")}
      <h2>Momentos</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="card-section on-obsidian">
    <div class="inner">
      <p class="eyebrow">RSVP</p>
      <h2>Confirmá tu asistencia</h2>
      ${rsvpDeadline ? `<p class="rsvp-deadline">Antes del ${esc(rsvpDeadline)}</p>` : ""}
      ${rsvp.html}
    </div>
  </div>

  <footer>
    ${footerSerpentinas}
    <p class="thanks">Muchas gracias</p>
    <small>Los espero de gala, para bailar hasta que caiga la última serpentina</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(165deg,#150711 0%,#3a1230 55%,#33184a 100%);overflow:hidden;">
    <div style="position:absolute;top:-8px;left:18%;width:6px;height:26px;border-radius:3px;background:${esc(d.accent)};transform:rotate(18deg);opacity:.85;"></div>
    <div style="position:absolute;top:-6px;left:52%;width:6px;height:22px;border-radius:3px;background:#c23f74;transform:rotate(-14deg);opacity:.8;"></div>
    <div style="position:absolute;top:-10px;left:78%;width:6px;height:28px;border-radius:3px;background:#8a4fb8;transform:rotate(10deg);opacity:.85;"></div>
    <svg style="width:54px;height:auto;color:${esc(d.accent)};opacity:.9;" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M100 4 L113 17 L100 30 L87 17 Z" fill="currentColor"/></svg>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:${esc(d.accent)};">Mis quince años</span>
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;color:#f6eadd;">${esc(d.name)}</span>
  </div>`;
}

module.exports = {
  id, category: "xv", name: "Fiesta de Serpentinas",
  summary: "Magenta, violeta profundo y dorado con serpentinas cayendo despacio como confeti de gala — una fiesta de quince con toda la energía, sin perder la elegancia.",
  accent: "#c9a24a", accent2: "#6b1f5c", schema: xvSchema, sampleData, render, cardPreview,
};
