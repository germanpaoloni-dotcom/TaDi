// Bandas y planes de precio.
//
// Por qué bandas y no un precio por categoría: bodas, xv y bautismos son
// eventos de una sola vez con más presupuesto de por medio (más cerca de lo
// que cobra la competencia relevada en la auditoría); infantiles, cumpleaños,
// save the date, halloween y navidad son más casuales/frecuentes y el
// comprador es más sensible a precio. Agrupar en 2 bandas en vez de 8
// precios sueltos mantiene esto mantenible y fácil de explicar en checkout.
//
// Dentro de cada banda, 2 niveles (Básico/Plus). Bodas y xv suman un 3er
// nivel (Premium) porque son las categorías de mayor intención/valor
// (destino, dress code, etc.) y son las que más piden alias personalizado,
// video de portada o invitación bilingüe.
//
// "features" es la lista de funciones habilitadas en ese plan — server.js y
// las plantillas de diseño consultan hasFeature(...) para mostrar u ocultar
// música de fondo, mapa embebido, muro de fotos de invitados y los extras
// premium (alias personalizado, video de portada, multilenguaje).

const ESTANDAR_CATEGORIES = ["infantiles", "cumpleanos", "savethedate", "halloween", "navidad"];
const PREMIUM_CATEGORIES = ["bodas", "xv", "bautismos"];
const PREMIUM_TIER_CATEGORIES = ["bodas", "xv"];

const BANDS = {
  estandar: {
    categories: ESTANDAR_CATEGORIES,
    plans: [
      {
        id: "basico",
        label: "Básico",
        price: 19900,
        tagline: "Lo esencial para compartir tu evento.",
        features: [],
        includes: [
          "Diseño elegido, personalizado con tus datos",
          "Edición ilimitada hasta el evento",
          "Confirmación de asistencia (RSVP) por WhatsApp",
          "Galería de fotos",
          "Alias / CBU para regalo",
        ],
      },
      {
        id: "plus",
        label: "Plus",
        price: 24900,
        tagline: "Para una invitación con más para explorar.",
        features: ["musica", "mapa", "muro"],
        includes: [
          "Todo lo del plan Básico",
          "Música de fondo",
          "Mapa embebido interactivo",
          "Muro de fotos de invitados",
        ],
      },
    ],
  },
  premium: {
    categories: PREMIUM_CATEGORIES,
    plans: [
      {
        id: "basico",
        label: "Básico",
        price: 23900,
        tagline: "Lo esencial para compartir tu evento.",
        features: [],
        includes: [
          "Diseño elegido, personalizado con tus datos",
          "Edición ilimitada hasta el evento",
          "Confirmación de asistencia (RSVP) por WhatsApp",
          "Galería de fotos",
          "Alias / CBU para regalo",
        ],
      },
      {
        id: "plus",
        label: "Plus",
        price: 29900,
        tagline: "Para una invitación con más para explorar.",
        features: ["musica", "mapa", "muro"],
        includes: [
          "Todo lo del plan Básico",
          "Música de fondo",
          "Mapa embebido interactivo",
          "Muro de fotos de invitados",
        ],
      },
    ],
  },
};

// 3er nivel, solo se agrega a las categorías de PREMIUM_TIER_CATEGORIES.
const PREMIUM_TIER = {
  id: "premium",
  label: "Premium",
  price: 36900,
  tagline: "La versión completa, sin límites.",
  features: ["musica", "mapa", "muro", "alias", "video", "multilenguaje", "invitadosPersonalizados", "logistica"],
  includes: [
    "Todo lo del plan Plus",
    "Alias personalizado en la URL (tadi.com.ar/tu-nombre)",
    "Video de portada",
    "Invitación en 2 idiomas (español + inglés)",
    "Invitaciones nombradas con link personal y cupo de acompañantes por invitado",
    "Info de hospedaje y cómo llegar para invitados de afuera",
  ],
};

function bandIdForCategory(catId) {
  if (ESTANDAR_CATEGORIES.includes(catId)) return "estandar";
  if (PREMIUM_CATEGORIES.includes(catId)) return "premium";
  return "estandar";
}

// Devuelve la lista de planes disponibles para una categoría, en orden.
function plansForCategory(catId) {
  const band = BANDS[bandIdForCategory(catId)];
  const plans = band.plans.map((p) => ({ ...p }));
  if (PREMIUM_TIER_CATEGORIES.includes(catId)) plans.push({ ...PREMIUM_TIER });
  return plans;
}

function getPlan(catId, planId) {
  return plansForCategory(catId).find((p) => p.id === planId) || null;
}

// Plan por defecto si no se especifica uno (ej. links viejos sin plan en la URL).
function defaultPlan(catId) {
  return plansForCategory(catId)[0];
}

function hasFeature(catId, planId, feature) {
  const plan = getPlan(catId, planId);
  return Boolean(plan && plan.features.includes(feature));
}

module.exports = {
  BANDS,
  PREMIUM_TIER,
  ESTANDAR_CATEGORIES,
  PREMIUM_CATEGORIES,
  PREMIUM_TIER_CATEGORIES,
  bandIdForCategory,
  plansForCategory,
  getPlan,
  defaultPlan,
  hasFeature,
};
