export type TipoImagen = "producto" | "artesano";

export const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

interface RespuestaUrlSubida {
    url_subida: string;
    clave: string;
    content_type: string;
    expira_en_segundos: number;
}

// Mismo contrato que useProtectedApi (el llamador pasa la función ya ligada
// al token de la sesión).
type ProtectedApi = <T>(path: string, options?: { method?: "POST"; body?: unknown }) => Promise<T>;

// Valida tipo y tamaño en el cliente. Devuelve el mensaje de error o null.
export function validarImagen(archivo: File): string | null {
    if (!(TIPOS_IMAGEN_PERMITIDOS as readonly string[]).includes(archivo.type)) {
        return "Formato no permitido. Usa una imagen JPG, PNG o WebP.";
    }
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
        return "La imagen supera el máximo de 5 MB.";
    }
    return null;
}

// Sube la imagen a S3 en dos pasos y devuelve la `clave` (nunca la URL firmada):
// 1. Pide una URL de subida a la API (ruta protegida, con token).
// 2. Hace PUT del archivo directo a S3. Este PUT NO lleva Authorization ni
//    pasa por callApi: la URL firmada ya trae la autorización en el query string.
export async function subirImagen(
    protectedApi: ProtectedApi,
    tipo: TipoImagen,
    archivo: File,
): Promise<string> {
    const { url_subida, clave } = await protectedApi<RespuestaUrlSubida>("/admin/imagenes/url-subida", {
        method: "POST",
        body: { tipo, content_type: archivo.type },
    });

    let respuesta: Response;
    try {
        respuesta = await fetch(url_subida, {
            method: "PUT",
            headers: { "Content-Type": archivo.type },
            body: archivo,
        });
    } catch {
        throw new Error("No se pudo subir la imagen. Revisa tu conexión e intenta nuevamente.");
    }

    if (!respuesta.ok) {
        throw new Error(`No se pudo subir la imagen (error ${respuesta.status}). Intenta nuevamente.`);
    }

    return clave;
}
