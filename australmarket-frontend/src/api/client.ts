const API_URL = import.meta.env.VITE_API_URL;

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface CallApiOptions {
    method?: ApiMethod;
    body?: unknown;
    /** IdToken de Cognito. Se envía tal cual en el header Authorization, SIN prefijo "Bearer". */
    token?: string;
}

// Error de la API: conserva el status HTTP para que el llamador pueda
// distinguir, por ejemplo, un 401 (sesión expirada -> redirigir a /login) de
// un 400 (error de validación -> mostrar el mensaje en el formulario).
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

function extractMessage(data: unknown, status: number): string {
    if (data && typeof data === "object") {
        // El backend no es consistente: algunas Lambdas devuelven "mensaje"
        // (español) y el API Gateway/authorizer devuelve "message" (inglés).
        const record = data as Record<string, unknown>;
        if (typeof record.mensaje === "string") return record.mensaje;
        if (typeof record.message === "string") return record.message;
    }
    return `Error ${status} al conectar con la API.`;
}

// Cliente centralizado de la API.
// - token ausente: rutas públicas (catálogo, detalle de producto)
// - token presente: rutas protegidas por el Cognito Authorizer (header
//   Authorization con el IdToken, SIN prefijo "Bearer")
// Si la respuesta no es 2xx, lanza ApiError. Un 401 significa sesión
// vencida (el token dura 1 hora): el llamador debe cerrar sesión y
// redirigir a /login.
export async function callApi<T = unknown>(path: string, options: CallApiOptions = {}): Promise<T> {
    const { method = "GET", body, token } = options;

    const headers: HeadersInit = {};
    if (token) headers.Authorization = token;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, extractMessage(data, response.status));
    }

    return data as T;
}
