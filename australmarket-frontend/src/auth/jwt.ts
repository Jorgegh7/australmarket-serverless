// Decodifica el payload de un JWT sin validar la firma. Se usa solo para leer
// claims no sensibles en el cliente (expiracion, grupos); la validacion real
// del token la hace el backend en cada peticion protegida.
export interface IdTokenClaims {
    sub: string;
    email?: string;
    exp: number;
    "cognito:groups"?: string[];
}

export function decodeIdToken(token: string): IdTokenClaims | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
        const json = new TextDecoder("utf-8").decode(bytes);

        return JSON.parse(json) as IdTokenClaims;
    } catch {
        return null;
    }
}

export function isExpired(claims: IdTokenClaims): boolean {
    return Date.now() >= claims.exp * 1000;
}
