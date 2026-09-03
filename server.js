// IMPORTANTE — antes que cualquier otro require: en Render (y hostings
// parecidos), Node 18+ puede resolver smtp.gmail.com priorizando su
// dirección IPv6 aunque el hosting no tenga salida IPv6 real, y la conexión
// muere con ENETUNREACH. Pasarle family:4 a nodemailer no alcanza — el
// cambio real de comportamiento está en el orden de resolución DNS de Node
// mismo. Esto lo fuerza a nivel de todo el proceso, así CUALQUIER conexión
// saliente (mail, Mercado Pago, lo que sea) prefiere IPv4 cuando existe.
require("dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { getDB, saveDB, uid } = require("./db");
const { categories, designs, getDesign, designsByCategory, isCategoryInSeason, visibleCategories } = require("./designs");
const mp = require("./mercadopago");
const mailer = require("./mailer");
const { eventoLabel, photoShareLabel, formatFechaCorta, TADI_FOOTER_MARKER } = require("./designs/widgets");
const pricing = require("./designs/pricing");
const music = require("./designs/music");
const { buildConfirmacionesWorkbook } = require("./excel-export");

const app = express();
const PORT = process.env.PORT || 3000;
// Render (y la mayoría de los hosts) ponen el server detrás de un proxy que
// termina el HTTPS: sin esto, req.protocol siempre da "http" aunque el sitio
// real sea https, y los links armados a partir de él (mails, etc.) salen mal.
app.set("trust proxy", true);

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
// Google Analytics 4 — measurement ID (formato "G-XXXXXXXXXX"), se consigue
// en analytics.google.com. Si no está cargada, simplemente no se inserta
// ningún script de tracking (nada se rompe, el sitio sigue andando igual).
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || "";

// Headers de seguridad estándar (X-Content-Type-Options, X-Frame-Options,
// Referrer-Policy, HSTS, etc.). El CSP por defecto de helmet queda
// desactivado a propósito: cada diseño de tarjeta trae su propio <style>
// y <script> inline en el mismo documento (así están armados los 30+
// archivos de designs/*), y una CSP estricta sin nonces rompería eso. El
// resto de los headers de helmet no depende de eso y no tiene contras.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Límite general para rutas públicas que reciben datos (RSVP, subida de
// fotos, crear una orden): sin esto no había NINGÚN freno a mandar miles de
// requests por minuto desde una sola IP (spam de RSVP, llenar el disco de
// fotos, etc.). Los números son generosos para uso real (un invitado
// confirmando o subiendo una foto no se acerca ni de cerca a esto).
const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
});

// Límite específico para /editar/:token: es la ÚNICA barrera que protege el
// editor de un comprador (no hay usuario/contraseña, es el token en sí). Sin
// límite de intentos, alguien podría probar tokens al voleo muy rápido. El
// número es generoso para el uso real (un comprador recargando su propio
// editor muchas veces mientras carga fotos, por ejemplo) pero corta en seco
// cualquier intento de ir probando tokens distintos a alta velocidad.
const editTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiados intentos desde esta conexión. Probá de nuevo en unos minutos.",
});

// Límite para el login del panel de administrador (Basic Auth) — las
// credenciales ya son fuertes (variables de entorno, comparación a tiempo
// constante), esto es una capa extra para no dejar la puerta abierta a
// probar contraseñas sin freno.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiados intentos desde esta conexión. Probá de nuevo en unos minutos.",
});
app.use("/admin", adminLimiter);
app.use("/editar/:token", editTokenLimiter);
app.use("/api/invitaciones/:token", editTokenLimiter);

// Cache-busting para site.css: el navegador (sobre todo Safari de iOS) puede
// quedarse con una copia vieja del CSS en caché incluso después de un
// despliegue nuevo. Le agregamos ?v=<fecha de modificación del archivo> al
// link del stylesheet para que cada actualización real fuerce una URL
// distinta y el navegador SIEMPRE traiga la versión actual.
let CSS_VERSION = Date.now();
try {
  CSS_VERSION = fs.statSync(path.join(__dirname, "public", "css", "site.css")).mtimeMs;
} catch {}
const CSS_HREF = `/static/css/site.css?v=${CSS_VERSION}`;

// Mismo esquema de cache-busting que site.css, para los dos assets de la
// intro cinemática de marca (ver INTRO_HTML más abajo).
let INTRO_CSS_VERSION = Date.now();
try {
  INTRO_CSS_VERSION = fs.statSync(path.join(__dirname, "public", "css", "intro.css")).mtimeMs;
} catch {}
const INTRO_CSS_HREF = `/static/css/intro.css?v=${INTRO_CSS_VERSION}`;
let INTRO_JS_VERSION = Date.now();
try {
  INTRO_JS_VERSION = fs.statSync(path.join(__dirname, "public", "js", "intro.js")).mtimeMs;
} catch {}
const INTRO_JS_HREF = `/static/js/intro.js?v=${INTRO_JS_VERSION}`;

// Imagen default para Open Graph / Twitter Card en las páginas de marketing
// (home, categorías, como-funciona, etc.) que no tienen una imagen propia
// como sí la tienen las invitaciones o los demos de diseño.
let OG_IMAGE_VERSION = Date.now();
try {
  OG_IMAGE_VERSION = fs.statSync(path.join(__dirname, "public", "img", "og", "tadi-og-default.png")).mtimeMs;
} catch {}
const OG_IMAGE_PATH = `/static/img/og/tadi-og-default.png?v=${OG_IMAGE_VERSION}`;

// Palabras clave reales del negocio (sin keyword stuffing) para el <meta
// name="keywords"> de las páginas públicas.
const SITE_KEYWORDS = "invitaciones digitales, invitaciones de casamiento, invitaciones de cumpleaños, invitaciones de XV, invitaciones online, tarjetas de invitación digitales, invitaciones para eventos Argentina";

// JSON-LD "Organization" — solo con datos reales del negocio (nunca se
// inventan razón social/CUIT: esos dos solo se incluyen si están cargados
// como variable de entorno).
function organizationJsonLd(baseUrl) {
  const legalName = (process.env.BUSINESS_LEGAL_NAME || "").trim();
  const taxId = (process.env.BUSINESS_CUIT || "").trim();
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TaDi",
    "url": baseUrl,
    "logo": absoluteUrl(baseUrl, "/static/img/logo/tadi-logo-light-bg.svg"),
    "sameAs": ["https://instagram.com/tadi.tarjetas"],
    "email": "hola@tadi.com.ar",
  };
  if (legalName) org.legalName = legalName;
  if (taxId) org.taxID = taxId;
  return org;
}


function websiteJsonLd(baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TaDi",
    "url": baseUrl,
  };
}

// Los nombres de carpeta de subida salen de un parámetro de la URL (token
// de edición o slug público). Nunca hay que confiar en eso a ciegas para
// armar una ruta de archivo: sin este chequeo, alguien podría mandar un
// valor con "../" (codificado) e intentar escribir fuera de public/uploads.
// Los tokens/slugs reales que genera uid() son siempre alfanuméricos con
// "_"/"-", así que cualquier otra cosa se rechaza directo.
const SAFE_UPLOAD_DIR_RE = /^[A-Za-z0-9_-]+$/;
function safeUploadDirName(name) {
  return SAFE_UPLOAD_DIR_RE.test(name || "") ? name : null;
}

// --- subida de imágenes (portada / galería) ---
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const safe = safeUploadDirName(req.params.token);
      if (!safe) return cb(new Error("token inválido"));
      const dir = path.join(__dirname, "public", "uploads", safe);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "")),
  }),
  // Solo imágenes reales — más abajo, además, cada imagen se vuelve a
  // codificar con sharp (que rechaza cualquier archivo que no pueda decodificar
  // como imagen) antes de quedar accesible por URL, así que esta validación
  // por mimetype es la primera capa, no la única.
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
  // Las fotos que vienen directo de la cámara de un celular (12MP+, HEIC o
  // JPEG sin comprimir) pueden pesar bien más de los 8MB que había antes —
  // con ese límite tan bajo, subir una foto real fallaba en silencio (el
  // fetch del editor no mostraba ningún error). Subimos el límite acá y,
  // más abajo, cada imagen se re-comprime automáticamente con sharp así el
  // archivo final que queda en el server siempre es liviano igual.
  limits: { fileSize: 25 * 1024 * 1024 },
});

// --- subida de fotos del "muro de invitados" (feature "muro", plan Plus+)
// --- misma idea que el upload de arriba, pero público (lo sube cualquier
// invitado desde el link de la invitación, no hace falta el editToken del
// dueño) y guardado en su propia carpeta por slug.
const uploadMuroPhoto = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const safe = safeUploadDirName(req.params.slug);
      if (!safe) return cb(new Error("slug inválido"));
      const dir = path.join(__dirname, "public", "uploads", "muro", safe);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg"),
  }),
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// --- subida de video de portada (feature "video", plan Premium bodas/xv) ---
// A diferencia de las fotos, el video no se re-procesa con sharp (sharp es
// solo de imágenes) — se guarda tal cual llega, solo validando que sea un
// archivo de video y limitando el tamaño para que la invitación no quede
// pesadísima de cargar en el celular de un invitado.
const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const safe = safeUploadDirName(req.params.token);
      if (!safe) return cb(new Error("token inválido"));
      const dir = path.join(__dirname, "public", "uploads", safe);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = (file.originalname.match(/\.[a-zA-Z0-9]+$/) || [".mp4"])[0].toLowerCase();
      cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext);
    },
  }),
  fileFilter: (req, file, cb) => cb(null, /^video\//.test(file.mimetype)),
  // 60MB: bastante para 15-20s de video de portada en buena calidad sin
  // que la invitación tarde una eternidad en cargar en 4G.
  limits: { fileSize: 60 * 1024 * 1024 },
});

// ---------- vista previa al compartir el link (WhatsApp, Facebook, etc.) ----------
// WhatsApp arma la tarjeta de preview leyendo las etiquetas Open Graph
// (og:title/og:description/og:image) del <head> del link. Cada diseño ya
// arma su propio documento HTML completo (no pasa por layout()), así que en
// vez de tocar los 30+ archivos de diseño, inyectamos estas etiquetas acá,
// en el servidor, justo después de <head> (ese tag abre igual en todos los
// diseños, así que el reemplazo es seguro). El título sale del propio
// <title> que cada diseño ya define, así que funciona automáticamente con
// diseños nuevos sin tener que acordarse de nada.
function absoluteUrl(baseUrl, url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return baseUrl.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}

// PUBLIC_BASE_URL (variable de entorno en Render) tiene prioridad si está
// cargada, pero si alguien la carga mal (sin "https://", con una barra al
// final, con espacios, vacía-pero-definida, etc.) los links del mail salen
// rotos ("http:///invitacion/...", dominios con doble barra, etc.) aunque
// el código que arma la URL esté bien. Por eso la validamos: si no tiene
// forma de URL absoluta prolija, la ignoramos del todo y usamos el dominio
// real de la request en su lugar (que siempre es correcto).
function resolvePublicBaseUrl(req) {
  const fromEnv = (process.env.PUBLIC_BASE_URL || "").trim();
  if (/^https?:\/\/[^\s/]+$/i.test(fromEnv)) return fromEnv;
  if (fromEnv) {
    console.warn(`[server] PUBLIC_BASE_URL="${fromEnv}" no tiene forma de URL válida (debe ser algo como "https://tadi.com.ar", sin barra al final) — se ignora y se usa el dominio de la request.`);
  }
  return `${req.protocol}://${req.get("host")}`;
}

function injectOgTags(html, { baseUrl, url, image, description, title: titleOverride, noindex = false }) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleOverride || (titleMatch ? titleMatch[1].trim() : "TaDi — Invitación digital");
  const desc = description || "Mirá la invitación y confirmá tu asistencia.";
  const img = absoluteUrl(baseUrl, image);
  const tags = `
    ${noindex ? `<meta name="robots" content="noindex,nofollow">` : (url ? `<link rel="canonical" href="${escapeHtml(url)}">` : "")}
    <meta property="og:site_name" content="TaDi">
    <meta property="og:locale" content="es_AR">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    ${img ? `<meta property="og:image" content="${escapeHtml(img)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">` : ""}
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    ${img ? `<meta name="twitter:image" content="${escapeHtml(img)}">` : ""}
  `;
  html = html.replace("<head>", "<head>" + tags);
  // meta description "real" (la que usa Google en el resultado de búsqueda,
  // distinta de og:description que es la que usan las redes sociales) — si
  // el html ya la traía puesta (no debería, pero por las dudas) no la
  // duplicamos.
  if (desc && !/<meta\s+name="description"/i.test(html)) {
    html = html.replace("<head>", `<head><meta name="description" content="${escapeHtml(desc)}">`);
  }
  return html;
}

