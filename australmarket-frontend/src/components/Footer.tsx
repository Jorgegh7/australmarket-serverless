import { Link, useLocation } from "react-router-dom";
import { CREDITO_FOTO_HERO } from "../constants/creditos";
import Logo from "./Logo";
import styles from "./Footer.module.css";

// Sección bosque a todo el ancho; su id="contacto" es el destino del enlace
// "Contacto" del header. Sin correos ni teléfonos, y sin enlaces al admin ni
// al login.
export default function Footer() {
    const { pathname } = useLocation();

    // Un <Link to="/"> no hace scroll por sí solo: en la portada se desplaza a
    // #catalogo; desde otra página se navega a "/" y luego se desplaza (la
    // sección #catalogo se renderiza siempre, incluso mientras carga).
    function irAlCatalogo() {
        const desplazar = () => document.getElementById("catalogo")?.scrollIntoView();
        if (pathname === "/") {
            desplazar();
        } else {
            setTimeout(desplazar, 100);
        }
    }

    return (
        <footer id="contacto" className={styles.footer}>
            <div className={styles.contenido}>
                <Logo claro />
                <p className={styles.frase}>
                    Artesanía que nace del sur: productos hechos a mano por artesanos del sur de Chile.
                </p>
                <p className={styles.contacto}>
                    ¿Quieres comprar? Contacta directamente al artesano desde la ficha de cada producto.
                </p>
                <Link to="/" className={styles.boton} onClick={irAlCatalogo}>
                    Ver catálogo
                </Link>
                <p className={styles.legal}>Proyecto de portafolio · Mentoría AWS</p>
                <p className={styles.credito}>{CREDITO_FOTO_HERO}</p>
            </div>
        </footer>
    );
}
