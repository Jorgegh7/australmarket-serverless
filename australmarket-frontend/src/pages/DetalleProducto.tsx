import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, callApi } from "../api/client";
import ContactoModal from "../components/ContactoModal";
import ArtesanoModal from "../components/ArtesanoModal";
import Imagen from "../components/Imagen";
import { formatPrecioCLP } from "../utils/formatPrecio";
import type { ProductoDetalle } from "../types/productoDetalle";
import styles from "./DetalleProducto.module.css";

type Estado = "cargando" | "error" | "no-encontrado" | "listo";

export default function DetalleProducto() {
    const { id } = useParams<{ id: string }>();

    const [producto, setProducto] = useState<ProductoDetalle | null>(null);
    const [estado, setEstado] = useState<Estado>("cargando");
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
    const [confirmandoContacto, setConfirmandoContacto] = useState(false);
    const [verArtesano, setVerArtesano] = useState(false);

    // Una sola llamada a GET /catalogo/productos/{id}. 400/404 = no encontrado.
    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setEstado("cargando");
            setErrorMensaje(null);
            setProducto(null);
            if (!id) {
                setEstado("no-encontrado");
                return;
            }
            try {
                const data = await callApi<ProductoDetalle>(`/catalogo/productos/${encodeURIComponent(id)}`);
                if (cancelado) return;
                setProducto(data);
                setEstado("listo");
            } catch (error) {
                if (cancelado) return;
                if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
                    setEstado("no-encontrado");
                    return;
                }
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
    }, [id]);

    if (estado === "cargando") {
        return (
            <div className={styles.page}>
                <p className={styles.status}>Cargando producto…</p>
            </div>
        );
    }

    if (estado === "error") {
        return (
            <div className={styles.page}>
                <p className={styles.status} role="alert">
                    {errorMensaje}
                </p>
            </div>
        );
    }

    if (estado === "no-encontrado" || !producto) {
        return (
            <div className={styles.page}>
                <p className={styles.status}>Producto no encontrado</p>
                <Link to="/" className={styles.backLink}>
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const { artesano } = producto;
    // wa.me exige solo dígitos (sin "+", espacios ni guiones).
    const numeroWhatsapp = (artesano.telefono ?? "").replace(/\D/g, "");

    function continuarAWhatsapp() {
        const mensaje = encodeURIComponent(
            `Hola, vi "${producto?.nombre}" en AustralMarket y me gustaría saber más.`,
        );
        window.open(`https://wa.me/${numeroWhatsapp}?text=${mensaje}`, "_blank", "noopener,noreferrer");
        setConfirmandoContacto(false);
    }

    return (
        <div className={styles.page}>
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
                    <div className={styles.etiquetas}>
                        {producto.categoria && <span className={styles.etiqueta}>{producto.categoria}</span>}
                        {artesano.region && <span className={styles.etiqueta}>{artesano.region}</span>}
                    </div>
                    <h1>{producto.nombre}</h1>
                    <p className={styles.precio}>{formatPrecioCLP(producto.precio)}</p>
                    <p className={styles.historia}>{producto.historia}</p>

                    <div className={styles.artesano}>
                        <button
                            type="button"
                            className={styles.artesanoFotoBoton}
                            onClick={() => setVerArtesano(true)}
                            aria-label={`Ampliar foto de ${artesano.nombre} y ver su ubicación`}
                        >
                            <Imagen
                                src={artesano.foto_perfil_url}
                                alt=""
                                className={styles.artesanoFoto}
                            />
                        </button>
                        <div>
                            <h2 className={styles.artesanoNombre}>{artesano.nombre}</h2>
                            <p className={styles.artesanoHistoria}>{artesano.historia}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.contactar}
                        disabled={!numeroWhatsapp}
                        onClick={() => setConfirmandoContacto(true)}
                    >
                        Contactar por WhatsApp
                    </button>
                    {!numeroWhatsapp && (
                        <p className={styles.contactarNota}>Este artesano no tiene contacto disponible</p>
                    )}
                </div>
            </div>

            {verArtesano && (
                <ArtesanoModal
                    nombre={artesano.nombre}
                    region={artesano.region}
                    historia={artesano.historia}
                    foto={artesano.foto_perfil_url}
                    onCerrar={() => setVerArtesano(false)}
                />
            )}

            {confirmandoContacto && (
                <ContactoModal
                    artesanoNombre={artesano.nombre}
                    productoNombre={producto.nombre}
                    onCancelar={() => setConfirmandoContacto(false)}
                    onContinuar={continuarAWhatsapp}
                />
            )}
        </div>
    );
}