// Inserta el reproductor de música de fondo (feature "musica", plan Plus+)
// en la página pública de una invitación. Los navegadores bloquean el
// autoplay con sonido, así que arranca muteado y se ve una píldora flotante
// para que el invitado la active con un toque — patrón estándar para esto.
function injectBackgroundMusic(html, trackId) {
  if (!trackId) return html;
  const track = music.getTrack(trackId);
  if (!track) return html;
  const url = music.trackUrl(trackId);
  const noteIcon = `<svg class="tadi-bgm-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="16" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>`;
  const barsIcon = `<svg class="tadi-bgm-icon tadi-bgm-icon-bars" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="3" height="8" rx="1.5" fill="currentColor"><animate attributeName="height" values="8;16;8" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="12;4;12" dur="0.9s" repeatCount="indefinite"/></rect><rect x="10.5" y="6" width="3" height="14" rx="1.5" fill="currentColor"><animate attributeName="height" values="14;5;14" dur="0.9s" begin="0.15s" repeatCount="indefinite"/><animate attributeName="y" values="5;9.5;5" dur="0.9s" begin="0.15s" repeatCount="indefinite"/></rect><rect x="17" y="9" width="3" height="10" rx="1.5" fill="currentColor"><animate attributeName="height" values="10;18;10" dur="0.9s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="y" values="7;3;7" dur="0.9s" begin="0.3s" repeatCount="indefinite"/></rect></svg>`;
  const widget = `
    <audio id="tadi-bgm" loop preload="none" src="${escapeHtml(url)}"></audio>
    <button type="button" id="tadi-bgm-toggle" class="tadi-bgm-toggle" aria-label="Activar música de fondo">${noteIcon}<span class="tadi-bgm-label">Música</span></button>
    <style>
      .tadi-bgm-toggle{display:flex;align-items:center;gap:7px;position:fixed;right:18px;bottom:18px;z-index:60;background:#eaeef2;color:#33363f;border:0;border-radius:30px;padding:11px 18px;font-size:.8rem;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .tadi-bgm-toggle.playing{box-shadow:inset 4px 4px 9px #c5cbd6,inset -4px -4px 9px #ffffff;color:#e8672e;}
      .tadi-bgm-icon{flex:none;display:block}
      .tadi-bgm-icon-bars{display:none}
      .tadi-bgm-toggle.playing .tadi-bgm-icon-note{display:none}
      .tadi-bgm-toggle.playing .tadi-bgm-icon-bars{display:block}
    </style>
    <script>
      (function(){
        var audio = document.getElementById('tadi-bgm');
        var btn = document.getElementById('tadi-bgm-toggle');
        if(!audio || !btn) return;
        var noteIcon = btn.querySelector('svg');
        noteIcon.classList.add('tadi-bgm-icon-note');
        noteIcon.insertAdjacentHTML('afterend', ${JSON.stringify(barsIcon)});
        var label = btn.querySelector('.tadi-bgm-label');
        var playing = false;
        function start(){
          if (playing) return;
          audio.volume = 0.55;
          audio.play().then(function(){
            label.textContent = 'Pausar';
            btn.classList.add('playing');
            playing = true;
          }).catch(function(){});
        }
        function stop(){
          audio.pause();
          label.textContent = 'Música';
          btn.classList.remove('playing');
          playing = false;
        }
        btn.addEventListener('click', function(){ playing ? stop() : start(); });

        // Los navegadores no dejan arrancar audio con sonido antes de que la
        // persona interactúe con la página (política de autoplay), así que
        // "suena apenas abrís la tarjeta" en la práctica es "suena apenas
        // tocás/scrolleás por primera vez" — enganchamos el primer gesto que
        // sea (tap, scroll o tecla), no hace falta que toquen el botón de
        // música puntualmente. El botón sigue sirviendo para pausar/reanudar
        // después.
        var autoStartEvents = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
        function autoStart(){ start(); autoStartEvents.forEach(function(ev){ document.removeEventListener(ev, autoStart); }); }
        autoStartEvents.forEach(function(ev){ document.addEventListener(ev, autoStart, { once: true, passive: true }); });
      })();
    </script>
  `;
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Convierte el link de Google Maps que carga el comprador (el mismo campo
// "direccionMapa" de siempre, pensado para copiar/pegar un link normal) en
// una URL de embed de Google Maps SIN API key — Google sigue soportando el
// formato viejo "?output=embed" para esto, gratis, así no hace falta pagar
// ni gestionar credenciales de la Maps Embed API solo para un iframe.
// Si el link no es reconocible como de Google Maps, devuelve null y el
// mapa embebido simplemente no se agrega (el link de toda la vida que ya
// pone cada diseño en su propio template sigue funcionando igual).
function toMapEmbedUrl(mapsUrl) {
  if (!mapsUrl) return null;
  let url;
  try {
    url = new URL(mapsUrl);
  } catch {
    return null;
  }
  if (!/google\./i.test(url.hostname)) return null;
  const q = url.searchParams.get("q");
  if (q) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  }
  // Link tipo .../maps/place/Nombre+Lugar/... sin query "q": lo usamos
  // directo, sumando output=embed si todavía no lo tiene.
  if (/\/maps\//i.test(url.pathname)) {
    url.searchParams.set("output", "embed");
    return url.toString();
  }
  return null;
}

// Inserta el botón flotante "📍 Mapa" (feature "mapa", plan Plus+) que abre
// un panel con el mapa embebido interactivo — mismo patrón que el widget de
// música, para que la experiencia sea consistente entre ambos features.
function injectMapEmbed(html, direccionMapa) {
  const embedUrl = toMapEmbedUrl(direccionMapa);
  if (!embedUrl) return html;
  const widget = `
    <button type="button" id="tadi-map-toggle" class="tadi-map-toggle" aria-label="Ver mapa interactivo">📍 Mapa</button>
    <div id="tadi-map-panel" class="tadi-map-panel" hidden>
      <div class="tadi-map-panel-inner">
        <button type="button" id="tadi-map-close" class="tadi-map-close" aria-label="Cerrar mapa">✕</button>
        <iframe id="tadi-map-iframe" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen data-src="${escapeHtml(embedUrl)}"></iframe>
      </div>
    </div>
    <style>
      .tadi-map-toggle{position:fixed;left:18px;bottom:18px;z-index:60;background:#eaeef2;color:#33363f;border:0;border-radius:30px;padding:11px 18px;font-size:.8rem;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .tadi-map-panel{position:fixed;inset:0;z-index:70;background:rgba(51,54,63,.55);display:flex;align-items:center;justify-content:center;padding:20px;}
      .tadi-map-panel[hidden]{display:none;}
      .tadi-map-panel-inner{position:relative;background:#eaeef2;border-radius:20px;box-shadow:14px 14px 30px #c5cbd6,-14px -14px 30px #ffffff;width:100%;max-width:640px;height:min(70vh,520px);overflow:hidden;}
      .tadi-map-panel-inner iframe{width:100%;height:100%;border:0;display:block;}
      .tadi-map-close{position:absolute;top:10px;right:10px;z-index:2;background:#eaeef2;color:#33363f;border:0;width:34px;height:34px;border-radius:50%;font-size:1rem;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
    </style>
    <script>
      (function(){
        var btn = document.getElementById('tadi-map-toggle');
        var panel = document.getElementById('tadi-map-panel');
        var closeBtn = document.getElementById('tadi-map-close');
        var iframe = document.getElementById('tadi-map-iframe');
        if(!btn || !panel) return;
        function open(){
          if (!iframe.src) iframe.src = iframe.dataset.src;
          panel.hidden = false;
        }
        function close(){ panel.hidden = true; }
        btn.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        panel.addEventListener('click', function(e){ if (e.target === panel) close(); });
      })();
    </script>
  `;
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Panel de fotos del muro de invitados (feature "muro", plan Plus+): antes
// era un botón flotante "📷 Fotos" que abría un modal — quedaba feo
// (una píldora flotando sobre la tarjeta, sin relación visual con el
// diseño) y desconectado del resto del contenido. Ahora es una sección
// más, insertada en el flujo normal de la página justo arriba del pie de
// marca "Tarjeta creada en TaDi" (usando TADI_FOOTER_MARKER que deja
// tadiFooterWidget) en vez de flotar por encima de todo — funciona igual
// en los ~60 diseños sin tener que tocar el HTML de cada uno. Estilos
// 100% inline (independientes de la paleta del diseño, mismo criterio que
// el pie de marca) y el carrusel de fotos ya subidas es simplemente una
// tira con scroll horizontal que se va llenando a medida que suben fotos.
function injectPhotoWall(html, { slug, photos, categoria, datos }) {
  const conQuien = photoShareLabel(categoria, datos);
  const thumbs = (photos || []).slice().reverse().map((p) => `<div class="tadi-wall-thumb"><img src="${escapeHtml(p.url)}" loading="lazy"></div>`).join("");
  const widget = `
    <div class="tadi-wall-section">
      <div class="tadi-wall-inner">
        <p class="tadi-wall-eyebrow">📷 Muro de fotos</p>
        <h3 class="tadi-wall-title">Compartí tus fotos ${escapeHtml(conQuien)}</h3>
        <p class="tadi-wall-sub">Subí las tuyas y se van sumando acá, para armar entre todos un lindo recuerdo del día.</p>
        <label class="tadi-wall-upload-btn">
          📤 Subir una foto
          <input type="file" accept="image/*" id="tadi-wall-input" hidden>
        </label>
        <p class="tadi-wall-status" id="tadi-wall-status"></p>
        <div class="tadi-wall-carousel" id="tadi-wall-grid">${thumbs}</div>
        <p class="tadi-wall-empty" id="tadi-wall-empty" ${thumbs ? "hidden" : ""}>Todavía no hay fotos — ¡subí la primera!</p>
      </div>
    </div>
    <style>
      .tadi-wall-section{background:#f6f3ee;padding:34px 20px;font-family:'Helvetica Neue',Arial,sans-serif;box-sizing:border-box;}
      .tadi-wall-inner{max-width:560px;margin:0 auto;text-align:center;}
      .tadi-wall-eyebrow{margin:0 0 6px;font-size:.68rem;letter-spacing:1.6px;text-transform:uppercase;color:#ff7a3d;font-weight:700;}
      .tadi-wall-title{margin:0 0 6px;font-size:1.2rem;color:#33363f;}
      .tadi-wall-sub{margin:0 0 18px;font-size:.85rem;color:#6d7280;line-height:1.5;}
      .tadi-wall-upload-btn{display:inline-flex;align-items:center;gap:8px;background:#ff7a3d;color:#fff;font-weight:700;font-size:.85rem;padding:12px 20px;border-radius:14px;cursor:pointer;box-shadow:5px 5px 12px rgba(0,0,0,.08),-3px -3px 10px #ffffff;}
      .tadi-wall-status{font-size:.78rem;color:#6d7280;margin:10px 0 0;min-height:1.1em;}
      .tadi-wall-empty{font-size:.8rem;color:#9a9fa8;margin:16px 0 0;font-style:italic;}
      .tadi-wall-carousel{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;margin-top:18px;padding-bottom:4px;-webkit-overflow-scrolling:touch;}
      .tadi-wall-carousel:empty{margin-top:0;}
      .tadi-wall-thumb{flex:none;scroll-snap-align:start;width:110px;height:110px;border-radius:12px;overflow:hidden;background:#dfe3e8;box-shadow:0 4px 10px rgba(0,0,0,.08);}
      .tadi-wall-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
    </style>
    <script>
      (function(){
        var input = document.getElementById('tadi-wall-input');
        var grid = document.getElementById('tadi-wall-grid');
        var empty = document.getElementById('tadi-wall-empty');
        var status = document.getElementById('tadi-wall-status');
        if(!input || !grid) return;
        input.addEventListener('change', function(){
          var file = input.files && input.files[0];
          if (!file) return;
          status.textContent = 'Subiendo...';
          var fd = new FormData();
          fd.append('foto', file);
          fetch('/api/invitacion/${escapeHtml(slug)}/muro', { method: 'POST', body: fd })
            .then(function(r){ return r.json(); })
            .then(function(data){
              if (data.error) { status.textContent = data.error; return; }
              if (empty) empty.hidden = true;
              var div = document.createElement('div');
              div.className = 'tadi-wall-thumb';
              div.innerHTML = '<img src="' + data.url + '" loading="lazy">';
              grid.prepend(div);
              status.textContent = '¡Gracias por compartirla!';
              input.value = '';
            })
            .catch(function(){ status.textContent = 'No se pudo subir. Probá de nuevo.'; });
        });
      })();
    </script>
  `;
  if (html.includes(TADI_FOOTER_MARKER)) return html.replace(TADI_FOOTER_MARKER, widget + TADI_FOOTER_MARKER);
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Hospedaje y cómo llegar (feature "logistica", plan Premium bodas/xv) —
// sección informativa para invitados de afuera, a pedido de comparar con
// lo que ofrece la competencia (Amo Invitar plan Deluxe). Solo se muestra
// si el organizador cargó al menos uno de los dos campos, mismo criterio
// de inyección que el muro de fotos (arriba del zócalo de marca).
function injectHospedaje(html, { hospedaje, comoLlegar }) {
  if (!hospedaje && !comoLlegar) return html;
  const widget = `
    <div class="tadi-logistica-section">
      <div class="tadi-logistica-inner">
        <p class="tadi-logistica-eyebrow">🧳 Para invitados de afuera</p>
        ${hospedaje ? `<div class="tadi-logistica-block"><h4>Hospedaje sugerido</h4><p>${escapeHtml(hospedaje).replace(/\n/g, "<br>")}</p></div>` : ""}
        ${comoLlegar ? `<div class="tadi-logistica-block"><h4>Cómo llegar</h4><p>${escapeHtml(comoLlegar).replace(/\n/g, "<br>")}</p></div>` : ""}
      </div>
    </div>
    <style>
      .tadi-logistica-section{background:#f6f3ee;padding:30px 20px;font-family:'Helvetica Neue',Arial,sans-serif;box-sizing:border-box;}
      .tadi-logistica-inner{max-width:520px;margin:0 auto;}
      .tadi-logistica-eyebrow{margin:0 0 16px;font-size:.68rem;letter-spacing:1.6px;text-transform:uppercase;color:#ff7a3d;font-weight:700;text-align:center;}
      .tadi-logistica-block{background:#fff;border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.05);}
      .tadi-logistica-block:last-child{margin-bottom:0;}
      .tadi-logistica-block h4{margin:0 0 6px;font-size:.85rem;color:#33363f;}
      .tadi-logistica-block p{margin:0;font-size:.82rem;color:#6d7280;line-height:1.5;}
    </style>
  `;
  if (html.includes(TADI_FOOTER_MARKER)) return html.replace(TADI_FOOTER_MARKER, widget + TADI_FOOTER_MARKER);
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Video de portada flotante (feature "video", plan Premium bodas/xv) — se
// suma arriba de la píldora de música, mismo patrón visual.
function injectVideoCover(html, videoUrl) {
  if (!videoUrl) return html;
  const widget = `
    <button type="button" id="tadi-video-toggle" class="tadi-video-toggle" aria-label="Ver video de portada">🎬 Video</button>
    <div id="tadi-video-panel" class="tadi-video-panel" hidden>
      <div class="tadi-video-panel-inner">
        <button type="button" id="tadi-video-close" class="tadi-video-close" aria-label="Cerrar video">✕</button>
        <video id="tadi-video-el" controls playsinline data-src="${escapeHtml(videoUrl)}"></video>
      </div>
    </div>
    <style>
      .tadi-video-toggle{position:fixed;right:18px;bottom:74px;z-index:60;background:#eaeef2;color:#33363f;border:0;border-radius:30px;padding:11px 18px;font-size:.8rem;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .tadi-video-panel{position:fixed;inset:0;z-index:70;background:rgba(51,54,63,.75);display:flex;align-items:center;justify-content:center;padding:20px;}
      .tadi-video-panel[hidden]{display:none;}
      .tadi-video-panel-inner{position:relative;width:100%;max-width:420px;}
      .tadi-video-panel-inner video{width:100%;border-radius:16px;display:block;background:#000;}
      .tadi-video-close{position:absolute;top:-14px;right:-14px;background:#eaeef2;color:#33363f;border:0;width:34px;height:34px;border-radius:50%;font-size:1rem;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
    </style>
    <script>
      (function(){
        var btn = document.getElementById('tadi-video-toggle');
        var panel = document.getElementById('tadi-video-panel');
        var closeBtn = document.getElementById('tadi-video-close');
        var vid = document.getElementById('tadi-video-el');
        if(!btn || !panel) return;
        function open(){ if(!vid.src) vid.src = vid.dataset.src; panel.hidden=false; vid.play().catch(function(){}); }
        function close(){ panel.hidden=true; vid.pause(); }
        btn.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        panel.addEventListener('click', function(e){ if(e.target===panel) close(); });
      })();
    </script>
  `;
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Toggle ES/EN (feature "multilenguaje", plan Premium bodas/xv). Usa el
// widget gratuito de Google Website Translator: traducción automática
// (no es una traducción profesional hecha a mano), pero funciona sobre
// cualquiera de los 60+ diseños sin tener que traducir a mano cada uno.
// Vale la pena avisarle esto al comprador si pregunta por la calidad.
function injectLanguageToggle(html) {
  // Estas tarjetas ya traen su propio botón "🌐 EN" (Google Translate
  // Element manejado a mano). Sin esto, Chrome además ofrece SU propio
  // cartel de "¿Traducir esta página?" arriba de todo apenas detecta
  // español en un navegador en inglés — los dos widgets de traducción
  // quedan superpuestos y se ve roto. notranslate le dice a Chrome que no
  // se meta en estas páginas puntuales (el resto del sitio, sin este
  // widget, sigue ofreciendo la traducción automática normal de Chrome).
  if (html.includes("<head>")) html = html.replace("<head>", `<head><meta name="google" content="notranslate">`);
  const widget = `
    <div id="google_translate_element" style="position:fixed;top:0;left:0;opacity:0;pointer-events:none;height:0;overflow:hidden;"></div>
    <button type="button" id="tadi-lang-toggle" class="tadi-lang-toggle" aria-label="Ver en inglés / View in English">🌐 EN</button>
    <style>
      .tadi-lang-toggle{position:fixed;top:14px;right:14px;z-index:66;background:#eaeef2;color:#33363f;border:0;border-radius:20px;padding:8px 14px;font-size:.72rem;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .goog-te-banner-frame{display:none !important;}
      body{top:0 !important;}
    </style>
    <script>
      function tadiTranslateInit(){
        new google.translate.TranslateElement({ pageLanguage: "es", includedLanguages: "en", autoDisplay: false }, "google_translate_element");
      }
      (function(){
        var s = document.createElement("script");
        s.src = "https://translate.google.com/translate_a/element.js?cb=tadiTranslateInit";
        s.async = true;
        document.head.appendChild(s);
        var btn = document.getElementById("tadi-lang-toggle");
        var toggled = false;
        function findSelect(){ return document.querySelector("#google_translate_element select.goog-te-combo"); }
        btn.addEventListener("click", function(){
          var sel = findSelect();
          if (!sel) { var prev = btn.textContent; btn.textContent = "⏳"; setTimeout(function(){ btn.textContent = prev; btn.click(); }, 700); return; }
          toggled = !toggled;
          sel.value = toggled ? "en" : "es";
          sel.dispatchEvent(new Event("change"));
          btn.textContent = toggled ? "🌐 ES" : "🌐 EN";
        });
      })();
    </script>
  `;
  if (html.includes("</body>")) return html.replace("</body>", widget + "</body>");
  return html + widget;
}

// Arma todos los widgets flotantes (música/mapa/muro/video/idioma) según lo
// que el plan comprado habilita, más las etiquetas Open Graph — se usa
// tanto en /invitacion/:slug como en el link con alias personalizado, así
// las dos formas de llegar a la misma invitación se ven exactamente igual.
function renderPublicInvitation(inv, req, guest = null) {
  const design = getDesign(inv.designId);
  const baseUrl = resolvePublicBaseUrl(req);
  let html = design.render({ ...inv.data, __slug: inv.slug, ...(guest ? { __guest: guest } : {}) });
  if (pricing.hasFeature(design.category, inv.plan, "musica")) {
    html = injectBackgroundMusic(html, inv.data.musica);
  }
  if (pricing.hasFeature(design.category, inv.plan, "muro")) {
    html = injectPhotoWall(html, { slug: inv.slug, photos: inv.muro || [], categoria: design.category, datos: inv.data });
  }
  if (pricing.hasFeature(design.category, inv.plan, "video")) {
    html = injectVideoCover(html, inv.data.videoPortada);
  }
  if (pricing.hasFeature(design.category, inv.plan, "logistica")) {
    html = injectHospedaje(html, { hospedaje: inv.data.hospedaje, comoLlegar: inv.data.comoLlegar });
  }
  if (pricing.hasFeature(design.category, inv.plan, "multilenguaje") && inv.data.multilenguaje) {
    html = injectLanguageToggle(html);
  }
  // El link personal de un invitado nombrado se comparte tal cual por
  // WhatsApp, así que la tarjeta de preview que arma WhatsApp (og:title/
  // og:description, leídas de ESTE html) tiene que estar personalizada con
  // su nombre y su cupo — si no, aparece igual que el link genérico y se
  // pierde toda la gracia de mandarlo personalizado.
  const evento = eventoLabel(design.category, inv.data);
  // Misma regla de coherencia gramatical que en designs/widgets.js: la
  // conjugación (invitado/invitados, tenés/tienen) tiene que reflejar la
  // cantidad real de lugares reservados, no quedar fija en plural/singular.
  const guestCupo = guest ? Math.max(1, Number(guest.cupo) || 1) : null;
  const ogTitle = guest ? `${guest.nombre} — ${guestCupo === 1 ? "invitado" : "invitados"} a ${evento}` : undefined;
  const ogDescription = guest
    ? `¡Hola ${guest.nombre}! ${guestCupo === 1 ? "Tenés 1 lugar reservado" : `Tienen ${guestCupo} lugares reservados`} para ${evento}. Confirmá tu asistencia acá.`
    : "Mirá la invitación y confirmá tu asistencia.";
  html = injectOgTags(html, {
    baseUrl,
    url: guest ? `${baseUrl}/invitacion/${inv.slug}/i/${guest.token}` : `${baseUrl}/invitacion/${inv.slug}`,
    image: inv.data.coverImage,
    title: ogTitle,
    description: ogDescription,
    // Las páginas de invitaciones de clientes son contenido privado del
    // evento de cada uno — no deben aparecer indexadas en Google (ni la de
    // slug genérico ni el alias corto /:alias, que comparte este mismo
    // renderer y no se puede bloquear por prefijo en robots.txt).
    noindex: true,
  });
  return html;
}

// ---------- ALIAS PERSONALIZADO (feature "alias", plan Premium bodas/xv) ----------
// Convierte "Julieta y Tomás" en "julieta-y-tomas": minúsculas, sin acentos,
// solo letras/números separados por guiones.
function slugifyAlias(s) {
  return String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Nombres de ruta que ya usa el sitio a nivel raíz — un alias no puede
// pisar ninguno de estos, o el link de alguien rompería una página real.
const RESERVED_SLUGS = new Set([
  "", "robots.txt", "sitemap.xml", "categoria", "como-funciona",
  "preguntas-frecuentes", "terminos", "privacidad", "demo", "checkout",
  "pago-exitoso", "pago-pendiente", "pago-fallido", "editar", "preview",
  "invitacion", "admin", "api", "static", "webhook", "login", "logout",
  "contacto", "ayuda", "app", "nosotros",
]);

// Si el alias pedido ya está tomado (por otra invitación, o choca con una
// ruta reservada), le suma "-2", "-3", etc. hasta encontrar uno libre —
// más simple y más amigable que devolver un error y frenar el guardado.
function resolveUniqueAlias(desired, db, currentSlug) {
  const base = slugifyAlias(desired);
  if (!base) return "";
  const taken = (s) =>
    RESERVED_SLUGS.has(s) ||
    db.invitations.some((i) => i.slug !== currentSlug && i.data && i.data.aliasPersonalizado === s);
  if (!taken(base)) return base;
  let n = 2;
  let candidate = `${base}-${n}`;
  while (taken(candidate)) {
    n++;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

// Filtra los campos del schema de un diseño según lo que el plan comprado
// habilita (musica/mapa/muro/alias/video/multilenguaje) — así el comprador
// de un plan Básico ni siquiera ve el campo de un feature que no compró, y
// el buyer de Plus/Premium sí. Los campos sin "feature" (los de siempre)
// están disponibles en cualquier plan.
function schemaForPlan(design, planId) {
  return design.schema.filter((f) => !f.feature || pricing.hasFeature(design.category, planId, f.feature));
}

// Datos en blanco para una invitación recién comprada — antes arrancaba
// con una COPIA de design.sampleData (los nombres/fecha/fotos de ejemplo
// de la demo), así que un comprador real veía su tarjeta ya "completa"
// con datos falsos: la checklist de "Te falta completar" la marcaba todo
// hecho sin haber cargado nada, y si se olvidaba de pisar algún campo
// quedaba compartiendo la invitación con datos de mentira. Se arma un
// valor vacío por tipo de campo (nunca undefined, para no romper un
// template que interpole el dato sin chequear) — colorPalette es la única
// excepción: es una elección de diseño, no un dato personal, así que ahí
// sí conviene el default de la demo.
function blankInvitationData(design) {
  const blank = {};
  (design.schema || []).forEach((f) => {
    switch (f.type) {
      case "checkbox":
        blank[f.name] = false;
        break;
      case "images":
        blank[f.name] = [];
        break;
      case "palette":
        blank[f.name] = design.sampleData ? design.sampleData[f.name] : "";
        break;
      default:
        blank[f.name] = "";
    }
  });
  return blank;
}

// Script de Google Analytics 4 — vacío (no inserta nada) si no hay
// GA_MEASUREMENT_ID cargado en el entorno.
const GA_SNIPPET = GA_MEASUREMENT_ID
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');</script>`
  : "";

// ---------- Intro cinemática de marca ----------
// Overlay que se inyecta en TODAS las páginas que usan layout() (para no
// duplicar código ni mantener dos plantillas), pero que intro.js solo
// activa en la home y en la primera visita real del navegador — en el
// resto de las páginas queda con [hidden] y no hace nada ni pesa en el
// render. Los paths del "Ta"/"Di" y el círculo son EXACTAMENTE los de
// /static/img/logo/tadi-logo-light-bg.svg (mismo viewBox, sin deformar).
const INTRO_HTML = `<div id="tadiIntro" hidden>
  <div class="intro-aurora"></div>
  <button type="button" class="intro-skip">Saltar</button>
  <button type="button" class="intro-sound" data-muted="0" aria-label="Silenciar">
    <svg class="ico-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/></svg>
    <svg class="ico-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>
  </button>
  <div class="intro-stage">
    <div class="intro-envelope">
      <div class="env-body"></div>
      <div class="env-pocket"></div>
      <div class="intro-seal"></div>
      <div class="env-flap"><div class="env-flap-inner"></div></div>
    </div>
    <div class="intro-card">
      <div class="intro-card-line"></div>
      <div class="intro-card-line"></div>
      <div class="intro-card-line"></div>
    </div>
    <div class="intro-ring"></div>
    <div class="intro-logo-wrap">
      <svg class="intro-logo" viewBox="-40 -1003.5 2387.0 1063.5">
        <g transform="scale(1,-1)">
          <g class="grp-ta">
            <path d="M241.00,0.00 L241.00,696.00 L398.00,696.00 L398.00,0.00 Z M20.00,569.00 L20.00,706.00 L619.00,706.00 L619.00,569.00 Z" fill="#333640"/>
            <path d="M878.00,-10.00 Q811.00,-10.00 758.50,23.00 Q706.00,56.00 675.50,113.00 Q645.00,170.00 645.00,243.00 Q645.00,316.00 675.50,373.00 Q706.00,430.00 758.50,463.00 Q811.00,496.00 878.00,496.00 Q927.00,496.00 966.50,477.00 Q1006.00,458.00 1031.00,424.50 Q1056.00,391.00 1059.00,348.00 L1059.00,138.00 Q1056.00,95.00 1031.50,61.50 Q1007.00,28.00 967.00,9.00 Q927.00,-10.00 878.00,-10.00 Z M909.00,128.00 Q958.00,128.00 988.00,160.50 Q1018.00,193.00 1018.00,243.00 Q1018.00,277.00 1004.50,303.00 Q991.00,329.00 966.50,343.50 Q942.00,358.00 910.00,358.00 Q878.00,358.00 853.50,343.50 Q829.00,329.00 814.50,303.00 Q800.00,277.00 800.00,243.00 Q800.00,210.00 814.00,184.00 Q828.00,158.00 853.00,143.00 Q878.00,128.00 909.00,128.00 Z M1012.00,0.00 L1012.00,131.00 L1035.00,249.00 L1012.00,367.00 L1012.00,486.00 L1162.00,486.00 L1162.00,0.00 Z" fill="#333640"/>
          </g>
          <g class="grp-di">
            <path d="M1372.00,0.00 L1372.00,138.00 L1547.00,138.00 Q1611.00,138.00 1659.00,163.50 Q1707.00,189.00 1733.00,238.00 Q1759.00,287.00 1759.00,354.00 Q1759.00,421.00 1732.50,469.00 Q1706.00,517.00 1658.50,543.00 Q1611.00,569.00 1547.00,569.00 L1367.00,569.00 L1367.00,706.00 L1549.00,706.00 Q1629.00,706.00 1696.50,680.50 Q1764.00,655.00 1814.50,607.50 Q1865.00,560.00 1892.50,495.50 Q1920.00,431.00 1920.00,353.00 Q1920.00,276.00 1892.50,211.00 Q1865.00,146.00 1815.00,99.00 Q1765.00,52.00 1697.50,26.00 Q1630.00,0.00 1551.00,0.00 Z M1266.00,0.00 L1266.00,706.00 L1423.00,706.00 L1423.00,0.00 Z" fill="#ff7a3d"/>
            <path d="M1988.00,0.00 L1988.00,486.00 L2141.00,486.00 L2141.00,0.00 Z" fill="#ff7a3d"/>
          </g>
          <g class="grp-ring">
            <circle cx="2064.50" cy="721.00" r="137.50" fill="none" stroke="#ff7a3d" stroke-width="105"/>
          </g>
        </g>
      </svg>
      <div class="intro-tagline">Invitaciones digitales</div>
    </div>
    <div class="intro-shine"></div>
  </div>
</div>`;

function layout({ title, body, description, extraHead, activeNav, req, canonicalPath, robotsNoindex = false, ogImagePath, rawTitle = false }) {
  const desc = description || "Invitaciones digitales para bodas, cumpleaños, XV y más — elegí tu diseño, personalizalo en minutos y compartilo por WhatsApp con RSVP incluido.";
  const pageTitle = rawTitle ? title : `${title} · TaDi`;
  // baseUrl solo se resuelve si nos pasaron el req de la request (todas las
  // páginas públicas lo hacen); sin él, canonical/OG/JSON-LD simplemente se
  // omiten en vez de armar una URL relativa rota.
  const baseUrl = req ? resolvePublicBaseUrl(req) : null;
  const canonicalUrl = baseUrl && canonicalPath ? absoluteUrl(baseUrl, canonicalPath) : null;
  const ogImageUrl = baseUrl ? absoluteUrl(baseUrl, ogImagePath || OG_IMAGE_PATH) : null;
  const jsonLd = baseUrl && !robotsNoindex
    ? `<script type="application/ld+json">${JSON.stringify(organizationJsonLd(baseUrl))}</script>
<script type="application/ld+json">${JSON.stringify(websiteJsonLd(baseUrl))}</script>`
    : "";
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta name="keywords" content="${escapeHtml(SITE_KEYWORDS)}">
${robotsNoindex ? `<meta name="robots" content="noindex,nofollow">` : ""}
${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : ""}
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/static/img/logo/tadi-favicon-16.png">
<link rel="apple-touch-icon" href="/static/img/logo/tadi-favicon-180.png">
<meta property="og:site_name" content="TaDi">
<meta property="og:locale" content="es_AR">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
${canonicalUrl ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : ""}
${ogImageUrl ? `<meta property="og:image" content="${escapeHtml(ogImageUrl)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">` : ""}
<meta name="twitter:card" content="${ogImageUrl ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${escapeHtml(pageTitle)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
${ogImageUrl ? `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">` : ""}
${jsonLd}
<link rel="stylesheet" href="${CSS_HREF}">
<link rel="stylesheet" href="${INTRO_CSS_HREF}">
${extraHead || ""}
${GA_SNIPPET}
</head><body>
${INTRO_HTML}
<header class="site">
  <a class="brand" href="/" aria-label="TaDi — inicio"><img src="/static/img/logo/tadi-logo-light-bg.svg" alt="TaDi" class="brand-logo"><span class="brand-tagline">Tarjetas Digitales</span></a>
  <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav id="siteNav">
    <a href="/" class="${activeNav === "catalogo" ? "active" : ""}">Catálogo</a>
    ${visibleCategories().map((c) => `<a href="/categoria/${c.id}" class="${activeNav === c.id ? "active" : ""}">${c.label}</a>`).join("")}
    <a href="/como-funciona" class="${activeNav === "como-funciona" ? "active" : ""}">¿Cómo funciona?</a>
    <a href="/nosotros" class="${activeNav === "nosotros" ? "active" : ""}">Nosotros</a>
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

  // Chips de filtro por color (catálogo): delegado en document porque hay
  // varias grillas en la página a la vez (una por categoría, dentro de cada
  // modal) — un solo listener alcanza para todas.
  document.addEventListener('click', function(e){
    var chip = e.target.closest('.color-chip');
    if (!chip) return;
    var bar = chip.closest('.color-filter-bar');
    var grid = bar && document.getElementById(bar.dataset.target);
    if (!grid) return;
    bar.querySelectorAll('.color-chip').forEach(function(c){
      var active = c === chip;
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    var tag = chip.dataset.tag;
    grid.querySelectorAll('.design-card').forEach(function(card){
      var tags = (card.dataset.tags || '').split(' ');
      card.style.display = (tag === 'todos' || tags.indexOf(tag) !== -1) ? '' : 'none';
    });
    var crumb = document.getElementById('filterBreadcrumb');
    if (crumb) {
      var label = tag === 'todos' ? 'todos' : chip.textContent.trim();
      crumb.innerHTML = 'Mostrando <b>' + label.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</b> los diseños de ' + crumb.dataset.catLabel;
    }
  });

  // Bandeja "Filtrar" de /categoria/:id — en celular los chips de categoría
  // y color quedan ocultos por default y se abren en una bandeja deslizable
  // desde abajo (antes se mostraban en una fila con scroll horizontal).
  (function(){
    var toggleBtn = document.getElementById('filterToggleBtn');
    var sheet = document.getElementById('filterSheet');
    var backdrop = document.getElementById('filterSheetBackdrop');
    var closeBtn = document.getElementById('filterSheetClose');
    if (!toggleBtn || !sheet || !backdrop) return;
    function openSheet(){
      sheet.classList.add('open');
      backdrop.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeSheet(){
      sheet.classList.remove('open');
      backdrop.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    toggleBtn.addEventListener('click', function(){
      sheet.classList.contains('open') ? closeSheet() : openSheet();
    });
    closeBtn.addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeSheet();
    });
    // Al elegir un color desde la bandeja, cerrarla para mostrar el resultado.
    sheet.addEventListener('click', function(e){
      if (e.target.closest('.color-chip')) setTimeout(closeSheet, 220);
    });
  })();
</script>
<script src="${INTRO_JS_HREF}" defer></script>
</body></html>`;
}

function money(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

// Igual que money(), pero aclarando la moneda — para los precios de cara
// al público (catálogo, checkout), donde puede haber visitantes de otros
// países (la competencia también atiende Uruguay) y "$23.900" solo, sin
// aclarar, se presta a confusión.
function moneyARS(n) {
  return money(n) + " ARS";
}

// ---------- CABECERA COMPACTA de /categoria/:id ----------
// Antes había un hero enorme (foto de la pareja, aro decorativo, texto
// "Para quién es" y un carrusel para saltar entre categorías) que ocupaba
// casi toda la primera pantalla y dejaba la grilla de tarjetas bien abajo.
// Se reemplaza por un título simple — nada de foto ni de carrusel — para
// que la lista de invitaciones quede a la vista de entrada.
// Título + botón "Filtrar" (el botón solo se ve en celular vía CSS — en
// escritorio los chips de categoría/color ya se ven de una, sin hace falta
// esconderlos detrás de nada).
function categoryHeaderHTML(cat) {
  return `<div class="section-head">
    <h2>${cat.label}<span class="dot">.</span></h2>
    <button type="button" class="filter-toggle-btn" id="filterToggleBtn" aria-haspopup="true" aria-expanded="false" aria-controls="filterSheet"><span class="dot2"></span>Filtrar</button>
  </div>`;
}

// Chips de color/paleta de una categoría — se arman solo con las que
// efectivamente aparecen (nada de mostrar chips vacíos), extraídas de la
// copy de cada diseño. Con 1 sola no aporta nada, así que no se muestra.
function colorFilterBarHTML(cat) {
  const list2 = designsByCategory(cat.id);
  const gridId = `cat-grid-${cat.id}`;
  const allTags = [];
  list2.forEach((d) => extractColorTags(d.summary).forEach((t) => { if (!allTags.includes(t)) allTags.push(t); }));
  if (allTags.length < 2) return "";
  const allSwatch = "conic-gradient(from 0deg,#d4af37,#4a7c59,#4a7fb5,#e8a2c0,#c1694f,#7a2f3d,#d4af37)";
  return `<div class="color-filter-bar" data-target="${gridId}">
    <button type="button" class="color-chip active" data-tag="todos" aria-pressed="true"><span class="swatch" style="background:${allSwatch}"></span>Todos</button>
    ${allTags.map((t) => `<button type="button" class="color-chip" data-tag="${tagSlug(t)}" aria-pressed="false"><span class="swatch" style="background:${COLOR_HEX[t] || "#ccc"}"></span>${escapeHtml(t)}</button>`).join("")}
  </div>`;
}

// Bandeja deslizable ("bottom sheet") con los chips de categoría y color —
// en celular queda oculta hasta tocar "Filtrar" (antes esos chips wrappeaban
// en 3 líneas y tapaban la primera tarjeta; después probamos que se
// deslizaran en una fila horizontal; esta versión los esconde del todo por
// default). En escritorio el mismo markup se ve siempre, en flujo normal
// (ver @media(max-width:600px) en site.css).
function categoryFilterSheetHTML(cat, catButtons) {
  const colorBar = colorFilterBarHTML(cat);
  const catLabelLower = escapeHtml(cat.label.toLowerCase());
  return `<p class="filter-breadcrumb" id="filterBreadcrumb" data-cat-label="${catLabelLower}">Mostrando <b>todos</b> los diseños de ${catLabelLower}</p>
  <div class="filter-sheet-backdrop" id="filterSheetBackdrop"></div>
  <div class="filter-sheet" id="filterSheet" role="dialog" aria-modal="true" aria-label="Filtrar diseños de ${escapeHtml(cat.label)}">
    <div class="filter-sheet-head"><b>Filtrar</b><button type="button" class="filter-sheet-close" id="filterSheetClose" aria-label="Cerrar filtro">✕</button></div>
    <div class="filter-sheet-section">
      <span class="filter-sheet-label">Categoría</span>
      <div class="cat-filter" id="catalogo">${catButtons}</div>
    </div>
    ${colorBar ? `<div class="filter-sheet-section color-section"><span class="filter-sheet-label">Color</span>${colorBar}</div>` : ""}
  </div>`;
}

// ---------- CATÁLOGO ----------
// grilla de tarjetas de una categoría.
function categoryGridHTML(cat) {
  const list2 = designsByCategory(cat.id);
  if (list2.length === 0) {
    return `<div class="grid"><div class="coming-soon" style="grid-column:1/-1;min-height:140px">
      <strong>Muy pronto</strong>
      <span>Estamos preparando los primeros diseños de ${cat.label.toLowerCase()}.</span>
    </div></div>`;
  }
  const gridId = `cat-grid-${cat.id}`;
  return `<div class="grid" id="${gridId}">
    ${list2.map(cardHTML).join("")}
    <div class="coming-soon">
      <strong>+ Nuevos diseños</strong>
      <span>Sumamos diseños de ${cat.label.toLowerCase()} todos los meses.</span>
    </div>
  </div>`;
}

const TRUST_STRIP_HTML = `<div class="trust-strip">
  <div><span class="trust-icon">🔒</span><strong>Pago seguro</strong><span>En cuotas según tu banco</span><span class="mp-chip">con <b>Mercado</b><b class="mp-blue">Pago</b></span></div>
  <div><span class="trust-icon">✏️</span><strong>Edición ilimitada</strong><span>Cambiá los datos las veces que quieras hasta el evento</span></div>
  <div><span class="trust-icon">⚡</span><strong>Entrega al instante</strong><span>Tu link queda listo apenas se acredita el pago</span></div>
  <div><span class="trust-icon">🎨</span><strong>Catálogo en crecimiento</strong><span>Sumamos diseños nuevos todos los meses</span></div>
</div>`;

// Variante de TRUST_STRIP_HTML solo para el home: "Edición ilimitada" y
// "Entrega al instante" ya se mencionan en el hero de arriba, así que
// repetirlas acá abajo se lee como error/duplicado. Se reemplazan por 2
// datos que no están en ningún otro lado de la página, para que la franja
// siga con 4 items (mismo grid) en vez de quedar corta con solo 2.
const TRUST_STRIP_HOME_HTML = `<div class="trust-strip">
  <div><span class="trust-icon">🔒</span><strong>Pago seguro</strong><span>En cuotas según tu banco</span><span class="mp-chip">con <b>Mercado</b><b class="mp-blue">Pago</b></span></div>
  <div><span class="trust-icon">💌</span><strong>RSVP incluido</strong><span>Tus invitados confirman asistencia con un click, sin apps ni registros</span></div>
  <div><span class="trust-icon">💬</span><strong>Compartilo por WhatsApp</strong><span>Un link para mandar a todos tus invitados, sin imprimir nada</span></div>
  <div><span class="trust-icon">🎨</span><strong>Catálogo en crecimiento</strong><span>Sumamos diseños nuevos todos los meses</span></div>
</div>`;

// Hero animado del home del catálogo: fondo "aurora" (gradientes radiales
// difuminados que derivan lento) + puntitos de acento flotando + el título
// entra con fade/subida al cargar. Reemplaza la versión anterior (chips de
// datos + stepper de "cómo funciona" apretados debajo del título), que
// quedaba recargada — esos 3 pasos ya están explicados en /como-funciona y
// los datos de precio/entrega/edición viven en la franja de abajo
// (TRUST_STRIP_HOME_HTML). Acá el único trabajo es dar el pantallazo de
// marca antes de elegir categoría, con algo de calidez y movimiento.
const CATALOG_HERO_HTML = `<div class="cat-hero">
  <div class="cat-hero-aurora"></div>
  <span class="cat-hero-dot" style="width:14px;height:14px;background:#ff9c6b;top:38px;left:16%;animation-delay:-1.1s;"></span>
  <span class="cat-hero-dot" style="width:9px;height:9px;background:#d68caa;top:96px;left:9%;animation-delay:-3.4s;"></span>
  <span class="cat-hero-dot" style="width:11px;height:11px;background:#f2c265;top:52px;right:14%;animation-delay:-.6s;"></span>
  <span class="cat-hero-dot" style="width:7px;height:7px;background:#8fb2c9;top:118px;right:20%;animation-delay:-2.2s;"></span>
  <span class="cat-hero-dot" style="width:16px;height:16px;background:#e8672e;top:150px;right:8%;opacity:.35;animation-delay:-4s;"></span>
  <div class="orios-home-head">
    <span class="orios-home-kicker">Catálogo TaDi</span>
    <h1>Elegí tu <span class="cat-hero-accent">tarjeta</span><span class="dot">.</span></h1>
    <p>Diseños digitales para cada ocasión, listos para personalizar en minutos.</p>
  </div>
</div>`;

// ---------- HOME interactivo: 6 categorías lado a lado, hover con
// ampliación + halo contenido, click abre modal con personaje + catálogo
// (no navega a otra página) ----------
// Antes cada panel abría un modal con una lista + una foto grande al
// costado — para elegir había que abrir el modal y todavía no se veía
// cómo quedaba cada tarjeta. Ahora el panel lleva directo a la página de
// la categoría (/categoria/:id), que ya muestra la vista previa de cada
// diseño (cardHTML, con su preview propio) — un click menos y con la
// info que hace falta para elegir, no una foto decorativa.
function oriosPanelHTML(cat) {
  return `<a href="/categoria/${cat.id}" class="orios-panel orios-panel-${cat.id}" aria-label="Ver catálogo de ${cat.label}">
    <span class="orios-panel-photo">
      <img src="${cat.heroImage}" alt="${cat.label}" loading="eager" fetchpriority="high">
    </span>
    <span class="orios-panel-label">${cat.label}<span class="dot">.</span></span>
    <span class="orios-panel-hint">Ver diseños →</span>
  </a>`;
}

function oriosHomeHTML(cats) {
  return `<section class="orios-home">
    ${cats.map(oriosPanelHTML).join("")}
  </section>`;
}

function catalogPage(activeCat, req) {
  // Categorías visibles en el nav/home/filtro: todas menos las de
  // temporada (Halloween, Navidad) fuera de fecha. Si se está viendo
  // justo una categoría de temporada por link directo fuera de fecha, se
  // la suma igual a la lista para que el mini-hero y el filtro no se
  // rompan (aunque no aparezca en el resto del sitio).
  const visible = visibleCategories();
  const cats = activeCat && !visible.find((c) => c.id === activeCat)
    ? visible.concat(categories.filter((c) => c.id === activeCat))
    : visible;

  const catButtons = [`<a href="/" class="${!activeCat ? "active" : ""}" style="--catcolor:${CATALOGO_PILL_COLOR}"><span class="cdot"></span>Todos</a>`]
    .concat(cats.map((c) => `<a href="/categoria/${c.id}" class="${activeCat === c.id ? "active" : ""}" style="--catcolor:${CATEGORY_COLORS[c.id] || "#e8672e"}"><span class="cdot"></span>${c.label}</a>`))
    .join("");

  // HOME (sin categoría activa): selector interactivo de categorías +
  // modal con personaje/catálogo — no se apilan las grillas en la página.
  if (!activeCat) {
    return layout({
      rawTitle: true,
      title: "Tadi – Invitaciones digitales",
      description: "Creá invitaciones digitales personalizadas para bodas, cumpleaños y eventos. Diseños modernos, interactivos y fáciles de compartir.",
      extraHead: `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap" rel="stylesheet">`,
      activeNav: "catalogo",
      req,
      canonicalPath: "/",
      body: `${CATALOG_HERO_HTML}
      ${oriosHomeHTML(visible)}
      ${TRUST_STRIP_HOME_HTML}`,
    });
  }

  // Página de una categoría puntual (link directo, nav, footer, SEO): título
  // compacto + selector de categoría + grilla, sin hero grande — así la
  // grilla queda arriba de todo. Usa la lista completa de categorías para
  // el lookup, así una categoría de temporada sigue siendo accesible todo
  // el año por link directo.
  const cat = categories.find((c) => c.id === activeCat);
  return layout({
    title: cat.label,
    description: `Invitaciones digitales de ${cat.label.toLowerCase()} — elegí tu diseño, cargá los datos de tu evento y compartilo por WhatsApp en minutos, con edición ilimitada hasta el día del evento.`,
    activeNav: cat.id,
    req,
    canonicalPath: `/categoria/${cat.id}`,
    body: `${categoryHeaderHTML(cat)}
    ${categoryFilterSheetHTML(cat, catButtons)}
    ${categoryGridHTML(cat)}
    ${TRUST_STRIP_HTML}`,
  });
}

// Diccionario de palabras de color en español, para extraer "tags" de
// filtro directo de la copy que cada diseño ya tiene en su summary (sin
// tener que taggear a mano 60 diseños). Se busca en orden y se devuelve
// como mucho una vez cada tag, en el orden en que aparecen en el texto.
const COLOR_KEYWORDS = [
  ["dorad", "Dorado"], ["negro", "Negro"], ["blanco", "Blanco"], ["verde", "Verde"],
  ["rosa", "Rosa"], ["azul", "Azul"], ["vino", "Vino"], ["borgo", "Vino"],
  ["terracota", "Terracota"], ["pastel", "Pastel"], ["plate", "Plateado"],
  ["beige", "Beige"], ["arena", "Beige"], ["turquesa", "Turquesa"], ["oliva", "Oliva"],
  ["coral", "Coral"], ["lila", "Lila"], ["lavanda", "Lila"], ["celeste", "Celeste"],
  ["gris", "Gris"], ["naranja", "Naranja"], ["amarillo", "Amarillo"], ["marrón", "Marrón"],
  ["marron", "Marrón"], ["violeta", "Violeta"], ["fucsia", "Fucsia"],
];

// Hex real de cada tag de color — se usa para pintar el puntito ("swatch")
// de cada chip de color en el filtro del catálogo, así el chip se ve del
// color que representa en vez de ser un pill genérico igual a los demás.
const COLOR_HEX = {
  Dorado: "#d4af37", Negro: "#2b2b2b", Blanco: "#f5f5f0", Verde: "#4a7c59",
  Rosa: "#e8a2c0", Azul: "#4a7fb5", Vino: "#7a2f3d", Terracota: "#c1694f",
  Pastel: "#e8c9d8", Plateado: "#b9bec7", Beige: "#d9c7a3", Turquesa: "#3fb8b0",
  Oliva: "#6b7a3f", Coral: "#e8836a", Lila: "#b39ddb", Celeste: "#8ecae6",
  Gris: "#9aa0a8", Naranja: "#e8823d", Amarillo: "#f0c93d", Marrón: "#7a5a3a",
  Violeta: "#7e57c2", Fucsia: "#e0459a",
};
// Ídem, pero por categoría — el mismo mapeo de color ya usado en el nav
// ("pill atardecer"), así el filtro de categoría queda coherente con el
// resto del sitio en vez de ser un color nuevo inventado acá.
const CATEGORY_COLORS = {
  bodas: "#c9a24a", savethedate: "#e0896a", infantiles: "#4fb3a9",
  xv: "#d68ca0", cumpleanos: "#f2b84b", bautismos: "#8fb2c9",
  halloween: "#8a5cb8", navidad: "#4a9d6e",
};
const CATALOGO_PILL_COLOR = "#8a5a48";

function extractColorTags(text) {
  const t = String(text || "").toLowerCase();
  const found = [];
  for (const [kw, label] of COLOR_KEYWORDS) {
    if (t.includes(kw) && !found.includes(label)) found.push(label);
  }
  return found;
}

function tagSlug(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
}

function cardHTML(d) {
  const cat = categories.find((c) => c.id === d.category);
  const isFlagship = cat.flagshipDesign === d.id;
  const tags = extractColorTags(d.summary);
  return `<div class="design-card" data-tags="${tags.map(tagSlug).join(" ")}">
    <div class="card-phone-wrap">
      <div class="card-phone">
        <div class="swatch" style="background:linear-gradient(135deg, ${d.accent}, ${d.accent2 || d.accent})">
          ${isFlagship ? `<span class="badge-fav">★ Más elegido</span>` : ""}
          ${typeof d.cardPreview === "function" ? d.cardPreview(d) : d.name}
        </div>
      </div>
    </div>
    <div class="body">
      <span class="cat-tag">${cat.label}</span>
      <h3>${d.name}</h3>
      <p>${d.summary}</p>
      <span class="price-tag">Desde ${moneyARS(pricing.defaultPlan(cat.id).price)}</span>
      <div class="actions">
        <a class="btn btn-primary" href="/demo/${d.id}">Ver demo</a>
        <a class="btn btn-outline" href="/checkout/${d.id}">Elegir</a>
      </div>
    </div>
  </div>`;
}

// ---------- SEO: robots.txt + sitemap.xml ----------
// robots.txt: dejamos pasar todo lo público (home, categorías, demos de
// diseño) y bloqueamos explícitamente lo transaccional/privado, que no
// aporta nada indexado y en el caso de /editar/ además sería exponer
// datos de compradores.
app.get("/robots.txt", (req, res) => {
  const baseUrl = resolvePublicBaseUrl(req);
  res.type("text/plain").send(
    `User-agent: *
Disallow: /checkout/
Disallow: /api/
Disallow: /admin
Disallow: /editar/
Disallow: /preview/
Disallow: /invitacion/
Disallow: /webhook/
Disallow: /pago-exitoso
Disallow: /pago-pendiente
Disallow: /pago-fallido

Sitemap: ${baseUrl}/sitemap.xml
`
  );
});

// sitemap.xml dinámico: home + categorías visibles + demo de cada diseño
// (las páginas transaccionales de checkout/editor no se listan a propósito).
app.get("/sitemap.xml", (req, res) => {
  const baseUrl = resolvePublicBaseUrl(req);
  const staticUrls = [
    { loc: "/", priority: "1.0" },
    { loc: "/como-funciona", priority: "0.5" },
    { loc: "/nosotros", priority: "0.4" },
    { loc: "/preguntas-frecuentes", priority: "0.5" },
    { loc: "/terminos", priority: "0.3" },
    { loc: "/privacidad", priority: "0.3" },
    ...visibleCategories().map((c) => ({ loc: `/categoria/${c.id}`, priority: "0.8" })),
  ];
  const designUrls = designs.map((d) => ({ loc: `/demo/${d.id}`, priority: "0.6" }));
  const urls = staticUrls.concat(designUrls);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escapeHtml(baseUrl + u.loc)}</loc><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
  res.type("application/xml").send(xml);
});

app.get("/", (req, res) => res.send(catalogPage(null, req)));
app.get("/categoria/:cat", (req, res) => {
  if (!categories.find((c) => c.id === req.params.cat)) return res.status(404).send("Categoría no encontrada");
  res.send(catalogPage(req.params.cat, req));
});

// ---------- CÓMO FUNCIONA (tutorial para cargar los datos después de pagar) ----------
app.get("/como-funciona", (req, res) => {
  const steps = [
    {
      title: "Entrá a tu link de edición",
      short: "Apenas se acredita el pago",
      body: "Apenas se acredita el pago te llevamos directo al editor, y además te dejamos un link privado guardado ahí mismo para que puedas volver cuando quieras — no hace falta pagar de nuevo ni pedirlo por otro lado. Conviene guardarlo (por ejemplo, mandártelo a vos mismo por WhatsApp).",
    },
    {
      title: "Completá los datos de tu evento",
      short: "Nombres, fecha, horarios, lugares",
      body: "Nombres, fecha, horarios, lugares, el mensaje para los invitados... a la izquierda vas completando cada campo y a la derecha ves la invitación real actualizarse al instante, tal cual la van a ver tus invitados.",
    },
    {
      title: "Subí tus fotos",
      short: "Portada y galería",
      body: "Cargá una foto de portada y las que quieras para la galería. Se suben directo desde el celular o la compu, no hace falta redimensionarlas ni nada — nosotros nos encargamos de que se vean bien.",
    },
    {
      title: "Guardá los cambios",
      short: "Editá las veces que quieras",
      body: "Cuando quede como te gusta, tocá \"Guardar cambios\". Podés volver a entrar y seguir editando las veces que quieras antes del evento — no hay un único intento.",
    },
    {
      title: "Compartí el link con tus invitados",
      short: "Por WhatsApp, con confirmaciones",
      body: "Este es el link público (distinto al de edición) — es el que le mandás a la gente por WhatsApp o donde quieras. Ahí van a poder ver la invitación y confirmar asistencia.",
    },
  ];

  res.send(layout({
    title: "Cómo funciona",
    description: "Guía paso a paso: cómo elegir tu invitación digital en TaDi, personalizarla con tus datos y fotos, y compartirla por WhatsApp para recibir las confirmaciones de tus invitados.",
    activeNav: "como-funciona",
    req,
    canonicalPath: "/como-funciona",
    body: `
    <div class="tutorial-hero">
      <span class="kicker">Guía rápida</span>
      <h1>Así se arma tu invitación</h1>
      <p>Tocá cada paso para ver el detalle. Son 5 y no lleva más de unos minutos — así funciona.</p>
    </div>
    <div class="howfaq-wrap">
      <div class="howfaq-list" id="howfaqList">
        ${steps.map((s, i) => `
        <div class="howfaq-item${i === 0 ? " open" : ""}">
          <button type="button" class="howfaq-head">
            <span class="howfaq-badge">${i + 1}</span>
            <span class="howfaq-title"><b>${s.title}</b><span>${s.short}</span></span>
            <svg class="howfaq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="howfaq-body"><p>${s.body}</p></div>
        </div>`).join("")}
      </div>
      <a class="btn btn-primary howfaq-cta" href="/">✨ Ver diseños y elegir el mío</a>
    </div>
    <div class="tutorial-cta">
      <p style="color:var(--muted);margin-bottom:16px">¿Ya pagaste y no encontrás tu link de edición? Mirá las <a href="/preguntas-frecuentes">preguntas frecuentes</a> o escribinos y te ayudamos.</p>
      <a class="btn btn-outline" href="/">← Volver al catálogo</a>
    </div>
    <script>
      (function(){
        var items = document.querySelectorAll("#howfaqList .howfaq-item");
        items.forEach(function(item){
          var head = item.querySelector(".howfaq-head");
          head.addEventListener("click", function(){
            var wasOpen = item.classList.contains("open");
            items.forEach(function(i){ i.classList.remove("open"); });
            if (!wasOpen) item.classList.add("open");
          });
        });
      })();
    </script>`,
  }));
});

// ---------- NOSOTROS ----------
app.get("/nosotros", (req, res) => {
  res.send(layout({
    title: "Nosotros",
    description: "Quiénes hacemos TaDi: cómo nació el proyecto y cómo contactarnos por Instagram o mail.",
    activeNav: "nosotros",
    req,
    canonicalPath: "/nosotros",
    body: `
    <div class="tutorial-hero">
      <span class="kicker">Nosotros</span>
      <h1>La historia de TaDi<span class="dot">.</span></h1>
      <p>Un equipo chico, con ganas de que armar la invitación sea la parte fácil del evento.</p>
    </div>
    <div class="legal-wrap">
      <p>TaDi nació de la bronca de siempre: organizando el casamiento de un amigo, nos pusimos a buscar una invitación digital y encontramos de todo un poco — opciones carísimas, plataformas complicadas de usar, o diseños que parecían sacados de otra época. No había un lugar simple, lindo y a un precio justo. Así que decidimos armarlo nosotros.</p>
      <p>Hoy TaDi es eso: una forma fácil de tener una invitación digital hermosa en minutos, sin depender de un diseñador ni pelearte con un programa complicado. Elegís tu diseño, cargás tus datos, subís tus fotos y listo — lo hacés vos mismo, sin instalar nada ni entender de tecnología.</p>
      <p>Seguimos siendo un equipo chico y argentino, y eso se nota: pensamos cada diseño con cariño, y si nos escribís, del otro lado te contesta una persona de verdad. La idea es simple — que la parte de las invitaciones sea de lo más fácil y lindo de organizar.</p>
    </div>
    <div class="nosotros-contacts">
      <a href="https://instagram.com/tadi.tarjetas" target="_blank" rel="noopener">📷 @tadi.tarjetas</a>
      <a href="mailto:hola@tadi.com.ar">✉️ hola@tadi.com.ar</a>
      ${SUPPORT_WHATSAPP ? `<a href="https://wa.me/${SUPPORT_WHATSAPP}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
    </div>
    <div class="tutorial-cta">
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
    description: "Respuestas sobre precios, edición, plazos de entrega, reembolsos y cómo funciona el RSVP por WhatsApp en las invitaciones digitales de TaDi.",
    req,
    canonicalPath: "/preguntas-frecuentes",
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
    description: "Términos y condiciones de compra de las invitaciones digitales de TaDi.",
    req,
    canonicalPath: "/terminos",
    body: `<div class="legal-wrap">
      <h1>Términos y condiciones</h1>
      <p>TaDi ofrece invitaciones digitales personalizables para eventos (bodas, save the date, fiestas infantiles, quince años, cumpleaños, bautismos, y por temporada Halloween y Navidad). Al comprar una invitación, el comprador puede personalizar sus datos (textos, fechas, lugares, fotos) y compartir el link resultante con sus invitados.</p>
      <h3>Edición y vigencia</h3>
      <p>La invitación puede editarse sin límite de veces desde el link privado de edición hasta ${EDIT_GRACE_DAYS} días después de la fecha del evento cargada. Pasado ese plazo, la edición se bloquea automáticamente; la página pública ya compartida con los invitados permanece accesible. Cada invitación comprada corresponde a un único evento — usarla para un evento distinto requiere una nueva compra.</p>
      <h3>Conservación y borrado de datos</h3>
      <p>Los datos cargados en la invitación (textos, fotos, confirmaciones de asistencia) se conservan hasta ${DATA_RETENTION_DAYS} días después de la fecha del evento. Pasado ese plazo se eliminan de forma permanente — incluidas las fotos subidas — y la página pública deja de estar disponible con ese contenido. Los datos de la compra en sí (fecha, monto, diseño elegido) se conservan más tiempo por motivos contables e impositivos.</p>
      <h3>Pagos y reembolsos</h3>
      <p>Los pagos se procesan a través de Mercado Pago. TaDi no almacena datos de tarjetas ni medios de pago.</p>
      <p><strong>Una vez acreditado el pago, la compra no admite reembolso ni cancelación.</strong> Al tratarse de un producto digital personalizable de entrega inmediata (el comprador accede al editor apenas se acredita el pago), no aplica el derecho de arrepentimiento sobre servicios ya prestados. Si tenés un problema puntual con tu compra (un error técnico del sitio, por ejemplo), escribinos${SUPPORT_WHATSAPP ? ` por WhatsApp` : ""} y lo resolvemos — pero no se realizan devoluciones de dinero por cambio de opinión, error al elegir el diseño, o no haber usado la invitación.</p>
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
    description: "Política de privacidad y tratamiento de datos personales de TaDi, conforme a la Ley 25.326.",
    req,
    canonicalPath: "/privacidad",
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

// Botón flotante "← Volver" que se inyecta en la demo de cada diseño (ver
// /demo/:designId más abajo). Vuelve a la página anterior (catálogo o
// checkout, según desde dónde se haya abierto la demo) y, si no hay historial
// previo (alguien entró directo a la URL), cae al catálogo. Estilos 100%
// inline + botón propio (no depende de site.css ni del CSS del diseño) para
// que se vea igual de bien arriba de cualquier tarjeta.
const DEMO_BACK_BUTTON = `<a href="/" onclick="if(window.history.length>1){history.back();return false;}"
  style="position:fixed;top:16px;left:16px;z-index:9999;display:inline-flex;align-items:center;gap:6px;
  background:#fff;color:#222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:.82rem;
  font-weight:600;padding:9px 16px 9px 12px;border-radius:30px;box-shadow:0 3px 12px rgba(0,0,0,.22);">← Volver</a>`;

// Barra fija abajo en el demo con el CTA de compra — antes, para elegir un
// diseño después de mirar la vista previa había que volver atrás y buscar
// de nuevo el botón "Elegir" en la grilla del catálogo.
function demoCtaBarHTML(design) {
  const plan = pricing.defaultPlan(design.category);
  return `<div style="position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;
    justify-content:space-between;gap:14px;background:#fff;padding:12px 16px;
    box-shadow:0 -4px 16px rgba(0,0,0,.14);font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
    <div style="min-width:0;">
      <strong style="display:block;font-size:.85rem;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(design.name)}</strong>
      <span style="font-size:.76rem;color:#777;">Desde ${moneyARS(plan.price)}</span>
    </div>
    <a href="/checkout/${design.id}" style="flex:none;background:#ff7a3d;color:#fff;text-decoration:none;
      font-weight:700;font-size:.86rem;padding:12px 20px;border-radius:14px;white-space:nowrap;">Elegir este diseño</a>
  </div>`;
}

// ---------- DEMO (preview con datos de ejemplo) ----------
app.get("/demo/:designId", (req, res) => {
  const design = getDesign(req.params.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");
  const baseUrl = resolvePublicBaseUrl(req);
  let html = design.render({ ...design.sampleData, __slug: "demo" });
  html = injectOgTags(html, {
    baseUrl,
    url: `${baseUrl}/demo/${design.id}`,
    image: design.sampleData.coverImage,
    description: `Diseño "${design.name}" de TaDi — mirá cómo queda antes de elegirlo.`,
  });
  html = html.replace("<body>", "<body>" + DEMO_BACK_BUTTON);
  html = html.includes("</body>") ? html.replace("</body>", demoCtaBarHTML(design) + "</body>") : html + demoCtaBarHTML(design);
  res.send(html);
});

// ---------- CHECKOUT ----------

function planCardsHTML(catId, selectedPlanId) {
  const plans = pricing.plansForCategory(catId);
  return `<div class="plan-picker" role="radiogroup" aria-label="Elegí tu plan">
    ${plans.map((p, i) => {
      const checked = p.id === selectedPlanId ? "checked" : "";
      const isRecommended = p.id === "plus";
      return `<label class="plan-card${checked ? " selected" : ""}">
        <input type="radio" name="plan" value="${p.id}" data-price="${p.price}" ${checked}>
        <div class="plan-card-head">
          <span class="plan-card-name">${p.label}</span>
          ${isRecommended ? `<span class="plan-card-flag">Recomendado</span>` : ""}
        </div>
        <div class="plan-card-price">${moneyARS(p.price)}</div>
        <p class="plan-card-tagline">${p.tagline}</p>
        <ul class="plan-card-includes">
          ${p.includes.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </label>`;
    }).join("")}
  </div>`;
}

app.get("/checkout/:designId", (req, res) => {
  const design = getDesign(req.params.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");
  const defaultPlan = pricing.defaultPlan(design.category);
  res.send(layout({
    title: "Checkout",
    req,
    robotsNoindex: true,
    body: `<div class="checkout-wrap" style="max-width:720px">
      <h1>Estás por elegir: ${design.name}</h1>
      <p style="color:var(--muted)">${design.summary}</p>
      <p style="margin:0 0 20px;"><a href="/demo/${design.id}">← Ver el diseño completo antes de pagar</a></p>
      <div class="checkout-row"><span>Diseño</span><strong>${design.name}</strong></div>
      <div class="checkout-row"><span>Categoría</span><strong>${categories.find((c) => c.id === design.category).label}</strong></div>

      <h2 class="plan-picker-title">Elegí tu plan</h2>
      <form method="POST" action="/api/orders" id="checkout-form">
        <input type="hidden" name="designId" value="${design.id}">
        ${planCardsHTML(design.category, defaultPlan.id)}
        <div class="checkout-price" id="checkout-total">${moneyARS(defaultPlan.price)}</div>
        <div class="field" style="margin-bottom:16px;text-align:left;">
          <label for="checkout-email">Tu email</label>
          <input type="email" id="checkout-email" name="email" required placeholder="tu@email.com"
            style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--line);font-family:inherit;font-size:1rem;">
          <p class="field-help">Te mandamos el link de tu invitación acá también, como respaldo, para que no se pierda aunque cierres esta ventana.</p>
        </div>
        <label class="terms-check">
          <input type="checkbox" name="aceptaTerminos" id="aceptaTerminos" required>
          <span>Leí y acepto los <a href="/terminos" target="_blank">Términos y condiciones</a> — en especial, que <strong>una vez acreditado el pago no hay reembolsos ni cancelaciones</strong>.</span>
        </label>
        <button class="mp-btn" type="submit">🔒 Pagar con Mercado Pago</button>
      </form>
      <p class="checkout-trust">Podés pagar con tarjeta, cuotas (según lo que ofrezca tu banco) o dinero en cuenta — Mercado Pago te muestra las opciones disponibles antes de confirmar. Pago 100% seguro, no vemos ni guardamos tu tarjeta.</p>
      ${BUSINESS_LEGAL_NAME ? `<p class="checkout-trust">Vendido por ${BUSINESS_LEGAL_NAME}${BUSINESS_CUIT ? ` (CUIT ${BUSINESS_CUIT})` : ""}.</p>` : ""}
      <p class="checkout-trust">¿Dudas antes de pagar? Mirá las <a href="/preguntas-frecuentes">preguntas frecuentes</a>${SUPPORT_WHATSAPP ? ` o <a href="https://wa.me/${SUPPORT_WHATSAPP}" target="_blank">escribinos por WhatsApp</a>` : ""}.</p>
      ${!mp.isConfigured() ? `<div class="demo-note">Modo demo: no hay credenciales de Mercado Pago cargadas, así que el pago se simula como aprobado al instante para que puedas probar todo el flujo. Para cobrar de verdad, cargá <code>MP_ACCESS_TOKEN</code> (ver README).</div>` : ""}
    </div>
    <script>
      (function(){
        var form = document.getElementById('checkout-form');
        var total = document.getElementById('checkout-total');
        var radios = form.querySelectorAll('input[name="plan"]');
        function fmt(n){ return '$' + Number(n).toLocaleString('es-AR') + ' ARS'; }
        radios.forEach(function(r){
          r.addEventListener('change', function(){
            radios.forEach(function(other){ other.closest('.plan-card').classList.toggle('selected', other.checked); });
            total.textContent = fmt(r.dataset.price);
          });
        });
      })();
    </script>`,
  }));
});

// crea la orden y, según haya o no credenciales reales, redirige a Mercado
// Pago o directamente al flujo de éxito simulado (modo demo).
app.post("/api/orders", publicWriteLimiter, async (req, res) => {
  const design = getDesign(req.body.designId);
  if (!design) return res.status(404).send("Diseño no encontrado");

  // El plan viaja como radio button del form — se re-valida acá contra la
  // categoría real del diseño (no confiar en lo que mande el cliente), así
  // alguien no puede pegar un plan/precio de otra categoría a mano.
  const plan = pricing.getPlan(design.category, req.body.plan) || pricing.defaultPlan(design.category);

  // El checkbox de términos y condiciones ya es "required" en el HTML, pero
  // eso solo frena al navegador — alguien pegando el POST directo (o un bot)
  // lo saltea. Se valida también acá para que quede constancia real de la
  // aceptación en cada orden, no solo en el front.
  if (!req.body.aceptaTerminos) {
    return res.status(400).send("Tenés que aceptar los Términos y condiciones para continuar.");
  }

  const db = getDB();
  const orderId = uid("order");
  const order = {
    id: orderId,
    designId: design.id,
    plan: plan.id,
    amount: plan.price,
    status: "pending",
    buyerEmail: (req.body.email || "").trim(),
    createdAt: new Date().toISOString(),
    termsAcceptedAt: new Date().toISOString(),
  };
  db.orders.push(order);
  saveDB(db);

  const baseUrl = resolvePublicBaseUrl(req);

  if (mp.isConfigured()) {
    try {
      const initPoint = await mp.createPreference({
        orderId,
        title: `Invitación digital — ${design.name} (plan ${plan.label})`,
        unitPrice: plan.price,
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
    // El plan queda guardado en la propia invitación (no solo en la orden)
    // porque es lo que se consulta en cada render público para decidir si
    // se muestran música/mapa/muro/extras — más simple que ir a buscar la
    // orden cada vez.
    db.invitations.push({
      orderId: ord.id,
      designId: ord.designId,
      plan: ord.plan || pricing.defaultPlan(design.category).id,
      slug: ord.publicSlug,
      data: blankInvitationData(design),
      updatedAt: new Date().toISOString(),
    });
  }
  saveDB(db);
  return ord;
}

// Manda el mail con el link de edición (respaldo por si se pierde la
// pestaña) — se llama tanto desde la vuelta del checkout como desde el
// webhook, así que se protege con ord.emailSent para no mandarlo dos veces
// si ambos caminos terminan disparando para la misma orden.
async function sendOrderEmail(order, baseUrl) {
  if (order.emailSent || !order.buyerEmail) return { sent: false, alreadySent: Boolean(order.emailSent) };
  const db = getDB();
  const ord = db.orders.find((o) => o.id === order.id);
  if (!ord || ord.emailSent) return { sent: false, alreadySent: Boolean(ord && ord.emailSent) };

  const design = getDesign(ord.designId);
  // baseUrl ya viene resuelto y validado por resolvePublicBaseUrl(req) desde
  // quien llama a esta función (ver ahí el porqué) — acá no lo tocamos más,
  // así evitamos pisarlo de nuevo con una PUBLIC_BASE_URL sin validar.
  baseUrl = baseUrl || "";
  try {
    const result = await mailer.sendInvitationLinkEmail({
      to: ord.buyerEmail,
      nombreEvento: design ? design.name : "",
      designName: design ? design.name : "",
      editUrl: `${baseUrl}/editar/${ord.editToken}`,
      publicUrl: ord.publicSlug ? `${baseUrl}/invitacion/${ord.publicSlug}` : "",
    });
    // Si el mailer lo saltó (modo demo, sin SMTP configurado) no marcamos
    // emailSent: así, si más adelante se configura SMTP en producción,
    // esa misma orden puede recibir el mail real en el próximo intento.
    if (!result || !result.skipped) {
      ord.emailSent = true;
      saveDB(db);
      return { sent: true };
    }
    return { sent: false, demo: true };
  } catch (err) {
    console.error("Error enviando mail con el link de la invitación:", err);
    return { sent: false, error: true };
  }
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
  sendOrderEmail(paid, resolvePublicBaseUrl(req)).catch(() => {}); // no bloquea la redirección si el mail tarda o falla
  res.redirect(`/editar/${paid.editToken}?bienvenida=1`);
});

app.get("/pago-pendiente", (req, res) => {
  res.send(layout({ title: "Pago pendiente", req, robotsNoindex: true, body: `<div class="status-page"><h1>⏳ Tu pago está pendiente</h1><p>Te avisamos apenas se acredite. Podés cerrar esta ventana.</p></div>` }));
});
app.get("/pago-fallido", (req, res) => {
  res.send(layout({ title: "Pago fallido", req, robotsNoindex: true, body: `<div class="status-page"><h1>❌ El pago no pudo procesarse</h1><p>Podés volver al catálogo e intentar de nuevo.</p><p><a class="btn btn-primary" href="/">Volver al catálogo</a></p></div>` }));
});

// webhook real de Mercado Pago (para producción)
app.post("/webhook/mercadopago", express.json(), async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query["data.id"];
    if (paymentId && mp.isConfigured()) {
      const { status, externalReference } = await mp.getPayment(paymentId);
      if (status === "approved" && externalReference) {
        const db = getDB();
        const order = db.orders.find((o) => o.id === externalReference);
        // Si el comprador ya volvió por /pago-exitoso, la orden ya está
        // "paid" y markOrderPaid es inofensivo de llamar de nuevo (solo
        // refresca paidAt); sendOrderEmail se autoprotege con emailSent
        // para no mandar el mail dos veces.
        if (order) {
          const paid = markOrderPaid(order);
          await sendOrderEmail(paid, resolvePublicBaseUrl(req)).catch((err) =>
            console.error("Error enviando mail desde el webhook:", err)
          );
        } else {
          console.warn(`Webhook: no se encontró la orden ${externalReference} para el pago ${paymentId}`);
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});

// ---------- EDITOR (post-pago) ----------
function helpHTML(f) {
  return f.help ? `<p class="field-help">${escapeHtml(f.help)}</p>` : "";
}

// Paleta fija de 10 colores para los selectores de "color de camiseta"
// (ej. diseño Fútbol): en vez del selector de color libre del navegador,
// se eligen entre estos 10 nombrados — más simple y a prueba de combinaciones
// raras.
const COLOR_SWATCHES = [
  { name: "Blanco", hex: "#ffffff" },
  { name: "Rojo", hex: "#e11d2e" },
  { name: "Negro", hex: "#111111" },
  { name: "Azul", hex: "#1a56db" },
  { name: "Amarillo", hex: "#ffd400" },
  { name: "Celeste", hex: "#75aadb" },
  { name: "Granate", hex: "#7a1927" },
  { name: "Naranja", hex: "#ff7a3d" },
  { name: "Verde", hex: "#178345" },
  { name: "Rosado", hex: "#ec4899" },
];

function fieldHTML(f, value) {
  const val = value ?? "";
  if (f.type === "textarea") {
    return `<div class="field"><label>${f.label}${f.required ? " *" : ""}</label>${helpHTML(f)}<textarea name="${f.name}">${escapeHtml(val)}</textarea></div>`;
  }
  if (f.type === "image") {
    return `<div class="field"><label>${f.label}</label>${helpHTML(f)}
      <input type="hidden" name="${f.name}" value="${escapeHtml(val)}" id="hidden-${f.name}">
      <input type="file" accept="image/*" data-target="${f.name}" class="single-upload">
      <div class="single-preview-row" id="preview-${f.name}" ${val ? "" : 'style="display:none"'}>
        <div class="thumb"><img src="${escapeHtml(val)}"><button type="button" class="thumb-remove single-remove" data-target="${f.name}" title="Quitar imagen">✕</button></div>
      </div>
    </div>`;
  }
  if (f.type === "video") {
    return `<div class="field"><label>${f.label}</label>${helpHTML(f)}
      <input type="hidden" name="${f.name}" value="${escapeHtml(val)}" id="hidden-${f.name}">
      <input type="file" accept="video/*" data-target="${f.name}" class="single-upload-video">
      <div class="single-preview-row" id="preview-${f.name}" ${val ? "" : 'style="display:none"'}>
        <div class="thumb thumb-video"><video src="${escapeHtml(val)}" muted controls></video><button type="button" class="thumb-remove single-remove" data-target="${f.name}" title="Quitar video">✕</button></div>
      </div>
    </div>`;
  }
  if (f.type === "checkbox") {
    return `<div class="field field-checkbox"><label class="checkbox-label">
      <input type="checkbox" name="${f.name}" ${val ? "checked" : ""}>
      <span>${f.label}</span>
    </label>${helpHTML(f)}</div>`;
  }
  if (f.type === "images") {
    const arr = Array.isArray(value) ? value : [];
    return `<div class="field"><label>${f.label}</label>${helpHTML(f)}
      <input type="hidden" name="${f.name}" value='${escapeHtml(JSON.stringify(arr))}' id="hidden-${f.name}">
      <input type="file" accept="image/*" multiple data-target="${f.name}" class="multi-upload">
      <div class="gallery-preview" id="preview-${f.name}">${arr.map((s) => `<div class="thumb"><img src="${escapeHtml(s)}"><button type="button" class="thumb-remove" data-target="${f.name}" data-url="${escapeHtml(s)}" title="Quitar foto">✕</button></div>`).join("")}</div>
    </div>`;
  }
  if (f.type === "music") {
    return `<div class="field"><label>${f.label}</label>${helpHTML(f)}
      <select name="${f.name}" class="music-select" id="music-select-${f.name}">
        <option value="">Sin música</option>
        ${music.MUSIC_LIBRARY.map((t) => `<option value="${t.id}" ${val === t.id ? "selected" : ""}>${escapeHtml(t.label)} — ${escapeHtml(t.mood)}</option>`).join("")}
      </select>
      <audio id="music-preview-${f.name}" style="width:100%;margin-top:8px;${val ? "" : "display:none"}" controls src="${val ? music.trackUrl(val) : ""}"></audio>
      <script>
        (function(){
          var sel = document.getElementById("music-select-${f.name}");
          var player = document.getElementById("music-preview-${f.name}");
          var urls = ${JSON.stringify(Object.fromEntries(music.MUSIC_LIBRARY.map((t) => [t.id, music.trackUrl(t.id)])))};
          sel.addEventListener("change", function(){
            if (!sel.value) { player.pause(); player.removeAttribute("src"); player.style.display = "none"; return; }
            player.src = urls[sel.value];
            player.style.display = "";
            player.play().catch(function(){});
          });
        })();
      </script>
    </div>`;
  }
  if (f.type === "color") {
    const val2 = /^#[0-9a-fA-F]{6}$/.test(val) ? val.toLowerCase() : "#ffd400";
    return `<div class="field field-swatches"><label>${f.label}${f.required ? " *" : ""}</label>${helpHTML(f)}
      <input type="hidden" name="${f.name}" value="${escapeHtml(val2)}" id="hidden-${f.name}">
      <div class="swatch-row" data-target="${f.name}">${COLOR_SWATCHES.map((s) => `<button type="button" class="swatch-btn${val2 === s.hex ? " selected" : ""}" data-target="${f.name}" data-hex="${s.hex}" style="background:${s.hex}" title="${s.name}" aria-label="${s.name}"></button>`).join("")}</div>
    </div>`;
  }
  return `<div class="field"><label>${f.label}${f.required ? " *" : ""}</label>${helpHTML(f)}<input type="${f.type}" name="${f.name}" value="${escapeHtml(val)}"></div>`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Íconos de línea para el menú del Panel de tu evento — antes eran emoji
// (📝✏️💌...), que en la barra inferior fija de mobile (estilo Instagram)
// quedaban demasiado "de colores" para ese look minimal. SVG de trazo
// fino (stroke, sin relleno), mismo estilo en las 6: son los únicos
// lugares que los usan, por eso van inline acá en vez de como archivos
// aparte.
function navIcon(name) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"';
  const paths = {
    resumen: `<rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>`,
    editar: `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
    invitados: `<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    confirmaciones: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>`,
    fotos: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/>`,
    links: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  };
  return `<svg ${common}>${paths[name] || ""}</svg>`;
}

// Sección de moderación del muro de invitados dentro del editor: el dueño
// ve todo lo que subieron sus invitados y puede borrar lo que no
// corresponda. Solo se muestra si el plan comprado tiene la feature "muro".
function muroModerationHTML(order, inv) {
  const photos = inv.muro || [];
  return `<div class="wall-mod-section">
    <h2 class="links-section-title">📷 Muro de fotos de invitados (${photos.length})</h2>
    <p style="color:var(--muted);font-size:.82rem;margin:0 0 12px;">Tus invitados pueden subir fotos desde el link de la invitación. Tocá la estrella para destacar tus favoritas, o la ✕ para borrar la que no corresponda.</p>
    <div class="wall-mod-grid" id="wallModGrid">
      ${photos.length ? photos.map((p) => `
        <div class="wall-mod-thumb${p.destacada ? " wall-mod-thumb-destacada" : ""}" data-id="${escapeHtml(p.id)}">
          <img src="${escapeHtml(p.url)}">
          <button type="button" class="wall-mod-star${p.destacada ? " active" : ""}" data-token="${escapeHtml(order.editToken)}" data-id="${escapeHtml(p.id)}" title="Destacar foto">${p.destacada ? "★" : "☆"}</button>
          <button type="button" class="wall-mod-remove" data-token="${escapeHtml(order.editToken)}" data-id="${escapeHtml(p.id)}" title="Borrar foto">✕</button>
        </div>`).join("") : `<p style="color:var(--muted);font-size:.82rem;">Todavía no subieron ninguna foto.</p>`}
    </div>
  </div>`;
}

// Confirmaciones — junta las del link general (RSVP libre) con las de
// invitados con link personal (allConfirmaciones) para que el número del
// título y la lista de acá reflejen TODAS las confirmaciones, no solo las
// del link general: antes solo contaba db.rsvps, así que una invitación
// Premium que recibía confirmaciones únicamente por links personales
// mostraba "Confirmaciones (0)" aunque ya tuviera invitados confirmados.
function confirmacionesHTML(db, inv, token) {
  const todas = allConfirmaciones(db, inv);
  const asisten = todas.filter((c) => c.asiste !== "no");
  const totalPersonas = asisten.reduce((sum, c) => sum + (Number(c.cantidad) || 1), 0);
  return `<div class="links-section">
    <h2 class="links-section-title">✅ Confirmaciones (${todas.length})</h2>
    ${todas.length ? `<a class="btn btn-outline" href="/editar/${escapeHtml(token)}/confirmaciones.xlsx" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;margin-bottom:14px;">📥 Descargar Excel</a><p style="color:var(--muted);font-size:.76rem;margin:-10px 0 14px;">Incluye las confirmaciones del link general y las de invitados con link personal, todas juntas.</p>` : ""}
    ${todas.length ? `<p style="color:var(--muted);font-size:.82rem;margin:0 0 12px;">${asisten.length} de ${todas.length} confirmaron que van · ${totalPersonas} persona(s) en total.</p>` : ""}
    ${todas.map((c) => `<div class="checkout-row" style="align-items:flex-start;"><span>${escapeHtml(c.nombre || "-")} ${c.cantidad ? "(" + escapeHtml(String(c.cantidad)) + ")" : ""} <span style="color:var(--muted);font-size:.72rem;">· ${escapeHtml(c.origen)}</span>${c.cancion ? `<br><span style="color:var(--accent-2);font-size:.74rem;">🎵 ${escapeHtml(c.cancion)}</span>` : ""}</span><strong>${c.asiste === "no" ? "❌ No asiste" : "✅ Asiste"}</strong></div>`).join("") || `<p style="color:var(--muted);font-size:.82rem;">Todavía no hay confirmaciones.</p>`}
  </div>`;
}

// Invitados nombrados con link personal + cupo de acompañantes (feature
// "invitadosPersonalizados", plan Premium bodas/xv). El organizador carga
// acá cada invitado/grupo, le genera un link único (/invitacion/:slug/i/:token)
// y lo manda por WhatsApp ya con el mensaje personalizado armado — no hay
// forma de mandarlos todos de una (WhatsApp no lo permite sin su API paga),
// así que es un botón "Enviar" por cada invitado.
function invitadosPersonalizadosHTML(order, inv, req, design) {
  const guests = inv.invitadosNombrados || [];
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const evento = eventoLabel(design.category, inv.data);
  return `<div class="links-section">
    <h2 class="links-section-title">💌 Invitados con link personal (${guests.length})</h2>
    <p style="color:var(--muted);font-size:.82rem;margin:0 0 14px;">Cargá cada invitado o grupo con su cupo de acompañantes. Cada uno recibe un link propio: al confirmar, van a poder elegir cuántos de los lugares reservados van a usar y con qué nombres — y esa confirmación aparece acá abajo, sin mezclarse con las del link general.</p>
    <form id="addGuestForm" class="add-guest-form">
      <input type="text" name="nombre" placeholder="Ej: Juan y Rosa" required maxlength="80">
      <input type="number" name="cupo" placeholder="Cupo" min="1" max="20" value="1" required style="width:80px">
      <button type="submit" class="btn btn-outline" style="white-space:nowrap;">+ Agregar</button>
    </form>
    <div id="guestList">
      ${guests.length ? guests.map((g) => {
        const url = `${baseUrl}/invitacion/${order.publicSlug}/i/${g.token}`;
        const c = g.confirmacion;
        const estado = !c
          ? `<span class="guest-estado guest-estado-pendiente">Pendiente</span>`
          : c.asiste === "no"
            ? `<span class="guest-estado guest-estado-no">❌ No asiste</span>`
            : `<span class="guest-estado guest-estado-si">✅ Confirmó ${c.cantidad} · ${(c.nombres || []).filter(Boolean).join(", ") || "-"}</span>`;
        const gCupo = Math.max(1, Number(g.cupo) || 1);
        const waText = gCupo === 1
          ? `¡Hola ${g.nombre}! Estás invitado/a a ${evento}. Confirmá tu asistencia acá, es un toque: ${url}`
          : `¡Hola ${g.nombre}! Están invitados a ${evento}. Confirmen su asistencia acá, es un toque: ${url}`;
        return `<div class="guest-row" data-id="${escapeHtml(g.id)}">
          <div class="guest-row-main">
            <strong>${escapeHtml(g.nombre)}</strong> <span style="color:var(--muted);font-size:.78rem;">· cupo ${g.cupo}</span>
            ${estado}
          </div>
          <div class="guest-row-actions">
            <button type="button" class="copy-btn" data-copy="${escapeHtml(url)}">📋 Copiar link</button>
            <a class="wa-btn" href="https://wa.me/?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener">💬 Enviar</a>
            <button type="button" class="guest-remove" data-token="${escapeHtml(order.editToken)}" data-id="${escapeHtml(g.id)}" title="Quitar invitado">✕</button>
          </div>
        </div>`;
      }).join("") : `<p style="color:var(--muted);font-size:.82rem;">Todavía no cargaste ningún invitado.</p>`}
    </div>
  </div>`;
}

// Checklist de "te falta completar" en la pestaña Resumen — antes esa
// pestaña quedaba vacía (mucho espacio en blanco) sin guiar a alguien que
// recién entra por primera vez sobre por dónde arrancar. Se arma con los
// campos obligatorios del schema del plan más un par de opcionales que
// valen la pena (portada, galería, ubicación, música si el plan la tiene).
function panelChecklistHTML(design, inv) {
  const schema = schemaForPlan(design, inv.plan);
  const importantNames = ["coverImage", "galeria", "musica"];
  const items = schema.filter((f) => f.required || importantNames.includes(f.name));
  const locField = schema.find((f) => ["lugar", "lugarFiesta"].includes(f.name));
  if (locField && !items.includes(locField)) items.push(locField);
  if (!items.length) return "";
  const withStatus = items.map((f) => {
    const v = inv.data[f.name];
    const done = Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
    const label = f.label.replace(/\s*\(opcional\)/i, "").replace(/\s*—.*$/, "");
    return { label, done };
  });
  const doneCount = withStatus.filter((i) => i.done).length;
  const pct = Math.round((100 * doneCount) / withStatus.length);
  return `<div class="panel-checklist">
    <div class="panel-checklist-head"><strong>Te falta completar</strong><span>${doneCount}/${withStatus.length}</span></div>
    <div class="panel-checklist-bar"><div class="panel-checklist-fill" style="width:${pct}%"></div></div>
    <ul class="panel-checklist-list">
      ${withStatus.map((i) => `<li class="${i.done ? "done" : ""}">${i.done ? "✅" : "⬜"} ${escapeHtml(i.label)}</li>`).join("")}
    </ul>
  </div>`;
}

app.get("/editar/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send(layout({ title: "No encontrado", req, robotsNoindex: true, body: `<div class="status-page"><h1>Link no válido</h1><p>Este link de edición no existe o el pago todavía no fue confirmado.</p></div>` }));

  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);

  if (isEditLocked(inv)) return res.send(lockedPage(order, design, inv));

  const publicUrl = `${req.protocol}://${req.get("host")}/invitacion/${order.publicSlug}`;

  // Stats de la pestaña "Resumen" — solo cuentan lo que aplica según el plan
  // (invitados nombrados es feature Premium bodas/xv, así que en el resto
  // de los planes esa tarjeta directamente no se muestra).
  const hasInvitadosNombrados = pricing.hasFeature(design.category, inv.plan, "invitadosPersonalizados");
  const nombrados = inv.invitadosNombrados || [];
  const rsvpsGenericos = db.rsvps.filter((r) => r.slug === inv.slug);
  const personasConfirmadas =
    nombrados.filter((g) => g.confirmacion && g.confirmacion.asiste === "si").reduce((sum, g) => sum + (Number(g.confirmacion.cantidad) || 1), 0) +
    rsvpsGenericos.filter((r) => r.asiste !== "no").reduce((sum, r) => sum + (Number(r.acompaniantes) || 1), 0);
  const invitadosPendientes = nombrados.filter((g) => !g.confirmacion).length;
  const fotosCount = (inv.muro || []).length;
  let diasLabel = "-";
  if (inv.data.fecha) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(inv.data.fecha + "T00:00:00");
    if (!isNaN(fechaEvento.getTime())) {
      const dias = Math.round((fechaEvento - hoy) / 86400000);
      diasLabel = dias > 0 ? String(dias) : dias === 0 ? "¡Hoy!" : "Ya pasó";
    }
  }

  res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel de tu evento · TaDi</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/static/img/logo/tadi-favicon-16.png">
<link rel="apple-touch-icon" href="/static/img/logo/tadi-favicon-180.png">
<link rel="stylesheet" href="${CSS_HREF}"></head>
<body>
<div class="editor-wrap">
  <div class="editor-form-panel">
    <h1>🎛️ Panel de tu evento</h1>
    <p style="color:var(--muted);font-size:.85rem">Diseño: <strong>${design.name}</strong>. Los cambios se ven al instante en la vista previa → · <a href="/como-funciona" target="_blank" style="color:var(--accent)">¿Cómo funciona?</a></p>
    ${req.query.bienvenida ? `<p style="background:#e9f7ea;border:1px solid #bfe6c2;border-radius:8px;padding:10px;font-size:.85rem;color:#1e3a24">✅ ¡Pago confirmado! Ya podés personalizar tu invitación.</p>` : ""}

    <div class="panel-shell">
      <nav class="panel-nav" id="panelNav">
        <button type="button" class="panel-nav-item" data-target="resumen"><span class="nav-icon">${navIcon("resumen")}</span><span>Resumen</span></button>
        <button type="button" class="panel-nav-item" data-target="editar"><span class="nav-icon">${navIcon("editar")}</span><span>Editar diseño</span></button>
        ${hasInvitadosNombrados ? `<button type="button" class="panel-nav-item" data-target="invitados"><span class="nav-icon">${navIcon("invitados")}</span><span>Invitados</span></button>` : ""}
        <button type="button" class="panel-nav-item" data-target="confirmaciones"><span class="nav-icon">${navIcon("confirmaciones")}</span><span>Confirmaciones</span></button>
        ${pricing.hasFeature(design.category, inv.plan, "muro") ? `<button type="button" class="panel-nav-item" data-target="fotos"><span class="nav-icon">${navIcon("fotos")}</span><span>Fotos</span></button>` : ""}
        <button type="button" class="panel-nav-item" data-target="links"><span class="nav-icon">${navIcon("links")}</span><span>Links</span></button>
      </nav>

      <div class="panel-content">
        <section class="panel-section" data-section="resumen">
          ${panelChecklistHTML(design, inv)}
          <div class="panel-stat-row">
            <div class="panel-stat-tile"><div class="panel-stat-num">${personasConfirmadas}</div><div class="panel-stat-label">Personas confirmadas</div></div>
            ${hasInvitadosNombrados ? `<div class="panel-stat-tile"><div class="panel-stat-num">${invitadosPendientes}</div><div class="panel-stat-label">Invitados pendientes</div></div>` : `<div class="panel-stat-tile"><div class="panel-stat-num">${rsvpsGenericos.length}</div><div class="panel-stat-label">Confirmaciones</div></div>`}
            <div class="panel-stat-tile"><div class="panel-stat-num">${fotosCount}</div><div class="panel-stat-label">Fotos subidas</div></div>
            <div class="panel-stat-tile"><div class="panel-stat-num">${diasLabel}</div><div class="panel-stat-label">${diasLabel === "1" ? "Día para el evento" : "Días para el evento"}</div></div>
          </div>
          <p style="color:var(--muted);font-size:.8rem;">Usá el menú de la izquierda para editar tu invitación, cargar invitados con link personal, moderar fotos o ver tus links para compartir.</p>
        </section>

        <section class="panel-section" data-section="editar">
          <form id="editForm">
            ${schemaForPlan(design, inv.plan).filter((f) => f.type !== "palette").map((f) => fieldHTML(f, inv.data[f.name])).join("")}
          </form>
          ${req.query.disenoCambiado ? `<p style="background:#e9f7ea;border:1px solid #bfe6c2;border-radius:8px;padding:10px;font-size:.85rem;color:#1e3a24">✅ ¡Listo! Cambiamos el diseño. Los datos que coincidían (fecha, lugar, fotos, etc.) se mantuvieron, revisá que esté todo como querés.</p>` : ""}
          <a href="/editar/${order.editToken}/cambiar-diseno" class="btn btn-outline" style="display:block;width:100%;text-align:center;text-decoration:none;margin-top:16px;box-sizing:border-box;">
            🔄 ¿Te confundiste de diseño? Cambiar diseño
          </a>
        </section>

        ${hasInvitadosNombrados ? `<section class="panel-section" data-section="invitados">
          ${invitadosPersonalizadosHTML(order, inv, req, design)}
        </section>` : ""}

        <section class="panel-section" data-section="confirmaciones">
          ${confirmacionesHTML(db, inv, order.editToken)}
        </section>

        ${pricing.hasFeature(design.category, inv.plan, "muro") ? `<section class="panel-section" data-section="fotos">
          ${muroModerationHTML(order, inv)}
        </section>` : ""}

        <section class="panel-section" data-section="links">
          <div class="links-section" style="margin-top:0;padding-top:0;border-top:0;">
            <h2 class="links-section-title">🔗 Tus links</h2>
            ${pricing.hasFeature(design.category, inv.plan, "alias") && inv.data.aliasPersonalizado ? (() => {
              const aliasUrl = `${req.protocol}://${req.get("host")}/${inv.data.aliasPersonalizado}`;
              return `<div class="link-box">
              <p class="link-box-label">✨ Tu link personalizado</p>
              <a class="link-box-url" href="${aliasUrl}" target="_blank">${aliasUrl}</a>
              <div class="link-box-actions">
                <button type="button" class="copy-btn" data-copy="${escapeHtml(aliasUrl)}">📋 Copiar</button>
                <a class="wa-btn" href="https://wa.me/?text=${encodeURIComponent(`¡Ya está lista mi invitación! Mirala acá: ${aliasUrl}`)}" target="_blank" rel="noopener">💬 WhatsApp</a>
              </div>
            </div>`;
            })() : ""}
            <div class="link-box">
              <p class="link-box-label">Para compartir con tus invitados</p>
              <a class="link-box-url" href="${publicUrl}" target="_blank">${publicUrl}</a>
              <div class="link-box-actions">
                <button type="button" class="copy-btn" data-copy="${escapeHtml(publicUrl)}">📋 Copiar</button>
                <a class="wa-btn" href="https://wa.me/?text=${encodeURIComponent(`¡Ya está lista mi invitación! Mirala acá: ${publicUrl}`)}" target="_blank" rel="noopener">💬 WhatsApp</a>
              </div>
            </div>
            <div class="link-box">
              <p class="link-box-label">🎛️ Tu panel de evento (guardalo, es tuyo)</p>
              <a class="link-box-url" href="/editar/${order.editToken}">${req.protocol}://${req.get("host")}/editar/${order.editToken}</a>
              <div class="link-box-actions">
                <button type="button" class="copy-btn" data-copy="${escapeHtml(`${req.protocol}://${req.get("host")}/editar/${order.editToken}`)}">📋 Copiar</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="finish-bar">
      <button class="finish-btn" type="submit" form="editForm" id="finishBtn">✅ ¡Listo!</button>
      <p class="finish-hint" id="finishHint">Guarda los cambios y te manda tus links por mail.</p>
    </div>
  </div>
  <div class="editor-preview-panel" id="previewPanel">
    <div class="preview-device-toggle">
      <button type="button" class="preview-device-btn active" data-device="mobile" aria-pressed="true">📱 Celular</button>
      <button type="button" class="preview-device-btn" data-device="desktop" aria-pressed="false">🖥️ Escritorio</button>
    </div>
    <div class="preview-frame-wrap">
      <iframe id="preview" src="/preview/${order.editToken}"></iframe>
    </div>
  </div>
</div>
<script>
  const token = ${JSON.stringify(order.editToken)};
  const form = document.getElementById('editForm');
  const iframe = document.getElementById('preview');

  // Panel de tu evento: nav lateral (sidebar en desktop, pestañas horizontales
  // en mobile por CSS) — todo en el cliente, sin recargar la página. El tab
  // activo queda en el hash de la URL así sobrevive a un location.reload()
  // (ej. después de agregar un invitado) y se puede compartir/bookmarkear.
  (function(){
    var navItems = document.querySelectorAll('.panel-nav-item');
    var sections = document.querySelectorAll('.panel-section');
    function activate(target){
      var found = false;
      sections.forEach(function(s){
        var match = s.dataset.section === target;
        s.classList.toggle('active', match);
        if (match) found = true;
      });
      if (!found && sections.length) sections[0].classList.add('active');
      navItems.forEach(function(b){ b.classList.toggle('active', b.dataset.target === target); });
    }
    navItems.forEach(function(btn){
      btn.addEventListener('click', function(){
        window.location.hash = btn.dataset.target;
        activate(btn.dataset.target);
      });
    });
    activate((window.location.hash || '#resumen').slice(1));
  })();

  // Toggle 📱/🖥️ de la vista previa: por default se ve como celular, que es
  // como la va a abrir casi cualquier invitado (el link se comparte por
  // WhatsApp) — antes solo se veía en ancho de escritorio y quien edita
  // nunca terminaba de ver cómo le queda a la gente que la recibe.
  (function(){
    var panel = document.getElementById('previewPanel');
    var btns = document.querySelectorAll('.preview-device-btn');
    if (!panel || !btns.length) return;
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        btns.forEach(function(b){ b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        panel.classList.toggle('device-desktop', btn.dataset.device === 'desktop');
      });
    });
  })();

  // Al hacer foco en un campo de texto (click o Tab), selecciona todo el
  // contenido de una — así para cambiar un dato alcanza con tipear encima,
  // sin tener que borrar a mano primero. 'focus' no burbujea, por eso el
  // listener va en captura (true) sobre el form entero en vez de campo por
  // campo. Se excluyen los campos de tipo file/color/checkbox/etc, donde
  // "seleccionar todo el texto" no tiene sentido.
  const SELECT_ALL_TYPES = ['text', 'email', 'url', 'tel', 'search', 'number', 'date', 'time', 'textarea'];
  form.addEventListener('focus', function(e){
    const el = e.target;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    const type = tag === 'textarea' ? 'textarea' : (el.type || '');
    if (SELECT_ALL_TYPES.indexOf(type) === -1) return;
    if (typeof el.select === 'function') el.select();
  }, true);

  // Copiar link con un click (con fallback para navegadores/contextos sin
  // acceso a navigator.clipboard, como http sin TLS).
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      const text = btn.dataset.copy;
      const done = function(){
        const original = btn.textContent;
        btn.textContent = '✅ ¡Copiado!';
        btn.classList.add('copied');
        setTimeout(function(){ btn.textContent = original; btn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function(){ fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });
  function fallbackCopy(text, done){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  // Borrar una foto del muro de invitados (moderación) — confirma antes de
  // sacarla porque es irreversible (borra también el archivo del server).
  document.querySelectorAll('.wall-mod-remove').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (!confirm('¿Borrar esta foto del muro? No se puede deshacer.')) return;
      const wrap = btn.closest('.wall-mod-thumb');
      fetch('/api/invitaciones/' + btn.dataset.token + '/muro/eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: btn.dataset.id }),
      })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data.ok && wrap) wrap.remove();
        })
        .catch(function(){});
    });
  });

  // Destacar/quitar destaque de una foto del muro (para el carrusel de
  // favoritas) — toggle instantáneo, sin confirmación (no es destructivo).
  document.querySelectorAll('.wall-mod-star').forEach(function(btn){
    btn.addEventListener('click', function(){
      fetch('/api/invitaciones/' + btn.dataset.token + '/muro/' + btn.dataset.id + '/destacar', { method: 'POST' })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (!data.ok) return;
          btn.textContent = data.destacada ? '★' : '☆';
          btn.classList.toggle('active', data.destacada);
          var thumb = btn.closest('.wall-mod-thumb');
          if (thumb) thumb.classList.toggle('wall-mod-thumb-destacada', data.destacada);
        })
        .catch(function(){});
    });
  });

  // Alta de invitado nombrado con cupo (plan Premium bodas/xv) — recarga la
  // página al agregar para no duplicar el HTML de la fila en el cliente.
  const addGuestForm = document.getElementById('addGuestForm');
  if (addGuestForm) {
    addGuestForm.addEventListener('submit', function(e){
      e.preventDefault();
      const fd = new FormData(addGuestForm);
      const submitBtn = addGuestForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      fetch('/editar/' + token + '/invitados-personalizados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: fd.get('nombre'), cupo: fd.get('cupo') }),
      })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data.ok) { window.location.hash = 'invitados'; window.location.reload(); return; }
          alert(data.error || 'No se pudo agregar.');
          submitBtn.disabled = false;
        })
        .catch(function(){ submitBtn.disabled = false; });
    });
  }

  document.querySelectorAll('.guest-remove').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (!confirm('¿Quitar este invitado y su link? Si ya confirmó, se pierde esa respuesta.')) return;
      const row = btn.closest('.guest-row');
      fetch('/editar/' + btn.dataset.token + '/invitados-personalizados/' + btn.dataset.id + '/eliminar', { method: 'POST' })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data.ok && row) row.remove();
        })
        .catch(function(){});
    });
  });

  function collect(){
    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    // Un checkbox sin marcar no aparece en FormData (a diferencia de un
    // input de texto vacío), así que sin esto nunca se podría "desmarcar"
    // algo ya guardado — se pisa acá explícitamente con su estado real.
    form.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
      data[cb.name] = cb.checked;
    });
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

  const finishBtn = document.getElementById('finishBtn');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (finishBtn) { finishBtn.disabled = true; finishBtn.textContent = 'Guardando…'; }
    fetch('/api/invitaciones/' + token + '/finalizar', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(collect())
    }).then(r => r.json()).then((res) => {
      if (res.mailSent) {
        alert('✅ ¡Listo! Guardamos los cambios y te mandamos un mail con tus links.');
      } else if (res.mailAlreadySent) {
        alert('✅ ¡Listo! Guardamos los cambios. Es el mismo link que ya te habíamos mandado por mail antes.');
      } else {
        alert('✅ ¡Listo! Guardamos los cambios.');
      }
      refreshPreview();
    }).catch(() => {
      alert('⚠️ No pudimos guardar los cambios. Probá de nuevo.');
    }).finally(() => {
      if (finishBtn) { finishBtn.disabled = false; finishBtn.textContent = '✅ ¡Listo!'; }
    });
  });

  // subida de imágenes (portada / galería)
  function thumbHTML(target, url){
    const div = document.createElement('div'); div.className = 'thumb';
    const img = document.createElement('img'); img.src = url;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'thumb-remove';
    btn.dataset.target = target; btn.dataset.url = url; btn.title = 'Quitar foto'; btn.textContent = '✕';
    div.appendChild(img); div.appendChild(btn);
    return div;
  }

  function uploadFile(file){
    const fd = new FormData(); fd.append('imagen', file);
    return fetch('/api/upload/' + token, { method:'POST', body: fd })
      .then(function(r){
        return r.json().catch(function(){ throw new Error('El servidor no respondió correctamente.'); })
          .then(function(data){
            if(!r.ok) throw new Error(data.error || 'No se pudo subir la foto.');
            return data;
          });
      });
  }

  function uploadVideoFile(file){
    const fd = new FormData(); fd.append('video', file);
    return fetch('/api/upload-video/' + token, { method:'POST', body: fd })
      .then(function(r){
        return r.json().catch(function(){ throw new Error('El servidor no respondió correctamente.'); })
          .then(function(data){
            if(!r.ok) throw new Error(data.error || 'No se pudo subir el video.');
            return data;
          });
      });
  }

  document.querySelectorAll('.single-upload-video').forEach(function(input){
    input.addEventListener('change', function(){
      if(!input.files[0]) return;
      uploadVideoFile(input.files[0]).then(function(res){
          document.getElementById('hidden-' + input.dataset.target).value = res.url;
          const preview = document.getElementById('preview-' + input.dataset.target);
          preview.innerHTML = '';
          const div = document.createElement('div'); div.className = 'thumb thumb-video';
          const vid = document.createElement('video'); vid.src = res.url; vid.muted = true; vid.controls = true;
          const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'thumb-remove single-remove';
          btn.dataset.target = input.dataset.target; btn.title = 'Quitar video'; btn.textContent = '✕';
          div.appendChild(vid); div.appendChild(btn);
          preview.appendChild(div);
          preview.style.display = '';
          input.value = '';
          refreshPreview();
        }).catch(function(err){
          alert('⚠️ ' + err.message);
          input.value = '';
        });
    });
  });

  document.querySelectorAll('.single-upload').forEach(function(input){
    input.addEventListener('change', function(){
      if(!input.files[0]) return;
      uploadFile(input.files[0]).then(function(res){
          document.getElementById('hidden-' + input.dataset.target).value = res.url;
          const preview = document.getElementById('preview-' + input.dataset.target);
          preview.innerHTML = '';
          const div = document.createElement('div'); div.className = 'thumb';
          const img = document.createElement('img'); img.src = res.url;
          const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'thumb-remove single-remove';
          btn.dataset.target = input.dataset.target; btn.title = 'Quitar imagen'; btn.textContent = '✕';
          div.appendChild(img); div.appendChild(btn);
          preview.appendChild(div);
          preview.style.display = '';
          input.value = '';
          refreshPreview();
        }).catch(function(err){
          alert('⚠️ ' + err.message);
          input.value = '';
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
        uploadFile(file).then(function(res){
            current.push(res.url);
            hidden.value = JSON.stringify(current);
            preview.appendChild(thumbHTML(input.dataset.target, res.url));
          }).catch(function(err){
            alert('⚠️ ' + err.message);
          }).finally(function(){
            pending--; if(pending === 0) refreshPreview();
          });
      });
      input.value = '';
    });
  });

  // selector de color por paleta fija: click en un swatch marca ese color
  // como elegido (hidden input + clase "selected") y refresca la vista previa.
  document.addEventListener('click', function(e){
    const swatch = e.target.closest('.swatch-btn');
    if(!swatch) return;
    const target = swatch.dataset.target;
    const hidden = document.getElementById('hidden-' + target);
    if(!hidden) return;
    hidden.value = swatch.dataset.hex;
    swatch.closest('.swatch-row').querySelectorAll('.swatch-btn').forEach(function(b){ b.classList.toggle('selected', b === swatch); });
    refreshPreview();
  });

  // quitar imágenes ya subidas: click delegado, funciona tanto para las
  // que ya estaban al cargar la página como para las subidas al vuelo.
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.thumb-remove');
    if(!btn) return;
    const target = btn.dataset.target;
    const hidden = document.getElementById('hidden-' + target);
    const preview = document.getElementById('preview-' + target);
    if(btn.classList.contains('single-remove')){
      hidden.value = '';
      preview.innerHTML = '';
      preview.style.display = 'none';
    } else {
      const current = JSON.parse(hidden.value || '[]').filter((u) => u !== btn.dataset.url);
      hidden.value = JSON.stringify(current);
      btn.closest('.thumb').remove();
    }
    refreshPreview();
  });
