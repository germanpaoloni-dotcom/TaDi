const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "bau-realeza-rosa";

const sampleData = {
  nombreChico: "Lucía Ximena",
  padres: "Rocío y Diego",
  padrinos: "Sonia María y Mario Francisco",
  fecha: "2027-05-24",
  horaCeremonia: "13:00",
  lugarCeremonia: "Santuario de Guadalupe",
  horaFiesta: "14:00",
  lugarFiesta: "Salón de Eventos Restaurant Vitali",
  direccionMapa: "https://maps.google.com/?q=Salon+de+Eventos+Restaurant+Vitali",
  mensaje: "La luz de Dios se enciende hoy en mi corazón para iluminar todo el camino de mi vida. Con el corazón lleno de alegría, los invitamos a acompañarnos en el día en que Lucía Ximena recibirá el sacramento del bautismo.",
  whatsapp: "5491100000024",
  coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=900&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#e7a9c2");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "13:00"}:00` : sampleData.fecha, "cd5");
  const gal = galleryWidget(d.galeria || [], "gal5");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const fecha = d.fecha ? new Date(`${d.fecha}T00:00:00`) : null;
  const diaSemana = fecha ? fecha.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "").toUpperCase() : "";
  const mesTxt = fecha ? fecha.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toUpperCase() : "";
  const diaNum = fecha ? String(fecha.getDate()).padStart(2, "0") : "";
  const anioTxt = fecha ? fecha.getFullYear() : "";

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --rosa-fondo:#fbe6ee;
    --rosa-fondo2:#f6d3e1;
    --crema:#fffaf6;
    --rosa:${accent};
    --rosa-fuerte:color-mix(in srgb, ${accent}, black 20%);
    --dorado:#b98a63;
    --dorado-claro:#e3c9a8;
    --verde:#8a9b76;
    --texto:#6b5347;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;width:100%;overflow-x:hidden;}
  body{
    font-family:'Cormorant Garamond',serif;
    font-size:1.08rem;
    background:var(--crema);
    color:var(--texto);
  }
  h1,h2,h3{font-family:'Cinzel',serif;font-weight:500;margin:0;}
  a{color:var(--dorado);}
  .script{font-family:'Alex Brush',cursive;}
  section{padding:clamp(38px,7vw,60px) 20px;text-align:center;}
  section.alt{background:linear-gradient(180deg,var(--rosa-fondo),var(--rosa-fondo2));}

  /* HERO */
  .hero{
    position:relative;
    max-width:720px;
    margin:0 auto;
    padding:clamp(40px,9vw,72px) 20px clamp(50px,9vw,80px);
    text-align:center;
    background:
      radial-gradient(ellipse at top left, color-mix(in srgb, var(--rosa) 55%, transparent), transparent 55%),
      radial-gradient(ellipse at bottom right, color-mix(in srgb, var(--rosa) 45%, transparent), transparent 55%),
      var(--rosa-fondo);
    overflow:hidden;
  }
  .hero .quote{
    max-width:480px;margin:0 auto 26px;
    font-size:clamp(.85rem,2.4vw,1rem);
    font-style:italic;
    color:var(--texto);
    letter-spacing:.02em;
    position:relative;z-index:2;
  }
  .kicker{
    text-transform:uppercase;
    letter-spacing:.32em;
    font-size:clamp(.85rem,2.4vw,1.05rem);
    color:var(--rosa-fuerte);
    margin:0 0 8px;
    font-family:'Cinzel',serif;
    position:relative;z-index:2;
  }
  .hero h1{
    font-family:'Alex Brush',cursive;
    font-weight:400;
    font-size:clamp(2.6rem,10vw,4.6rem);
    line-height:1.05;
    margin:2px 0 22px;
    color:var(--rosa-fuerte);
    position:relative;z-index:2;
  }
  .cross-wrap{
    width:clamp(120px,26vw,160px);
    margin:0 auto 8px;
    position:relative;z-index:2;
  }
  .cross-wrap svg{width:100%;height:auto;display:block;}
  .medallion{
    width:clamp(150px,34vw,200px);
    height:clamp(150px,34vw,200px);
    margin:20px auto 0;
    border-radius:50%;
    background:var(--crema) url('${esc(d.coverImage)}') center/cover;
    border:4px solid #fff;
    outline:1px solid var(--dorado-claro);
    outline-offset:6px;
    box-shadow:0 8px 26px color-mix(in srgb, var(--rosa-fuerte) 30%, transparent);
    position:relative;z-index:2;
  }

  /* DATE BADGE */
  .date-badge{
    display:flex;align-items:center;justify-content:center;gap:14px;
    margin:26px auto 0;flex-wrap:wrap;
    position:relative;z-index:2;
  }
  .date-badge .col{text-align:center;}
  .date-badge .weekday, .date-badge .year{
    font-family:'Cinzel',serif;font-size:clamp(1rem,3vw,1.3rem);
    color:var(--rosa-fuerte);letter-spacing:.05em;
  }
  .date-badge .month{
    font-family:'Cinzel',serif;font-size:clamp(.7rem,2vw,.85rem);
    text-transform:uppercase;letter-spacing:.2em;color:var(--dorado);margin-bottom:2px;
  }
  .date-badge .day{
    font-family:'Cinzel',serif;font-size:clamp(2.2rem,7vw,3rem);
    color:var(--dorado);line-height:1;
  }
  .date-badge .bar{width:1px;height:44px;background:var(--dorado-claro);}

  /* SECTION HEADINGS */
  .panel-title{
    text-transform:uppercase;
    letter-spacing:.2em;
    font-family:'Cinzel',serif;
    font-size:clamp(.85rem,2.4vw,1.05rem);
    color:var(--rosa-fuerte);
    margin:0 0 8px;
    font-weight:600;
  }
  .panel-heading{
    font-family:'Alex Brush',cursive;
    font-size:clamp(1.7rem,5vw,2.4rem);
    color:var(--dorado);
    margin:0 0 26px;
    font-weight:400;
  }
  .mensaje{
    max-width:560px;
    margin:0 auto;
    font-size:clamp(1.05rem,2.6vw,1.2rem);
    line-height:1.75;
    color:var(--texto);
  }

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,2.5vw,16px);justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .countdown div{
    background:var(--crema);
    border:1px solid var(--dorado-claro);
    border-radius:14px;
    padding:clamp(10px,2.5vw,16px) clamp(12px,3vw,20px);
    min-width:66px;
    box-shadow:0 4px 14px color-mix(in srgb, var(--rosa-fuerte) 14%, transparent);
  }
  .cd-num{display:block;font-family:'Cinzel',serif;font-size:clamp(1.3rem,4vw,1.9rem);color:var(--rosa-fuerte);font-weight:600;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dorado);}

  /* CRONOGRAMA */
  .timeline{
    max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:16px;text-align:left;
  }
  .timeline .item{
    display:flex;gap:16px;align-items:flex-start;
    background:var(--crema);
    border:1px solid rgba(185,138,99,.3);
    border-radius:16px;
    padding:16px 20px;
    box-shadow:0 4px 14px color-mix(in srgb, var(--rosa-fuerte) 10%, transparent);
  }
  .timeline .dot{
    flex:0 0 auto;width:38px;height:38px;border-radius:50%;
    background:linear-gradient(135deg,var(--rosa),var(--dorado-claro));
    display:flex;align-items:center;justify-content:center;
    font-size:1.05rem;color:#fff;
    box-shadow:0 2px 8px color-mix(in srgb, var(--rosa-fuerte) 30%, transparent);
  }
  .timeline .item h3{margin:0 0 2px;font-size:1.1rem;color:var(--rosa-fuerte);}
  .timeline .item p{margin:0;font-size:.95rem;color:var(--texto);}
  .timeline .item .hora{font-weight:600;color:var(--dorado);}
  .map-link{
    display:inline-block;margin-top:18px;
    font-size:.9rem;color:var(--dorado);
    text-decoration:none;border-bottom:1px solid var(--dorado);
    padding-bottom:2px;letter-spacing:.03em;
  }

  /* PADRES / PADRINOS */
  .familia{
    display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:8px;
  }
  .familia .card{
    background:var(--crema);
    border:1px solid rgba(185,138,99,.3);
    border-radius:18px;
    padding:24px 26px;
    min-width:210px;
    max-width:280px;
    box-shadow:0 4px 14px color-mix(in srgb, var(--rosa-fuerte) 12%, transparent);
  }
  .familia .card .icon{width:26px;height:26px;margin:0 auto 8px;color:var(--dorado);}
  .familia .card h3{
    margin:0 0 8px;font-family:'Cinzel',serif;font-size:.8rem;text-transform:uppercase;letter-spacing:.15em;color:var(--dorado);
  }
  .familia .card p{margin:0;font-size:1.1rem;color:var(--rosa-fuerte);font-style:italic;}

  /* GALLERY */
  .gallery{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
    gap:10px;max-width:640px;margin:0 auto;
  }
  .gallery-item{border-radius:14px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;border:2px solid var(--dorado-claro);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;}
  .gallery-item:hover img{transform:scale(1.08);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(107,83,71,.85);
    align-items:center;justify-content:center;z-index:50;padding:20px;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85vh;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.4);}
  .lightbox-close{
    position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;
    width:32px;height:32px;line-height:32px;
  }

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--dorado);font-family:'Cinzel',serif;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Cormorant Garamond',serif;font-size:1rem;
    padding:11px 12px;border-radius:10px;
    border:1px solid var(--rosa);background:#fff;color:var(--texto);
    margin-top:5px;width:100%;
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:none;border-color:var(--dorado);
  }
  .rsvp-form button{
    background:linear-gradient(90deg,var(--rosa-fuerte),var(--dorado));
    border:0;color:#fff;font-weight:600;padding:13px;border-radius:10px;
    cursor:pointer;letter-spacing:.08em;text-transform:uppercase;font-size:.85rem;
    font-family:'Cinzel',serif;
    box-shadow:0 6px 18px color-mix(in srgb, var(--rosa-fuerte) 40%, transparent);
  }
  .rsvp-whatsapp{text-align:center;color:var(--dorado);font-size:.9rem;text-decoration:none;border-bottom:1px solid var(--dorado);align-self:center;padding-bottom:2px;}
  .rsvp-status{text-align:center;color:var(--verde);font-weight:600;margin:0;}

  footer{
    text-align:center;padding:40px 20px 50px;
    color:var(--dorado);font-size:1rem;font-style:italic;
    background:linear-gradient(180deg,transparent,color-mix(in srgb, var(--rosa) 25%, transparent));
  }
  footer .cross-mini{width:22px;height:22px;display:block;margin:0 auto 8px;color:var(--rosa-fuerte);}

  @media (max-width:420px){
    .familia{gap:12px;}
    .familia .card{min-width:0;flex:1 1 45%;padding:16px;}
    .date-badge{gap:10px;}
  }
