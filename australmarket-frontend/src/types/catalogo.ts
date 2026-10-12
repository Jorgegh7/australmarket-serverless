// Formas públicas (sin autenticación) devueltas por /catalogo/*.
// No incluyen telefono ni mail del artesano: el backend no los expone acá
// a propósito.
// id / artesano_id son uuid en la base (ver db/schema.sql), NO numéricos:
// nunca pasarlos por Number().
export interface ArtesanoPublico {
    id: string;
    nombre: string;
    historia: string;
    region: string;
    foto_perfil_url: string;
}

export interface ProductoPublico {
    id: string;
    artesano_id: string;
    nombre: string;
    historia: string;
    imagen_url: string;
    precio: string;
    categoria: string;
}
