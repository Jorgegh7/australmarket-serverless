import { useEffect, useMemo, useState } from "react";
import { ApiError, callApi } from "../api/client";
import CarruselRegiones from "../components/CarruselRegiones";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import type { ArtesanoPublico, ProductoPublico } from "../types/catalogo";
import type { RegionResumen } from "../types/regiones";
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

    // Resumen por región (artesanos y productos), calculado con los datos ya cargados.
    const resumenRegiones = useMemo<RegionResumen[]>(() => {
        const mapa = new Map<string, RegionResumen>();
        for (const a of artesanos) {
            if (!a.region) continue;
            const r = mapa.get(a.region) ?? { nombre: a.region, artesanos: 0, productos: 0 };
            r.artesanos += 1;
            mapa.set(a.region, r);
        }
        for (const p of productos) {
            const nombre = artesanoPorId.get(String(p.artesano_id))?.region;
            if (nombre) {
                const r = mapa.get(nombre);
                if (r) r.productos += 1;
            }
        }
        return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }, [artesanos, productos, artesanoPorId]);

    function verRegion(nombre: string) {
        setRegion(nombre);
        // El scroll-margin-top del #catalogo compensa el navbar sticky; el
        // comportamiento suave lo resuelve scroll-behavior (respeta reduced-motion).
        document.getElementById("catalogo")?.scrollIntoView();
    }

    function verTodo() {
        setRegion(TODAS);
        setCategoria(TODAS);
    }

    const productosFiltrados = useMemo(() => {
        return productos.filter((producto) => {
            const artesano = artesanoPorId.get(String(producto.artesano_id));
            const coincideRegion = region === TODAS || artesano?.region === region;
            const coincideCategoria = categoria === TODAS || producto.categoria === categoria;
            return coincideRegion && coincideCategoria;
        });
    }, [productos, artesanoPorId, region, categoria]);

    // Producto de la tarjeta flotante del hero: el primero ya cargado con
    // imagen usable (sin llamadas nuevas a la API).
    const destacado = productos.find((p) => typeof p.imagen_url === "string" && /^https?:\/\//i.test(p.imagen_url));

    return (
        <div className={styles.page}>
            <Hero destacado={destacado} />

            <CarruselRegiones
                regiones={resumenRegiones}
                cargando={estado === "cargando"}
                onSeleccionar={verRegion}
            />

            <section id="catalogo" className={styles.catalogo} aria-labelledby="catalogo-titulo">
                <div className={styles.encabezado}>
                    <h2 id="catalogo-titulo">Catálogo de productos</h2>
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

                {region !== TODAS && (
                    <div className={styles.activos}>
                        <button
                            type="button"
                            className={styles.filtroActivo}
                            onClick={() => setRegion(TODAS)}
                            aria-label={`Quitar filtro de región: ${region}`}
                        >
                            Región: {region} <span aria-hidden="true">✕</span>
                        </button>
                    </div>
                )}

                {estado === "cargando" && <p className={styles.status}>Cargando productos…</p>}

                {estado === "error" && (
                    <p className={styles.status} role="alert">
                        {errorMensaje}
                    </p>
                )}

                {estado === "listo" && productosFiltrados.length === 0 && (
                    <div className={styles.vacio}>
                        <p>
                            {region !== TODAS && categoria === TODAS
                                ? "No hay productos en esta región todavía."
                                : "No se encontraron productos con estos filtros."}
                        </p>
                        <button type="button" className={styles.verTodo} onClick={verTodo}>
                            Ver todo el catálogo →
                        </button>
                    </div>
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
            </section>
        </div>
    );
}
