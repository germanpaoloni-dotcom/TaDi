const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-boho-naturaleza";

const sampleData = {
  novia: "Agatha", novio: "Ulises",
  fecha: "2027-02-23", horaCeremonia: "17:30", lugarCeremonia: "Playa Hotel Blue, Holbox",
  horaFiesta: "21:30", lugarFiesta: "Alma Bar Holbox, Q.R.",
  direccionMapa: "https://maps.google.com/?q=Holbox+Quintana+Roo",
  mensaje: "Entre palmeras, arena y el sonido del mar, queremos celebrar el comienzo de nuestra vida juntos rodeados de quienes más queremos.",
  dressCode: "Casual semi formal, tonos neutros — sin blanco",
  alias: "agatha.ulises.boda",
  whatsapp: "5491100000002",
  coverImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&q=80",
  ],
};

// --- Ornamentos SVG boho dibujados a mano (inline, sin dependencias externas) ---

// Ramita de hojas simples estilo línea, usada como decoración de esquina.
function branchSVG(w = 140, color = "#cdbb92") {
  const leaves = [[14, 58, -30], [26, 46, -18], [38, 34, -8], [48, 24, 2], [58, 14, 12]];
  return `<svg class="branch-deco" width="${w}" height="${Math.round(w * 0.5)}" viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 66 C 28 52, 40 32, 62 8" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    ${leaves.map(([x, y, r]) => `<g transform="translate(${x},${y}) rotate(${r})"><path d="M0 0 C 7 -6 7 -15 0 -19 C -7 -15 -7 -6 0 0 Z" fill="${color}" opacity=".85"/></g>`).join("")}
  </svg>`;
}

// Separador fino con una hoja al centro, usado entre bloques de texto.
function dividerSVG(color = "#cdbb92") {
  return `<svg class="divider-deco" width="150" height="18" viewBox="0 0 150 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="0" y1="9" x2="62" y2="9" stroke="${color}" stroke-width="1"/>
    <line x1="88" y1="9" x2="150" y2="9" stroke="${color}" stroke-width="1"/>
    <path d="M75 2 C 82 7 82 11 75 16 C 68 11 68 7 75 2 Z" fill="${color}"/>
  </svg>`;
}

function fechaCorta(fechaISO) {
  if (!fechaISO) return "";
  const [y, m, dd] = String(fechaISO).split("-");
  if (!y || !m || !dd) return esc(fechaISO);
  return `${dd}.${m}.${y.slice(2)}`;
}

