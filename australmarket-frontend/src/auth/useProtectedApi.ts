import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, callApi, type ApiMethod } from "../api/client";
import { useAuth } from "./useAuth";

interface ProtectedCallOptions {
    method?: ApiMethod;
    body?: unknown;
}

// Envuelve callApi agregando el IdToken de la sesión. Si la API responde
// 401 (token vencido, dura 1 hora), cierra la sesión y redirige a /login.
export function useProtectedApi() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    return useCallback(
        async <T,>(path: string, options: ProtectedCallOptions = {}): Promise<T> => {
            try {
                return await callApi<T>(path, { ...options, token: token ?? undefined });
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    logout();
                    navigate("/login", { replace: true });
                }
                throw error;
            }
        },
        [token, logout, navigate],
    );
}
