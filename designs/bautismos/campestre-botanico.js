const { esc, countdownWidget, galleryWidget, rsvpWidget, formatFechaCorta, tadiFooterWidget } = require("../widgets");
const { bautismoSchema } = require("../schemas");
const { getPaletteColor } = require("../palettes");

const id = "bau-campestre-botanico";

const sampleData = {
  nombreChico: "Renata", padres: "Camila y Ignacio", padrinos: "Valentina y Joaquín",
  fecha: "2027-05-24", horaCeremonia: "11:00", lugarCeremonia: "Capilla San José",
  horaFiesta: "13:00", lugarFiesta: "Estancia La Rosada, Pilar",
  direccionMapa: "https://maps.google.com/?q=Estancia+La+Rosada+Pilar",
  mensaje: "Con el corazón lleno de alegría, queremos que nos acompañes a celebrar el bautismo de Renata, un día para agradecer y compartir en familia.",
  whatsapp: "5491100000022",
  coverImage: "https://images.unsplash.com/photo-1721862650498-1e7274dec2ec?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80"
  ]
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent = getPaletteColor(d.colorPalette, "light", "#b8935a");
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.horaCeremonia || "11:00"}:00` : sampleData.fecha, "cdbau");
  const gal = galleryWidget(d.galeria, "galbau");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp });
  const rsvpDeadline = formatFechaCorta(d.fechaLimiteRSVP);

  // Nota: se arma la fecha a mano (no con toLocaleDateString/Intl) por el
  // mismo motivo que el resto de las tarjetas del sitio — el Node de
  // producción no siempre trae los datos de idioma "es-AR" completos, y
  // eso dejaría la fecha del hero en blanco sin avisar.
  let diaSemana = "", diaNumero = "", mesAnio = "";
  if (d.fecha) {
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const [y, m, day] = String(d.fecha).split("-").map(Number);
    if (y && m && day) {
      const dt = new Date(y, m - 1, day);
      diaSemana = dias[dt.getDay()];
      diaNumero = String(day);
      mesAnio = `${meses[m - 1]} de ${y}`;
    }
  }

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bautismo de ${esc(d.nombreChico)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Parisienne&display=swap" rel="stylesheet">
<style>
:root{--forest:#304638;--forest-2:#22372b;--sage:#81937b;--sage-pale:#eef1e9;--cream:#f8f6ef;--paper:#fffdf8;--gold:${accent};--gold-soft:#d9c39a;--ink:#263029;--muted:#6d756d;--line:rgba(48,70,56,.14);--shadow:0 24px 70px rgba(34,55,43,.12);--radius:24px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;overflow-x:hidden;color:var(--ink);background:var(--cream);font-family:'DM Sans',system-ui,sans-serif;line-height:1.65;font-size:16px}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.32;background:radial-gradient(circle at 10% 0%,rgba(129,147,123,.18),transparent 28%),radial-gradient(circle at 95% 15%,rgba(184,147,90,.12),transparent 24%);z-index:-1}
.wrap{width:min(100% - 36px,760px);margin:auto}.hero{position:relative;min-height:760px;display:grid;place-items:center;padding:54px 18px 68px;background:linear-gradient(180deg,#e8ede3 0%,#f5f3eb 72%,var(--cream) 100%);overflow:hidden}.hero:after{content:"";position:absolute;width:460px;height:460px;border:1px solid rgba(184,147,90,.25);border-radius:50%;right:-240px;top:-170px}.hero-inner{position:relative;z-index:1;width:min(100%,650px);text-align:center;animation:rise .9s cubic-bezier(.2,.7,.2,1) both}.eyebrow{display:flex;align-items:center;justify-content:center;gap:12px;text-transform:uppercase;letter-spacing:3px;font-size:10px;font-weight:600;color:var(--forest);margin:0 0 18px}.eyebrow:before,.eyebrow:after{content:"";width:34px;height:1px;background:var(--gold);opacity:.7}.cross{width:28px;height:28px;margin:0 auto 18px;color:var(--gold);filter:drop-shadow(0 5px 8px rgba(184,147,90,.18))}.hero h1{font-family:'Parisienne',cursive;font-size:clamp(4rem,18vw,7.2rem);line-height:.95;font-weight:400;color:var(--forest);margin:0 0 20px}.hero-sub{font-family:'Playfair Display',serif;font-style:italic;color:var(--muted);font-size:clamp(1rem,3.4vw,1.25rem);margin:0 0 28px}.portrait{width:clamp(190px,48vw,250px);aspect-ratio:1;border-radius:50%;margin:0 auto 28px;padding:8px;background:rgba(255,253,248,.62);border:1px solid rgba(184,147,90,.62);box-shadow:0 20px 50px rgba(48,70,56,.16)}.portrait img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}.date-pill{display:inline-flex;align-items:center;gap:14px;padding:11px 18px;border:1px solid var(--line);background:rgba(255,253,248,.65);backdrop-filter:blur(12px);border-radius:999px;box-shadow:0 10px 30px rgba(48,70,56,.06);font-size:12px}.date-pill strong{font-family:'Playfair Display',serif;font-size:21px;color:var(--forest)}.date-pill span{text-transform:capitalize;color:var(--muted)}
section{padding:76px 0}.section-soft{background:linear-gradient(180deg,rgba(238,241,233,.92),rgba(238,241,233,.55))}.section-head{text-align:center;margin-bottom:34px}.section-kicker{text-transform:uppercase;letter-spacing:3px;font-size:9px;font-weight:600;color:var(--gold);margin:0 0 8px}.section-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,5vw,2.45rem);font-weight:500;color:var(--forest);margin:0}.section-title em{font-weight:500}.section-sub{color:var(--muted);font-size:13px;margin:7px 0 0}
.message{max-width:650px;margin:auto;text-align:center;font-family:'Playfair Display',serif;font-size:clamp(1.05rem,3.6vw,1.35rem);font-style:italic;line-height:1.8;color:#455048}.message-mark{width:36px;height:36px;margin:0 auto 20px;color:var(--gold)}
.countdown{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.countdown>div{width:78px;height:86px;border:1px solid var(--line);border-radius:18px;background:rgba(255,253,248,.72);backdrop-filter:blur(10px);box-shadow:0 12px 32px rgba(48,70,56,.08);display:flex;flex-direction:column;justify-content:center;align-items:center}.cd-num{font-family:'Playfair Display',serif;font-size:26px;color:var(--forest)}.cd-label{text-transform:uppercase;letter-spacing:1.5px;font-size:8px;color:var(--muted)}
.timeline{max-width:610px;margin:auto;display:grid;gap:14px}.timeline-item{display:grid;grid-template-columns:76px 1fr;gap:18px;align-items:center;padding:22px;border:1px solid var(--line);border-radius:20px;background:rgba(255,253,248,.74);box-shadow:0 12px 35px rgba(48,70,56,.06);transition:transform .35s ease,box-shadow .35s ease}.timeline-item:hover{transform:translateY(-3px);box-shadow:0 20px 45px rgba(48,70,56,.11)}.timeline-time{font-family:'Playfair Display',serif;font-size:19px;color:var(--gold);font-weight:600}.timeline-what strong{display:block;color:var(--forest);font-family:'Playfair Display',serif;font-size:18px;font-weight:500}.timeline-what span{color:var(--muted);font-size:13px}.map-link{display:inline-flex;margin-top:22px;color:var(--forest);font-size:12px;text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:3px}
.people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:650px;margin:auto}.people .card{padding:27px 20px;text-align:center;border:1px solid var(--line);border-radius:20px;background:rgba(255,253,248,.72);box-shadow:0 12px 35px rgba(48,70,56,.06)}.tag{text-transform:uppercase;letter-spacing:2.4px;font-size:9px;font-weight:600;color:var(--gold);margin-bottom:9px}.names{font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:var(--forest)}
.gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:760px;margin:auto;padding:0 18px}.gallery-item img{width:100%;height:220px;object-fit:cover;border-radius:18px;border:1px solid var(--line);display:block;transition:transform .45s cubic-bezier(.2,.7,.2,1),filter .45s ease}.gallery-item img:hover{transform:scale(1.015);filter:saturate(1.05)}.lightbox{display:none;position:fixed;inset:0;background:rgba(24,34,27,.94);align-items:center;justify-content:center;z-index:60;padding:24px}.lightbox.open{display:flex}.lightbox img{max-width:94%;max-height:86%;border-radius:16px}.lightbox-close{position:absolute;top:18px;right:22px;color:#fff;font-size:28px;cursor:pointer}
.rsvp-form{display:flex;flex-direction:column;gap:14px;max-width:440px;margin:auto;padding:30px 26px;text-align:left}.rsvp-form label{font-size:11px;color:var(--forest);font-weight:600}.rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:13px 14px;border:1px solid var(--line);border-radius:12px;margin-top:6px;width:100%;background:rgba(255,253,248,.86);color:var(--ink);transition:border .25s,box-shadow .25s}.rsvp-form input:focus,.rsvp-form select:focus,.rsvp-form textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 4px rgba(184,147,90,.1)}.rsvp-form button{background:var(--forest);color:#fff;border:0;padding:14px;border-radius:12px;cursor:pointer;font-family:inherit;font-weight:600;letter-spacing:.3px;transition:transform .25s,background .25s,box-shadow .25s}.rsvp-form button:hover{background:var(--forest-2);transform:translateY(-2px);box-shadow:0 10px 24px rgba(34,55,43,.2)}.rsvp-whatsapp{text-align:center;color:var(--forest);font-size:12px;text-decoration:none}.rsvp-status{text-align:center;color:var(--forest);font-weight:600}.card{border:1px solid var(--line);border-radius:24px;background:rgba(255,253,248,.78);box-shadow:var(--shadow);backdrop-filter:blur(14px)}
footer{text-align:center;padding:38px 20px 46px;color:var(--muted);font-size:11px;border-top:1px solid var(--line)}footer .fleuron{color:var(--gold);font-size:20px;display:block;margin-bottom:6px}
@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@media (max-width:520px){section{padding:62px 0}.hero{min-height:720px}.people{grid-template-columns:1fr}.gallery-item img{height:170px}.timeline-item{grid-template-columns:62px 1fr;padding:18px}.countdown>div{width:70px;height:78px}.wrap{width:min(100% - 28px,760px)}}@media (prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
</style></head><body>
<section class="hero"><div class="hero-inner"><svg class="cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><path d="M12 2v20M6 8h12"/></svg><p class="eyebrow">Una celebración para recordar</p><p class="hero-sub">Con mucha alegría te invitamos al bautismo de</p><h1>${esc(d.nombreChico)}</h1><div class="portrait"><img src="${esc(d.coverImage)}" alt="${esc(d.nombreChico)}"></div><div class="date-pill"><span>${esc(diaSemana || d.fecha)}</span><strong>${esc(diaNumero)}</strong><span>${esc(mesAnio)}</span></div></div></section>
${d.mensaje ? `<section><div class="wrap"><svg class="message-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M12 2C8 6 4 10 4 15a8 8 0 0016 0c0-5-4-9-8-13z"/><path d="M12 22V9"/></svg><p class="message">${esc(d.mensaje)}</p></div></section>` : ""}
<section class="section-soft"><div class="wrap"><div class="section-head"><p class="section-kicker">El gran día</p><h2 class="section-title">Cuenta regresiva</h2><p class="section-sub">Falta cada vez menos</p></div>${cd.html}</div></section>
<section><div class="wrap"><div class="section-head"><p class="section-kicker">Agenda</p><h2 class="section-title">Cuándo y dónde</h2><p class="section-sub">Ceremonia y celebración</p></div><div class="timeline">${d.horaCeremonia || d.lugarCeremonia ? `<div class="timeline-item"><div class="timeline-time">${esc(d.horaCeremonia || "")}</div><div class="timeline-what"><strong>Ceremonia</strong><span>${esc(d.lugarCeremonia || "")}</span></div></div>` : ""}${d.horaFiesta || d.lugarFiesta ? `<div class="timeline-item"><div class="timeline-time">${esc(d.horaFiesta || "")}</div><div class="timeline-what"><strong>Celebración</strong><span>${esc(d.lugarFiesta || "")}</span></div></div>` : ""}</div>${d.direccionMapa ? `<a class="map-link" href="${esc(d.direccionMapa)}" target="_blank" rel="noopener">Abrir ubicación en el mapa&nbsp; ↗</a>` : ""}</div></section>
<section class="section-soft"><div class="wrap"><div class="section-head"><p class="section-kicker">Familia</p><h2 class="section-title">Con el cariño de</h2><p class="section-sub">Quienes acompañan este día</p></div><div class="people">${d.padres ? `<div class="card"><div class="tag">Papás</div><div class="names">${esc(d.padres)}</div></div>` : ""}${d.padrinos ? `<div class="card"><div class="tag">Padrinos</div><div class="names">${esc(d.padrinos)}</div></div>` : ""}</div></div></section>
${d.galeria && d.galeria.length ? `<section><div class="wrap"><div class="section-head"><p class="section-kicker">Momentos</p><h2 class="section-title">Recuerdos</h2><p class="section-sub">Un poco de nuestra historia</p></div></div>${gal.html}</section>` : ""}
<section class="section-soft"><div class="wrap"><div class="section-head"><p class="section-kicker">Tu lugar está reservado</p><h2 class="section-title">Confirmá tu asistencia</h2><p class="section-sub">Nos encantaría contar con vos</p></div>${rsvpDeadline ? `<p style="text-align:center;margin:-12px 0 20px;font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted)">Antes del ${esc(rsvpDeadline)}</p>` : ""}<div class="card">${rsvp.html}</div></div></section>
<footer><span class="fleuron">❦</span>Bautismo de ${esc(d.nombreChico)} · Gracias por acompañarnos</footer><script>${cd.script}${gal.script}${rsvp.script}</script>${tadiFooterWidget()}</body></html>`;
}

function cardPreview(d) { return `<div style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;background:linear-gradient(145deg, ${d.accent || '#304638'} 0%, ${d.accent2 || '#b8935a'} 100%);"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fdfbf4" stroke-width="1.3"><path d="M12 2v20M6 8h12"/></svg><div style="font-family:Georgia,serif;font-style:italic;font-size:1.1rem;color:#fffdf8">${esc(d.name)}</div><div style="font-size:.5rem;letter-spacing:2.5px;text-transform:uppercase;color:#e7ecdd">Bautismo</div></div>`; }
module.exports = { id, category:"bautismos", name:"Campestre Botánico", summary:"Estética campestre botánica premium, sobria y contemporánea, con verde bosque, dorado suave, superficies translúcidas y tipografía editorial.", accent:"#304638", accent2:"#b8935a", schema:bautismoSchema, sampleData, render, cardPreview };
