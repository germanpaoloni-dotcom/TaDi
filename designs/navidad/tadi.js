const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { navidadSchema } = require("../schemas");

const id = "nav-tadi";
const ACCENT = "#4a9d6e";
const ACCENT2 = "#c9a24a";
const AURORA_A = "#4a9d6e";
const AURORA_B = "#c9a24a";

const sampleData = {
  nombre: "Cena de Navidad en lo de los Ibáñez",
  fecha: "2027-12-24", hora: "21:00", lugar: "Casa de los Ibáñez",
  direccionMapa: "https://maps.google.com/?q=Casa+Ibanez",
  mensaje: "Una mesa larga, buena compañía y mucho amor. Los esperamos para cerrar el año como se debe.",
  amigoInvisible: "Sí — tope $15.000, se sortea el 10/12",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-12-18",
  coverImage: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80",
  galeria: [],
};

function render(data = {}) {
  const d = { ...sampleData, ...data };
  const accent2 = getPaletteColor(d.colorPalette, "dark", ACCENT2);
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
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "navidad", datos: d }) };

  const eventCards = [];
  if (d.hora || d.lugar) eventCards.push({ icon: icons.tree, label: "El festejo", time: d.hora, place: d.lugar });

  const chips = [];
  if (d.amigoInvisible) chips.push({ html: `🎁 <b>${esc(d.amigoInvisible)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "navidad", group: "spooky",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Feliz Navidad", monogram: "🎄",
    titleHtml: `<em>${esc(d.nombre)}</em>`,
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.hora || "20:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventHeading: "El festejo", eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: "¡Feliz Navidad! 🎄",
    coverTitle: d.nombre,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Feliz Navidad",
    group: "spooky", iconSvg: icons.tree, catLabel: "Navidad",
    darkFrom: "#173826", darkTo: "#0a1a11",
  });
}

module.exports = {
  id, category: "navidad", name: "TaDi",
  summary: "La tarjeta de marca de TaDi, versión festiva nocturna: aurora animada verde y dorada sobre neomorfismo oscuro, para Navidad.",
  accent: ACCENT, accent2: "#0a1a11", schema: navidadSchema, sampleData, render, cardPreview,
};
