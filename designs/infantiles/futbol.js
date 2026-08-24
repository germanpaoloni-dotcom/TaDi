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

  @keyframes ball-bob{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-5px) rotate(10deg);}}
  @keyframes shine-sweep{0%{transform:translateX(-120%) rotate(8deg);}55%,100%{transform:translateX(220%) rotate(8deg);}}

  /* ---- Hero: cancha de fútbol ---- */
  .crowd-strip{height:24px;width:100%;background-color:var(--ink);
    background-image:radial-gradient(circle,rgba(255,255,255,.6) 1.5px,transparent 1.8px);
    background-size:10px 10px;background-position:0 5px;position:relative;z-index:1;}
  .hero{position:relative;overflow:hidden;text-align:center;padding:38px 20px 0;
    background:repeating-linear-gradient(90deg,var(--grass) 0 46px,var(--grass-dark) 46px 92px);}
  .hero::before{content:"";position:absolute;top:-16%;left:50%;transform:translateX(-50%);
    width:140%;height:65%;background:radial-gradient(ellipse at center,rgba(255,255,255,.32),transparent 68%);
    pointer-events:none;}
  .hero .pitch-mark{position:absolute;pointer-events:none;border:4px solid var(--grass-line);}
  .hero .pitch-circle{width:230px;height:230px;border-radius:50%;top:44%;left:50%;transform:translate(-50%,-50%);}
  .hero .pitch-spot{width:8px;height:8px;border-radius:50%;background:var(--grass-line);border:0;top:44%;left:50%;transform:translate(-50%,-50%);}
  .hero .pitch-halfway{width:100%;height:4px;background:var(--grass-line);border:0;top:calc(44% - 2px);left:0;}
  .hero .pitch-corner{width:60px;height:60px;border-radius:0 0 60px 0;top:0;left:0;border-width:0 0 4px 4px;}
  .hero .pitch-corner.r{left:auto;right:0;border-radius:0 0 0 60px;border-width:0 4px 4px 0;}

  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto;}
  .kickoff-tag{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--grass-dark);border:3px solid var(--ink);
    border-radius:30px;padding:7px 20px 7px 14px;font-size:.8rem;text-transform:uppercase;letter-spacing:2px;
    font-weight:700;box-shadow:4px 4px 0 var(--ink);transform:rotate(-2deg);margin-bottom:18px;}
  .kickoff-tag .ball{display:inline-block;font-size:1.1rem;animation:ball-bob 1.8s ease-in-out infinite;}
  .hero-inner h1{font-size:clamp(2.6rem,9vw,4.2rem);margin:0 0 6px;color:#fff;
    -webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:4px 4px 0 var(--sky-dark);}
  .hero-inner p.sub{color:#eafbe9;font-weight:600;font-size:1.05rem;margin:0 0 24px;text-shadow:0 2px 4px rgba(0,0,0,.25);}

  /* ---- Ficha / carnet de jugador (foto) ---- */
  .player-card{position:relative;z-index:1;max-width:340px;margin:0 auto;background:#fff;
    border-radius:22px;overflow:hidden;border:5px solid var(--ink);box-shadow:9px 9px 0 var(--sky-dark);
    transform:rotate(-1.2deg);}
  .player-card-top{background:linear-gradient(135deg,var(--sky),var(--sky-dark));padding:14px 16px 20px;
    display:flex;align-items:center;justify-content:space-between;color:#fff;position:relative;overflow:hidden;
    clip-path:polygon(0 0,100% 0,100% 78%,0 100%);}
  .player-card-top .team-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.05rem;letter-spacing:.5px;text-transform:uppercase;
    display:flex;align-items:center;gap:6px;white-space:nowrap;}
  .mini-flag{display:inline-block;width:17px;height:12px;border-radius:2px;flex-shrink:0;
    background:linear-gradient(to bottom,#75aadb 0 33%,#fff 33% 67%,#75aadb 67% 100%);
    box-shadow:0 0 0 1px rgba(0,0,0,.15);}
  .player-card-top .jersey-num{width:46px;height:46px;border-radius:10px;background:var(--sun);
    color:var(--ink);display:flex;align-items:center;justify-content:center;
    font-family:'Bangers','Arial Black',sans-serif;font-size:1.5rem;border:3px solid var(--ink);flex-shrink:0;
    box-shadow:inset 0 -3px 0 rgba(0,0,0,.15);}
  .player-photo{aspect-ratio:4/3;background:#dfe3ea;overflow:hidden;margin-top:-10px;position:relative;}
  .player-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.06) saturate(1.05);}
  .player-card-bottom{padding:14px 16px 20px;text-align:center;position:relative;}
  .player-card-bottom::before{content:"";position:absolute;top:0;left:16px;right:16px;height:1px;
    background:repeating-linear-gradient(90deg,var(--sky) 0 6px,transparent 6px 12px);}
  .player-card-bottom .p-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.75rem;color:var(--ink);letter-spacing:1px;text-transform:uppercase;}
  .player-card-bottom .p-role{font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--sky-dark);font-weight:700;margin-top:2px;}
  .player-card-bottom .stars{color:var(--sun-dark);letter-spacing:3px;margin-top:8px;font-size:1rem;}
  .player-card-shine{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;}
  .player-card-shine::before{content:"";position:absolute;top:-40%;left:0;width:30%;height:180%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
    animation:shine-sweep 4.5s ease-in-out infinite;}

  .scoreboard-strip{height:18px;background-color:var(--ink);margin-top:36px;position:relative;z-index:1;
    background-image:linear-gradient(135deg,#fff 25%,transparent 25%),linear-gradient(225deg,#fff 25%,transparent 25%);
    background-position:0 0;background-size:24px 24px;background-repeat:repeat-x;}

  /* ---- Layout general ---- */
  section{max-width:780px;margin:0 auto;padding:48px 20px;text-align:center;position:relative;}
  section.sec-alt{background:#eaf6ec;max-width:100%;}
  section.sec-alt > .inner{max-width:780px;margin:0 auto;}
  section.sec-sky{background:#eaf3fc;max-width:100%;}
  section.sec-sky > .inner{max-width:780px;margin:0 auto;}
  .section-title{display:inline-block;font-family:'Bangers','Arial Black',Impact,sans-serif;font-weight:400;
    text-transform:uppercase;font-size:1.7rem;color:var(--grass-dark);
    margin:0 0 24px;letter-spacing:1.5px;position:relative;}
  .section-title::after{content:"";display:block;width:70px;height:5px;background:var(--sun);
    border-radius:4px;margin:8px auto 0;}
  .corner-deco{position:absolute;font-size:1.7rem;pointer-events:none;z-index:1;
    filter:drop-shadow(0 3px 3px rgba(0,0,0,.18));}
  .corner-deco.tl{top:14px;left:6%;transform:rotate(-12deg);}
  .corner-deco.tr{top:14px;right:6%;transform:rotate(12deg);}
  @media(max-width:600px){.corner-deco{display:none;}}

  /* Cuenta regresiva estilo marcador de estadio */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
  .countdown div{background:var(--ink);color:#fff;border-radius:10px;min-width:66px;padding:12px 8px;
    box-shadow:0 5px 0 var(--sky-dark);border:2px solid rgba(255,255,255,.08);}
  .cd-num{display:block;font-family:'Bangers','Arial Black',sans-serif;font-size:1.8rem;color:var(--sun);}
  .cd-label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:1px;color:#cfe8ff;}

  /* Programa del partido (mensaje) */
  .match-message{font-size:1.05rem;line-height:1.7;background:#fff;border:3px solid var(--grass);
    border-radius:18px;padding:24px 22px;box-shadow:0 6px 0 var(--grass);position:relative;}
  .match-message::before{content:"⚽";position:absolute;top:-20px;left:22px;font-size:1.8rem;
    background:#eaf6ec;padding:0 6px;}

  .program{position:relative;display:flex;flex-direction:column;gap:16px;max-width:460px;
    margin:26px auto 0;text-align:left;padding-left:38px;}
  .program::before{content:"";position:absolute;left:17px;top:8px;bottom:8px;width:3px;
    background:repeating-linear-gradient(var(--sky) 0 6px,transparent 6px 12px);}
  .program .step{position:relative;display:flex;align-items:center;gap:12px;background:#fff;
    border:2px solid var(--sky);border-radius:14px;padding:12px 16px;box-shadow:0 3px 0 var(--sky);}
  .program .step .ico{position:absolute;left:-38px;top:50%;transform:translateY(-50%);
    width:34px;height:34px;border-radius:50%;background:var(--sky-dark);color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:1.05rem;
    border:3px solid #fff;box-shadow:0 0 0 2px var(--sky-dark);flex-shrink:0;}
  .program .step .txt strong{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--sky-dark);}
  .program .step .txt span{font-size:.94rem;font-weight:500;}

  .tematica-box{margin-top:22px;display:inline-flex;align-items:center;gap:10px;background:var(--ink);
    color:#fff;padding:12px 22px;border-radius:14px;font-weight:600;box-shadow:0 5px 0 var(--sky-dark);
    transform:rotate(-1deg);}

  .field-card{background:#fff;border:3px dashed var(--grass);border-radius:18px;padding:26px 22px;
    max-width:480px;margin:0 auto;position:relative;}
  .field-card .lugar{font-size:1.15rem;font-weight:700;color:var(--grass-dark);margin:6px 0;}
  .field-card a.map-link{display:inline-block;margin-top:14px;background:var(--grass);color:#fff;
    text-decoration:none;padding:11px 24px;border-radius:30px;font-weight:700;box-shadow:0 4px 0 var(--grass-dark);}

  /* Mini juego: ¿qué jugador de la Scaloneta sos? */
  .game-card{background:linear-gradient(180deg,var(--sky),var(--sky-dark));border-radius:22px;
    padding:28px 22px;color:#fff;max-width:420px;margin:0 auto;position:relative;overflow:hidden;}
  .game-card::before{content:"⚽";position:absolute;font-size:5rem;opacity:.12;top:-14px;right:-14px;
    transform:rotate(-14deg);}
  .game-card p{font-weight:600;margin-top:0;position:relative;z-index:1;}
  .game-card button{width:100%;background:var(--sun);color:var(--ink);font-family:'Bangers','Arial Black',sans-serif;
    font-size:1.1rem;letter-spacing:1px;text-transform:uppercase;border:3px solid var(--ink);border-radius:12px;
    padding:13px;cursor:pointer;box-shadow:5px 5px 0 var(--ink);transition:transform .1s,box-shadow .1s;margin-top:6px;
    position:relative;z-index:1;}
  .game-card button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}

  .mini-card{margin-top:20px;background:#fff;color:var(--ink);border-radius:16px;overflow:hidden;
    display:none;position:relative;z-index:1;border:4px solid var(--ink);box-shadow:6px 6px 0 rgba(12,35,64,.35);
    transform:rotate(-1deg);}
  .mini-card.show{display:block;}
  .mini-card-top{background:linear-gradient(135deg,var(--grass),var(--grass-dark));color:#fff;
    padding:8px 14px;display:flex;align-items:center;justify-content:space-between;
    clip-path:polygon(0 0,100% 0,100% 74%,0 100%);}
  .mini-card-top .rv-tag{font-size:.62rem;text-transform:uppercase;letter-spacing:2px;font-weight:700;}
  .mini-card-top .rv-num{width:30px;height:30px;border-radius:8px;background:var(--sun);color:var(--ink);
    display:flex;align-items:center;justify-content:center;font-family:'Bangers','Arial Black',sans-serif;
    font-size:1rem;border:2px solid var(--ink);flex-shrink:0;}
  .mini-card-bottom{padding:12px 14px 16px;text-align:center;}
  .mini-card-bottom .rv-name{font-family:'Bangers','Arial Black',sans-serif;font-size:1.5rem;letter-spacing:1px;
    text-transform:uppercase;color:var(--ink);}
  .mini-card-bottom .rv-pos{font-size:.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--sky-dark);
    font-weight:700;margin-top:2px;}

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
    .player-card{max-width:300px;}
    .hero .pitch-circle{width:170px;height:170px;}
  }
</style></head>
<body>

  <div class="crowd-strip"></div>
  <div class="hero">
    <span class="pitch-mark pitch-corner"></span>
    <span class="pitch-mark pitch-corner r"></span>
    <span class="pitch-mark pitch-halfway"></span>
    <span class="pitch-mark pitch-circle"></span>
    <span class="pitch-mark pitch-spot"></span>
    <div class="hero-inner">
      <span class="kickoff-tag"><span class="ball">⚽</span> Partido de cumple</span>
      <h1>${esc(d.nombreChico)}</h1>
      <p class="sub">Cumple ${esc(d.edad)} años y te invita a jugar un partidazo</p>
      <div class="player-card">
        <div class="player-card-shine"></div>
        <div class="player-card-top">
          <span class="team-name"><span class="mini-flag"></span> Los Cracks FC</span>
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
    <span class="corner-deco tl">🚩</span>
    <span class="corner-deco tr">🏆</span>
    <span class="section-title">Faltan para el pitazo inicial</span>
    ${cd.html}
  </section>

  <section class="sec-alt"><div class="inner">
    <span class="corner-deco tl">🎽</span>
    <span class="corner-deco tr">🍕</span>
    <span class="section-title">¡A jugar y después a comer!</span>
    <div class="match-message">${esc(d.mensaje)}</div>
    <div class="program">
      <div class="step"><span class="ico">⚽</span><div class="txt"><strong>1er tiempo</strong><span>Partido entre todos</span></div></div>
      <div class="step"><span class="ico">🎂</span><div class="txt"><strong>Entretiempo</strong><span>Torta y globos</span></div></div>
      <div class="step"><span class="ico">🍕</span><div class="txt"><strong>2do tiempo</strong><span>Comemos algo rico</span></div></div>
    </div>
    ${d.tematica ? `<div class="tematica-box">👕 ${esc(d.tematica)}</div>` : ""}
  </div></section>

  ${d.lugar || d.hora || d.direccionMapa ? `<section>
    <span class="corner-deco tl">🥅</span>
    <span class="corner-deco tr">📍</span>
    <span class="section-title">¿Dónde jugamos?</span>
    <div class="field-card">
      <p>📅 ${esc(d.fecha)}${d.hora ? ` — 🕐 ${esc(d.hora)} hs` : ""}</p>
      ${d.lugar ? `<p class="lugar">📍 ${esc(d.lugar)}</p>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver cómo llegar a la cancha →</a>` : ""}
    </div>
  </section>` : ""}

  <section class="sec-sky"><div class="inner">
    <span class="corner-deco tl">⚽</span>
    <span class="corner-deco tr">⭐</span>
    <span class="section-title">¿Qué jugador de la Scaloneta sos?</span>
    <div class="game-card">
      <p>Tocá el botón y descubrí a qué crack de la Selección te parecés hoy.</p>
      <button type="button" id="futPlayerBtn">⚽ ¡Sacar mi ficha!</button>
      <div class="mini-card" id="futPlayerReveal">
        <div class="mini-card-top">
          <span class="rv-tag">Hoy jugás como</span>
          <span class="rv-num" id="futPlayerNum"></span>
        </div>
        <div class="mini-card-bottom">
          <div class="rv-name" id="futPlayerName"></div>
          <div class="rv-pos" id="futPlayerPos"></div>
        </div>
      </div>
    </div>
  </div></section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-title">Álbum de fotos</span>
    ${gal.html}
  </section>` : ""}

  <section class="sec-alt"><div class="inner">
    <span class="corner-deco tl">📣</span>
    <span class="corner-deco tr">🎉</span>
    <span class="section-title">Confirmá que venís a jugar</span>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-box">${rsvp.html}</div>
  </div></section>

  <footer>
    <span class="whistle">📣 ⚽ 🏆</span>
    ¡Te esperamos en la cancha para festejar con ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var players = [
        {n:'E. Martínez',p:'Arquero'},{n:'F. Armani',p:'Arquero'},{n:'G. Rulli',p:'Arquero'},
        {n:'N. Molina',p:'Defensor'},{n:'G. Montiel',p:'Defensor'},{n:'C. Romero',p:'Defensor'},
        {n:'N. Otamendi',p:'Defensor'},{n:'Lisandro Martínez',p:'Defensor'},{n:'M. Acuña',p:'Defensor'},
        {n:'N. Tagliafico',p:'Defensor'},{n:'G. Pezzella',p:'Defensor'},
        {n:'R. De Paul',p:'Mediocampista'},{n:'L. Paredes',p:'Mediocampista'},{n:'G. Rodríguez',p:'Mediocampista'},
        {n:'A. Mac Allister',p:'Mediocampista'},{n:'E. Fernández',p:'Mediocampista'},{n:'E. Palacios',p:'Mediocampista'},
        {n:'A. Gómez',p:'Mediocampista'},{n:'T. Almada',p:'Mediocampista'},
        {n:'L. Messi',p:'Delantero'},{n:'J. Álvarez',p:'Delantero'},{n:'Á. Di María',p:'Delantero'},
        {n:'Lautaro Martínez',p:'Delantero'},{n:'P. Dybala',p:'Delantero'},{n:'J. Correa',p:'Delantero'}
      ];
      var btn = document.getElementById('futPlayerBtn');
      var reveal = document.getElementById('futPlayerReveal');
      var nameEl = document.getElementById('futPlayerName');
      var posEl = document.getElementById('futPlayerPos');
      var numEl = document.getElementById('futPlayerNum');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var pick = players[Math.floor(Math.random() * players.length)];
        var num = 1 + Math.floor(Math.random() * 11);
        nameEl.textContent = pick.n;
        posEl.textContent = pick.p;
        numEl.textContent = num;
        reveal.classList.add('show');
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden;
    background:
      radial-gradient(ellipse at 50% 8%, rgba(255,255,255,.4), transparent 60%),
      repeating-linear-gradient(90deg,#2e8b3d 0 20px,#1c5c28 20px 40px);">
    <span style="position:absolute;top:0;left:0;right:0;height:10px;background-color:#0c2340;
      background-image:radial-gradient(circle,rgba(255,255,255,.55) 1.2px,transparent 1.4px);
      background-size:7px 7px;background-position:0 3px;"></span>
    <span style="position:absolute;top:14px;left:0;right:0;text-align:center;">
      <span style="display:inline-block;width:68px;height:68px;border:3px solid rgba(255,255,255,.5);border-radius:50%;"></span>
    </span>
    <span style="font-size:2.1rem;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35));">⚽</span>
    <div style="font-family:'Arial Black',Impact,sans-serif;font-size:1.2rem;color:#fff;letter-spacing:1px;
      -webkit-text-stroke:1px #0c2340;paint-order:stroke fill;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#ffd400;font-weight:700;
      background:#0c2340;padding:2px 8px;border-radius:8px;">Partido de cumple</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Fútbol",
  summary: "Cumpleaños con partido de fútbol y comida después: cancha con líneas de juego, ficha de jugador y un mini juego de qué crack de la Scaloneta sos.",
  accent: "#6cace4", schema: infantilSchema, sampleData, render, cardPreview,
};
