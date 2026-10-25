import Imagen from "./Imagen";
import MapaChile from "./MapaChile";
import Modal from "./Modal";
import styles from "./ArtesanoModal.module.css";

interface ArtesanoModalProps {
    nombre: string;
    region: string;
    historia: string;
    foto: string | null;
    onCerrar: () => void;
}

// Foto ampliada del artesano y ubicación aproximada (a nivel de región).
export default function ArtesanoModal({ nombre, region, historia, foto, onCerrar }: ArtesanoModalProps) {
    return (
        <Modal titulo={nombre} onCerrar={onCerrar}>
            <div className={styles.contenido}>
                <Imagen src={foto} alt={nombre} className={styles.foto} />
                <div className={styles.ubicacion}>
                    <MapaChile region={region} />
                </div>
            </div>
            {historia && <p className={styles.historia}>{historia}</p>}
            <div className={styles.acciones}>
                <button type="button" className={styles.cerrar} onClick={onCerrar}>
                    Cerrar
                </button>
            </div>
        </Modal>
    );
}
