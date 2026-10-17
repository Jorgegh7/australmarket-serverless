import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Imagen from "./Imagen";
import { TIPOS_IMAGEN_PERMITIDOS, validarImagen } from "../api/imagenes";
import styles from "./ImagenUploader.module.css";

interface ImagenUploaderProps {
    id: string;
    label: string;
    /** Valor guardado (clave de S3). Es opaco: nunca se usa como src de <img>. */
    valorActual: string;
    /** URL firmada temporal de la imagen actual, solo para mostrarla. */
    urlActual?: string | null;
    archivo: File | null;
    subiendo: boolean;
    disabled?: boolean;
    onSeleccionar: (archivo: File) => void;
    onQuitar: () => void;
}

export default function ImagenUploader({
    id,
    label,
    valorActual,
    urlActual,
    archivo,
    subiendo,
    disabled = false,
    onSeleccionar,
    onQuitar,
}: ImagenUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

    // La URL de vista previa se crea al elegir el archivo (en el evento, no en
    // un efecto) y se libera al reemplazarla, al quitarla y al desmontar.
    const urlRef = useRef<string | null>(null);

    function liberarVistaPrevia() {
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
        setVistaPrevia(null);
    }

    useEffect(() => {
        return () => {
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        };
    }, []);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const elegido = event.target.files?.[0];
        // Se limpia el input para poder volver a elegir el mismo archivo.
        event.target.value = "";
        if (!elegido) return;

        const error = validarImagen(elegido);
        setErrorValidacion(error);
        if (error) return;

        liberarVistaPrevia();
        urlRef.current = URL.createObjectURL(elegido);
        setVistaPrevia(urlRef.current);
        onSeleccionar(elegido);
    }

    function handleQuitar() {
        setErrorValidacion(null);
        liberarVistaPrevia();
        if (inputRef.current) inputRef.current.value = "";
        onQuitar();
    }

    const previewVisible = archivo ? vistaPrevia : null;
    const hayImagen = archivo !== null || valorActual !== "";

    // Si se quitó la imagen (valorActual vacío) no se muestra la anterior.
    const mostrarActual = !previewVisible && valorActual !== "";

    return (
        <div className={styles.uploader}>
            <span className={styles.label}>{label}</span>

            {previewVisible && <img src={previewVisible} alt="Vista previa de la imagen seleccionada" className={styles.preview} />}

            {mostrarActual && <Imagen src={urlActual} alt="Imagen actual" className={styles.preview} />}

            <input
                ref={inputRef}
                id={id}
                type="file"
                className={styles.inputOculto}
                accept={TIPOS_IMAGEN_PERMITIDOS.join(",")}
                onChange={handleChange}
                disabled={disabled}
            />
            <div className={styles.botones}>
                <button
                    type="button"
                    className={styles.elegir}
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    aria-label={`${hayImagen ? "Cambiar imagen" : "Seleccionar archivo"}: ${label}`}
                >
                    {hayImagen ? "Cambiar imagen" : "Seleccionar archivo"}
                </button>
                {hayImagen && (
                    <button type="button" className={styles.quitar} onClick={handleQuitar} disabled={disabled}>
                        Quitar imagen
                    </button>
                )}
            </div>
            <p className={styles.ayuda}>JPG, PNG o WebP. Máximo 5 MB.</p>

            {subiendo && (
                <p className={styles.subiendo} role="status">
                    Subiendo imagen...
                </p>
            )}

            {errorValidacion && (
                <p className={styles.error} role="alert">
                    {errorValidacion}
                </p>
            )}

        </div>
    );
}
