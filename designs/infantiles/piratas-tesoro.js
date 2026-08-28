const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-piratas-tesoro";

const sampleData = {
  nombreChico: "Benicio",
  edad: "6",
  fecha: "2027-04-17",
  hora: "16:00",
  lugar: "Salón Aventura, Tigre",
  direccionMapa: "https://maps.google.com/?q=Salon+Aventura+Tigre",
  mensaje: "¡Se busca tripulación valiente! Zarpamos rumbo a una isla misteriosa para festejar mi cumpleaños. Habrá tesoros escondidos, juegos de piratas y mucha diversión a bordo. ¡No faltes, grumete!",
  tematica: "Vení disfrazado de pirata — ¡se buscan grumetes valientes!",
  whatsapp: "5491100000060",
  coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c8963e");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-pir");
  const gal = galleryWidget(d.galeria, "gal-pir");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "infantiles", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Fiesta pirata</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pirata+One&family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --sea:#0f3a45;
    --sea-dk:#082027;
    --gold:${accent};
    --gold-dk:color-mix(in srgb, ${accent}, black 20%);
    --teal:#1b4f5c;
    --paper:#f1e0b8;
    --paper-dk:#dcc38c;
    --ink:#3c2a14;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Baloo 2','Trebuchet MS',sans-serif;
    background:var(--paper);
    color:var(--ink);
  }
  h1,h2,h3{font-family:'Pirata One','Georgia',serif;letter-spacing:1px;font-weight:400;}

  .rope{height:12px;background:repeating-linear-gradient(90deg,var(--gold-dk) 0 10px,var(--paper-dk) 10px 20px);}

  /* --- hero: barco en el mar --- */
  .hero{
    position:relative;
    min-height:66vh;
    background:
      linear-gradient(180deg, rgba(8,32,39,.5), rgba(8,32,39,.88)),
      url('${esc(d.coverImage)}') center/cover;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;color:#fff;padding:60px 18px 44px;
    border-bottom:10px solid var(--gold);
  }
  .hero .flag{
    display:inline-flex;align-items:center;gap:8px;
    font-size:.85rem;text-transform:uppercase;letter-spacing:3px;font-family:'Baloo 2',sans-serif;font-weight:700;
    background:var(--gold);color:var(--sea-dk);padding:7px 20px;border-radius:30px;margin-bottom:18px;
    box-shadow:0 4px 0 var(--gold-dk);
  }
  .hero h1{
    font-size:clamp(2.6rem,10vw,4.6rem);
    margin:0 0 6px;color:#fff;
    text-shadow:0 4px 0 var(--sea-dk),0 8px 18px rgba(0,0,0,.45);
    line-height:1.05;
  }
  .hero .age-badge{
    display:inline-flex;align-items:center;justify-content:center;
    width:clamp(90px,22vw,140px);height:clamp(90px,22vw,140px);
    border-radius:50%;
    background:radial-gradient(circle at 35% 30%, #ffe8b0, var(--gold) 70%);
    border:6px solid #fff;
    font-size:clamp(2.4rem,9vw,3.6rem);font-weight:800;color:var(--sea-dk);
    margin:14px auto 10px;
    box-shadow:0 8px 0 rgba(0,0,0,.3);
    font-family:'Baloo 2',sans-serif;
  }
  .hero p.sub{font-size:1.05rem;max-width:520px;margin:8px auto 0;font-weight:700;}
  .hero .ship{
    margin-top:10px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.4));
    transform-origin:50% 90%;
    animation:shipRock 6.5s ease-in-out infinite;
  }
  @keyframes shipRock{
    0%,100%{transform:rotate(-1.6deg) translateY(0);}
    50%{transform:rotate(1.6deg) translateY(-3px);}
  }
  .hero .gulls{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
  .hero .gull{
    position:absolute;opacity:.55;
    animation-name:gullFly;animation-timing-function:ease-in-out;animation-iteration-count:infinite;
  }
  .hero .gull-1{top:16%;left:18%;width:26px;animation-duration:8s;}
  .hero .gull-2{top:26%;left:70%;width:20px;animation-duration:9.5s;animation-delay:-2.5s;}
  .hero .gull-3{top:12%;left:46%;width:16px;animation-duration:7s;animation-delay:-4s;}
  @keyframes gullFly{
    0%,100%{transform:translate(0,0);}
    50%{transform:translate(16px,-10px);}
  }
  @media (prefers-reduced-motion: reduce){
    .hero .ship,.hero .gull{animation:none;}
  }

  section{max-width:800px;margin:0 auto;padding:48px 20px;text-align:center;}
  .section-title{
    display:inline-block;
    font-size:clamp(1.6rem,5.5vw,2.3rem);
    color:#fff;
    background:var(--teal);
    padding:8px 28px;
    border-radius:14px;
    transform:rotate(-1.5deg);
    box-shadow:0 5px 0 var(--sea-dk);
    margin-bottom:28px;
  }
  .section-title.alt{background:var(--gold);color:var(--sea-dk);box-shadow:0 5px 0 var(--gold-dk);transform:rotate(1.5deg);}

  .message-card{
    background:#fff8e6;border:4px dashed var(--gold-dk);border-radius:20px;
    padding:28px 22px;font-size:1.1rem;line-height:1.6;font-weight:600;color:var(--ink);
    position:relative;
  }
  .message-card::before{content:"🏴‍☠️";position:absolute;top:-22px;left:20px;font-size:2rem;}
  .message-card::after{content:"🦜";position:absolute;bottom:-22px;right:20px;font-size:2rem;}
  .tematica{
    margin-top:20px;display:inline-block;background:var(--paper-dk);border:2px solid var(--gold-dk);
    color:var(--sea-dk);font-weight:700;padding:10px 18px;border-radius:12px;
  }

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:var(--teal);color:#fff;border-radius:16px;
    padding:14px 16px;min-width:70px;
    box-shadow:0 5px 0 var(--sea-dk);
  }
  .cd-num{font-size:1.9rem;font-weight:800;font-family:'Baloo 2',sans-serif;}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;}
  .countdown-caption{margin-top:16px;font-size:.85rem;color:var(--teal);letter-spacing:.5px;font-weight:700;}

  .info-card{
    background:#fff;border-radius:20px;padding:26px;
    border:4px solid var(--teal);
    display:inline-block;max-width:440px;width:100%;
  }
  .info-card h3{margin:0 0 8px;color:var(--gold-dk);font-size:1.3rem;font-family:'Pirata One',serif;font-weight:400;}
  .info-card p{margin:4px 0;font-weight:600;}
  .info-card a{color:var(--teal);font-weight:700;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:16px;cursor:pointer;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.2);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(8,32,39,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;color:var(--teal);font-weight:700;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:2px solid var(--gold-dk);border-radius:10px;margin-top:4px;width:100%;
  }
  .rsvp-form button{
    background:var(--gold);color:var(--sea-dk);border:0;padding:14px;border-radius:12px;
    font-weight:800;text-transform:uppercase;letter-spacing:1px;cursor:pointer;
    box-shadow:0 5px 0 var(--gold-dk);
  }
  .rsvp-form button:active{transform:translateY(3px);box-shadow:none;}
  .rsvp-whatsapp{font-size:.9rem;color:var(--teal);text-align:center;font-weight:700;}
  .rsvp-status{text-align:center;color:var(--teal);font-weight:800;}

  /* --- mapa del tesoro interactivo --- */
  .map-game{
    background:linear-gradient(180deg,var(--paper),var(--paper-dk));
    border-radius:24px;padding:22px 16px 28px;
    border:4px solid var(--gold-dk);
    position:relative;
  }
  .map-game > p.hint{font-weight:700;margin-top:0;color:var(--sea-dk);}
  .map-wrap{position:relative;width:100%;max-width:520px;margin:14px auto 0;aspect-ratio:4/3;}
  .map-wrap svg{width:100%;height:100%;display:block;border-radius:16px;box-shadow:inset 0 0 0 3px var(--gold-dk);}
  .map-spot{
    position:absolute;width:13%;aspect-ratio:1;transform:translate(-50%,-50%);
    background:radial-gradient(circle at 35% 30%,#ffe8b0,var(--gold) 70%);
    border:3px solid var(--sea-dk);border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:1.1rem;font-weight:800;color:var(--sea-dk);
    cursor:pointer;user-select:none;
    box-shadow:0 3px 0 var(--gold-dk),0 5px 10px rgba(0,0,0,.25);
    transition:transform .15s ease;
  }
  .map-spot:hover{transform:translate(-50%,-50%) scale(1.1);}
  .map-spot.revealed{background:radial-gradient(circle at 35% 30%,#bfe3c8,#5c9e6d 70%);cursor:default;}
  .map-spot.revealed:hover{transform:translate(-50%,-50%);}
  .clue-box{
    margin-top:18px;min-height:1.4em;font-weight:700;color:var(--sea-dk);
    background:#fff8e6;border:2px dashed var(--gold-dk);border-radius:12px;
    padding:12px 16px;opacity:0;transform:scale(.9);transition:opacity .25s ease,transform .25s ease;
  }
  .clue-box.show{opacity:1;transform:scale(1);}
  .map-progress{margin-top:10px;font-size:.85rem;color:var(--teal);font-weight:700;}

  footer{
    text-align:center;padding:34px 20px;font-size:.9rem;color:#fff;
    background:var(--sea-dk);font-weight:700;
  }
  footer .signoff{font-size:1.2rem;display:block;margin-bottom:6px;font-family:'Pirata One',serif;font-weight:400;}

  @media (max-width:480px){
    section{padding:38px 16px;}
  }
</style></head>
<body>

  <div class="rope"></div>

  <div class="hero">
    <div class="gulls" aria-hidden="true">
      <svg class="gull gull-1" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7 Q6 1 12 6 Q18 1 23 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>
      <svg class="gull gull-2" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7 Q6 1 12 6 Q18 1 23 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>
      <svg class="gull gull-3" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7 Q6 1 12 6 Q18 1 23 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>
    </div>
    <span class="flag">¡Zarpamos rumbo a la aventura!</span>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="age-badge">${esc(d.edad)}</div>
    <p class="sub">Cumple ${esc(d.edad)} años y busca tripulación valiente para navegar hasta el tesoro ⚓🏴‍☠️</p>
    <svg class="ship" width="120" height="70" viewBox="0 0 120 70" aria-hidden="true">
      <path d="M10 46 L110 46 L98 62 L22 62 Z" fill="${accent}"/>
      <rect x="56" y="8" width="4" height="40" fill="#3c2a14"/>
      <path d="M60 12 L92 32 L60 40 Z" fill="#fff8e6"/>
      <path d="M56 18 L34 34 L56 40 Z" fill="#fff8e6"/>
      <circle cx="58" cy="6" r="3" fill="#fff"/>
    </svg>
  </div>

  <div class="rope"></div>

  <section>
    <span class="section-title">Cuenta regresiva para zarpar</span>
    ${cd.html}
    <p class="countdown-caption">¡Preparen los baúles, grumetes! ⚓</p>
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <span class="section-title alt">Mensaje del capitán</span>
    ${d.mensaje ? `<div class="message-card">${esc(d.mensaje)}</div>` : ""}
    ${d.tematica ? `<div class="tematica">🎭 ${esc(d.tematica)}</div>` : ""}
  </section>` : ""}

  ${d.lugar || d.hora || d.direccionMapa ? `<section>
    <span class="section-title">¿Dónde atraca el barco?</span>
    <div class="info-card">
      ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
      ${d.hora ? `<p>🕐 ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<p><a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
    </div>
  </section>` : ""}

  <section>
    <span class="section-title alt">El mapa del tesoro</span>
    <div class="map-game">
      <p class="hint">Tocá cada "X" del mapa para descubrir sus secretos.</p>
      <div class="map-wrap">
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="400" height="300" fill="#e9d29b"/>
          <path d="M0 0 L400 0 L400 300 L0 300 Z" fill="none" stroke="#8a6a34" stroke-width="6"/>
          <path d="M40 220 Q100 260 180 240 Q260 220 340 250 Q380 260 380 220 Q360 160 300 150 Q340 100 280 60 Q220 20 160 60 Q100 40 60 90 Q20 130 40 220 Z" fill="#f1e0b8" stroke="#8a6a34" stroke-width="4"/>
          <circle cx="150" cy="150" r="26" fill="#c8b27a" stroke="#8a6a34" stroke-width="2"/>
          <circle cx="150" cy="150" r="16" fill="none" stroke="#8a6a34" stroke-width="2"/>
          <path d="M60 200 Q100 180 150 200 Q200 220 260 195 Q300 180 340 210" fill="none" stroke="#8a6a34" stroke-width="3" stroke-dasharray="6 6"/>
          <path d="M300 100 Q290 90 300 80 L305 90 Z" fill="#4caf70" stroke="#2f6b45" stroke-width="2"/>
          <text x="200" y="35" font-family="Georgia,serif" font-size="20" fill="#8a6a34" text-anchor="middle" font-style="italic">Isla del Tesoro</text>
        </svg>
        <div class="map-spot" style="left:20%;top:70%;" data-idx="0">✕</div>
        <div class="map-spot" style="left:37%;top:47%;" data-idx="1">✕</div>
        <div class="map-spot" style="left:62%;top:62%;" data-idx="2">✕</div>
        <div class="map-spot" style="left:80%;top:30%;" data-idx="3">✕</div>
        <div class="map-spot" style="left:52%;top:22%;" data-idx="4">✕</div>
      </div>
      <div class="clue-box" id="clueBox"></div>
      <p class="map-progress" id="mapProgress"></p>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-title">Fotos de la tripulación</span>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-title alt">Enrolate en la tripulación</span>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;color:var(--teal);font-weight:700;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    ${rsvp.html}
  </section>

  <footer>
    <span class="signoff">¡Yo ho ho! ⚓</span>
    ¡Te esperamos a bordo para festejar a ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var clues = [
        '¡Acá va a estar la torta más buscada de los siete mares! 🎂',
        '¡Cuidado, grumete! Aquí montan guardia los piratas mayores. 🗡️',
        '¡Tesoro de golosinas escondido bajo la arena! 🍬',
        '¡La banda de música pirata toca justo en este rincón! 🥁',
        '¡El cofre de los regalos aparece por acá al final de la fiesta! 💰',
      ];
      var spots = document.querySelectorAll('.map-spot');
      var clueBox = document.getElementById('clueBox');
      var progress = document.getElementById('mapProgress');
      if(!spots.length || !clueBox) return;
      var revealedCount = 0;
      var total = spots.length;
      function updateProgress(){
        if(!progress) return;
        progress.textContent = revealedCount + ' de ' + total + ' lugares descubiertos' + (revealedCount === total ? ' — ¡Mapa completo! 🏆' : '');
      }
      updateProgress();
      spots.forEach(function(spot){
        spot.addEventListener('click', function(){
          var idx = parseInt(spot.getAttribute('data-idx'), 10) || 0;
          if(!spot.classList.contains('revealed')){
            spot.classList.add('revealed');
            spot.textContent = '★';
            revealedCount++;
            updateProgress();
          }
          clueBox.textContent = clues[idx] || '¡Un misterio más del mar!';
          clueBox.classList.remove('show');
          void clueBox.offsetWidth;
          clueBox.classList.add('show');
        });
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(160deg,#e9d29b 0%,#c8b27a 100%);">
    <span style="position:absolute;top:10px;left:14px;font-size:.9rem;opacity:.55;">🗺️</span>
    <span style="position:absolute;bottom:10px;right:14px;font-size:.9rem;opacity:.55;">⚓</span>
    <svg width="46" height="40" viewBox="0 0 120 70" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.3));">
      <path d="M10 46 L110 46 L98 62 L22 62 Z" fill="${d.accent}"/>
      <rect x="56" y="8" width="4" height="40" fill="${d.accent2}"/>
      <path d="M60 12 L92 32 L60 40 Z" fill="#fff8e6"/>
      <path d="M56 18 L34 34 L56 40 Z" fill="#fff8e6"/>
    </svg>
    <div style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:1.2rem;color:${d.accent2};letter-spacing:.5px;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:${d.accent};font-weight:700;">Aventura pirata</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Piratas y el Tesoro",
  summary: "Fiesta pirata con barco, isla y mapa del tesoro interactivo donde los invitados descubren pistas divertidas tocando cada X marcada.",
  accent: "#c8963e", accent2: "#1b4f5c", schema: infantilSchema, sampleData, render, cardPreview,
};
