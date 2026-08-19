const { esc, countdownWidget, rsvpWidget } = require("../widgets");
const { xvSchema } = require("../schemas");

const id = "xv-pop-vibrante";

const sampleData = {
  nombre: "Camila",
  fecha: "2027-06-21", horaFiesta: "21:30", lugarFiesta: "Club Náutico, Rosario",
  horaCeremonia: "", lugarCeremonia: "",
  direccionMapa: "https://maps.google.com/?q=Club+Nautico+Rosario",
  padres: "Vanina y Sebastián",
  mensaje: "¡15 años de pura diversión! Vení a bailar y a pasarla increíble conmigo.",
  dressCode: "Colorido - nada de negro 🎉",
  whatsapp: "5491100000005",
  colorFav: "Fucsia", comidaFav: "Sushi", hobbyFav: "Bailar",
  coverImage: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "21:00"}:00` : sampleData.fecha, "cd6");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XV de ${esc(d.nombre)}</title>
<style>
  :root{--yellow:#ffd23f;--pink:#ff4d8d;--blue:#3fa9ff;--purple:#9b5de5;--ink:#241f31;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Verdana',Arial,sans-serif;background:var(--ink);color:#fff;}
  .hero{padding:60px 20px;text-align:center;background:radial-gradient(circle at 30% 20%,rgba(255,77,141,.35),transparent 60%),radial-gradient(circle at 80% 80%,rgba(63,169,255,.3),transparent 60%);}
  .hero h1{font-size:3rem;margin:0;background:linear-gradient(90deg,var(--yellow),var(--pink),var(--blue));-webkit-background-clip:text;background-clip:text;color:transparent;}
  .hero p{text-transform:uppercase;letter-spacing:3px;font-size:.8rem;color:var(--yellow);}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;max-width:1000px;margin:0 auto;padding:20px;}
  .card{border-radius:20px;padding:24px;background:#2e2640;}
  .card.yellow{background:linear-gradient(135deg,#ffd23f,#ff9f1c);color:#241f31;}
  .card.pink{background:linear-gradient(135deg,#ff4d8d,#c9184a);}
  .card.blue{background:linear-gradient(135deg,#3fa9ff,#3a86ff);}
  .card h3{margin:0 0 10px;text-transform:uppercase;font-size:.9rem;letter-spacing:1px;}
  .countdown{display:flex;gap:10px;}
  .countdown div{flex:1;text-align:center;background:rgba(255,255,255,.12);border-radius:12px;padding:10px 0;}
  .cd-num{font-size:1.6rem;display:block;font-weight:bold;}
  .cd-label{font-size:.6rem;text-transform:uppercase;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .trivia-q{margin-bottom:14px;}
  .trivia-q p{margin:0 0 8px;font-weight:bold;}
  .trivia-opt{display:block;width:100%;text-align:left;background:rgba(255,255,255,.1);border:2px solid transparent;color:#fff;padding:10px 14px;border-radius:10px;margin-bottom:8px;cursor:pointer;}
  .trivia-opt.correct{border-color:#4ade80;background:rgba(74,222,128,.25);}
  .trivia-opt.wrong{border-color:#f87171;background:rgba(248,113,113,.25);}
  .trivia-score{font-weight:bold;color:var(--yellow);}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#d8c9ee;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border-radius:8px;border:0;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--pink);color:#fff;border:0;padding:12px;border-radius:8px;font-weight:bold;cursor:pointer;}
  .rsvp-whatsapp{color:var(--yellow);font-size:.85rem;}
  .rsvp-status{font-weight:bold;color:#4ade80;}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#a89bc4;}
</style></head>
<body>
  <div class="hero"><h1>¡${esc(d.nombre)} cumple 15!</h1><p>${esc(d.mensaje)}</p></div>

  <div class="grid">
    <div class="card yellow"><h3>Cuenta regresiva</h3>${cd.html}</div>
    <div class="card pink"><h3>Fiesta</h3><p>${esc(d.horaFiesta)}<br>${esc(d.lugarFiesta)}${d.direccionMapa ? `<br><a href="${esc(d.direccionMapa)}" target="_blank" style="color:#fff">Ver mapa →</a>` : ""}</p></div>
    <div class="card blue"><h3>Dress code</h3><p>${esc(d.dressCode)}</p></div>
    <div class="card"><h3>Padres</h3><p>${esc(d.padres)}</p></div>
    <div class="card" style="grid-column:span 2"><h3>Fotos</h3><div class="gallery">${(d.galeria || []).map((s, i) => `<div class="gallery-item" data-idx="${i}"><img src="${esc(s)}" alt="foto"></div>`).join("")}</div></div>
    <div class="card" style="grid-column:1 / -1"><h3>¿Cuánto me conocés? 🎮</h3>
      <div id="trivia"></div>
      <p class="trivia-score" id="triviaScore"></p>
    </div>
    <div class="card" style="grid-column:1 / -1"><h3>Confirmá tu asistencia</h3>${rsvp.html}</div>
  </div>

  <div class="lightbox" id="lb"><span class="lightbox-close">&times;</span><img id="lb-img" src=""></div>
  <footer>¡Nos vemos en la pista! 🎊</footer>

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
      var questions = [
        { q: "¿Cuál es su color favorito?", opts: [${JSON.stringify(d.colorFav)}, "Verde", "Negro"], a: 0 },
        { q: "¿Cuál es su comida favorita?", opts: ["Pizza", ${JSON.stringify(d.comidaFav)}, "Ensalada"], a: 1 },
        { q: "¿Cuál es su hobby favorito?", opts: ["Leer", "Dormir", ${JSON.stringify(d.hobbyFav)}], a: 2 },
      ];
      var box = document.getElementById('trivia');
      var scoreEl = document.getElementById('triviaScore');
      var score = 0, answered = 0;
      questions.forEach(function(item, qi){
        var wrap = document.createElement('div');
        wrap.className = 'trivia-q';
        var p = document.createElement('p'); p.textContent = (qi+1) + '. ' + item.q;
        wrap.appendChild(p);
        item.opts.forEach(function(opt, oi){
          var b = document.createElement('button');
          b.className = 'trivia-opt';
          b.textContent = opt;
          b.addEventListener('click', function(){
            if(b.dataset.done) return;
            wrap.querySelectorAll('.trivia-opt').forEach(function(x){ x.dataset.done = '1'; });
            if(oi === item.a){ b.classList.add('correct'); score++; }
            else { b.classList.add('wrong'); wrap.children[item.a+1].classList.add('correct'); }
            answered++;
            scoreEl.textContent = 'Puntaje: ' + score + ' / ' + questions.length + (answered===questions.length ? ' 🎉 ¡Listo!' : '');
          });
          wrap.appendChild(b);
        });
        box.appendChild(wrap);
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "xv", name: "Pop Vibrante",
  summary: "Layout tipo bento colorido y un mini juego de trivia sobre la cumpleañera.",
  accent: "#ff4d8d", schema: xvSchema, sampleData, render,
};
