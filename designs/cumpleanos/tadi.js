// "TaDi" — Cumpleaños — "Noche de Gala". Versión con identidad propia
// dentro del sistema de marca TaDi (isotipo, aurora animada, neomorfismo):
// mismo lenguaje visual que Halloween/Navidad — fondo oscuro ciruela/vino
// de punta a punta (no solo en el header), guirnalda de luces animada en
// el hero, dorado con resplandor real en el título y la cuenta regresiva —
// pensada para sentirse una fiesta de gala premium, no una versión "fría"
// con el mismo esqueleto que las demás categorías.
const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { tadiCardPreview, getPaletteColor } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { cumpleanosSchema } = require("../schemas");

const id = "cum-tadi";
const ACCENT = "#f2b84b";
const ACCENT2 = "#e37fa0";

const sampleData = {
  nombre: "Fede", edad: "40",
  fecha: "2027-05-08", hora: "21:00", lugar: "Terraza Palermo",
  direccionMapa: "https://maps.google.com/?q=Terraza+Palermo",
  mensaje: "Después de tantos años, hay que festejarlo como corresponde. ¡Los espero para brindar!",
  dressCode: "Casual elegante",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-05-01",
  coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    "https://images.unsplash.com/photo-1470753937643-efeb931202a9?w=800&q=80",
    "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800&q=80",
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
  const inicial = (d.nombre || "?").trim().charAt(0).toUpperCase();

  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "21:00"}:00` : sampleData.fecha, "cd1");
  const gal = (d.galeria && d.galeria.length) ? galleryWidget(d.galeria, "gal1") : null;
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "cumpleanos", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumpleaños de ${esc(d.nombre)} · TaDi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#fbeef7; --muted:#d9b8cd;
    --accent:${ACCENT}; --accent-2:${accent2};
    --sh-dark:#170a13; --sh-light:#5c3450;
    --nu-xs:3px 3px 7px var(--sh-dark),-3px -3px 7px var(--sh-light);
    --nu-sm:6px 6px 14px var(--sh-dark),-6px -6px 14px var(--sh-light);
    --nu-md:8px 8px 18px var(--sh-dark),-8px -8px 18px var(--sh-light);
    --nu-inset-sm:inset 3px 3px 7px var(--sh-dark),inset -3px -3px 7px var(--sh-light);
    --panel:#46243d;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;color:var(--ink);overflow-x:hidden;
    background:linear-gradient(180deg,#3a1830 0%,#26101f 45%,#170a13 100%);
    background-attachment:fixed;
  }
  h1,h2{font-family:'Baloo 2',sans-serif;font-weight:700;margin:0;}

  .hero{position:relative;overflow:hidden;padding:38px 22px 50px;text-align:center;}
  .aurora{position:absolute;inset:-30% -10% -10% -10%;z-index:0;pointer-events:none;filter:blur(36px);
    background:
      radial-gradient(circle at 20% 20%, rgba(242,184,75,.35), transparent 55%),
      radial-gradient(circle at 85% 15%, rgba(227,127,160,.3), transparent 52%),
      radial-gradient(circle at 55% 70%, rgba(90,40,75,.5), transparent 58%);
    animation:tadiAurora 22s ease-in-out infinite;
  }
  @keyframes tadiAurora{0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}33%{transform:translate(1.5%,-2%) rotate(4deg) scale(1.04);}66%{transform:translate(-2%,1.5%) rotate(-3deg) scale(1.02);}}
  .lightstrand{position:absolute;top:0;left:0;width:100%;z-index:1;}
  .bulb{animation:blink 2.4s ease-in-out infinite;}
  @keyframes blink{0%,100%{opacity:.5;}50%{opacity:1;}}
  .glint{position:absolute;z-index:1;animation:tw 2.6s ease-in-out infinite;}
  @keyframes tw{0%,100%{opacity:.2;transform:scale(.8);}50%{opacity:.85;transform:scale(1.1);}}

  .tadi-pill{position:relative;z-index:3;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:6px 16px;box-shadow:0 3px 10px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.8);font-weight:800;font-size:.85rem;margin:16px 0 12px;font-family:Arial,Helvetica,sans-serif;}
  .tadi-pill .ta{color:#33363f;}
  .tadi-pill .di{color:#e8672e;}

  .ghost{position:relative;z-index:3;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--accent);margin-bottom:8px;}

  .mono{position:relative;z-index:3;width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:var(--panel);box-shadow:var(--nu-sm);display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-size:1.7rem;font-weight:700;color:var(--accent);}

  .hero h1{position:relative;z-index:3;font-size:clamp(2rem,8vw,3rem);line-height:1.15;color:var(--ink);}
  .hero h1 em{font-style:normal;color:var(--accent);text-shadow:0 0 18px rgba(242,184,75,.5);}
  .dateline{position:relative;z-index:3;margin:14px 0 0;letter-spacing:2.5px;text-transform:uppercase;font-size:.8rem;color:var(--muted);font-weight:600;}
  .dayline{position:relative;z-index:3;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--muted);opacity:.85;}

  .divider{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:10px;margin:20px auto 0;width:140px;}
  .divider .ln{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);}

  .countdown{position:relative;z-index:3;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:22px 0 0;}
  .countdown div{display:flex;flex-direction:column;align-items:center;background:var(--panel);border-radius:16px;box-shadow:var(--nu-inset-sm);min-width:56px;padding:12px 6px;}
  .cd-num{font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.2rem;color:var(--accent);line-height:1;text-shadow:0 0 10px rgba(242,184,75,.4);}
  .cd-label{margin-top:4px;font-size:.54rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-family:'Helvetica Neue',sans-serif;font-weight:600;}

  section{max-width:640px;margin:0 auto;padding:46px 22px;text-align:center;}
  .eyebrow-sm{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:0 0 4px;}
  h2{font-size:1.5rem;color:var(--ink);margin-bottom:8px;}

  .message-card{background:var(--panel);border-radius:26px;box-shadow:var(--nu-sm);padding:32px 26px;}
  .message-card p{font-family:'Baloo 2',sans-serif;font-weight:600;font-size:1.05rem;line-height:1.6;color:var(--ink);margin:0;}

  .timeline{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .tl-card{background:var(--panel);border-radius:22px;box-shadow:var(--nu-sm);padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:260px;}
  .tl-icon{width:44px;height:44px;border-radius:50%;background:var(--panel);box-shadow:var(--nu-inset-sm);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--accent);}
  .tl-card h3{margin:0 0 6px;font-size:.92rem;letter-spacing:1px;text-transform:uppercase;color:var(--ink);font-family:'Baloo 2',sans-serif;font-weight:700;}
  .tl-time{color:var(--accent);font-weight:700;margin:0 0 4px;font-size:.86rem;}
  .tl-place{margin:0;color:var(--muted);font-size:.84rem;line-height:1.5;}

  .chip-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .chip{background:var(--panel);box-shadow:var(--nu-xs);border-radius:20px;padding:9px 18px;font-size:.78rem;color:var(--muted);text-decoration:none;display:inline-block;}
  .chip b{color:var(--ink);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:8px;}
  .gallery-item{border-radius:16px;overflow:hidden;box-shadow:var(--nu-inset-sm);}
  .gallery img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(10,4,8,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-card{background:var(--panel);border-radius:26px;box-shadow:var(--nu-sm);padding:32px 26px;text-align:left;}
  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:1.3px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Helvetica Neue',sans-serif;padding:12px 14px;border:0;border-radius:14px;background:#3a1e33;box-shadow:var(--nu-inset-sm);font-size:.92rem;color:var(--ink);}
  .rsvp-form button{width:100%;padding:14px;border:0;border-radius:20px;background:linear-gradient(120deg,var(--accent),var(--accent-2));color:#2a1424;font-weight:700;letter-spacing:.5px;box-shadow:0 6px 20px rgba(242,184,75,.35);cursor:pointer;font-size:.9rem;}
  .rsvp-status{grid-column:1/-1;text-align:center;color:var(--muted);font-weight:600;}

  footer{text-align:center;padding:46px 22px 56px;}
  .footer-mono{width:56px;height:56px;border-radius:50%;background:var(--panel);box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--accent);font-size:1.1rem;}
  footer p{font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--ink);font-size:1.1rem;margin:0;}

  @media (prefers-reduced-motion: reduce){ .aurora,.bulb,.glint{animation:none !important;} }
</style></head>
<body>

  <div class="hero">
    <div class="aurora"></div>
    <svg class="lightstrand" viewBox="0 0 400 60" preserveAspectRatio="none">
      <path d="M0 6 Q100 40 200 6 T400 6" stroke="#f2b84b" stroke-width="1" fill="none" opacity=".35"/>
      <circle class="bulb" cx="40" cy="16" r="5" fill="#f2b84b"/>
      <circle class="bulb" cx="90" cy="30" r="5" fill="#e37fa0" style="animation-delay:-.4s"/>
      <circle class="bulb" cx="140" cy="34" r="5" fill="#f2b84b" style="animation-delay:-.8s"/>
      <circle class="bulb" cx="190" cy="26" r="5" fill="#e37fa0" style="animation-delay:-1.2s"/>
      <circle class="bulb" cx="240" cy="16" r="5" fill="#f2b84b" style="animation-delay:-1.6s"/>
      <circle class="bulb" cx="290" cy="10" r="5" fill="#e37fa0" style="animation-delay:-2s"/>
      <circle class="bulb" cx="340" cy="16" r="5" fill="#f2b84b" style="animation-delay:-2.4s"/>
    </svg>
    <svg class="glint" style="top:100px;left:14%;width:10px;" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8Z"/></svg>
    <svg class="glint" style="top:130px;right:16%;width:8px;animation-delay:-1.3s;" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8Z"/></svg>

    <div class="tadi-pill"><span class="ta">Ta</span><span class="di">Di</span></div>
    <div class="ghost">A celebrar</div>
    <div class="mono">${esc(inicial)}</div>
    <h1>${d.edad ? `${esc(d.nombre)} <em>cumple ${esc(d.edad)}</em>` : esc(d.nombre)}</h1>
    <p class="dateline">${fechaNum ? esc(fechaNum) : esc(d.fecha)}</p>
    ${fechaDia ? `<p class="dayline">${esc(fechaDia)}</p>` : ""}
    <div class="divider"><span class="ln"></span><svg width="8" height="8" viewBox="0 0 10 10"><path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#f2b84b"/></svg><span class="ln"></span></div>
    ${cd.html}
  </div>

  ${d.mensaje ? `<section>
    <p class="eyebrow-sm">El mensaje</p>
    <div class="message-card"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  ${(d.hora || d.lugar) ? `<section>
    <p class="eyebrow-sm">El festejo</p>
    <h2>Nos vemos ahí</h2>
    <div class="divider" style="margin-bottom:8px;"></div>
    <div class="timeline">
      <div class="tl-card">
        <div class="tl-icon">${icons.cake}</div>
        <h3>El festejo</h3>
        ${d.hora ? `<p class="tl-time">${esc(d.hora)}</p>` : ""}
        ${d.lugar ? `<p class="tl-place">${esc(d.lugar)}</p>` : ""}
      </div>
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
    ${rsvpDeadline ? `<p class="eyebrow-sm" style="color:var(--accent);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="divider" style="margin-bottom:20px;"></div>
    <div class="rsvp-card">${rsvp.html}</div>
  </section>

  <footer>
    <div class="footer-mono">${esc(inicial)}</div>
    <p>¡Nos vemos ahí! ${esc(d.nombre)}</p>
  </footer>

  <script>${cd.script}${gal ? gal.script : ""}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: "#f2b84b", auroraA: "#f2b84b", auroraB: "#ff9c6b", ghost: "A celebrar",
    group: "playful", iconSvg: icons.cake, catLabel: "Cumpleaños",
    darkFrom: "#8a6a20", darkTo: "#241d0c",
  });
}

module.exports = {
  id, category: "cumpleanos", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: fondo ciruela oscuro de punta a punta, guirnalda de luces animada y dorado con resplandor real — noche de gala.",
  accent: ACCENT, accent2: "#241d0c", schema: cumpleanosSchema, sampleData, render, cardPreview,
};
