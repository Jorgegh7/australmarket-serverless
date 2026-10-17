// Forma protegida de /artesanos (incluye telefono, red_social y mail, que
// el catálogo público no expone).
// id es uuid en la base (ver db/schema.sql), no numérico.
export interface Artesano {
    id: string;
    nombre: string;
    historia: string;
    region: string;
    foto_perfil_url: string;
    // URL temporal solo para mostrar; al guardar se envía la clave (foto_perfil_url).
    foto_perfil_url_firmada?: string | null;
    telefono: string;
    red_social: string;
    mail: string;
}

export type ArtesanoInput = Omit<Artesano, "id" | "foto_perfil_url_firmada">;