</script>
</body></html>`);
});

// ---------- CAMBIAR DE DISEÑO (por si compraron uno equivocado) ----------
// Deja elegir cualquier otro diseño del catálogo sin volver a pagar. Al
// cambiar, se conserva todo lo que el comprador ya cargó cuyo campo se
// llama igual en el nuevo esquema (fecha, lugar, mensaje, fotos, etc.) y
// solo se completa con los valores de ejemplo lo que sea específico del
// diseño nuevo — así no se pierde el trabajo ya hecho.
function changeDesignPickerHTML(order, currentDesign) {
  // Categorías de temporada fuera de fecha no se ofrecen como opción para
  // cambiar de diseño, salvo que sea justo la propia categoría del diseño
  // que ya se compró (para no dejar sin alternativas a quien ya eligió
  // ahí).
  const sections = categories
    .filter((cat) => isCategoryInSeason(cat) || cat.id === currentDesign.category)
    .map((cat) => {
      const opciones = designsByCategory(cat.id).filter((d) => d.id !== currentDesign.id);
      if (!opciones.length) return "";
      return `<section style="margin-bottom:34px;">
        <h2 style="font-size:1.05rem;margin-bottom:14px;">${escapeHtml(cat.label)}</h2>
        <div class="grid">
          ${opciones
            .map(
              (d) => `<div class="design-card">
            <div class="swatch" style="background:linear-gradient(135deg, ${d.accent}, ${d.accent2 || d.accent})">
              ${typeof d.cardPreview === "function" ? d.cardPreview(d) : escapeHtml(d.name)}
            </div>
            <div class="body">
              <span class="cat-tag">${escapeHtml(cat.label)}</span>
              <h3>${escapeHtml(d.name)}</h3>
              <p>${escapeHtml(d.summary)}</p>
              <form method="POST" action="/editar/${order.editToken}/cambiar-diseno" style="margin-top:10px;">
                <input type="hidden" name="designId" value="${escapeHtml(d.id)}">
                <button type="submit" class="btn btn-primary" style="width:100%;">Elegir este diseño</button>
              </form>
            </div>
          </div>`
            )
            .join("")}
        </div>
      </section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cambiar diseño · TaDi</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="stylesheet" href="${CSS_HREF}"></head>
