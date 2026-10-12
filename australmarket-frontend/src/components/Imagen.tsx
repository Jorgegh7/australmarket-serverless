import { useState } from "react";
import styles from "./Imagen.module.css";

interface ImagenProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
}

// imagen_url y foto_perfil_url son hoy texto libre y pueden no apuntar a
// nada accesible (pendiente: URLs firmadas de S3 en el backend). Mientras
// el valor no sea una URL http(s), o si falla la carga, se muestra un
// placeholder. No necesita cambios cuando el backend entregue URLs firmadas.
export default function Imagen({ src, alt, className }: ImagenProps) {
    const [fallo, setFallo] = useState(false);
    // Si cambia la URL (ej. al reusar el mismo componente en una lista),
    // se reintenta la carga: se ajusta el estado durante el render en vez
    // de con un efecto, siguiendo el patrón recomendado por React para
    // derivar estado a partir de un prop que cambió.
    const [srcAnterior, setSrcAnterior] = useState(src);
    if (src !== srcAnterior) {
        setSrcAnterior(src);
        setFallo(false);
    }

    const esUrlValida = typeof src === "string" && /^https?:\/\//i.test(src);

    if (!esUrlValida || fallo) {
        return (
            <div
                className={[styles.placeholder, className].filter(Boolean).join(" ")}
                role="img"
                aria-label={alt}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
                    <path
                        fill="currentColor"
                        d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5Z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setFallo(true)}
        />
    );
}
