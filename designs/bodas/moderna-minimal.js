const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

const id = "boda-moderna-minimal";

const sampleData = {
  novia: "Sofía", novio: "Nicolás",
  fecha: "2027-03-20", horaCeremonia: "19:00", lugarCeremonia: "Registro Civil, CABA",
  horaFiesta: "21:00", lugarFiesta: "Terraza Puerto Madero",
  direccionMapa: "https://maps.google.com/?q=Puerto+Madero",
  mensaje: "Simple, íntimo, nuestro. Los esperamos para brindar juntos.",
  dressCode: "Formal minimal - blanco y negro",
  alias: "sofi.nico.wedding",
  whatsapp: "5491100000002",
  coverImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1529636444744-d90360e0c885?w=800&q=80",
    "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80",
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd3");
  const gal = galleryWidget(d.galeria, "gal3");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} + ${esc(d.novio)}</title>
<style>
  :root{--ink:#111;--line:#e5e5e5;--accent:#111;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;color:var(--ink);background:#fff;}
  .hero{display:flex;min-height:50vh;}
  .hero-img{flex:1;background:linear-gradient(135deg,#ddd,#aaa),url('${esc(d.coverImage)}') center/cover;min-height:280px;}
  .hero-text{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px;}
  .hero-text .plus{font-size:1.5rem;color:#999;}
  h1{font-size:2.8rem;font-weight:700;margin:.2em 0;letter-spacing:-1px;}
  .tabs{position:sticky;top:0;background:#fff;border-bottom:1px solid var(--line);display:flex;overflow-x:auto;z-index:10;}
  .tab-btn{flex:1;padding:16px;border:0;background:none;font-size:.85rem;text-transform:uppercase;letter-spacing:1px;cursor:pointer;color:#888;white-space:nowrap;border-bottom:3px solid transparent;}
  .tab-btn.active{color:var(--ink);border-color:var(--ink);font-weight:600;}
  .panel{display:none;max-width:700px;margin:0 auto;padding:50px 24px;}
  .panel.active{display:block;}
  .countdown{display:flex;gap:16px;}
  .countdown div{flex:1;text-align:center;border:1px solid var(--line);padding:16px 0;}
  .cd-num{font-size:2rem;display:block;font-weight:700;}
  .cd-label{font-size:.7rem;text-transform:uppercase;color:#888;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:10px;}
  .grid2 > div{border:1px solid var(--line);padding:20px;}
  .grid2 h3{margin:0 0 6px;font-size:1rem;text-transform:uppercase;letter-spacing:1px;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;}
  .gallery img{width:100%;height:160px;object-fit:cover;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#888;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px;border:1px solid var(--line);margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--ink);color:#fff;border:0;padding:14px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;}
  .rsvp-whatsapp{font-size:.85rem;}
  .rsvp-status{font-weight:bold;color:#2e7d32;}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#999;border-top:1px solid var(--line);}
</style></head>
<body>
  <div class="hero">
    <div class="hero-img"></div>
    <div class="hero-text">
      <span class="plus">Nos casamos</span>
      <h1>${esc(d.novia)} <span class="plus">+</span> ${esc(d.novio)}</h1>
      <p>${esc(d.mensaje)}</p>
    </div>
  </div>

  <nav class="tabs">
    <button class="tab-btn active" data-tab="cuando">Cuándo</button>
    <button class="tab-btn" data-tab="donde">Dónde</button>
    <button class="tab-btn" data-tab="fotos">Fotos</button>
    <button class="tab-btn" data-tab="rsvp">Confirmar</button>
  </nav>

  <div class="panel active" data-panel="cuando">
    <h2>Faltan...</h2>
    ${cd.html}
    <p style="margin-top:20px">${esc(d.fecha)} — ${esc(d.horaFiesta)} hs</p>
  </div>

  <div class="panel" data-panel="donde">
    <div class="grid2">
      <div><h3>Ceremonia</h3><p>${esc(d.horaCeremonia)}<br>${esc(d.lugarCeremonia)}</p></div>
      <div><h3>Fiesta</h3><p>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}</p></div>
    </div>
    ${d.direccionMapa ? `<p style="margin-top:16px"><a href="${esc(d.direccionMapa)}" target="_blank">Ver mapa →</a></p>` : ""}
    <p style="margin-top:10px">Dress code: <strong>${esc(d.dressCode)}</strong></p>
  </div>

  <div class="panel" data-panel="fotos">
    ${gal.html}
  </div>

  <div class="panel" data-panel="rsvp">
    ${rsvp.html}
  </div>

  <footer>Alias para regalo: ${esc(d.alias)}</footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var btns = document.querySelectorAll('.tab-btn');
      var panels = document.querySelectorAll('.panel');
      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          btns.forEach(function(b){ b.classList.remove('active'); });
          panels.forEach(function(p){ p.classList.remove('active'); });
          btn.classList.add('active');
          document.querySelector('.panel[data-panel="'+btn.dataset.tab+'"]').classList.add('active');
        });
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Moderna Minimal",
  summary: "Navegación por pestañas (SPA), tipografía en blanco y negro, ideal para bodas urbanas.",
  accent: "#111111", schema: bodaSchema, sampleData, render,
};