<body>
<div style="max-width:1080px;margin:0 auto;padding:30px 20px 60px;">
  <a href="/editar/${order.editToken}" style="color:var(--muted);font-size:.85rem;text-decoration:underline;">← Volver a mi invitación</a>
  <h1 style="margin:14px 0 6px;">Elegí otro diseño</h1>
  <p style="color:var(--muted);max-width:640px;margin:0 0 30px;">
    Ya pagaste tu invitación, así que podés cambiar de diseño las veces que
    quieras sin costo extra hasta que quedes conforme. Diseño actual:
    <strong>${escapeHtml(currentDesign.name)}</strong>. Los datos que ya cargaste
    (fecha, lugar, mensaje, fotos) se mantienen si el nuevo diseño usa el
    mismo campo; el resto queda con los valores de ejemplo para que los
    completes.
  </p>
  ${sections}
</div>
</body></html>`;
}

app.get("/editar/:token/cambiar-diseno", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send(layout({ title: "No encontrado", req, robotsNoindex: true, body: `<div class="status-page"><h1>Link no válido</h1><p>Este link de edición no existe o el pago todavía no fue confirmado.</p></div>` }));
  const currentDesign = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (isEditLocked(inv)) return res.send(lockedPage(order, currentDesign, inv));
  res.send(changeDesignPickerHTML(order, currentDesign));
});

app.post("/editar/:token/cambiar-diseno", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send("Orden no encontrada");
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (isEditLocked(inv)) return res.status(403).send("Invitación bloqueada");

  const newDesign = getDesign(req.body.designId);
  if (!newDesign) return res.status(404).send("Diseño no encontrado");

  if (newDesign.id !== order.designId) {
    // Merge: todo campo del diseño nuevo que ya existía con datos cargados
    // (mismo nombre de campo, p.ej. "fecha", "lugar", "coverImage",
    // "galeria") se conserva; un campo que el diseño nuevo suma y el
    // anterior no tenía arranca en blanco (no con el sampleData de la
    // demo — si no, un cambio de diseño podía colar un nombre/fecha de
    // mentira encima de una invitación real).
    const mergedData = blankInvitationData(newDesign);
    Object.keys(mergedData).forEach((key) => {
      if (inv.data[key] !== undefined && inv.data[key] !== "") {
        mergedData[key] = inv.data[key];
      }
    });
    order.designId = newDesign.id;
    inv.designId = newDesign.id;
    inv.data = mergedData;
    inv.updatedAt = new Date().toISOString();
    saveDB(db);
  }

  res.redirect(`/editar/${order.editToken}?disenoCambiado=1`);
});

app.post("/api/upload/:token", editTokenLimiter, (req, res) => {
  upload.single("imagen")(req, res, async (err) => {
    // Antes, un error acá (ej. "MulterError: File too large") no lo agarraba
    // nadie: Express devolvía una página de error en HTML, el fetch del
    // editor intentaba leerla como JSON, tiraba una excepción sin catch, y
    // el usuario no veía nada — la foto simplemente "no subía", sin aviso.
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE"
        ? "La foto pesa demasiado (máximo 25MB). Probá con una un poco más liviana."
        : "No se pudo subir la foto. Probá de nuevo.";
      return res.status(400).json({ error: msg });
    }
    try {
      const db = getDB();
      const order = db.orders.find((o) => o.editToken === req.params.token);
      const inv = order && db.invitations.find((i) => i.orderId === order.id);
      if (!order || !inv || isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });
      if (!req.file) return res.status(400).json({ error: "No llegó ninguna foto." });

      // Recomprimimos y limitamos el tamaño con sharp: además de mantener
      // el disco liviano, esto convierte a JPEG cualquier formato raro (por
      // ejemplo HEIC, típico de fotos sacadas con iPhone) que muchos
      // navegadores no pueden mostrar directamente.
      const dir = path.dirname(req.file.path);
      const finalName = req.file.filename.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg";
      const finalPath = path.join(dir, finalName);
      // sharp no permite leer y escribir el mismo archivo a la vez (pasa
      // seguido: la foto original ya viene con extensión .jpg), así que
      // siempre procesamos a un archivo temporal aparte y después lo
      // renombramos al nombre final, borrando el original.
      const tmpPath = finalPath + ".tmp";
      await sharp(req.file.path)
        .rotate()
        .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(tmpPath);
      // Ojo con el orden acá: si el archivo original ya se llamaba igual al
      // final (ej. subieron un .jpg), borrar de forma asíncrona podía pisar
      // -en una carrera de milisegundos- al rename recién hecho y dejar la
      // carpeta sin la foto. Por eso todo sincrónico y el borrado del
      // original solo si de verdad quedó un archivo distinto al final.
      fs.renameSync(tmpPath, finalPath);
      if (req.file.path !== finalPath && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      res.json({ url: `/static/uploads/${req.params.token}/${finalName}` });
    } catch (e) {
      console.error("Error procesando imagen subida:", e);
      // Si sharp no pudo decodificar el archivo como imagen (porque no lo
      // es — alguien mandó algo distinto con mimetype falseado), NO puede
      // quedar el archivo original tirado en public/uploads: esa carpeta se
      // sirve tal cual por HTTP, así que un archivo no-imagen ahí sería
      // contenido arbitrario servido desde el dominio real. Se borra todo
      // rastro (el original y cualquier .tmp a medio escribir) antes de
      // responder con el error.
      try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch {}
      try {
        const dir = req.file && path.dirname(req.file.path);
        const finalName = req.file && req.file.filename.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg.tmp";
        const tmpPath = dir && path.join(dir, finalName);
        if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
      res.status(500).json({ error: "No se pudo procesar la foto. Probá con otra." });
    }
  });
});

app.post("/api/upload-video/:token", editTokenLimiter, (req, res) => {
  uploadVideo.single("video")(req, res, (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE"
        ? "El video pesa demasiado (máximo 60MB). Probá con uno un poco más corto o comprimido."
        : "No se pudo subir el video. Probá de nuevo.";
      return res.status(400).json({ error: msg });
    }
    const db = getDB();
    const order = db.orders.find((o) => o.editToken === req.params.token);
    const inv = order && db.invitations.find((i) => i.orderId === order.id);
    if (!order || !inv || isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });
    if (!req.file) return res.status(400).json({ error: "El archivo no es un video válido." });
    res.json({ url: `/static/uploads/${req.params.token}/${req.file.filename}` });
  });
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
  if (inv && inv.purgedAt) return res.status(410).send("Invitación vencida: los datos se eliminaron por vencimiento del plazo de conservación.");
  const draft = previewCache.get(req.params.token);
  const data = normalizeInvitationData(design, { ...inv.data, ...(draft || {}) }, inv.plan);
  let html = design.render({ ...data, __slug: order.publicSlug });
  if (pricing.hasFeature(design.category, inv.plan, "musica")) {
    html = injectBackgroundMusic(html, data.musica);
  }
  if (pricing.hasFeature(design.category, inv.plan, "video")) {
    html = injectVideoCover(html, data.videoPortada);
  }
  res.send(html);
});

// ---------- BLOQUEO POR VENCIMIENTO DEL EVENTO ----------
// Para que una invitación pagada no se reutilice indefinidamente para
// eventos distintos, la edición se bloquea un tiempo después de la fecha
// del evento (dato "fecha" del propio formulario, presente en todos los
// esquemas). Pasado ese margen, quien quiera seguir usando TaDi para un
// evento nuevo tiene que comprar una invitación nueva a precio normal:
// no hay una "reactivación" con precio especial, es directamente otra compra.
const EDIT_GRACE_DAYS = 15;

// Cuántos días después de la fecha del evento se conservan los datos de la
// invitación (fotos y textos cargados) antes de borrarlos definitivamente.
// Ver cleanupOldInvitations() más abajo, que es quien efectivamente los
// borra corriendo una vez por día.
const DATA_RETENTION_DAYS = 60;

function isEditLocked(inv) {
  // Una invitación purgada (ver cleanupOldInvitations) ya perdió su fecha
  // junto con el resto de los datos personales, así que sin este chequeo
  // "sin fecha cargada" se interpretaría como "recién comprada, no
  // bloquear" — exactamente al revés de lo que corresponde. El purgado
  // siempre pasa mucho después de que el bloqueo por vencimiento ya
  // aplicaba (60 días de retención vs. 15 de gracia de edición), así que
  // tratarlo como bloqueado es siempre correcto.
  if (inv?.purgedAt) return true;
  const fecha = inv?.data?.fecha;
  if (!fecha) return false; // sin fecha cargada todavía: no bloqueamos
  const eventDate = new Date(`${fecha}T00:00:00`);
  if (isNaN(eventDate.getTime())) return false;
  const unlockUntil = eventDate.getTime() + EDIT_GRACE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > unlockUntil;
}

function lockedPage(order, design, inv) {
  const publicUrl2 = `/invitacion/${order.publicSlug}`;
  const purged = Boolean(inv?.purgedAt);
  return layout({
    title: "Invitación vencida",
    robotsNoindex: true,
    body: `<div class="status-page">
      <h1>🔒 Esta invitación ya cumplió su ciclo</h1>
      <p>Pasaron más de ${EDIT_GRACE_DAYS} días desde la fecha del evento, así que la edición quedó bloqueada para que cada invitación se use para un solo evento. Más info en las <a href="/preguntas-frecuentes">preguntas frecuentes</a>.</p>
      ${purged
        ? `<p>Además, pasaron más de ${DATA_RETENTION_DAYS} días desde el evento, así que los datos cargados (textos, fotos y confirmaciones) ya se eliminaron de forma permanente y la página pública dejó de estar disponible con ese contenido.</p>`
        : `<p>La página que ya compartiste con tus invitados sigue disponible: <a href="${publicUrl2}" target="_blank">${publicUrl2}</a></p>`}
      <p style="margin-top:24px">¿Tenés un evento nuevo? Podés comprar una invitación nueva (no hay reactivación con precio especial, es una compra normal):</p>
      <p><a class="btn btn-primary" href="/checkout/${design.id}">Comprar invitación nueva</a></p>
    </div>`,
  });
}

// ---------- BORRADO AUTOMÁTICO DE DATOS (60 días después del evento) ----------
// Ver DATA_RETENTION_DAYS arriba y lo que dice /terminos. Por cada
// invitación pagada cuyo evento (dato "fecha" del propio formulario) haya
// pasado hace más de DATA_RETENTION_DAYS, borra las fotos subidas y vacía
// los datos personales cargados (nombres, mensajes, fotos) y las
// confirmaciones de invitados — pero deja intacta la orden (comprador,
// monto, diseño, fechas de compra/pago): esos datos de la compra en sí se
// conservan más tiempo por motivos contables e impositivos, tal como avisa
// /terminos, y son los que usa el panel de admin para las estadísticas.
function cleanupOldInvitations() {
  const db = getDB();
  const now = Date.now();
  let purgedCount = 0;

  db.invitations.forEach((inv) => {
    if (inv.purgedAt) return; // ya se limpió antes
    const fecha = inv.data && inv.data.fecha;
    if (!fecha) return; // sin fecha de evento cargada: no hay forma de saber si venció
    const eventDate = new Date(`${fecha}T00:00:00`);
    if (isNaN(eventDate.getTime())) return;
    const deadline = eventDate.getTime() + DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    if (now <= deadline) return;

    const order = db.orders.find((o) => o.id === inv.orderId);
    if (order && order.editToken) {
      const uploadsDir = path.join(__dirname, "public", "uploads", order.editToken);
      try {
        fs.rmSync(uploadsDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`[cleanup] No se pudieron borrar las fotos de ${order.editToken}:`, err.message);
      }
    }

    db.rsvps = db.rsvps.filter((r) => r.slug !== inv.slug);
    inv.data = {};
    inv.purgedAt = new Date().toISOString();
    purgedCount++;
  });

  if (purgedCount > 0) {
    saveDB(db);
    console.log(`[cleanup] Se eliminaron los datos de ${purgedCount} invitación(es) vencida(s) (más de ${DATA_RETENTION_DAYS} días desde el evento).`);
  }
}

// planId es opcional (algunos llamados, como el preview en vivo, no
// necesitan filtrar) — cuando viene, descarta del guardado cualquier campo
// gateado por feature (musica/mapa/muro/alias/video/multilenguaje) que el
// plan comprado no habilita, así nadie puede pegar un POST directo con un
// campo Plus/Premium aunque haya comprado Básico.
function normalizeInvitationData(design, raw, planId) {
  const allowedNames = planId ? new Set(schemaForPlan(design, planId).map((f) => f.name)) : null;
  const data = {};
  design.schema.forEach((f) => {
    if (allowedNames && !allowedNames.has(f.name)) return;
    if (!(f.name in raw)) return;
    let val = raw[f.name];
    if (f.type === "images" && typeof val === "string") {
      try { val = JSON.parse(val); } catch { val = []; }
    }
    data[f.name] = val;
  });
  return data;
}

// Normaliza los datos del form Y, si el campo aliasPersonalizado vino en el
// guardado, lo resuelve a un slug único (ver resolveUniqueAlias) — se
// centraliza acá porque el guardado normal y el de "finalizar" hacen
// exactamente lo mismo.
function normalizeAndResolveInvitationData(design, raw, inv, db) {
  const data = normalizeInvitationData(design, raw, inv.plan);
  if ("aliasPersonalizado" in data) {
    data.aliasPersonalizado = data.aliasPersonalizado
      ? resolveUniqueAlias(data.aliasPersonalizado, db, inv.slug)
      : "";
  }
  return data;
}

app.post("/api/invitaciones/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });
  inv.data = { ...inv.data, ...normalizeAndResolveInvitationData(design, req.body, inv, db) };
  inv.updatedAt = new Date().toISOString();
  saveDB(db);
  previewCache.delete(req.params.token);
  res.json({ ok: true });
});

// Botón "¡Listo!" del editor: guarda igual que el POST de arriba, y además
// dispara el mail con los links — pero solo la primera vez (sendOrderEmail
// se autoprotege con order.emailSent). Si el comprador ya lo había recibido
// antes, no se reenvía: solo avisamos que es el mismo link de siempre, para
// no generar confusión con "¿me llegó otro mail nuevo?".
app.post("/api/invitaciones/:token/finalizar", async (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (isEditLocked(inv)) return res.status(403).json({ error: "invitación bloqueada" });

  inv.data = { ...inv.data, ...normalizeAndResolveInvitationData(design, req.body, inv, db) };
  inv.updatedAt = new Date().toISOString();
  saveDB(db);
  previewCache.delete(req.params.token);

  // Importante: NO esperamos (await) a que el mail termine de mandarse antes
  // de responder. Antes sí se esperaba, y si el envío por SMTP se colgaba
  // (credenciales con problemas, red lenta, lo que sea — nodemailer puede
  // tardar minutos en fallar sin un timeout), el botón "¡Listo!" se quedaba
  // trabado en "Guardando…" para siempre y el usuario nunca veía ni el
  // guardado confirmado ni el mail. El guardado de arriba ya es instantáneo
  // (no depende de red); el mail se dispara en paralelo, en segundo plano.
  const alreadySent = Boolean(order.emailSent);
  const baseUrl = resolvePublicBaseUrl(req);
  if (!alreadySent) {
    sendOrderEmail(order, baseUrl).catch((err) =>
      console.error("Error enviando mail desde el botón ¡Listo!:", err)
    );
  }
  res.json({ ok: true, mailSent: !alreadySent, mailAlreadySent: alreadySent });
});

// ---------- PÁGINA PÚBLICA FINAL ----------
function purgedPublicPage() {
  return layout({
    title: "Invitación vencida",
    robotsNoindex: true,
    body: `<div class="status-page">
      <h1>🗑️ Esta invitación ya no está disponible</h1>
      <p>Pasaron más de ${DATA_RETENTION_DAYS} días desde la fecha del evento, así que los datos cargados (textos, fotos y confirmaciones) se eliminaron de forma permanente, tal como avisan los <a href="/terminos">Términos y condiciones</a>.</p>
      <p style="margin-top:24px">¿Tenés un evento nuevo? <a class="btn btn-primary" href="/">Ver el catálogo</a></p>
    </div>`,
  });
}

app.get("/invitacion/:slug", (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).send("Invitación no encontrada");
  if (inv.purgedAt) return res.status(410).send(purgedPublicPage());
  res.send(renderPublicInvitation(inv, req));
});

// Link personal de un invitado nombrado (feature "invitadosPersonalizados",
// plan Premium bodas/xv — ver panel del organizador en /editar/:token). Es
// la misma tarjeta pública, pero con el bloque de RSVP personalizado: saludo
// con su nombre y el formulario limitado a su cupo de acompañantes en vez
// del campo libre. Si el token no existe o el plan no tiene el feature,
// cae de vuelta a la tarjeta genérica (no rompe el link).
app.get("/invitacion/:slug/i/:guestToken", (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).send("Invitación no encontrada");
  if (inv.purgedAt) return res.status(410).send(purgedPublicPage());
  const design = getDesign(inv.designId);
  const guest = pricing.hasFeature(design.category, inv.plan, "invitadosPersonalizados")
    ? (inv.invitadosNombrados || []).find((g) => g.token === req.params.guestToken)
    : null;
  res.send(renderPublicInvitation(inv, req, guest || null));
});

app.post("/api/invitacion/:slug/invitado/:guestToken/rsvp", publicWriteLimiter, (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv || inv.purgedAt) return res.status(404).json({ error: "no encontrado" });
  const design = getDesign(inv.designId);
  if (!pricing.hasFeature(design.category, inv.plan, "invitadosPersonalizados")) {
    return res.status(403).json({ error: "no habilitado" });
  }
  const guest = (inv.invitadosNombrados || []).find((g) => g.token === req.params.guestToken);
  if (!guest) return res.status(404).json({ error: "invitado no encontrado" });
  const cupo = Math.max(1, Number(guest.cupo) || 1);
  let cantidad = Math.max(1, Number(req.body.cantidad) || 1);
  if (cantidad > cupo) cantidad = cupo;
  const nombres = Array.isArray(req.body.nombres) ? req.body.nombres.slice(0, cupo).map((n) => String(n || "").slice(0, 120)) : [];
  guest.confirmacion = {
    asiste: req.body.asiste === "no" ? "no" : "si",
    cantidad,
    nombres,
    mensaje: String(req.body.mensaje || "").slice(0, 500),
    cancionSugerida: String(req.body.cancionSugerida || "").slice(0, 200),
    fecha: new Date().toISOString(),
  };
  saveDB(db);
  res.json({ ok: true });
});

app.post("/api/invitacion/:slug/rsvp", publicWriteLimiter, (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  // Ahora que "Confirmar asistencia" guarda directo (ya no manda al
  // visitante a WhatsApp), este guardado pasó a ser la confirmación real
  // que ve el organizador — así que si la misma persona reenvía el form
  // (ej. usa el botón "Actualizar mi confirmación" tras cambiar de opinión)
  // hay que actualizar su fila en vez de acumular una nueva por cada envío.
  const nombreNorm = String(req.body.nombre || "").trim().toLowerCase();
  const existente = nombreNorm
    ? db.rsvps.find((r) => r.slug === req.params.slug && String(r.nombre || "").trim().toLowerCase() === nombreNorm)
    : null;
  if (existente) {
    Object.assign(existente, req.body, { slug: req.params.slug, updatedAt: new Date().toISOString() });
  } else {
    db.rsvps.push({ slug: req.params.slug, ...req.body, createdAt: new Date().toISOString() });
  }
  saveDB(db);
  res.json({ ok: true });
});

// Sube una foto al "muro de invitados" — pública (cualquiera con el link de
// la invitación), igual que el RSVP: el slug es el único "permiso" que
// hace falta, no requiere el editToken del dueño. Solo funciona si el plan
// comprado tiene la feature "muro" y la invitación no está purgada.
app.post("/api/invitacion/:slug/muro", publicWriteLimiter, (req, res) => {
  uploadMuroPhoto.single("foto")(req, res, async (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE"
        ? "La foto pesa demasiado (máximo 25MB). Probá con una un poco más liviana."
        : "No se pudo subir la foto. Probá de nuevo.";
      return res.status(400).json({ error: msg });
    }
    try {
      const db = getDB();
      const inv = db.invitations.find((i) => i.slug === req.params.slug);
      if (!inv || inv.purgedAt) return res.status(404).json({ error: "invitación no encontrada" });
      const design = getDesign(inv.designId);
      if (!pricing.hasFeature(design.category, inv.plan, "muro")) {
        return res.status(403).json({ error: "esta invitación no tiene el muro de fotos habilitado" });
      }
      if (!req.file) return res.status(400).json({ error: "No llegó ninguna foto." });

      const dir = path.dirname(req.file.path);
      const finalName = req.file.filename.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg";
      const finalPath = path.join(dir, finalName);
      const tmpPath = finalPath + ".tmp";
      await sharp(req.file.path)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(tmpPath);
      fs.renameSync(tmpPath, finalPath);
      if (req.file.path !== finalPath && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      const url = `/static/uploads/muro/${req.params.slug}/${finalName}`;
      const photo = { id: uid("foto"), url, uploadedAt: new Date().toISOString() };
      inv.muro = inv.muro || [];
      inv.muro.push(photo);
      saveDB(db);

      res.json({ url });
    } catch (e) {
      console.error("Error procesando foto del muro:", e);
      // Mismo motivo que en /api/upload/:token: nunca dejar el archivo
      // original (no validado como imagen real) en una carpeta que se sirve
      // públicamente por HTTP. Esta ruta encima no requiere ningún login —
      // cualquiera con el link de la invitación puede llegar acá.
      try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch {}
      try {
        const dir = req.file && path.dirname(req.file.path);
        const finalName = req.file && req.file.filename.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg.tmp";
        const tmpPath = dir && path.join(dir, finalName);
        if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
      res.status(500).json({ error: "No se pudo procesar la foto. Probá con otra." });
    }
  });
});

// El dueño de la invitación borra una foto del muro desde el editor
// (moderación básica — por si alguien sube algo que no corresponde).
app.post("/api/invitaciones/:token/muro/eliminar", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  const photoId = req.body.id;
  const photo = (inv.muro || []).find((p) => p.id === photoId);
  if (!photo) return res.status(404).json({ error: "foto no encontrada" });
  inv.muro = inv.muro.filter((p) => p.id !== photoId);
  saveDB(db);
  const filePath = path.join(__dirname, "public", photo.url.replace(/^\/static\//, ""));
  fs.unlink(filePath, () => {});
  res.json({ ok: true });
});

// Destacar/quitar destaque de una foto del muro (para armar un carrusel de
// favoritas en vez de mostrar todas mezcladas sin criterio).
app.post("/api/invitaciones/:token/muro/:id/destacar", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  const photo = (inv.muro || []).find((p) => p.id === req.params.id);
  if (!photo) return res.status(404).json({ error: "foto no encontrada" });
  photo.destacada = !photo.destacada;
  saveDB(db);
  res.json({ ok: true, destacada: photo.destacada });
});

// Redirect de compatibilidad: esto vivía en una página aparte (sin link
// visible desde ningún lado), ahora las confirmaciones están inline en el
// Panel de tu evento (/editar/:token).
app.get("/editar/:token/invitados", (req, res) => {
  res.redirect(`/editar/${req.params.token}`);
});

// Descarga en Excel de la lista de confirmados, con el diseño de marca de
// TaDi (ver excel-export.js) — junta las confirmaciones del link general y
// las de invitados con link personal en una sola planilla. Es de lectura,
// así que se permite incluso con la edición bloqueada (evento ya pasado):
// el organizador puede seguir necesitando bajar la lista después.
app.get("/editar/:token/confirmaciones.xlsx", async (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send("Link no válido.");
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (!design || !inv) return res.status(404).send("Todavía no hay una tarjeta cargada para esta orden.");

  const evento = eventoLabel(design.category, inv.data);
  const eventoTitulo = evento.charAt(0).toUpperCase() + evento.slice(1);

  // El Excel separa por persona: si un invitado con link personal confirmó
  // para varios (ej. "Juan y Rosa" con nombres ["Juan","Rosa"]), cada uno
  // va en su propia fila en vez de venir junto en una sola — así se puede
  // usar la planilla como lista de mesa/ingreso persona por persona. El
  // RSVP del link general sigue siendo una sola fila por respuesta: ahí
  // solo tenemos el nombre de quien completó el form más una cantidad de
  // acompañantes, no el nombre de cada uno.
  const confirmaciones = [];
  allConfirmaciones(db, inv).forEach((c) => {
    if (c.origen === "link personal" && Array.isArray(c.nombres) && c.nombres.length > 1) {
      c.nombres.forEach((nombreIndividual) => confirmaciones.push({ ...c, nombre: nombreIndividual, cantidad: 1 }));
    } else {
      confirmaciones.push(c);
    }
  });

  try {
    const buffer = await buildConfirmacionesWorkbook({ eventoTitulo, confirmaciones });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="confirmaciones-${inv.slug}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error("Error generando el Excel de confirmaciones:", err);
    res.status(500).send("No se pudo generar el Excel. Probá de nuevo en un momento.");
  }
});

// El organizador agrega un invitado nombrado con su cupo de acompañantes
// (feature "invitadosPersonalizados", plan Premium bodas/xv) — genera el
// token del link personal acá mismo.
app.post("/editar/:token/invitados-personalizados", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  if (!pricing.hasFeature(design.category, inv.plan, "invitadosPersonalizados")) {
    return res.status(403).json({ error: "esta invitación no tiene invitados personalizados habilitado" });
  }
  const nombre = String(req.body.nombre || "").trim().slice(0, 80);
  if (!nombre) return res.status(400).json({ error: "falta el nombre" });
  const cupo = Math.min(20, Math.max(1, Number(req.body.cupo) || 1));
  const guest = { id: uid("guest"), nombre, cupo, token: uid("gt"), confirmacion: null };
  inv.invitadosNombrados = inv.invitadosNombrados || [];
  inv.invitadosNombrados.push(guest);
  saveDB(db);
  res.json({ ok: true, guest });
});

app.post("/editar/:token/invitados-personalizados/:id/eliminar", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).json({ error: "no encontrado" });
  const inv = db.invitations.find((i) => i.orderId === order.id);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  inv.invitadosNombrados = (inv.invitadosNombrados || []).filter((g) => g.id !== req.params.id);
  saveDB(db);
  res.json({ ok: true });
});

// ---------- ADMIN (worklist de tarjetas/cobros + estadísticas) ----------
// Basic Auth con usuario/contraseña por variable de entorno. Si no están
// cargadas, el panel queda BLOQUEADO por completo (nunca abierto por
// accidente) y avisa con un 503 qué falta configurar en Render.
function timingSafeStringEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return require("crypto").timingSafeEqual(bufA, bufB);
}

function requireAdminAuth(req, res, next) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) {
    return res.status(503).send("Panel de administrador no configurado: faltan las variables de entorno ADMIN_USER y ADMIN_PASS en el servidor.");
  }
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try { decoded = Buffer.from(encoded, "base64").toString("utf-8"); } catch {}
    const sep = decoded.indexOf(":");
    const u = sep === -1 ? decoded : decoded.slice(0, sep);
    const p = sep === -1 ? "" : decoded.slice(sep + 1);
    if (timingSafeStringEqual(u, user) && timingSafeStringEqual(p, pass)) return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="TaDi Admin"');
  return res.status(401).send("Autenticación requerida.");
}

// Une las confirmaciones del RSVP genérico (db.rsvps) con las de los
// invitados nombrados con link personal (inv.invitadosNombrados[].confirmacion)
// para que el panel del organizador (y el de administrador) cuenten y
// listen TODAS las confirmaciones de una invitación, sin importar por cuál
// de los dos caminos llegaron — "nombres" (array, solo en las de link
// personal) queda disponible además de "nombre" (ya unido con ", ") para
// poder separar por persona en el Excel sin tener que reparsear el string.
function allConfirmaciones(db, inv) {
  if (!inv) return [];
  const genericas = db.rsvps
    .filter((r) => r.slug === inv.slug)
    .map((r) => ({ nombre: r.nombre || "—", asiste: r.asiste, cantidad: r.acompaniantes, menu: r.menu, mensaje: r.mensaje, cancion: r.cancionSugerida, origen: "link general", fecha: r.updatedAt || r.createdAt }));
  const nombradas = (inv.invitadosNombrados || [])
    .filter((g) => g.confirmacion)
    .map((g) => {
      const nombresIndividuales = (g.confirmacion.nombres || []).filter(Boolean);
      return { nombre: nombresIndividuales.join(", ") || g.nombre, nombres: nombresIndividuales, asiste: g.confirmacion.asiste, cantidad: g.confirmacion.cantidad, mensaje: g.confirmacion.mensaje, cancion: g.confirmacion.cancionSugerida, origen: "link personal", fecha: g.confirmacion.fecha };
    });
  return genericas.concat(nombradas);
}

function adminLayout({ title, body }) {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Admin TaDi</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="stylesheet" href="${CSS_HREF}">
<style>
  body{background:var(--bg);}
  .admin-wrap{max-width:1180px;margin:0 auto;padding:28px 20px 60px;}
  .admin-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:22px;}
  .admin-top h1{margin:0;font-size:1.4rem;}
  .admin-top a.brand-link{color:var(--muted);text-decoration:none;font-size:.85rem;}
  .admin-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:26px;}
  .admin-stat{background:var(--bg);box-shadow:var(--nu-xs, 6px 6px 12px var(--sh-dark,#0002),-6px -6px 12px var(--sh-light,#fff));border-radius:14px;padding:16px 18px;}
  .admin-stat .num{font-size:1.5rem;font-weight:700;color:var(--ink);display:block;}
  .admin-stat .label{font-size:.76rem;color:var(--muted);}
  .admin-filters{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
  .admin-filters a{padding:7px 14px;border-radius:20px;font-size:.8rem;text-decoration:none;color:var(--ink);background:var(--bg);box-shadow:var(--nu-inset-sm, inset 2px 2px 5px #0002, inset -2px -2px 5px #fff2);}
  .admin-filters a.active{background:var(--accent);color:#fff;box-shadow:none;}
  .admin-table-wrap{overflow-x:auto;border-radius:14px;background:var(--bg);box-shadow:var(--nu-xs, 6px 6px 12px #0002,-6px -6px 12px #fff2);}
  table.admin-table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:920px;}
  table.admin-table th{text-align:left;padding:12px 14px;color:var(--muted);font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--line,#0002);}
  table.admin-table td{padding:12px 14px;border-bottom:1px solid var(--line,#0001);vertical-align:top;}
  table.admin-table tr:last-child td{border-bottom:none;}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;}
  .badge-paid{background:#1f9d55;color:#fff;}
  .badge-pending{background:#c99a2e;color:#fff;}
  .admin-actions{display:flex;flex-direction:column;gap:6px;}
  .admin-actions form{margin:0;}
  .admin-actions button, .admin-actions a{display:block;width:100%;box-sizing:border-box;text-align:center;padding:6px 10px;border-radius:8px;border:none;font-size:.74rem;cursor:pointer;text-decoration:none;}
  .admin-actions .a-view{background:#6b5bd6;color:#fff;}
  .admin-actions .a-edit{background:var(--accent);color:#fff;}
  .admin-actions .a-pay{background:#1f9d55;color:#fff;}
  .admin-actions .a-resend{background:#3a6ea5;color:#fff;}
  .admin-empty{padding:40px;text-align:center;color:var(--muted);}
  .admin-panels{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:26px;}
  .admin-panel{background:var(--bg);box-shadow:var(--nu-xs, 6px 6px 12px #0002,-6px -6px 12px #fff2);border-radius:14px;padding:18px 20px;}
  .admin-panel h3{margin:0 0 12px;font-size:.86rem;}
  .admin-mini-row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line,#0001);font-size:.82rem;}
  .admin-mini-row:last-child{border-bottom:none;}
  .admin-mini-row .n{color:var(--muted);}
  .admin-mini-empty{color:var(--muted);font-size:.82rem;}
  .admin-detail-meta{display:flex;flex-wrap:wrap;gap:14px 26px;font-size:.85rem;background:var(--bg);box-shadow:var(--nu-inset-sm, inset 2px 2px 5px #0002, inset -2px -2px 5px #fff2);border-radius:12px;padding:14px 18px;margin-bottom:8px;}
  .admin-detail-grid{display:flex;flex-direction:column;gap:2px;border-radius:14px;overflow:hidden;background:var(--bg);box-shadow:var(--nu-xs, 6px 6px 12px #0002,-6px -6px 12px #fff2);}
  .admin-detail-row{display:grid;grid-template-columns:220px 1fr;gap:16px;padding:12px 18px;border-bottom:1px solid var(--line,#0001);font-size:.85rem;}
  .admin-detail-row:last-child{border-bottom:none;}
  .admin-detail-label{color:var(--muted);font-weight:600;}
  .admin-detail-value{word-break:break-word;}
  .admin-empty-val{color:var(--muted);}
  .admin-thumbs{display:flex;flex-wrap:wrap;gap:8px;}
  .admin-thumbs img{width:70px;height:70px;object-fit:cover;border-radius:8px;}
  .admin-thumb-single{max-width:160px;max-height:160px;border-radius:10px;display:block;}
  .admin-color-chip{display:inline-block;width:16px;height:16px;border-radius:4px;vertical-align:middle;margin-right:6px;box-shadow:0 0 0 1px #0002;}
</style>
</head><body>
<div class="admin-wrap">${body}</div>
</body></html>`;
}

