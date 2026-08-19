const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");

const id = "emp-lanzamiento-producto";

const sampleData = {
  nombreEvento: "Lanzamiento NOVA X",
  empresa: "Nova Devices",
  fecha: "2027-02-12", hora: "19:00", lugar: "Espacio Wave, Palermo",
  direccionMapa: "https://maps.google.com/?q=Espacio+Wave+Palermo",
  descripcion: "Te invitamos a descubrir en primicia el producto que va a cambiar las reglas del juego.",
  agenda: "19:00 - Bienvenida y drinks\n19:45 - Presentación del producto\n20:30 - Prueba en vivo\n21:00 - Networking",
  oradores: "Marina Suárez - CEO, Nova Devices\nFacundo Ibarra - Head of Product",
  dressCode: "Casual elegante",
  contacto: "5491100000007",
  coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "19:00"}:00` : sampleData.fecha, "cd8");
  const gal = galleryWidget(d.galeria, "gal8");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<style>
  :root{--neon:#00e0c6;--dark:#0a0a12;--violet:#7b5cff;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Arial',sans-serif;background:var(--dark);color:#fff;}
  .hero{position:relative;height:75vh;min-height:460px;background:linear-gradient(180deg,rgba(10,10,18,.4),var(--dark)),url('${esc(d.coverImage)}') center/cover;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
  .play-badge{width:70px;height:70px;border-radius:50%;border:2px solid var(--neon);display:flex;align-items:center;justify-content:center;margin-bottom:20px;cursor:pointer;transition:transform .2s;}
  .play-badge:hover{transform:scale(1.08);}
  .play-badge::after{content:"";border-left:16px solid var(--neon);border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;}
  .hero .tag{color:var(--neon);letter-spacing:4px;text-transform:uppercase;font-size:.75rem;}
  .hero h1{font-size:3rem;margin:.2em 0;}
  section{max-width:800px;margin:0 auto;padding:50px 24px;text-align:center;}
  h2{color:var(--neon);text-transform:uppercase;letter-spacing:2px;font-size:1.1rem;}
  .countdown{display:flex;gap:14px;justify-content:center;}
  .countdown div{background:rgba(255,255,255,.06);border-radius:10px;padding:14px 18px;}
  .cd-num{font-size:2rem;color:var(--neon);display:block;font-weight:700;}
  .cd-label{font-size:.65rem;text-transform:uppercase;}
  .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;text-align:left;}
  .feature{background:linear-gradient(145deg,#15152a,#1c1c36);border-radius:14px;padding:20px;border:1px solid rgba(123,92,255,.3);}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:12px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .social-row{display:flex;gap:12px;justify-content:center;margin-top:16px;}
  .social-row a{color:var(--dark);background:var(--neon);padding:10px 16px;border-radius:20px;text-decoration:none;font-size:.85rem;font-weight:600;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;max-width:380px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#9d97c9;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border-radius:8px;border:1px solid #2c2c4a;background:#12121f;color:#fff;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--violet);color:#fff;border:0;padding:12px;border-radius:8px;cursor:pointer;font-weight:600;}
  .rsvp-status{font-weight:bold;color:var(--neon);}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#7a7a99;}
</style></head>
<body>
  <div class="hero">
    <div class="play-badge" id="playBadge"></div>
    <div class="tag">${esc(d.empresa)}</div>
    <h1>${esc(d.nombreEvento)}</h1>
    <p style="max-width:500px">${esc(d.descripcion)}</p>
  </div>

  <section>
    <h2>Faltan</h2>
    ${cd.html}
    <p style="margin-top:16px">📅 ${esc(d.fecha)} · 🕗 ${esc(d.hora)} hs<br>📍 ${esc(d.lugar)} ${d.direccionMapa ? `· <a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--neon)">Cómo llegar</a>` : ""}</p>
    <p>Dress code: <strong>${esc(d.dressCode)}</strong></p>
  </section>

  <section>
    <h2>Lo que vas a vivir</h2>
    <div class="feature-grid">
      ${(d.agenda || "").split("\n").filter(Boolean).map((line) => `<div class="feature">${esc(line)}</div>`).join("") || "<p>Agenda a confirmar.</p>"}
    </div>
  </section>

  <section>
    <h2>Adelanto</h2>
    ${gal.html}
  </section>

  <section>
    <h2>Confirmá tu lugar</h2>
    ${rsvp.html}
    <div class="social-row">
      <a href="#" onclick="return false;">📸 Instagram</a>
      <a href="#" onclick="return false;">💼 LinkedIn</a>
    </div>
  </section>

  <footer>${esc(d.empresa)} · Todos los derechos reservados</footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var badge = document.getElementById('playBadge');
      badge.addEventListener('click', function(){
        badge.style.transform = badge.style.transform === 'scale(1.3) rotate(90deg)' ? '' : 'scale(1.3) rotate(90deg)';
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Lanzamiento de Producto",
  summary: "Hero oscuro tipo keynote, tarjetas de features y adelanto visual del producto.",
  accent: "#00e0c6", schema: empresarialSchema, sampleData, render,
};
