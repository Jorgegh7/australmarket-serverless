import type { ProductoPublico } from "./catalogo";

// La forma protegida de /productos (GET/POST/PUT) es la misma que la
// pública: no agrega campos nuevos, solo exige autenticación.
export type Producto = ProductoPublico;
export type ProductoInput = Omit<Producto, "id">;