function inicial(nombre) {
  return esc(String(nombre || "?").trim().charAt(0).toUpperCase());
}

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "dark", "#c9b790");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cdboho");
  const gal = galleryWidget(d.galeria, "galboho");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --olive:#4c5535; --olive-dark:#383f27; --tan:#c9b790; --tan-dark:#a68f68;
    --cream:#f5efe1; --ink:#3c3524; --tan-accent:${accent};
  }
  *{box-sizing:border-box;}
  html,body{max-width:100%;overflow-x:hidden;}
  body{margin:0;background:var(--cream);color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;line-height:1.7;}
  h1,h2,h3{font-family:'Fraunces',serif;font-weight:400;margin:0;}
  .amp{font-style:italic;font-weight:300;}
  a{color:inherit;}
  .band{width:100%;padding:clamp(46px,8vw,86px) 20px;}
  .band-olive{background:var(--olive);color:var(--cream);}
  .band-olive-dark{background:var(--olive-dark);color:var(--cream);}
  .band-tan{background:var(--tan);color:var(--ink);}
  .wrap{max-width:720px;margin:0 auto;text-align:center;position:relative;}

  .kicker{text-transform:uppercase;letter-spacing:4px;font-size:clamp(.65rem,2vw,.78rem);opacity:.85;margin:0 0 10px;}
  .band-olive .kicker,.band-olive-dark .kicker{color:var(--tan-accent);}
  .band-tan .kicker{color:var(--olive-dark);}

  .monogram{width:clamp(72px,18vw,96px);height:clamp(72px,18vw,96px);border:1px solid var(--tan-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:clamp(1.2rem,4vw,1.6rem);letter-spacing:1px;}

  .cover-wrap{background:var(--cream);padding:clamp(24px,5vw,44px) 20px 0;text-align:center;}
  .cover-photo{width:100%;max-width:520px;height:clamp(240px,44vw,400px);object-fit:cover;border-radius:6px 70px 6px 70px;box-shadow:0 14px 30px rgba(60,53,36,.18);}

  .names{font-size:clamp(2.4rem,7vw,3.8rem);margin:8px 0 4px;}
  .fecha-grande{font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.6rem,5vw,2.4rem);letter-spacing:2px;margin:14px 0 4px;color:var(--tan-accent);}
  .lugar-chico{font-size:.95rem;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin:0 0 18px;}
  .message{font-size:clamp(1rem,2.3vw,1.15rem);max-width:560px;margin:14px auto 0;line-height:1.85;}

  .divider-deco{display:block;margin:22px auto;max-width:100%;height:auto;}
  .branch-deco{display:block;margin:0 auto 14px;max-width:100%;height:auto;opacity:.9;}
  footer .branch-deco{margin:18px auto 0;transform:scaleX(-1);}

  .pill-btn{display:inline-block;border:1px solid currentColor;border-radius:40px;padding:11px 26px;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:18px;transition:background .2s,color .2s;}
  .band-olive .pill-btn:hover,.band-olive-dark .pill-btn:hover{background:var(--cream);color:var(--olive-dark);}
  .band-tan .pill-btn:hover{background:var(--olive-dark);color:var(--cream);border-color:var(--olive-dark);}

  .itinerary{max-width:480px;margin:24px auto 0;text-align:left;}
  .itin-row{display:flex;gap:18px;align-items:baseline;padding:16px 0;border-bottom:1px solid rgba(60,53,36,.18);flex-wrap:wrap;}
  .itin-row:last-child{border-bottom:none;}
  .itin-time{font-family:'Fraunces',serif;font-size:1.1rem;color:var(--olive-dark);flex:0 0 auto;min-width:74px;}
  .itin-row strong{font-family:'Fraunces',serif;font-size:1.05rem;font-weight:500;}
  .itin-row p{margin:2px 0 0;opacity:.85;font-size:.92rem;}

  .countdown{display:flex;gap:clamp(10px,4vw,26px);justify-content:center;flex-wrap:wrap;margin:26px 0 4px;}
  .countdown div{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(245,239,225,.35);border-radius:50%;width:clamp(64px,16vw,88px);height:clamp(64px,16vw,88px);}
  .cd-num{font-family:'Fraunces',serif;font-size:clamp(1.2rem,4vw,1.7rem);}
  .cd-label{font-size:.62rem;text-transform:uppercase;letter-spacing:1px;opacity:.75;}

  .alias-box{display:inline-block;margin-top:14px;border:1px dashed var(--tan-accent);border-radius:10px;padding:10px 20px;font-family:'Fraunces',serif;letter-spacing:.5px;}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;max-width:720px;margin:26px auto 0;padding:0 4px;}
  .gallery img{width:100%;height:clamp(120px,22vw,190px);object-fit:cover;border-radius:6px 34px 6px 34px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.25);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(28,26,17,.94);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:8px;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}

  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:400px;margin:24px auto 0;text-align:left;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--olive-dark);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Jost',sans-serif;padding:11px 12px;border:1px solid var(--tan-dark);border-radius:10px;margin-top:5px;width:100%;background:var(--cream);color:var(--ink);}
  .rsvp-form button{background:var(--olive-dark);color:var(--cream);border:0;padding:13px;border-radius:30px;letter-spacing:1px;text-transform:uppercase;font-size:.82rem;cursor:pointer;transition:background .2s;}
  .rsvp-form button:hover{background:var(--olive);}
  .rsvp-whatsapp{text-align:center;color:var(--olive-dark);font-size:.85rem;text-decoration:underline;}
  .rsvp-status{text-align:center;color:var(--olive-dark);font-weight:500;}

  footer.band{text-align:center;font-size:.85rem;padding-top:60px;padding-bottom:50px;}
  footer .script{font-family:'Fraunces',serif;font-style:italic;font-size:1.6rem;display:block;margin-bottom:10px;color:var(--tan-accent);}
