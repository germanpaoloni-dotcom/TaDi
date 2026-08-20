const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "xv-glam-rosa";

const sampleData = {
  nombre: "Abigail",
  fecha: "2027-09-23",
  horaCeremonia: "",
  lugarCeremonia: "",
  horaFiesta: "17:30",
  lugarFiesta: "Salón Cristal",
  direccionMapa: "https://maps.google.com/?q=Salon+Cristal",
  padres: "Sus padres, Laura y Diego",
  mensaje: "Hoy dejo atrás mi niñez para comenzar un nuevo capítulo, rodeada del amor de quienes más quiero. Atesoro en mi corazón miles de recuerdos viejos y recientes. Por ser parte de ellos, es importante que estés en mis 15 años.",
  dressCode: "Formal",
  whatsapp: "5491100000003",
  coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80",
  ],
};

// Motivos "glam rosa" dibujados a mano en SVG inline (currentColor): moño,
// rama floral de esquina, tiara, copas de brindis, siluetas de gala y un
// sobre con moño. Sin dependencias externas.
function bowSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 20c-3-9-13-13-19-9-5 3-4 11 3 12 5 1 12-1 16-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M30 20c3-9 13-13 19-9 5 3 4 11-3 12-5 1-12-1-16-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="30" cy="20" r="3.2" fill="currentColor"/>
    <path d="M30 23c-1 5-2 9-5 12M30 23c1 5 2 9 5 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function floralCornerSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 8c30 4 55 16 70 38 12 18 16 40 12 66" stroke="currentColor" stroke-width="1.3" fill="none" opacity=".85"/>
    <path d="M20 14c14 10 20 24 16 40" stroke="currentColor" stroke-width="1.1" fill="none" opacity=".7"/>
    <circle cx="26" cy="24" r="9" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <circle cx="26" cy="24" r="3" fill="currentColor" opacity=".6"/>
    <circle cx="48" cy="42" r="7" stroke="currentColor" stroke-width="1.1" fill="none"/>
    <circle cx="66" cy="66" r="10" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <circle cx="66" cy="66" r="3.2" fill="currentColor" opacity=".6"/>
    <path d="M40 30c6 4 8 10 6 16-8-2-12-8-6-16Z" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M58 52c6 3 9 9 7 15-8-1-13-7-7-15Z" stroke="currentColor" stroke-width="1" fill="none"/>
    <ellipse cx="90" cy="30" rx="10" ry="5" stroke="currentColor" stroke-width="1" fill="none" transform="rotate(-25 90 30)" opacity=".7"/>
  </svg>`;
}

function tiaraSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 78c0-30 6-46 14-46 6 0 6 14 12 14s8-24 20-24 12 22 20 22 10-30 20-30 12 30 20 30 14-22 20-22 6 24 12 24 14-16 14 46" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M10 78h180" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M92 30c4-6 12-6 16 0 4-6 12-6 16 0-3 8-9 12-16 16-7-4-13-8-16-16Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <circle cx="46" cy="46" r="2.6" fill="currentColor"/>
    <circle cx="154" cy="46" r="2.6" fill="currentColor"/>
    <circle cx="20" cy="60" r="2" fill="currentColor"/>
    <circle cx="180" cy="60" r="2" fill="currentColor"/>
  </svg>`;
}

function glassesSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M40 14c0 16 10 24 10 24s10-8 10-24" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M35 12h30" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 38v34" stroke="currentColor" stroke-width="1.6"/>
    <path d="M36 76h28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M90 20c0 18 12 26 12 26s12-8 12-26" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M84 18h36" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M102 46v28" stroke="currentColor" stroke-width="1.6"/>
    <path d="M88 78h28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M96 30l3 3 5-6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="70" cy="14" r="1.4" fill="currentColor"/>
    <circle cx="120" cy="10" r="1.4" fill="currentColor"/>
    <circle cx="78" cy="24" r="1" fill="currentColor"/>
  </svg>`;
}

function coupleSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="52" cy="16" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M52 25c-14 0-20 10-20 24 3 2 5 3 8 3l2 40h20l2-40c3 0 5-1 8-3 0-14-6-24-20-24Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M40 49l-8 20M64 49l8 20" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="112" cy="14" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M112 23c-8 0-12 4-12 10 0 4 2 6 4 8-10 8-12 22-8 51h32c4-29 2-43-8-51 2-2 4-4 4-8 0-6-4-10-12-10Z" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M100 33l-10 14M124 33l10 14" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function envelopeSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="14" y="30" width="112" height="60" rx="4" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M14 34l56 38 56-38" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M60 6c-3-6-12-6-13 1-1 6 6 9 13 9 7 0 14-3 13-9-1-7-10-7-13-1Z" stroke="currentColor" stroke-width="1.3" fill="none"/>
    <path d="M60 16c-1 3-1 7 0 10M60 16c1 3 1 7 0 10" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`;
}

