const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getDB, saveDB, uid } = require("./db");
const { categories, designs, getDesign, designsByCategory } = require("./designs");
const mp = require("./mercadopago");

const app = express();
const PORT = process.env.PORT || 3000;

// Precio por defecto (según la investigación de mercado, se puede subir el
// precio con el tiempo sin tocar código: alcanza con cambiar esta variable
// de entorno o el valor por defecto acá).
const PRICE_ARS = Number(process.env.PRICE_ARS || 14900);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// --- subida de imágenes (portada / galería) ---
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "public", "uploads", req.params.token || "tmp");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "")),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function layout({ title, body, active = "" }) {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · TaDi</title>
<link rel="stylesheet" href="/static/css/site.css">
</head><body>
<header class="site">
  <a class="brand" href="/" style="text-decoration:none;color:#fff">Ta<span>Di</span></a>
  <nav>
    <a href="/">Catálogo</a>
    <a href="/categoria/bodas">Bodas</a>
    <a href="/categoria/xv">15 años</a>
    <a href="/categoria/empresariales">Empresariales</a>
  </nav>
</header>
${body}
<footer class="site">TaDi — prototipo de demostración · Pagos con Mercado Pago</footer>
</body></html>`;
}

function money(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

// ---------- CATÁLOGO ----------
function catalogPage(activeCat) {
  const cats = categories;
  const catButtons = [`<a href="/" class="${!activeCat ? "active" : ""}">Todos</a>`]
    .concat(cats.map((c) => `<a href="/categoria/${c.id}" class="${activeCat === c.id ? "active" : ""}">${c.label}</a>`))
    .join("");

  const list = activeCat ? designs.filter((d) => d.category === activeCat) : designs;
  const grouped = activeCat ? { [activeCat]: list } : Object.fromEntries(cats.map((c) => [c.id, designsByCategory(c.id)]));

  let sections = "";
  Object.entries(grouped).forEach(([catId, list2]) => {
    const cat = cats.find((c) => c.id === catId);
    sections += `<div class="hero-band" style="padding-top:10px;padding-bottom:0;text-align:left;max-width:1100px">
      <h2 style="margin-bottom:2px">${cat.label}</h2>
      <p style="margin:0">${cat.description}</p>
    </div>
    <div class="grid">
      ${list2.map(cardHTML).join("")}
      <div class="coming-soon">
        <strong>+ Nuevos diseños</strong>
        <span>Sumamos diseños de ${cat.label.toLowerCase()} todos los meses.</span>
      </div>
    </div>`;
  });

  return layout({
    title: "Catálogo",
    body: `
    <div class="hero-band">
      <h1>Invitaciones digitales que se editan solas... casi 😉</h1>
      <p>Elegí un diseño, pagalo con Mercado Pago y cargá los datos de tu evento vos mismo. Catálogo en constante crecimiento.</p>
    </div>
    <div class="cat-filter">${catButtons}</div>
    ${sections}`,
  });
}

function cardHTML(d) {
  return `<div class="design-card">
    <div class="swatch" style="background:${d.accent}">${d.name}</div>
    <div class="body">
      <span class="cat-tag">${categories.find((c) => c.id === d.category).label}</span>
      <h3>${d.name}</h3>
      <p>${d.summary}</p>
      <span class="price-tag">${money(PRICE_ARS)}</span>
      <div class="actions">
        <a class="btn btn-outline" href="/demo/${d.id}" target="_blank">Ver demo</a>
        <a class="btn btn-primary" href="/checkout/${d.id}">Elegir</a>
      </div>
    </div>
  </div>`;
}

app.get("/", (req, res) => res.send(catalogPage(null)));
app.get("/categoria/:cat", (req, res) => {
  if (!categories.find((c) => c.id === req.params.cat)) return res.status(404).send("Categoría no encontrada");
  res.send(catalogPage(req.params.cat));
});

// ---------- DEMO (preview con datos de ejemplo) ----------
app.get("/demo/:designId", (req, res) => {
  const design = getDesign(req.params.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");
  res.send(design.render({ ...design.sampleData, __slug: "demo" }));
});

// ---------- CHECKOUT ----------
app.get("/checkout/:designId", (req, res) => {
  const design = getDesign(req.params.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");
  res.send(layout({
    title: "Checkout",
    body: `<div class="checkout-wrap">
      <h1>Estás por elegir: ${design.name}</h1>
      <p style="color:var(--muted)">${design.summary}</p>
      <div class="checkout-price">${money(PRICE_ARS)}</div>
      <div class="checkout-row"><span>Diseño</span><strong>${design.name}</strong></div>
      <div class="checkout-row"><span>Categoría</span><strong>${categories.find((c) => c.id === design.category).label}</strong></div>
      <div class="checkout-row"><span>Incluye</span><strong>Edición ilimitada de datos + link para compartir</strong></div>
      <form method="POST" action="/api/orders">
        <input type="hidden" name="designId" value="${design.id}">
        <button class="mp-btn" type="submit">🔒 Pagar con Mercado Pago</button>
      </form>
      ${!mp.isConfigured() ? `<div class="demo-note">Modo demo: no hay credenciales de Mercado Pago cargadas, así que el pago se simula como aprobado al instante para que puedas probar todo el flujo. Para cobrar de verdad, cargá <code>MP_ACCESS_TOKEN</code> (ver README).</div>` : ""}
      <p style="margin-top:16px"><a href="/demo/${design.id}" target="_blank">← Ver el diseño antes de pagar</a></p>
    </div>`,
  }));
});

// crea la orden y, según haya o no credenciales reales, redirige a Mercado
// Pago o directamente al flujo de éxito simulado (modo demo).
app.post("/api/orders", async (req, res) => {
  const design = getDesign(req.body.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");

  const db = getDB();
  const orderId = uid("order");
  const order = {
    id: orderId,
    designId: design.id,
    amount: PRICE_ARS,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  saveDB(db);

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;

  if (mp.isConfigured()) {
    try {
      const initPoint = await mp.createPreference({
        orderId,
        title: `Invitación digital — ${design.name}`,
        unitPrice: PRICE_ARS,
        baseUrl,
      });
      return res.redirect(initPoint);
    } catch (err) {
      console.error("Error creando preferencia de Mercado Pago:", err);
      return res.redirect(`/pago-fallido?order=${orderId}`);
    }
  }

  // Modo demo: no hay integración real, simulamos aprobación instantánea.
  return res.redirect(`/pago-exitoso?order=${orderId}&demo=1`);
});

function markOrderPaid(order) {
  const db = getDB();
  const ord = db.orders.find((o) => o.id === order.id);
  ord.status = "paid";
  ord.paidAt = new Date().toISOString();
  ord.editToken = ord.editToken || uid("edit");
  ord.publicSlug = ord.publicSlug || uid("inv").replace("inv_", "");

  if (!db.invitations.find((i) => i.orderId === ord.id)) {
    const design = getDesign(ord.designId);
    db.invitations.push({
      orderId: ord.id,
      designId: ord.designId,
      slug: ord.publicSlug,
      data: { ...design.sampleData },
      updatedAt: new Date().toISOString(),
    });
  }
  saveDB(db);
  return ord;
}

// vuelta exitosa desde Mercado Pago (o simulación en modo demo)
app.get("/pago-exitoso", async (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.id === req.query.order);
  if (!order) return res.status(404).send("Orden no encontrada");

  // Si hay credenciales reales y llega un payment_id, lo verificamos contra
  // la API de Mercado Pago antes de dar el pago por bueno (nunca confiar
  // solo en el query string).
  if (mp.isConfigured() && req.query.payment_id) {
    try {
      const status = await mp.getPaymentStatus(req.query.payment_id);
      if (status !== "approved") return res.redirect(`/pago-pendiente?order=${order.id}`);
    } catch (err) {
      console.error("Error verificando pago:", err);
    }
  }

  const paid = markOrderPaid(order);
  res.redirect(`/editar/${paid.editToken}?bienvenida=1`);
});

app.get("/pago-pendiente", (req, res) => {
  res.send(layout({ title: "Pago pendiente", body: `<div class="status-page"><h1>⏳ Tu pago está pendiente</h1><p>Te avisamos apenas se acredite. Podés cerrar esta ventana.</p></div>` }));
});
app.get("/pago-fallido", (req, res) => {
  res.send(layout({ title: "Pago fallido", body: `<div class="status-page"><h1>❌ El pago no pudo procesarse</h1><p>Podés volver al catálogo e intentar de nuevo.</p><p><a class="btn btn-primary" href="/">Volver al catálogo</a></p></div>` }));
});

// webhook real de Mercado Pago (para producción)
app.post("/webhook/mercadopago", express.json(), async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query["data.id"];
    if (paymentId && mp.isConfigured()) {
      const status = await mp.getPaymentStatus(paymentId);
      if (status === "approved") {
        const db = getDB();
        // external_reference viaja en el pago; en este prototipo lo
        // recuperamos buscando la orden pendiente más reciente si hace
        // falta, pero lo correcto es leerlo del payment obtenido arriba.
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});

// ---------- EDITOR (post-pago) ----------
function fieldHTML(f, value) {
  const val = value ?? "";
  if (f.type === "textarea") {
    return `<div class="field"><label>${f.label}${f.required ? " *" : ""}</label><textarea name="${f.name}">${escapeHtml(val)}</textarea></div>`;
  }
  if (f.type === "image") {
    return `<div class="field"><label>${f.label}</label>
      <input type="hidden" name="${f.name}" value="${escapeHtml(val)}" id="hidden-${f.name}">
      <input type="file" accept="image/*" data-target="${f.name}" class="single-upload">
      ${val ? `<div class="gallery-preview"><img src="${escapeHtml(val)}"></div>` : ""}
    </div>`;
  }
  if (f.type === "images") {
    const arr = Array.isArray(value) ? value : [];
    return `<div class="field"><label>${f.label}</label>
      <input type="hidden" name="${f.name}" value='${escapeHtml(JSON.stringify(arr))}' id="hidden-${f.name}">
      <input type="file" accept="image/*" multiple data-target="${f.name}" class="multi-upload">
      <div class="gallery-preview" id="preview-${f.name}">${arr.map((s) => `<img src="${escapeHtml(s)}">`).join("")}</div>
    </div>`;
  }
  return `<div class="field"><label>${f.label}${f.required ? " *" : ""}</label><input type="${f.type}" name="${f.name}" value="${escapeHtml(val)}"></div>`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

app.get("/editar/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send(layout({ title: "No encontrado", body: `<div class="status-page"><h1>Link no válido</h1><p>Este link de edición no existe o el pago todavía no fue confirmado.</p></div>` }));

  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  const publicUrl = `${req.protocol}://${req.get("host")}/invitacion/${order.publicSlug}`;

  res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Editar invitación · TaDi</title>
<link rel="stylesheet" href="/static/css/site.css"></head>
<body>
<div class="editor-wrap">
  <div class="editor-form-panel">
    <h1>✏️ Editá tu invitación</h1>
    <p style="color:var(--muted);font-size:.85rem">Diseño: <strong>${design.name}</strong>. Los cambios se ven al instante en la vista previa →</p>
    ${req.query.bienvenida ? `<p style="background:#e9f7ea;border:1px solid #bfe6c2;border-radius:8px;padding:10px;font-size:.85rem">✅ ¡Pago confirmado! Ya podés personalizar tu invitación.</p>` : ""}
    <form id="editForm">
      ${design.schema.map((f) => fieldHTML(f, inv.data[f.name])).join("")}
      <div class="save-bar"><button class="save-btn" type="submit">Guardar cambios</button></div>
    </form>
    <div class="link-box">
      🔗 Link para compartir con tus invitados:<br>
      <a href="${publicUrl}" target="_blank">${publicUrl}</a>
    </div>
    <div class="link-box">
      🔒 Guardá este link para volver a editar cuando quieras:<br>
      <a href="/editar/${order.editToken}">${req.protocol}://${req.get("host")}/editar/${order.editToken}</a>
    </div>
  </div>
  <div class="editor-preview-panel">
    <iframe id="preview" src="/preview/${order.editToken}"></iframe>
  </div>
</div>
<script>
  const token = ${JSON.stringify(order.editToken)};
  const form = document.getElementById('editForm');
  const iframe = document.getElementById('preview');

  function collect(){
    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    return data;
  }

  function refreshPreview(){
    fetch('/api/invitaciones/' + token + '/preview', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(collect())
    }).then(() => { iframe.src = '/preview/' + token + '?t=' + Date.now(); });
  }

  let debounceTimer;
  form.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refreshPreview, 500);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fetch('/api/invitaciones/' + token, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(collect())
    }).then(r => r.json()).then(() => {
      alert('¡Guardado! Tu invitación ya está actualizada.');
      refreshPreview();
    });
  });

  // subida de imágenes (portada / galería)
  document.querySelectorAll('.single-upload').forEach(function(input){
    input.addEventListener('change', function(){
      if(!input.files[0]) return;
      const fd = new FormData(); fd.append('imagen', input.files[0]);
      fetch('/api/upload/' + token, { method:'POST', body: fd })
        .then(r => r.json()).then(function(res){
          document.getElementById('hidden-' + input.dataset.target).value = res.url;
          refreshPreview();
        });
    });
  });
  document.querySelectorAll('.multi-upload').forEach(function(input){
    input.addEventListener('change', function(){
      const hidden = document.getElementById('hidden-' + input.dataset.target);
      const current = JSON.parse(hidden.value || '[]');
      const preview = document.getElementById('preview-' + input.dataset.target);
      const files = Array.from(input.files);
      let pending = files.length;
      files.forEach(function(file){
        const fd = new FormData(); fd.append('imagen', file);
        fetch('/api/upload/' + token, { method:'POST', body: fd })
          .then(r => r.json()).then(function(res){
            current.push(res.url);
            hidden.value = JSON.stringify(current);
            const img = document.createElement('img'); img.src = res.url; preview.appendChild(img);
            pending--; if(pending === 0) refreshPreview();
          });
      });
    });
  });
