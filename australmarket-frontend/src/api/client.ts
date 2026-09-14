const API_URL = import.meta.env.VITE_API_URL;

// Cliente centralizado de la API. El parametro "token" es opcional:
// - Sin token: para rutas publicas (ej. catalogo, detalle de producto)
// - Con token: para rutas protegidas por el Cognito Authorizer (ej. crear/editar)
//   Sin token en una ruta protegida, la API responde 401 Unauthorized —
//   comportamiento esperado, no un error (ver seguridad-australmarket.md)
export async function callApi(path: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = token;

    const response = await fetch(`${API_URL}${path}`, { headers });
    return response.json();
}