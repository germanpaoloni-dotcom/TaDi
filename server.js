// IMPORTANTE — antes que cualquier otro require: en Render (y hostings
// parecidos), Node 18+ puede resolver smtp.gmail.com priorizando su
// dirección IPv6 aunque el hosting no tenga salida IPv6 real, y la conexión
// muere con ENETUNREACH. Pasarle family:4 a nodemailer no alcanza — el
// cambio real de comportamiento está en el orden de resolución DNS de Node
// mismo. Esto lo fuerza a nivel de todo el proceso, así CUALQUIER conexión
// saliente (mail, Mercado Pago, lo que sea) prefiere IPv4 cuando existe.
require("dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { getDB, saveDB, uid } = require("./db");
const { categories, designs, getDesign, designsByCategory, isCategoryInSeason, visibleCategories } = require("./designs");
const mp = require("./mercadopago");
const mailer = require("./mailer");
const { eventoLabel, formatFechaCorta } = require("./designs/widgets");
const pricing = require("./designs/pricing");
const music = require("./designs/music");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

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
      const dir = path.join(__dirname, "public", "uploads", "muro", req.params.slug || "tmp");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg"),
  }),
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
      const dir = path.join(__dirname, "public", "uploads", req.params.token || "tmp");
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

function injectOgTags(html, { baseUrl, url, image, description }) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "TaDi — Invitación digital";
  const desc = description || "Mirá la invitación y confirmá tu asistencia.";
  const img = absoluteUrl(baseUrl, image);
  const tags = `
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
        btn.addEventListener('click', function(){
          if (!playing) {
            audio.volume = 0.55;
            audio.play().catch(function(){});
            label.textContent = 'Pausar';
            btn.classList.add('playing');
            playing = true;
          } else {
            audio.pause();
            label.textContent = 'Música';
            btn.classList.remove('playing');
            playing = false;
          }
        });
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

// Inserta el botón flotante "📷 Muro" (feature "muro", plan Plus+): un panel
// con las fotos que ya subieron los invitados + un input para sumar una
// nueva foto directo desde el link de la invitación (sin login, el slug
// público es el mismo "permiso" que ya usa el RSVP). Sube por fetch y la
// agrega al grid al toque, sin recargar la página.
function injectPhotoWall(html, { slug, photos }) {
  const grid = (photos || []).map((p) => `<div class="tadi-wall-thumb"><img src="${escapeHtml(p.url)}" loading="lazy"></div>`).join("");
  const widget = `
    <button type="button" id="tadi-wall-toggle" class="tadi-wall-toggle" aria-label="Ver muro de fotos de invitados">📷 Fotos</button>
    <div id="tadi-wall-panel" class="tadi-wall-panel" hidden>
      <div class="tadi-wall-panel-inner">
        <button type="button" id="tadi-wall-close" class="tadi-wall-close" aria-label="Cerrar muro de fotos">✕</button>
        <h3 class="tadi-wall-title">Fotos de la fiesta</h3>
        <p class="tadi-wall-sub">Subí las tuyas para que queden todas juntas.</p>
        <label class="tadi-wall-upload-btn">
          📤 Subir una foto
          <input type="file" accept="image/*" id="tadi-wall-input" hidden>
        </label>
        <p class="tadi-wall-status" id="tadi-wall-status"></p>
        <div class="tadi-wall-grid" id="tadi-wall-grid">${grid}</div>
      </div>
    </div>
    <style>
      .tadi-wall-toggle{position:fixed;left:18px;bottom:74px;z-index:60;background:#eaeef2;color:#33363f;border:0;border-radius:30px;padding:11px 18px;font-size:.8rem;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .tadi-wall-panel{position:fixed;inset:0;z-index:70;background:rgba(51,54,63,.55);display:flex;align-items:center;justify-content:center;padding:20px;}
      .tadi-wall-panel[hidden]{display:none;}
      .tadi-wall-panel-inner{position:relative;background:#eaeef2;border-radius:20px;box-shadow:14px 14px 30px #c5cbd6,-14px -14px 30px #ffffff;width:100%;max-width:640px;max-height:80vh;overflow-y:auto;padding:26px 22px;font-family:'Helvetica Neue',Arial,sans-serif;box-sizing:border-box;}
      .tadi-wall-close{position:absolute;top:10px;right:10px;background:#eaeef2;color:#33363f;border:0;width:34px;height:34px;border-radius:50%;font-size:1rem;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;cursor:pointer;}
      .tadi-wall-title{margin:0 0 4px;font-size:1.1rem;color:#33363f;}
      .tadi-wall-sub{margin:0 0 16px;font-size:.82rem;color:#6d7280;}
      .tadi-wall-upload-btn{display:inline-flex;align-items:center;gap:8px;background:#ff7a3d;color:#fff;font-weight:700;font-size:.85rem;padding:12px 18px;border-radius:14px;cursor:pointer;box-shadow:5px 5px 12px #c5cbd6,-5px -5px 12px #ffffff;}
      .tadi-wall-status{font-size:.78rem;color:#6d7280;margin:10px 0 0;min-height:1.1em;}
      .tadi-wall-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:16px;}
      .tadi-wall-thumb{aspect-ratio:1;border-radius:10px;overflow:hidden;background:#dfe3e8;}
      .tadi-wall-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
    </style>
    <script>
      (function(){
        var btn = document.getElementById('tadi-wall-toggle');
        var panel = document.getElementById('tadi-wall-panel');
        var closeBtn = document.getElementById('tadi-wall-close');
        var input = document.getElementById('tadi-wall-input');
        var grid = document.getElementById('tadi-wall-grid');
        var status = document.getElementById('tadi-wall-status');
        if(!btn || !panel) return;
        btn.addEventListener('click', function(){ panel.hidden = false; });
        closeBtn.addEventListener('click', function(){ panel.hidden = true; });
        panel.addEventListener('click', function(e){ if (e.target === panel) panel.hidden = true; });
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
    html = injectPhotoWall(html, { slug: inv.slug, photos: inv.muro || [] });
  }
  if (pricing.hasFeature(design.category, inv.plan, "video")) {
    html = injectVideoCover(html, inv.data.videoPortada);
  }
  if (pricing.hasFeature(design.category, inv.plan, "multilenguaje") && inv.data.multilenguaje) {
    html = injectLanguageToggle(html);
  }
  html = injectOgTags(html, {
    baseUrl,
    url: `${baseUrl}/invitacion/${inv.slug}`,
    image: inv.data.coverImage,
    description: "Mirá la invitación y confirmá tu asistencia.",
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
  "contacto", "ayuda", "app",
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

// Script de Google Analytics 4 — vacío (no inserta nada) si no hay
// GA_MEASUREMENT_ID cargado en el entorno.
const GA_SNIPPET = GA_MEASUREMENT_ID
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');</script>`
  : "";

function layout({ title, body, description }) {
  const desc = description || "Invitaciones digitales para bodas, cumpleaños, XV y más — elegí tu diseño, personalizalo en minutos y compartilo por WhatsApp con RSVP incluido.";
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · TaDi</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="icon" type="image/png" sizes="32x32" href="/static/img/logo/tadi-favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/static/img/logo/tadi-favicon-16.png">
<link rel="apple-touch-icon" href="/static/img/logo/tadi-favicon-180.png">
<link rel="stylesheet" href="${CSS_HREF}">
${GA_SNIPPET}
</head><body>
<header class="site">
  <a class="brand" href="/" aria-label="TaDi — inicio"><img src="/static/img/logo/tadi-logo-light-bg.svg" alt="TaDi" class="brand-logo"><span class="brand-tagline">Tarjetas Digitales</span></a>
  <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav id="siteNav">
    <a href="/">Catálogo</a>
    ${visibleCategories().map((c) => `<a href="/categoria/${c.id}">${c.label}</a>`).join("")}
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
  return `<div class="mega-hero-slide${index === 0 ? " active" : ""}" data-cat="${cat.id}">
    <div class="mega-hero-grid">
      <div class="mega-hero-text">
        <span class="mega-hero-kicker">Invitaciones digitales</span>
        <h1 class="mega-hero-title">${cat.label.replace(/ /g, "<br>")}<span class="dot">.</span></h1>
        ${isCarousel ? `<a class="btn btn-primary mega-hero-cta" href="/categoria/${cat.id}">Elegí tu diseño</a>` : ""}
        <a class="mega-hero-skip" href="#catalogo">Ver diseños y precios ↓</a>
      </div>
      <div class="mega-hero-visual">
        <div class="mega-hero-ghost">${cat.ghost}</div>
        <div class="mega-hero-ring"></div>
        <img src="${cat.heroImage}" alt="${cat.label}">
        <div class="mega-hero-info mega-hero-info-left">
          <div class="mega-hero-block">
            <h3>${cat.kicker}</h3>
            <p>${cat.heroBody}</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
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
// grilla de tarjetas de una categoría (se reutiliza en /categoria/:id y
// dentro del modal de categoría del home interactivo).
function categoryGridHTML(cat) {
  const list2 = designsByCategory(cat.id);
  if (list2.length === 0) {
    return `<div class="grid"><div class="coming-soon" style="grid-column:1/-1;min-height:140px">
      <strong>Muy pronto</strong>
      <span>Estamos preparando los primeros diseños de ${cat.label.toLowerCase()}.</span>
    </div></div>`;
  }
  return `<div class="grid">
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

// ---------- HOME interactivo: 6 categorías lado a lado, hover con
// ampliación + halo contenido, click abre modal con personaje + catálogo
// (no navega a otra página) ----------
function oriosPanelHTML(cat) {
  return `<button type="button" class="orios-panel orios-panel-${cat.id}" data-cat="${cat.id}" aria-label="Ver catálogo de ${cat.label}">
    <span class="orios-panel-photo">
      <img src="${cat.heroImage}" alt="${cat.label}" loading="eager" fetchpriority="high">
    </span>
    <span class="orios-panel-label">${cat.label}<span class="dot">.</span></span>
    <span class="orios-panel-hint">Ver diseños →</span>
  </button>`;
}

function oriosHomeHTML(cats) {
  return `<section class="orios-home">
    ${cats.map(oriosPanelHTML).join("")}
  </section>`;
}

function categoryModalPanelHTML(cat) {
  return `<div class="cat-modal-panel" id="modal-panel-${cat.id}">
    <div class="cat-modal-catalog">
      <span class="cat-modal-kicker">${cat.label}</span>
      <h2 class="cat-modal-title">${cat.label}<span class="dot">.</span></h2>
      <p class="cat-modal-desc">${cat.description}</p>
      ${categoryGridHTML(cat)}
      <a class="cat-modal-full-link" href="/categoria/${cat.id}">Ver la página completa de ${cat.label.toLowerCase()} →</a>
    </div>
    <div class="cat-modal-visual">
      <div class="mega-hero-ring"></div>
      <img src="${cat.heroImage}" alt="${cat.label}">
      <div class="mega-hero-info mega-hero-info-left">
        <div class="mega-hero-block">
          <h3>${cat.kicker}</h3>
          <p>${cat.heroBody}</p>
        </div>
      </div>
    </div>
  </div>`;
}

function categoryModalsHTML(cats) {
  return `<div class="cat-modal-overlay" id="catModalOverlay">
    <div class="cat-modal" id="catModal">
      <button type="button" class="cat-modal-close" id="catModalClose" aria-label="Cerrar">&times;</button>
      ${cats.map(categoryModalPanelHTML).join("")}
    </div>
  </div>
  <script>
    (function(){
      var overlay = document.getElementById('catModalOverlay');
      var closeBtn = document.getElementById('catModalClose');
      var panels = document.querySelectorAll('.orios-panel');
      function open(id){
        document.querySelectorAll('.cat-modal-panel').forEach(function(p){ p.classList.toggle('active', p.id === 'modal-panel-' + id); });
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Reseteamos el scroll: como los paneles quedan en el DOM y solo se
        // ocultan con display:none, si el usuario los había scrolleado antes
        // (por ejemplo viendo más diseños del catálogo), al reabrir el modal
        // aparecía scrolleado y la foto de arriba quedaba tapada/cortada.
        var activePanel = document.getElementById('modal-panel-' + id);
        if (activePanel) activePanel.scrollTop = 0;
        var catalogEl = activePanel ? activePanel.querySelector('.cat-modal-catalog') : null;
        if (catalogEl) catalogEl.scrollTop = 0;
        var modalEl = document.getElementById('catModal');
        if (modalEl) modalEl.scrollTop = 0;
      }
      function close(){
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
      panels.forEach(function(p){ p.addEventListener('click', function(){ open(p.dataset.cat); }); });
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
      document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
    })();
  </script>`;
}

function catalogPage(activeCat) {
  // Categorías visibles en el nav/home/filtro: todas menos las de
  // temporada (Halloween, Navidad) fuera de fecha. Si se está viendo
  // justo una categoría de temporada por link directo fuera de fecha, se
  // la suma igual a la lista para que el mini-hero y el filtro no se
  // rompan (aunque no aparezca en el resto del sitio).
  const visible = visibleCategories();
  const cats = activeCat && !visible.find((c) => c.id === activeCat)
    ? visible.concat(categories.filter((c) => c.id === activeCat))
    : visible;

  const catButtons = [`<a href="/" class="${!activeCat ? "active" : ""}">Todos</a>`]
    .concat(cats.map((c) => `<a href="/categoria/${c.id}" class="${activeCat === c.id ? "active" : ""}">${c.label}</a>`))
    .join("");

  // HOME (sin categoría activa): selector interactivo de categorías +
  // modal con personaje/catálogo — no se apilan las grillas en la página.
  if (!activeCat) {
    return layout({
      title: "Catálogo",
      description: "Invitación digital lista en minutos: elegí un diseño para boda, cumpleaños, XV, bautismo o baby shower, personalizalo y compartilo por WhatsApp con edición ilimitada y RSVP incluido.",
      body: `<div class="orios-home-head">
        <span class="orios-home-kicker">Catálogo TaDi</span>
        <h1>Elegí tu tarjeta<span class="dot">.</span></h1>
        <p>Diseños digitales para cada ocasión, listos para personalizar en minutos.</p>
      </div>
      ${oriosHomeHTML(visible)}
      ${TRUST_STRIP_HTML}
      ${categoryModalsHTML(visible)}`,
    });
  }

  // Página de una categoría puntual (link directo, nav, footer, SEO):
  // se mantiene el comportamiento existente (mini-hero + grilla). Usa la
  // lista completa de categorías para el lookup, así una categoría de
  // temporada sigue siendo accesible todo el año por link directo.
  const cat = categories.find((c) => c.id === activeCat);
  return layout({
    title: cat.label,
    description: `Invitaciones digitales de ${cat.label.toLowerCase()} — elegí tu diseño, cargá los datos de tu evento y compartilo por WhatsApp en minutos, con edición ilimitada hasta el día del evento.`,
    body: `${miniHeroHTML(cat, cats)}
    ${TRUST_STRIP_HTML}
    <div class="cat-filter" id="catalogo">${catButtons}</div>
    <div class="section-head">
      <h2>${cat.label}</h2>
      <p>${cat.description}</p>
    </div>
    ${categoryGridHTML(cat)}`,
  });
}

function cardHTML(d) {
  const cat = categories.find((c) => c.id === d.category);
  const isFlagship = cat.flagshipDesign === d.id;
  return `<div class="design-card">
    <div class="swatch" style="background:linear-gradient(135deg, ${d.accent}, ${d.accent2 || d.accent})">
      ${isFlagship ? `<span class="badge-fav">★ Más elegido</span>` : ""}
      ${typeof d.cardPreview === "function" ? d.cardPreview(d) : d.name}
    </div>
    <div class="body">
      <span class="cat-tag">${cat.label}</span>
      <h3>${d.name}</h3>
      <p>${d.summary}</p>
      <span class="price-tag">Desde ${money(pricing.defaultPlan(cat.id).price)}</span>
      <div class="actions">
        <a class="btn btn-outline" href="/demo/${d.id}">Ver demo</a>
        <a class="btn btn-primary" href="/checkout/${d.id}">Elegir</a>
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
    { loc: "/preguntas-frecuentes", priority: "0.5" },
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
    description: "Guía paso a paso: cómo elegir tu invitación digital en TaDi, personalizarla con tus datos y fotos, y compartirla por WhatsApp para recibir las confirmaciones de tus invitados.",
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
    description: "Respuestas sobre precios, edición, plazos de entrega, reembolsos y cómo funciona el RSVP por WhatsApp en las invitaciones digitales de TaDi.",
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
  res.send(html.replace("<body>", "<body>" + DEMO_BACK_BUTTON));
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
        <div class="plan-card-price">${money(p.price)}</div>
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
    body: `<div class="checkout-wrap" style="max-width:720px">
      <h1>Estás por elegir: ${design.name}</h1>
      <p style="color:var(--muted)">${design.summary}</p>
      <div class="checkout-row"><span>Diseño</span><strong>${design.name}</strong></div>
      <div class="checkout-row"><span>Categoría</span><strong>${categories.find((c) => c.id === design.category).label}</strong></div>

      <h2 class="plan-picker-title">Elegí tu plan</h2>
      <form method="POST" action="/api/orders" id="checkout-form">
        <input type="hidden" name="designId" value="${design.id}">
        ${planCardsHTML(design.category, defaultPlan.id)}
        <div class="checkout-price" id="checkout-total">${money(defaultPlan.price)}</div>
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
      <p style="margin-top:16px"><a href="/demo/${design.id}">← Ver el diseño antes de pagar</a></p>
    </div>
    <script>
      (function(){
        var form = document.getElementById('checkout-form');
        var total = document.getElementById('checkout-total');
        var radios = form.querySelectorAll('input[name="plan"]');
        function fmt(n){ return '$' + Number(n).toLocaleString('es-AR'); }
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
app.post("/api/orders", async (req, res) => {
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
      data: { ...design.sampleData },
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

// Confirmaciones "genéricas" (link público sin nombre, RSVP libre) — antes
// vivían en una página huérfana sin link (/editar/:token/invitados), ahora
// se muestran inline en el Panel de tu evento.
function confirmacionesHTML(db, inv) {
  const rsvps = db.rsvps.filter((r) => r.slug === inv.slug);
  const asisten = rsvps.filter((r) => r.asiste !== "no");
  return `<div class="links-section">
    <h2 class="links-section-title">✅ Confirmaciones (${rsvps.length})</h2>
    ${rsvps.length ? `<p style="color:var(--muted);font-size:.82rem;margin:0 0 12px;">${asisten.length} de ${rsvps.length} confirmaron que van.</p>` : ""}
    ${rsvps.map((r) => `<div class="checkout-row"><span>${escapeHtml(r.nombre || "-")} ${r.acompaniantes ? "(" + escapeHtml(String(r.acompaniantes)) + ")" : ""}</span><strong>${r.asiste === "no" ? "❌ No asiste" : "✅ Asiste"}</strong></div>`).join("") || `<p style="color:var(--muted);font-size:.82rem;">Todavía no hay confirmaciones por el link general.</p>`}
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
      <input type="number" name="cupo" placeholder="Cupo" min="1" max="20" value="2" required style="width:80px">
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
        const waText = `¡Hola ${g.nombre}! Están invitados a ${evento}. Confirmen su asistencia acá, es un toque: ${url}`;
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

app.get("/editar/:token", (req, res) => {
  const db = getDB();
  const order = db.orders.find((o) => o.editToken === req.params.token);
  if (!order || order.status !== "paid") return res.status(404).send(layout({ title: "No encontrado", body: `<div class="status-page"><h1>Link no válido</h1><p>Este link de edición no existe o el pago todavía no fue confirmado.</p></div>` }));

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
        <button type="button" class="panel-nav-item" data-target="resumen"><span class="nav-icon">📝</span><span>Resumen</span></button>
        <button type="button" class="panel-nav-item" data-target="editar"><span class="nav-icon">✏️</span><span>Editar diseño</span></button>
        ${hasInvitadosNombrados ? `<button type="button" class="panel-nav-item" data-target="invitados"><span class="nav-icon">💌</span><span>Invitados</span></button>` : ""}
        <button type="button" class="panel-nav-item" data-target="confirmaciones"><span class="nav-icon">✅</span><span>Confirmaciones</span></button>
        ${pricing.hasFeature(design.category, inv.plan, "muro") ? `<button type="button" class="panel-nav-item" data-target="fotos"><span class="nav-icon">📷</span><span>Fotos</span></button>` : ""}
        <button type="button" class="panel-nav-item" data-target="links"><span class="nav-icon">🔗</span><span>Links</span></button>
      </nav>

      <div class="panel-content">
        <section class="panel-section" data-section="resumen">
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
          ${confirmacionesHTML(db, inv)}
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
  <div class="editor-preview-panel">
    <iframe id="preview" src="/preview/${order.editToken}"></iframe>
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
  if (!order || order.status !== "paid") return res.status(404).send(layout({ title: "No encontrado", body: `<div class="status-page"><h1>Link no válido</h1><p>Este link de edición no existe o el pago todavía no fue confirmado.</p></div>` }));
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
    // "galeria") se conserva; el resto arranca con el sampleData del
    // diseño nuevo.
    const mergedData = { ...newDesign.sampleData };
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

app.post("/api/upload/:token", (req, res) => {
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
      res.status(500).json({ error: "No se pudo procesar la foto. Probá con otra." });
    }
  });
});

app.post("/api/upload-video/:token", (req, res) => {
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

app.post("/api/invitacion/:slug/invitado/:guestToken/rsvp", (req, res) => {
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
    fecha: new Date().toISOString(),
  };
  saveDB(db);
  res.json({ ok: true });
});

app.post("/api/invitacion/:slug/rsvp", (req, res) => {
  const db = getDB();
  const inv = db.invitations.find((i) => i.slug === req.params.slug);
  if (!inv) return res.status(404).json({ error: "no encontrado" });
  db.rsvps.push({ slug: req.params.slug, ...req.body, createdAt: new Date().toISOString() });
  saveDB(db);
  res.json({ ok: true });
});

// Sube una foto al "muro de invitados" — pública (cualquiera con el link de
// la invitación), igual que el RSVP: el slug es el único "permiso" que
// hace falta, no requiere el editToken del dueño. Solo funciona si el plan
// comprado tiene la feature "muro" y la invitación no está purgada.
app.post("/api/invitacion/:slug/muro", (req, res) => {
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

function adminLayout({ title, body }) {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Admin TaDi</title>
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

  const totalRsvps = db.rsvps.length;

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
    const rsvps = inv ? db.rsvps.filter((r) => r.slug === inv.slug) : [];
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
  const rsvps = inv ? db.rsvps.filter((r) => r.slug === inv.slug) : [];
  const catLabel = design ? (categories.find((c) => c.id === design.category) || {}).label || design.category : "—";

  const fieldsHTML = design && inv
    ? design.schema.filter((f) => f.type !== "palette").map((f) => `
        <div class="admin-detail-row">
          <div class="admin-detail-label">${escapeHtml(f.label)}</div>
          <div class="admin-detail-value">${adminFieldValueHTML(f, inv.data[f.name])}</div>
        </div>`).join("")
    : `<div class="admin-detail-row"><div class="admin-detail-value">Esta orden todavía no tiene una tarjeta cargada (el pago sigue pendiente).</div></div>`;

  const rsvpsHTML = rsvps.length
    ? rsvps.map((r) => `
        <div class="admin-detail-row">
          <div class="admin-detail-label">${escapeHtml(r.nombre || "—")}</div>
          <div class="admin-detail-value">${r.asiste === "no" ? "❌ No asiste" : "✅ Asiste"}${r.acompaniantes ? ` · ${escapeHtml(r.acompaniantes)} persona(s)` : ""}${r.menu ? ` · menú: ${escapeHtml(r.menu)}` : ""}${r.mensaje ? `<br><em>"${escapeHtml(r.mensaje)}"</em>` : ""}</div>
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