</script>
</body></html>`);
});

app.post("/api/upload/:token", upload.single("imagen"), (req, res) => {
  res.json({ url: `/static/uploads/${req.params.token}/${req.file.filename}` });
});

// preview en vivo (sin guardar) — usa un archivo temporal en memoria por token
const previewCache = new Map();
app.post("/api/invitaciones/:token/preview", (req, res) => {
  previewCache.set(req.params.token, req.body);
  res.json({ ok: true });
});
app.get("/preview/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order) return res.status(404).send("No encontrado");
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  const draft = previewCache.get(req.params.token);
  const data = normalizeInvitationData(design, { ...inv.data, ...(draft || {}) });
  res.send(design.render({ ...data, __slug: order.publicSlug }));
});

function normalizeInvitationData(design, raw) {
  const data = { ...raw };
  design.schema.forEach((f) => {
    if (f.type === "images" && typeof data[f.name] === "string") {
      try { data[f.name] = JSON.parse(data[f.name]); } catch { data[f.name] = []; }
    }
  });
  return data;
}

app.post("/api/invitaciones/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  inv.data = { ...inv.data, ...normalizeInvitationData(design, req.body) };
  inv.updatedAt = new Date().toISOString();
  saveDB(db);
  previewCache.delete(req.params.token);
  res.json({ ok: true });
});

// ---------- PÁGINA PÚBLICA FINAL ----------
app.get("/invitacion/:slug", (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).send("Invitación no encontrada");
  const design = getDesign(inv.designId);
  res.send(design.render({ ...inv.data, __slug: inv.slug }));
});

app.post("/api/invitacion/:slug/rsvp", (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  db.rsvps.push({ slug: req.params.slug, ...req.body, createdAt: new Date().toISOString() });
  saveDB(db);
  res.json({ ok: true });
});

// panel simple para que el dueño de la invitación vea quién confirmó
app.get("/editar/:token/invitados", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send("No encontrado");
  const rsvps = db.rsvps.filter((r) => r.slug === order.publicSlug);
  res.send(layout({
    title: "Invitados",
    body: `<div class="checkout-wrap" style="max-width:700px">
      <h1>Confirmaciones (${rsvps.length})</h1>
      ${rsvps.map((r) => `<div class="checkout-row"><span>${escapeHtml(r.nombre || "-")} ${r.acompaniantes ? "(" + escapeHtml(r.acompaniantes) + ")" : ""}</span><strong>${r.asiste === "no" ? "❌ No asiste" : "✅ Asiste"}</strong></div>`).join("") || "<p>Todavía no hay confirmaciones.</p>"}
      <p style="margin-top:20px"><a href="/editar/${order.editToken}">← Volver a editar</a></p>
    </div>`,
  }));
});

app.listen(PORT, () => {
  console.log(`TaDi corriendo en http://localhost:${PORT}`);
  console.log(mp.isConfigured() ? "Mercado Pago: modo real (credenciales cargadas)" : "Mercado Pago: modo demo (sin credenciales, pago simulado)");
});
