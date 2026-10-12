// Forma protegida de /artesanos (incluye telefono, red_social y mail, que
// el catálogo público no expone).
// id es uuid en la base (ver db/schema.sql), no numérico.
export interface Artesano {
    id: string;
    nombre: string;
    historia: string;
    region: string;
    foto_perfil_url: string;
    telefono: string;
    red_social: string;
    mail: string;
}

export type ArtesanoInput = Omit<Artesano, "id">;
