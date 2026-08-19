const { esc, countdownWidget, galleryWidget, rsvpWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");

const id = "bau-moderno-minimal";

const sampleData = {
  nombreChico: "Mateo",
  padres: "Florencia y Nahuel",
  padrinos: "Agustina y Bruno",
  fecha: "2027-05-24",
  horaCeremonia: "11:00",
  lugarCeremonia: "Parroquia San Francisco",
  horaFiesta: "13:00",
  lugarFiesta: "Espacio Lumière, Palermo",
  direccionMapa: "https://maps.google.com/?q=Espacio+Lumiere+Palermo",
  mensaje: "Con el corazón lleno de fe y alegría, queremos compartir con ustedes el bautismo de Mateo. Su presencia es el mejor regalo.",
  whatsapp: "5491100000023",
  coverImage: "https://images.unsplash.com/photo-1544213456-93d3d5c3c8de?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cdb1");
  const gal = galleryWidget(d.galeria, "galb1");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<style>
  :root{
    --bg:#faf6f3;
    --card:#ffffff;
    --ink:#3a332f;
    --muted:#8a7e77;
    --line:#ece3dd;
    --accent:#c9a598;
    --accent-soft:#f1e2dc;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;max-width:100%;overflow-x:hidden;}
  body{
    font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
    background:var(--bg);
    color:var(--ink);
    line-height:1.6;
  }
  .wrap{max-width:640px;margin:0 auto;padding:0 24px;}
  a{color:var(--accent);}

  /* HERO */
  .hero{
    position:relative;
    padding:clamp(48px,10vw,88px) 24px clamp(40px,8vw,64px);
    text-align:center;
    overflow:hidden;
  }
  .hero::before{
    content:"";
    position:absolute;
    top:-40%;
    left:50%;
    transform:translateX(-50%);
    width:120vw;
    max-width:900px;
    aspect-ratio:1/1;
    border-radius:50%;
    background:radial-gradient(circle at 50% 40%, var(--accent-soft) 0%, transparent 70%);
    z-index:0;
  }
  .hero-inner{position:relative;z-index:1;}
  .cover{
    width:clamp(140px,32vw,220px);
    height:clamp(140px,32vw,220px);
    margin:0 auto 28px;
    border-radius:50%;
    overflow:hidden;
    border:1px solid var(--line);
    box-shadow:0 18px 40px -18px rgba(60,40,30,.35);
  }
  .cover img{width:100%;height:100%;object-fit:cover;display:block;}
  .eyebrow{
    display:inline-block;
    font-size:.72rem;
    letter-spacing:.28em;
    text-transform:uppercase;
    color:var(--muted);
    margin-bottom:14px;
  }
  h1{
    font-size:clamp(2.1rem,7vw,3.4rem);
    font-weight:300;
    margin:0 0 6px;
    letter-spacing:.01em;
    color:var(--ink);
  }
  h1 strong{font-weight:600;color:var(--accent);}
  .arch-divider{
    width:1px;
    height:44px;
    background:var(--accent);
    margin:22px auto;
    opacity:.55;
  }
  .hero p.mensaje{
    max-width:440px;
    margin:0 auto;
    color:var(--muted);
    font-size:clamp(.95rem,2.4vw,1.05rem);
  }

  section{padding:clamp(40px,7vw,64px) 0;}
  section + section{border-top:1px solid var(--line);}
  .section-title{
    text-align:center;
    font-size:.72rem;
    letter-spacing:.28em;
    text-transform:uppercase;
    color:var(--accent);
    margin:0 0 30px;
  }

  /* COUNTDOWN */
  .countdown{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .countdown > div{
    min-width:76px;
    flex:1 1 76px;
    max-width:100px;
    text-align:center;
    background:var(--card);
    border:1px solid var(--line);
    border-radius:16px;
    padding:16px 8px;
  }
  .cd-num{display:block;font-size:clamp(1.5rem,5vw,2rem);font-weight:600;color:var(--ink);}
  .cd-label{font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}

  /* CRONOGRAMA */
  .timeline{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
  }
  @media (max-width:520px){
    .timeline{grid-template-columns:1fr;}
  }
  .tl-card{
    background:var(--card);
    border:1px solid var(--line);
    border-radius:20px;
    padding:26px 22px;
    text-align:center;
  }
  .tl-icon{
    width:44px;height:44px;margin:0 auto 14px;
    border-radius:50%;
    background:var(--accent-soft);
    display:flex;align-items:center;justify-content:center;
    color:var(--accent);
    font-size:1.2rem;
  }
  .tl-card h3{margin:0 0 4px;font-size:1rem;font-weight:600;letter-spacing:.02em;}
  .tl-time{color:var(--accent);font-weight:600;font-size:1.3rem;display:block;margin:6px 0 4px;}
  .tl-place{color:var(--muted);font-size:.9rem;}
  .map-link{
    display:block;text-align:center;margin-top:22px;font-size:.85rem;
    text-decoration:none;color:var(--accent);letter-spacing:.05em;
  }
  .map-link:hover{text-decoration:underline;}

  /* PADRES / PADRINOS */
  .familia{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
  }
  @media (max-width:520px){
    .familia{grid-template-columns:1fr;}
  }
  .familia-card{
    text-align:center;
    padding:24px 16px;
  }
  .familia-card .tag{
    font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);
    margin-bottom:10px;display:block;
  }
  .familia-card .names{
    font-size:1.15rem;
    font-weight:300;
    color:var(--ink);
  }
  .familia-divider{
    width:36px;height:1px;background:var(--accent);margin:0 auto 12px;opacity:.6;
  }

  /* GALLERY */
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .gallery img{width:100%;height:150px;object-fit:cover;border-radius:14px;cursor:pointer;display:block;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,30,25,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:88%;border-radius:8px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  /* RSVP */
  .rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:420px;margin:0 auto;}
  .rsvp-form label{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:block;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{
    font-family:inherit;
    width:100%;
    margin-top:6px;
    padding:12px 14px;
    border:1px solid var(--line);
    border-radius:12px;
    background:var(--card);
    color:var(--ink);
    font-size:.95rem;
  }
  .rsvp-form textarea{resize:vertical;min-height:70px;}
  .rsvp-form button{
    background:var(--accent);
    color:#fff;
    border:0;
    padding:14px;
    border-radius:999px;
    text-transform:uppercase;
    letter-spacing:.14em;
    font-size:.78rem;
    cursor:pointer;
    margin-top:6px;
    transition:opacity .2s;
  }
  .rsvp-form button:hover{opacity:.88;}
  .rsvp-whatsapp{text-align:center;font-size:.85rem;color:var(--accent);text-decoration:none;}
  .rsvp-whatsapp:hover{text-decoration:underline;}
  .rsvp-status{text-align:center;font-weight:600;color:#5c8a5c;min-height:1.2em;}

  footer{
    text-align:center;
    padding:30px 24px 44px;
    font-size:.78rem;
    color:var(--muted);
  }
  footer .heart{color:var(--accent);}
</style></head>
<body>

  <header class="hero">
    <div class="hero-inner">
      <div class="cover"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div>
      <span class="eyebrow">Bautismo</span>
      <h1><strong>${esc(d.nombreChico)}</strong></h1>
      <div class="arch-divider"></div>
      <p class="mensaje">${esc(d.mensaje)}</p>
    </div>
  </header>

  <section>
    <div class="wrap">
      <p class="section-title">Faltan</p>
      ${cd.html}
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Cronograma</p>
      <div class="timeline">
        <div class="tl-card">
          <div class="tl-icon">✝</div>
          <h3>Ceremonia</h3>
          <span class="tl-time">${esc(d.horaCeremonia)}</span>
          <span class="tl-place">${esc(d.lugarCeremonia)}</span>
        </div>
        <div class="tl-card">
          <div class="tl-icon">✦</div>
          <h3>Celebración</h3>
          <span class="tl-time">${esc(d.horaFiesta)}</span>
          <span class="tl-place">${esc(d.lugarFiesta)}</span>
        </div>
      </div>
      ${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Ver ubicación en el mapa →</a>` : ""}
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Familia</p>
      <div class="familia">
        <div class="familia-card">
          <span class="tag">Papás</span>
          <div class="familia-divider"></div>
          <div class="names">${esc(d.padres)}</div>
        </div>
        <div class="familia-card">
          <span class="tag">Padrinos</span>
          <div class="familia-divider"></div>
          <div class="names">${esc(d.padrinos)}</div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Momentos</p>
      ${gal.html}
    </div>
  </section>

  <section>
    <div class="wrap">
      <p class="section-title">Confirmar asistencia</p>
      ${rsvp.html}
    </div>
  </section>

  <footer>
    Con cariño esperamos celebrar este día junto a ustedes <span class="heart">♥</span>
  </footer>

  <script>
    ${cd.script}${gal.script}${rsvp.script}
  </script>
</body></html>`;
}

module.exports = {
  id, category: "bautismos", name: "Moderno Minimal",
  summary: "Diseño minimalista con paleta suave y formas circulares, elegante y neutro para cualquier bautismo.",
  accent: "#c9a598", schema: bautismoSchema, sampleData, render,
};