const MESES_ES_ADMIN = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Muestra el valor cargado de un campo del esquema del diseño en modo
// solo-lectura, para el detalle de la orden en el admin (fotos como
// miniaturas, color como chip, etc.) — es la contraparte de fieldHTML()
// pero sin inputs, porque acá no se edita nada.
function adminFieldValueHTML(f, value) {
  if (f.type === "images") {
    const arr = Array.isArray(value) ? value : [];
    if (!arr.length) return `<span class="admin-empty-val">— sin fotos —</span>`;
    return `<div class="admin-thumbs">${arr.map((s) => `<a href="${escapeHtml(s)}" target="_blank"><img src="${escapeHtml(s)}" alt=""></a>`).join("")}</div>`;
  }
  if (f.type === "image") {
    if (!value) return `<span class="admin-empty-val">— sin foto —</span>`;
    return `<a href="${escapeHtml(value)}" target="_blank"><img class="admin-thumb-single" src="${escapeHtml(value)}" alt=""></a>`;
  }
  if (f.type === "color") {
    if (!value) return `<span class="admin-empty-val">—</span>`;
    return `<span class="admin-color-chip" style="background:${escapeHtml(value)}"></span>${escapeHtml(value)}`;
  }
  if (f.type === "textarea") {
    if (!value) return `<span class="admin-empty-val">—</span>`;
    return `<span style="white-space:pre-wrap;">${escapeHtml(value)}</span>`;
  }
  if (f.type === "url") {
    if (!value) return `<span class="admin-empty-val">—</span>`;
    return `<a href="${escapeHtml(value)}" target="_blank">${escapeHtml(value)}</a>`;
  }
  return value ? escapeHtml(value) : `<span class="admin-empty-val">—</span>`;
}

