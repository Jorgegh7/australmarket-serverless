import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, callApi } from "../api/client";
import ProductCard from "../components/ProductCard";
import type { ArtesanoPublico, ProductoPublico } from "../types/catalogo";
import styles from "./Catalogo.module.css";

type EstadoCarga = "cargando" | "listo" | "error";

const TODAS = "todas";

export default function Catalogo() {
    const [productos, setProductos] = useState<ProductoPublico[]>([]);
    const [artesanos, setArtesanos] = useState<ArtesanoPublico[]>([]);
    const [estado, setEstado] = useState<EstadoCarga>("cargando");
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

    const [region, setRegion] = useState(TODAS);
    const [categoria, setCategoria] = useState(TODAS);

    useEffect(() => {
        let cancelado = false;

        async function cargarCatalogo() {
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
                        : "No se pudo cargar el catálogo. Intenta nuevamente.",
                );
                setEstado("error");
            }
        }

        cargarCatalogo();
        return () => {
            cancelado = true;
        };
    }, []);

    const artesanoPorId = useMemo(() => {
        const mapa = new Map<string, ArtesanoPublico>();
        for (const artesano of artesanos) mapa.set(String(artesano.id), artesano);
        return mapa;
    }, [artesanos]);

    const regiones = useMemo(
        () =>
            Array.from(new Set(artesanos.map((a) => a.region).filter(Boolean))).sort((a, b) =>
                a.localeCompare(b, "es"),
            ),
        [artesanos],
    );

    const categorias = useMemo(
        () =>
            Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).sort((a, b) =>
                a.localeCompare(b, "es"),
            ),
        [productos],
    );

    const productosFiltrados = useMemo(() => {
        return productos.filter((producto) => {
            const artesano = artesanoPorId.get(String(producto.artesano_id));
            const coincideRegion = region === TODAS || artesano?.region === region;
            const coincideCategoria = categoria === TODAS || producto.categoria === categoria;
            return coincideRegion && coincideCategoria;
        });
    }, [productos, artesanoPorId, region, categoria]);

    return (
        <main className={styles.page}>
            <div className={styles.topbar}>
                <Link to="/" className={styles.brand}>
                    AustralMarket
                </Link>
                <Link to="/login" className={styles.adminLink}>
                    Acceso administrador
                </Link>
            </div>

            <div className={styles.hero}>
                <span className={styles.eyebrow}>Artesanía que nace del sur</span>
                <h1>Catálogo de productos</h1>
                <p>Descubre productos únicos, hechos a mano por artesanos del sur de Chile.</p>
            </div>

            <div className={styles.filters}>
                <label className={styles.filterField}>
                    Región
                    <select value={region} onChange={(event) => setRegion(event.target.value)}>
                        <option value={TODAS}>Todas las regiones</option>
                        {regiones.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.filterField}>
                    Categoría
                    <select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
                        <option value={TODAS}>Todas las categorías</option>
                        {categorias.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {estado === "cargando" && <p className={styles.status}>Cargando productos…</p>}

            {estado === "error" && (
                <p className={styles.status} role="alert">
                    {errorMensaje}
                </p>
            )}

            {estado === "listo" && productosFiltrados.length === 0 && (
                <p className={styles.status}>No se encontraron productos con estos filtros.</p>
            )}

            {estado === "listo" && productosFiltrados.length > 0 && (
                <div className={styles.grid}>
                    {productosFiltrados.map((producto) => (
                        <ProductCard
                            key={producto.id}
                            producto={producto}
                            artesano={artesanoPorId.get(String(producto.artesano_id))}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
