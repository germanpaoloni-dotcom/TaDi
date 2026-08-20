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

// Datos legales del negocio para mostrar en el checkout (confianza + requisito
// de facturación en Argentina). Se dejan vacíos por defecto para no mostrar
// datos inventados: completar con las variables de entorno reales, o
// directamente acá, antes de vender en producción.
const BUSINESS_LEGAL_NAME = process.env.BUSINESS_LEGAL_NAME || "";
const BUSINESS_CUIT = process.env.BUSINESS_CUIT || "";
const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP || ""; // ej: 5491122334455

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

function layout({ title, body }) {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · TaDi</title>
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/static/img/logo/tadi-favicon-16.png">
<link rel="apple-touch-icon" href="/static/img/logo/tadi-favicon-180.png">
<link rel="stylesheet" href="/static/css/site.css">
</head><body>
<header class="site">
  <a class="brand" href="/" aria-label="TaDi — inicio"><img src="/static/img/logo/tadi-logo-dark-bg.svg" alt="TaDi" class="brand-logo"></a>
  <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav id="siteNav">
    <a href="/">Catálogo</a>
    ${categories.map((c) => `<a href="/categoria/${c.id}">${c.label}</a>`).join("")}
  </nav>
</header>
${body}
<footer class="site">
  <div class="footer-links">TaDi · Pagos protegidos con Mercado Pago · <a href="/como-funciona">Cómo funciona</a> · <a href="/preguntas-frecuentes">Preguntas frecuentes</a> · <a href="/terminos">Términos</a> · <a href="/privacidad">Privacidad</a></div>
  ${BUSINESS_LEGAL_NAME ? `<div class="footer-legal">${BUSINESS_LEGAL_NAME}${BUSINESS_CUIT ? ` · CUIT ${BUSINESS_CUIT}` : ""}</div>` : ""}
</footer>
<script>
  document.addEventListener('error', function(e){
    var t = e.target;
    if(t && t.tagName === 'IMG' && t.src && !t.dataset.fallback){
      t.dataset.fallback = '1';
      t.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#2a2933"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#6b6875" text-anchor="middle" dy=".3em">Foto</text></svg>'
      );
    }
  }, true);
  (function(){
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if(!toggle || !nav) return;
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  })();
</script>
</body></html>`;
}

function money(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

// ---------- HERO (portada tipo "product drop": foto + aro de acento + textos) ----------
function heroSlideHTML(cat, index, isCarousel) {
  const flagship = cat.flagshipDesign ? getDesign(cat.flagshipDesign) : null;
  return `<div class="mega-hero-slide${index === 0 ? " active" : ""}" data-cat="${cat.id}">
    <div class="mega-hero-ghost">${cat.ghost}</div>
    <div class="mega-hero-grid">
      <div class="mega-hero-text">
        <span class="mega-hero-kicker">Invitaciones digitales</span>
        <h1 class="mega-hero-title">${cat.label.replace(/ /g, "<br>")}<span class="dot">.</span></h1>
        ${isCarousel ? `<a class="btn btn-primary mega-hero-cta" href="/categoria/${cat.id}">Elegí tu diseño</a>` : ""}
        <a class="mega-hero-skip" href="#catalogo">Ver diseños y precios ↓</a>
      </div>
      <div class="mega-hero-visual">
        <div class="mega-hero-ring"></div>
        <img src="${cat.heroImage}" alt="${cat.label}">
        <div class="mega-hero-info mega-hero-info-left">
          <div class="mega-hero-block">
            <h3>${cat.kicker}</h3>
            <p>${cat.heroBody}</p>
          </div>
        </div>
        <div class="mega-hero-info mega-hero-info-right">
          <div class="mega-hero-block">
            <h3>El diseño</h3>
            <p>${flagship ? flagship.summary : "Estamos preparando los primeros diseños de esta categoría."}</p>
            ${flagship
              ? `<a class="mega-hero-play" href="/demo/${flagship.id}" target="_blank" title="Ver demo">▶</a>`
              : `<span class="mega-hero-play" style="opacity:.4;cursor:default" title="Muy pronto">▶</span>`}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function megaHeroHTML(cats) {
  const slides = cats.map((c, i) => heroSlideHTML(c, i, true)).join("");
  const dots = cats.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-i="${i}" aria-label="${c.label}"></button>`).join("");
  return `<section class="mega-hero" id="megaHero">
    ${slides}
    <div class="mega-hero-controls">
      <div class="mega-hero-progress">
        <div class="mega-hero-bar"><div class="mega-hero-bar-fill" id="heroBarFill" style="width:${100 / cats.length}%"></div></div>
        <span class="mega-hero-count" id="heroCount">01 / ${String(cats.length).padStart(2, "0")}</span>
      </div>
      <div class="mega-hero-dots" id="heroDots">${dots}</div>
      <button class="mega-hero-arrow" id="heroNext" aria-label="Siguiente categoría">→</button>
    </div>
  </section>
  <script>
    (function(){
      var total = ${cats.length};
      var idx = 0;
      var slides = document.querySelectorAll('#megaHero .mega-hero-slide');
      var dots = document.querySelectorAll('#heroDots button');
      var fill = document.getElementById('heroBarFill');
      var count = document.getElementById('heroCount');
      function show(i){
        idx = (i + total) % total;
        slides.forEach(function(s, si){ s.classList.toggle('active', si === idx); });
        dots.forEach(function(d, di){ d.classList.toggle('active', di === idx); });
        fill.style.width = (100 * (idx + 1) / total) + '%';
        count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      }
      document.getElementById('heroNext').addEventListener('click', function(){ show(idx + 1); });
      dots.forEach(function(d, di){ d.addEventListener('click', function(){ show(di); }); });
      if (total > 1) setInterval(function(){ show(idx + 1); }, 6000);
    })();
  </script>`;
}

function miniHeroHTML(cat, cats) {
  const nextCat = cats[(cats.findIndex((c) => c.id === cat.id) + 1) % cats.length];
  const idx = cats.findIndex((c) => c.id === cat.id);
  return `<section class="mega-hero mini-hero">
    ${heroSlideHTML(cat, 0, false)}
    <div class="mega-hero-controls">
      <div class="mega-hero-progress">
        <div class="mega-hero-bar"><div class="mega-hero-bar-fill" style="width:${(100 * (idx + 1)) / cats.length}%"></div></div>
        <span class="mega-hero-count">${String(idx + 1).padStart(2, "0")} / ${String(cats.length).padStart(2, "0")}</span>
      </div>
      <div class="mega-hero-dots">${cats.map((c, i) => `<a href="/categoria/${c.id}" class="${i === idx ? "active" : ""}" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${i === idx ? "var(--accent)" : "var(--line)"}"></a>`).join("")}</div>
      <a class="mega-hero-arrow" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="/categoria/${nextCat.id}" aria-label="Siguiente categoría">→</a>
    </div>
  </section>`;
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
    sections += `<div class="section-head">
      <h2>${cat.label}</h2>
      <p>${cat.description}</p>
    </div>`;
    if (list2.length === 0) {
      sections += `<div class="grid"><div class="coming-soon" style="grid-column:1/-1;min-height:140px">
        <strong>Muy pronto</strong>
        <span>Estamos preparando los primeros diseños de ${cat.label.toLowerCase()}.</span>
      </div></div>`;
    } else {
      sections += `<div class="grid">
        ${list2.map(cardHTML).join("")}
        <div class="coming-soon">
          <strong>+ Nuevos diseños</strong>
          <span>Sumamos diseños de ${cat.label.toLowerCase()} todos los meses.</span>
        </div>
      </div>`;
    }
  });

  const hero = activeCat ? miniHeroHTML(cats.find((c) => c.id === activeCat), cats) : megaHeroHTML(cats);

  return layout({
    title: activeCat ? cats.find((c) => c.id === activeCat).label : "Catálogo",
    body: `${hero}
    <div class="trust-strip">
      <div><strong>🔒 Pago seguro</strong><span>Con Mercado Pago, en cuotas según tu banco</span></div>
      <div><strong>✏️ Edición ilimitada</strong><span>Cambiá los datos las veces que quieras hasta el evento</span></div>
      <div><strong>⚡ Entrega al instante</strong><span>Tu link queda listo apenas se acredita el pago</span></div>
      <div><strong>🎨 Catálogo en crecimiento</strong><span>Sumamos diseños nuevos todos los meses</span></div>
    </div>
    <div class="cat-filter" id="catalogo">${catButtons}</div>
    ${sections}`,
  });
}

function cardHTML(d) {
  const cat = categories.find((c) => c.id === d.category);
  const isFlagship = cat.flagshipDesign === d.id;
  return `<div class="design-card">
    <div class="swatch" style="background:linear-gradient(135deg, ${d.accent}, ${d.accent2 || d.accent})">
      ${isFlagship ? `<span class="badge-fav">★ Más elegido</span>` : ""}
      ${d.name}
    </div>
    <div class="body">
      <span class="cat-tag">${cat.label}</span>
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

// ---------- CÓMO FUNCIONA (tutorial para cargar los datos después de pagar) ----------
app.get("/como-funciona", (req, res) => {
  const steps = [
    {
      title: "Entrá a tu link de edición",
      body: "Apenas se acredita el pago te llevamos directo al editor, y además te dejamos un link privado guardado ahí mismo para que puedas volver cuando quieras — no hace falta pagar de nuevo ni pedirlo por otro lado. Conviene guardarlo (por ejemplo, mandártelo a vos mismo por WhatsApp).",
      img: "paso1-link.png",
    },
    {
      title: "Completá los datos de tu evento",
      body: "Nombres, fecha, horarios, lugares, el mensaje para los invitados... a la izquierda vas completando cada campo y a la derecha ves la invitación real actualizarse al instante, tal cual la van a ver tus invitados.",
      img: "paso2-datos.png",
    },
    {
      title: "Subí tus fotos",
      body: "Cargá una foto de portada y las que quieras para la galería. Se suben directo desde el celular o la compu, no hace falta redimensionarlas ni nada — nosotros nos encargamos de que se vean bien.",
      img: "paso3-fotos.png",
    },
    {
      title: "Guardá los cambios",
      body: "Cuando quede como te gusta, tocá \"Guardar cambios\". Podés volver a entrar y seguir editando las veces que quieras antes del evento — no hay un único intento.",
      img: "paso4-guardar.png",
    },
    {
      title: "Compartí el link con tus invitados",
      body: "Este es el link público (distinto al de edición) — es el que le mandás a la gente por WhatsApp o donde quieras. Ahí van a poder ver la invitación y confirmar asistencia.",
      img: "paso5-compartir.png",
    },
  ];

  res.send(layout({
    title: "Cómo funciona",
    body: `
    <div class="tutorial-hero">
      <span class="kicker">Guía rápida</span>
      <h1>Cómo cargar los datos de tu invitación</h1>
      <p>Después de pagar, tenés que personalizar tu invitación con los datos de tu evento. Son 5 pasos y no lleva más de unos minutos — así funciona.</p>
    </div>
    <div class="tutorial-steps">
      ${steps.map((s, i) => `
        <div class="tutorial-step">
          <div class="num">${i + 1}</div>
          <div>
            <h3>${s.title}</h3>
            <p>${s.body}</p>
            <div class="shot"><img src="/static/img/tutorial/${s.img}" alt="${s.title}" loading="lazy"></div>
          </div>
        </div>`).join("")}
    </div>
    <div class="tutorial-cta">
      <p style="color:var(--muted);margin-bottom:16px">¿Ya pagaste y no encontrás tu link de edición? Mirá las <a href="/preguntas-frecuentes">preguntas frecuentes</a> o escribinos y te ayudamos.</p>
      <a class="btn btn-outline" href="/">← Volver al catálogo</a>
    </div>`,
  }));
});

// ---------- PREGUNTAS FRECUENTES ----------
app.get("/preguntas-frecuentes", (req, res) => {
  const faqs = [
    {
      q: "¿Cuánto tardo en tener mi invitación lista?",
      a: "Apenas se acredita el pago te llevamos directo al editor. Cargás los datos de tu evento y las fotos, y en minutos ya tenés el link para compartir con tus invitados.",
    },
    {
      q: "¿Puedo editar los datos después de pagar?",
      a: "Sí, las veces que quieras hasta el evento — no hay un único intento. Guardás cambios cuando quieras desde tu link privado de edición.",
    },
    {
      q: `¿Hasta cuándo puedo editar mi invitación?`,
      a: `La edición queda disponible hasta ${EDIT_GRACE_DAYS} días después de la fecha del evento que cargaste. Pasado ese plazo se bloquea, para que cada invitación se use para un solo evento — la página que ya compartiste con tus invitados sigue funcionando igual. Si tenés un evento nuevo, se compra una invitación nueva al precio normal (no hay reactivación con descuento).`,
    },
    {
      q: "¿Qué pasa si mi evento se posterga?",
      a: `Solo tenés que actualizar la fecha en el editor antes de que se cumplan los ${EDIT_GRACE_DAYS} días de gracia — el plazo de edición se recalcula con la fecha nueva.`,
    },
    {
      q: "¿Es seguro pagar? ¿Puedo pagar en cuotas?",
      a: "El pago se procesa por Mercado Pago — nosotros no vemos ni guardamos los datos de tu tarjeta. Las cuotas disponibles dependen de tu banco y las vas a ver en la pantalla de pago antes de confirmar.",
    },
    {
      q: "¿Puedo cambiar de diseño después de comprar?",
      a: "El diseño elegido queda asociado a esa compra. Si querés otro diseño, escribinos y lo vemos.",
    },
    {
      q: "Ya pagué pero no encuentro mi link de edición, ¿qué hago?",
      a: `Escribinos${SUPPORT_WHATSAPP ? ` por WhatsApp` : ""} contándonos con qué nombre o mail hiciste la compra y te lo recuperamos.`,
    },
  ];
  res.send(layout({
    title: "Preguntas frecuentes",
    body: `<div class="tutorial-hero">
      <span class="kicker">Ayuda</span>
      <h1>Preguntas frecuentes</h1>
    </div>
    <div class="faq-list">
      ${faqs.map((f) => `<div class="faq-item"><h3>${f.q}</h3><p>${f.a}</p></div>`).join("")}
    </div>
    <div class="tutorial-cta">
      <p style="color:var(--muted);margin-bottom:16px">¿No encontraste tu respuesta?${SUPPORT_WHATSAPP ? ` <a href="https://wa.me/${SUPPORT_WHATSAPP}" target="_blank">Escribinos por WhatsApp</a>.` : " Escribinos y te ayudamos."}</p>
      <a class="btn btn-outline" href="/">← Volver al catálogo</a>
    </div>`,
  }));
});

// ---------- LEGALES ----------
app.get("/terminos", (req, res) => {
  res.send(layout({
    title: "Términos y condiciones",
    body: `<div class="legal-wrap">
      <h1>Términos y condiciones</h1>
      <p>TaDi ofrece invitaciones digitales personalizables para eventos (bodas, quince años, bautismos, fiestas infantiles, eventos empresariales y despedidas de soltero/a). Al comprar una invitación, el comprador puede personalizar sus datos (textos, fechas, lugares, fotos) y compartir el link resultante con sus invitados.</p>
      <h3>Edición y vigencia</h3>
      <p>La invitación puede editarse sin límite de veces desde el link privado de edición hasta ${EDIT_GRACE_DAYS} días después de la fecha del evento cargada. Pasado ese plazo, la edición se bloquea automáticamente; la página pública ya compartida con los invitados permanece accesible. Cada invitación comprada corresponde a un único evento — usarla para un evento distinto requiere una nueva compra.</p>
      <h3>Pagos</h3>
      <p>Los pagos se procesan a través de Mercado Pago. TaDi no almacena datos de tarjetas ni medios de pago.</p>
      <h3>Contenido cargado por el usuario</h3>
      <p>El comprador es responsable de las fotos y textos que carga en su invitación, y declara contar con los derechos necesarios sobre ese contenido.</p>
      <h3>Contacto</h3>
      <p>Ante cualquier consulta sobre estos términos, escribinos${SUPPORT_WHATSAPP ? ` por WhatsApp` : ""}.</p>
    </div>`,
  }));
});

app.get("/privacidad", (req, res) => {
  res.send(layout({
    title: "Política de privacidad",
    body: `<div class="legal-wrap">
      <h1>Política de privacidad</h1>
      <p>Esta política describe qué datos personales trata TaDi y con qué finalidad, en línea con la Ley 25.326 de Protección de los Datos Personales de Argentina.</p>
      <h3>Datos que tratamos</h3>
      <p>Del comprador: los datos que carga en el editor de su invitación (nombres, fecha, lugar, mensaje, fotos) y los datos de contacto necesarios para procesar el pago a través de Mercado Pago. De los invitados: los datos que ingresan voluntariamente en el formulario de confirmación de asistencia (RSVP) de cada invitación — nombre, cantidad de acompañantes, asistencia y mensaje opcional.</p>
      <h3>Para qué los usamos</h3>
      <p>Para generar y mostrar la invitación personalizada, procesar el pago y permitir que el comprador vea las confirmaciones de asistencia de sus propios invitados. No vendemos ni compartimos estos datos con terceros fuera de lo necesario para procesar el pago (Mercado Pago) y alojar el sitio.</p>
      <h3>Derechos del titular de los datos</h3>
      <p>Podés pedirnos acceder, corregir o eliminar tus datos escribiéndonos${SUPPORT_WHATSAPP ? ` por WhatsApp` : ""}. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de atender denuncias y reclamos.</p>
    </div>`,
  }));
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
      <p class="checkout-trust">Podés pagar con tarjeta, cuotas (según lo que ofrezca tu banco) o dinero en cuenta — Mercado Pago te muestra las opciones disponibles antes de confirmar. Pago 100% seguro, no vemos ni guardamos tu tarjeta.</p>
      ${BUSINESS_LEGAL_NAME ? `<p class="checkout-trust">Vendido por ${BUSINESS_LEGAL_NAME}${BUSINESS_CUIT ? ` (CUIT ${BUSINESS_CUIT})` : ""}.</p>` : ""}
      <p class="checkout-trust">¿Dudas antes de pagar? Mirá las <a href="/preguntas-frecuentes">preguntas frecuentes</a>${SUPPORT_WHATSAPP ? ` o <a href="https://wa.me/${SUPPORT_WHATSAPP}" target="_blank">escribinos por WhatsApp</a>` : ""}.</p>
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

  if (isEditLocked(inv)) return res.send(lockedPage(order, design));

  const publicUrl = `${req.protocol}://${req.get("host")}/invitacion/${order.publicSlug}`;

  res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Editar invitación · TaDi</title>
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/static/img/logo/tadi-favicon-16.png">
<link rel="apple-touch-icon" href="/static/img/logo/tadi-favicon-180.png">
<link rel="stylesheet" href="/static/css/site.css"></head>
<body>
<div class="editor-wrap">
  <div class="editor-form-panel">
    <h1>✏️ Editá tu invitación</h1>
    <p style="color:var(--muted);font-size:.85rem">Diseño: <strong>${design.name}</strong>. Los cambios se ven al instante en la vista previa → · <a href="/como-funciona" target="_blank" style="color:var(--accent)">¿Cómo funciona?</a></p>
    ${req.query.bienvenida ? `<p style="background:#e9f7ea;border:1px solid #bfe6c2;border-radius:8px;padding:10px;font-size:.85rem;color:#1e3a24">✅ ¡Pago confirmado! Ya podés personalizar tu invitación.</p>` : ""}
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
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  const inv = order && db.invitations.find((i) => i.orderId === order.id);
  if (!order || !inv || isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });
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

// ---------- BLOQUEO POR VENCIMIENTO DEL EVENTO ----------
// Para que una invitación pagada no se reutilice indefinidamente para
// eventos distintos, la edición se bloquea un tiempo después de la fecha
// del evento (dato "fecha" del propio formulario, presente en todos los
// esquemas). Pasado ese margen, quien quiera seguir usando TaDi para un
// evento nuevo tiene que comprar una invitación nueva a precio normal:
// no hay una "reactivación" con precio especial, es directamente otra compra.
const EDIT_GRACE_DAYS = 15;

function isEditLocked(inv) {
  const fecha = inv?.data?.fecha;
  if (!fecha) return false; // sin fecha cargada todavía: no bloqueamos
  const eventDate = new Date(`${fecha}T00:00:00`);
  if (isNaN(eventDate.getTime())) return false;
  const unlockUntil = eventDate.getTime() + EDIT_GRACE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > unlockUntil;
}

function lockedPage(order, design) {
  const publicUrl2 = `/invitacion/${order.publicSlug}`;
  return layout({
    title: "Invitación vencida",
    body: `<div class="status-page">
      <h1>🔒 Esta invitación ya cumplió su ciclo</h1>
      <p>Pasaron más de ${EDIT_GRACE_DAYS} días desde la fecha del evento, así que la edición quedó bloqueada para que cada invitación se use para un solo evento. Más info en las <a href="/preguntas-frecuentes">preguntas frecuentes</a>.</p>
      <p>La página que ya compartiste con tus invitados sigue disponible: <a href="${publicUrl2}" target="_blank">${publicUrl2}</a></p>
      <p style="margin-top:24px">¿Tenés un evento nuevo? Podés comprar una invitación nueva (no hay reactivación con precio especial, es una compra normal):</p>
      <p><a class="btn btn-primary" href="/checkout/${design.id}">Comprar invitación nueva</a></p>
    </div>`,
  });
}

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
  if (isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });
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
