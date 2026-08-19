const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");

const id = "boda-boho-naturaleza";

const sampleData = {
  novia: "Carolina", novio: "Martín",
  fecha: "2027-11-06", horaCeremonia: "17:30", lugarCeremonia: "Jardín Botánico, Escobar",
  horaFiesta: "19:30", lugarFiesta: "Estancia El Ceibo",
  direccionMapa: "https://maps.google.com/?q=Estancia+El+Ceibo",
  mensaje: "Bajo el cielo abierto, entre árboles y flores silvestres, queremos celebrar el amor rodeados de quienes más queremos.",
  dressCode: "Boho chic - colores tierra",
  alias: "caro.martin.love",
  whatsapp: "5491100000001",
  musica: "",
  coverImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=800&q=80",
    "https://images.unsplash.com/photo-1500522144261-ea64433bbe27?w=800&q=80",
    "https://images.unsplash.com/photo-1521543387275-e6f7c9ab1c8f?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd2");
  const gal = galleryWidget(d.galeria, "gal2");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<style>
  :root{--green:#5c6b4f;--terracota:#bb6a4d;--paper:#fbf7ee;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Trebuchet MS',sans-serif;background:var(--paper);color:#3a3529;}
  .story{max-width:900px;margin:0 auto;}
  .band{padding:70px 30px;display:flex;align-items:center;gap:50px;flex-wrap:wrap;}
  .band.reverse{flex-direction:row-reverse;}
  .band img{flex:1 1 320px;width:100%;max-width:400px;border-radius:0 60px 0 60px;object-fit:cover;height:320px;}
  .band .text{flex:1 1 280px;}
  .kicker{color:var(--terracota);text-transform:uppercase;letter-spacing:3px;font-size:.75rem;}
  h1{font-size:2.6rem;font-weight:300;margin:6px 0;}
  h2{font-weight:300;font-size:1.6rem;color:var(--green);}
  p{line-height:1.7;}
  .music-toggle{position:fixed;bottom:20px;right:20px;background:var(--green);color:#fff;border:0;width:54px;height:54px;border-radius:50%;font-size:1.3rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);z-index:20;}
  .countdown{display:flex;gap:20px;justify-content:center;}
  .countdown div{display:flex;flex-direction:column;align-items:center;}
  .cd-num{font-size:2.2rem;color:var(--terracota);}
  .cd-label{font-size:.7rem;text-transform:uppercase;}
  .center{text-align:center;}
  .card-info{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:20px;}
  .card-info div{background:#fff;padding:20px 26px;border-radius:16px;border:1px solid #e6ddc9;min-width:200px;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;padding:0 30px 40px;}
  .gallery img{width:100%;height:170px;object-fit:cover;border-radius:16px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:380px;margin:20px auto 60px;text-align:left;padding:0 20px;}
  .rsvp-form label{font-size:.8rem;color:#6d6350;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid #d8cdb0;border-radius:10px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--terracota);color:#fff;border:0;padding:12px;border-radius:10px;cursor:pointer;font-size:1rem;}
  .rsvp-whatsapp{text-align:center;color:var(--green);font-size:.85rem;}
  .rsvp-status{text-align:center;color:var(--green);font-weight:bold;}
  footer{text-align:center;padding:30px;font-size:.85rem;color:#8a7f6e;}
</style></head>
<body>
  <div class="band">
    <img src="${esc(d.coverImage)}" alt="portada">
    <div class="text">
      <div class="kicker">Nos casamos</div>
      <h1>${esc(d.novia)} &amp; ${esc(d.novio)}</h1>
      <p>${esc(d.mensaje)}</p>
    </div>
  </div>

  <div class="center" style="padding:0 20px 40px">
    <h2>Cuenta regresiva</h2>
    ${cd.html}
  </div>

  <div class="band reverse">
    <div class="text">
      <div class="kicker">Cuándo y dónde</div>
      <h2>La ceremonia y la fiesta</h2>
      <div class="card-info">
        <div><strong>Ceremonia</strong><br>${esc(d.horaCeremonia)}<br>${esc(d.lugarCeremonia)}</div>
        <div><strong>Fiesta</strong><br>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}</div>
      </div>
      ${d.direccionMapa ? `<p style="margin-top:16px"><a href="${esc(d.direccionMapa)}" target="_blank" style="color:var(--terracota)">Cómo llegar →</a></p>` : ""}
      <p><em>Dress code: ${esc(d.dressCode)}</em></p>
    </div>
  </div>

  <div class="center"><h2>Algunos recuerdos</h2></div>
  ${gal.html}

  <div class="center"><h2>¿Nos acompañás?</h2></div>
  ${rsvp.html}

  <footer>Mesa de regalos: alias <strong>${esc(d.alias)}</strong> · Gracias por ser parte de nuestra historia</footer>

  <button class="music-toggle" id="musicBtn" title="Música">♪</button>
  <audio id="bgMusic" loop ${d.musica ? `src="${esc(d.musica)}"` : ""}></audio>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var btn = document.getElementById('musicBtn');
      var audio = document.getElementById('bgMusic');
      var playing = false;
      btn.addEventListener('click', function(){
        if(!audio.src){ btn.textContent = playing ? '♪' : '❚❚'; playing = !playing; return; }
        if(playing){ audio.pause(); btn.textContent='♪'; } else { audio.play().catch(function(){}); btn.textContent='❚❚'; }
        playing = !playing;
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Boho Naturaleza",
  summary: "Storytelling a pantalla completa, botón de música y estética boho al aire libre.",
  accent: "#bb6a4d", schema: bodaSchema, sampleData, render,
};
