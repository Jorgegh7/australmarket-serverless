import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, callApi } from "../api/client";
import Imagen from "../components/Imagen";
import { formatPrecioCLP } from "../utils/formatPrecio";
import type { ArtesanoPublico, ProductoPublico } from "../types/catalogo";
import styles from "./DetalleProducto.module.css";

type Estado = "cargando" | "error" | "no-encontrado" | "listo";

export default function DetalleProducto() {
    const { id } = useParams<{ id: string }>();

    const [productos, setProductos] = useState<ProductoPublico[]>([]);
    const [artesanos, setArtesanos] = useState<ArtesanoPublico[]>([]);
    const [estado, setEstado] = useState<Estado>("cargando");
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

    // No existe GET /catalogo/productos/{id}: se trae la lista completa y se
    // filtra por id en el cliente (igual que en el catálogo).
    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setEstado("cargando");
            setErrorMensaje(null);
            try {
                const [productosData, artesanosData] = await Promise.all([
                    callApi<ProductoPublico[]>("/catalogo/productos"),
                    callApi<ArtesanoPublico[]>("/catalogo/artesanos"),
                ]);
                if (cancelado) return;
                setProductos(productosData);
                setArtesanos(artesanosData);
                setEstado("listo");
            } catch (error) {
                if (cancelado) return;
                setErrorMensaje(
                    error instanceof ApiError
                        ? error.message
                        : "No se pudo cargar el producto. Intenta nuevamente.",
                );
                setEstado("error");
            }
        }

        cargar();
        return () => {
            cancelado = true;
        };
    }, []);

    const producto = useMemo(() => productos.find((p) => String(p.id) === id), [productos, id]);

    const artesano = useMemo(
        () => (producto ? artesanos.find((a) => String(a.id) === String(producto.artesano_id)) : undefined),
        [artesanos, producto],
    );

    if (estado === "cargando") {
        return (
            <main className={styles.page}>
                <p className={styles.status}>Cargando producto…</p>
            </main>
        );
    }

    if (estado === "error") {
        return (
            <main className={styles.page}>
                <p className={styles.status} role="alert">
                    {errorMensaje}
                </p>
            </main>
        );
    }

    if (!producto) {
        return (
            <main className={styles.page}>
                <p className={styles.status}>Producto no encontrado.</p>
                <Link to="/" className={styles.backLink}>
                    Volver al catálogo
                </Link>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
                <Link to="/">Inicio</Link>
                <span aria-hidden="true">/</span>
                <span>{producto.categoria}</span>
                <span aria-hidden="true">/</span>
                <span className={styles.breadcrumbActual}>{producto.nombre}</span>
            </nav>

            <div className={styles.layout}>
                <Imagen src={producto.imagen_url} alt={producto.nombre} className={styles.imagen} />

                <div className={styles.info}>
                    <span className={styles.badge}>{producto.categoria}</span>
                    <h1>{producto.nombre}</h1>
                    <p className={styles.precio}>{formatPrecioCLP(producto.precio)}</p>
                    <p className={styles.historia}>{producto.historia}</p>

                    {artesano && (
                        <div className={styles.artesano}>
                            <Imagen
                                src={artesano.foto_perfil_url}
                                alt={artesano.nombre}
                                className={styles.artesanoFoto}
                            />
                            <div>
                                <h2 className={styles.artesanoNombre}>{artesano.nombre}</h2>
                                <p className={styles.artesanoRegion}>{artesano.region}</p>
                                <p className={styles.artesanoHistoria}>{artesano.historia}</p>
                            </div>
                        </div>
                    )}

                    {/* TODO: implementar contacto con el artesano. El catálogo
                        público no expone teléfono ni mail (intencional, ver
                        CLAUDE.md); falta definir cómo se resuelve en una
                        historia futura. */}
                    <button type="button" className={styles.contactar} disabled title="Próximamente">
                        Contactar al artesano
                    </button>
                    <p className={styles.contactarNota}>
                        El contacto directo con el artesano todavía no está disponible.
                    </p>
                </div>
            </div>
        </main>
    );
}
