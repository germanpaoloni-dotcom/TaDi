const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-futbol";

const sampleData = {
  nombreChico: "Thiago",
  edad: "8",
  fecha: "2027-05-24",
  hora: "16:00",
  lugar: "Cancha 3 - Complejo Deportivo Sur, Rosario",
  direccionMapa: "https://maps.google.com/?q=Complejo+Deportivo+Sur+Rosario",
  mensaje: "¡Armamos un partidazo! Vení con los botines puestos a jugar un picadito y después nos quedamos a comer algo rico entre todos. La numeración de la camiseta se define en la cancha.",
  tematica: "Vení con la camiseta de tu equipo favorito",
  whatsapp: "5491100000015",
  coverImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ffd400");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-fut");
  const gal = galleryWidget(d.galeria, "gal-fut");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Partido de cumple</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --grass:#2e8b3d;--grass-dark:#1c5c28;--grass-line:rgba(255,255,255,.4);
    --sky:#6cace4;--sky-dark:#3f7ec2;--sun:${accent};--sun-dark:color-mix(in srgb, ${accent}, black 15%);
    --ink:#0c2340;--paper:#f4f7f2;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{margin:0;font-family:'Poppins','Segoe UI',Verdana,Arial,sans-serif;background:var(--paper);color:var(--ink);}
  h1,h2,.jersey-font{font-family:'Bangers','Arial Black',Impact,sans-serif;font-weight:400;letter-spacing:1px;}

  /* ---- Hero: cancha de fútbol ---- */
  .hero{position:relative;overflow:hidden;text-align:center;padding:50px 20px 0;
    background:repeating-linear-gradient(90deg,var(--grass) 0 46px,var(--grass-dark) 46px 92px);}
  .hero .pitch-mark{position:absolute;pointer-events:none;border:4px solid var(--grass-line);}
  .hero .pitch-circle{width:230px;height:230px;border-radius:50%;top:38%;left:50%;transform:translate(-50%,-50%);}
  .hero .pitch-spot{width:8px;height:8px;border-radius:50%;background:var(--grass-line);border:0;top:38%;left:50%;transform:translate(-50%,-50%);}
  .hero .pitch-halfway{width:100%;height:4px;background:var(--grass-line);border:0;top:calc(38% - 2px);left:0;}
  .hero .pitch-corner{width:60px;height:60px;border-radius:0 0 60px 0;top:0;left:0;border-width:0 0 4px 4px;}
  .hero .pitch-corner.r{left:auto;right:0;border-radius:0 0 0 60px;border-width:0 4px 4px 0;}

  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}
  .kickoff-tag{display:inline-block;background:#fff;color:var(--grass-dark);border:3px solid var(--ink);
    border-radius:30px;padding:7px 20px;font-size:.8rem;text-transform:uppercase;letter-spacing:2px;
    font-weight:700;box-shadow:4px 4px 0 var(--ink);transform:rotate(-2deg);margin-bottom:16px;}
  .hero-inner h1{font-size:clamp(2.4rem,9vw,4rem);margin:0 0 6px;color:#fff;
    -webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:4px 4px 0 var(--sky-dark);}
  .hero-inner p.sub{color:#eafbe9;font-weight:600;font-size:1.05rem;margin:0 0 22px;}

  /* ---- Ficha / carnet de jugador (foto) ---- */
  .player-card{position:relative;z-index:1;max-width:340px;margin:0 auto;background:#fff;
    border-radius:22px;overflow:hidden;border:5px solid var(--ink);box-shadow:9px 9px 0 var(--sky-dark);
    transform:rotate(-1.2deg);}
  .player-card-top{background:linear-gradient(135deg,var(--sky),var(--sky-dark));padding:12px 16px;
    display:flex;align-items:center;justify-content:space-between;color:#fff;}
  .player-card-top .team-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.2rem;letter-spacing:1px;text-transform:uppercase;}
  .player-card-top .jersey-num{width:44px;height:44px;border-radius:10px;background:var(--sun);
    color:var(--ink);display:flex;align-items:center;justify-content:center;
    font-family:'Bangers','Arial Black',sans-serif;font-size:1.4rem;border:3px solid var(--ink);flex-shrink:0;}
  .player-photo{aspect-ratio:4/3;background:#dfe3ea;overflow:hidden;}
  .player-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.06) saturate(1.05);}
  .player-card-bottom{padding:14px 16px 18px;text-align:center;}
  .player-card-bottom .p-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.7rem;color:var(--ink);letter-spacing:1px;text-transform:uppercase;}
  .player-card-bottom .p-role{font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--sky-dark);font-weight:700;margin-top:2px;}
  .player-card-bottom .stars{color:var(--sun-dark);letter-spacing:3px;margin-top:8px;font-size:1rem;}

  .scoreboard-strip{height:18px;background-color:var(--ink);margin-top:36px;position:relative;z-index:1;
    background-image:linear-gradient(135deg,#fff 25%,transparent 25%),linear-gradient(225deg,#fff 25%,transparent 25%);
    background-position:0 0;background-size:24px 24px;background-repeat:repeat-x;}

  /* ---- Layout general ---- */
  section{max-width:780px;margin:0 auto;padding:48px 20px;text-align:center;}
  .section-title{display:inline-block;text-transform:uppercase;font-size:1.5rem;color:var(--grass-dark);
    margin:0 0 24px;letter-spacing:1px;position:relative;}
  .section-title::after{content:"";display:block;width:70px;height:5px;background:var(--sun);
    border-radius:4px;margin:8px auto 0;}

  /* Cuenta regresiva estilo marcador de estadio */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
  .countdown div{background:var(--ink);color:#fff;border-radius:10px;min-width:66px;padding:12px 8px;
    box-shadow:0 5px 0 var(--sky-dark);}
  .cd-num{display:block;font-family:'Bangers','Arial Black',sans-serif;font-size:1.7rem;color:var(--sun);}
  .cd-label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:1px;color:#cfe8ff;}

  /* Programa del partido (mensaje) */
  .match-message{font-size:1.05rem;line-height:1.7;background:#fff;border:3px solid var(--grass);
    border-radius:18px;padding:24px 22px;box-shadow:0 6px 0 var(--grass);position:relative;}
  .match-message::before{content:"⚽";position:absolute;top:-20px;left:22px;font-size:1.8rem;
    background:var(--paper);padding:0 6px;}

  .program{display:flex;flex-direction:column;gap:10px;max-width:480px;margin:22px auto 0;text-align:left;}
  .program .step{display:flex;align-items:center;gap:12px;background:#fff;border:2px solid var(--sky);
    border-radius:14px;padding:12px 16px;box-shadow:0 3px 0 var(--sky);}
  .program .step .ico{font-size:1.5rem;flex-shrink:0;}
  .program .step .txt strong{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--sky-dark);}
  .program .step .txt span{font-size:.94rem;font-weight:500;}

  .tematica-box{margin-top:20px;display:inline-flex;align-items:center;gap:10px;background:var(--ink);
    color:#fff;padding:12px 22px;border-radius:14px;font-weight:600;box-shadow:0 5px 0 var(--sky-dark);}

  .field-card{background:#fff;border:3px dashed var(--grass);border-radius:18px;padding:26px 22px;
    max-width:480px;margin:0 auto;}
  .field-card .lugar{font-size:1.15rem;font-weight:700;color:var(--grass-dark);margin:6px 0;}
  .field-card a.map-link{display:inline-block;margin-top:14px;background:var(--grass);color:#fff;
    text-decoration:none;padding:11px 24px;border-radius:30px;font-weight:700;box-shadow:0 4px 0 var(--grass-dark);}

  /* Mini juego: ¿qué jugador de la Scaloneta sos? */
  .game-card{background:linear-gradient(180deg,var(--sky),var(--sky-dark));border-radius:22px;
    padding:28px 22px;color:#fff;max-width:480px;margin:0 auto;}
  .game-card p{font-weight:600;margin-top:0;}
  .game-card button{width:100%;background:var(--sun);color:var(--ink);font-family:'Bangers','Arial Black',sans-serif;
    font-size:1.1rem;letter-spacing:1px;text-transform:uppercase;border:3px solid var(--ink);border-radius:12px;
    padding:13px;cursor:pointer;box-shadow:5px 5px 0 var(--ink);transition:transform .1s,box-shadow .1s;margin-top:6px;}
  .game-card button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .player-reveal{margin-top:18px;background:#fff;color:var(--ink);border-radius:14px;padding:16px;
    min-height:1.6em;display:none;}
  .player-reveal.show{display:block;}
  .player-reveal .rv-tag{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--sky-dark);font-weight:700;}
  .player-reveal .rv-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.6rem;margin-top:2px;color:var(--grass-dark);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;border:3px solid #fff;
    box-shadow:0 4px 10px rgba(0,0,0,.16);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(12,35,64,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-box{background:#fff;border:3px solid var(--grass);border-radius:20px;padding:26px 22px;
    max-width:420px;margin:0 auto;box-shadow:0 6px 0 var(--grass);}
  .rsvp-form{display:flex;flex-direction:column;gap:14px;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:.5px;color:var(--sky-dark);font-weight:700;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;
    border:2px solid var(--sky);border-radius:10px;margin-top:5px;width:100%;}
  .rsvp-form button{background:var(--grass);color:#fff;border:0;padding:13px;border-radius:10px;
    font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;box-shadow:0 4px 0 var(--grass-dark);}
  .rsvp-form button:active{transform:translateY(2px);box-shadow:0 2px 0 var(--grass-dark);}
  .rsvp-whatsapp{display:block;text-align:center;color:var(--grass-dark);font-weight:700;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--grass-dark);font-weight:700;}

  footer{text-align:center;padding:34px 20px;background:var(--ink);color:#eafbe9;font-size:.9rem;}
  footer .whistle{font-size:1.3rem;display:block;margin-bottom:6px;}

  @media(max-width:480px){
    .hero-inner h1{font-size:2.1rem;}
    .player-card{max-width:280px;}
    .hero .pitch-circle{width:170px;height:170px;}
  }
</style></head>
<body>

  <div class="hero">
    <span class="pitch-mark pitch-corner"></span>
    <span class="pitch-mark pitch-corner r"></span>
    <span class="pitch-mark pitch-halfway"></span>
    <span class="pitch-mark pitch-circle"></span>
    <span class="pitch-mark pitch-spot"></span>
    <div class="hero-inner">
      <span class="kickoff-tag">⚽ Partido de cumple</span>
      <h1>${esc(d.nombreChico)}</h1>
      <p class="sub">Cumple ${esc(d.edad)} años y te invita a jugar un partidazo</p>
      <div class="player-card">
        <div class="player-card-top">
          <span class="team-name">Los Cracks FC</span>
          <span class="jersey-num">${esc(d.edad)}</span>
        </div>
        <div class="player-photo"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>
        <div class="player-card-bottom">
          <div class="p-name">${esc(d.nombreChico)}</div>
          <div class="p-role">Capitán del equipo</div>
          <div class="stars">★★★★★</div>
        </div>
      </div>
    </div>
  </div>
  <div class="scoreboard-strip"></div>

  <section>
    <span class="section-title">Faltan para el pitazo inicial</span>
    ${cd.html}
  </section>

  <section>
    <span class="section-title">¡A jugar y después a comer!</span>
    <div class="match-message">${esc(d.mensaje)}</div>
    <div class="program">
      <div class="step"><span class="ico">⚽</span><div class="txt"><strong>1er tiempo</strong><span>Partido entre todos</span></div></div>
      <div class="step"><span class="ico">🎂</span><div class="txt"><strong>Entretiempo</strong><span>Torta y globos</span></div></div>
      <div class="step"><span class="ico">🍕</span><div class="txt"><strong>2do tiempo</strong><span>Comemos algo rico</span></div></div>
    </div>
    ${d.tematica ? `<div class="tematica-box">👕 ${esc(d.tematica)}</div>` : ""}
  </section>

  ${d.lugar || d.hora || d.direccionMapa ? `<section>
    <span class="section-title">¿Dónde jugamos?</span>
    <div class="field-card">
      <p>📅 ${esc(d.fecha)}${d.hora ? ` — 🕐 ${esc(d.hora)} hs` : ""}</p>
      ${d.lugar ? `<p class="lugar">📍 ${esc(d.lugar)}</p>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver cómo llegar a la cancha →</a>` : ""}
    </div>
  </section>` : ""}

  <section>
    <span class="section-title">¿Qué jugador de la Scaloneta sos?</span>
    <div class="game-card">
      <p>Tocá el botón y descubrí a qué crack de la Selección te parecés hoy.</p>
      <button type="button" id="futPlayerBtn">⚽ ¡Sacar mi ficha!</button>
      <div class="player-reveal" id="futPlayerReveal">
        <div class="rv-tag">Hoy jugás como</div>
        <div class="rv-name" id="futPlayerName"></div>
      </div>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-title">Álbum de fotos</span>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-title">Confirmá que venís a jugar</span>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-box">${rsvp.html}</div>
  </section>

  <footer>
    <span class="whistle">📣 ⚽ 🏆</span>
    ¡Te esperamos en la cancha para festejar con ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var players = ['L. Messi','J. Álvarez','E. Martínez','R. De Paul','L. Paredes','G. Rodríguez',
        'A. Mac Allister','E. Fernández','E. Palacios','A. Gómez','T. Almada','Á. Di María',
        'Lautaro Martínez','P. Dybala','J. Correa','N. Molina','G. Montiel','C. Romero','N. Otamendi',
        'Lisandro Martínez','M. Acuña','N. Tagliafico','G. Pezzella','G. Rulli','F. Armani'];
      var btn = document.getElementById('futPlayerBtn');
      var reveal = document.getElementById('futPlayerReveal');
      var nameEl = document.getElementById('futPlayerName');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var idx = Math.floor(Math.random() * players.length);
        nameEl.textContent = '¡' + players[idx] + '!';
        reveal.classList.add('show');
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:repeating-linear-gradient(90deg,#2e8b3d 0 20px,#1c5c28 20px 40px);">
    <span style="position:absolute;top:8px;left:0;right:0;text-align:center;">
      <span style="display:inline-block;width:70px;height:70px;border:3px solid rgba(255,255,255,.5);border-radius:50%;"></span>
    </span>
    <span style="font-size:2rem;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35));">⚽</span>
    <div style="font-family:'Arial Black',Impact,sans-serif;font-size:1.15rem;color:#fff;letter-spacing:1px;
      -webkit-text-stroke:1px #0c2340;paint-order:stroke fill;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#ffd400;font-weight:700;">Partido de cumple</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Fútbol",
  summary: "Cumpleaños con partido de fútbol y comida después: cancha con líneas de juego, ficha de jugador y un mini juego de qué crack de la Scaloneta sos.",
  accent: "#6cace4", schema: infantilSchema, sampleData, render, cardPreview,
};
