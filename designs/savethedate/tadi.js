const { esc } = require("../widgets");
const { tadiRender, tadiCardPreview, getPaletteColor, googleCalendarLink } = require("../tadi-brand");
const icons = require("../tadi-icons");
const { saveTheDateSchema } = require("../schemas");

const id = "std-tadi";
const ACCENT = "#e0896a";
const ACCENT2 = "#b5624a";
const AURORA_A = "#e0896a";
const AURORA_B = "#f2c265";

const sampleData = {
  novia: "Sofía", novio: "Tomás",
  fecha: "2027-04-17", lugar: "Buenos Aires",
  mensaje: "¡Nos casamos! Guardá la fecha, los detalles llegan pronto.",
  instagram: "sofiaytomas2027",
  coverImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
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
  const iN = (d.novia || "?").trim().charAt(0).toUpperCase();
  const iO = (d.novio || "?").trim().charAt(0).toUpperCase();

  const chips = [];
  if (d.lugar) chips.push({ html: `📍 <b>${esc(d.lugar)}</b>` });
  if (d.instagram) chips.push({ html: `📷 @${esc(d.instagram)}`, href: `https://instagram.com/${d.instagram}` });
  if (d.whatsapp) chips.push({ html: "💬 Escribinos", href: `https://wa.me/${d.whatsapp}` });

  const calLink = googleCalendarLink({
    title: `${d.novia || ""} & ${d.novio || ""} se casan`,
    dateISO: d.fecha,
    details: d.mensaje || "",
    location: d.lugar || "",
  });

  return tadiRender({
    d, category: "savethedate", group: "elegante",
    accent: ACCENT, accent2, auroraA: AURORA_A, auroraB: AURORA_B,
    ghost: "Anotalo", monogram: `${iN}&${iO}`,
    titleHtml: `${esc(d.novia)} <em>&amp;</em> ${esc(d.novio)}`,
    subLine: "¡Nos casamos!",
    dateLine: fechaNum || d.fecha, dayLine: fechaDia,
    countdownTarget: d.fecha || sampleData.fecha,
    message: d.mensaje, eventCards: [], chips,
    gallery: d.galeria || [],
    rsvp: calLink ? { mode: "calendar", calLink } : null,
    footerName: `¡Los esperamos! ${esc(d.novia)} &amp; ${esc(d.novio)}`,
    coverTitle: `${d.novia} & ${d.novio} — Save the Date`,
  });
}

function cardPreview(d) {
  return tadiCardPreview({
    accent: ACCENT, auroraA: AURORA_A, auroraB: AURORA_B, ghost: "Anotalo",
    group: "elegante", iconSvg: icons.calendar, catLabel: "Save the Date",
    darkFrom: "#8a4a34", darkTo: "#241512",
  });
}

module.exports = {
  id, category: "savethedate", name: "TaDi",
  summary: "La tarjeta de marca de TaDi: aurora animada y neomorfismo premium, con botón directo para agendar en Google Calendar.",
  accent: ACCENT, accent2: "#241512", schema: saveTheDateSchema, sampleData, render, cardPreview,
};
