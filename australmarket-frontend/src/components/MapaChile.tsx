import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "./regionesChile";
import styles from "./MapaChile.module.css";

function normalizar(texto: string): string {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[’']/g, "");
}

const REGLAS: Array<[string, string]> = [
    ["arica", "arica"],
    ["tarapaca", "tarapaca"],
    ["antofagasta", "antofagasta"],
    ["atacama", "atacama"],
    ["coquimbo", "coquimbo"],
    ["valpara", "valparaiso"],
    ["metropolitana", "metropolitana"],
    ["santiago", "metropolitana"],
    ["higgins", "ohiggins"],
    ["maule", "maule"],
    ["nuble", "nuble"],
    ["biobio", "biobio"],
    ["araucania", "araucania"],
    ["los rios", "rios"],
    ["los lagos", "lagos"],
    ["aysen", "aysen"],
    ["magallanes", "magallanes"],
];

// Asocia el texto libre de la región ("Región de Los Lagos", "Los Lagos"…) con una región del mapa.
function claveRegion(region: string | null | undefined): string | null {
    if (!region) return null;
    const r = normalizar(region);
    return REGLAS.find(([patron]) => r.includes(patron))?.[1] ?? null;
}

interface MapaChileProps {
    region: string | null | undefined;
}

// Mapa de Chile por regiones (geometría simplificada en regionesChile.ts).
export default function MapaChile({ region }: MapaChileProps) {
    const activa = claveRegion(region);
    const seleccionada = REGIONES.find((r) => r.clave === activa);

    return (
        <figure className={styles.mapa}>
            <svg
                viewBox={`-2 -2 ${MAPA_ANCHO + 4} ${MAPA_ALTO + 4}`}
                className={styles.svg}
                role="img"
                aria-label={
                    seleccionada ? `Mapa de Chile con ${seleccionada.nombre} destacada` : "Mapa de Chile"
                }
            >
                {REGIONES.filter((r) => r.clave !== activa).map((r) => (
                    <path key={r.clave} d={r.ruta} className={styles.region} />
                ))}
                {seleccionada && (
                    <>
                        <path d={seleccionada.ruta} className={styles.activa} />
                        <circle
                            cx={seleccionada.centro[0]}
                            cy={seleccionada.centro[1]}
                            r={3}
                            className={styles.punto}
                        />
                    </>
                )}
            </svg>
            <figcaption className={styles.leyenda}>{seleccionada?.nombre ?? region ?? "Chile"}</figcaption>
        </figure>
    );
}