function sparkleSvg(cls = "") {
  return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4c1 7 3 11 12 12-9 1-11 5-12 12-1-7-3-11-12-12 9-1 11-5 12-12Z" fill="currentColor"/>
  </svg>`;
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c9536c");
  const targetISO = d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha;
  const cd = countdownWidget(targetISO, "cd-glam");
  const gal = galleryWidget(d.galeria || [], "gal-glam");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  let diaSemana = "", diaNum = "", mesNombre = "";
  if (d.fecha) {
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      diaSemana = dt.toLocaleDateString("es-AR", { weekday: "long" });
      diaNum = String(day);
      mesNombre = dt.toLocaleDateString("es-AR", { month: "long" });
    } catch { /* ignore */ }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --blush:#f7dde3;
    --blush-soft:#fbeef1;
    --ivory:#fffbfa;
    --rose:${accent};
    --rose-deep:color-mix(in srgb, ${accent}, black 18%);
    --rose-light:color-mix(in srgb, ${accent}, white 50%);
    --gold:#b6924f;
    --gold-light:#d9c396;
    --ink:#4a2f37;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;font-family:'Montserrat',sans-serif;background:var(--blush);color:var(--ink);line-height:1.65;}
  h1,h2,h3{font-family:'Playfair Display',serif;margin:0;}
  .script{font-family:'Great Vibes',cursive;line-height:1.2;}
  .icon{color:var(--rose-light);}
  .icon-gold{color:var(--gold);width:28px;height:28px;display:inline-block;}

  section{max-width:720px;margin:0 auto;padding:clamp(36px,7vw,64px) 20px;text-align:center;position:relative;}
  .eyebrow{
    font-family:'Great Vibes',cursive;color:var(--gold);
    font-size:clamp(1.6rem,5vw,2.3rem);margin-bottom:6px;display:block;
  }
  h2.title{
    color:var(--rose);text-transform:uppercase;letter-spacing:3px;
    font-size:clamp(1rem,2.6vw,1.3rem);font-weight:600;margin-bottom:18px;
  }

  /* ---------- HERO ---------- */
  .hero-wrap{position:relative;padding:34px 16px 44px;}
  .hero-wrap .corner{position:absolute;width:clamp(90px,26vw,150px);height:auto;}
  .hero-wrap .corner.tl{top:2px;left:2px;}
  .hero-wrap .corner.tr{top:2px;right:2px;transform:scaleX(-1);}
  .hero-wrap .corner.bl{bottom:2px;left:2px;transform:scaleY(-1);}
  .hero-wrap .corner.br{bottom:2px;right:2px;transform:scale(-1,-1);}

  .hero-card{
    position:relative;z-index:1;max-width:520px;margin:0 auto;
    background:var(--ivory);
    border:1px solid var(--gold-light);
    border-radius:38px 38px 90px 90px/38px 38px 60px 60px;
    padding:clamp(30px,7vw,50px) clamp(20px,6vw,40px) clamp(36px,8vw,54px);
    box-shadow:0 18px 40px color-mix(in srgb, var(--rose-deep) 12%, transparent);
  }
  .hero-card::before{
    content:"";position:absolute;inset:10px;
    border:1px solid var(--rose-light);
    border-radius:32px 32px 80px 80px/32px 32px 52px 52px;
    pointer-events:none;
  }
  .hero-num{
    display:block;font-family:'Playfair Display',serif;font-weight:700;
    font-size:clamp(1.4rem,4vw,1.9rem);color:var(--gold);
    letter-spacing:1px;position:relative;
  }
  .hero-num span{font-size:clamp(2.6rem,8vw,3.4rem);vertical-align:middle;margin:0 4px;}
  .hero-title{
    font-size:clamp(1rem,3vw,1.25rem);letter-spacing:3px;text-transform:uppercase;
    color:var(--rose);font-weight:600;margin-top:2px;
  }
  .hero-divider{width:clamp(120px,32vw,180px);height:auto;color:var(--rose-light);margin:14px auto;display:block;}
  .hero-name{
    font-family:'Great Vibes',cursive;color:var(--rose);
    font-size:clamp(2.6rem,10vw,4.2rem);margin:2px 0 10px;
  }
  .hero-sub{color:var(--gold);font-weight:600;letter-spacing:.5px;font-size:clamp(.95rem,2.6vw,1.1rem);margin:0 0 18px;}
  .hero-date{
    display:inline-flex;align-items:center;gap:10px;
    color:var(--ink);text-transform:uppercase;letter-spacing:2px;font-weight:600;
    font-size:clamp(.7rem,2vw,.85rem);
  }
  .hero-date .badge{
    width:clamp(38px,9vw,48px);height:clamp(38px,9vw,48px);border-radius:50%;
    border:1.5px solid var(--rose-light);display:flex;align-items:center;justify-content:center;
    font-family:'Playfair Display',serif;color:var(--rose);font-size:clamp(1rem,3vw,1.2rem);font-weight:700;
  }
  .hero-tiara{width:clamp(160px,50vw,240px);height:auto;color:var(--rose-light);margin:22px auto 0;display:block;}

  /* ---------- COUNTDOWN ---------- */
  .countdown{
    display:flex;justify-content:center;align-items:stretch;flex-wrap:wrap;
    background:var(--ivory);border:1px solid var(--gold-light);border-radius:14px;
    max-width:420px;margin:0 auto;padding:6px 4px;
  }
  .countdown > div{
    flex:1;min-width:70px;padding:12px 10px;position:relative;
  }
  .countdown > div + div::before{
    content:"";position:absolute;left:0;top:14%;bottom:14%;width:1px;background:var(--rose-light);
  }
  .cd-num{display:block;font-family:'Playfair Display',serif;font-weight:700;color:var(--gold);font-size:clamp(1.5rem,5vw,2.1rem);}
  .cd-label{display:block;margin-top:4px;font-size:.62rem;letter-spacing:2px;text-transform:uppercase;color:var(--rose);}

  /* ---------- MENSAJE / GALERÍA ---------- */
  .section-blush{background:linear-gradient(180deg,var(--blush-soft),transparent);}
  .quote-card{
    max-width:420px;margin:14px auto 0;background:var(--ivory);
    border:1px dashed var(--rose-light);border-radius:16px;
    padding:26px 24px;position:relative;
  }
  .quote-card svg{width:34px;height:auto;color:var(--rose);margin:0 auto 10px;display:block;}
  .quote-card p{font-size:clamp(.95rem,2.4vw,1.05rem);color:var(--ink);margin:0 0 12px;font-style:italic;}
  .quote-card .padres{font-family:'Great Vibes',cursive;color:var(--gold);font-size:clamp(1.4rem,4vw,1.7rem);font-style:normal;}

  .gallery{
    display:flex;flex-wrap:wrap;justify-content:center;gap:22px 16px;margin-top:28px;
  }
  .gallery-item{
    background:var(--ivory);padding:10px 10px 26px;border-radius:3px;
    box-shadow:0 10px 22px rgba(74,47,55,.14);width:150px;
    transform:rotate(var(--r,0deg));
  }
  .gallery-item:nth-child(odd){--r:-3deg;}
  .gallery-item:nth-child(even){--r:2.5deg;}
  .gallery-item img{width:100%;height:170px;object-fit:cover;cursor:pointer;display:block;}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(74,47,55,.92);
    z-index:50;align-items:center;justify-content:center;cursor:zoom-out;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92vw;max-height:86vh;border-radius:6px;}
  .lightbox-close{position:absolute;top:18px;right:26px;color:var(--ivory);font-size:2rem;cursor:pointer;}

  /* ---------- DETALLES: tarjetas ---------- */
  .detail-card{
    max-width:340px;margin:0 auto 26px;background:var(--ivory);
    border:1px solid var(--gold-light);border-radius:20px;
    padding:26px 24px 30px;position:relative;
    box-shadow:0 14px 30px color-mix(in srgb, var(--rose-deep) 10%, transparent);
  }
  .detail-card::before{
    content:"";position:absolute;inset:7px;border:1px solid var(--rose-light);border-radius:14px;pointer-events:none;
  }
  .detail-card .ribbon{width:34px;height:auto;color:var(--rose);margin:0 auto 8px;display:block;}
  .detail-card h3{
    font-size:clamp(1.4rem,4vw,1.7rem);color:var(--ink);margin-bottom:6px;font-weight:600;
  }
  .detail-card .glass-icon{width:90px;height:auto;color:var(--rose);margin:6px auto 10px;display:block;}
  .detail-card .hora{color:var(--rose);font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.3rem,3.6vw,1.6rem);margin:4px 0;}
  .detail-card .lugar{font-weight:600;color:var(--ink);margin-bottom:14px;}
  .detail-card .cta{
    display:inline-block;background:var(--rose);color:var(--ivory);
    text-decoration:none;padding:10px 26px;border-radius:20px;
    text-transform:uppercase;letter-spacing:1.5px;font-size:.72rem;font-weight:700;
    border:1px solid var(--rose-deep);
  }
  .detail-card .couple-icon{width:82px;height:auto;color:var(--rose);margin:4px auto 8px;display:block;}
  .detail-card .dresscode-label{
    text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:var(--ink);font-size:1rem;margin-bottom:2px;
  }
  .detail-card .dresscode-value{font-family:'Great Vibes',cursive;color:var(--rose);font-size:clamp(1.5rem,4.4vw,1.9rem);}

  /* ---------- RSVP ---------- */
  .rsvp-card{
    max-width:400px;margin:0 auto;background:var(--ivory);
    border:1px solid var(--gold-light);border-radius:20px;
    padding:30px 24px 34px;position:relative;
    box-shadow:0 14px 30px color-mix(in srgb, var(--rose-deep) 10%, transparent);
  }
  .rsvp-card::before{content:"";position:absolute;inset:7px;border:1px solid var(--rose-light);border-radius:14px;pointer-events:none;}
  .rsvp-card .envelope{width:70px;height:auto;color:var(--rose);margin:4px auto 10px;display:block;}
  .rsvp-card h3{font-family:'Great Vibes',cursive;color:var(--rose);font-size:clamp(1.8rem,5vw,2.3rem);font-weight:400;margin-bottom:8px;}
  .rsvp-card > p{font-size:.9rem;color:var(--ink);margin-bottom:14px;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;margin-top:6px;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold);font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Montserrat',sans-serif;font-size:.95rem;
    padding:10px 12px;border-radius:10px;border:1px solid var(--rose-light);
    background:var(--blush-soft);color:var(--ink);margin-top:5px;width:100%;
  }
  .rsvp-form textarea{min-height:70px;resize:vertical;}
  .rsvp-form button{
    background:var(--rose);border:1px solid var(--rose-deep);color:var(--ivory);font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;font-size:.8rem;
    padding:13px;border-radius:22px;cursor:pointer;transition:background .2s;
  }
  .rsvp-form button:hover{background:var(--rose-deep);}
  .rsvp-whatsapp{color:var(--gold);font-size:.85rem;text-align:center;text-decoration:underline;}
  .rsvp-status{text-align:center;color:#4a7a4a;font-weight:600;}

  /* ---------- FOOTER ---------- */
  footer{
    text-align:center;padding:60px 20px 50px;position:relative;overflow:hidden;
  }
  footer .big-num{
    font-family:'Playfair Display',serif;font-weight:700;color:var(--rose-light);
    font-size:clamp(4.5rem,22vw,8rem);opacity:.55;line-height:1;
  }
  footer .name-over{
    font-family:'Great Vibes',cursive;color:var(--rose);
    font-size:clamp(2.2rem,9vw,3.6rem);margin-top:-1.1em;position:relative;
  }
  footer small{
    display:block;margin-top:10px;letter-spacing:2px;text-transform:uppercase;
    color:var(--gold);font-size:.7rem;font-weight:600;
  }
</style></head>
<body>

  <div class="hero-wrap">
    ${floralCornerSvg("corner tl icon")}
    ${floralCornerSvg("corner tr icon")}
    ${floralCornerSvg("corner bl icon")}
    ${floralCornerSvg("corner br icon")}
    <div class="hero-card">
      <span class="hero-num"><span>15</span></span>
      <p class="hero-title">Mis Quinceaños</p>
      ${bowSvg("hero-divider icon")}
      <h1 class="hero-name">${esc(d.nombre)}</h1>
      <p class="hero-sub">Estás invitada a celebrar conmigo</p>
      <div class="hero-date">
        <span>${esc(diaSemana)}</span>
        <span class="badge">${esc(diaNum)}</span>
        <span>${esc(mesNombre)}</span>
      </div>
      ${tiaraSvg("hero-tiara icon")}
    </div>
  </div>

  <section>
    <h2 class="title">Cuenta regresiva</h2>
    ${cd.html}
  </section>

  <section class="section-blush">
    ${bowSvg("hero-divider icon")}
    <h2 class="title">Un mensaje para vos</h2>
    <div class="quote-card">
      ${bowSvg()}
      <p>${esc(d.mensaje)}</p>
      <p class="padres">${esc(d.padres)}</p>
    </div>
    ${gal.html}
  </section>

  <section>
    <span class="eyebrow">Detalles</span>

    ${d.lugarCeremonia ? `
    <div class="detail-card">
      ${bowSvg("ribbon icon")}
      <h3>Ceremonia</h3>
      ${glassesSvg("glass-icon")}
      <p class="hora">${esc(d.horaCeremonia)}</p>
      <p class="lugar">${esc(d.lugarCeremonia)}</p>
      ${d.direccionMapa ? `<a class="cta" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>` : ""}

    <div class="detail-card">
      ${bowSvg("ribbon icon")}
      <h3>Recepción</h3>
      ${glassesSvg("glass-icon")}
      <p class="hora">${esc(d.horaFiesta)}</p>
      <p class="lugar">${esc(d.lugarFiesta)}</p>
      ${d.direccionMapa ? `<a class="cta" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>

    <div class="detail-card">
      ${bowSvg("ribbon icon")}
      ${coupleSvg("couple-icon")}
      <p class="dresscode-label">Código de vestimenta</p>
      <p class="dresscode-value">${esc(d.dressCode)}</p>
    </div>

    <div class="rsvp-card">
      ${bowSvg("ribbon icon")}
      ${envelopeSvg("envelope")}
      <h3>Confirmar asistencia</h3>
      <p>Esperamos contar con tu presencia en este día tan especial para mí.</p>
      ${rsvp.html}
    </div>
  </section>

  <footer>
    ${sparkleSvg("icon-gold")}
    <div class="big-num">15</div>
    <div class="name-over">${esc(d.nombre)}</div>
    <small>Gracias por acompañarme</small>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Glam Rosa",
  summary: "Frame floral en rosa y dorado, tiara y moños dibujados a mano, con tarjetas tipo souvenir para cada detalle.",
  accent: "#c9536c", accent2: "#b6924f", schema: xvSchema, sampleData, render,
};
