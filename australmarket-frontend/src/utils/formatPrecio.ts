// El backend entrega "precio" como string (ej. "12990.000000"). Lo
// convertimos a número y lo formateamos como peso chileno (ej. "$12.990").
export function formatPrecioCLP(precio: string | number): string {
    const valor = typeof precio === "number" ? precio : Number.parseFloat(precio);

    if (!Number.isFinite(valor)) {
        return "Precio no disponible";
    }

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(valor);
}
