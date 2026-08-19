const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-campestre-botanico";

const sampleData = {
  nombreChico: "Renata",
  padres: "Camila y Ignacio",
  padrinos: "Valentina y Joaquín",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Capilla San José",
  horaFiesta: "13:00",
  lugarFiesta: "Estancia La Rosada, Pilar",
  direccionMapa: "https://maps.google.com/?q=Estancia+La+Rosada+Pilar",
  mensaje: "Con el corazón lleno de alegría, queremos que nos acompañes a celebrar el bautismo de Renata, un día para agradecer y compartir en familia.",
  whatsapp: "5491100000022",
  coverImage: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cdbau");
  const gal = galleryWidget(d.galeria, "galbau");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --sage:#7c8b6f;
    --sage-dark:#586b4d;
    --terracota:#c07a54;
    --terracota-dark:#a45f3d;
    --kraft:#f2e9d8;
    --kraft-dark:#e6d9bd;
    --ink:#4a4335;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    font-family:Georgia,'Times New Roman',serif;
    background:var(--kraft);
    background-image:
      radial-gradient(circle at 8% 12%, rgba(124,139,111,.10) 0, transparent 40%),
      radial-gradient(circle at 92% 88%, rgba(192,122,84,.10) 0, transparent 40%);
    color:var(--ink);
    line-height:1.6;
  }
  h1,h2,h3{font-family:'Palatino Linotype',Georgia,serif;font-weight:400;margin:0 0 10px;}
  .wrap{max-width:880px;margin:0 auto;padding:0 20px;}

  /* --- decorative leaf/twig SVG-in-CSS elements --- */
  .leaf-divider{
    display:flex;align-items:center;justify-content:center;gap:10px;
    padding:18px 0;color:var(--sage);
  }
  .leaf-divider .line{flex:0 0 60px;height:1px;background:var(--sage);opacity:.5;}
  .leaf-divider svg{width:26px;height:26px;flex:0 0 auto;}

  .twig-corner{position:absolute;width:90px;height:90px;opacity:.35;pointer-events:none;}
  .twig-corner.tl{top:10px;left:10px;transform:rotate(0deg);}
  .twig-corner.br{bottom:10px;right:10px;transform:rotate(180deg);}

  /* --- hero --- */
  .hero{
    position:relative;
    min-height:clamp(420px,70vh,640px);
    display:flex;align-items:flex-end;justify-content:center;
    background:linear-gradient(180deg,rgba(74,67,53,.05),rgba(74,67,53,.55)),
      center/cover no-repeat;
    text-align:center;padding:40px 20px;
    border-bottom:6px double var(--sage);
  }
  .hero-inner{position:relative;z-index:2;color:#fff;}
  .kicker{
    text-transform:uppercase;letter-spacing:4px;font-size:clamp(.65rem,2vw,.8rem);
    color:#f1e9d5;margin-bottom:8px;
  }
  .hero h1{
    font-size:clamp(2.2rem,7vw,3.6rem);
    font-style:italic;
    text-shadow:0 2px 10px rgba(0,0,0,.35);
  }
  .hero .sub{font-size:clamp(.85rem,2.5vw,1rem);color:#f1e9d5;margin-top:6px;}

  /* --- section shells --- */
  section{padding:clamp(36px,6vw,64px) 0;position:relative;}
  .section-title{
    text-align:center;color:var(--sage-dark);
    font-size:clamp(1.4rem,4vw,1.9rem);
    font-style:italic;margin-bottom:6px;
  }
  .section-sub{text-align:center;color:#8a7d61;font-size:.9rem;margin-bottom:26px;}

  .card{
    background:#fffdf7;
    border:1px solid var(--kraft-dark);
    border-radius:4px;
    box-shadow:0 8px 24px rgba(88,107,77,.08);
  }

  /* --- mensaje --- */
  .mensaje{
    max-width:640px;margin:0 auto;text-align:center;
    font-size:clamp(1rem,2.6vw,1.2rem);
    font-style:italic;color:var(--ink);
    padding:0 10px;
  }

  /* --- countdown --- */
  .countdown{display:flex;gap:clamp(10px,3vw,26px);justify-content:center;flex-wrap:wrap;}
  .countdown > div{
    background:#fffdf7;border:1px solid var(--kraft-dark);
    border-radius:50%;
    width:clamp(64px,16vw,92px);height:clamp(64px,16vw,92px);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    box-shadow:0 6px 16px rgba(88,107,77,.12);
  }
  .cd-num{font-size:clamp(1.2rem,4vw,1.8rem);color:var(--terracota-dark);font-weight:bold;font-family:Georgia,serif;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;color:var(--sage-dark);}

  /* --- cronograma --- */
  .timeline{
    max-width:640px;margin:0 auto;
    display:flex;flex-direction:column;gap:0;
  }
  .timeline-item{
    display:flex;gap:18px;padding:20px 22px;
    border-left:3px solid var(--sage);
    position:relative;margin-left:10px;
  }
  .timeline-item::before{
    content:"";position:absolute;left:-9px;top:26px;
    width:15px;height:15px;border-radius:50%;
    background:var(--terracota);border:3px solid var(--kraft);
  }
  .timeline-item + .timeline-item{margin-top:14px;}
  .timeline-time{
    font-weight:bold;color:var(--terracota-dark);
    min-width:64px;font-size:1rem;
  }
  .timeline-what strong{display:block;color:var(--sage-dark);font-size:1.05rem;margin-bottom:2px;}
  .timeline-what span{color:#7a705c;font-size:.9rem;}
  .map-link{
    display:inline-block;margin-top:18px;color:var(--terracota-dark);
    text-decoration:none;border-bottom:1px dashed var(--terracota-dark);
    font-size:.9rem;
  }
  .map-link-wrap{text-align:center;}

  /* --- padres y padrinos --- */
  .people{
    display:flex;gap:22px;justify-content:center;flex-wrap:wrap;
    max-width:700px;margin:0 auto;
  }
  .people .card{
    flex:1 1 260px;max-width:320px;
    padding:26px 22px;text-align:center;
  }
  .people .card .tag{
    text-transform:uppercase;letter-spacing:2px;font-size:.68rem;
    color:var(--sage);margin-bottom:8px;
  }
  .people .card .names{font-size:1.15rem;color:var(--ink);font-style:italic;}

  /* --- gallery (base styles reused from widget markup, restyled) --- */
  .gallery{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px;max-width:820px;margin:0 auto;padding:0 4px;
  }
  .gallery-item img{
    width:100%;height:180px;object-fit:cover;border-radius:6px;
    cursor:pointer;border:1px solid var(--kraft-dark);
    transition:transform .2s ease;
  }
  .gallery-item img:hover{transform:scale(1.02);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(40,36,26,.92);
    align-items:center;justify-content:center;z-index:60;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:6px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* --- rsvp --- */
  .rsvp-form{
    display:flex;flex-direction:column;gap:14px;
    max-width:400px;margin:0 auto;padding:28px 24px;
    text-align:left;
  }
  .rsvp-form label{font-size:.8rem;color:var(--sage-dark);display:block;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:10px 12px;border:1px solid var(--kraft-dark);
    border-radius:6px;margin-top:5px;width:100%;background:#fffdf7;color:var(--ink);
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:1px solid var(--sage);border-color:var(--sage);
  }
  .rsvp-form button{
    background:var(--terracota);color:#fff;border:0;padding:13px;
    border-radius:6px;cursor:pointer;font-size:1rem;letter-spacing:.5px;
    transition:background .2s ease;
  }
  .rsvp-form button:hover{background:var(--terracota-dark);}
  .rsvp-whatsapp{text-align:center;color:var(--sage-dark);font-size:.85rem;text-decoration:none;border-bottom:1px dashed var(--sage-dark);align-self:center;}
  .rsvp-status{text-align:center;color:var(--sage-dark);font-weight:bold;}

  footer{
    text-align:center;padding:34px 20px;font-size:.85rem;color:#8a7d61;
    border-top:1px solid var(--kraft-dark);
  }
  footer .fleuron{color:var(--sage);font-size:1.2rem;display:block;margin-bottom:6px;}

  @media (max-width:480px){
    .timeline-item{gap:10px;padding:16px 14px;}
    .people .card{padding:20px 16px;}
  }
</style></head>
<body>

  <div class="hero" style="background-image:linear-gradient(180deg,rgba(74,67,53,.05),rgba(74,67,53,.6)), url('${esc(d.coverImage)}')">
    <div class="hero-inner">
      <div class="kicker">Bautismo</div>
      <h1>${esc(d.nombreChico)}</h1>
      <div class="sub">${esc(d.fecha)}${d.lugarCeremonia ? " · " + esc(d.lugarCeremonia) : ""}</div>
    </div>
  </div>

  <div class="leaf-divider">
    <span class="line"></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C8 6 4 10 4 15a8 8 0 0016 0c0-5-4-9-8-13z"/>
      <path d="M12 22V9"/>
    </svg>
    <span class="line"></span>
  </div>

  <section>
    <div class="wrap">
      <p class="mensaje">${esc(d.mensaje)}</p>
    </div>
  </section>

  <section style="background:rgba(124,139,111,.06)">
    <div class="wrap">
      <h2 class="section-title">Cuenta regresiva</h2>
      <p class="section-sub">Falta cada vez menos para celebrar juntos</p>
      ${cd.html}
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2 class="section-title">Cuándo y dónde</h2>
      <p class="section-sub">Ceremonia y celebración</p>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-time">${esc(d.horaCeremonia)}</div>
          <div class="timeline-what">
            <strong>Ceremonia</strong>
            <span>${esc(d.lugarCeremonia)}</span>
          </div>
        </div>
        ${d.horaFiesta || d.lugarFiesta ? `
        <div class="timeline-item">
          <div class="timeline-time">${esc(d.horaFiesta)}</div>
          <div class="timeline-what">
            <strong>Celebración</strong>
            <span>${esc(d.lugarFiesta)}</span>
          </div>
        </div>` : ""}
      </div>
      ${d.direccionMapa ? `<div class="map-link-wrap"><a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></div>` : ""}
    </div>
  </section>

  <section style="background:rgba(192,122,84,.06)">
    <div class="wrap">
      <h2 class="section-title">Con el cariño de</h2>
      <p class="section-sub">Familia y padrinos</p>
      <div class="people">
        <div class="card">
          <div class="tag">Papás</div>
          <div class="names">${esc(d.padres)}</div>
        </div>
        <div class="card">
          <div class="tag">Padrinos</div>
          <div class="names">${esc(d.padrinos)}</div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2 class="section-title">Recuerdos</h2>
      <p class="section-sub">Un poco de nuestra historia</p>
    </div>
    ${gal.html}
  </section>

  <section style="background:rgba(124,139,111,.06)">
    <div class="wrap">
      <h2 class="section-title">Confirmá tu asistencia</h2>
      <p class="section-sub">Nos encantaría contar con vos</p>
      <div class="card" style="max-width:440px;margin:0 auto;">
        ${rsvp.html}
      </div>
    </div>
  </section>

  <footer>
    <span class="fleuron">❦</span>
    Bautismo de ${esc(d.nombreChico)} · Gracias por acompañarnos
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id,
  category: "bautismos",
  name: "Campestre Botánico",
  summary: "Estética campestre en tonos verde salvia y terracota, con detalles botánicos ilustrados y papel tipo kraft.",
  accent: "#7c8b6f",
  schema: bautismoSchema,
  sampleData,
  render,
};
