const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bodaSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "boda-elegante-clasica";

const sampleData = {
  novia: "Julieta", novio: "Tomás",
  fecha: "2027-04-17", horaCeremonia: "18:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "20:30", lugarFiesta: "Salón Los Robles, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Robles+San+Isidro",
  mensaje: "Con la bendición de Dios y nuestros padres, los invitamos a compartir el día en que unimos nuestras vidas.",
  dressCode: "Formal / Elegante sport",
  alias: "julieta.tomas.boda",
  whatsapp: "5491100000000",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#c9a86a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd1");
  const gal = galleryWidget(d.galeria, "gal1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp });

  const inicialNovia = (d.novia || "?").trim().charAt(0).toUpperCase();
  const inicialNovio = (d.novio || "?").trim().charAt(0).toUpperCase();

  let fechaLarga = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
        fechaLarga = `${partes[2]} · ${partes[1]} · ${partes[0]} — ${dias[dt.getDay()]}`;
      }
    }
  }

  const laurelLeft = `<svg class="laurel laurel-left" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M55 5C40 20 30 40 28 60C26 80 32 100 45 115" stroke="currentColor" stroke-width="1.4"/>
    <path d="M28 20c-10 2-16 8-18 14M30 38c-11 1-18 6-21 12M30 56c-11 0-19 5-22 11M32 74c-10 0-18 4-21 10M35 92c-9 -1-17 2-20 8" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
  const laurelRight = `<svg class="laurel laurel-right" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 5C20 20 30 40 32 60C34 80 28 100 15 115" stroke="currentColor" stroke-width="1.4"/>
    <path d="M32 20c10 2 16 8 18 14M30 38c11 1 18 6 21 12M30 56c11 0 19 5 22 11M28 74c10 0 18 4 21 10M25 92c9 -1 17 2 20 8" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+Garamond:ital@0;1&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --green-dark:#0f1a15;
    --green:#152621;
    --green-2:#1c332a;
    --gold:${accent};
    --gold-light:color-mix(in srgb, ${accent}, white 40%);
    --cream:#f7f1e2;
    --cream-2:#efe6cf;
    --ink:#2a2620;
  }
  *{box-sizing:border-box;}
  html{-webkit-text-size-adjust:100%;}
  body{margin:0;font-family:'Jost',sans-serif;background:var(--cream);color:var(--ink);overflow-x:hidden;}
  h1,h2,h3{font-family:'Playfair Display',serif;font-weight:400;}
  .eyebrow,.tl-time,.cd-label,.dresscode span,.on-dark .sub,footer .alias-label{
    text-transform:uppercase;letter-spacing:3px;font-size:.72rem;
  }

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    min-height:100vh;
    padding:56px 20px 70px;
    display:flex;align-items:center;justify-content:center;text-align:center;
    background:
      radial-gradient(circle at 18% 8%, rgba(255,255,255,.05), transparent 42%),
      radial-gradient(circle at 85% 92%, rgba(255,255,255,.05), transparent 45%),
      radial-gradient(circle at 60% 40%, color-mix(in srgb, ${accent} 6%, transparent), transparent 55%),
      linear-gradient(160deg, #16241d 0%, #0d1611 55%, #1a2b22 100%);
    color:var(--cream);
    overflow:hidden;
  }
  .hero::before{
    content:"";position:absolute;inset:0;
    background:
      linear-gradient(115deg, transparent 40%, rgba(255,255,255,.035) 42%, transparent 44%),
      linear-gradient(65deg, transparent 60%, rgba(255,255,255,.03) 62%, transparent 64%);
    pointer-events:none;
  }
  .hero::after{
    content:"";position:absolute;inset:14px;
    border:1px solid color-mix(in srgb, ${accent} 55%, transparent);
    pointer-events:none;
  }
  .hero-content{position:relative;z-index:1;max-width:520px;}
  .monogram{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:22px;}
  .laurel{width:26px;height:52px;color:var(--gold);}
  @media(min-width:480px){.laurel{width:34px;height:68px;}}
  .monogram-circle{
    width:76px;height:76px;border-radius:50%;
    border:1px solid var(--gold);
    display:flex;align-items:center;justify-content:center;
    font-family:'Playfair Display',serif;font-size:1.15rem;letter-spacing:2px;color:var(--gold-light);
    flex-shrink:0;
  }
  @media(min-width:480px){.monogram-circle{width:92px;height:92px;font-size:1.35rem;}}
  .monogram-circle .amp-small{color:var(--gold);margin:0 4px;font-style:italic;font-size:.9em;}
  .eyebrow{color:var(--gold-light);margin:0 0 14px;}
  .hero-content h1{
    margin:0;
    font-size:clamp(2.3rem,9vw,3.6rem);
    line-height:1.15;
    color:#fdfaf3;
    letter-spacing:1px;
  }
  .hero-content h1 .amp{
    display:block;
    font-family:'Cormorant Garamond',serif;font-style:italic;
    color:var(--gold);
    font-size:.55em;
    margin:2px 0;
  }
  .thin-divider{width:70px;height:1px;background:var(--gold);margin:26px auto;position:relative;}
  .thin-divider::before{content:"◆";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.5rem;color:var(--gold);background:transparent;}
  .date-line{margin:0;color:var(--gold-light);letter-spacing:3px;font-size:.85rem;text-transform:uppercase;}

  /* ---------- SECTIONS (cream) ---------- */
  section{max-width:720px;margin:0 auto;padding:64px 22px;text-align:center;}
  .ornament{color:var(--gold);font-size:1.3rem;margin-bottom:10px;letter-spacing:6px;}
  h2{
    letter-spacing:3px;text-transform:uppercase;
    font-size:clamp(1.1rem,4vw,1.5rem);
    color:var(--green);
    margin:0 0 8px;
  }
  .divider-gold{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:22px auto;}

  .message{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.35rem;line-height:1.8;color:var(--green-2);margin:0;}

  /* ---------- COUNTDOWN (widget) ---------- */
  .countdown{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:28px 0 4px;}
  .countdown div{
    display:flex;flex-direction:column;align-items:center;
    background:var(--green);
    color:var(--cream);
    min-width:68px;padding:16px 10px;
    border:1px solid var(--gold);
  }
  @media(min-width:480px){.countdown div{min-width:82px;padding:20px 14px;}}
  .cd-num{font-family:'Playfair Display',serif;font-size:1.8rem;color:var(--gold-light);line-height:1;}
  .cd-label{color:var(--gold);margin-top:8px;font-size:.62rem;}

  /* ---------- TIMELINE ---------- */
  .timeline{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;margin-top:34px;}
  .tl-card{
    background:#fff;
    border:1px solid var(--cream-2);
    border-top:2px solid var(--gold);
    padding:30px 26px;min-width:220px;flex:1 1 220px;max-width:280px;
    box-shadow:0 10px 24px rgba(21,38,33,.06);
  }
  .tl-icon{
    width:46px;height:46px;border-radius:50%;
    background:var(--green);color:var(--gold-light);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 14px;font-size:1.2rem;
  }
  .tl-card h3{margin:0 0 10px;color:var(--green);font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;}
  .tl-time{color:var(--gold);font-weight:500;letter-spacing:2px;margin:0 0 6px;}
  .tl-place{margin:0;color:#5b5344;font-size:.92rem;line-height:1.5;}
  .map-link{display:inline-block;margin-top:26px;color:var(--green);text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px;font-size:.9rem;letter-spacing:1px;}
  .map-link:hover{color:var(--gold);}
  .dresscode{
    margin-top:34px;display:inline-flex;flex-direction:column;gap:4px;
    border:1px solid var(--gold);padding:14px 30px;
  }
  .dresscode span{color:var(--gold);}
  .dresscode strong{font-family:'Playfair Display',serif;font-weight:400;font-size:1.1rem;color:var(--green);}

  /* ---------- DARK SECTIONS (gallery / rsvp) ---------- */
  .dark{
    max-width:none;
    background:
      radial-gradient(circle at 15% 15%, rgba(255,255,255,.04), transparent 40%),
      radial-gradient(circle at 90% 85%, rgba(255,255,255,.04), transparent 42%),
      linear-gradient(160deg,#16241d,#0f1913 55%,#1a2b22);
    color:var(--cream);
    padding:64px 22px;
  }
  .dark > *{max-width:720px;margin-left:auto;margin-right:auto;}
  .dark h2.on-dark{color:#fdfaf3;}
  .on-dark.sub{color:var(--gold-light);font-size:.85rem;letter-spacing:2px;margin:0 0 30px;text-transform:uppercase;}

  /* ---------- GALLERY (widget) ---------- */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:10px;}
  .gallery-item{border:1px solid color-mix(in srgb, ${accent} 40%, transparent);overflow:hidden;}
  .gallery img{width:100%;height:150px;object-fit:cover;display:block;cursor:pointer;filter:saturate(.95);transition:transform .4s ease;}
  .gallery img:hover{transform:scale(1.05);}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(9,15,12,.94);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border:1px solid var(--gold);}
  .lightbox-close{position:absolute;top:18px;right:24px;color:var(--gold-light);font-size:2rem;cursor:pointer;line-height:1;}

  /* ---------- RSVP (widget) ---------- */
  .rsvp-form{display:flex;flex-direction:column;gap:16px;max-width:400px;margin:0 auto;text-align:left;}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold-light);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:'Jost',sans-serif;font-size:.95rem;
    background:rgba(247,241,226,.06);
    color:var(--cream);
    padding:11px 12px;border:1px solid color-mix(in srgb, ${accent} 50%, transparent);
    width:100%;
  }
  .rsvp-form input::placeholder,.rsvp-form textarea::placeholder{color:rgba(247,241,226,.45);}
  .rsvp-form select option{color:#000;}
  .rsvp-form button{
    background:transparent;color:var(--gold-light);
    border:1px solid var(--gold);padding:13px;
    letter-spacing:3px;text-transform:uppercase;font-size:.78rem;
    cursor:pointer;transition:background .25s, color .25s;
  }
  .rsvp-form button:hover{background:var(--gold);color:var(--green-dark);}
  .rsvp-whatsapp{font-size:.82rem;color:var(--gold);text-align:center;text-decoration:none;letter-spacing:1px;}
  .rsvp-whatsapp:hover{color:var(--gold-light);}
  .rsvp-status{text-align:center;color:var(--gold-light);font-weight:500;letter-spacing:1px;}

  /* ---------- FOOTER ---------- */
  footer{
    text-align:center;padding:50px 22px 60px;
    background:var(--green-dark);color:var(--gold-light);
  }
  footer .monogram-mini{
    width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);
    display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
    font-family:'Playfair Display',serif;font-size:.85rem;letter-spacing:1px;color:var(--gold-light);
  }
  footer .thanks{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;color:#fdfaf3;margin:0 0 10px;}
  footer .alias-label{color:var(--gold);}
  footer .alias-value{font-family:'Playfair Display',serif;letter-spacing:1px;color:#fdfaf3;}
</style></head>
<body>

  <div class="hero">
    <div class="hero-content">
      <div class="monogram">
        ${laurelLeft}
        <div class="monogram-circle">${esc(inicialNovia)}<span class="amp-small">&amp;</span>${esc(inicialNovio)}</div>
        ${laurelRight}
      </div>
      <p class="eyebrow">Nos casamos</p>
      <h1>${esc(d.novia)}<span class="amp">&amp;</span>${esc(d.novio)}</h1>
      <div class="thin-divider"></div>
      <p class="date-line">${fechaLarga ? esc(fechaLarga) : esc(d.fecha)}</p>
    </div>
  </div>

  <section>
    <div class="ornament">&#10087;</div>
    <h2>Falta muy poco</h2>
    ${cd.html}
  </section>

  <section>
    <div class="divider-gold"></div>
    <p class="message">&ldquo;${esc(d.mensaje)}&rdquo;</p>
    <div class="divider-gold"></div>
  </section>

  <section>
    <h2>El gran día</h2>
    <div class="divider-gold"></div>
    <div class="timeline">
      <div class="tl-card">
        <div class="tl-icon">&#128141;</div>
        <h3>Ceremonia</h3>
        <p class="tl-time">${esc(d.horaCeremonia)}</p>
        <p class="tl-place">${esc(d.lugarCeremonia)}</p>
      </div>
      <div class="tl-card">
        <div class="tl-icon">&#127866;</div>
        <h3>Fiesta</h3>
        <p class="tl-time">${esc(d.horaFiesta)}</p>
        <p class="tl-place">${esc(d.lugarFiesta)}</p>
      </div>
    </div>
    ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa &rarr;</a>` : ""}
    <div class="dresscode"><span>Dress code</span><strong>${esc(d.dressCode)}</strong></div>
  </section>

  <section class="dark">
    <h2 class="on-dark">Momentos</h2>
    <div class="divider-gold"></div>
    ${gal.html}
  </section>

  <section class="dark">
    <h2 class="on-dark">RSVP</h2>
    <p class="on-dark sub">Confirmá tu asistencia antes de la fecha</p>
    ${rsvp.html}
  </section>

  <footer>
    <div class="monogram-mini">${esc(inicialNovia)}&amp;${esc(inicialNovio)}</div>
    <p class="thanks">Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    <p><span class="alias-label">Alias para regalo&nbsp;</span><span class="alias-value">${esc(d.alias)}</span></p>
  </footer>

  <script>${cd.script}${gal.script}${rsvp.script}</script>
</body></html>`;
}

module.exports = {
  id, category: "bodas", name: "Elegante Clásica",
  summary: "Verde mármol nocturno y dorado, monograma de iniciales y ornamentos de laurel — una boda clásica y sofisticada.",
  accent: "#c9a86a", accent2: "#152621", schema: bodaSchema, sampleData, render,
};
