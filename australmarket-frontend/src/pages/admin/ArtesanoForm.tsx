import { useMemo, useState, type FormEvent } from "react";
import styles from "./ArtesanoForm.module.css";
import type { Artesano, ArtesanoInput } from "../../types/artesano";
import { REGIONES_CHILE } from "../../constants/regiones";
import Modal from "../../components/Modal";
import ImagenUploader from "../../components/ImagenUploader";
import { subirImagen } from "../../api/imagenes";
import { useProtectedApi } from "../../auth/useProtectedApi";

interface ArtesanoFormProps {
    artesano: Artesano | null;
    guardando: boolean;
    error: string | null;
    onCancelar: () => void;
    onGuardar: (input: ArtesanoInput) => void;
}

const VACIO: ArtesanoInput = {
    nombre: "",
    historia: "",
    region: "",
    foto_perfil_url: "",
    telefono: "",
    red_social: "",
    mail: "",
};

export default function ArtesanoForm({ artesano, guardando, error, onCancelar, onGuardar }: ArtesanoFormProps) {
    const [valores, setValores] = useState<ArtesanoInput>(
        artesano
            ? {
                  nombre: artesano.nombre,
                  historia: artesano.historia,
                  region: artesano.region,
                  foto_perfil_url: artesano.foto_perfil_url,
                  telefono: artesano.telefono,
                  red_social: artesano.red_social,
                  mail: artesano.mail,
              }
            : VACIO,
    );

    // Si el artesano ya tiene una región guardada que no está en la lista
    // oficial (dato viejo, typo, etc.), se agrega igual como opción para no
    // perderla al editar.
    const opcionesRegion = useMemo(() => {
        const regionActual = artesano?.region;
        if (regionActual && !(REGIONES_CHILE as readonly string[]).includes(regionActual)) {
            return [regionActual, ...REGIONES_CHILE];
        }
        return REGIONES_CHILE;
    }, [artesano]);

    const protectedApi = useProtectedApi();
    const [archivo, setArchivo] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [errorSubida, setErrorSubida] = useState<string | null>(null);

    function actualizar<K extends keyof ArtesanoInput>(campo: K, valor: ArtesanoInput[K]) {
        setValores((actual) => ({ ...actual, [campo]: valor }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorSubida(null);

        // La imagen se sube al guardar (no al seleccionar) para no dejar
        // archivos huérfanos si el usuario cancela. Si falla, no se guarda.
        // Sin archivo nuevo se conserva el valor actual (clave o vacío).
        let fotoPerfil = valores.foto_perfil_url;
        if (archivo) {
            setSubiendo(true);
            try {
                fotoPerfil = await subirImagen(protectedApi, "artesano", archivo);
            } catch (e) {
                setErrorSubida(e instanceof Error ? e.message : "No se pudo subir la imagen.");
                return;
            } finally {
                setSubiendo(false);
            }
        }

        onGuardar({ ...valores, foto_perfil_url: fotoPerfil });
    }

    const ocupado = guardando || subiendo;

    return (
        <Modal titulo={artesano ? "Editar artesano" : "Nuevo artesano"} onCerrar={onCancelar}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        value={valores.nombre}
                        onChange={(event) => actualizar("nombre", event.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                        id="telefono"
                        value={valores.telefono}
                        onChange={(event) => actualizar("telefono", event.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="region">Región</label>
                    <select
                        id="region"
                        value={valores.region}
                        onChange={(event) => actualizar("region", event.target.value)}
                    >
                        <option value="">Selecciona una región</option>
                        {opcionesRegion.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="mail">Correo electrónico</label>
                    <input
                        id="mail"
                        type="email"
                        value={valores.mail}
                        onChange={(event) => actualizar("mail", event.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="red_social">Red social</label>
                    <input
                        id="red_social"
                        value={valores.red_social}
                        onChange={(event) => actualizar("red_social", event.target.value)}
                    />
                </div>

                <ImagenUploader
                    id="foto_perfil_url"
                    label="Foto de perfil"
                    valorActual={valores.foto_perfil_url}
                    urlActual={artesano?.foto_perfil_url_firmada}
                    archivo={archivo}
                    subiendo={subiendo}
                    disabled={ocupado}
                    onSeleccionar={setArchivo}
                    onQuitar={() => {
                        setArchivo(null);
                        actualizar("foto_perfil_url", "");
                    }}
                />

                <div className={styles.field}>
                    <label htmlFor="historia">Historia</label>
                    <textarea
                        id="historia"
                        rows={4}
                        value={valores.historia}
                        onChange={(event) => actualizar("historia", event.target.value)}
                    />
                </div>

                {(errorSubida ?? error) && (
                    <p className={styles.error} role="alert">
                        {errorSubida ?? error}
                    </p>
                )}

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelar} onClick={onCancelar} disabled={ocupado}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.guardar} disabled={ocupado}>
                        {subiendo ? "Subiendo imagen..." : guardando ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
