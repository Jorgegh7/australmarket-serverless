import styles from "./Logo.module.css";

interface LogoProps {
    /** Variante clara (lienzo), para fondos bosque (footer). */
    claro?: boolean;
    className?: string;
}

// Ícono de montaña con cumbre nevada + wordmark en Fraunces. SVG inline, sin
// dependencias externas. Bosque sobre lienzo; lienzo sobre bosque (claro).
// El ícono es decorativo: el texto ya nombra la marca.
export default function Logo({ claro = false, className }: LogoProps) {
    return (
        <span className={[styles.logo, claro ? styles.claro : "", className].filter(Boolean).join(" ")}>
            <svg viewBox="0 0 40 40" className={styles.icono} aria-hidden="true" focusable="false">
                <path d="M17 32l11-15 10 15z" className={styles.cuerpo} opacity="0.7" />
                <path d="M4 32L18 8l14 24z" className={styles.cuerpo} />
                <path d="M18 8l4.55 7.8L20 14.2l-2 2.3-2.5-2.2-2.05 1.5z" className={styles.cumbre} />
                <path d="M28 17l3.3 5.3-1.8-1.3-1.5 2-1.5-2-1.8 1.3z" className={styles.cumbre} />
            </svg>
            <span className={styles.texto}>AustralMarket</span>
        </span>
    );
}