app.get("/admin", requireAdminAuth, (req, res) => {
  const db = getDB();
  const estado = ["paid", "pending"].includes(req.query.estado) ? req.query.estado : "all";

  const paidOrders = db.orders.filter((o) => o.status === "paid");
  const pendingOrders = db.orders.filter((o) => o.status === "pending");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const byCategory = {};
  paidOrders.forEach((o) => {
    const d = getDesign(o.designId);
    const cat = d ? d.category : "otros";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });
  const byCategoryLabel = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${(categories.find((c) => c.id === cat) || {}).label || cat}: ${count}`)
    .join(" · ") || "—";

  // Suma confirmaciones del RSVP genérico + las de invitados con link
  // personal (ver allConfirmaciones), para que el total no se quede corto
  // en invitaciones Premium que usan invitados nombrados.
  const totalRsvps = db.orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + allConfirmaciones(db, db.invitations.find((i) => i.orderId === o.id)).length, 0);

  // Resumen mensual: tarjetas vendidas y facturación por mes (según fecha
  // de pago), más recientes primero.
  const monthly = {};
  paidOrders.forEach((o) => {
    const d = new Date(o.paidAt || o.createdAt);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) monthly[key] = { count: 0, revenue: 0, y: d.getFullYear(), m: d.getMonth() };
    monthly[key].count++;
    monthly[key].revenue += Number(o.amount) || 0;
  });
  const monthlyRows = Object.entries(monthly)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([key, v]) => `<div class="admin-mini-row"><span>${MESES_ES_ADMIN[v.m]} ${v.y}</span><span class="n">${v.count} tarjeta${v.count === 1 ? "" : "s"} · ${money(v.revenue)}</span></div>`)
    .join("") || `<p class="admin-mini-empty">Todavía no hay ventas.</p>`;

  // Diseños más elegidos (sobre tarjetas pagadas).
  const designCounts = {};
  paidOrders.forEach((o) => { designCounts[o.designId] = (designCounts[o.designId] || 0) + 1; });
  const topDesignsRows = Object.entries(designCounts)
    .map(([designId, count]) => ({ design: getDesign(designId), count }))
    .filter((r) => r.design)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((r) => `<div class="admin-mini-row"><span>${escapeHtml(r.design.name)}</span><span class="n">${r.count}</span></div>`)
    .join("") || `<p class="admin-mini-empty">Todavía no hay ventas.</p>`;

  const visibleOrders = (estado === "all" ? db.orders : db.orders.filter((o) => o.status === estado))
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const rows = visibleOrders.map((order) => {
    const design = getDesign(order.designId);
    const inv = db.invitations.find((i) => i.orderId === order.id);
    const catLabel = design ? (categories.find((c) => c.id === design.category) || {}).label || design.category : "—";
    const evento = design && inv ? eventoLabel(design.category, inv.data) : "—";
    const fechaEvento = inv && inv.data && inv.data.fecha ? formatFechaCorta(inv.data.fecha) : "";
    const rsvps = allConfirmaciones(db, inv);
    const rsvpSi = rsvps.filter((r) => r.asiste !== "no").length;
    const fechaCompra = order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-AR") : "—";

    const acciones = [];
    if (order.status === "paid" && order.editToken) {
      acciones.push(`<a class="a-view" href="/admin/orders/${order.id}">🔍 Ver datos</a>`);
      acciones.push(`<a class="a-edit" href="/editar/${order.editToken}" target="_blank">✏️ Editar</a>`);
      acciones.push(`<form method="POST" action="/admin/orders/${order.id}/reenviar-mail" onsubmit="return confirm('¿Reenviar el mail con los links de esta invitación?');"><button class="a-resend" type="submit">✉️ Reenviar mail</button></form>`);
    }
    if (order.status === "pending") {
      acciones.push(`<form method="POST" action="/admin/orders/${order.id}/marcar-pagada" onsubmit="return confirm('¿Marcar esta orden como pagada manualmente?');"><button class="a-pay" type="submit">✅ Marcar pagada</button></form>`);
    }

    return `<tr>
      <td>${fechaCompra}</td>
      <td>${escapeHtml(order.buyerEmail || "—")}</td>
      <td>${escapeHtml(design ? design.name : order.designId)}<br><span style="color:var(--muted);font-size:.72rem;">${escapeHtml(catLabel)}</span></td>
      <td>${escapeHtml(evento)}${fechaEvento ? `<br><span style="color:var(--muted);font-size:.72rem;">${escapeHtml(fechaEvento)}</span>` : ""}</td>
      <td>${money(order.amount)}${order.plan ? `<br><span style="color:var(--muted);font-size:.72rem;">${escapeHtml((pricing.getPlan(design ? design.category : "", order.plan) || {}).label || order.plan)}</span>` : ""}</td>
      <td><span class="badge ${order.status === "paid" ? "badge-paid" : "badge-pending"}">${order.status === "paid" ? "Pagada" : "Pendiente"}</span>${order.emailSent ? "<br><span style=\"font-size:.68rem;color:var(--muted);\">mail enviado</span>" : ""}</td>
      <td>${rsvps.length ? `${rsvpSi} sí / ${rsvps.length} total` : "—"}</td>
      <td class="admin-actions">${acciones.join("") || "—"}</td>
    </tr>`;
  }).join("");

  res.send(adminLayout({
    title: "Panel de administrador",
    body: `
      <div class="admin-top">
        <h1>📋 Panel de administrador</h1>
        <a class="brand-link" href="/">← Volver al sitio</a>
      </div>
      <div class="admin-stats">
        <div class="admin-stat"><span class="num">${money(totalRevenue)}</span><span class="label">Facturado (pagadas)</span></div>
        <div class="admin-stat"><span class="num">${paidOrders.length}</span><span class="label">Tarjetas pagadas</span></div>
        <div class="admin-stat"><span class="num">${pendingOrders.length}</span><span class="label">Pagos pendientes</span></div>
        <div class="admin-stat"><span class="num">${totalRsvps}</span><span class="label">Confirmaciones RSVP</span></div>
      </div>
      <p style="color:var(--muted);font-size:.8rem;margin:-14px 0 20px;">Por categoría: ${byCategoryLabel}</p>
      <div class="admin-panels">
        <div class="admin-panel"><h3>📅 Resumen mensual</h3>${monthlyRows}</div>
        <div class="admin-panel"><h3>🏆 Diseños más elegidos</h3>${topDesignsRows}</div>
      </div>
      <div class="admin-filters">
        <a href="/admin" class="${estado === "all" ? "active" : ""}">Todas (${db.orders.length})</a>
        <a href="/admin?estado=paid" class="${estado === "paid" ? "active" : ""}">Pagadas (${paidOrders.length})</a>
        <a href="/admin?estado=pending" class="${estado === "pending" ? "active" : ""}">Pendientes (${pendingOrders.length})</a>
      </div>
      <div class="admin-table-wrap">
        ${visibleOrders.length ? `<table class="admin-table">
          <thead><tr><th>Fecha compra</th><th>Comprador</th><th>Diseño</th><th>Evento</th><th>Monto</th><th>Estado</th><th>RSVP</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : `<div class="admin-empty">No hay órdenes${estado !== "all" ? " con ese estado" : ""} todavía.</div>`}
      </div>
    `,
  }));
});

