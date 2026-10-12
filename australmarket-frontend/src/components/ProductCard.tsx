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
                <span className={styles.badge}>{producto.categoria}</span>
            </div>
            <div className={styles.body}>
                <h3 className={styles.nombre}>{producto.nombre}</h3>
                <p className={styles.artesano}>{artesano?.nombre ?? "Artesano no disponible"}</p>
                {artesano?.region && <p className={styles.region}>{artesano.region}</p>}
                <p className={styles.precio}>{formatPrecioCLP(producto.precio)}</p>
            </div>
        </Link>
    );
}
