// "TaDi" — Bautismos — "Bendición". Versión con identidad propia dentro
// del sistema de marca TaDi (isotipo, aurora animada, neomorfismo): fondo
// celeste-marfil suave de punta a punta (no solo en el header), resplandor
// blanco/dorado detrás del hero, halo dorado fino y una cruz simple como
// monograma, con estrellitas titilando — pensada para sentirse angelical
// y premium, no una versión "fría" con el mismo esqueleto que las demás
// categorías.
const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { tadiCardPreview, getPaletteColor } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { bautismoSchema } = require("../schemas");

const id = "bau-tadi";
const ACCENT = "#4f7f9c";
const ACCENT2 = "#d9b872";

const sampleData = {
  nombreChico: "Danna Paola",
  padres: "Pablo Martínez y Luciana López",
  padrinos: "Marcos López y Sole Martínez",
  fecha: "2027-06-12", horaCeremonia: "11:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "13:00", lugarFiesta: "Salón Los Nogales",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Nogales",
  mensaje: "Con inmensa alegría los invitamos a acompañarnos en el bautismo de nuestra hija.",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-06-01",
  coverImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80",
  galeria: [],
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

  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cd1");
  const gal = (d.galeria && d.galeria.length) ? galleryWidget(d.galeria, "gal1") : null;
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "bautismos", datos: d });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  const eventCards = [];
  if (d.horaCeremonia || d.lugarCeremonia) eventCards.push({ label: "Ceremonia", time: d.horaCeremonia, place: d.lugarCeremonia });
  if (d.horaFiesta || d.lugarFiesta) eventCards.push({ label: "Fiesta", time: d.horaFiesta, place: d.lugarFiesta });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)} · TaDi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#33424d; --muted:#7a92a0;
    --accent:${ACCENT}; --accent-2:${accent2};
    --sh-dark:#cddce4; --sh-light:#ffffff;
    --nu-xs:3px 3px 7px var(--sh-dark),-3px -3px 7px var(--sh-light);
    --nu-sm:6px 6px 14px var(--sh-dark),-6px -6px 14px var(--sh-light);
    --nu-md:8px 8px 18px var(--sh-dark),-8px -8px 18px var(--sh-light);
    --nu-inset-sm:inset 3px 3px 7px var(--sh-dark),inset -3px -3px 7px var(--sh-light);
    --panel:#ffffff;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;color:var(--ink);overflow-x:hidden;
    background:linear-gradient(170deg,#eef5fa 0%,#fbf6ea 55%,#eef5fa 100%);
    background-attachment:fixed;
  }
  h1,h2{font-family:'Playfair Display',serif;font-weight:600;margin:0;}

  .hero{position:relative;overflow:hidden;padding:40px 22px 50px;text-align:center;}
  .glow{position:absolute;z-index:0;width:220px;height:220px;top:-10px;left:50%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(217,184,114,.18) 55%,transparent 72%);}
  .aurora{position:absolute;inset:-30% -10% -10% -10%;z-index:0;pointer-events:none;filter:blur(36px);
    background:
      radial-gradient(circle at 20% 15%, rgba(143,178,201,.35), transparent 55%),
      radial-gradient(circle at 85% 20%, rgba(217,184,114,.3), transparent 52%);
    animation:tadiAurora 22s ease-in-out infinite;
  }
  @keyframes tadiAurora{0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}33%{transform:translate(1.5%,-2%) rotate(4deg) scale(1.04);}66%{transform:translate(-2%,1.5%) rotate(-3deg) scale(1.02);}}
  .star{position:absolute;z-index:1;color:#d9b872;animation:tw 3.4s ease-in-out infinite;}
  @keyframes tw{0%,100%{opacity:.2;transform:scale(.8);}50%{opacity:.85;transform:scale(1.1);}}

  .tadi-pill{position:relative;z-index:3;display:inline-flex;align-items:center;gap:1px;background:linear-gradient(120deg,#fff3ea,#ffe4d6 45%,#ffd9e6 100%);border-radius:20px;padding:6px 16px;box-shadow:0 3px 10px rgba(0,0,0,.2),inset 0 1px 1px rgba(255,255,255,.8);font-weight:800;font-size:.85rem;margin-bottom:12px;font-family:Arial,Helvetica,sans-serif;}
  .tadi-pill .ta{color:#33363f;}
  .tadi-pill .di{color:#e8672e;}

  .ghost{position:relative;z-index:3;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--accent);margin-bottom:8px;}

  .halo-ring{position:relative;z-index:2;width:58px;height:17px;margin:0 auto 8px;border:2px solid #d9b872;border-radius:50%;opacity:.8;filter:drop-shadow(0 0 6px rgba(217,184,114,.5));}
  .mono{position:relative;z-index:3;width:82px;height:82px;margin:0 auto 18px;border-radius:50%;background:#fff;box-shadow:var(--nu-sm);display:flex;align-items:center;justify-content:center;color:var(--accent);}

  .hero h1{position:relative;z-index:3;font-size:clamp(1.8rem,7.5vw,2.7rem);line-height:1.2;color:var(--ink);}
  .dateline{position:relative;z-index:3;margin:14px 0 0;letter-spacing:2.5px;text-transform:uppercase;font-size:.8rem;color:var(--muted);font-weight:600;}
  .dayline{position:relative;z-index:3;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;font-size:.66rem;color:var(--muted);opacity:.85;}

  .divider{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:10px;margin:20px auto 0;width:140px;}
  .divider .ln{flex:1;height:1px;background:linear-gradient(90deg,transparent,#d9b872,transparent);}

  .countdown{position:relative;z-index:3;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:22px 0 0;}
  .countdown div{display:flex;flex-direction:column;align-items:center;background:#fff;border-radius:16px;box-shadow:var(--nu-inset-sm);min-width:56px;padding:12px 6px;}
  .cd-num{font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--accent);line-height:1;}
  .cd-label{margin-top:4px;font-size:.56rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);}

  section{max-width:640px;margin:0 auto;padding:46px 22px;text-align:center;}
  .eyebrow-sm{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:0 0 4px;}
  h2{font-size:1.5rem;color:var(--ink);margin-bottom:8px;}

  .message-card{background:#fff;border-radius:24px;box-shadow:var(--nu-sm);padding:30px 26px;border:1px solid rgba(217,184,114,.3);}
  .message-card p{font-family:'Playfair Display',serif;font-style:italic;font-size:1.1rem;line-height:1.7;color:var(--ink);margin:0;}

  .timeline{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:6px;}
  .tl-card{background:#fff;border-radius:20px;box-shadow:var(--nu-sm);padding:26px 22px;min-width:190px;flex:1 1 190px;max-width:260px;border:1px solid rgba(217,184,114,.22);}
  .tl-icon{width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:var(--nu-inset-sm);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--accent);}
  .tl-card h3{margin:0 0 6px;font-size:.92rem;letter-spacing:1.3px;text-transform:uppercase;color:var(--ink);font-family:'Helvetica Neue',sans-serif;font-weight:700;}
  .tl-time{color:var(--accent);font-weight:700;margin:0 0 4px;font-size:.86rem;}
  .tl-place{margin:0;color:var(--muted);font-size:.84rem;line-height:1.5;}

  .chip-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px;}
  .chip{background:#fff;box-shadow:var(--nu-xs);border-radius:20px;padding:9px 18px;font-size:.78rem;color:var(--muted);text-decoration:none;display:inline-block;}
  .chip b{color:var(--ink);}

  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:8px;}
  .gallery-item{border-radius:16px;overflow:hidden;box-shadow:var(--nu-inset-sm);}
  .gallery img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(20,30,36,.92);align-items:center;justify-content:center;z-index:50;padding:20px;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:92%;max-height:85%;border-radius:12px;}
  .lightbox-close{position:absolute;top:18px;right:24px;color:#fff;font-size:2rem;cursor:pointer;line-height:1;}

  .rsvp-card{background:#fff;border-radius:24px;box-shadow:var(--nu-sm);padding:32px 26px;text-align:left;border:1px solid rgba(217,184,114,.3);}
  .rsvp-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .rsvp-form > *{grid-column:1/-1;}
  .rsvp-form > label:nth-of-type(-n+2){grid-column:span 1;}
  @media(max-width:420px){.rsvp-form > label:nth-of-type(-n+2){grid-column:1/-1;}}
  .rsvp-form label{display:flex;flex-direction:column;gap:6px;font-size:.72rem;text-transform:uppercase;letter-spacing:1.3px;color:var(--muted);}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:12px 14px;border:0;border-radius:14px;background:#eef5fa;box-shadow:var(--nu-inset-sm);font-size:.92rem;color:var(--ink);}
  .rsvp-form button{width:100%;padding:14px;border:0;border-radius:20px;background:linear-gradient(120deg,#8fb2c9,var(--accent));color:#fff;font-weight:700;letter-spacing:.5px;box-shadow:var(--nu-sm);cursor:pointer;font-size:.9rem;}
  .rsvp-status{grid-column:1/-1;text-align:center;color:var(--muted);font-weight:600;}

  footer{text-align:center;padding:46px 22px 56px;}
  .footer-mono{width:56px;height:56px;border-radius:50%;background:#fff;box-shadow:var(--nu-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--accent);}
  footer p{font-family:'Playfair Display',serif;font-style:italic;color:var(--ink);font-size:1.05rem;margin:0;}
  footer .padrinos-row{margin-top:12px;font-size:.8rem;color:var(--muted);}
  footer .padrinos-row b{color:var(--ink);}

  @media (prefers-reduced-motion: reduce){ .aurora,.star{animation:none !important;} }
</style></head>
<body>

  <div class="hero">
    <div class="glow"></div>
    <div class="aurora"></div>
    <svg class="star" style="top:20px;left:16%;width:9px;" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8Z"/></svg>
    <svg class="star" style="top:74px;right:14%;width:7px;animation-delay:-1.6s;" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8Z"/></svg>

    <div class="tadi-pill"><span class="ta">Ta</span><span class="di">Di</span></div>
    <div class="ghost">Bautismo</div>
    <div class="halo-ring"></div>
    <div class="mono">${icons.cross}</div>
    <h1>${esc(d.nombreChico)}</h1>
    <p class="dateline">${fechaNum ? esc(fechaNum) : esc(d.fecha)}</p>
    ${fechaDia ? `<p class="dayline">${esc(fechaDia)}</p>` : ""}
    <div class="divider"><span class="ln"></span><svg width="8" height="8" viewBox="0 0 10 10"><path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#d9b872"/></svg><span class="ln"></span></div>
    ${cd.html}
  </div>

  ${d.mensaje ? `<section>
    <p class="eyebrow-sm">Con inmensa alegría</p>
    <div class="message-card"><p>&ldquo;${esc(d.mensaje)}&rdquo;</p></div>
  </section>` : ""}

  ${eventCards.length ? `<section>
    <p class="eyebrow-sm">El gran día</p>
    <h2>Nos vemos ahí</h2>
    <div class="divider" style="margin-bottom:8px;"></div>
    <div class="timeline">
      ${eventCards.map((c) => `<div class="tl-card">
        <div class="tl-icon">${icons.cross}</div>
        <h3>${esc(c.label)}</h3>
        ${c.time ? `<p class="tl-time">${esc(c.time)}</p>` : ""}
        ${c.place ? `<p class="tl-place">${esc(c.place)}</p>` : ""}
      </div>`).join("")}
    </div>
    ${d.direccionMapa ? `<div class="chip-row">
      <a class="chip" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">📍 Ver ubicación</a>
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
    <div class="footer-mono">${icons.cross}</div>
    <p>Con cariño, la familia</p>
    ${(d.padres || d.padrinos) ? `<p class="padrinos-row">
      ${d.padres ? `Padres <b>${esc(d.padres)}</b>` : ""}${(d.padres && d.padrinos) ? " · " : ""}${d.padrinos ? `Padrinos <b>${esc(d.padrinos)}</b>` : ""}
    </p>` : ""}
  </footer>

  <script>${cd.script}${gal ? gal.script : ""}${rsvp.script}</script>
${tadiFooterWidget()}
</body></html>`;
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: "#8fb2c9", auroraA: "#8fb2c9", auroraB: "#e8a2c0", ghost: "Bautismo",
    group: "elegante", iconSvg: icons.droplet, catLabel: "Bautismos",
    darkFrom: "#3a5a70", darkTo: "#131c22",
  });
}

module.exports = {
  id, category: "bautismos", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: fondo celeste-marfil de punta a punta, resplandor y halo dorado con una cruz simple — angelical y premium.",
  accent: ACCENT, accent2: "#131c22", schema: bautismoSchema, sampleData, render, cardPreview,
};
