import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { RegionResumen } from "../types/regiones";
import styles from "./CarruselRegiones.module.css";

interface CarruselRegionesProps {
    regiones: RegionResumen[];
    cargando: boolean;
    onSeleccionar: (region: string) => void;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

export default function CarruselRegiones({ regiones, cargando, onSeleccionar }: CarruselRegionesProps) {
    const pista = useRef<HTMLDivElement>(null);
    const [puedeRetroceder, setPuedeRetroceder] = useState(false);
    const [puedeAvanzar, setPuedeAvanzar] = useState(false);

    const actualizarFlechas = useCallback(() => {
        const el = pista.current;
        if (!el) return;
        setPuedeRetroceder(el.scrollLeft > 4);
        setPuedeAvanzar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = pista.current;
        if (!el) return;
        const frame = requestAnimationFrame(actualizarFlechas);
        el.addEventListener("scroll", actualizarFlechas, { passive: true });
        window.addEventListener("resize", actualizarFlechas);
        return () => {
            cancelAnimationFrame(frame);
            el.removeEventListener("scroll", actualizarFlechas);
            window.removeEventListener("resize", actualizarFlechas);
        };
    }, [actualizarFlechas, regiones, cargando]);

    function desplazar(direccion: 1 | -1) {
        const el = pista.current;
        if (!el) return;
        const tarjeta = el.querySelector<HTMLElement>("[data-tarjeta]");
        const paso = tarjeta ? tarjeta.offsetWidth + 16 : el.clientWidth;
        // El comportamiento (suave / inmediato) lo decide scroll-behavior en el CSS.
        el.scrollBy({ left: direccion * paso });
    }

    function alPresionarTecla(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            desplazar(1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            desplazar(-1);
        }
    }

    if (!cargando && regiones.length === 0) return null;

    return (
        <section className={styles.seccion} aria-labelledby="regiones-titulo">
            <div className={styles.contenedor}>
                <div className={styles.encabezado}>
                    <div className={styles.textos}>
                        <h2 id="regiones-titulo" className={styles.titulo}>
                            Del sur de Chile
                        </h2>
                        <p className={styles.apoyo}>Elige una región y descubre lo que se hace allí.</p>
                    </div>
                    <div className={styles.flechas}>
                        <button
                            type="button"
                            className={styles.flecha}
                            onClick={() => desplazar(-1)}
                            disabled={!puedeRetroceder}
                            aria-label="Región anterior"
                        >
                            <span aria-hidden="true">‹</span>
                        </button>
                        <button
                            type="button"
                            className={styles.flecha}
                            onClick={() => desplazar(1)}
                            disabled={!puedeAvanzar}
                            aria-label="Región siguiente"
                        >
                            <span aria-hidden="true">›</span>
                        </button>
                    </div>
                </div>

                <div
                    ref={pista}
                    className={styles.pista}
                    role="region"
                    aria-label="Regiones de Chile"
                    tabIndex={0}
                    onKeyDown={alPresionarTecla}
                >
                    {cargando
                        ? [0, 1, 2].map((i) => (
                              <div key={i} className={`${styles.tarjeta} ${styles.esqueleto}`} data-tarjeta aria-hidden="true" />
                          ))
                        : regiones.map((region) => (
                              <article key={region.nombre} className={styles.tarjeta} data-tarjeta>
                                  <h3 className={styles.region}>{region.nombre}</h3>
                                  <span className={styles.conteo}>
                                      {plural(region.artesanos, "artesano", "artesanos")} ·{" "}
                                      {plural(region.productos, "producto", "productos")}
                                  </span>
                                  <button
                                      type="button"
                                      className={styles.ver}
                                      onClick={() => onSeleccionar(region.nombre)}
                                      aria-label={`Ver productos de ${region.nombre}`}
                                  >
                                      Ver productos
                                  </button>
                              </article>
                          ))}
                </div>
            </div>
        </section>
    );
}
