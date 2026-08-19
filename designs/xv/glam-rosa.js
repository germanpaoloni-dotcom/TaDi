const { esc, countdownWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");

const id = "xv-glam-rosa";

const sampleData = {
  nombre: "Valentina",
  fecha: "2027-05-15", horaFiesta: "21:00", lugarFiesta: "Salón Glamour, Vicente López",
  horaCeremonia: "", lugarCeremonia: "",
  direccionMapa: "https://maps.google.com/?q=Salon+Glamour",
  padres: "Sus padres, Laura y Diego",
  mensaje: "Mis 15 años son el comienzo de una nueva etapa. ¡Quiero compartirla con las personas que más quiero!",
  dressCode: "Elegante - se sugiere fucsia o dorado",
  whatsapp: "5491100000003",
  spotify: "",
  coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd4");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const slides = (d.galeria || []).map((src, i) =>
    `<div class="slide${i === 0 ? " active" : ""}"><img src="${esc(src)}" alt="Foto ${i + 1}"></div>`
  ).join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<style>
  :root{--pink:#e0489b;--gold:#d4af37;--dark:#241522;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Poppins',Arial,sans-serif;background:var(--dark);color:#fff;}
  .hero{height:60vh;min-height:400px;background:linear-gradient(180deg,rgba(36,21,34,.3),var(--dark)),url('${esc(d.coverImage)}') center/cover;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
  .hero h1{font-size:3rem;background:linear-gradient(90deg,var(--pink),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent;margin:0;}
  .hero p{letter-spacing:4px;text-transform:uppercase;font-size:.8rem;color:var(--gold);}
  section{max-width:700px;margin:0 auto;padding:50px 24px;text-align:center;}
  h2{color:var(--pink);font-weight:600;text-transform:uppercase;letter-spacing:2px;font-size:1.2rem;}
  .countdown{display:flex;gap:14px;justify-content:center;}
  .countdown div{background:rgba(255,255,255,.05);border:1px solid var(--gold);border-radius:10px;padding:12px 16px;}
  .cd-num{font-size:1.8rem;color:var(--gold);display:block;}
  .cd-label{font-size:.65rem;text-transform:uppercase;}
  .info{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:20px;}
  .info div{background:rgba(255,255,255,.06);padding:18px 24px;border-radius:14px;min-width:200px;}
  .carousel{position:relative;max-width:500px;margin:20px auto 0;overflow:hidden;border-radius:16px;}
  .slide{display:none;}
  .slide.active{display:block;}
  .slide img{width:100%;height:320px;object-fit:cover;}
  .carousel-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;border:0;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.1rem;}
  .carousel-btn.prev{left:10px;}
  .carousel-btn.next{right:10px;}
  .dots{display:flex;gap:6px;justify-content:center;margin-top:10px;}
  .dot{width:8px;height:8px;border-radius:50%;background:#555;cursor:pointer;}
  .dot.active{background:var(--pink);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:20px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#c9a8c2;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border-radius:8px;border:1px solid #6a4a63;background:rgba(255,255,255,.05);color:#fff;margin-top:4px;width:100%;}
  .rsvp-form button{background:linear-gradient(90deg,var(--pink),var(--gold));border:0;color:#241522;font-weight:700;padding:12px;border-radius:8px;cursor:pointer;}
  .rsvp-whatsapp{color:var(--gold);font-size:.85rem;text-align:center;}
  .rsvp-status{text-align:center;color:#7ee787;font-weight:bold;}
  footer{text-align:center;padding:30px;font-size:.8rem;color:#a98fa4;}
</style></head>
<body>
  <div class="hero"><h1>${esc(d.nombre)}</h1><p>Mis XV años</p></div>

  <section>
    <h2>Cuenta regresiva</h2>
    ${cd.html}
    <p style="margin-top:14px;color:#cbb8c8">${esc(d.padres)}</p>
    <p>${esc(d.mensaje)}</p>
  </section>

  <section>
    <h2>Dónde y cuándo</h2>
    <div class="info">
      ${d.lugarCeremonia ? `<div><strong>Ceremonia</strong><br>${esc(d.horaCeremonia)}<br>${esc(d.lugarCeremonia)}</div>` : ""}
      <div><strong>Fiesta</strong><br>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}</div>
    </div>
    ${d.direccionMapa ? `<p style="margin-top:14px"><a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--gold)">Ver ubicación →</a></p>` : ""}
    <p style="margin-top:10px">Dress code: <strong>${esc(d.dressCode)}</strong></p>
  </section>

  <section>
    <h2>Fotos</h2>
    <div class="carousel" id="carousel">
      ${slides}
      <button class="carousel-btn prev">‹</button>
      <button class="carousel-btn next">›</button>
    </div>
    <div class="dots" id="dots"></div>
  </section>

  <section>
    <h2>Confirmá tu lugar</h2>
    ${rsvp.html}
  </section>

  <footer>¡Te espero para bailar toda la noche! 💃</footer>

  <script>
    ${cd.script}${rsvp.script}
    (function(){
      var slides = document.querySelectorAll('#carousel .slide');
      var dotsWrap = document.getElementById('dots');
      var idx = 0;
      slides.forEach(function(_, i){
        var dot = document.createElement('div');
        dot.className = 'dot' + (i===0 ? ' active' : '');
        dot.addEventListener('click', function(){ show(i); });
        dotsWrap.appendChild(dot);
      });
      function show(i){
        if(!slides.length) return;
        idx = (i + slides.length) % slides.length;
        slides.forEach(function(s, si){ s.classList.toggle('active', si===idx); });
        dotsWrap.querySelectorAll('.dot').forEach(function(d, di){ d.classList.toggle('active', di===idx); });
      }
      var prev = document.querySelector('.carousel-btn.prev');
      var next = document.querySelector('.carousel-btn.next');
      if(prev) prev.addEventListener('click', function(){ show(idx-1); });
      if(next) next.addEventListener('click', function(){ show(idx+1); });
      if(slides.length > 1) setInterval(function(){ show(idx+1); }, 4500);
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Glam Rosa",
  summary: "Carrusel de fotos automático, paleta rosa/dorado y look de fiesta glam.",
  accent: "#e0489b", schema: xvSchema, sampleData, render,
};
