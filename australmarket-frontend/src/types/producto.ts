import type { ProductoPublico } from "./catalogo";

// La forma protegida de /productos (GET/POST/PUT) es la misma que la
// pública: agrega solo imagen_url_firmada.
export type Producto = ProductoPublico & {
    // URL temporal solo para mostrar la imagen; al guardar se envía la clave
    // (imagen_url), nunca esta.
    imagen_url_firmada?: string | null;
};
export type ProductoInput = Omit<Producto, "id" | "imagen_url_firmada">;
