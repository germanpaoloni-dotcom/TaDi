const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-circo-magico";

const sampleData = {
  nombreChico: "Valentina",
  edad: "6",
  fecha: "2027-04-17",
  hora: "16:00",
  lugar: "Salón Carpa Mágica, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Carpa+Magica+San+Isidro",
  mensaje: "¡Se levanta el telón! Vení a festejar con malabaristas, globos de mil colores y toda la magia del circo. Va a haber juegos, sorpresas y mucha diversión bajo la carpa.",
  tematica: "Vení vestido de tu personaje de circo favorito",
  whatsapp: "5491100000062",
  coverImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#e63946");
  const accent2 = "#ffd166";
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-circo");
  const gal = galleryWidget(d.galeria, "gal-circo");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Circo Mágico</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --circo:${accent};
    --circo-dk:color-mix(in srgb, ${accent}, black 20%);
    --oro:${accent2};
    --oro-dk:color-mix(in srgb, ${accent2}, black 20%);
    --crema:#fff8ec;
    --ink:#3a2418;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{margin:0;font-family:'Nunito','Segoe UI',Verdana,sans-serif;background:var(--crema);color:var(--ink);}
  h1,h2,.circus-font{font-family:'Fredoka One','Arial Black',Impact,sans-serif;font-weight:400;letter-spacing:.5px;}

  .stripes{
    background:repeating-linear-gradient(45deg, var(--circo) 0 26px, var(--crema) 26px 52px);
  }
  .stripes-thin{height:16px;}

  /* --- hero --- */
  .hero{
    position:relative;overflow:hidden;
    background:
      linear-gradient(180deg, rgba(58,36,24,.35), rgba(58,36,24,.7)),
      url('${esc(d.coverImage)}') center/cover;
    min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;color:#fff;padding:56px 18px 34px;
  }
  .hero-tent{width:100%;max-width:340px;margin:0 auto 8px;display:block;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));}
  .hero .kicker{
    display:inline-block;background:var(--circo);color:#fff;padding:7px 22px;border-radius:30px;
    font-size:.8rem;text-transform:uppercase;letter-spacing:3px;font-weight:800;
    box-shadow:0 4px 0 var(--circo-dk);margin-bottom:16px;
  }
  .hero h1{
    font-size:clamp(2.4rem,9vw,4.2rem);margin:0 0 8px;color:#fff;
    text-shadow:0 4px 0 var(--circo-dk),0 8px 18px rgba(0,0,0,.4);line-height:1.05;
  }
  .hero .age-badge{
    display:inline-flex;align-items:center;justify-content:center;
    width:clamp(90px,22vw,130px);height:clamp(90px,22vw,130px);border-radius:50%;
    background:radial-gradient(circle at 35% 30%, #fff0c2, var(--oro) 70%);
    border:6px solid #fff;color:var(--circo-dk);
    font-size:clamp(2.2rem,8vw,3.2rem);font-weight:900;margin:10px auto;
    box-shadow:0 8px 0 rgba(0,0,0,.25);font-family:'Fredoka One','Arial Black',sans-serif;
  }
  .hero p.sub{font-size:1.05rem;max-width:520px;margin:6px auto 0;font-weight:700;}
  .balloons{
    position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:space-around;
    padding:0 12px;pointer-events:none;
  }
  @keyframes float-balloon{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-10px) rotate(3deg);}}
  .balloons span{font-size:1.6rem;display:inline-block;animation:float-balloon 3s ease-in-out infinite;
    filter:drop-shadow(0 3px 4px rgba(0,0,0,.35));}
  .balloons span:nth-child(2n){animation-delay:.4s;}
  .balloons span:nth-child(3n){animation-delay:.8s;}

  section{max-width:780px;margin:0 auto;padding:46px 20px;text-align:center;}
  .section-title{
    display:inline-block;font-family:'Fredoka One','Arial Black',sans-serif;
    font-size:clamp(1.4rem,5vw,2rem);color:#fff;background:var(--circo);
    padding:9px 26px;border-radius:14px;transform:rotate(-1.5deg);
    box-shadow:0 5px 0 var(--circo-dk);margin-bottom:28px;
  }
  .section-title.alt{background:var(--oro-dk);box-shadow:0 5px 0 color-mix(in srgb, var(--oro-dk), black 20%);transform:rotate(1.5deg);}

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;background:#fff;color:var(--circo-dk);
    border-radius:16px;padding:14px 16px;min-width:70px;border:3px solid var(--oro);
    box-shadow:0 5px 0 var(--oro-dk);
  }
  .cd-num{font-size:1.9rem;font-weight:900;font-family:'Fredoka One','Arial Black',sans-serif;}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink);}

  .message-card{
    background:#fff;border:4px dashed var(--circo);border-radius:24px;padding:28px 22px;
    font-size:1.08rem;line-height:1.65;font-weight:700;color:var(--ink);position:relative;
  }
  .message-card::before{content:"🎪";position:absolute;top:-22px;left:20px;font-size:2rem;}
  .message-card::after{content:"🎈";position:absolute;bottom:-22px;right:20px;font-size:2rem;}
  .tematica{
    margin-top:20px;display:inline-block;background:var(--crema);border:2px solid var(--oro-dk);
    color:var(--circo-dk);font-weight:800;padding:10px 18px;border-radius:12px;
  }

  .info-card{
    background:#fff;border-radius:20px;padding:26px;border:4px solid var(--circo);
    display:inline-block;max-width:420px;width:100%;
  }
  .info-card h3{margin:0 0 8px;color:var(--circo-dk);font-size:1.2rem;}
  .info-card p{margin:4px 0;font-weight:700;}
  .info-card a{color:var(--circo);font-weight:800;}

  /* --- memotest --- */
  .memo-wrap{background:linear-gradient(180deg,var(--circo),var(--circo-dk));border-radius:22px;padding:24px;color:#fff;}
  .memo-wrap p{font-weight:700;margin:0 0 10px;}
  .memo-stats{display:flex;justify-content:center;gap:22px;margin-bottom:14px;font-weight:800;flex-wrap:wrap;}
  .memo-stats span{background:rgba(255,255,255,.16);border-radius:12px;padding:6px 14px;}
  .memo-grid{
    display:grid;grid-template-columns:repeat(4,1fr);gap:9px;max-width:360px;margin:0 auto;
    perspective:600px;
  }
  .memo-card{
    aspect-ratio:1;cursor:pointer;position:relative;transform-style:preserve-3d;
    transition:transform .4s;
  }
  .memo-card.flipped,.memo-card.matched{transform:rotateY(180deg);}
  .memo-face{
    position:absolute;inset:0;border-radius:12px;display:flex;align-items:center;justify-content:center;
    backface-visibility:hidden;font-size:1.6rem;
  }
  .memo-face.back{
    background:var(--oro);border:2px solid #fff;color:var(--circo-dk);font-size:1.3rem;font-weight:900;
  }
  .memo-face.front{
    background:#fff;transform:rotateY(180deg);border:2px solid var(--oro);
  }
  .memo-card.matched .memo-face.front{background:#eaffea;border-color:#4caf50;}
  .memo-result{margin-top:16px;font-weight:900;color:var(--oro);min-height:1.2em;}
  .memo-reset{
    margin-top:12px;background:var(--oro);color:var(--circo-dk);border:0;padding:10px 22px;
    border-radius:30px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 var(--oro-dk);
  }
  .memo-reset:active{transform:translateY(3px);box-shadow:none;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:16px;cursor:pointer;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.18);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(58,36,24,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-box{background:#fff;border:3px solid var(--circo);border-radius:20px;padding:26px 22px;max-width:420px;margin:0 auto;box-shadow:0 6px 0 var(--circo);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;color:var(--circo-dk);font-weight:800;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:11px;border:2px solid var(--oro-dk);border-radius:10px;margin-top:4px;width:100%;
  }
  .rsvp-form button{
    background:var(--circo);color:#fff;border:0;padding:14px;border-radius:12px;
    font-weight:900;text-transform:uppercase;letter-spacing:1px;cursor:pointer;box-shadow:0 5px 0 var(--circo-dk);
  }
  .rsvp-form button:active{transform:translateY(3px);box-shadow:none;}
  .rsvp-whatsapp{font-size:.9rem;color:var(--circo-dk);text-align:center;font-weight:800;display:block;}
  .rsvp-status{text-align:center;color:var(--circo-dk);font-weight:900;}

  footer{text-align:center;padding:34px 20px;font-size:.9rem;color:#fff;background:var(--ink);font-weight:700;}
  footer .top-foot{font-size:1.3rem;display:block;margin-bottom:6px;}
</style></head>
<body>

  <div class="stripes stripes-thin"></div>

  <div class="hero">
    <svg class="hero-tent" viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="160,10 260,120 60,120" fill="${accent}"/>
      <polygon points="160,10 210,120 160,120" fill="${accent2}"/>
      <polygon points="160,10 110,120 160,120" fill="#fff"/>
      <circle cx="160" cy="10" r="8" fill="${accent2}"/>
      <rect x="55" y="118" width="210" height="14" rx="4" fill="#fff"/>
      <polygon points="70,132 85,132 77,148" fill="${accent}"/>
      <polygon points="105,132 120,132 112,148" fill="${accent2}"/>
      <polygon points="140,132 155,132 147,148" fill="${accent}"/>
      <polygon points="175,132 190,132 182,148" fill="${accent2}"/>
      <polygon points="210,132 225,132 217,148" fill="${accent}"/>
      <polygon points="245,132 260,132 252,148" fill="${accent2}"/>
    </svg>
    <span class="kicker">🎪 Función de cumpleaños</span>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="age-badge">${esc(d.edad)}</div>
    <p class="sub">Cumple ${esc(d.edad)} años y te invita a la función más divertida bajo la carpa</p>
    <div class="balloons"><span>🎈</span><span>🎈</span><span>🤹</span><span>🎈</span><span>🎡</span><span>🎈</span></div>
  </div>

  <section>
    <span class="section-title">La función empieza en...</span>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <span class="section-title alt">Bienvenidos al espectáculo</span>
    ${d.mensaje ? `<div class="message-card">${esc(d.mensaje)}</div>` : ""}
    ${d.tematica ? `<div class="tematica">🎭 ${esc(d.tematica)}</div>` : ""}
  </section>` : ""}

  ${d.lugar || d.hora || d.direccionMapa ? `<section>
    <span class="section-title">¿Dónde es la función?</span>
    <div class="info-card">
      ${d.lugar ? `<h3>${esc(d.lugar)}</h3>` : ""}
      ${d.hora ? `<p>🕐 ${esc(d.hora)} hs</p>` : ""}
      ${d.direccionMapa ? `<p><a href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>` : ""}
    </div>
  </section>` : ""}

  <section>
    <span class="section-title alt">Memotest del Circo 🃏</span>
    <div class="memo-wrap">
      <p>Encontrá los pares de cartas del circo. ¡Dale vuelta de a dos!</p>
      <div class="memo-stats">
        <span id="memoPairs">Pares: 0/8</span>
        <span id="memoTries">Intentos: 0</span>
      </div>
      <div class="memo-grid" id="memoGrid"></div>
      <p class="memo-result" id="memoResult"></p>
      <button type="button" class="memo-reset" id="memoReset">🔄 Jugar de nuevo</button>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-title">Fotos del espectáculo</span>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-title alt">Reservá tu entrada</span>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-box">${rsvp.html}</div>
  </section>

  <footer>
    <span class="top-foot">🎪 ¡Pasen y vean! 🎪</span>
    ¡Te esperamos para festejar a ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var icons = ['🎪','🎈','🎡','🤹','🦁','🎉','🍿','🎠'];
      var grid = document.getElementById('memoGrid');
      var pairsEl = document.getElementById('memoPairs');
      var triesEl = document.getElementById('memoTries');
      var resultEl = document.getElementById('memoResult');
      var resetBtn = document.getElementById('memoReset');
      if(!grid) return;

      var cards = [], flipped = [], matchedCount = 0, tries = 0, locked = false;

      function shuffle(arr){
        for(var i = arr.length - 1; i > 0; i--){
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
      }

      function updateStats(){
        pairsEl.textContent = 'Pares: ' + matchedCount + '/' + icons.length;
        triesEl.textContent = 'Intentos: ' + tries;
      }

      function buildGame(){
        grid.innerHTML = '';
        flipped = []; matchedCount = 0; tries = 0; locked = false;
        resultEl.textContent = '';
        var deck = shuffle(icons.concat(icons).map(function(ic, idx){ return {icon: ic, id: idx}; }));
        deck = shuffle(deck);
        updateStats();
        deck.forEach(function(item){
          var card = document.createElement('div');
          card.className = 'memo-card';
          card.dataset.icon = item.icon;
          card.innerHTML = '<div class="memo-face back">🎪</div><div class="memo-face front">' + item.icon + '</div>';
          card.addEventListener('click', function(){ onCardClick(card); });
          grid.appendChild(card);
        });
      }

      function onCardClick(card){
        if(locked) return;
        if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');
        flipped.push(card);
        if(flipped.length === 2){
          tries++;
          updateStats();
          locked = true;
          var a = flipped[0], b = flipped[1];
          if(a.dataset.icon === b.dataset.icon){
            a.classList.add('matched');
            b.classList.add('matched');
            matchedCount++;
            updateStats();
            flipped = [];
            locked = false;
            if(matchedCount === icons.length){
              resultEl.textContent = '¡Bravo! Completaste el memotest en ' + tries + ' intentos 🎉';
            }
          } else {
            setTimeout(function(){
              a.classList.remove('flipped');
              b.classList.remove('flipped');
              flipped = [];
              locked = false;
            }, 850);
          }
        }
      }

      resetBtn.addEventListener('click', buildGame);
      buildGame();
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    background:#fff8ec;background-image:repeating-linear-gradient(45deg, ${d.accent} 0 10px, transparent 10px 20px);background-size:28px 28px;background-position:center;">
    <div style="position:absolute;inset:0;background:rgba(255,248,236,.55);"></div>
    <svg width="70" height="42" viewBox="0 0 320 160" style="position:relative;filter:drop-shadow(0 3px 3px rgba(0,0,0,.25));">
      <polygon points="160,10 260,120 60,120" fill="${d.accent}"/>
      <polygon points="160,10 210,120 160,120" fill="${d.accent2}"/>
      <polygon points="160,10 110,120 160,120" fill="#fff"/>
      <circle cx="160" cy="10" r="10" fill="${d.accent2}"/>
    </svg>
    <div style="position:relative;font-family:'Arial Black',Impact,sans-serif;font-size:1.15rem;color:#3a2418;letter-spacing:.5px;">${esc(d.name)}</div>
    <div style="position:relative;font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#fff;font-weight:700;background:${d.accent};padding:2px 8px;border-radius:8px;">Circo mágico</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Circo Mágico",
  summary: "Cumpleaños con onda de circo: carpa a rayas, globos flotantes y un memotest de cartas del circo con contador de intentos.",
  accent: "#e63946", accent2: "#ffd166", schema: infantilSchema, sampleData, render, cardPreview,
};
