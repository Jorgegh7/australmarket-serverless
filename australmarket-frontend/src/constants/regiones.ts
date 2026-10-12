// Las 16 regiones de Chile, con nombres cortos para que coincidan con los
// datos ya guardados en el backend (ej. "Los Lagos"). Fuente única: cualquier
// select de región del formulario debe importar esta lista, no duplicarla.
export const REGIONES_CHILE = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén",
    "Magallanes",
] as const;

export type RegionChile = (typeof REGIONES_CHILE)[number];
