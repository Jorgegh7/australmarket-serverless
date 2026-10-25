import { Link } from "react-router-dom";
import heroImagen from "../assets/hero.webp";
import { formatPrecioCLP } from "../utils/formatPrecio";
import type { ProductoPublico } from "../types/catalogo";
import Imagen from "./Imagen";
import styles from "./Hero.module.css";

interface HeroProps {
    /** Producto destacado de la tarjeta flotante (ya cargado por la página). */
    destacado?: ProductoPublico;
}

export default function Hero({ destacado }: HeroProps) {
    return (
        <section className={styles.wrapper} aria-labelledby="hero-titulo">
            <div className={styles.hero}>
                <img
                    src={heroImagen}
                    alt=""
                    className={styles.imagen}
                    fetchPriority="high"
                    decoding="async"
                />
                <div className={styles.velo} aria-hidden="true" />

                <div className={styles.contenido}>
                    <span className={styles.etiqueta}>Artesanía que nace del sur</span>
                    <h1 id="hero-titulo" className={styles.titulo}>
                        <span>Hecho a mano</span>
                        <span>en el sur</span>
                    </h1>
                    <p className={styles.frase}>
                        Productos únicos, hechos a mano por artesanos del sur de Chile.
                    </p>
                    <a href="#catalogo" className={styles.boton}>
                        Ver catálogo
                    </a>
                </div>

                {destacado && (
                    <Link to={`/producto/${destacado.id}`} className={styles.tarjeta}>
                        <Imagen src={destacado.imagen_url} alt="" className={styles.miniatura} />
                        <span className={styles.tarjetaTexto}>
                            <span className={styles.tarjetaNombre}>{destacado.nombre}</span>
                            <span className={styles.tarjetaPrecio}>{formatPrecioCLP(destacado.precio)}</span>
                            <span className={styles.tarjetaEnlace}>Ver producto →</span>
                        </span>
                    </Link>
                )}
            </div>
        </section>
    );
}
