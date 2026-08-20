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
  coverImage: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1200&q=80",
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

  let diaSemana = "";
  let diaNumero = "";
  let mesAnio = "";
  if (d.fecha) {
    try {
      const [y, m, day] = d.fecha.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      diaSemana = dt.toLocaleDateString("es-AR", { weekday: "long" });
      diaNumero = String(dt.getDate());
      mesAnio = dt.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    } catch { diaSemana = ""; }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --sage:#93a67e;
    --sage-dark:#5b6e46;
    --sage-pale:#eef2e6;
    --gold:#b8935a;
    --gold-dark:#8f6f3d;
    --cream:#fbf9f2;
    --ink:#4a4335;
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{
    margin:0;
    font-family:'EB Garamond',Georgia,serif;
    background:var(--cream);
    background-image:
      radial-gradient(circle at 6% 8%, rgba(147,166,126,.16) 0, transparent 42%),
      radial-gradient(circle at 96% 14%, rgba(184,147,90,.10) 0, transparent 38%),
      radial-gradient(circle at 90% 92%, rgba(147,166,126,.14) 0, transparent 42%);
    color:var(--ink);
    line-height:1.7;
    font-size:17px;
  }
  h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;margin:0 0 10px;}
  .wrap{max-width:760px;margin:0 auto;padding:0 20px;}

  /* --- ornaments (explicit sizes on every svg, per project rule) --- */
  .cross-icon{width:34px;height:34px;color:var(--gold);margin:0 auto 14px;display:block;}
  .divider{
    display:flex;align-items:center;justify-content:center;gap:12px;
    padding:8px 0 0;color:var(--sage-dark);
  }
  .divider .line{flex:0 0 70px;height:1px;background:var(--sage);opacity:.55;}
  .divider svg{width:22px;height:22px;flex:0 0 auto;}

  /* --- section shells --- */
  section{padding:clamp(34px,6vw,60px) 0;position:relative;text-align:center;}
  .section-title{
    text-align:center;color:var(--sage-dark);
    font-size:clamp(1.5rem,4.4vw,2rem);
    font-style:italic;margin-bottom:6px;
  }
  .section-sub{
    text-align:center;color:var(--gold-dark);
    font-size:.72rem;text-transform:uppercase;letter-spacing:2.5px;
    margin-bottom:28px;
  }

  .card{
    background:#fffefb;
    border:1px solid #e6ddc8;
    border-radius:4px;
    box-shadow:0 8px 24px rgba(91,110,70,.08);
  }

  /* --- hero --- */
  .hero{
    background:var(--sage-pale);
    padding:clamp(46px,9vw,80px) 20px clamp(40px,7vw,64px);
    border-bottom:1px solid #dfe6d5;
  }
  .hero .wrap{max-width:620px;margin:0 auto;text-align:center;}
  .hero .kicker{
    font-family:'EB Garamond',serif;font-style:italic;
    color:var(--sage-dark);font-size:clamp(.85rem,2.4vw,1rem);
    margin-bottom:6px;
  }
  .hero .titulo{
    font-family:'Cormorant Garamond',serif;font-weight:500;
    text-transform:uppercase;letter-spacing:8px;
    font-size:clamp(1.7rem,6vw,2.5rem);color:var(--gold-dark);
    margin:0 0 6px;padding-left:8px;
  }
  .hero .subtitulo{color:#7a8a68;font-size:.9rem;margin-bottom:18px;}
  .hero h1{
    font-family:'Great Vibes',cursive;font-weight:400;
    font-size:clamp(2.6rem,10vw,4.4rem);
    color:var(--sage-dark);
    line-height:1.15;margin:6px 0 22px;
  }
  .hero .foto-frame{
    width:clamp(140px,32vw,190px);height:clamp(140px,32vw,190px);
    border-radius:50%;margin:0 auto 22px;
    border:3px solid var(--gold);padding:5px;
    box-shadow:0 8px 22px rgba(91,110,70,.18);
  }
  .hero .foto-frame img{
    width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;
  }
  .hero .fecha-linea{
    display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;
    font-size:clamp(.85rem,2.6vw,1rem);color:var(--ink);
  }
  .hero .fecha-linea .dia{font-style:italic;color:var(--sage-dark);}
  .hero .fecha-linea .num{
    font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,5vw,2.1rem);
    color:var(--gold-dark);font-weight:600;
  }
  .hero .fecha-linea .sep{color:var(--sage);opacity:.6;}
  .hero .fecha-linea .mes{text-transform:capitalize;color:var(--ink);}

  /* --- mensaje --- */
  .mensaje{
    max-width:600px;margin:0 auto;text-align:center;
    font-size:clamp(1rem,2.6vw,1.2rem);
    font-style:italic;color:var(--ink);
    padding:0 10px;
  }

  /* --- countdown --- */
  .countdown{display:flex;gap:clamp(10px,3vw,24px);justify-content:center;flex-wrap:wrap;}
  .countdown > div{
    background:#fffefb;border:1px solid #e6ddc8;
    border-radius:50%;
    width:clamp(62px,16vw,90px);height:clamp(62px,16vw,90px);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    box-shadow:0 6px 16px rgba(91,110,70,.12);
  }
  .cd-num{font-size:clamp(1.15rem,4vw,1.7rem);color:var(--gold-dark);font-weight:600;font-family:'Cormorant Garamond',serif;}
  .cd-label{font-size:.6rem;text-transform:uppercase;letter-spacing:1px;color:var(--sage-dark);}

  /* --- timeline --- */
  .timeline{
    max-width:560px;margin:0 auto;
    display:flex;flex-direction:column;gap:14px;
  }
  .timeline-item{
    display:flex;gap:18px;padding:20px 22px;
    text-align:left;
    border-left:2px solid var(--sage);
    position:relative;margin-left:10px;
  }
  .timeline-item::before{
    content:"";position:absolute;left:-7px;top:26px;
    width:12px;height:12px;border-radius:50%;
    background:var(--gold);border:2px solid var(--cream);
  }
  .timeline-time{
    font-weight:600;color:var(--gold-dark);
    min-width:60px;font-size:1rem;font-family:'Cormorant Garamond',serif;
  }
  .timeline-what strong{display:block;color:var(--sage-dark);font-size:1.05rem;margin-bottom:2px;font-family:'Cormorant Garamond',serif;font-weight:600;}
  .timeline-what span{color:#7a705c;font-size:.9rem;}
  .map-link{
    display:inline-block;margin-top:18px;color:var(--gold-dark);
    text-decoration:none;border-bottom:1px dashed var(--gold-dark);
    font-size:.9rem;
  }

  /* --- padres y padrinos --- */
  .people{
    display:flex;gap:20px;justify-content:center;flex-wrap:wrap;
    max-width:680px;margin:0 auto;
  }
  .people .card{
    flex:1 1 250px;max-width:310px;
    padding:26px 22px;text-align:center;
  }
  .people .card .tag{
    text-transform:uppercase;letter-spacing:2.5px;font-size:.66rem;
    color:var(--gold-dark);margin-bottom:8px;
  }
  .people .card .names{font-size:1.2rem;color:var(--sage-dark);font-style:italic;font-family:'Cormorant Garamond',serif;}

  /* --- gallery --- */
  .gallery{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px;max-width:780px;margin:0 auto;padding:0 4px;
  }
  .gallery-item img{
    width:100%;height:180px;object-fit:cover;border-radius:6px;
    cursor:pointer;border:1px solid #e6ddc8;
    transition:transform .2s ease;
  }
  .gallery-item img:hover{transform:scale(1.02);}
  .lightbox{
    display:none;position:fixed;inset:0;background:rgba(35,42,26,.92);
    align-items:center;justify-content:center;z-index:60;
  }
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:6px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  /* --- rsvp --- */
  .rsvp-form{
    display:flex;flex-direction:column;gap:14px;
    max-width:400px;margin:0 auto;padding:30px 26px;
    text-align:left;
  }
  .rsvp-form label{font-size:.8rem;color:var(--sage-dark);display:block;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:10px 12px;border:1px solid #e6ddc8;
    border-radius:6px;margin-top:5px;width:100%;background:#fffefb;color:var(--ink);
  }
  .rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{
    outline:1px solid var(--sage);border-color:var(--sage);
  }
  .rsvp-form button{
    background:var(--gold-dark);color:#fff;border:0;padding:13px;
    border-radius:6px;cursor:pointer;font-size:1rem;letter-spacing:.5px;
    transition:background .2s ease;
  }
  .rsvp-form button:hover{background:var(--sage-dark);}
  .rsvp-whatsapp{text-align:center;color:var(--sage-dark);font-size:.85rem;text-decoration:none;border-bottom:1px dashed var(--sage-dark);align-self:center;}
  .rsvp-status{text-align:center;color:var(--sage-dark);font-weight:600;}

  footer{
    text-align:center;padding:34px 20px;font-size:.85rem;color:#8a7d61;
    border-top:1px solid #e6ddc8;
  }
  footer .fleuron{color:var(--gold);font-size:1.2rem;display:block;margin-bottom:6px;}

  @media (max-width:480px){
    .timeline-item{gap:10px;padding:16px 14px;}
    .people .card{padding:20px 16px;}
    .hero .titulo{letter-spacing:5px;}
  }
</style></head>
<body>

  <section class="hero">
    <div class="wrap">
      <svg class="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <path d="M12 2v20M6 8h12"/>
      </svg>
      <p class="kicker">Tenemos el honor de invitarte al</p>
      <p class="titulo">Bautizo</p>
      <p class="subtitulo">de nuestro querido hijo</p>
      <h1>${esc(d.nombreChico)}</h1>
      <div class="foto-frame"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>
      <div class="fecha-linea">
        <span class="dia">${esc(diaSemana || d.fecha)}</span>
        ${diaNumero ? `<span class="sep">|</span><span class="num">${esc(diaNumero)}</span><span class="sep">|</span><span class="mes">${esc(mesAnio)}</span>` : ""}
      </div>
    </div>
  </section>

  <div class="divider">
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

  <section style="background:var(--sage-pale)">
    <div class="wrap">
      <h2 class="section-title">Cuenta regresiva</h2>
      <p class="section-sub">Falta cada vez menos</p>
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
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section style="background:var(--sage-pale)">
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

  <section style="background:var(--sage-pale)">
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
  summary: "Estética campestre romántica en verde salvia y dorado, con cruz minimal, foto enmarcada y tipografía caligráfica sobre fondo acuarela.",
  accent: "#5b6e46",
  accent2: "#b8935a",
  schema: bautismoSchema,
  sampleData,
  render,
};