// Detalle de una orden puntual: todos los datos cargados en la tarjeta
// (para revisar rápido si hay que arreglar algo que pidió el comprador,
// sin tener que abrir el editor completo solo para mirar) + confirmaciones.
app.get("/admin/orders/:id", requireAdminAuth, (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).send(adminLayout({ title: "No encontrado", body: `<p>Orden no encontrada. <a href="/admin">← Volver</a></p>` }));

  const design = getDesign(order.designId);
  const inv = db.invitations.find((i) => i.orderId === order.id);
  const rsvps = allConfirmaciones(db, inv);
  const catLabel = design ? (categories.find((c) => c.id === design.category) || {}).label || design.category : "—";

  const fieldsHTML = design && inv
    ? design.schema.filter((f) => f.type !== "palette").map((f) => `
        <div class="admin-detail-row">
          <div class="admin-detail-label">${escapeHtml(f.label)}</div>
          <div class="admin-detail-value">${adminFieldValueHTML(f, inv.data[f.name])}</div>
        </div>`).join("")
    : `<div class="admin-detail-row"><div class="admin-detail-value">Esta orden todavía no tiene una tarjeta cargada (el pago sigue pendiente).</div></div>`;

  // Incluye tanto las confirmaciones del RSVP genérico como las de
  // invitados con link personal (ver allConfirmaciones) — cada una marcada
  // con su origen para que se entienda de dónde salió.
  const rsvpsHTML = rsvps.length
    ? rsvps.map((r) => `
        <div class="admin-detail-row">
          <div class="admin-detail-label">${escapeHtml(r.nombre || "—")} <span style="color:var(--muted);font-weight:400;font-size:.72rem;">(${escapeHtml(r.origen)})</span></div>
          <div class="admin-detail-value">${r.asiste === "no" ? "❌ No asiste" : "✅ Asiste"}${r.cantidad ? ` · ${escapeHtml(String(r.cantidad))} persona(s)` : ""}${r.menu ? ` · menú: ${escapeHtml(r.menu)}` : ""}${r.mensaje ? `<br><em>"${escapeHtml(r.mensaje)}"</em>` : ""}</div>
        </div>`).join("")
    : "";

  res.send(adminLayout({
    title: design ? design.name : "Detalle de orden",
    body: `
      <div class="admin-top">
        <h1>🔍 ${escapeHtml(design ? design.name : order.designId)}</h1>
        <a class="brand-link" href="/admin">← Volver al panel</a>
      </div>
      <div class="admin-detail-meta">
        <span><strong>Comprador:</strong> ${escapeHtml(order.buyerEmail || "—")}</span>
        <span><strong>Categoría:</strong> ${escapeHtml(catLabel)}</span>
        <span><strong>Monto:</strong> ${money(order.amount)}</span>
        <span><strong>Estado:</strong> ${order.status === "paid" ? "Pagada" : "Pendiente"}</span>
        <span><strong>Comprada:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString("es-AR") : "—"}</span>
        ${order.status === "paid" ? `<span><strong>Editor:</strong> <a href="/editar/${order.editToken}" target="_blank">abrir para modificar →</a></span>` : ""}
      </div>
      <h2 style="margin-top:26px;font-size:1rem;">Datos cargados en la tarjeta</h2>
      <div class="admin-detail-grid">${fieldsHTML}</div>
      ${inv ? `<h2 style="margin-top:26px;font-size:1rem;">Confirmaciones (${rsvps.length})</h2>
        ${rsvps.length ? `<div class="admin-detail-grid">${rsvpsHTML}</div>` : `<p class="admin-mini-empty">Todavía no hay confirmaciones.</p>`}` : ""}
    `,
  }));
});

