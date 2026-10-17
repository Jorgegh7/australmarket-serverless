import { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import { useProtectedApi } from "../../auth/useProtectedApi";
import type { Artesano, ArtesanoInput } from "../../types/artesano";
import ArtesanoForm from "./ArtesanoForm";
import Imagen from "../../components/Imagen";
import styles from "./GestionArtesanos.module.css";

type Estado = "cargando" | "error" | "listo";
type ModoFormulario = { tipo: "crear" } | { tipo: "editar"; artesano: Artesano } | null;

function mensajeError(error: unknown, fallback: string): string {
    return error instanceof ApiError ? error.message : fallback;
}

export default function GestionArtesanos() {
    const protectedApi = useProtectedApi();

    const [artesanos, setArtesanos] = useState<Artesano[]>([]);
    const [estado, setEstado] = useState<Estado>("cargando");
    const [errorCarga, setErrorCarga] = useState<string | null>(null);

    const [formulario, setFormulario] = useState<ModoFormulario>(null);
    const [guardando, setGuardando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

    const [eliminandoId, setEliminandoId] = useState<string | null>(null);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    // Carga inicial al montar la sección.
    useEffect(() => {
        let cancelado = false;

        async function cargarInicial() {
            setEstado("cargando");
            setErrorCarga(null);
            try {
                const data = await protectedApi<Artesano[]>("/artesanos");
                if (cancelado) return;
                setArtesanos(data);
                setEstado("listo");
            } catch (error) {
                if (cancelado) return;
                setErrorCarga(mensajeError(error, "No se pudo cargar la lista de artesanos."));
                setEstado("error");
            }
        }

        cargarInicial();
        return () => {
            cancelado = true;
        };
    }, [protectedApi]);

    // Recarga manual tras crear/editar/eliminar (no corre dentro de un efecto).
    async function recargar() {
        setEstado("cargando");
        setErrorCarga(null);
        try {
            const data = await protectedApi<Artesano[]>("/artesanos");
            setArtesanos(data);
            setEstado("listo");
        } catch (error) {
            setErrorCarga(mensajeError(error, "No se pudo cargar la lista de artesanos."));
            setEstado("error");
        }
    }

    async function handleGuardar(input: ArtesanoInput) {
        if (!formulario) return;
        setGuardando(true);
        setErrorFormulario(null);
        try {
            if (formulario.tipo === "crear") {
                await protectedApi("/artesanos", { method: "POST", body: input });
            } else {
                await protectedApi(`/artesanos/${formulario.artesano.id}`, { method: "PUT", body: input });
            }
            setFormulario(null);
            await recargar();
        } catch (error) {
            setErrorFormulario(mensajeError(error, "No se pudo guardar el artesano. Intenta nuevamente."));
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar(artesano: Artesano) {
        const confirmado = window.confirm(
            `¿Eliminar a "${artesano.nombre}"? Esta acción no se puede deshacer.`,
        );
        if (!confirmado) return;

        setErrorAccion(null);
        setEliminandoId(artesano.id);
        try {
            await protectedApi(`/artesanos/${artesano.id}`, { method: "DELETE" });
            await recargar();
        } catch (error) {
            setErrorAccion(mensajeError(error, "No se pudo eliminar el artesano. Intenta nuevamente."));
        } finally {
            setEliminandoId(null);
        }
    }

    return (
        <section className={styles.section}>
            <div className={styles.toolbar}>
                <h2>Artesanos</h2>
                <button
                    type="button"
                    className={styles.nuevo}
                    onClick={() => {
                        setErrorAccion(null);
                        setFormulario({ tipo: "crear" });
                    }}
                >
                    + Nuevo artesano
                </button>
            </div>

            {errorAccion && (
                <p className={styles.error} role="alert">
                    {errorAccion}
                </p>
            )}

            {estado === "cargando" && <p className={styles.status}>Cargando artesanos…</p>}

            {estado === "error" && (
                <p className={styles.status} role="alert">
                    {errorCarga}
                </p>
            )}

            {estado === "listo" && artesanos.length === 0 && (
                <p className={styles.status}>No hay artesanos registrados todavía.</p>
            )}

            {estado === "listo" && artesanos.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Región</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Red social</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artesanos.map((artesano) => (
                                <tr key={artesano.id}>
                                    <td>
                                        <Imagen
                                            src={artesano.foto_perfil_url_firmada}
                                            alt={`Foto de ${artesano.nombre}`}
                                            className={styles.miniatura}
                                        />
                                    </td>
                                    <td>{artesano.nombre}</td>
                                    <td>{artesano.region || "—"}</td>
                                    <td>{artesano.telefono || "—"}</td>
                                    <td>{artesano.mail || "—"}</td>
                                    <td>{artesano.red_social || "—"}</td>
                                    <td>
                                        <div className={styles.acciones}>
                                            <button
                                                type="button"
                                                className={styles.editar}
                                                onClick={() => {
                                                    setErrorAccion(null);
                                                    setFormulario({ tipo: "editar", artesano });
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.eliminar}
                                                disabled={eliminandoId === artesano.id}
                                                onClick={() => handleEliminar(artesano)}
                                            >
                                                {eliminandoId === artesano.id ? "Eliminando…" : "Eliminar"}
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
                <ArtesanoForm
                    key={formulario.tipo === "editar" ? formulario.artesano.id : "nuevo"}
                    artesano={formulario.tipo === "editar" ? formulario.artesano : null}
                    guardando={guardando}
                    error={errorFormulario}
                    onCancelar={() => setFormulario(null)}
                    onGuardar={handleGuardar}
                />
            )}
        </section>
    );
}
