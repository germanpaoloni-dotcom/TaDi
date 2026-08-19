const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");

const id = "xv-bohemio-floral";

const sampleData = {
  nombre: "Martina",
  fecha: "2027-09-04", horaCeremonia: "18:00", lugarCeremonia: "Parroquia San José",
  horaFiesta: "20:00", lugarFiesta: "Quinta La Flor, Pilar",
  direccionMapa: "https://maps.google.com/?q=Quinta+La+Flor+Pilar",
  padres: "Marcela y Fernando",
  mensaje: "Entre flores y buena música, quiero celebrar esta noche tan especial junto a mi familia y amigos.",
  dressCode: "Boho / colores pastel",
  whatsapp: "5491100000004",
  coverImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha, "cd5");
  const gal = galleryWidget(d.galeria, "gal5");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  const accordionItems = [
    { title: "💌 Un mensaje para vos", body: esc(d.mensaje) },
    { title: "⛪ Ceremonia", body: `${esc(d.horaCeremonia || "-")} · ${esc(d.lugarCeremonia || "-")}` },
    { title: "🎉 Fiesta", body: `${esc(d.horaFiesta)} · ${esc(d.lugarFiesta)}${d.direccionMapa ? ` · <a href="${esc(d.direccionMapa)}" target="_blank">Ver mapa</a>` : ""}` },
    { title: "👗 Dress code", body: esc(d.dressCode) },
    { title: "👪 Con la compañía de", body: esc(d.padres) },
  ];

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<style>
  :root{--rose:#c98a99;--sage:#8a9b7a;--cream:#fdf8f2;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Segoe UI',Arial,sans-serif;background:var(--cream);color:#4a3f3a;}
  .hero{height:55vh;min-height:380px;background:url('${esc(d.coverImage)}') center/cover;position:relative;display:flex;align-items:flex-end;padding:30px;}
  .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent 60%);}
  .hero-content{position:relative;color:#fff;z-index:1;}
  .hero-content span{text-transform:uppercase;letter-spacing:3px;font-size:.75rem;color:#f3d9df;}
  .hero-content h1{font-size:2.6rem;margin:.1em 0;font-weight:300;}
  section{max-width:640px;margin:0 auto;padding:40px 24px;}
  .center{text-align:center;}
  h2{color:var(--rose);font-weight:400;text-transform:uppercase;letter-spacing:2px;font-size:1.1rem;}
  .countdown{display:flex;gap:16px;justify-content:center;}
  .countdown div{text-align:center;}
  .cd-num{font-size:1.9rem;color:var(--sage);display:block;}
  .cd-label{font-size:.65rem;text-transform:uppercase;}
  .accordion-item{border-bottom:1px solid #e8d9d3;}
  .accordion-header{width:100%;text-align:left;background:none;border:0;padding:18px 4px;font-size:1rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:#4a3f3a;}
  .accordion-header .arrow{transition:transform .2s;color:var(--rose);}
  .accordion-header.open .arrow{transform:rotate(180deg);}
  .accordion-body{max-height:0;overflow:hidden;transition:max-height .25s ease;padding:0 4px;}
  .accordion-body p{margin:0 0 16px;line-height:1.6;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:12px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#8a7a72;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid #e8d9d3;border-radius:8px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--rose);color:#fff;border:0;padding:12px;border-radius:8px;cursor:pointer;}
  .rsvp-whatsapp{font-size:.85rem;color:var(--sage);}
  .rsvp-status{font-weight:bold;color:var(--sage);}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#8a7a72;}
</style></head>
<body>
  <div class="hero"><div class="hero-content"><span>Mis quince años</span><h1>${esc(d.nombre)}</h1></div></div>

  <section class="center">
    <h2>Cuenta regresiva</h2>
    ${cd.html}
  </section>

  <section>
    <div class="accordion" id="accordion">
      ${accordionItems.map((it, i) => `
        <div class="accordion-item">
          <button class="accordion-header${i === 0 ? " open" : ""}" data-i="${i}">${it.title} <span class="arrow">⌄</span></button>
          <div class="accordion-body">${it.body ? `<p>${it.body}</p>` : "<p></p>"}</div>
        </div>`).join("")}
    </div>
  </section>

  <section class="center">
    <h2>Momentos</h2>
    ${gal.html}
  </section>

  <section class="center">
    <h2>Confirmá tu asistencia</h2>
    ${rsvp.html}
  </section>

  <footer>Con cariño, ${esc(d.nombre)} 🌸</footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var headers = document.querySelectorAll('.accordion-header');
      headers.forEach(function(h){
        var body = h.nextElementSibling;
        if(h.classList.contains('open')) body.style.maxHeight = body.scrollHeight + 'px';
        h.addEventListener('click', function(){
          var isOpen = h.classList.contains('open');
          headers.forEach(function(o){ o.classList.remove('open'); o.nextElementSibling.style.maxHeight = null; });
          if(!isOpen){ h.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
        });
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Bohemio Floral",
  summary: "Secciones tipo acordeón para desplegar cada detalle, estética floral y pastel.",
  accent: "#c98a99", schema: xvSchema, sampleData, render,
};
