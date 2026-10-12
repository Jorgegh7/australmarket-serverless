import { useEffect } from "react";
import { callApi } from "../api/client";

export default function Catalogo() {
    // TECNICA DE PRUEBA RAPIDA (descomentar temporalmente para verificar
    // que una ruta de la API responde bien, sin necesidad de construir
    // ninguna pantalla real). Verificado funcionando: 08-sep-2026.
    //
    useEffect(() => {
        callApi("/admin-test").then((data) => console.log("Respuesta:", data));
    }, []);

    return <h1>Catálogo</h1>;
}