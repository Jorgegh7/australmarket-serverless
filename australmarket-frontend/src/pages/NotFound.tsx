import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
    return (
        <div className={styles.page}>
            <span className={styles.codigo}>Error 404</span>
            <h1 className={styles.titulo}>Página no encontrada</h1>
            <p className={styles.texto}>La página que buscas no existe o fue movida.</p>
            <Link to="/" className={styles.boton}>
                Volver al catálogo
            </Link>
        </div>
    );
}
