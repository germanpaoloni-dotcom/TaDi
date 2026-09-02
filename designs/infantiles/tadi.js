// "TaDi" — Fiestas Infantiles — "Fiesta". Versión con identidad propia
// dentro del sistema de marca TaDi (isotipo, aurora animada, neomorfismo):
// fondo cálido con textura de confetti de punta a punta (no solo en el
// header), foto del cumpleañero en marco tipo sticker girado con arcoíris
// de colores, globos y confetti flotando — paleta cálida y saturada
// (naranja/coral/rosa/dorado, con el verde-azulado como acento, no como
// color dominante) para que se sienta una fiesta de verdad, no una
// versión "fría" con el mismo esqueleto que las demás categorías.
const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { tadiCardPreview, getPaletteColor } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { infantilSchema } = require("../schemas");

const id = "inf-tadi";
const ACCENT = "#c9612a";
const ACCENT2 = "#2f8a7e";

const sampleData = {
  nombreChico: "Bruno", edad: "7",
  fecha: "2027-03-14", hora: "17:00", lugar: "Club San Fernando",
  direccionMapa: "https://maps.google.com/?q=Club+San+Fernando",
  mensaje: "¡Vení a festejar con nosotros! Va a haber juegos, torta y mucha diversión.",
  tematica: "Superhéroes (disfraz opcional)",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-03-07",
  coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=75",
  galeria: [
    "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=80",
    "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
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
  const inicial = (d.nombreChico || "?").trim().charAt(0).toUpperCase();

  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "17:00"}:00` : sampleData.fecha, "cd1");
  const gal = (d.galeria && d.galeria.length) ? galleryWidget(d.galeria, "gal1") : null;
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "infantiles", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cumple de ${esc(d.nombreChico)} · TaDi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#3a2a1a; --muted:#8a6e56;
    --accent:${ACCENT}; --accent-2:${accent2};
    --sh-dark:#f0c9a8; --sh-light:#ffffff;
    --nu-xs:3px 3px 7px var(--sh-dark),-3px -3px 7px var(--sh-light);
    --nu-sm:6px 6px 14px var(--sh-dark),-6px -6px 14px var(--sh-light);
    --nu-md:8px 8px 18px var(--sh-dark),-8px -8px 18px var(--sh-light);
    --nu-inset-sm:inset 3px 3px 7px var(--sh-dark),inset -3px -3px 7px var(--sh-light);
    --panel:#ffffff;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Baloo 2',sans-serif;color:var(--ink);overflow-x:hidden;position:relative;
    background:linear-gradient(170deg,#fff3df 0%,#ffe3d4 40%,#ffe9f0 75%,#eafaf6 100%);
    background-attachment:fixed;
  }
  body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
    background-image:radial-gradient(circle,#e8672e 1.6px,transparent 1.7px),radial-gradient(circle,#4fb3a9 1.6px,transparent 1.7px),radial-gradient(circle,#d68ca0 1.6px,transparent 1.7px);
    background-size:60px 60px,78px 78px,94px 94px;background-position:0 0,20px 30px,50px 10px;
  }
  h1,h2{font-family:'Baloo 2',sans-serif;font-weight:700;margin:0;}

  .hero{position:relative;overflow:hidden;padding:34px 22px 46px;text-align:center;}
  .aurora{position:absolute;inset:-30% -10% -10% -10%;z-index:0;pointer-events:none;filter:blur(36px);
    background:
      radial-gradient(circle at 18% 15%, rgba(232,103,46,.35), transparent 55%),
      radial-gradient(circle at 85% 20%, rgba(242,184,75,.4), transparent 50%),
      radial-gradient(circle at 60% 78%, rgba(79,179,169,.3), transparent 55%);
    animation:tadiAurora 22s ease-in-out infinite;
  }
  @keyframes tadiAurora{0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}33%{transform:translate(1.5%,-2%) rotate(4deg) scale(1.04);}66%{transform:translate(-2%,1.5%) rotate(-3deg) scale(1.02);}}
  .balloon{position:absolute;z-index:1;animation:bfloat 6s ease-in-out infinite;filter:drop-shadow(0 6px 8px rgba(0,0,0,.1));}
  @keyframes bfloat{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-14px) rotate(3deg);}}
  .confetti{position:absolute;z-index:1;border-radius:2px;animation:cspin 4s linear infinite;}
  @keyframes cspin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}

  .tadi-pill{position:relative;z-index:3;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:6px 16px;box-shadow:0 3px 10px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.8);font-weight:800;font-size:.85rem;margin-bottom:12px;font-family:Arial,Helvetica,sans-serif;}
  .tadi-pill .ta{color:#33363f;}
  .tadi-pill .di{color:#e8672e;}

  .ghost{position:relative;z-index:3;display:inline-block;background:#fff;padding:6px 16px;border-radius:20px;box-shadow:4px 4px 10px var(--sh-dark),-4px -4px 10px var(--sh-light);font-size:.72rem;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:var(--accent);margin-bottom:16px;}

  .photo-frame{position:relative;z-index:3;width:112px;height:112px;margin:0 auto 16px;border-radius:44% 56% 62% 38%/54% 42% 58% 46%;padding:6px;background:repeating-conic-gradient(from 0deg,#e8672e 0deg 22.5deg,#f2b84b 22.5deg 45deg,#4fb3a9 45deg 67.5deg,#d68ca0 67.5deg 90deg);box-shadow:var(--nu-sm);transform:rotate(-4deg);}
  .photo-frame img{width:100%;height:100%;border-radius:40% 60% 58% 42%/52% 40% 60% 48%;object-fit:cover;display:block;border:3px solid #fff;}
  .photo-frame.noimg{display:flex;align-items:center;justify-content:center;}
  .photo-frame.noimg .initials{width:100%;height:100%;border-radius:40% 60% 58% 42%/52% 40% 60% 48%;background:#fff;display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.7rem;color:var(--accent);}

  .hero h1{position:relative;z-index:3;font-size:clamp(2rem,8vw,3rem);line-height:1.15;color:var(--ink);}
  .hero h1 em{font-style:normal;color:var(--accent);}
  .sub{position:relative;z-index:3;font-family:'Baloo 2',sans-serif;font-weight:600;color:var(--muted);margin:8px 0 0;font-size:1.05rem;}

  .countdown{position:relative;z-index:3;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:26px 0 0;}
  .countdown div{display:flex;flex-direction:column;align-items:center;background:#fff;border-radius:50%;box-shadow:var(--nu-inset-sm);width:62px;height:62px;justify-content:center;}
  .cd-num{font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.15rem;color:var(--accent);line-height:1;}
  .cd-label{margin-top:3px;font-size:.5rem;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);font-family:'Helvetica Neue',sans-serif;font-weight:600;}

  section{position:relative;z-index:2;max-width:640px;margin:0 auto;padding:36px 22px;text-align:center;}
  .eyebrow-sm{position:relative;z-index:2;font-size:.7rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin:0 0 14px;font-weight:700;}
  h2{font-size:1.5rem;color:var(--ink);margin-bottom:8px;}

  .message-card{background:#fff;border-radius:32px;box-shadow:var(--nu-md);padding:28px 26px;}
  .message-card p{font-family:'Baloo 2',sans-serif;font-weight:600;font-size:1.05rem;line-height:1.6;color:var(--ink);margin:0;}

  .timeline{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .tl-card{background:#fff;border-radius:28px;box-shadow:var(--nu-sm);padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:260px;}
  .tl-icon{width:48px;height:48px;border-radius:50%;background:#fff;box-shadow:var(--nu-inset-sm);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--accent);}
  .tl-card h3{margin:0 0 6px;font-size:.92rem;letter-spacing:.6px;text-transform:uppercase;color:var(--ink);font-family:'Baloo 2',sans-serif;font-weight:700;}
  .tl-time{color:var(--accent);font-weight:700;margin:0 0 4px;font-size:.86rem;}
  .tl-place{margin:0;color:var(--muted);font-size:.84rem;line-height:1.5;}

  .chip-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .chip{background:#fff;box-shadow:var(--nu-xs);border-radius:20px;padding:9px 18px;font-size:.78rem;color:var(--muted);text-decoration:none;display:inline-block;font-family:'Baloo 2',sans-serif;font-weight:600;}
  .chip b{color:var(--ink);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:8px;}
  .gallery-item{border-radius:20px;overflow:hidden;box-shadow:var(--nu-inset-sm);}
  .gallery img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(40,24,16,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-card{background:#fff;border-radius:32px;box-shadow:var(--nu-md);padding:32px 26px;text-align:left;}
  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);font-family:'Baloo 2',sans-serif;font-weight:600;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:'Helvetica Neue',sans-serif;padding:12px 14px;border:0;border-radius:16px;background:#fff3df;box-shadow:var(--nu-inset-sm);font-size:.92rem;color:var(--ink);}
  .rsvp-form button{width:100%;padding:14px;border:0;border-radius:24px;background:linear-gradient(120deg,#e8672e,#f2b84b);color:#fff;font-weight:700;letter-spacing:.5px;box-shadow:var(--nu-sm);cursor:pointer;font-size:.9rem;font-family:'Baloo 2',sans-serif;}
  .rsvp-status{grid-column:1/-1;text-align:center;color:var(--muted);font-weight:600;}

  footer{position:relative;z-index:2;text-align:center;padding:40px 22px 56px;}
  .footer-mono{width:56px;height:56px;border-radius:50%;background:#fff;box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--accent);font-size:1.1rem;}
  footer p{font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--ink);font-size:1.1rem;margin:0;}

  @media (prefers-reduced-motion: reduce){ .aurora,.balloon,.confetti{animation:none !important;} }
</style></head>
<body>

  <div class="hero">
    <div class="aurora"></div>
    <svg class="balloon" style="top:14px;left:8%;width:32px;" viewBox="0 0 24 24" fill="#e8672e"><path d="M12 3a6 6 0 0 1 6 6c0 3.6-2.6 6.7-5.1 7.4l.3 1.1h-2.4l.3-1.1C8.6 15.7 6 12.6 6 9a6 6 0 0 1 6-6Z"/></svg>
    <svg class="balloon" style="top:6px;right:8%;width:30px;animation-delay:-2s;" viewBox="0 0 24 24" fill="#d68ca0"><path d="M12 3a6 6 0 0 1 6 6c0 3.6-2.6 6.7-5.1 7.4l.3 1.1h-2.4l.3-1.1C8.6 15.7 6 12.6 6 9a6 6 0 0 1 6-6Z"/></svg>
    <svg class="balloon" style="top:56px;right:22%;width:22px;animation-delay:-3.6s;" viewBox="0 0 24 24" fill="#f2b84b"><path d="M12 3a6 6 0 0 1 6 6c0 3.6-2.6 6.7-5.1 7.4l.3 1.1h-2.4l.3-1.1C8.6 15.7 6 12.6 6 9a6 6 0 0 1 6-6Z"/></svg>
    <svg class="balloon" style="top:64px;left:16%;width:18px;animation-delay:-1.2s;" viewBox="0 0 24 24" fill="#4fb3a9"><path d="M12 3a6 6 0 0 1 6 6c0 3.6-2.6 6.7-5.1 7.4l.3 1.1h-2.4l.3-1.1C8.6 15.7 6 12.6 6 9a6 6 0 0 1 6-6Z"/></svg>
    <div class="confetti" style="top:36px;left:24%;width:8px;height:12px;background:#e8672e;"></div>
    <div class="confetti" style="top:90px;left:32%;width:7px;height:10px;background:#4fb3a9;animation-delay:-1s;"></div>
    <div class="confetti" style="top:26px;right:28%;width:7px;height:11px;background:#d68ca0;animation-delay:-2s;"></div>
    <div class="confetti" style="top:100px;right:14%;width:7px;height:10px;background:#f2b84b;animation-delay:-.6s;"></div>

    <div class="tadi-pill"><span class="ta">Ta</span><span class="di">Di</span></div>
    <div class="ghost">¡A jugar!</div>
    ${d.coverImage
      ? `<div class="photo-frame"><img src="${esc(d.coverImage)}" alt=""></div>`
      : `<div class="photo-frame noimg"><div class="initials">${esc(inicial)}</div></div>`}
    <h1>${d.edad ? `${esc(d.nombreChico)} <em>cumple ${esc(d.edad)}</em>` : esc(d.nombreChico)}</h1>
    <p class="sub">¡Vení a festejar con nosotros!</p>
    ${cd.html}
  </div>

  ${d.mensaje ? `<section>
    <p class="eyebrow-sm">El mensaje</p>
    <div class="message-card"><p>${esc(d.mensaje)}</p></div>
  </section>` : ""}

  ${(d.hora || d.lugar) ? `<section>
    <p class="eyebrow-sm">La fiesta</p>
    <h2>Te esperamos</h2>
    <div class="timeline">
      <div class="tl-card">
        <div class="tl-icon">${icons.partyHat}</div>
        <h3>La fiesta</h3>
        ${d.hora ? `<p class="tl-time">${esc(d.hora)}</p>` : ""}
        ${d.lugar ? `<p class="tl-place">${esc(d.lugar)}</p>` : ""}
      </div>
    </div>
    ${(d.tematica || d.direccionMapa) ? `<div class="chip-row">
      ${d.tematica ? `<div class="chip">🎨 <b>${esc(d.tematica)}</b></div>` : ""}
      ${d.direccionMapa ? `<a class="chip" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">📍 Ver ubicación</a>` : ""}
    </div>` : ""}
  </section>` : ""}

  ${gal ? `<section>
    <p class="eyebrow-sm">Momentos</p>
    <h2>Galería</h2>
    ${gal.html}
  </section>` : ""}

  <section>
    <p class="eyebrow-sm">RSVP</p>
    <h2>Confirmá tu asistencia 🎉</h2>
    ${rsvpDeadline ? `<p class="eyebrow-sm" style="color:var(--accent);">Antes del ${esc(rsvpDeadline)}</p>` : ""}
    <div class="rsvp-card">${rsvp.html}</div>
  </section>

  <footer>
    <div class="footer-mono">${esc(inicial)}</div>
    <p>¡Nos vemos en la fiesta! 🎉</p>
  </footer>

  <script>${cd.script}${gal ? gal.script : ""}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: "#4fb3a9", auroraA: "#4fb3a9", auroraB: "#f2c265", ghost: "¡A jugar!",
    group: "playful", iconSvg: icons.partyHat, catLabel: "Fiestas Infantiles",
    darkFrom: "#2f6a63", darkTo: "#122320",
  });
}

module.exports = {
  id, category: "infantiles", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: fondo cálido con confetti de punta a punta, foto del cumpleañero en marco arcoíris y globos flotando — fiestas infantiles.",
  accent: ACCENT, accent2: "#122320", schema: infantilSchema, sampleData, render, cardPreview,
};
