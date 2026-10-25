import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import styles from "./Login.module.css";

interface LocationState {
    from?: { pathname: string };
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            const state = location.state as LocationState | null;
            navigate(state?.from?.pathname ?? "/admin", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Iniciar sesión</h1>
                <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.field}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            placeholder="admin@australmarket.cl"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Contraseña</label>
                        <div className={styles.passwordRow}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.toggleVisibility}
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" className={styles.submit} disabled={loading}>
                        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
                    </button>
                </form>

                <Link to="/" className={styles.backLink}>
                    Volver al catálogo
                </Link>
            </div>
        </div>
    );
}
