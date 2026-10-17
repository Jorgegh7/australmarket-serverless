import Modal from "./Modal";
import styles from "./ContactoModal.module.css";

interface ContactoModalProps {
    artesanoNombre: string;
    productoNombre: string;
    onCancelar: () => void;
    onContinuar: () => void;
}

// Confirmación previa a abrir WhatsApp para contactar al artesano.
export default function ContactoModal({ artesanoNombre, productoNombre, onCancelar, onContinuar }: ContactoModalProps) {
    return (
        <Modal titulo="Contactar al artesano" onCerrar={onCancelar}>
            <p className={styles.texto}>
                Vas a contactar a {artesanoNombre} por WhatsApp. Se abrirá WhatsApp con un mensaje sobre «
                {productoNombre}».
            </p>
            <div className={styles.actions}>
                <button type="button" className={styles.cancelar} onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="button" className={styles.continuar} onClick={onContinuar}>
                    Continuar a WhatsApp
                </button>
            </div>
        </Modal>
    );
}
