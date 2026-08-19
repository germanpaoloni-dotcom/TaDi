const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { despedidaSchema } = require("../schemas");

const id = "desp-noche-rockera";

const sampleData = {
  nombre: "Cami",
  fecha: "2027-03-13",
  hora: "22:00",
  lugar: "The Roxy Bar, Palermo",
  direccionMapa: "https://maps.google.com/?q=The+Roxy+Bar+Palermo+Buenos+Aires",
  plan: "Arrancamos con tragos y previa en el bar a las 22, después banda en vivo tocando covers de rock hasta la madrugada, y cerramos la noche bailando en la pista hasta que el cuerpo aguante. Última noche de libertad, así que vengan con pilas.",
  dressCode: "De negro, se viene la fiesta. Accesorios de rock a piacere (tachas, cuero, lo que tengan).",
  organizadores: "Male, Fede y el resto de la banda",
  whatsapp: "5491133445566",
  coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c9c3b31d?w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80",
  ],
};

// Motivos de noche de bar/rock dibujados a mano en SVG inline, sin depender
// de ningún ícono externo: guitarra eléctrica, vasos/copas, estrella y rayos
// de luz de neón.
const guitarSVG = `<svg class="motif motif-guitar" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="27" y="2" width="6" height="56" rx="2" stroke="currentColor" stroke-width="2"/>
  <line x1="30" y1="6" x2="30" y2="52" stroke="currentColor" stroke-width="1"/>
  <circle cx="22" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="38" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="22" cy="22" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="38" cy="22" r="2.4" stroke="currentColor" stroke-width="1.4"/>
  <path d="M30 58 C 10 66, 4 88, 14 104 C 8 108, 6 118, 12 128 C 20 138, 40 138, 48 128 C 56 118, 52 106, 44 102 C 54 88, 50 66, 30 58 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="30" cy="104" r="12" stroke="currentColor" stroke-width="1.6"/>
  <line x1="18" y1="70" x2="42" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="16" y1="78" x2="44" y2="78" stroke="currentColor" stroke-width="1"/>
</svg>`;

const cocktailSVG = `<svg class="motif motif-cocktail" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 8 H54 L30 40 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <line x1="30" y1="40" x2="30" y2="68" stroke="currentColor" stroke-width="2"/>
  <line x1="14" y1="74" x2="46" y2="74" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="68" x2="30" y2="74" stroke="currentColor" stroke-width="2"/>
  <circle cx="24" cy="20" r="2.6" stroke="currentColor" stroke-width="1.4"/>
  <path d="M40 12 L44 24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const beerSVG = `<svg class="motif motif-beer" viewBox="0 0 56 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M10 14 H38 V58 C38 62, 34 64, 24 64 C14 64, 10 62, 10 58 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <path d="M38 22 H46 C50 22, 50 34, 46 34 H38" stroke="currentColor" stroke-width="2"/>
  <path d="M10 14 C 10 6, 38 6, 38 14 C 38 20, 10 20, 10 14 Z" stroke="currentColor" stroke-width="2"/>
  <line x1="16" y1="28" x2="16" y2="52" stroke="currentColor" stroke-width="1"/>
  <line x1="24" y1="24" x2="24" y2="52" stroke="currentColor" stroke-width="1"/>
</svg>`;

const starSVG = `<svg class="motif motif-star" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 2 L23.6 15.2 L37 16.4 L26.6 25 L29.8 38 L20 30.4 L10.2 38 L13.4 25 L3 16.4 L16.4 15.2 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;

