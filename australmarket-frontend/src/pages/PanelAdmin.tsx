import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import GestionArtesanos from "./admin/GestionArtesanos";
import GestionProductos from "./admin/GestionProductos";
import styles from "./PanelAdmin.module.css";

type Seccion = "artesanos" | "productos";

export default function PanelAdmin() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState<Seccion>("artesanos");

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <h1>Panel Admin</h1>
                <button type="button" className={styles.logout} onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </header>

            <nav className={styles.tabs} aria-label="Secciones del panel">
                <button
                    type="button"
                    className={seccion === "artesanos" ? styles.tabActiva : styles.tab}
                    onClick={() => setSeccion("artesanos")}
                >
                    Artesanos
                </button>
                <button
                    type="button"
                    className={seccion === "productos" ? styles.tabActiva : styles.tab}
                    onClick={() => setSeccion("productos")}
                >
                    Productos
                </button>
            </nav>

            {seccion === "artesanos" && <GestionArtesanos />}
            {seccion === "productos" && <GestionProductos />}
        </main>
    );
}