</style></head>
<body>

  <div class="band band-olive">
    <div class="wrap">
      ${branchSVG(120, accent)}
      <div class="monogram">${inicial(d.novia)}<span class="amp">&amp;</span>${inicial(d.novio)}</div>
      <p class="kicker">Nos casamos</p>
    </div>
  </div>

  <div class="cover-wrap">
    <img class="cover-photo" src="${esc(d.coverImage)}" alt="${esc(d.novia)} y ${esc(d.novio)}">
  </div>

  <div class="band band-olive">
    <div class="wrap">
      <p class="kicker">Tenemos el placer de invitarlos a nuestra boda</p>
      <h1 class="names">${esc(d.novia)}<span class="amp"> &amp; </span>${esc(d.novio)}</h1>
      <p class="fecha-grande">${fechaCorta(d.fecha)}</p>
      ${(d.lugarFiesta || d.lugarCeremonia) ? `<p class="lugar-chico">${esc(d.lugarFiesta || d.lugarCeremonia)}</p>` : ""}
      ${d.mensaje ? `${dividerSVG(accent)}
      <p class="message">${esc(d.mensaje)}</p>` : ""}
    </div>
  </div>

  <div class="band band-tan">
    <div class="wrap">
      <p class="kicker">Itinerario</p>
      <h2>¿Cuándo y dónde?</h2>
      <div class="itinerary">
        ${(d.horaCeremonia || d.lugarCeremonia) ? `<div class="itin-row">
          ${d.horaCeremonia ? `<span class="itin-time">${esc(d.horaCeremonia)} hs</span>` : ""}
          <div><strong>Ceremonia</strong>${d.lugarCeremonia ? `<p>${esc(d.lugarCeremonia)}</p>` : ""}</div>
        </div>` : ""}
        ${(d.horaFiesta || d.lugarFiesta) ? `<div class="itin-row">
          ${d.horaFiesta ? `<span class="itin-time">${esc(d.horaFiesta)} hs</span>` : ""}
          <div><strong>Fiesta</strong>${d.lugarFiesta ? `<p>${esc(d.lugarFiesta)}</p>` : ""}</div>
        </div>` : ""}
      </div>
      ${d.direccionMapa ? `<a class="pill-btn" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
    </div>
  </div>

  <div class="band band-olive">
    <div class="wrap">
      <p class="kicker">Cuenta regresiva</p>
      <h2>Falta poco</h2>
      ${cd.html}
    </div>
  </div>

  ${d.dressCode ? `<div class="band band-tan">
    <div class="wrap">
      <p class="kicker">Dress code</p>
      <h2>${esc(d.dressCode)}</h2>
      ${dividerSVG("#4c5535")}
      <p style="max-width:460px;margin:0 auto;opacity:.85;">Vení cómodo, pensá en tonos tierra y calzado apto para arena y jardín.</p>
    </div>
  </div>` : ""}

  ${(d.galeria && d.galeria.length) ? `<div class="band band-olive">
    <div class="wrap">
      <p class="kicker">Recuerdos</p>
      <h2>Galería</h2>
      ${gal.html}
    </div>
  </div>` : ""}

  <div class="band band-tan">
    <div class="wrap">
      <p class="kicker">Por favor confirmá</p>
      <h2>RSVP</h2>
      ${rsvp.html}
    </div>
  </div>

  ${d.alias ? `<div class="band band-olive">
    <div class="wrap">
      <p class="kicker">Mesa de regalos</p>
      <h2>¿Un regalo?</h2>
      <p style="max-width:460px;margin:10px auto 0;opacity:.85;">Lo más lindo para nosotros es contar con ustedes, pero si quieren hacernos un presente, un aporte para nuestra nueva vida juntos nos llena de alegría.</p>
      <div class="alias-box">Alias: ${esc(d.alias)}</div>
    </div>
  </div>` : ""}

  <footer class="band band-olive-dark">
    <span class="script">${esc(d.novia)} &amp; ${esc(d.novio)}</span>
    Con todo nuestro cariño, gracias por ser parte de este día.
    ${branchSVG(110, accent)}
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Boho Naturaleza",
  summary: "Verde oliva y beige tierra, tipografía serif elegante y ramitas de hojas dibujadas a mano — boho natural para bodas al aire libre.",
  accent: "#4c5535", accent2: "#c9b790", schema: bodaSchema, sampleData, render,
};
