import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";
import styles from "./Header.module.css";

const MENU_ID = "menu-principal";

// Navbar sticky. Bajo 768px los enlaces pasan a un menú desplegable con botón
// hamburguesa. Intencionalmente sin enlaces al admin ni al login.
export default function Header() {
    const [abierto, setAbierto] = useState(false);
    const botonRef = useRef<HTMLButtonElement>(null);
    const { pathname } = useLocation();

    // Se cierra al navegar: se ajusta el estado durante el render cuando
    // cambia la ruta (patrón recomendado en vez de un efecto).
    const [pathAnterior, setPathAnterior] = useState(pathname);
    if (pathname !== pathAnterior) {
        setPathAnterior(pathname);
        setAbierto(false);
    }

    useEffect(() => {
        if (!abierto) return;
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAbierto(false);
                botonRef.current?.focus();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [abierto]);

    return (
        <header className={styles.header}>
            <div className={styles.barra}>
                <Link to="/" className={styles.marca} aria-label="AustralMarket, ir al catálogo">
                    <Logo />
                </Link>

                <button
                    ref={botonRef}
                    type="button"
                    className={styles.hamburguesa}
                    aria-expanded={abierto}
                    aria-controls={MENU_ID}
                    aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setAbierto((v) => !v)}
                >
                    <span className={styles.lineas} aria-hidden="true" data-abierto={abierto} />
                </button>

                <nav id={MENU_ID} className={styles.nav} data-abierto={abierto} aria-label="Principal">
                    <ul className={styles.lista}>
                        <li>
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    [styles.enlace, isActive ? styles.activo : ""].filter(Boolean).join(" ")
                                }
                            >
                                Catálogo
                            </NavLink>
                        </li>
                        <li>
                            <a href="#contacto" className={styles.cta} onClick={() => setAbierto(false)}>
                                Contacto
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
