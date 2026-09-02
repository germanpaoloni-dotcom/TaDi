const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { xvSchema } = require("../schemas");

const id = "xv-tadi";
const ACCENT = "#d68ca0";
const ACCENT2 = "#ad5d74";
const AURORA_A = "#d68ca0";
const AURORA_B = "#f2c265";

const sampleData = {
  nombre: "Abigail",
  fecha: "2027-09-23", horaCeremonia: "19:00", lugarCeremonia: "Parroquia San José",
  horaFiesta: "21:00", lugarFiesta: "Salón Bellagio",
  direccionMapa: "https://maps.google.com/?q=Salon+Bellagio",
  padres: "Marcela y Diego",
  mensaje: "Con la alegría de siempre y el cariño de toda la vida, los invito a celebrar mis quince años.",
  dressCode: "Elegante",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-09-10",
  coverImage: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80",
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
  const inicial = (d.nombre || "?").trim().charAt(0).toUpperCase();
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: false, whatsapp: d.whatsapp, categoria: "xv", datos: d }) };

  const eventCards = [];
  if (d.horaCeremonia || d.lugarCeremonia) eventCards.push({ icon: icons.crown, label: "Ceremonia", time: d.horaCeremonia, place: d.lugarCeremonia });
  if (d.horaFiesta || d.lugarFiesta) eventCards.push({ icon: icons.crown, label: "Fiesta", time: d.horaFiesta, place: d.lugarFiesta });

  const chips = [];
  if (d.dressCode) chips.push({ html: `Dress code <b>${esc(d.dressCode)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "xv", group: "elegante",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Mis quince", monogram: inicial,
    titleHtml: esc(d.nombre),
    subLine: "Mis quince años",
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.horaFiesta || "20:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: `Con cariño, ${esc(d.nombre)}`,
    coverTitle: `Mis Quince — ${d.nombre}`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Mis quince",
    group: "elegante", iconSvg: icons.crown, catLabel: "Quince Años",
    darkFrom: "#7a3c50", darkTo: "#251419",
  });
}

module.exports = {
  id, category: "xv", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada rosa, neomorfismo premium y el mismo estilo de tadi.com.ar, para quince años.",
  accent: ACCENT, accent2: "#251419", schema: xvSchema, sampleData, render, cardPreview,
};
