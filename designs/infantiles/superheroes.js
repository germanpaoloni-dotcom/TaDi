const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-superheroes";

const sampleData = {
  nombreChico: "Bautista",
  edad: "7",
  fecha: "2027-05-24",
  hora: "17:00",
  lugar: "Salón Divertilandia, San Salvador de Jujuy",
  direccionMapa: "https://maps.google.com/?q=Salon+Divertilandia+San+Salvador+de+Jujuy",
  mensaje: "¡Bautista se pone la capa y cumple 7 años! Vení a ayudarnos a salvar el día: va a haber torta, juegos, misiones secretas y mucha diversión superheroica.",
  tematica: "Vení disfrazado de tu superhéroe favorito",
  whatsapp: "5491100000010",
  coverImage: "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#ffd400");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd9");
  const gal = galleryWidget(d.galeria, "gal9");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡Súper cumple de ${esc(d.nombreChico)}!</title>
<style>
  :root{--red:#ed1c24;--blue:#1a3aad;--yellow:${accent};--ink:#0c1b3a;--paper:#fff8e6;}
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{margin:0;font-family:'Segoe UI',Verdana,Arial,sans-serif;background:var(--paper);color:var(--ink);}
  h1,h2,.comic-font{font-family:'Arial Black',Impact,'Franklin Gothic Bold',sans-serif;}

  /* ---- Hero ---- */
  .hero{position:relative;overflow:hidden;text-align:center;color:#fff;padding:64px 18px 76px;
    background:linear-gradient(160deg,rgba(26,58,173,.88),rgba(12,27,58,.94)),url('${esc(d.coverImage)}') center/cover;}
  .hero::before{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:repeating-radial-gradient(circle at center, rgba(255,255,255,.12) 0 2px, transparent 2px 34px);
    opacity:.6;}
  .hero-content{position:relative;z-index:1;max-width:600px;margin:0 auto;}
  .eyebrow{display:inline-block;background:var(--yellow);color:var(--ink);font-weight:900;
    text-transform:uppercase;letter-spacing:2px;font-size:.8rem;padding:6px 16px;border-radius:20px;
    border:3px solid var(--ink);transform:rotate(-3deg);box-shadow:3px 3px 0 var(--ink);}
  .hero h1{font-size:clamp(2.2rem,9vw,4rem);margin:18px 0 6px;text-transform:uppercase;letter-spacing:1px;
    color:#fff;text-shadow:4px 4px 0 var(--red),7px 7px 0 var(--ink);line-height:1.05;word-break:break-word;}
  .age-wrap{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:22px;flex-wrap:wrap;}
  .age-badge{width:120px;height:120px;flex:0 0 auto;background:var(--yellow);color:var(--ink);
    display:flex;align-items:center;justify-content:center;font-weight:900;font-size:2.4rem;
    clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}
  .age-text{font-weight:900;text-transform:uppercase;font-size:1.3rem;letter-spacing:1px;}
  .pow{position:absolute;background:var(--yellow);color:var(--red);font-weight:900;
    display:flex;align-items:center;justify-content:center;text-transform:uppercase;
    clip-path:polygon(50% 0%,63% 20%,88% 8%,82% 33%,100% 45%,78% 55%,88% 80%,62% 68%,50% 100%,38% 68%,12% 80%,22% 55%,0% 45%,18% 33%,12% 8%,37% 20%);
    z-index:1;}
  .pow1{width:88px;height:88px;font-size:.75rem;top:8%;left:4%;transform:rotate(-14deg);}
  .pow2{width:70px;height:70px;font-size:.62rem;bottom:6%;right:5%;transform:rotate(10deg);}

  /* ---- Layout ---- */
  section{max-width:760px;margin:0 auto;padding:46px 18px;}
  section h2{text-align:center;text-transform:uppercase;font-size:1.7rem;color:var(--red);
    -webkit-text-stroke:1px var(--ink);margin:0 0 22px;letter-spacing:1px;}
  .zigzag{height:16px;background-color:var(--ink);
    background-image:linear-gradient(135deg,var(--yellow) 25%,transparent 25%),linear-gradient(225deg,var(--yellow) 25%,transparent 25%);
    background-position:0 0;background-size:22px 22px;background-repeat:repeat-x;}

  .panel{background:#fff;border:5px solid var(--ink);border-radius:16px;box-shadow:8px 8px 0 var(--ink);
    padding:28px 22px;max-width:100%;}
  .tilt-l{transform:rotate(-.8deg);}
  .tilt-r{transform:rotate(.8deg);}

  .bubble{position:relative;background:#fff;border:5px solid var(--ink);border-radius:26px;
    box-shadow:8px 8px 0 var(--ink);padding:26px;font-size:1.05rem;line-height:1.6;text-align:center;}
  .bubble::before{content:"";position:absolute;left:56px;bottom:-30px;
    border-width:22px 22px 0 0;border-style:solid;border-color:var(--ink) transparent transparent transparent;}
  .bubble::after{content:"";position:absolute;left:62px;bottom:-22px;
    border-width:16px 16px 0 0;border-style:solid;border-color:#fff transparent transparent transparent;}

  .mission-label{display:inline-block;background:var(--red);color:#fff;font-weight:900;
    text-transform:uppercase;font-size:.8rem;letter-spacing:1px;padding:6px 14px;border-radius:8px;
    border:3px solid var(--ink);margin-bottom:12px;}
  .mission-text{font-size:1.15rem;font-weight:700;}

  /* Countdown (widget markup, custom styling) */
  .countdown{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
  .countdown div{background:var(--blue);color:#fff;border:4px solid var(--ink);border-radius:10px;
    min-width:64px;padding:10px 6px;text-align:center;box-shadow:4px 4px 0 var(--ink);}
  .cd-num{display:block;font-size:1.6rem;font-weight:900;}
  .cd-label{display:block;font-size:.62rem;text-transform:uppercase;letter-spacing:1px;}

  .loc-info p{font-size:1.05rem;margin:6px 0;text-align:center;}
  .btn-pow{display:block;width:max-content;margin:18px auto 0;background:var(--red);color:#fff;
    font-weight:900;text-transform:uppercase;text-decoration:none;padding:12px 26px;
    border:4px solid var(--ink);border-radius:10px;box-shadow:5px 5px 0 var(--ink);
    transition:transform .1s,box-shadow .1s;}
  .btn-pow:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}

  /* Gallery (widget markup) */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:10px;cursor:pointer;
    border:4px solid var(--ink);box-shadow:4px 4px 0 var(--ink);}
  .gallery-item:nth-child(odd) img{transform:rotate(-1.5deg);}
  .gallery-item:nth-child(even) img{transform:rotate(1.5deg);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(12,27,58,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;border:5px solid var(--yellow);}
  .lightbox-close{position:absolute;top:20px;right:26px;color:#fff;font-size:2.2rem;cursor:pointer;font-weight:900;}

  /* Generador de nombre de superhéroe */
  .generator input{font-family:inherit;font-size:1rem;padding:10px 12px;border:3px solid var(--ink);
    border-radius:8px;width:100%;margin-bottom:12px;}
  .generator button{width:100%;background:var(--yellow);color:var(--ink);font-weight:900;
    text-transform:uppercase;border:4px solid var(--ink);border-radius:10px;padding:12px;
    box-shadow:5px 5px 0 var(--ink);cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .generator button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .generator-result{margin-top:16px;text-align:center;font-size:1.3rem;font-weight:900;color:var(--red);
    min-height:1.6em;text-transform:uppercase;}

  /* RSVP (widget markup) */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;}
  .rsvp-form label{font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;font-weight:700;color:var(--blue);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;
    border:3px solid var(--ink);border-radius:8px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--red);color:#fff;border:4px solid var(--ink);padding:12px;
    border-radius:10px;font-weight:900;text-transform:uppercase;box-shadow:5px 5px 0 var(--ink);
    cursor:pointer;transition:transform .1s,box-shadow .1s;}
  .rsvp-form button:hover{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}
  .rsvp-whatsapp{text-align:center;font-weight:700;color:var(--blue);text-decoration:none;}
  .rsvp-status{text-align:center;font-weight:900;color:#1f9d55;}

  footer{background:var(--ink);color:#fff;text-align:center;padding:34px 20px;}
  footer .stars{color:var(--yellow);letter-spacing:6px;margin-bottom:8px;}
  footer p{margin:4px 0;font-size:.9rem;}

  @media(max-width:480px){
    .panel,.bubble{padding:20px 16px;}
    .age-badge{width:100px;height:100px;font-size:2rem;}
    .pow1,.pow2{display:none;}
  }
</style></head>
<body>

  <div class="hero">
    <span class="pow pow1">¡POW!</span>
    <span class="pow pow2">¡ZAS!</span>
    <div class="hero-content">
      <span class="eyebrow">¡Alerta de súper cumple!</span>
      <h1>${esc(d.nombreChico)}</h1>
      <div class="age-wrap">
        <span class="age-badge">${esc(d.edad)}</span>
        <span class="age-text">¡Años cumplidos!</span>
      </div>
    </div>
  </div>
  <div class="zigzag"></div>

  <section>
    <h2>Cuenta regresiva para la misión</h2>
    <div class="panel tilt-l" style="margin:0 auto;">
      ${cd.html}
    </div>
  </section>

  <section>
    <h2>Mensaje de la Liga</h2>
    <div class="bubble">${esc(d.mensaje)}</div>
  </section>

  <section>
    <h2>¡Dónde es la misión!</h2>
    <div class="panel tilt-r loc-info">
      <p><strong>${esc(d.fecha)}</strong> a las <strong>${esc(d.hora)}</strong> hs</p>
      <p>${esc(d.lugar)}</p>
      ${d.tematica ? `<div style="text-align:center;margin-top:16px;"><span class="mission-label">Misión especial</span><p class="mission-text">${esc(d.tematica)}</p></div>` : ""}
      ${d.direccionMapa ? `<a class="btn-pow" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver mapa →</a>` : ""}
    </div>
  </section>

  <section>
    <h2>Fotos de entrenamiento</h2>
    ${gal.html}
  </section>

  <section>
    <h2>Descubrí tu nombre de superhéroe</h2>
    <div class="panel tilt-l generator">
      <input type="text" id="heroNameInput" placeholder="Escribí tu nombre..." value="${esc(d.nombreChico)}">
      <button type="button" id="heroNameBtn">¡Transformarme!</button>
      <p class="generator-result" id="heroNameResult"></p>
    </div>
  </section>

  <section>
    <h2>Confirmá tu asistencia a la misión</h2>
    <div class="panel tilt-r">
      ${rsvp.html}
    </div>
  </section>

  <footer>
    <div class="stars">★ ★ ★</div>
    <p>¡Te esperamos para salvar el día junto a ${esc(d.nombreChico)}!</p>
    <p>Con súper cariño, la familia organizadora.</p>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var prefixes = ['Capitán','Súper','Increíble','Relámpago','Doctor','Comandante','Mega','Ultra'];
      var suffixes = ['Rayo','Cometa','Trueno','Fénix','Tornado','Estrella','Halcón','Cohete'];
      var input = document.getElementById('heroNameInput');
      var btn = document.getElementById('heroNameBtn');
      var result = document.getElementById('heroNameResult');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var val = (input.value || '').trim() || 'Héroe';
        var seed = 0;
        for (var i = 0; i < val.length; i++) seed += val.charCodeAt(i);
        var p = prefixes[seed % prefixes.length];
        var s = suffixes[(seed * 7 + val.length) % suffixes.length];
        result.textContent = '¡' + p + ' ' + s + '!';
      });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "infantiles", name: "Superhéroes",
  summary: "Cumple estilo cómic con globos de diálogo, viñetas y colores primarios bien vivos.",
  accent: "#ed1c24", schema: infantilSchema, sampleData, render,
};
