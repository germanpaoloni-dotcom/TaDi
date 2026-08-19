const { esc, countdownWidget, rsvpWidget } = require("../widgets");
const { empresarialSchema } = require("../schemas");

const id = "emp-conferencia-corporativa";

function parseLines(text, sep = "-") {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf(sep);
      return idx === -1 ? [l, ""] : [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });
}

const sampleData = {
  nombreEvento: "Future Tech Summit 2027",
  empresa: "InnovaLabs",
  fecha: "2027-04-09", hora: "09:00", lugar: "Centro de Convenciones, CABA",
  direccionMapa: "https://maps.google.com/?q=Centro+de+Convenciones+CABA",
  descripcion: "Un encuentro de un día con líderes de tecnología para compartir tendencias, casos y networking.",
  agenda: "09:00 - Acreditación y café\n10:00 - Apertura y keynote\n11:30 - Panel: IA aplicada a negocios\n13:00 - Almuerzo y networking\n15:00 - Talleres simultáneos\n18:00 - Cierre y brindis",
  oradores: "Ana Ríos - CTO, InnovaLabs\nJuan Pérez - Head of AI, DataCorp\nLucía Gómez - Founder, StartupX",
  dressCode: "Business casual",
  contacto: "5491100000006",
  coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
  ],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const cd = countdownWidget(d.fecha ? `${d.fecha}T${d.hora || "09:00"}:00` : sampleData.fecha, "cd7");
  const rsvp = rsvpWidget(d.__slug || "demo", { withGuests: false, withMenu: false, whatsapp: d.contacto });
  const agenda = parseLines(d.agenda);
  const oradores = parseLines(d.oradores);
  const qrData = encodeURIComponent(`Registro: ${d.nombreEvento} - ${d.__slug || "demo"}`);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.nombreEvento)}</title>
<style>
  :root{--navy:#0f2540;--accent:#2f7de1;--bg:#f4f7fb;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Segoe UI',Arial,sans-serif;background:var(--bg);color:#16223a;}
  header{background:linear-gradient(120deg,var(--navy),#1b3a63);color:#fff;padding:60px 24px;text-align:center;}
  header .tag{text-transform:uppercase;letter-spacing:3px;font-size:.75rem;color:#9fc2ff;}
  header h1{font-size:2.4rem;margin:.2em 0;}
  .layout{max-width:900px;margin:-30px auto 0;padding:0 20px 50px;}
  .card{background:#fff;border-radius:14px;box-shadow:0 6px 20px rgba(15,37,64,.08);padding:28px;margin-bottom:20px;}
  .card h2{margin-top:0;color:var(--accent);font-size:1.1rem;text-transform:uppercase;letter-spacing:1px;}
  .countdown{display:flex;gap:12px;}
  .countdown div{flex:1;text-align:center;background:var(--bg);border-radius:10px;padding:12px 0;}
  .cd-num{font-size:1.7rem;display:block;color:var(--navy);font-weight:700;}
  .cd-label{font-size:.65rem;text-transform:uppercase;color:#6b7a90;}
  .agenda-item{display:flex;gap:16px;padding:10px 0;border-bottom:1px solid #eef1f6;}
  .agenda-item:last-child{border-bottom:0;}
  .agenda-time{min-width:80px;font-weight:700;color:var(--accent);}
  .speakers{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;}
  .speaker{background:var(--bg);border-radius:10px;padding:16px;text-align:center;}
  .speaker .avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--navy));margin:0 auto 10px;}
  .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
  .gallery img{width:100%;height:140px;object-fit:cover;border-radius:10px;cursor:pointer;}
  .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);align-items:center;justify-content:center;z-index:50;}
  .lightbox.open{display:flex;}
  .lightbox img{max-width:90%;max-height:85%;}
  .lightbox-close{position:absolute;top:20px;right:30px;color:#fff;font-size:2rem;cursor:pointer;}
  .qr-box{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
  .qr-box img{border:1px solid #eee;border-radius:8px;}
  .rsvp-form{display:flex;flex-direction:column;gap:12px;max-width:420px;}
  .rsvp-form label{font-size:.75rem;text-transform:uppercase;color:#6b7a90;}
  .rsvp-form input,.rsvp-form select,.rsvp-form textarea{font-family:inherit;padding:10px;border:1px solid #dfe6ef;border-radius:8px;margin-top:4px;width:100%;}
  .rsvp-form button{background:var(--accent);color:#fff;border:0;padding:12px;border-radius:8px;cursor:pointer;font-weight:600;}
  .rsvp-status{font-weight:bold;color:#2e7d32;}
  footer{text-align:center;padding:26px;font-size:.8rem;color:#6b7a90;}
</style></head>
<body>
  <header>
    <div class="tag">${esc(d.empresa)} presenta</div>
    <h1>${esc(d.nombreEvento)}</h1>
    <p>${esc(d.descripcion)}</p>
  </header>

  <div class="layout">
    <div class="card">
      <h2>Comienza en</h2>
      ${cd.html}
      <p style="margin-top:16px">📅 ${esc(d.fecha)} · 🕘 ${esc(d.hora)} hs · 📍 ${esc(d.lugar)}</p>
      ${d.direccionMapa ? `<a href="${esc(d.direccionMapa)}" target="_blank">Ver ubicación en el mapa →</a>` : ""}
      <p>Dress code: <strong>${esc(d.dressCode)}</strong></p>
    </div>

    <div class="card">
      <h2>Agenda del día</h2>
      ${agenda.map(([t, a]) => `<div class="agenda-item"><div class="agenda-time">${esc(t)}</div><div>${esc(a)}</div></div>`).join("") || "<p>Agenda a confirmar.</p>"}
    </div>

    <div class="card">
      <h2>Oradores</h2>
      <div class="speakers">
        ${oradores.map(([n, c]) => `<div class="speaker"><div class="avatar"></div><strong>${esc(n)}</strong><br><span style="font-size:.85rem;color:#6b7a90">${esc(c)}</span></div>`).join("") || "<p>A confirmar.</p>"}
      </div>
    </div>

    <div class="card">
      <h2>Fotos / Sponsors</h2>
      <div class="gallery">${(d.galeria || []).map((s, i) => `<div class="gallery-item" data-idx="${i}"><img src="${esc(s)}" alt="foto"></div>`).join("")}</div>
    </div>

    <div class="card">
      <h2>Tu acceso al evento</h2>
      <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}" width="140" height="140" alt="QR de acceso">
        <p>Presentá este código QR en la acreditación el día del evento.</p>
      </div>
    </div>

    <div class="card">
      <h2>Confirmar asistencia</h2>
      ${rsvp.html}
    </div>
  </div>

  <div class="lightbox" id="lb"><span class="lightbox-close">&times;</span><img id="lb-img" src=""></div>
  <footer>${esc(d.empresa)} · ${esc(d.nombreEvento)}</footer>

  <script>
    ${cd.script}${rsvp.script}
    (function(){
      var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img');
      document.querySelectorAll('.gallery-item img').forEach(function(img){
        img.addEventListener('click', function(){ lbImg.src = img.src; lb.classList.add('open'); });
      });
      lb.addEventListener('click', function(){ lb.classList.remove('open'); });
    })();
  </script>
</body></html>`;
}

module.exports = {
  id, category: "empresariales", name: "Conferencia Corporativa",
  summary: "Agenda del día, grilla de oradores y QR de acceso — ideal para conferencias y jornadas.",
  accent: "#2f7de1", schema: empresarialSchema, sampleData, render,
};
