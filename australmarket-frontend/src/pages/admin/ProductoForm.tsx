import { useState, type FormEvent } from "react";
import styles from "./ProductoForm.module.css";
import type { Producto, ProductoInput } from "../../types/producto";
import type { Artesano } from "../../types/artesano";
import Modal from "../../components/Modal";

interface ProductoFormProps {
    producto: Producto | null;
    artesanos: Artesano[];
    cargandoArtesanos: boolean;
    guardando: boolean;
    error: string | null;
    onCancelar: () => void;
    onGuardar: (input: ProductoInput) => void;
}

// El precio viaja como string (igual que lo devuelve el backend); el campo
// es type="number" para la UX, pero el valor se guarda tal cual lo escribe
// el usuario y así se envía.
interface FormState {
    artesano_id: string;
    nombre: string;
    historia: string;
    imagen_url: string;
    precio: string;
    categoria: string;
}

const VACIO: FormState = {
    artesano_id: "",
    nombre: "",
    historia: "",
    imagen_url: "",
    precio: "",
    categoria: "",
};

export default function ProductoForm({
    producto,
    artesanos,
    cargandoArtesanos,
    guardando,
    error,
    onCancelar,
    onGuardar,
}: ProductoFormProps) {
    const [valores, setValores] = useState<FormState>(
        producto
            ? {
                  artesano_id: String(producto.artesano_id),
                  nombre: producto.nombre,
                  historia: producto.historia,
                  imagen_url: producto.imagen_url,
                  precio: String(Number.parseFloat(producto.precio)),
                  categoria: producto.categoria,
              }
            : VACIO,
    );

    function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
        setValores((actual) => ({ ...actual, [campo]: valor }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onGuardar({
            // artesano_id es un uuid: se manda tal cual, nunca por Number().
            artesano_id: valores.artesano_id,
            nombre: valores.nombre,
            historia: valores.historia,
            imagen_url: valores.imagen_url,
            precio: valores.precio,
            categoria: valores.categoria,
        });
    }

    return (
        <Modal titulo={producto ? "Editar producto" : "Nuevo producto"} onCerrar={onCancelar}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="artesano_id">Artesano *</label>
                    <select
                        id="artesano_id"
                        value={valores.artesano_id}
                        onChange={(event) => actualizar("artesano_id", event.target.value)}
                        disabled={cargandoArtesanos}
                        required
                    >
                        <option value="">
                            {cargandoArtesanos ? "Cargando artesanos…" : "Selecciona un artesano"}
                        </option>
                        {artesanos.map((artesano) => (
                            <option key={artesano.id} value={artesano.id}>
                                {artesano.nombre}
                            </option>
                        ))}
                    </select>
                </div>

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
                    <label htmlFor="categoria">Categoría *</label>
                    <input
                        id="categoria"
                        value={valores.categoria}
                        onChange={(event) => actualizar("categoria", event.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="precio">Precio (CLP) *</label>
                    <input
                        id="precio"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={valores.precio}
                        onChange={(event) => actualizar("precio", event.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="imagen_url">URL de imagen</label>
                    <input
                        id="imagen_url"
                        value={valores.imagen_url}
                        onChange={(event) => actualizar("imagen_url", event.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="historia">Historia</label>
                    <textarea
                        id="historia"
                        rows={4}
                        value={valores.historia}
                        onChange={(event) => actualizar("historia", event.target.value)}
                    />
                </div>

                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelar} onClick={onCancelar} disabled={guardando}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.guardar} disabled={guardando}>
                        {guardando ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
