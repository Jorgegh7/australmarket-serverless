import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import styles from "./Layout.module.css";

// Estructura de las rutas públicas y del login: header sticky, contenido y
// footer. /admin no lo usa (conserva su propia cabecera).
export default function Layout() {
    return (
        <div className={styles.layout}>
            <a href="#contenido" className={styles.saltar}>
                Saltar al contenido
            </a>
            <Header />
            <main id="contenido" tabIndex={-1} className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
