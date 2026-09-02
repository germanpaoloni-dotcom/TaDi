const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, rsvpWidget, formatFechaCorta } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { bodaSchema } = require("../schemas");

const id = "boda-tadi";
const ACCENT = "#c9a24a";
const ACCENT2 = "#a9832f";
const AURORA_A = "#c9a24a";
const AURORA_B = "#ff9c6b";

const sampleData = {
  novia: "Julieta", novio: "Tomás",
  fecha: "2027-04-17", horaCeremonia: "18:00", lugarCeremonia: "Parroquia Santa María",
  horaFiesta: "20:30", lugarFiesta: "Salón Los Robles, San Isidro",
  direccionMapa: "https://maps.google.com/?q=Salon+Los+Robles+San+Isidro",
  mensaje: "Con la bendición de Dios y nuestros padres, los invitamos a compartir el día en que unimos nuestras vidas.",
  dressCode: "Formal / Elegante sport",
  alias: "julieta.tomas.boda",
  whatsapp: "5491100000000",
  fechaLimiteRSVP: "2027-03-20",
  coverImage: "https://images.unsplash.com/photo-1683238112508-27ec0155e774?w=1200&q=80",
  galeria: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  ],
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
  const iN = (d.novia || "?").trim().charAt(0).toUpperCase();
  const iO = (d.novio || "?").trim().charAt(0).toUpperCase();
  const rsvp = { mode: "form", widget: rsvpWidget(d.__slug || "demo", { withGuests: true, withMenu: true, whatsapp: d.whatsapp, categoria: "bodas", datos: d }) };

  const eventCards = [];
  if (d.horaCeremonia || d.lugarCeremonia) eventCards.push({ icon: icons.rings, label: "Ceremonia", time: d.horaCeremonia, place: d.lugarCeremonia });
  if (d.horaFiesta || d.lugarFiesta) eventCards.push({ icon: icons.rings, label: "Fiesta", time: d.horaFiesta, place: d.lugarFiesta });

  const chips = [];
  if (d.dressCode) chips.push({ html: `Dress code <b>${esc(d.dressCode)}</b>` });
  if (d.direccionMapa) chips.push({ html: "📍 Ver ubicación", href: d.direccionMapa });

  return tadiRender({
    d, category: "bodas", group: "elegante",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Para siempre", monogram: `${iN}&${iO}`,
    titleHtml: `${esc(d.novia)} <em>&amp;</em> ${esc(d.novio)}`,
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha ? `${d.fecha}T${d.horaFiesta || "18:00"}:00` : sampleData.fecha,
    message: d.mensaje, eventCards, chips,
    gallery: d.galeria || [],
    rsvp, rsvpDeadline: formatFechaCorta(d.fechaLimiteRSVP),
    footerName: `Con amor, ${esc(d.novia)} &amp; ${esc(d.novio)}`,
    alias: d.alias,
    coverTitle: `${d.novia} & ${d.novio}`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Para siempre",
    group: "elegante", iconSvg: icons.rings, catLabel: "Bodas",
    darkFrom: "#8a6a3a", darkTo: "#2a2416",
  });
}

module.exports = {
  id, category: "bodas", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada dorada, neomorfismo premium y el mismo estilo de tadi.com.ar, para bodas.",
  accent: ACCENT, accent2: "#2a2416", schema: bodaSchema, sampleData, render, cardPreview,
};