</style></head>
<body>

  <div class="hero">
    ${d.mensaje ? `<p class="quote">&ldquo;${esc(d.mensaje)}&rdquo;</p>` : ""}
    <p class="kicker">Mi Bautizo</p>
    <h1>${esc(d.nombreChico)}</h1>

    <div class="cross-wrap">
      <svg viewBox="0 0 100 140" width="160" height="224" role="img" aria-label="Cruz decorativa">
        <rect x="40" y="8" width="20" height="124" rx="6" fill="#f3d3e0" stroke="var(--rosa)" stroke-width="1.5"/>
        <rect x="14" y="42" width="72" height="20" rx="6" fill="#f3d3e0" stroke="var(--rosa)" stroke-width="1.5"/>
        <g fill="none" stroke="#8a9b76" stroke-width="2" stroke-linecap="round">
          <path d="M50 24 C40 18, 34 26, 40 34 C46 40, 50 30, 50 24Z" fill="var(--rosa)" stroke="var(--rosa-fuerte)"/>
          <path d="M50 24 C60 18, 66 26, 60 34 C54 40, 50 30, 50 24Z" fill="#f6d3e1" stroke="var(--rosa-fuerte)"/>
          <path d="M30 50 C22 46, 18 54, 24 58 C30 62, 32 54, 30 50Z" fill="var(--rosa)" stroke="var(--rosa-fuerte)"/>
          <path d="M70 50 C78 46, 82 54, 76 58 C70 62, 68 54, 70 50Z" fill="#f6d3e1" stroke="var(--rosa-fuerte)"/>
        </g>
      </svg>
    </div>

    <div class="date-badge">
      <div class="col"><span class="weekday">${esc(diaSemana)}</span></div>
      <div class="bar"></div>
      <div class="col"><span class="month">${esc(mesTxt)}</span><span class="day">${esc(diaNum)}</span></div>
      <div class="bar"></div>
      <div class="col"><span class="year">${esc(anioTxt)}</span></div>
    </div>

    <div class="medallion"></div>
  </div>

  <section class="alt">
    <p class="panel-title">Faltan solo</p>
    <p class="panel-heading">Días para el gran día</p>
    ${cd.html}
  </section>

  <section>
    <p class="panel-title">Cronograma</p>
    <p class="panel-heading">Dónde y cuándo</p>
    <div class="timeline">
      ${d.horaCeremonia || d.lugarCeremonia ? `<div class="item">
        <div class="dot">&#10013;</div>
        <div><h3>Misa</h3>${d.horaCeremonia ? `<p class="hora">${esc(d.horaCeremonia)} hs</p>` : ""}${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}</div>
      </div>` : ""}
      ${d.horaFiesta || d.lugarFiesta ? `<div class="item">
        <div class="dot">&#127942;</div>
        <div><h3>Recepción</h3>${d.horaFiesta ? `<p class="hora">${esc(d.horaFiesta)} hs</p>` : ""}${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}</div>
      </div>` : ""}
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
  </section>

  <section class="alt">
    <p class="panel-title">Con todo el cariño</p>
    <p class="panel-heading">Padres y padrinos</p>
    <div class="familia">
      ${d.padres ? `<div class="card">
        <svg class="icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18l1.5-9L9 12l3-7 3 7 3.5-3L20 18H4z"/></svg>
        <h3>Padres</h3><p>${esc(d.padres)}</p>
      </div>` : ""}
      ${d.padrinos ? `<div class="card">
        <svg class="icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c2 2.5 5 4 8 4-1 6-4 10-8 12-4-2-7-6-8-12 3 0 6-1.5 8-4Z"/></svg>
        <h3>Padrinos</h3><p>${esc(d.padrinos)}</p>
      </div>` : ""}
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `
  <section>
    <p class="panel-title">Recuerdos</p>
    <p class="panel-heading">Galería</p>
    ${gal.html}
  </section>` : ""}

  <section class="alt">
    <p class="panel-title">Nos encantaría contar con vos</p>
    <p class="panel-heading">Confirmá tu asistencia</p>
    ${rsvp.html}
  </section>

  <footer>
    <svg class="cross-mini" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11 2h2v8h8v2h-8v10h-2V12H3v-2h8V2z"/></svg>
    Con amor te esperamos para celebrar la bendición de ${esc(d.nombreChico)}.
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Realeza Rosa",
  summary: "Bautismo estilo princesita: acuarela rosa, cruz florida, nombre en caligrafía y detalles dorados.",
  accent: "#c96f92", accent2: "#b98a63", schema: bautismoSchema, sampleData, render,
};
