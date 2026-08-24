const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-dinosaurios";

const sampleData = {
  nombreChico: "Thiago",
  edad: "4",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Jardín Los Pinos, Bariloche",
  direccionMapa: "https://maps.google.com/?q=Jardin+Los+Pinos+Bariloche",
  mensaje: "¡Va a ser una fiesta prehistórica! Vení a rugir, saltar y descubrir huevos de dino con nosotros.",
  tematica: "Vení vestido de tu dinosaurio favorito 🦖",
  whatsapp: "5491100000014",
  coverImage: "https://images.unsplash.com/photo-1519880856441-8333bb54c3a2?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80",
    "https://images.unsplash.com/photo-1601513237763-4f3d0e33c2c4?w=800&q=80",
    "https://images.unsplash.com/photo-1571750598741-4a29c483bb1d?w=800&q=80",
    "https://images.unsplash.com/photo-1583551617881-a5b6f7f0b1f6?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ff6b35");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd-dino");
  const gal = galleryWidget(d.galeria, "gal-dino");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}!</title>
<style>
  :root{
    --jungle:#1f6b3a;
    --jungle-dk:#123f22;
    --leaf:#4caf50;
    --lava:${accent};
    --lava-dk:color-mix(in srgb, ${accent}, black 18%);
    --sand:#fff4d6;
    --ink:#1c2b1e;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Trebuchet MS','Verdana',sans-serif;
    background:var(--sand);
    color:var(--ink);
  }
  h1,h2,h3{font-family:'Impact','Arial Black',sans-serif;letter-spacing:1px;}

  /* --- huellas de dino como separador decorativo --- */
  .tracks{
    display:flex;justify-content:center;gap:38px;padding:14px 10px;
    background:var(--jungle-dk);
  }
  .tracks span{
    font-size:1.4rem;opacity:.85;
    filter:drop-shadow(0 2px 0 rgba(0,0,0,.3));
  }
  .tracks span:nth-child(even){transform:translateY(10px);}

  /* --- manada de dinos animados: banda decorativa --- */
  @keyframes dino-bob{
    0%,100%{transform:translateY(0) rotate(-2deg);}
    50%{transform:translateY(-8px) rotate(2deg);}
  }
  .dino-parade{
    display:flex;justify-content:center;align-items:flex-end;gap:22px;
    padding:16px 10px 10px;background:var(--sand);flex-wrap:wrap;
  }
  .dino-parade span{
    font-size:1.7rem;display:inline-block;
    animation:dino-bob 2.4s ease-in-out infinite;
    filter:drop-shadow(0 3px 0 rgba(0,0,0,.15));
  }
  .dino-parade span:nth-child(2n){animation-delay:.3s;}
  .dino-parade span:nth-child(3n){animation-delay:.6s;}
  .dino-parade span:nth-child(4n){animation-delay:.9s;}

  .hero .roaming-dinos{
    position:absolute;left:0;right:0;bottom:10px;
    display:flex;justify-content:space-around;padding:0 12px;
    pointer-events:none;
  }
  .hero .roaming-dinos span{
    font-size:1.5rem;opacity:.9;
    animation:dino-bob 2.6s ease-in-out infinite;
    filter:drop-shadow(0 2px 4px rgba(0,0,0,.4));
  }
  .hero .roaming-dinos span:nth-child(2n){animation-delay:.4s;}
  .hero .roaming-dinos span:nth-child(3n){animation-delay:.8s;}

  .message-card .extra-dino{
    position:absolute;top:-18px;right:18px;font-size:1.8rem;
    animation:dino-bob 2.2s ease-in-out infinite;animation-delay:.5s;
  }

  /* --- hero --- */
  .hero{
    position:relative;
    min-height:64vh;
    background:
      radial-gradient(circle at 20% 15%, rgba(255,255,255,.12), transparent 40%),
      linear-gradient(180deg, rgba(18,63,34,.55), rgba(18,63,34,.85)),
      url('${esc(d.coverImage)}') center/cover;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;color:#fff;padding:60px 18px 40px;
    border-bottom:10px solid var(--lava);
  }
  .hero .roar{
    display:inline-block;font-size:.85rem;text-transform:uppercase;letter-spacing:4px;
    background:var(--lava);color:#fff;padding:6px 18px;border-radius:30px;margin-bottom:18px;
    box-shadow:0 4px 0 var(--lava-dk);
  }
  .hero h1{
    font-size:clamp(2.4rem,9vw,4.2rem);
    margin:0 0 6px;
    color:#fff;
    text-shadow:0 4px 0 var(--jungle-dk),0 8px 18px rgba(0,0,0,.4);
    line-height:1.05;
  }
  .hero .age-badge{
    display:inline-flex;align-items:center;justify-content:center;
    width:clamp(90px,22vw,140px);height:clamp(90px,22vw,140px);
    border-radius:50%;
    background:radial-gradient(circle at 35% 30%, #ffe27a, var(--lava) 70%);
    border:6px solid #fff;
    font-size:clamp(2.4rem,9vw,3.6rem);font-weight:900;color:var(--jungle-dk);
    margin:14px auto 10px;
    box-shadow:0 8px 0 rgba(0,0,0,.25);
    font-family:'Impact','Arial Black',sans-serif;
  }
  .hero p.sub{
    font-size:1.05rem;max-width:520px;margin:8px auto 0;
    font-weight:bold;
  }

  section{max-width:780px;margin:0 auto;padding:46px 20px;text-align:center;}
  .section-title{
    display:inline-block;
    font-size:clamp(1.4rem,5vw,2rem);
    color:var(--jungle-dk);
    background:var(--leaf);
    color:#fff;
    padding:8px 26px;
    border-radius:14px;
    transform:rotate(-2deg);
    box-shadow:0 5px 0 var(--jungle-dk);
    margin-bottom:28px;
  }
  .section-title.alt{background:var(--lava);box-shadow:0 5px 0 var(--lava-dk);transform:rotate(2deg);}

  .message-card{
    background:#fff;border:4px dashed var(--leaf);border-radius:24px;
    padding:28px 22px;font-size:1.1rem;line-height:1.6;font-weight:bold;color:var(--jungle-dk);
    position:relative;
  }
  .message-card::before{content:"🦕";position:absolute;top:-22px;left:20px;font-size:2rem;}
  .message-card::after{content:"🌋";position:absolute;bottom:-22px;right:20px;font-size:2rem;}
  .tematica{
    margin-top:20px;display:inline-block;background:var(--sand);border:2px solid var(--lava);
    color:var(--lava-dk);font-weight:bold;padding:10px 18px;border-radius:12px;
  }

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:var(--jungle);color:#fff;border-radius:16px;
    padding:14px 16px;min-width:70px;
    box-shadow:0 5px 0 var(--jungle-dk);
  }
  .cd-num{font-size:1.9rem;font-weight:900;font-family:'Impact','Arial Black',sans-serif;}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;}

  .info-card{
    background:#fff;border-radius:20px;padding:26px;
    border:4px solid var(--jungle);
    display:inline-block;max-width:420px;width:100%;
  }
  .info-card h3{margin:0 0 8px;color:var(--lava-dk);font-size:1.2rem;}
  .info-card p{margin:4px 0;font-weight:bold;}
  .info-card a{color:var(--jungle);font-weight:bold;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:16px;cursor:pointer;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.18);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,30,15,.92);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;color:var(--jungle-dk);font-weight:bold;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:2px solid var(--leaf);border-radius:10px;margin-top:4px;width:100%;
  }
  .rsvp-form button{
    background:var(--lava);color:#fff;border:0;padding:14px;border-radius:12px;
    font-weight:900;text-transform:uppercase;letter-spacing:1px;cursor:pointer;
    box-shadow:0 5px 0 var(--lava-dk);
  }
  .rsvp-form button:active{transform:translateY(3px);box-shadow:none;}
  .rsvp-whatsapp{font-size:.9rem;color:var(--jungle);text-align:center;font-weight:bold;}
  .rsvp-status{text-align:center;color:var(--jungle);font-weight:900;}

  /* --- mini juego: encontrá el huevo escondido --- */
  .egg-game{
    background:linear-gradient(180deg,var(--jungle),var(--jungle-dk));
    border-radius:22px;padding:24px;color:#fff;
  }
  .egg-game p{font-weight:bold;margin-top:0;}
  .egg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:340px;margin:16px auto 0;}
  .egg-cell{
    aspect-ratio:1;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);
    border-radius:12px;display:flex;align-items:center;justify-content:center;
    font-size:1.6rem;cursor:pointer;user-select:none;
  }
  .egg-cell.found{background:var(--sand);}
  .egg-result{margin-top:14px;font-weight:900;color:#ffe27a;min-height:1.2em;}

  footer{
    text-align:center;padding:34px 20px;font-size:.9rem;color:#fff;
    background:var(--jungle-dk);font-weight:bold;
  }
  footer .roar-foot{font-size:1.3rem;display:block;margin-bottom:6px;}
</style></head>
<body>

  <div class="tracks"><span>🐾</span><span>🐾</span><span>🐾</span><span>🐾</span><span>🐾</span></div>

  <div class="hero">
    <span class="roar">¡Fiesta jurásica!</span>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="age-badge">${esc(d.edad)}</div>
    <p class="sub">Cumple ${esc(d.edad)} años y quiere festejarlo con toda la manada 🦖🌿</p>
    <div class="roaming-dinos"><span>🦕</span><span>🦖</span><span>🦴</span><span>🥚</span><span>🦴</span><span>🦖</span></div>
  </div>

  <section>
    <span class="section-title">Cuenta regresiva rugiente</span>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <span class="section-title alt">La invitación</span>
    ${d.mensaje ? `<div class="message-card"><span class="extra-dino">🦖</span>${esc(d.mensaje)}</div>` : ""}
    ${d.tematica ? `<div class="tematica">🎨 ${esc(d.tematica)}</div>` : ""}
  </section>` : ""}

  <div class="dino-parade"><span>🦕</span><span>🦖</span><span>🐊</span><span>🦴</span><span>🥚</span><span>🦖</span><span>🦕</span></div>

  ${d.lugar || d.hora || d.direccionMapa ? `<section>
    <span class="section-title">¿Dónde es la excursión?</span>
    <div class="info-card">
      ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
      ${d.hora ? `<p>🕐 ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<p><a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
    </div>
  </section>` : ""}

  <section>
    <span class="section-title alt">Encontrá el huevo de dino 🥚</span>
    <div class="egg-game">
      <p>Tocá las rocas hasta encontrar el huevo escondido.</p>
      <div class="egg-grid" id="eggGrid"></div>
      <p class="egg-result" id="eggResult"></p>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-title">Momentos prehistóricos</span>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-title alt">Confirmá tu asistencia</span>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <span class="roar-foot">RRRAWR 🦖</span>
    ¡Te esperamos para festejar a ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var grid = document.getElementById('eggGrid');
      var result = document.getElementById('eggResult');
      if(!grid) return;
      var total = 12;
      var eggIndex = Math.floor(Math.random() * total);
      var found = false;
      for(var i = 0; i < total; i++){
        (function(i){
          var cell = document.createElement('div');
          cell.className = 'egg-cell';
          cell.textContent = '🪨';
          cell.addEventListener('click', function(){
            if(found || cell.classList.contains('found')) return;
            cell.classList.add('found');
            if(i === eggIndex){
              cell.textContent = '🥚';
              found = true;
              result.textContent = '¡Lo encontraste! Sos un gran cazador de dinos 🦖🎉';
            } else {
              cell.textContent = '🌿';
            }
          });
          grid.appendChild(cell);
        })(i);
      }
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "infantiles", name: "Dinosaurios",
  summary: "Fiesta jurásica con huellas de dino, cuenta regresiva rugiente y un mini juego de buscar el huevo escondido.",
  accent: "#ff6b35", schema: infantilSchema, sampleData, render,
};