function boltSVG(cls) {
  return `<svg class="motif motif-bolt ${cls}" viewBox="0 0 26 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 2 L4 26 H13 L9 44 L23 18 H14 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
}

function divider() {
  return `<div class="divider">${starSVG}<span class="divider-line"></span>${cocktailSVG}<span class="divider-line"></span>${starSVG}</div>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "22:00"}:00` : `${sampleData.fecha}T${sampleData.hora}:00`, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
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
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0d0d0d;
    --bg2:#161116;
    --pink:#ff2d95;
    --cyan:#00e5ff;
    --ink:#f5f2f6;
    --ink-soft:#c9bfd0;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Oswald',Arial,sans-serif;font-weight:300;}
  img{max-width:100%;}
  h1,h2,.brand{font-family:'Bebas Neue',Impact,sans-serif;letter-spacing:2px;}

  .motif{color:var(--pink);}
  .motif-guitar{width:clamp(30px,7vw,44px);height:auto;filter:drop-shadow(0 0 6px rgba(255,45,149,.7));}
  .motif-cocktail{width:clamp(20px,5vw,28px);height:auto;color:var(--cyan);filter:drop-shadow(0 0 5px rgba(0,229,255,.7));}
  .motif-beer{width:clamp(24px,6vw,34px);height:auto;color:var(--pink);filter:drop-shadow(0 0 5px rgba(255,45,149,.6));}
  .motif-star{width:clamp(14px,3vw,18px);height:auto;color:var(--cyan);filter:drop-shadow(0 0 4px rgba(0,229,255,.8));}
  .motif-bolt{width:clamp(16px,4vw,22px);height:auto;color:var(--cyan);filter:drop-shadow(0 0 5px rgba(0,229,255,.8));}

  .divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto 30px;}
  .divider-line{width:clamp(30px,10vw,70px);height:1px;background:linear-gradient(90deg,transparent,var(--pink),transparent);}

  /* HERO */
  .hero{position:relative;min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px 20px;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background:url('${esc(d.coverImage)}') center/cover;}
  .hero-bg::after{content:"";position:absolute;inset:0;background:
      radial-gradient(circle at 20% 15%,rgba(255,45,149,.35),transparent 45%),
      radial-gradient(circle at 85% 80%,rgba(0,229,255,.3),transparent 45%),
      linear-gradient(180deg,rgba(13,13,13,.55) 0%,rgba(13,13,13,.75) 55%,rgba(13,13,13,.95) 100%);}
  .hero-bolts{position:absolute;inset:0;pointer-events:none;}
  .hero-bolts .motif-bolt{position:absolute;opacity:.55;}
  .hero-bolts .b1{top:8%;left:8%;}
  .hero-bolts .b2{top:14%;right:10%;transform:scaleX(-1);}
  .hero-bolts .b3{bottom:10%;left:14%;}
  .hero-content{position:relative;z-index:1;max-width:640px;}
  .hero-content .motif-guitar{margin:0 auto 16px;}
  .eyebrow{letter-spacing:.5em;text-transform:uppercase;font-size:clamp(.65rem,1.8vw,.85rem);color:var(--cyan);text-shadow:0 0 10px rgba(0,229,255,.8);}
  .hero-content h1{font-size:clamp(3.4rem,14vw,7rem);margin:12px 0 6px;color:var(--pink);text-shadow:0 0 8px rgba(255,45,149,.9),0 0 26px rgba(255,45,149,.6),0 0 46px rgba(255,45,149,.4);}
  .hero-sub{letter-spacing:.15em;text-transform:uppercase;font-size:clamp(.85rem,2.6vw,1.15rem);color:var(--ink-soft);margin:6px 0 18px;}
  .hero-date{display:inline-block;letter-spacing:.25em;text-transform:uppercase;font-size:clamp(.78rem,2.2vw,1rem);color:var(--cyan);border:1px solid rgba(0,229,255,.6);padding:10px 22px;border-radius:999px;text-shadow:0 0 8px rgba(0,229,255,.7);box-shadow:0 0 16px rgba(0,229,255,.25) inset;}

  section{max-width:780px;margin:0 auto;padding:70px 24px;text-align:center;position:relative;}
  h2{font-size:clamp(1.9rem,6vw,2.8rem);margin:0 0 26px;color:var(--cyan);text-shadow:0 0 6px rgba(0,229,255,.8),0 0 22px rgba(0,229,255,.4);}

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;margin:8px 0 4px;flex-wrap:wrap;}
  .countdown div{display:flex;flex-direction:column;min-width:64px;background:var(--bg2);border:1px solid rgba(255,45,149,.4);border-radius:10px;padding:14px 10px;box-shadow:0 0 18px rgba(255,45,149,.15);}
  .cd-num{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.9rem,5vw,2.6rem);color:var(--pink);text-shadow:0 0 10px rgba(255,45,149,.8);}
  .cd-label{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--ink-soft);margin-top:2px;}

  /* PLAN */
  .plan-card{background:var(--bg2);border:1px solid rgba(0,229,255,.35);border-radius:16px;padding:34px 28px;text-align:left;box-shadow:0 0 26px rgba(0,229,255,.1);}
  .plan-card p{line-height:1.85;color:var(--ink-soft);font-size:clamp(.98rem,2.2vw,1.1rem);margin:0 0 18px;}
  .dresscode{display:flex;align-items:center;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:10px;}
  .dresscode .tag{background:rgba(255,45,149,.12);border:1px solid var(--pink);color:var(--pink);padding:8px 18px;border-radius:999px;letter-spacing:1px;text-transform:uppercase;font-size:.8rem;text-shadow:0 0 6px rgba(255,45,149,.5);}

  /* LUGAR */
  .venue-card{display:flex;flex-direction:column;align-items:center;gap:10px;}
  .venue-name{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.6rem,5vw,2.3rem);color:var(--ink);letter-spacing:2px;}
  .maplink{display:inline-block;margin-top:18px;color:var(--bg);background:var(--cyan);text-decoration:none;font-weight:600;letter-spacing:1px;padding:12px 26px;border-radius:999px;box-shadow:0 0 20px rgba(0,229,255,.5);text-transform:uppercase;font-size:.85rem;}
  .maplink:hover{background:#7cf5ff;}

  /* ORGANIZA */
  .organiza-names{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(1.7rem,5.5vw,2.4rem);color:var(--pink);text-shadow:0 0 10px rgba(255,45,149,.6);letter-spacing:2px;}

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:10px;cursor:pointer;border:1px solid rgba(255,45,149,.35);filter:saturate(1.15) contrast(1.05);transition:transform .2s ease;}
  .gallery img:hover{transform:scale(1.03);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(5,5,8,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border:2px solid var(--pink);border-radius:8px;box-shadow:0 0 40px rgba(255,45,149,.5);}
  .lightbox-close{position:absolute;top:20px;right:30px;color:var(--cyan);font-size:2.2rem;cursor:pointer;text-shadow:0 0 10px rgba(0,229,255,.8);}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:10px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--ink-soft);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Oswald',inherit;padding:11px;border:1px solid rgba(0,229,255,.4);border-radius:8px;margin-top:5px;width:100%;background:var(--bg2);color:var(--ink);}
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--pink);box-shadow:0 0 10px rgba(255,45,149,.4);}
  .rsvp-form button{background:var(--pink);color:#0d0d0d;border:0;padding:14px;border-radius:999px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-size:.9rem;font-weight:600;box-shadow:0 0 22px rgba(255,45,149,.5);}
  .rsvp-form button:hover{background:#ff5aad;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--cyan);text-align:center;text-decoration:none;text-shadow:0 0 6px rgba(0,229,255,.5);}
  .rsvp-status{text-align:center;color:var(--cyan);font-weight:bold;}

  footer{text-align:center;padding:50px 24px 60px;font-size:.85rem;color:var(--ink-soft);border-top:1px solid rgba(255,45,149,.25);letter-spacing:1px;}
  footer .motif-star{margin:0 auto 14px;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-bg"></div>
    <div class="hero-bolts">
      ${boltSVG("b1")}${boltSVG("b2")}${boltSVG("b3")}
    </div>
    <div class="hero-content">
      ${guitarSVG}
      <p class="eyebrow">Última noche de libertad</p>
      <h1>${esc(d.nombre)}</h1>
      <p class="hero-sub">Se viene la despedida</p>
      ${fechaLarga ? `<span class="hero-date">${esc(fechaLarga)} · ${esc(d.hora || "")} hs</span>` : ""}
    </div>
  </div>

  <section>
    ${divider()}
    <h2>Faltan</h2>
    ${cd.html}
  </section>

  <section>
    ${divider()}
    <h2>El plan</h2>
    <div class="plan-card">
      <p>${esc(d.plan)}</p>
      ${d.dressCode ? `<div class="dresscode"><span class="tag">${esc(d.dressCode)}</span></div>` : ""}
    </div>
  </section>

  <section>
    ${divider()}
    <h2>Dónde</h2>
    <div class="venue-card">
      ${beerSVG}
      <span class="venue-name">${esc(d.lugar)}</span>
      ${d.direccionMapa ? `<a class="maplink" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section>
    ${divider()}
    <h2>Organiza</h2>
    <p class="organiza-names">${esc(d.organizadores)}</p>
  </section>

  <section>
    ${divider()}
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    ${divider()}
    <h2>Confirmá tu lugar</h2>
    ${rsvp.html}
  </section>

  <footer>
    ${starSVG}
    Nos vemos en la pista. Última noche de libertad de ${esc(d.nombre)}.
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "despedidas", name: "Noche Rockera",
  summary: "Hero oscuro con luces de neón rosa y celeste, guitarras y tragos dibujados a mano: la despedida con energía de bar de rock.",
  accent: "#ff2d95", schema: despedidaSchema, sampleData, render,
};
