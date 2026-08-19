const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");

const id = "xv-elegante-perlas";

const sampleData = {
  nombre: "Emilia",
  fecha: "2027-03-20",
  horaCeremonia: "19:00",
  lugarCeremonia: "Parroquia Nuestra Señora del Carmen",
  horaFiesta: "21:00",
  lugarFiesta: "Salón Champagne, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Champagne+San+Isidro",
  padres: "Sus padres, María José y Fernando",
  mensaje: "Con el corazón lleno de ilusión, quiero compartir con ustedes la noche en la que cumplo un sueño. Los espero para celebrar juntos esta nueva etapa.",
  dressCode: "Elegante, tonos champagne y blancos",
  whatsapp: "5491155556666",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  ],
};

// Motivos dibujados a mano en SVG inline: corona sutil, hilera de perlas y
// una línea ornamental fina. Sin dependencias externas.
function crownSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 55 L18 20 L38 40 L60 12 L82 40 L102 20 L110 55" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <line x1="8" y1="58" x2="112" y2="58" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="18" cy="20" r="3.4" fill="currentColor"/>
    <circle cx="60" cy="12" r="4" fill="currentColor"/>
    <circle cx="102" cy="20" r="3.4" fill="currentColor"/>
  </svg>`;
}

function pearlRowSvg(cls = "") {
  const pearls = Array.from({ length: 9 })
    .map((_, i) => `<circle cx="${10 + i * 25}" cy="14" r="6" fill="currentColor" opacity="${i % 2 === 0 ? 1 : 0.55}"/>`)
    .join("");
  return `<svg class="${cls}" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="14" x2="220" y2="14" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    ${pearls}
  </svg>`;
}

function ornamentSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="15" x2="80" y2="15" stroke="currentColor" stroke-width="1"/>
    <line x1="120" y1="15" x2="200" y2="15" stroke="currentColor" stroke-width="1"/>
    <circle cx="100" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1"/>
    <circle cx="100" cy="15" r="1.5" fill="currentColor"/>
    <path d="M86 15 Q93 8 100 15 Q107 8 114 15" stroke="currentColor" stroke-width="1" fill="none"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd-perlas");
  const gal = galleryWidget(d.galeria || [], "gal-perlas");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  const fechaLarga = (() => {
    if (!d.fecha) return "";
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      return dt.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch { return d.fecha; }
  })();

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Great+Vibes&family=Marcellus&display=swap" rel="stylesheet">
<style>
  :root{
    --champagne:#d9c9a3;
    --ivory:#faf7f0;
    --gold:#b89a5e;
    --gold-dark:#8f7645;
    --ink:#3a3226;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Cormorant Garamond',serif;background:var(--ivory);color:var(--ink);line-height:1.6;}
  h1,h2,.script{font-family:'Marcellus',serif;}
  .script-font{font-family:'Great Vibes',cursive;}
  .icon{color:var(--gold);width:clamp(48px,10vw,70px);height:auto;}
  .icon-row{color:var(--gold-dark);width:clamp(140px,40vw,220px);height:auto;margin:14px auto;display:block;}
  .icon-ornament{color:var(--gold);width:clamp(140px,45vw,200px);height:auto;margin:18px auto;display:block;}

  .hero{
    position:relative;
    min-height:78vh;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;color:var(--ivory);
    padding:40px 20px;
  }
  .hero::before{
    content:"";position:absolute;inset:0;
    background:linear-gradient(180deg,rgba(58,50,38,.35),rgba(58,50,38,.68)),url('${esc(d.coverImage)}') center/cover;
    z-index:0;
  }
  .hero > *{position:relative;z-index:1;}
  .hero .eyebrow{letter-spacing:6px;text-transform:uppercase;font-size:clamp(.7rem,1.6vw,.9rem);color:var(--champagne);margin-bottom:6px;}
  .hero h1{font-size:clamp(2.4rem,7vw,4.2rem);margin:6px 0;letter-spacing:2px;color:var(--ivory);}
  .hero .sub{font-family:'Great Vibes',cursive;font-size:clamp(1.4rem,4vw,2.2rem);color:var(--champagne);margin:0 0 10px;}
  .hero .fecha-larga{text-transform:capitalize;font-size:clamp(.9rem,2.4vw,1.15rem);letter-spacing:1px;color:var(--ivory);}

  section{max-width:760px;margin:0 auto;padding:clamp(40px,8vw,70px) 24px;text-align:center;}
  .section-alt{background:linear-gradient(180deg,rgba(217,201,163,.18),rgba(217,201,163,.05));}
  h2{
    font-size:clamp(1.1rem,2.6vw,1.5rem);
    color:var(--gold-dark);
    text-transform:uppercase;
    letter-spacing:3px;
    font-weight:500;
    margin-bottom:6px;
  }
  p{font-size:clamp(1rem,2.2vw,1.15rem);}

  .countdown{display:flex;gap:clamp(8px,2vw,18px);justify-content:center;flex-wrap:wrap;}
  .countdown div{
    background:var(--ivory);
    border:1px solid var(--champagne);
    border-radius:4px;
    padding:clamp(10px,2vw,18px) clamp(12px,2.5vw,22px);
    min-width:70px;
    box-shadow:0 2px 10px rgba(184,154,94,.12);
  }
  .cd-num{font-family:'Marcellus',serif;font-size:clamp(1.5rem,4vw,2.2rem);color:var(--gold-dark);display:block;}
  .cd-label{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink);}

  .timeline{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:18px;
    margin-top:24px;
    text-align:left;
  }
  .timeline .card{
    background:var(--ivory);
    border:1px solid var(--champagne);
    border-radius:6px;
    padding:22px 24px;
    text-align:center;
  }
  .timeline .card strong{
    display:block;font-family:'Marcellus',serif;color:var(--gold-dark);
    text-transform:uppercase;letter-spacing:2px;font-size:.85rem;margin-bottom:8px;
  }
  .timeline .card .hora{font-size:clamp(1.5rem,3vw,1.9rem);color:var(--ink);}
  .map-link{
    display:inline-block;margin-top:22px;padding:10px 26px;
    border:1px solid var(--gold);color:var(--gold-dark);
    text-decoration:none;letter-spacing:2px;text-transform:uppercase;font-size:.8rem;
    border-radius:2px;transition:background .2s;
  }
  .map-link:hover{background:var(--champagne);}

  .dresscode-box{
    display:inline-block;margin-top:10px;padding:14px 30px;
    border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);
    letter-spacing:1px;
  }

  .gallery{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px;
    margin-top:20px;
  }
  .gallery-item{border-radius:4px;overflow:hidden;aspect-ratio:1/1;border:1px solid var(--champagne);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;cursor:pointer;transition:transform .3s;display:block;}
  .gallery-item img:hover{transform:scale(1.06);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(58,50,38,.92);
    z-index:50;align-items:center;justify-content:center;cursor:zoom-out;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:4px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--ivory);font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold-dark);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;
    padding:10px;border-radius:2px;border:1px solid var(--champagne);
    background:var(--ivory);color:var(--ink);margin-top:5px;width:100%;
  }
  .rsvp-form button{
    background:var(--gold);border:0;color:var(--ivory);font-weight:600;
    letter-spacing:2px;text-transform:uppercase;font-size:.85rem;
    padding:13px;border-radius:2px;cursor:pointer;transition:background .2s;
  }
  .rsvp-form button:hover{background:var(--gold-dark);}
  .rsvp-whatsapp{color:var(--gold-dark);font-size:.9rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#4a7a4a;font-weight:600;}

  footer{
    text-align:center;padding:40px 20px;
    background:var(--ink);color:var(--champagne);
    font-family:'Great Vibes',cursive;font-size:1.6rem;
  }
  footer small{display:block;font-family:'Cormorant Garamond',serif;font-size:.75rem;letter-spacing:2px;text-transform:uppercase;color:var(--champagne);opacity:.7;margin-top:10px;}
</style></head>
<body>

  <div class="hero">
    ${crownSvg("icon")}
    <p class="eyebrow">Mis quince años</p>
    <h1>${esc(d.nombre)}</h1>
    <p class="sub">te invita a celebrar</p>
    <p class="fecha-larga">${esc(fechaLarga)}</p>
  </div>

  <section>
    ${ornamentSvg("icon-ornament")}
    <h2>Cuenta regresiva</h2>
    ${cd.html}
  </section>

  <section class="section-alt">
    ${pearlRowSvg("icon-row")}
    <h2>Un mensaje para ustedes</h2>
    <p>${esc(d.mensaje)}</p>
    <p class="script-font" style="font-size:clamp(1.3rem,3.5vw,1.7rem);color:var(--gold-dark);margin-top:16px;">${esc(d.padres)}</p>
  </section>

  <section>
    ${ornamentSvg("icon-ornament")}
    <h2>Cuándo y dónde</h2>
    <div class="timeline">
      ${d.lugarCeremonia ? `<div class="card"><strong>Ceremonia</strong><span class="hora">${esc(d.horaCeremonia)}</span><p>${esc(d.lugarCeremonia)}</p></div>` : ""}
      <div class="card"><strong>Fiesta</strong><span class="hora">${esc(d.horaFiesta)}</span><p>${esc(d.lugarFiesta)}</p></div>
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    <div>
      <div class="dresscode-box"><strong>Dress code:</strong> ${esc(d.dressCode)}</div>
    </div>
  </section>

  <section class="section-alt">
    ${pearlRowSvg("icon-row")}
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    ${crownSvg("icon")}
    <h2>Confirmá tu asistencia</h2>
    ${rsvp.html}
  </section>

  <footer>
    Gracias por acompañarme
    <small>Los espero de gala, con el corazón agradecido</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Elegante Perlas",
  summary: "Estilo sofisticado en champagne, blanco y dorado con perlas y coronas dibujadas a mano.",
  accent: "#b89a5e", schema: xvSchema, sampleData, render,
};
