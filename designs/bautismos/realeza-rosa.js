const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-realeza-rosa";

const sampleData = {
  nombreChico: "Catalina",
  padres: "Rocío y Diego",
  padrinos: "Milagros y Facundo",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Basílica del Rosario",
  horaFiesta: "13:00",
  lugarFiesta: "Salón Jardín Real, Nordelta",
  direccionMapa: "https://maps.google.com/?q=Salon+Jardin+Real+Nordelta",
  mensaje: "Con el corazón lleno de alegría, los invitamos a acompañarnos en el día en que Catalina recibirá el sacramento del bautismo. Su presencia es el regalo más lindo que podemos recibir.",
  whatsapp: "5491100000024",
  coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=900&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    "https://images.unsplash.com/photo-1518843025966-8b1d0d0d0d0e?w=900&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd5");
  const gal = galleryWidget(d.galeria || [], "gal5");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --rosa-suave:#fbe4ec;
    --rosa:#f3b6cc;
    --rosa-fuerte:#e28aad;
    --dorado:#c9a15a;
    --dorado-claro:#e6cd9b;
    --crema:#fffaf3;
    --texto:#5c4030;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;width:100%;overflow-x:hidden;}
  body{
    font-family:'Georgia','Times New Roman',serif;
    background:linear-gradient(180deg,var(--crema),var(--rosa-suave) 8%,var(--crema) 95%);
    color:var(--texto);
  }
  h1,h2,h3{font-family:'Georgia',serif;}
  a{color:var(--dorado);}
  .wrap{max-width:720px;margin:0 auto;padding:0 20px;}

  /* HERO */
  .hero{
    position:relative;
    padding:clamp(46px,9vw,80px) 20px clamp(60px,10vw,90px);
    text-align:center;
    background:
      radial-gradient(ellipse at top, rgba(230,205,155,.35), transparent 60%),
      linear-gradient(180deg,var(--rosa-suave),var(--crema));
    overflow:hidden;
  }
  .hero::before, .hero::after{
    content:"";
    position:absolute;
    top:0; bottom:0;
    width:38%;
    background-image:
      radial-gradient(circle, transparent 60%, rgba(201,161,90,.15) 61%, transparent 63%);
    opacity:.5;
    pointer-events:none;
  }
  .medallion{
    width:clamp(140px,32vw,190px);
    height:clamp(140px,32vw,190px);
    margin:0 auto 18px;
    border-radius:50%;
    background:var(--crema) url('${esc(d.coverImage)}') center/cover;
    border:4px solid var(--dorado-claro);
    outline:1px solid var(--dorado);
    outline-offset:8px;
    box-shadow:0 8px 30px rgba(194,140,113,.35), inset 0 0 0 3px #fff;
    position:relative;
    z-index:2;
  }
  .halo{
    width:clamp(180px,42vw,240px);
    height:clamp(180px,42vw,240px);
    margin:0 auto -1px;
    border-radius:50%;
    border:1px dashed rgba(201,161,90,.55);
    display:flex;align-items:center;justify-content:center;
    position:relative;
    z-index:1;
  }
  .halo .medallion{margin:0;}
  .crown{
    font-size:clamp(1.6rem,5vw,2.2rem);
    color:var(--dorado);
    margin-bottom:6px;
    letter-spacing:2px;
    position:relative;
    z-index:2;
  }
  .kicker{
    text-transform:uppercase;
    letter-spacing:.28em;
    font-size:.7rem;
    color:var(--dorado);
    margin:22px 0 6px;
    position:relative;
    z-index:2;
  }
  .hero h1{
    font-size:clamp(2.1rem,7vw,3.4rem);
    margin:4px 0 10px;
    color:var(--rosa-fuerte);
    font-style:italic;
    position:relative;
    z-index:2;
  }
  .hero .sub{
    font-size:clamp(.85rem,2.4vw,1rem);
    color:var(--texto);
    letter-spacing:.05em;
    position:relative;
    z-index:2;
  }
  .ornament{
    display:flex; align-items:center; justify-content:center; gap:10px;
    margin:18px auto 0; color:var(--dorado); font-size:1rem;
    position:relative; z-index:2;
  }
  .ornament .line{width:50px;height:1px;background:linear-gradient(90deg,transparent,var(--dorado),transparent);}

  /* SECTIONS */
  section{padding:clamp(36px,7vw,58px) 20px;text-align:center;}
  section.alt{background:rgba(243,182,204,.14);}
  .panel-title{
    text-transform:uppercase;
    letter-spacing:.22em;
    font-size:clamp(.72rem,2vw,.85rem);
    color:var(--dorado);
    margin:0 0 6px;
  }
  .panel-heading{
    font-size:clamp(1.3rem,4vw,1.8rem);
    color:var(--rosa-fuerte);
    font-style:italic;
    margin:0 0 22px;
  }
  .mensaje{
    max-width:560px;
    margin:0 auto;
    font-size:clamp(1rem,2.6vw,1.1rem);
    line-height:1.7;
    color:var(--texto);
  }

  /* COUNTDOWN */
  .countdown{display:flex;gap:clamp(8px,2.5vw,16px);justify-content:center;flex-wrap:wrap;margin-top:8px;}
  .countdown div{
    background:var(--crema);
    border:1px solid var(--dorado-claro);
    border-radius:14px;
    padding:clamp(10px,2.5vw,16px) clamp(12px,3vw,20px);
    min-width:64px;
    box-shadow:0 4px 14px rgba(194,140,113,.15);
  }
  .cd-num{display:block;font-size:clamp(1.3rem,4vw,1.9rem);color:var(--rosa-fuerte);font-weight:bold;}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dorado);}

  /* CRONOGRAMA */
  .timeline{
    max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:16px;text-align:left;
  }
  .timeline .item{
    display:flex;gap:16px;align-items:flex-start;
    background:var(--crema);
    border:1px solid rgba(201,161,90,.35);
    border-radius:16px;
    padding:16px 20px;
    box-shadow:0 4px 14px rgba(194,140,113,.1);
  }
  .timeline .dot{
    flex:0 0 auto;width:38px;height:38px;border-radius:50%;
    background:linear-gradient(135deg,var(--rosa),var(--dorado-claro));
    display:flex;align-items:center;justify-content:center;
    font-size:1rem;color:#fff;
    box-shadow:0 2px 8px rgba(194,140,113,.3);
  }
  .timeline .item h3{margin:0 0 2px;font-size:1.02rem;color:var(--rosa-fuerte);}
  .timeline .item p{margin:0;font-size:.9rem;color:var(--texto);}
  .timeline .item .hora{font-weight:bold;color:var(--dorado);}
  .map-link{
    display:inline-block;margin-top:18px;
    font-size:.85rem;color:var(--dorado);
    text-decoration:none;border-bottom:1px solid var(--dorado);
    padding-bottom:2px;
  }

  /* PADRES / PADRINOS */
  .familia{
    display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:8px;
  }
  .familia .card{
    background:var(--crema);
    border:1px solid rgba(201,161,90,.35);
    border-radius:18px;
    padding:22px 26px;
    min-width:210px;
    max-width:280px;
    box-shadow:0 4px 14px rgba(194,140,113,.12);
  }
  .familia .card .icon{font-size:1.5rem;margin-bottom:6px;}
  .familia .card h3{
    margin:0 0 8px;font-size:.78rem;text-transform:uppercase;letter-spacing:.15em;color:var(--dorado);
  }
  .familia .card p{margin:0;font-size:1rem;color:var(--rosa-fuerte);font-style:italic;}

  /* GALLERY */
  .gallery{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
    gap:10px;max-width:640px;margin:0 auto;
  }
  .gallery-item{border-radius:14px;overflow:hidden;aspect-ratio:1/1;cursor:pointer;border:2px solid var(--dorado-claro);}
  .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;}
  .gallery-item:hover img{transform:scale(1.08);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(92,64,48,.85);
    align-items:center;justify-content:center;z-index:50;padding:20px;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85vh;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.4);}
  .lightbox-close{
    position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;
  }

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--dorado);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px 12px;border-radius:10px;
    border:1px solid var(--rosa);background:#fff;color:var(--texto);
    margin-top:5px;width:100%;font-size:.95rem;
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:none;border-color:var(--dorado);
  }
  .rsvp-form button{
    background:linear-gradient(90deg,var(--rosa-fuerte),var(--dorado));
    border:0;color:#fff;font-weight:bold;padding:13px;border-radius:10px;
    cursor:pointer;letter-spacing:.05em;text-transform:uppercase;font-size:.82rem;
    box-shadow:0 6px 18px rgba(226,138,173,.4);
  }
  .rsvp-whatsapp{text-align:center;color:var(--dorado);font-size:.85rem;text-decoration:none;border-bottom:1px solid var(--dorado);align-self:center;padding-bottom:2px;}
  .rsvp-status{text-align:center;color:#7a9b6b;font-weight:bold;margin:0;}

  footer{
    text-align:center;padding:40px 20px 50px;
    color:var(--dorado);font-size:.85rem;font-style:italic;
    background:linear-gradient(180deg,transparent,rgba(243,182,204,.2));
  }
  footer .cross{font-size:1.2rem;display:block;margin-bottom:8px;color:var(--rosa-fuerte);}

  @media (max-width:420px){
    .familia{gap:12px;}
    .familia .card{min-width:0;flex:1 1 45%;padding:16px;}
  }
</style></head>
<body>

  <div class="hero">
    <div class="ornament"><span class="line"></span><span>✝</span><span class="line"></span></div>
    <div class="halo"><div class="medallion"></div></div>
    <div class="kicker">Bautismo</div>
    <h1>${esc(d.nombreChico)}</h1>
    <p class="sub">${esc(d.padres)}</p>
  </div>

  <section>
    <p class="panel-title">Un día de bendición</p>
    <p class="mensaje">${esc(d.mensaje)}</p>
  </section>

  <section class="alt">
    <p class="panel-title">Faltan solo</p>
    <p class="panel-heading">Días para el gran día</p>
    ${cd.html}
  </section>

  <section>
    <p class="panel-title">Cronograma</p>
    <p class="panel-heading">Dónde y cuándo</p>
    <div class="timeline">
      ${d.lugarCeremonia ? `<div class="item">
        <div class="dot">✝</div>
        <div><h3>Ceremonia</h3><p class="hora">${esc(d.horaCeremonia)} hs</p><p>${esc(d.lugarCeremonia)}</p></div>
      </div>` : ""}
      ${d.lugarFiesta ? `<div class="item">
        <div class="dot">🎀</div>
        <div><h3>Celebración</h3><p class="hora">${esc(d.horaFiesta)} hs</p><p>${esc(d.lugarFiesta)}</p></div>
      </div>` : ""}
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
  </section>

  <section class="alt">
    <p class="panel-title">Con todo el cariño</p>
    <p class="panel-heading">Padres y padrinos</p>
    <div class="familia">
      <div class="card"><div class="icon">👑</div><h3>Padres</h3><p>${esc(d.padres)}</p></div>
      <div class="card"><div class="icon">🕊️</div><h3>Padrinos</h3><p>${esc(d.padrinos)}</p></div>
    </div>
  </section>

  <section>
    <p class="panel-title">Recuerdos</p>
    <p class="panel-heading">Galería</p>
    ${gal.html}
  </section>

  <section class="alt">
    <p class="panel-title">Nos encantaría contar con vos</p>
    <p class="panel-heading">Confirmá tu asistencia</p>
    ${rsvp.html}
  </section>

  <footer>
    <span class="cross">✝ 🌸 ✝</span>
    Con amor te esperamos para celebrar la bendición de ${esc(d.nombreChico)}.
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Realeza Rosa",
  summary: "Bautismo estilo princesita, con medallón ornamentado, halo delicado y paleta rosa suave y dorado.",
  accent: "#e28aad", schema: bautismoSchema, sampleData, render,
};
