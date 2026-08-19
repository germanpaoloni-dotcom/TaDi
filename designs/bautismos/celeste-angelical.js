const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-celeste-angelical";

const sampleData = {
  nombreChico: "Benjamín",
  padres: "Ana y Federico",
  padrinos: "Lucía y Nicolás",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Iglesia Nuestra Señora del Carmen",
  horaFiesta: "13:00",
  lugarFiesta: "Quinta Los Álamos, Tigre",
  direccionMapa: "https://maps.google.com/?q=Quinta+Los+Alamos+Tigre",
  mensaje: "Con el corazón lleno de alegría, los invitamos a acompañarnos en el día en que Benjamín recibe el sacramento del bautismo y se convierte en hijo de Dios.",
  whatsapp: "5491100000021",
  coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd-cel");
  const gal = galleryWidget(d.galeria, "gal-cel");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --sky:#eaf6fb;
    --sky-deep:#cdeaf7;
    --celeste:#8ecae6;
    --celeste-dk:#5b9bc7;
    --gold:#f0d9a6;
    --ink:#33465a;
    --white:#ffffff;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Georgia','Times New Roman',serif;
    background:var(--sky);
    color:var(--ink);
  }
  .script{
    font-family:'Brush Script MT','Segoe Script','Lucida Handwriting',cursive;
  }

  /* ---------- nubes decorativas (CSS puro) ---------- */
  .cloud{
    position:absolute;
    background:#fff;
    border-radius:50%;
    opacity:.9;
    filter:drop-shadow(0 4px 6px rgba(91,155,199,.15));
  }
  .cloud::before,.cloud::after{
    content:"";
    position:absolute;
    background:#fff;
    border-radius:50%;
  }
  .cloud::before{width:60%;height:140%;top:-45%;left:12%;}
  .cloud::after{width:45%;height:110%;top:-30%;right:10%;}

  /* ---------- alitas pequeñas (CSS puro) ---------- */
  .wings{
    position:relative;
    width:110px;
    height:46px;
    margin:0 auto 8px;
  }
  .wing{
    position:absolute;
    top:0;
    width:52px;
    height:40px;
    background:linear-gradient(135deg,#ffffff,#dcefff);
    box-shadow:inset 0 0 0 1px rgba(142,202,230,.5);
  }
  .wing.left{
    left:0;
    border-radius:100% 0% 60% 40% / 100% 0% 100% 40%;
    transform:rotate(-8deg);
  }
  .wing.right{
    right:0;
    border-radius:0% 100% 40% 60% / 0% 100% 40% 100%;
    transform:rotate(8deg) scaleX(-1);
  }
  .halo{
    width:26px;height:26px;
    border-radius:50%;
    border:4px solid var(--gold);
    margin:0 auto -6px;
    position:relative;
    z-index:2;
    background:radial-gradient(circle,#fffdf3,transparent 70%);
  }

  /* ---------- hero ---------- */
  .hero{
    position:relative;
    min-height:66vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:70px 20px 50px;
    background:
      radial-gradient(circle at 50% 0%, rgba(255,255,255,.6), transparent 55%),
      linear-gradient(180deg, var(--sky) 0%, var(--sky-deep) 55%, var(--celeste) 130%);
    overflow:hidden;
  }
  .hero .cloud.c1{width:120px;height:44px;top:12%;left:6%;}
  .hero .cloud.c2{width:90px;height:34px;top:22%;right:8%;}
  .hero .cloud.c3{width:70px;height:28px;top:6%;right:26%;}
  .hero .cloud.c4{width:60px;height:24px;bottom:10%;left:14%;}
  .hero-photo{
    width:clamp(120px,30vw,170px);
    height:clamp(120px,30vw,170px);
    border-radius:50%;
    object-fit:cover;
    border:6px solid #fff;
    box-shadow:0 10px 30px rgba(91,155,199,.35);
    margin-bottom:18px;
    position:relative;
    z-index:2;
  }
  .hero-kicker{
    position:relative;z-index:2;
    text-transform:uppercase;
    letter-spacing:4px;
    font-size:.75rem;
    color:var(--celeste-dk);
    margin-bottom:6px;
  }
  .hero h1{
    position:relative;z-index:2;
    font-weight:400;
    font-size:clamp(3rem,11vw,5.2rem);
    color:var(--celeste-dk);
    margin:0 0 10px;
    text-shadow:0 3px 12px rgba(255,255,255,.8);
    line-height:1;
  }
  .hero-sub{
    position:relative;z-index:2;
    font-size:clamp(.95rem,2.6vw,1.15rem);
    color:var(--ink);
    letter-spacing:1px;
  }
  .hero-date{
    position:relative;z-index:2;
    margin-top:18px;
    font-size:.9rem;
    background:#fff;
    padding:8px 20px;
    border-radius:30px;
    color:var(--celeste-dk);
    box-shadow:0 4px 14px rgba(91,155,199,.25);
  }

  /* ---------- secciones ---------- */
  section{
    max-width:760px;
    margin:0 auto;
    padding:54px 24px;
    text-align:center;
  }
  .divider{
    width:70px;
    height:1px;
    background:var(--celeste);
    margin:0 auto 22px;
  }
  h2{
    font-weight:400;
    letter-spacing:2px;
    text-transform:uppercase;
    font-size:1.1rem;
    color:var(--celeste-dk);
  }
  .message{
    font-size:clamp(1.05rem,2.6vw,1.3rem);
    line-height:1.8;
    font-style:italic;
    color:var(--ink);
  }

  .countdown{display:flex;gap:20px;justify-content:center;margin:26px 0;flex-wrap:wrap;}
  .countdown div{
    display:flex;flex-direction:column;
    background:#fff;
    border-radius:16px;
    padding:14px 18px;
    min-width:64px;
    box-shadow:0 6px 18px rgba(91,155,199,.18);
  }
  .cd-num{font-size:1.7rem;color:var(--celeste-dk);font-weight:bold;}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#7d94a8;}

  .timeline{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin-top:28px;}
  .timeline .card{
    background:#fff;
    border-radius:18px;
    padding:28px 30px;
    min-width:220px;
    box-shadow:0 8px 22px rgba(91,155,199,.18);
  }
  .timeline .card .icon{font-size:1.6rem;margin-bottom:8px;display:block;}
  .timeline .card h3{margin:0 0 8px;color:var(--celeste-dk);font-weight:400;letter-spacing:1px;}
  .timeline .card p{margin:0;line-height:1.5;}

  .family{
    display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-top:20px;
  }
  .family .card{
    background:linear-gradient(180deg,#ffffff,#f2fafd);
    border-radius:18px;
    padding:24px 28px;
    min-width:200px;
    box-shadow:0 6px 18px rgba(91,155,199,.15);
  }
  .family .card h3{
    margin:0 0 6px;
    color:var(--celeste-dk);
    font-weight:400;
    text-transform:uppercase;
    letter-spacing:1px;
    font-size:.85rem;
  }
  .family .card p{margin:0;font-size:1.05rem;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:22px;}
  .gallery img{width:100%;height:160px;object-fit:cover;border-radius:14px;cursor:pointer;box-shadow:0 6px 16px rgba(91,155,199,.2);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,50,70,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:22px auto 0;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:var(--celeste-dk);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:1px solid var(--sky-deep);border-radius:10px;margin-top:5px;width:100%;background:#fff;
  }
  .rsvp-form button{
    background:var(--celeste-dk);color:#fff;border:0;padding:13px;border-radius:24px;
    letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-size:.85rem;
  }
  .rsvp-whatsapp{font-size:.85rem;color:var(--celeste-dk);text-align:center;}
  .rsvp-status{text-align:center;color:#4a8f5a;font-weight:bold;}

  footer{
    text-align:center;padding:40px 20px 50px;font-size:.9rem;color:var(--celeste-dk);
    background:linear-gradient(180deg,var(--sky) 0%,var(--sky-deep) 100%);
  }
  footer .script{font-size:1.4rem;display:block;margin-bottom:6px;}
</style></head>
<body>

  <div class="hero">
    <div class="cloud c1"></div>
    <div class="cloud c2"></div>
    <div class="cloud c3"></div>
    <div class="cloud c4"></div>

    <div class="wings">
      <div class="wing left"></div>
      <div class="wing right"></div>
      <div class="halo"></div>
    </div>

    ${d.coverImage ? `<img class="hero-photo" src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}">` : ""}
    <p class="hero-kicker">Nos bautizamos</p>
    <h1 class="script">${esc(d.nombreChico)}</h1>
    <p class="hero-sub">Los esperamos para celebrar juntos este día tan especial</p>
    <p class="hero-date">${esc(d.fecha)} · ${esc(d.horaCeremonia)} hs</p>
  </div>

  <section>
    <div class="divider"></div>
    <h2>Falta poco</h2>
    ${cd.html}
  </section>

  <section>
    <div class="divider"></div>
    <p class="message">${esc(d.mensaje)}</p>
  </section>

  <section>
    <div class="divider"></div>
    <h2>Cronograma</h2>
    <div class="timeline">
      <div class="card"><span class="icon">⛪</span><h3>Ceremonia</h3><p>${esc(d.horaCeremonia)} hs<br>${esc(d.lugarCeremonia)}</p></div>
      ${d.horaFiesta || d.lugarFiesta ? `<div class="card"><span class="icon">🎈</span><h3>Celebración</h3><p>${esc(d.horaFiesta)} hs<br>${esc(d.lugarFiesta)}</p></div>` : ""}
    </div>
    ${d.direccionMapa ? `<p style="margin-top:22px"><a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--celeste-dk)">Ver ubicación en el mapa →</a></p>` : ""}
  </section>

  <section>
    <div class="divider"></div>
    <h2>Con la bendición de</h2>
    <div class="family">
      ${d.padres ? `<div class="card"><h3>Papás</h3><p>${esc(d.padres)}</p></div>` : ""}
      ${d.padrinos ? `<div class="card"><h3>Padrinos</h3><p>${esc(d.padrinos)}</p></div>` : ""}
    </div>
  </section>

  <section>
    <div class="divider"></div>
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section>
    <div class="divider"></div>
    <h2>Confirmá tu asistencia</h2>
    ${rsvp.html}
  </section>

  <footer>
    <span class="script">${esc(d.nombreChico)}</span>
    Gracias por acompañarnos en este día de fe y ternura.
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Celeste Angelical",
  summary: "Cielo celeste y blanco con nubes y alitas delicadas — tierna y luminosa para el bautismo de un varón.",
  accent: "#5b9bc7", schema: bautismoSchema, sampleData, render,
};
