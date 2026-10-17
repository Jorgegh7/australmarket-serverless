// Forma de GET /catalogo/productos/{id} (ruta pública). A diferencia del
// listado, anida al artesano e incluye su teléfono. Las imágenes son URLs
// firmadas temporales solo para mostrar (null si no hay imagen).
export interface ArtesanoDetalle {
    id: string;
    nombre: string;
    historia: string;
    region: string;
    foto_perfil_url: string | null;
    telefono: string;
}

export interface ProductoDetalle {
    id: string;
    nombre: string;
    historia: string;
    precio: string;
    categoria: string;
    imagen_url: string | null;
    artesano: ArtesanoDetalle;
}