app.post("/admin/orders/:id/marcar-pagada", requireAdminAuth, async (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).send("Orden no encontrada");
  const paid = markOrderPaid(order);
  sendOrderEmail(paid, resolvePublicBaseUrl(req)).catch((err) =>
    console.error("Error enviando mail al marcar pagada desde admin:", err)
  );
  res.redirect("/admin");
});

app.post("/admin/orders/:id/reenviar-mail", requireAdminAuth, async (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order || order.status !== "paid") return res.status(404).send("Orden no encontrada");
  // Fuerza el reenvío pisando el flag que evita mandarlo dos veces solo:
  // acá es un pedido explícito del admin, no un guardado automático.
  order.emailSent = false;
  saveDB(db);
  sendOrderEmail(order, resolvePublicBaseUrl(req)).catch((err) =>
    console.error("Error reenviando mail desde admin:", err)
  );
  res.redirect("/admin");
});

// ---------- ALIAS PERSONALIZADO — catch-all ----------
// Registrada última a propósito: solo se activa cuando ninguna ruta de
// arriba matcheó, así un alias nunca puede pisar /categoria, /checkout,
// /admin, etc. (ver RESERVED_SLUGS, que además bloquea que alguien elija
// esos nombres como alias al guardar la invitación).
app.get("/:alias", (req, res, next) => {
  const alias = req.params.alias;
  if (RESERVED_SLUGS.has(alias)) return next();
  const db = getDB();
  const inv = db.invitations.find((i) => i.data && i.data.aliasPersonalizado === alias);
  if (!inv) return next();
  const design = getDesign(inv.designId);
  if (!pricing.hasFeature(design.category, inv.plan, "alias")) return next();
  if (inv.purgedAt) return res.status(410).send(purgedPublicPage());
  res.send(renderPublicInvitation(inv, req));
});

// Corre una vez al arrancar (por si el server estuvo apagado varios días y
// se acumularon vencimientos) y después cada 24hs.
cleanupOldInvitations();
setInterval(cleanupOldInvitations, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`TaDi corriendo en http://localhost:${PORT}`);
  console.log(mp.isConfigured() ? "Mercado Pago: modo real (credenciales cargadas)" : "Mercado Pago: modo demo (sin credenciales, pago simulado)");
});
