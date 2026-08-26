const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { infantilSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "inf-granja-animalitos";

const sampleData = {
  nombreChico: "Emilia",
  edad: "4",
  fecha: "2027-04-17",
  hora: "16:00",
  lugar: "Granja Educativa Los Teros, Luján",
  direccionMapa: "https://maps.google.com/?q=Granja+Educativa+Los+Teros+Lujan",
  mensaje: "¡Emilia cumple 4 años y te invita a pasar una tarde a puro campo! Vamos a visitar a los animalitos, andar en sulky y comer torta entre gallinas y ovejitas.",
  tematica: "Vení con ropa cómoda, vamos a ensuciarnos un poco",
  whatsapp: "5491100000063",
  coverImage: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
    "https://images.unsplash.com/photo-1560468660-6c11a19d7330?w=800&q=80",
    "https://images.unsplash.com/photo-1516920072866-16f7549cd4d4?w=800&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
  ],
};

// Animalitos que se revelan en el juego de los escondites. Fijos, no vienen
// del schema: cada escondite muestra uno distinto con su onomatopeya.
const ANIMALITOS = [
  { emoji: "🐮", nombre: "la vaca Lola", sonido: "¡Muuu!" },
  { emoji: "🐷", nombre: "el chanchito Toto", sonido: "¡Oinc oinc!" },
  { emoji: "🐔", nombre: "la gallina Pepa", sonido: "¡Coc coc coc!" },
  { emoji: "🐑", nombre: "la oveja Lana", sonido: "¡Beee!" },
  { emoji: "🐴", nombre: "el caballo Trueno", sonido: "¡Iiiiih!" },
  { emoji: "🦆", nombre: "el patito Willy", sonido: "¡Cuac cuac!" },
];

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#e8a33d");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "16:00"}:00` : sampleData.fecha, "cd-granja");
  const gal = galleryWidget(d.galeria, "gal-granja");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>¡${esc(d.nombreChico)} cumple ${esc(d.edad)}! Granja de Animalitos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --cielo:#bfe6f5;
    --pradera:#f4ecd4;
    --pradera-osc:#e4d6a8;
    --verde:${d.__accent2 || "#6a9955"};
    --verde-osc:#4a7038;
    --sol:${accent};
    --madera:#a86a3d;
    --madera-osc:#7c4c2a;
    --tinta:#4a3a22;
  }
  *{box-sizing:border-box;}
  html,body{overflow-x:hidden;}
  body{
    margin:0;
    font-family:'Nunito','Verdana',sans-serif;
    background:var(--pradera);
    color:var(--tinta);
  }
  h1,h2,h3{font-family:'Baloo 2','Trebuchet MS',sans-serif;}

  .fence-strip{
    height:16px;width:100%;
    background:
      repeating-linear-gradient(90deg, var(--madera) 0 8px, var(--madera-osc) 8px 12px, transparent 12px 26px);
    background-color:var(--pradera-osc);
  }

  .hero{
    position:relative;
    min-height:78vh;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:60px 18px 56px;
    background:
      radial-gradient(circle at 82% 12%, rgba(255,224,130,.85), transparent 22%),
      linear-gradient(180deg, var(--cielo) 0%, var(--cielo) 42%, rgba(244,236,212,.15) 70%),
      linear-gradient(0deg, rgba(74,58,34,.55), rgba(74,58,34,.25) 45%, transparent 70%),
      url('${esc(d.coverImage)}') center/cover;
    overflow:hidden;
  }
  .hero::before{
    content:"🐄🐷🐔🐑🐴🦆";
    position:absolute;
    bottom:10px; left:0; right:0;
    text-align:center;
    font-size:1.6rem;
    letter-spacing:16px;
    opacity:.85;
    filter:drop-shadow(0 2px 2px rgba(0,0,0,.25));
  }
  .hero-content{position:relative;z-index:1;color:#fff;max-width:640px;}
  .stamp{
    display:inline-block;
    background:var(--sol);
    color:var(--tinta);
    text-transform:uppercase;
    font-weight:800;
    letter-spacing:2px;
    font-size:.75rem;
    padding:7px 18px;
    border-radius:40px;
    margin-bottom:18px;
    box-shadow:0 4px 0 var(--madera-osc);
    transform:rotate(-3deg);
  }
  .hero-content h1{
    font-size:clamp(2.2rem,8vw,3rem);
    margin:0 0 6px;
    color:#fff;
    text-shadow:3px 3px 0 var(--verde-osc), 0 0 18px rgba(0,0,0,.35);
    line-height:1.1;
  }
  .hero-age{
    display:inline-flex;
    flex-direction:column;
    align-items:center;
    background:#fff;
    color:var(--verde-osc);
    padding:14px 30px 12px;
    border-radius:50%;
    margin:16px 0 8px;
    box-shadow:0 6px 0 var(--verde-osc);
    transform:rotate(-2deg);
  }
  .hero-age .num{font-size:clamp(3rem,13vw,4.4rem);font-weight:800;line-height:1;}
  .hero-age .txt{font-size:.8rem;text-transform:uppercase;font-weight:800;letter-spacing:1.5px;margin-top:2px;}
  .hero-content p.tag{
    margin-top:14px;
    font-size:1.05rem;
    font-weight:700;
    text-shadow:1px 1px 4px rgba(0,0,0,.4);
  }

  section{max-width:820px;margin:0 auto;padding:46px 20px;text-align:center;position:relative;}
  section.band{background:linear-gradient(180deg, var(--pradera), var(--pradera-osc) 60%, var(--pradera));max-width:100%;}
  section.band > .inner{max-width:820px;margin:0 auto;}

  .section-badge{
    display:inline-block;
    background:var(--verde);
    color:#fff;
    text-transform:uppercase;
    font-weight:800;
    letter-spacing:2px;
    font-size:.75rem;
    padding:8px 20px;
    border-radius:30px;
    margin-bottom:16px;
  }
  h2{font-size:1.5rem;color:var(--verde-osc);margin:0 0 20px;}

  .message{
    font-size:1.1rem;
    line-height:1.7;
    background:#fff;
    border:3px solid var(--pradera-osc);
    border-radius:20px;
    padding:26px 24px;
    position:relative;
    box-shadow:0 6px 0 var(--pradera-osc);
  }
  .message::before{content:"🐾";position:absolute;top:-16px;left:20px;font-size:1.6rem;background:var(--pradera);padding:0 6px;}

  .tematica-card{
    display:inline-flex;
    align-items:center;
    gap:12px;
    background:linear-gradient(135deg, var(--sol), #d98a1f);
    color:var(--tinta);
    padding:18px 26px;
    border-radius:16px;
    margin-top:16px;
    font-weight:800;
    box-shadow:0 6px 0 var(--madera-osc);
    max-width:100%;
  }
  .tematica-card .ico{font-size:1.8rem;}

  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0 0;}
  .countdown div{
    background:#fff;
    border:3px solid var(--verde);
    border-radius:14px;
    padding:14px 10px;
    min-width:68px;
    box-shadow:0 5px 0 var(--verde);
  }
  .cd-num{display:block;font-size:1.8rem;font-weight:800;color:var(--verde-osc);}
  .cd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--madera);}

  .map-card{
    background:#fff;
    border:3px dashed var(--madera);
    border-radius:18px;
    padding:26px 22px;
    max-width:520px;
    margin:0 auto;
  }
  .map-card .lugar{font-size:1.2rem;font-weight:800;color:var(--verde-osc);margin:6px 0;}
  .map-card a.map-link{
    display:inline-block;
    margin-top:14px;
    background:var(--verde);
    color:#fff;
    text-decoration:none;
    padding:10px 22px;
    border-radius:30px;
    font-weight:800;
    box-shadow:0 4px 0 var(--verde-osc);
  }

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.15);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(74,58,34,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;border-radius:10px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2.2rem;cursor:pointer;}

  .rsvp-box{
    background:#fff;
    border:3px solid var(--verde);
    border-radius:20px;
    padding:28px 22px;
    max-width:420px;
    margin:0 auto;
    box-shadow:0 6px 0 var(--verde);
  }
  .rsvp-form{display:flex;flex-direction:column;gap:14px;text-align:left;}
  .rsvp-form label{font-size:.78rem;text-transform:uppercase;letter-spacing:.5px;color:var(--verde-osc);font-weight:800;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;padding:10px;border:2px solid var(--pradera-osc);border-radius:10px;margin-top:5px;width:100%;
  }
  .rsvp-form button{
    background:var(--sol);
    color:var(--tinta);
    border:0;
    padding:13px;
    border-radius:10px;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:1px;
    cursor:pointer;
    box-shadow:0 4px 0 var(--madera-osc);
  }
  .rsvp-form button:active{transform:translateY(2px);box-shadow:0 2px 0 var(--madera-osc);}
  .rsvp-whatsapp{display:block;text-align:center;color:var(--verde);font-weight:800;text-decoration:none;}
  .rsvp-status{text-align:center;color:var(--verde-osc);font-weight:800;}

  /* ---- mini juego: ¿quién se escondió en la granja? ---- */
  .granja-game{
    background:linear-gradient(180deg,var(--verde),var(--verde-osc));
    border-radius:22px;padding:28px 20px;color:#fff;
    max-width:600px;margin:0 auto;
  }
  .granja-game p.intro{font-weight:700;margin-top:0;}
  .escondites{
    display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
    max-width:440px;margin:18px auto 0;
  }
  @media (max-width:480px){.escondites{grid-template-columns:repeat(2,1fr);}}
  .escondite{
    position:relative;aspect-ratio:1;
    border-radius:16px;cursor:pointer;user-select:none;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(160deg,#e8a33d,#c9821e);
    border:3px solid #fff4;
    box-shadow:0 5px 0 rgba(0,0,0,.2);
    overflow:hidden;
    transition:transform .15s ease;
  }
  .escondite:active{transform:translateY(3px);}
  .escondite .tapa{
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-size:2rem;background:linear-gradient(160deg,#e8a33d,#c9821e);
    transition:transform .35s ease, opacity .35s ease;
  }
  .escondite .bicho{
    font-size:2.2rem;
    transform:scale(0);
    transition:transform .35s cubic-bezier(.34,1.56,.64,1);
  }
  .escondite.open .tapa{transform:translateY(-120%);opacity:0;}
  .escondite.open .bicho{transform:scale(1);}
  .escondite.open{cursor:default;}
  .granja-caption{
    margin-top:6px;font-size:.7rem;text-align:center;opacity:.8;
    min-height:1em;
  }
  .granja-mensaje{
    margin-top:16px;font-weight:800;min-height:1.4em;
    background:rgba(255,255,255,.15);border-radius:12px;padding:10px 14px;
  }

  footer{
    text-align:center;
    padding:34px 20px;
    background:var(--verde-osc);
    color:#f4ecd4;
    font-size:.9rem;
  }
  footer .banda{font-size:1.4rem;display:block;margin-bottom:6px;}

  @media (max-width:480px){
    .hero-content h1{font-size:2rem;}
    .hero-age{padding:12px 24px 10px;}
    .hero-age .num{font-size:3rem;}
    .hero::before{font-size:1.1rem;letter-spacing:8px;}
  }
</style></head>
<body>

  <div class="hero"><div class="hero-content">
    <span class="stamp">Tarde a puro campo</span>
    <h1>${esc(d.nombreChico)}</h1>
    <div class="hero-age"><span class="num">${esc(d.edad)}</span><span class="txt">años</span></div>
    <p class="tag">🐮 Fiesta en la Granja 🐷</p>
  </div></div>

  <div class="fence-strip"></div>

  <section>
    <span class="section-badge">Cuenta regresiva</span>
    <h2>Faltan para la granja</h2>
    ${cd.html}
  </section>

  ${d.mensaje || d.tematica ? `<section>
    <span class="section-badge">Mensaje</span>
    <h2>¡Te esperamos a puro campo!</h2>
    ${d.mensaje ? `<p class="message">${esc(d.mensaje)}</p>` : ""}
    ${d.tematica ? `<div class="tematica-card"><span class="ico">🧦</span><span>${esc(d.tematica)}</span></div>` : ""}
  </section>` : ""}

  <section class="band"><div class="inner">
    <span class="section-badge">Dónde es</span>
    <h2>¿Dónde queda la granja?</h2>
    <div class="map-card">
      <p>📅 ${esc(d.fecha)}${d.hora ? ` — 🕐 ${esc(d.hora)}` : ""}</p>
      ${d.lugar ? `<p class="lugar">📍 ${esc(d.lugar)}</p>` : ""}
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver mapa →</a>` : ""}
    </div>
  </div></section>

  <section>
    <span class="section-badge">Para jugar</span>
    <h2>¿Quién se escondió en la granja? 🌾</h2>
    <div class="granja-game">
      <p class="intro">Tocá cada fardo de heno y descubrí qué animalito se esconde adentro.</p>
      <div class="escondites" id="granjaGrid"></div>
      <p class="granja-mensaje" id="granjaMensaje">¡Tocá los fardos para descubrirlos a todos!</p>
    </div>
  </section>

  ${d.galeria && d.galeria.length ? `<section>
    <span class="section-badge">Galería</span>
    <h2>Fotos de la granja</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <span class="section-badge">RSVP</span>
    <h2>Confirmá tu visita a la granja</h2>
    ${rsvpDeadline ? `<p style="margin:10px 0 0;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-box">${rsvp.html}</div>
  </section>

  <footer>
    <span class="banda">🐮🐷🐔🐑🐴🦆</span>
    ¡Te esperamos en la granja, ${esc(d.nombreChico)}!
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
    (function(){
      var animalitos = ${JSON.stringify(ANIMALITOS)};
      var grid = document.getElementById('granjaGrid');
      var mensaje = document.getElementById('granjaMensaje');
      if(!grid) return;
      var revelados = 0;
      // Mezclamos el orden de los animalitos para que la sorpresa cambie
      // de escondite en cada carga de la página.
      var orden = animalitos.slice();
      for (var k = orden.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var tmp = orden[k]; orden[k] = orden[j]; orden[j] = tmp;
      }
      orden.forEach(function(animal){
        var cell = document.createElement('div');
        cell.className = 'escondite';
        var tapa = document.createElement('div');
        tapa.className = 'tapa';
        tapa.textContent = '🌾';
        var bicho = document.createElement('div');
        bicho.className = 'bicho';
        bicho.textContent = animal.emoji;
        cell.appendChild(bicho);
        cell.appendChild(tapa);
        cell.addEventListener('click', function(){
          if(cell.classList.contains('open')) return;
          cell.classList.add('open');
          revelados++;
          mensaje.textContent = animal.sonido + ' Era ' + animal.nombre + '.';
          if(revelados === orden.length){
            setTimeout(function(){
              mensaje.textContent = '¡Encontraste a todos los animalitos de la granja! 🎉';
            }, 900);
          }
        });
        grid.appendChild(cell);
      });
    })();
  </script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
    background:linear-gradient(180deg,#bfe6f5 0%,#bfe6f5 38%,#f4ecd4 38%,#e4d6a8 100%);">
    <span style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:.9rem;letter-spacing:8px;opacity:.7;">🐔🐷🐑</span>
    <svg width="54" height="42" viewBox="0 0 54 42" style="filter:drop-shadow(0 3px 3px rgba(0,0,0,.2));">
      <ellipse cx="27" cy="24" rx="19" ry="13" fill="${d.accent2 || "#6a9955"}"/>
      <circle cx="12" cy="16" r="9" fill="${d.accent2 || "#6a9955"}"/>
      <rect x="6" y="8" width="4" height="6" rx="2" fill="${d.accent}"/>
      <rect x="14" y="8" width="4" height="6" rx="2" fill="${d.accent}"/>
      <circle cx="9" cy="15" r="1.6" fill="#3a2c18"/>
      <circle cx="16" cy="15" r="1.6" fill="#3a2c18"/>
      <ellipse cx="12" cy="19" rx="3" ry="2" fill="#e8a33d"/>
      <ellipse cx="38" cy="20" rx="4" ry="3" fill="${d.accent}"/>
      <ellipse cx="15" cy="30" rx="4" ry="3" fill="${d.accent}"/>
      <ellipse cx="39" cy="30" rx="4" ry="3" fill="${d.accent}"/>
    </svg>
    <div style="font-family:Verdana,Arial,sans-serif;font-weight:800;font-size:1.1rem;color:#4a3a22;letter-spacing:.5px;text-shadow:0 1px 0 #fff8;">${esc(d.name)}</div>
    <div style="font-size:.5rem;letter-spacing:3px;text-transform:uppercase;color:#7c4c2a;font-weight:700;">Fiesta en la granja</div>
  </div>`;
}

module.exports = {
  id, category: "infantiles", name: "Granja de Animalitos",
  summary: "Cumpleaños infantil de granja con colores cálidos y animalitos tiernos, mapa campestre y un juego de escondites donde cada fardo de heno revela una sorpresa distinta.",
  accent: "#e8a33d", accent2: "#6a9955", schema: infantilSchema, sampleData, render, cardPreview,
};
