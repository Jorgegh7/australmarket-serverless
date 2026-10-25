import { Link } from "react-router-dom";
import Imagen from "./Imagen";
import { formatPrecioCLP } from "../utils/formatPrecio";
import type { ArtesanoPublico, ProductoPublico } from "../types/catalogo";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
    producto: ProductoPublico;
    artesano?: ArtesanoPublico;
}

export default function ProductCard({ producto, artesano }: ProductCardProps) {
    return (
        <Link to={`/producto/${producto.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Imagen src={producto.imagen_url} alt={producto.nombre} className={styles.image} />
            </div>
            <div className={styles.body}>
                <div className={styles.etiquetas}>
                    {producto.categoria && <span className={styles.etiqueta}>{producto.categoria}</span>}
                    {artesano?.region && <span className={styles.etiqueta}>{artesano.region}</span>}
                </div>
                <h3 className={styles.nombre}>{producto.nombre}</h3>
                <p className={styles.artesano}>{artesano?.nombre ?? "Artesano no disponible"}</p>
                <p className={styles.precio}>{formatPrecioCLP(producto.precio)}</p>
            </div>
        </Link>
    );
}
