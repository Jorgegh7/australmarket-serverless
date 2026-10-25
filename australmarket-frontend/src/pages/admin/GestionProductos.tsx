import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../api/client";
import { useProtectedApi } from "../../auth/useProtectedApi";
import type { Artesano } from "../../types/artesano";
import type { Producto, ProductoInput } from "../../types/producto";
import { formatPrecioCLP } from "../../utils/formatPrecio";
import ProductoForm from "./ProductoForm";
import Imagen from "../../components/Imagen";
import styles from "./GestionProductos.module.css";

type Estado = "cargando" | "error" | "listo";
type ModoFormulario = { tipo: "crear" } | { tipo: "editar"; producto: Producto } | null;

function mensajeError(error: unknown, fallback: string): string {
    return error instanceof ApiError ? error.message : fallback;
}

export default function GestionProductos() {
    const protectedApi = useProtectedApi();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [artesanos, setArtesanos] = useState<Artesano[]>([]);
    const [estado, setEstado] = useState<Estado>("cargando");
    const [errorCarga, setErrorCarga] = useState<string | null>(null);

    const [formulario, setFormulario] = useState<ModoFormulario>(null);
    const [guardando, setGuardando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

    const [eliminandoId, setEliminandoId] = useState<string | null>(null);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    // Carga inicial: productos + artesanos (estos últimos para el selector
    // del formulario y para mostrar el nombre en la tabla).
    useEffect(() => {
        let cancelado = false;

        async function cargarInicial() {
            setEstado("cargando");
            setErrorCarga(null);
            try {
                const [productosData, artesanosData] = await Promise.all([
                    protectedApi<Producto[]>("/productos"),
                    protectedApi<Artesano[]>("/artesanos"),
                ]);
                if (cancelado) return;
                setProductos(productosData);
                setArtesanos(artesanosData);
                setEstado("listo");
            } catch (error) {
                if (cancelado) return;
                setErrorCarga(mensajeError(error, "No se pudo cargar la lista de productos."));
                setEstado("error");
            }
        }

        cargarInicial();
        return () => {
            cancelado = true;
        };
    }, [protectedApi]);

    // Recarga manual tras crear/editar/eliminar un producto (la lista de
    // artesanos no cambia por esta acción, no hace falta volver a pedirla).
    async function recargarProductos() {
        setEstado("cargando");
        setErrorCarga(null);
        try {
            const data = await protectedApi<Producto[]>("/productos");
            setProductos(data);
            setEstado("listo");
        } catch (error) {
            setErrorCarga(mensajeError(error, "No se pudo cargar la lista de productos."));
            setEstado("error");
        }
    }

    const artesanoPorId = useMemo(() => {
        const mapa = new Map<string, Artesano>();
        for (const artesano of artesanos) mapa.set(String(artesano.id), artesano);
        return mapa;
    }, [artesanos]);

    async function handleGuardar(input: ProductoInput) {
        if (!formulario) return;
        setGuardando(true);
        setErrorFormulario(null);
        try {
            if (formulario.tipo === "crear") {
                await protectedApi("/productos", { method: "POST", body: input });
            } else {
                await protectedApi(`/productos/${formulario.producto.id}`, { method: "PUT", body: input });
            }
            setFormulario(null);
            await recargarProductos();
        } catch (error) {
            // Incluye el caso "artesano_id inexistente" -> 400 "El artesano
            // especificado no existe" (mensaje tal cual del backend).
            setErrorFormulario(mensajeError(error, "No se pudo guardar el producto. Intenta nuevamente."));
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar(producto: Producto) {
        const confirmado = window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        setErrorAccion(null);
        setEliminandoId(producto.id);
        try {
            await protectedApi(`/productos/${producto.id}`, { method: "DELETE" });
            await recargarProductos();
        } catch (error) {
            setErrorAccion(mensajeError(error, "No se pudo eliminar el producto. Intenta nuevamente."));
        } finally {
            setEliminandoId(null);
        }
    }

    const sinArtesanos = estado === "listo" && artesanos.length === 0;

    return (
        <section className={styles.section}>
            <div className={styles.toolbar}>
                <h2>Productos</h2>
                <button
                    type="button"
                    className={styles.nuevo}
                    disabled={sinArtesanos}
                    title={sinArtesanos ? "Primero crea un artesano" : undefined}
                    onClick={() => {
                        setErrorAccion(null);
                        setFormulario({ tipo: "crear" });
                    }}
                >
                    + Nuevo producto
                </button>
            </div>

            {errorAccion && (
                <p className={styles.error} role="alert">
                    {errorAccion}
                </p>
            )}

            {estado === "cargando" && <p className={styles.status}>Cargando productos…</p>}

            {estado === "error" && (
                <p className={styles.status} role="alert">
                    {errorCarga}
                </p>
            )}

            {estado === "listo" && productos.length === 0 && (
                <p className={styles.status}>No hay productos registrados todavía.</p>
            )}

            {estado === "listo" && productos.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Artesano</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((producto) => (
                                <tr key={producto.id}>
                                    <td data-label="Imagen">
                                        <Imagen
                                            src={producto.imagen_url_firmada}
                                            alt={`Imagen de ${producto.nombre}`}
                                            className={styles.miniatura}
                                        />
                                    </td>
                                    <td data-label="Nombre">{producto.nombre}</td>
                                    <td data-label="Artesano">{artesanoPorId.get(String(producto.artesano_id))?.nombre ?? "—"}</td>
                                    <td data-label="Categoría">{producto.categoria || "—"}</td>
                                    <td data-label="Precio">{formatPrecioCLP(producto.precio)}</td>
                                    <td data-label="Acciones">
                                        <div className={styles.acciones}>
                                            <button
                                                type="button"
                                                className={styles.editar}
                                                onClick={() => {
                                                    setErrorAccion(null);
                                                    setFormulario({ tipo: "editar", producto });
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.eliminar}
                                                disabled={eliminandoId === producto.id}
                                                onClick={() => handleEliminar(producto)}
                                            >
                                                {eliminandoId === producto.id ? "Eliminando…" : "Eliminar"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {formulario && (
                <ProductoForm
                    key={formulario.tipo === "editar" ? formulario.producto.id : "nuevo"}
                    producto={formulario.tipo === "editar" ? formulario.producto : null}
                    artesanos={artesanos}
                    cargandoArtesanos={estado === "cargando"}
                    guardando={guardando}
                    error={errorFormulario}
                    onCancelar={() => setFormulario(null)}
                    onGuardar={handleGuardar}
                />
            )}
        </section>
    );
}
