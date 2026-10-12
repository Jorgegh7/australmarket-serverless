import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { decodeIdToken, isExpired, type IdTokenClaims } from "./jwt";
import { AuthContext, type AuthContextValue } from "./context";

const REGION = import.meta.env.VITE_COGNITO_REGION;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

// El IdToken vive solo en esta pestaña: se pierde al cerrarla y nunca se
// escribe en localStorage ni en logs.
const TOKEN_STORAGE_KEY = "am_id_token";
const ADMIN_GROUP = "admin";

interface Session {
    token: string;
    claims: IdTokenClaims;
}

function readStoredSession(): Session | null {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;

    const claims = decodeIdToken(token);
    if (!claims || isExpired(claims)) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }

    return { token, claims };
}

// Traduce las excepciones de Cognito a mensajes en español para el formulario.
function loginErrorMessage(error: unknown): string {
    const name = error instanceof Error ? error.name : "";
    switch (name) {
        case "NotAuthorizedException":
        case "UserNotFoundException":
            return "Correo o contraseña incorrectos.";
        case "UserNotConfirmedException":
            return "La cuenta todavía no está confirmada.";
        default:
            return "No se pudo iniciar sesión. Intenta nuevamente.";
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => readStoredSession());

    const login = useCallback(async (email: string, password: string) => {
        const client = new CognitoIdentityProviderClient({ region: REGION });

        let result;
        try {
            result = await client.send(
                new InitiateAuthCommand({
                    AuthFlow: "USER_PASSWORD_AUTH",
                    ClientId: USER_POOL_CLIENT_ID,
                    AuthParameters: { USERNAME: email, PASSWORD: password },
                }),
            );
        } catch (error) {
            throw new Error(loginErrorMessage(error));
        }

        const idToken = result.AuthenticationResult?.IdToken;
        const claims = idToken ? decodeIdToken(idToken) : null;
        if (!idToken || !claims) {
            throw new Error("No se pudo iniciar sesión. Intenta nuevamente.");
        }

        sessionStorage.setItem(TOKEN_STORAGE_KEY, idToken);
        setSession({ token: idToken, claims });
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setSession(null);
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        const groups = session?.claims["cognito:groups"] ?? [];
        return {
            token: session?.token ?? null,
            isAuthenticated: session !== null,
            isAdmin: groups.includes(ADMIN_GROUP),
            login,
            logout,
        };
    }, [session, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
