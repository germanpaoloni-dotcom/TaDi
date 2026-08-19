const { esc, countdownWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");

const id = "emp-gala-aniversario";

const sampleData = {
  nombreEvento: "20° Aniversario Grupo Andina",
  empresa: "Grupo Andina",
  fecha: "2027-10-30", hora: "20:30", lugar: "Salón Alvear, CABA",
  direccionMapa: "https://maps.google.com/?q=Salon+Alvear+CABA",
  descripcion: "Celebramos 20 años de historia junto a nuestro equipo, clientes y aliados. Una noche de gala para agradecer y brindar por lo que viene.",
  agenda: "20:30 - Recepción\n21:15 - Palabras de la dirección\n21:45 - Cena de gala\n23:00 - Show en vivo y baile",
  oradores: "Roberto Aguilar - CEO, Grupo Andina",
  dressCode: "Formal / Black tie",
  contacto: "5491100000008",
  coverImage: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
  ],
  mesas: "Roberto Aguilar - Mesa 1\nEquipo Comercial - Mesa 2\nEquipo Marketing - Mesa 3\nProveedores - Mesa 4\nClientes VIP - Mesa 5",
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha, "cd9");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.contacto });
  const mesas = String(d.mesas || sampleData.mesas)
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => {
      const idx = l.lastIndexOf("-");
      return idx === -1 ? [l, "A confirmar"] : [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<style>
  :root{--gold:#c9a24b;--black:#141414;--cream:#f7f3ec;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Georgia',serif;background:var(--black);color:var(--cream);}
  header{text-align:center;padding:70px 20px;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.75)),url('${esc(d.coverImage)}') center/cover;}
  header .tag{letter-spacing:4px;text-transform:uppercase;font-size:.75rem;color:var(--gold);}
  header h1{font-size:2.6rem;font-weight:400;margin:.2em 0;}
  section{max-width:760px;margin:0 auto;padding:46px 24px;border-top:1px solid #2b2b2b;}
  h2{color:var(--gold);text-transform:uppercase;letter-spacing:2px;font-size:1.05rem;font-weight:400;text-align:center;}
  .center{text-align:center;}
  .countdown{display:flex;gap:14px;justify-content:center;}
  .countdown div{border:1px solid var(--gold);border-radius:6px;padding:12px 18px;}
  .cd-num{font-size:1.8rem;color:var(--gold);display:block;}
  .cd-label{font-size:.6rem;text-transform:uppercase;}
  .seat-finder{max-width:400px;margin:16px auto 0;display:flex;gap:8px;}
  .seat-finder input{flex:1;padding:10px;border-radius:6px;border:1px solid #444;background:#1d1d1d;color:#fff;}
  .seat-finder button{background:var(--gold);border:0;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:bold;}
  .seat-result{margin-top:14px;font-size:1.1rem;min-height:1.4em;}
  .seat-result.found{color:#7ee787;}
  .seat-result.notfound{color:#f87171;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:6px;cursor:pointer;filter:grayscale(20%);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#b8ab8c;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid #444;border-radius:6px;background:#1d1d1d;color:#fff;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--gold);color:#141414;border:0;padding:12px;border-radius:6px;cursor:pointer;font-weight:bold;}
  .rsvp-status{font-weight:bold;color:#7ee787;text-align:center;}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#9c9c9c;}
</style></head>
<body>
  <header>
    <div class="tag">${esc(d.empresa)}</div>
    <h1>${esc(d.nombreEvento)}</h1>
    <p style="max-width:520px;margin:0 auto">${esc(d.descripcion)}</p>
  </header>

  <section class="center">
    <h2>Cuenta regresiva</h2>
    ${cd.html}
    <p style="margin-top:16px">📅 ${esc(d.fecha)} · 🕗 ${esc(d.hora)} hs · 📍 ${esc(d.lugar)}</p>
    ${d.direccionMapa ? `<a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--gold)">Ver ubicación →</a>` : ""}
    <p>Dress code: <strong>${esc(d.dressCode)}</strong></p>
  </section>

  <section class="center">
    <h2>Buscá tu mesa</h2>
    <div class="seat-finder">
      <input type="text" id="seatInput" placeholder="Escribí tu nombre o el de tu equipo">
      <button id="seatBtn">Buscar</button>
    </div>
    <p class="seat-result" id="seatResult"></p>
  </section>

  <section class="center">
    <h2>Momentos de la empresa</h2>
    <div class="gallery">${(d.galeria || []).map((s, i) => `<div class="gallery-item" data-idx="${i}"><img src="${esc(s)}" alt="foto"></div>`).join("")}</div>
  </section>

  <section class="center">
    <h2>Confirmar asistencia</h2>
    ${rsvp.html}
  </section>

  <div class="lightbox" id="lb"><span class="lightbox-close">&times;</span><img id="lb-img" src=""></div>
  <footer>${esc(d.empresa)} · Gracias por acompañarnos estos 20 años</footer>

  <script>
    ${cd.script}${rsvp.script}
    (function(){
      var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img');
      document.querySelectorAll('.gallery-item img').forEach(function(img){
        img.addEventListener('click', function(){ lbImg.src = img.src; lb.classList.add('open'); });
      });
      lb.addEventListener('click', function(){ lb.classList.remove('open'); });
    })();
    (function(){
      var mesas = ${JSON.stringify(mesas)};
      var input = document.getElementById('seatInput');
      var btn = document.getElementById('seatBtn');
      var result = document.getElementById('seatResult');
      function search(){
        var q = input.value.trim().toLowerCase();
        if(!q){ result.textContent = ''; return; }
        var found = mesas.find(function(m){ return m[0].toLowerCase().indexOf(q) !== -1; });
        if(found){
          result.textContent = found[0] + ' → ' + found[1];
          result.className = 'seat-result found';
        } else {
          result.textContent = 'No encontramos tu nombre, consultá en recepción.';
          result.className = 'seat-result notfound';
        }
      }
      btn.addEventListener('click', search);
      input.addEventListener('keydown', function(e){ if(e.key==='Enter') search(); });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Gala Aniversario",
  summary: "Estética formal en negro y dorado, con buscador interactivo de mesa asignada.",
  accent: "#c9a24b", schema: empresarialSchema, sampleData, render,
};
