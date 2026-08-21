const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-pop-vibrante";

const sampleData = {
  nombre: "Mariana Pérez",
  fecha: "2027-10-25", horaFiesta: "16:30", lugarFiesta: "Salón Fiorentina",
  horaCeremonia: "", lugarCeremonia: "",
  direccionMapa: "https://maps.google.com/?q=Salon+Fiorentina",
  padres: "Jorge Pérez & Carla Méndez",
  mensaje: "Hay momentos inolvidables que se atesoran en el corazón para siempre, por esa razón, quiero que compartas conmigo éste día tan especial.",
  dressCode: "Formal · evitar tonos lavanda y morado",
  whatsapp: "5491100000005",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
  ],
};

// Motivos dibujados a mano en SVG inline: rosas de esquina, tiara, copas,
// regalo, sobre y siluetas de vestimenta. Todo en tonos lavanda/fucsia,
// sin dependencias externas.
function roseCornerSvg(cls = "", flip = false, accent = "#7c4a9e") {
  return `<svg class="${cls}${flip ? " flip" : ""}" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g opacity=".9">
      <path d="M2 6 C 40 2, 70 30, 60 60" stroke="#8fae7c" stroke-width="2" fill="none"/>
      <path d="M20 8 C 55 4, 75 26, 90 20" stroke="#8fae7c" stroke-width="2" fill="none"/>
      <ellipse cx="30" cy="24" rx="13" ry="16" fill="color-mix(in srgb, ${accent}, white 55%)" transform="rotate(-18 30 24)"/>
      <ellipse cx="42" cy="14" rx="10" ry="13" fill="color-mix(in srgb, ${accent}, white 40%)" transform="rotate(10 42 14)"/>
      <circle cx="34" cy="20" r="8" fill="color-mix(in srgb, ${accent}, white 15%)"/>
      <ellipse cx="66" cy="18" rx="9" ry="11" fill="#f2a6c9" transform="rotate(-8 66 18)"/>
      <circle cx="66" cy="18" r="5" fill="#e8639f"/>
      <path d="M10 40 C 18 34, 26 36, 30 44 C 22 48, 12 46, 10 40 Z" fill="#7a9c68"/>
      <path d="M50 46 C 58 40, 66 42, 70 50 C 62 54, 52 52, 50 46 Z" fill="#7a9c68"/>
    </g>
  </svg>`;
}

function tiaraSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 55 L18 20 L38 40 L60 12 L82 40 L102 20 L110 55" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <line x1="8" y1="58" x2="112" y2="58" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="18" cy="20" r="3.6" fill="currentColor"/>
    <circle cx="60" cy="12" r="4.4" fill="currentColor"/>
    <circle cx="102" cy="20" r="3.6" fill="currentColor"/>
  </svg>`;
}

function dividerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="12" x2="82" y2="12" stroke="currentColor" stroke-width="1"/>
    <line x1="118" y1="12" x2="200" y2="12" stroke="currentColor" stroke-width="1"/>
    <circle cx="100" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="100" cy="12" r="1.6" fill="currentColor"/>
  </svg>`;
}

function cheersSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 8 L20 30 C 20 36, 26 38, 26 38 L26 50 M14 8 L26 8 M14 8 C 12 16, 14 24, 20 30" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-14 26 30)"/>
    <path d="M44 8 L38 30 C 38 36, 32 38, 32 38 L32 50 M44 8 L32 8 M44 8 C 46 16, 44 24, 38 30" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(14 32 30)"/>
    <line x1="18" y1="52" x2="40" y2="52" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function giftSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="24" width="40" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
    <line x1="10" y1="34" x2="50" y2="34" stroke="currentColor" stroke-width="2"/>
    <line x1="30" y1="24" x2="30" y2="52" stroke="currentColor" stroke-width="2"/>
    <path d="M30 24 C 22 24, 16 18, 20 12 C 26 10, 30 18, 30 24 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M30 24 C 38 24, 44 18, 40 12 C 34 10, 30 18, 30 24 Z" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>`;
}

function envelopeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2" y="2" width="56" height="40" rx="3" stroke="currentColor" stroke-width="2"/>
    <path d="M4 5 L30 26 L56 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function calendarHeartSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="12" width="44" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
    <line x1="8" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="2"/>
    <line x1="18" y1="6" x2="18" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="42" y1="6" x2="42" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 42 C 24 34, 14 34, 14 42 C 14 48, 22 52, 30 58 C 38 52, 46 48, 46 42 C 46 34, 36 34, 30 42 Z" fill="currentColor"/>
  </svg>`;
}

function dressCodeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M28 6 L36 16 L28 26 L20 20 Z" fill="currentColor"/>
    <path d="M14 26 L28 16 L28 66 L14 66 Z" fill="currentColor"/>
    <path d="M42 26 L28 16 L28 66 L42 66 Z" fill="currentColor"/>
    <line x1="28" y1="16" x2="28" y2="30" stroke="#faf6ef" stroke-width="2"/>
    <path d="M90 8 C 78 8, 72 20, 76 30 C 66 40, 66 58, 74 66 L106 66 C 114 58, 114 40, 104 30 C 108 20, 102 8, 90 8 Z" fill="currentColor"/>
    <circle cx="90" cy="18" r="4" fill="#faf6ef"/>
  </svg>`;
}

function paperTexture(accent = "#7c4a9e") {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><rect width="220" height="220" fill="#faf6ef"/><g fill="${accent}" opacity="0.035"><circle cx="20" cy="30" r="1.4"/><circle cx="110" cy="70" r="1.6"/><circle cx="180" cy="20" r="1.2"/><circle cx="60" cy="150" r="1.5"/><circle cx="160" cy="180" r="1.3"/><circle cx="200" cy="120" r="1.1"/></g></svg>`
  )}`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#7c4a9e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cdpop");
  const gal = galleryWidget(d.galeria || [], "galpop");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const fechaBox = (() => {
    if (!d.fecha) return null;
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      return {
        weekday: dt.toLocaleDateString("es-AR", { weekday: "long" }),
        day: dt.getDate(),
        month: dt.toLocaleDateString("es-AR", { month: "long" }),
        year: dt.getFullYear(),
      };
    } catch { return null; }
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Marcellus&family=Great+Vibes&display=swap" rel="stylesheet">
<style>
  :root{
    --lav-deep:${accent};
    --lav:color-mix(in srgb, ${accent}, white 35%);
    --lav-light:color-mix(in srgb, ${accent}, white 85%);
    --pink:#e85fa0;
    --cream:#faf6ef;
    --ink:#3a3240;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--cream) url('${paperTexture(accent)}');color:var(--ink);line-height:1.6;}
  h1,h2,.serif-caps{font-family:'Marcellus',serif;}
  .script{font-family:'Great Vibes',cursive;}
  .icon{color:var(--lav-deep);}
  .corner-top{position:absolute;top:0;left:0;width:clamp(120px,32vw,200px);height:auto;}
  .corner-top.flip{left:auto;right:0;transform:scaleX(-1);}
  .corner-bottom{position:absolute;bottom:0;left:0;width:clamp(120px,32vw,200px);height:auto;transform:scaleY(-1);}
  .corner-bottom.flip{left:auto;right:0;transform:scaleY(-1) scaleX(-1);}

  section{position:relative;max-width:720px;margin:0 auto;padding:clamp(50px,10vw,80px) 24px;text-align:center;overflow:hidden;}
  .section-tint{background:linear-gradient(180deg,color-mix(in srgb, var(--lav) 10%, transparent),color-mix(in srgb, var(--lav) 2%, transparent));}
  .eyebrow{letter-spacing:3px;text-transform:uppercase;font-size:clamp(.75rem,2vw,.9rem);color:var(--lav-deep);font-family:'Marcellus',serif;}
  h2{
    font-size:clamp(1.1rem,2.8vw,1.5rem);color:var(--lav-deep);
    text-transform:uppercase;letter-spacing:3px;font-weight:400;margin:8px 0 6px;
  }
  p{font-size:clamp(1rem,2.2vw,1.15rem);}
  .quote{font-style:italic;color:#5c5164;max-width:460px;margin:0 auto;font-size:clamp(1rem,2.4vw,1.2rem);}

  /* ---- Hero ---- */
  .hero{padding-top:clamp(60px,12vw,90px);padding-left:24px;padding-right:24px;max-width:720px;margin:0 auto;text-align:center;position:relative;overflow:hidden;}
  .hero .icon{width:clamp(60px,14vw,90px);height:auto;margin:18px auto 6px;display:block;}
  .hero h1.title{font-size:clamp(1.6rem,5vw,2.4rem);letter-spacing:5px;margin:6px 0 24px;}
  .frame{
    width:min(88%,340px);margin:0 auto;border-radius:4px 4px 60px 4px;overflow:hidden;
    box-shadow:0 14px 30px color-mix(in srgb, var(--lav-deep) 25%, transparent);border:6px solid #fff;
  }
  .frame img{width:100%;display:block;aspect-ratio:3/4;object-fit:cover;}
  .name-script{font-size:clamp(2.2rem,7vw,3.4rem);color:var(--lav-deep);margin:22px 0 4px;}
  .parents{margin-top:26px;}
  .parents strong{color:var(--lav-deep);font-family:'Marcellus',serif;font-weight:400;}
  .invite-line{margin-top:14px;}
  .invite-highlight{color:var(--pink);font-family:'Marcellus',serif;letter-spacing:2px;text-transform:uppercase;}

  .date-box{display:flex;align-items:flex-end;justify-content:center;gap:18px;margin:30px auto 0;}
  .date-col{text-align:center;border-top:1px solid var(--lav);padding-top:8px;min-width:60px;}
  .date-col span{display:block;font-family:'Marcellus',serif;letter-spacing:2px;text-transform:uppercase;font-size:.72rem;color:var(--lav-deep);}
  .date-day{font-family:'Marcellus',serif;font-size:clamp(2.4rem,7vw,3.2rem);color:var(--pink);line-height:1;padding:0 6px;}

  .countdown-wrap{margin-top:22px;}
  .countdown-wrap .eyebrow{display:block;margin-bottom:10px;}
  .countdown{display:flex;gap:clamp(8px,2vw,16px);justify-content:center;flex-wrap:wrap;}
  .countdown div{
    background:#fff;border:1px solid var(--lav-light);border-radius:10px;
    padding:clamp(8px,2vw,14px) clamp(10px,2.4vw,18px);min-width:64px;
    box-shadow:0 4px 14px color-mix(in srgb, var(--lav-deep) 14%, transparent);
  }
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.4rem,4vw,2rem);color:var(--lav-deep);display:block;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1.5px;color:#7a6f82;}

  /* ---- Recepción / itinerario ---- */
  .icon-md{width:clamp(38px,8vw,50px);height:auto;margin:0 auto 10px;display:block;}
  .place{font-family:'Marcellus',serif;letter-spacing:1px;color:var(--ink);}
  .place em{display:block;font-style:italic;font-family:'Cormorant Garamond',serif;color:#7a6f82;margin-top:2px;}
  .map-btn{
    display:inline-block;margin-top:16px;padding:9px 26px;border-radius:20px;
    background:var(--lav);color:#fff;text-decoration:none;letter-spacing:1px;
    font-family:'Marcellus',serif;font-size:.85rem;box-shadow:0 6px 16px color-mix(in srgb, var(--lav-deep) 30%, transparent);
  }

  .feature-photo{position:relative;max-width:340px;margin:34px auto 0;}
  .feature-photo::before{
    content:"15";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:'Marcellus',serif;font-size:clamp(6rem,22vw,9rem);color:var(--lav-light);z-index:0;
  }
  .feature-photo img{
    position:relative;z-index:1;width:78%;margin:0 auto;display:block;border-radius:6px 6px 50px 6px;
    box-shadow:0 16px 34px color-mix(in srgb, var(--lav-deep) 28%, transparent);border:6px solid #fff;aspect-ratio:3/4;object-fit:cover;
  }

  .timeline{margin-top:34px;text-align:left;max-width:420px;margin-left:auto;margin-right:auto;}
  .timeline-item{display:flex;align-items:center;gap:16px;padding:10px 0;border-left:2px solid var(--lav-light);padding-left:20px;position:relative;}
  .timeline-item::before{content:"";position:absolute;left:-7px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:var(--pink);border:2px solid #fff;box-shadow:0 0 0 2px var(--lav-light);}
  .timeline-item .t-hora{font-family:'Marcellus',serif;color:var(--lav-deep);min-width:78px;font-size:.95rem;}
  .timeline-item .t-label{text-transform:uppercase;letter-spacing:1px;font-size:.82rem;color:var(--ink);}

  .dresscode{margin-top:30px;}
  .dresscode-icons{display:flex;justify-content:center;gap:18px;margin:14px 0;}
  .dresscode-icons svg{width:clamp(40px,10vw,56px);height:auto;color:var(--lav-deep);}
  .dresscode p{color:#5c5164;}

  /* ---- Galería / regalos / rsvp ---- */
  .gallery{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:24px;
  }
  .gallery-item{border-radius:6px;overflow:hidden;aspect-ratio:1/1;border:3px solid #fff;box-shadow:0 6px 16px color-mix(in srgb, var(--lav-deep) 18%, transparent);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(58,50,64,.92);z-index:50;align-items:center;justify-content:center;cursor:zoom-out;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:6px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:#fff;font-size:2rem;cursor:pointer;}

  .gift-note{max-width:420px;margin:14px auto 0;color:#5c5164;}
  .envelope-tag{
    display:inline-flex;align-items:center;gap:10px;margin-top:16px;padding:10px 22px;
    border:1px solid var(--lav);border-radius:20px;letter-spacing:2px;text-transform:uppercase;font-size:.78rem;color:var(--lav-deep);
  }
  .envelope-tag svg{width:22px;height:auto;color:var(--lav-deep);}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--lav-deep);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;padding:10px;border-radius:8px;
    border:1px solid var(--lav-light);background:#fff;color:var(--ink);margin-top:5px;width:100%;
  }
  .rsvp-form button{
    background:var(--pink);border:0;color:#fff;font-weight:600;letter-spacing:2px;
    text-transform:uppercase;font-size:.85rem;padding:13px;border-radius:22px;cursor:pointer;
    transition:background .2s;box-shadow:0 8px 18px rgba(232,95,160,.3);
  }
  .rsvp-form button:hover{background:var(--lav-deep);}
  .rsvp-whatsapp{color:var(--lav-deep);font-size:.9rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#4a7a4a;font-weight:600;}

  .closing{max-width:420px;margin:26px auto 0;color:#5c5164;font-size:.95rem;}

  footer{
    position:relative;text-align:center;padding:clamp(50px,10vw,80px) 20px;
    background:linear-gradient(180deg,color-mix(in srgb, var(--lav) 12%, transparent),color-mix(in srgb, var(--lav) 22%, transparent));
    overflow:hidden;
  }
  footer .script{font-size:clamp(2rem,6vw,2.8rem);color:var(--lav-deep);position:relative;z-index:1;}
</style></head>
<body>

  <div class="hero" style="position:relative;">
    ${roseCornerSvg("corner-top", false, accent)}
    ${roseCornerSvg("corner-top", true, accent)}
    ${d.mensaje ? `<p class="quote">&ldquo;${esc(d.mensaje)}&rdquo;</p>` : ""}
    ${tiaraSvg("icon")}
    <h1 class="title">Mis XV Años</h1>

    <div class="frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombre)}"></div>
    <div class="name-script script">${esc(d.nombre)}</div>

    ${d.padres ? `<div class="parents">
      <p>Con la compañía de mis padres:</p>
      <p><strong>${esc(d.padres)}</strong></p>
    </div>` : ""}

    <div class="invite-line">
      <p>Te invito a celebrar con alegría este momento tan especial:</p>
      <p class="invite-highlight">Mis 15 años</p>
    </div>

    ${fechaBox ? `<div class="date-box">
      <div class="date-col"><span>${esc(fechaBox.weekday)}</span></div>
      <div class="date-day">${esc(fechaBox.day)}</div>
      <div class="date-col"><span>${esc(fechaBox.month)}</span><span>${esc(fechaBox.year)}</span></div>
    </div>` : ""}

    <div class="countdown-wrap">
      <span class="eyebrow">Faltan</span>
      ${cd.html}
    </div>
  </div>

  <section class="section-tint">
    ${cheersSvg("icon-md icon")}
    ${(d.horaFiesta || d.lugarFiesta || d.lugarCeremonia) ? `<p class="place">${d.horaFiesta ? `${esc(d.horaFiesta)}<br>` : ""}${d.lugarFiesta ? `<strong>${esc(d.lugarFiesta.toUpperCase())}</strong>` : ""}${d.lugarCeremonia ? `<em>${esc(d.lugarCeremonia)}</em>` : ""}</p>` : ""}
    ${d.direccionMapa ? `<a class="map-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}

    <div class="feature-photo"><img src="${esc((d.galeria && d.galeria[0]) || d.coverImage)}" alt="${esc(d.nombre)}"></div>

    <h2 style="margin-top:40px;">Itinerario de actividades</h2>
    <div class="timeline">
      ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="timeline-item"><span class="t-hora">${d.horaCeremonia ? esc(d.horaCeremonia) : "&nbsp;"}</span><span class="t-label">Ceremonia</span></div>` : ""}
      ${(d.horaFiesta || d.lugarFiesta) ? `<div class="timeline-item"><span class="t-hora">${d.horaFiesta ? esc(d.horaFiesta) : "&nbsp;"}</span><span class="t-label">Recepción</span></div>` : ""}
      <div class="timeline-item"><span class="t-hora">&nbsp;</span><span class="t-label">Vals y baile</span></div>
      <div class="timeline-item"><span class="t-hora">&nbsp;</span><span class="t-label">Despedida</span></div>
    </div>

    ${d.dressCode ? `<div class="dresscode">
      <h2>Código de vestimenta</h2>
      <div class="dresscode-icons">${dressCodeSvg()}</div>
      <p>${esc(d.dressCode)}</p>
    </div>` : ""}
  </section>

  ${(d.galeria && d.galeria.length) ? `
  <section>
    ${dividerSvg("icon-md icon")}
    <h2>Momentos</h2>
    ${gal.html}
  </section>` : ""}

  <section class="section-tint">
    ${giftSvg("icon-md icon")}
    <h2>Sugerencia de regalos</h2>
    <p class="gift-note">Tu compañía en este día tan especial es el mejor regalo. Pero si deseas darme un obsequio, aquí tienes una opción:</p>
    <div class="envelope-tag">${envelopeSvg()} Lluvia de sobres</div>
  </section>

  <section>
    ${calendarHeartSvg("icon-md icon")}
    <h2>Confirmar asistencia</h2>
    ${rsvp.html}
    <p class="closing">Con mucho cariño, los espero para compartir juntos esta noche tan especial. ¡Su presencia y alegría harán que sea inolvidable!</p>
  </section>

  <footer>
    ${roseCornerSvg("corner-bottom", false, accent)}
    ${roseCornerSvg("corner-bottom", true, accent)}
    <p class="script">¡Te esperamos!</p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Pop Vibrante",
  summary: "Paleta lavanda y fucsia con rosas, tiara y timeline de itinerario, en un estilo pop romántico.",
  accent: "#7c4a9e", accent2: "#e85fa0", schema: xvSchema, sampleData, render,
};
