// Catálogo de diseños. Para sumar un diseño nuevo con el tiempo:
// 1) crear un archivo en designs/<categoria>/<nuevo-diseño>.js siguiendo
//    el mismo formato que los existentes (id, category, name, summary,
//    accent, schema, sampleData, render).
// 2) agregarlo a la lista de abajo (o, si se prefiere, autocargar toda
//    la carpeta con fs.readdirSync — se deja explícito por claridad).
const categories = [
  { id: "bodas", label: "Bodas", description: "Invitaciones para ceremonia y fiesta de casamiento." },
  { id: "xv", label: "Fiesta de 15", description: "Invitaciones para quinceañeras." },
  { id: "empresariales", label: "Eventos empresariales", description: "Conferencias, lanzamientos y aniversarios de empresa." },
];

const designs = [
  require("./bodas/elegante-clasica"),
  require("./bodas/boho-naturaleza"),
  require("./bodas/moderna-minimal"),
  require("./xv/glam-rosa"),
  require("./xv/bohemio-floral"),
  require("./xv/pop-vibrante"),
  require("./empresariales/conferencia-corporativa"),
  require("./empresariales/lanzamiento-producto"),
  require("./empresariales/gala-aniversario"),
];

function getDesign(id) {
  return designs.find((d) => d.id === id);
}

function designsByCategory(catId) {
  return designs.filter((d) => d.category === catId);
}

module.exports = { categories, designs, getDesign, designsByCategory };
