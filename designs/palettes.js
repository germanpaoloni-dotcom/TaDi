// Gamas de colores que el editor ofrece para personalizar el color de
// ACENTO/detalle de cada tarjeta (líneas, textos destacados, botones),
// sin tocar el fondo ni la estructura del diseño — así no se pierde
// contraste ni legibilidad, y cada categoría conserva su identidad.
//
// Cada gama trae dos tonos de la misma familia de color:
//  - dark:  tono claro/brillante, pensado para usarse sobre fondos oscuros
//  - light: tono profundo/saturado, pensado para usarse sobre fondos claros
// Cada diseño declara su propio "modo" (dark/light, según el fondo que
// usa) y toma el tono correspondiente. La opción "original" no cambia
// nada: el diseño se ve exactamente como está pensado por defecto.

const PALETTES = [
  { id: "original", name: "Original" },
  { id: "dorado", name: "Dorado", dark: "#dcb872", light: "#b8863a" },
  { id: "plata", name: "Plata", dark: "#b7c4d1", light: "#7c8a99" },
  { id: "rosa-champagne", name: "Rosa Champagne", dark: "#e3b8ae", light: "#b9695c" },
  { id: "verde-salvia", name: "Verde Salvia", dark: "#a8c0a0", light: "#5f7a56" },
  { id: "azul-petroleo", name: "Azul Petróleo", dark: "#7fb8c4", light: "#2c6875" },
  { id: "burdeos", name: "Burdeos", dark: "#d99aa8", light: "#7a2436" },
  { id: "terracota", name: "Terracota", dark: "#e0a17c", light: "#a85431" },
  { id: "lavanda", name: "Lavanda", dark: "#c3b6e0", light: "#6d5a96" },
  { id: "cobre", name: "Cobre", dark: "#e0a878", light: "#9a5a28" },
  { id: "grafito", name: "Grafito", dark: "#c7ccd4", light: "#3d4249" },
];

// mode: "dark" (diseño con fondo oscuro) | "light" (diseño con fondo claro)
// fallbackHex: el color propio del diseño, usado cuando paletteId es
// "original", vacío, o no coincide con ninguna gama conocida.
function getPaletteColor(paletteId, mode, fallbackHex) {
  const p = PALETTES.find((x) => x.id === paletteId);
  if (!p || p.id === "original") return fallbackHex;
  return (mode === "light" ? p.light : p.dark) || fallbackHex;
}

module.exports = { PALETTES, getPaletteColor };
