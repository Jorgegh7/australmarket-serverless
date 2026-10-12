import { useEffect, type ReactNode } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
    titulo: string;
    onCerrar: () => void;
    children: ReactNode;
}

// Overlay + diálogo reutilizable para los formularios de alta/edición del
// panel admin (artesanos, productos). Cierra con Escape o clic fuera del
// contenido.
export default function Modal({ titulo, onCerrar, children }: ModalProps) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onCerrar();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onCerrar]);

    return (
        <div className={styles.overlay} onMouseDown={onCerrar}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={titulo}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <h2>{titulo}</h2>
                {children}
            </div>
        </div>
    );
}
