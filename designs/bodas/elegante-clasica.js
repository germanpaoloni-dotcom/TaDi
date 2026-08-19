const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

const id = "boda-elegante-clasica";

const sampleData = {
  novia: "Julieta", novio: "Tomás",
  fecha: "2027-04-17", horaCeremonia: "18:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "20:30", lugarFiesta: "Salón Los Robles, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Robles+San+Isidro",
  mensaje: "Con la bendición de Dios y nuestros padres, los invitamos a compartir el día en que unimos nuestras vidas.",
  dressCode: "Formal / Elegante sport",
  alias: "julieta.tomas.boda",
  whatsapp: "5491100000000",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<style>
  :root{--gold:#b08d57;--cream:#faf6ef;--ink:#2c2620;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Georgia',serif;background:var(--cream);color:var(--ink);}
  .hero{position:relative;height:70vh;min-height:420px;background:linear-gradient(135deg,#d9c7a3,#8a7355),url('${esc(d.coverImage)}') center/cover;display:flex;align-items:center;justify-content:center;text-align:center;}
  .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.55));}
  .hero-content{position:relative;color:#fff;z-index:1;}
  .hero-content h1{font-size:3rem;font-weight:400;letter-spacing:2px;margin:0;}
  .hero-content .amp{font-style:italic;color:var(--gold);margin:0 10px;}
  .hero-content p{letter-spacing:3px;text-transform:uppercase;font-size:.8rem;margin-top:10px;}
  section{max-width:760px;margin:0 auto;padding:50px 24px;text-align:center;}
  .divider{width:60px;height:2px;background:var(--gold);margin:0 auto 20px;}
  h2{font-weight:400;letter-spacing:2px;text-transform:uppercase;font-size:1.3rem;}
  .message{font-size:1.15rem;line-height:1.7;font-style:italic;}
  .countdown{display:flex;gap:24px;justify-content:center;margin:30px 0;}
  .countdown div{display:flex;flex-direction:column;}
  .cd-num{font-size:2rem;color:var(--gold);}
  .cd-label{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;}
  .timeline{display:flex;gap:30px;justify-content:center;flex-wrap:wrap;margin-top:30px;}
  .timeline .card{background:#fff;border:1px solid #e6ddcb;padding:26px 30px;border-radius:4px;min-width:220px;}
  .timeline .card h3{margin:0 0 8px;color:var(--gold);font-weight:400;letter-spacing:1px;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:20px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:4px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:20px auto 0;text-align:left;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#7a6f5d;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid #d8cdb6;border-radius:4px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--gold);color:#fff;border:0;padding:12px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--gold);text-align:center;}
  .rsvp-status{text-align:center;color:#6b8f5a;font-weight:bold;}
  footer{text-align:center;padding:30px;font-size:.85rem;color:#8a7f6e;}
  .badge{display:inline-block;margin-top:10px;font-size:.75rem;background:#fff;border:1px solid var(--gold);color:var(--gold);padding:6px 14px;border-radius:20px;}
</style></head>
<body>
  <div class="hero"><div class="hero-content">
    <h1>${esc(d.novia)} <span class="amp">&amp;</span> ${esc(d.novio)}</h1>
    <p>Nos casamos</p>
  </div></div>

  <section>
    <div class="divider"></div>
    <h2>Faltan para el gran día</h2>
    ${cd.html}
  </section>

  <section>
    <p class="message">${esc(d.mensaje)}</p>
  </section>

  <section>
    <div class="divider"></div>
    <h2>Cronograma</h2>
    <div class="timeline">
      <div class="card"><h3>Ceremonia</h3><p>${esc(d.horaCeremonia)}<br>${esc(d.lugarCeremonia)}</p></div>
      <div class="card"><h3>Fiesta</h3><p>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}</p></div>
    </div>
    ${d.direccionMapa ? `<p style="margin-top:20px"><a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--gold)">Ver ubicación en el mapa →</a></p>` : ""}
    <span class="badge">Dress code: ${esc(d.dressCode)}</span>
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

  <footer>Mesa de regalos: alias <strong>${esc(d.alias)}</strong><br>Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}</footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Elegante Clásica",
  summary: "Hero fotográfico, cronograma de ceremonia y fiesta, y galería — ideal para una boda tradicional.",
  accent: "#b08d57", schema: bodaSchema, sampleData, render,
};
