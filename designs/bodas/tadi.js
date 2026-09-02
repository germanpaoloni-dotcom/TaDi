// "TaDi" — Bodas — "Romance Dorado". Versión con identidad propia dentro
// del sistema de marca TaDi (isotipo, aurora animada, neomorfismo): fondo
// champagne + blush de punta a punta (no solo en el header), foto de
// portada en marco tipo camafeo, pétalos flotando y brillo real en el
// título — pensada para que se sienta cálida/romántica, no una versión
// "fría" con el mismo esqueleto que las demás categorías.
const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { tadiCardPreview, getPaletteColor } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { bodaSchema } = require("../schemas");

const id = "boda-tadi";
const ACCENT = "#c9a24a";
const ACCENT2 = "#a9832f";

const sampleData = {
  novia: "Julieta", novio: "Tomás",
  fecha: "2027-04-17", horaCeremonia: "18:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "20:30", lugarFiesta: "Salón Los Robles, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Robles+San+Isidro",
  mensaje: "Con la bendición de Dios y nuestros padres, los invitamos a compartir el día en que unimos nuestras vidas.",
  dressCode: "Formal / Elegante sport",
  alias: "julieta.tomas.boda",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-03-20",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=75",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent2 = getPaletteColor(d.colorPalette, "light", ACCENT2);
  let fechaNum = "", fechaDia = "";
  if (d.fecha) {
    const partes = String(d.fecha).split("-");
    if (partes.length === 3) {
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      if (!isNaN(dt.getTime())) {
        const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
        fechaNum = `${partes[2]} · ${partes[1]} · ${partes[0]}`;
        fechaDia = dias[dt.getDay()];
      }
    }
  }
  const iN = (d.novia || "?").trim().charAt(0).toUpperCase();
  const iO = (d.novio || "?").trim().charAt(0).toUpperCase();

  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha, "cd1");
  const gal = (d.galeria && d.galeria.length) ? galleryWidget(d.galeria, "gal1") : null;
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "bodas", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const eventCards = [];
  if (d.horaCeremonia || d.lugarCeremonia) eventCards.push({ label: "Ceremonia", time: d.horaCeremonia, place: d.lugarCeremonia });
  if (d.horaFiesta || d.lugarFiesta) eventCards.push({ label: "Fiesta", time: d.horaFiesta, place: d.lugarFiesta });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.novia)} &amp; ${esc(d.novio)} · TaDi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500&family=Alex+Brush&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#3a2a24; --muted:#8a6f5c;
    --accent:${ACCENT}; --accent-2:${accent2};
    --sh-dark:#e0c9ae; --sh-light:#fffdf6;
    --nu-xs:3px 3px 7px var(--sh-dark),-3px -3px 7px var(--sh-light);
    --nu-sm:5px 5px 12px var(--sh-dark),-5px -5px 12px var(--sh-light);
    --nu-md:8px 8px 18px var(--sh-dark),-8px -8px 18px var(--sh-light);
    --nu-inset-sm:inset 2px 2px 5px var(--sh-dark),inset -2px -2px 5px var(--sh-light);
    --panel:#fbf3ea;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;color:var(--ink);overflow-x:hidden;
    background:linear-gradient(170deg,#fbf1e8 0%,#f5dfd4 30%,#f6e6c8 65%,#faeed8 100%);
    background-attachment:fixed;
  }
  h1,h2{font-family:'Playfair Display',serif;font-weight:600;margin:0;}

  .hero{position:relative;overflow:hidden;padding:38px 22px 50px;text-align:center;}
  .aurora{position:absolute;inset:-30% -10% -10% -10%;z-index:0;pointer-events:none;filter:blur(36px);
    background:
      radial-gradient(circle at 18% 15%, rgba(201,162,74,.38), transparent 55%),
      radial-gradient(circle at 85% 18%, rgba(224,140,140,.32), transparent 52%),
      radial-gradient(circle at 55% 72%, rgba(240,217,160,.35), transparent 58%),
      radial-gradient(circle at 10% 75%, rgba(214,140,170,.28), transparent 50%);
    animation:tadiAurora 22s ease-in-out infinite;
  }
  @keyframes tadiAurora{0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}33%{transform:translate(1.5%,-2%) rotate(4deg) scale(1.04);}66%{transform:translate(-2%,1.5%) rotate(-3deg) scale(1.02);}}
  .ring-halo{position:absolute;z-index:0;width:170px;top:2px;left:50%;transform:translateX(-50%);opacity:.4;}
  .petal{position:absolute;z-index:1;animation:petalDrift 9s ease-in-out infinite;}
  @keyframes petalDrift{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-16px) rotate(14deg);}}

  .tadi-pill{position:relative;z-index:3;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:6px 16px;box-shadow:0 3px 10px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.8);font-weight:800;font-size:.85rem;margin-bottom:12px;font-family:Arial,Helvetica,sans-serif;}
  .tadi-pill .ta{color:#33363f;}
  .tadi-pill .di{color:#e8672e;}

  .script{position:relative;z-index:3;font-family:'Alex Brush',cursive;font-size:1.8rem;color:#c96a6a;margin:0 0 2px;line-height:1;}
  .ghost{position:relative;z-index:3;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--accent-2);margin-bottom:18px;}

  .photo-frame{position:relative;z-index:3;width:120px;height:120px;margin:0 auto 20px;border-radius:50%;padding:5px;background:linear-gradient(135deg,#e8c98a,var(--accent) 40%,#e0a8a8 75%,#e8c98a);box-shadow:var(--nu-md);}
  .photo-frame img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;border:3px solid #fff;}
  .photo-frame.noimg{display:flex;align-items:center;justify-content:center;}
  .photo-frame.noimg .initials{width:100%;height:100%;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--accent-2);border:3px solid #fff;}

  .hero h1{position:relative;z-index:3;font-size:clamp(2rem,8vw,3rem);line-height:1.15;color:var(--ink);}
  .hero h1 .shine{font-style:italic;background-image:linear-gradient(100deg,var(--accent-2) 25%,#f6e6b8 45%,var(--accent) 55%,var(--accent-2) 75%);background-size:280% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:shine 6s ease-in-out infinite;}
  @keyframes shine{0%,100%{background-position:-60% 0;}50%{background-position:160% 0;}}
  .dateline{position:relative;z-index:3;margin:16px 0 0;letter-spacing:2.5px;text-transform:uppercase;font-size:.8rem;color:var(--muted);font-weight:600;}
  .dayline{position:relative;z-index:3;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--muted);opacity:.85;}

  .divider{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:10px;margin:20px auto 0;width:140px;}
  .divider .ln{flex:1;height:1px;background:linear-gradient(90deg,transparent,#c96a6a,transparent);}

  .countdown{position:relative;z-index:3;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:26px 0 0;}
  .countdown div{display:flex;flex-direction:column;align-items:center;background:var(--panel);border-radius:16px;box-shadow:var(--nu-inset-sm);min-width:60px;padding:13px 8px;}
  .cd-num{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--accent-2);line-height:1;}
  .cd-label{margin-top:5px;font-size:.56rem;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);}

  section{max-width:640px;margin:0 auto;padding:46px 22px;text-align:center;}
  .eyebrow-sm{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:0 0 4px;}
  h2{font-size:1.5rem;color:var(--ink);margin-bottom:8px;}

  .message-card{background:var(--panel);border-radius:24px;box-shadow:var(--nu-sm);padding:32px 26px;border:1px solid rgba(201,106,106,.16);}
  .message-card p{font-family:'Playfair Display',serif;font-style:italic;font-size:1.15rem;line-height:1.7;color:var(--ink);margin:0;}

  .timeline{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .tl-card{background:var(--panel);border-radius:20px;box-shadow:var(--nu-sm);padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:260px;border:1px solid rgba(201,106,106,.12);}
  .tl-icon{width:44px;height:44px;border-radius:50%;background:var(--panel);box-shadow:var(--nu-inset-sm);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--accent-2);}
  .tl-card h3{margin:0 0 6px;font-size:.92rem;letter-spacing:1.3px;text-transform:uppercase;color:var(--ink);font-family:'Helvetica Neue',sans-serif;font-weight:700;}
  .tl-time{color:var(--accent-2);font-weight:700;margin:0 0 4px;font-size:.86rem;}
  .tl-place{margin:0;color:var(--muted);font-size:.84rem;line-height:1.5;}

  .chip-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .chip{background:var(--panel);box-shadow:var(--nu-xs);border-radius:20px;padding:9px 18px;font-size:.78rem;color:var(--muted);text-decoration:none;display:inline-block;}
  .chip b{color:var(--ink);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:8px;}
  .gallery-item{border-radius:16px;overflow:hidden;box-shadow:var(--nu-inset-sm);}
  .gallery img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(30,18,12,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-card{background:var(--panel);border-radius:24px;box-shadow:var(--nu-sm);padding:32px 26px;text-align:left;border:1px solid rgba(201,106,106,.16);}
  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:1.3px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px 14px;border:0;border-radius:14px;background:#fbf1e8;box-shadow:var(--nu-inset-sm);font-size:.92rem;color:var(--ink);}
  .rsvp-form button{width:100%;padding:14px;border:0;border-radius:20px;background:linear-gradient(120deg,var(--accent),#c96a6a);color:#fff;font-weight:700;letter-spacing:.5px;box-shadow:var(--nu-sm);cursor:pointer;font-size:.9rem;}
  .rsvp-status{grid-column:1/-1;text-align:center;color:var(--muted);font-weight:600;}

  footer{text-align:center;padding:46px 22px 56px;}
  .footer-mono{width:56px;height:56px;border-radius:50%;background:var(--panel);box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:'Playfair Display',serif;color:var(--accent-2);font-size:1rem;}
  footer p{font-family:'Playfair Display',serif;font-style:italic;color:var(--ink);font-size:1.05rem;margin:0;}
  footer .alias-row{margin-top:12px;font-size:.8rem;color:var(--muted);}
  footer .alias-row b{color:var(--ink);}

  @media (prefers-reduced-motion: reduce){ .aurora,.petal{animation:none !important;} .shine{animation:none !important;} }
</style></head>
<body>

  <div class="hero">
    <div class="aurora"></div>
    <svg class="ring-halo" viewBox="0 0 24 24" fill="none" stroke="${ACCENT}" stroke-width="0.5"><circle cx="9" cy="14" r="7.5"/><circle cx="15" cy="14" r="7.5"/></svg>
    <svg class="petal" style="top:20px;left:12%;width:16px;" viewBox="0 0 24 24" fill="#d68ca0"><path d="M12 2c5 4 5 10 0 20-5-10-5-16 0-20Z"/></svg>
    <svg class="petal" style="top:60px;right:10%;width:12px;animation-delay:-3s;" viewBox="0 0 24 24" fill="#e0a8a8"><path d="M12 2c5 4 5 10 0 20-5-10-5-16 0-20Z"/></svg>
    <svg class="petal" style="top:110px;left:8%;width:10px;animation-delay:-5.5s;" viewBox="0 0 24 24" fill="${ACCENT}"><path d="M12 2c5 4 5 10 0 20-5-10-5-16 0-20Z"/></svg>

    <div class="tadi-pill"><span class="ta">Ta</span><span class="di">Di</span></div>
    <p class="script">Nos casamos</p>
    <div class="ghost">Para siempre</div>
    ${d.coverImage
      ? `<div class="photo-frame"><img src="${esc(d.coverImage)}" alt=""></div>`
      : `<div class="photo-frame noimg"><div class="initials">${esc(iN)}&amp;${esc(iO)}</div></div>`}
    <h1>${esc(d.novia)} <span class="shine">&amp;</span> ${esc(d.novio)}</h1>
    <p class="dateline">${fechaNum ? esc(fechaNum) : esc(d.fecha)}</p>
    ${fechaDia ? `<p class="dayline">${esc(fechaDia)}</p>` : ""}
    <div class="divider"><span class="ln"></span><svg width="8" height="8" viewBox="0 0 10 10"><path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#c96a6a"/></svg><span class="ln"></span></div>
    ${cd.html}
  </div>

  ${d.mensaje ? `<section>
    <p class="eyebrow-sm">Con la bendición de Dios</p>
    <div class="message-card"><p>&ldquo;${esc(d.mensaje)}&rdquo;</p></div>
  </section>` : ""}

  ${eventCards.length ? `<section>
    <p class="eyebrow-sm">El gran día</p>
    <h2>Nos vemos ahí</h2>
    <div class="divider" style="margin-bottom:8px;"></div>
    <div class="timeline">
      ${eventCards.map((c) => `<div class="tl-card">
        <div class="tl-icon">${icons.rings}</div>
        <h3>${esc(c.label)}</h3>
        ${c.time ? `<p class="tl-time">${esc(c.time)}</p>` : ""}
        ${c.place ? `<p class="tl-place">${esc(c.place)}</p>` : ""}
      </div>`).join("")}
    </div>
    ${(d.dressCode || d.direccionMapa) ? `<div class="chip-row">
      ${d.dressCode ? `<div class="chip">Dress code <b>${esc(d.dressCode)}</b></div>` : ""}
      ${d.direccionMapa ? `<a class="chip" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">📍 Ver ubicación</a>` : ""}
    </div>` : ""}
  </section>` : ""}

  ${gal ? `<section>
    <p class="eyebrow-sm">Momentos</p>
    <h2>Galería</h2>
    <div class="divider" style="margin-bottom:8px;"></div>
    ${gal.html}
  </section>` : ""}

  <section>
    <p class="eyebrow-sm">RSVP</p>
    <h2>Confirmá tu asistencia</h2>
    ${rsvpDeadline ? `<p class="eyebrow-sm" style="color:var(--accent-2);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="divider" style="margin-bottom:20px;"></div>
    <div class="rsvp-card">${rsvp.html}</div>
  </section>

  <footer>
    <div class="footer-mono">${esc(iN)}&amp;${esc(iO)}</div>
    <p>Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}</p>
    ${d.alias ? `<p class="alias-row"><span>Alias para regalo&nbsp;</span><b>${esc(d.alias)}</b></p>` : ""}
  </footer>

  <script>${cd.script}${gal ? gal.script : ""}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: "#c9a24a", auroraB: "#e0a8a8", ghost: "Para siempre",
    group: "elegante", iconSvg: icons.rings, catLabel: "Bodas",
    darkFrom: "#8a6a3a", darkTo: "#2a2416",
  });
}

module.exports = {
  id, category: "bodas", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: fondo champagne y blush de punta a punta, foto de portada en marco dorado y pétalos flotando — bodas.",
  accent: ACCENT, accent2: "#2a2416", schema: bodaSchema, sampleData, render, cardPreview,
};
