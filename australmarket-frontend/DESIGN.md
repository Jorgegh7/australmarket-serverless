# Sistema de diseño AustralMarket

Principios: plano (sin sombras, sin degradados), editorial, naturalista. Todo se comunica con color, tipografía y espacio.

## Colores
Tokens en `src/styles/tokens.css`.

| Token | Valor | Uso |
|---|---|---|
| `--color-lienzo` | #fcfcf7 | Fondo base (nunca blanco puro) |
| `--color-piedra` | #eeeee9 | Superficies secundarias, tarjetas sobre lienzo |
| `--color-bosque` | #1c3a13 | CTA primario, secciones oscuras, texto principal |
| `--color-lima` | #d3fa99 | SOLO badges pequeños, nunca áreas grandes |
| `--color-musgo` | #757c5d | Acento (decorativo, texto grande) |
| `--color-oliva` | #9f995b | Acento |
| `--color-eucalipto` | #698e79 | Acento |
| `--color-escarcha` | #c4c7c4 | Bordes |
| `--color-ceniza` | #b3b3b3 | Solo decorativo (no texto) |
| `--color-peltre` | #666666 | Texto secundario / terciario |
| `--color-tinta` | #000000 | Reservado |
| `--color-error` | #a4492f | Solo errores y acciones destructivas |

No usar ningún otro color saturado.

Contraste (AA): el texto secundario sobre lienzo/piedra usa `peltre` (5.6:1). `musgo`, `oliva`, `eucalipto` y `ceniza` NO se usan para texto pequeño; `ceniza` nunca va como texto sobre lienzo. Sobre bosque: texto `lienzo`, secundario `escarcha`.

## Tipografía
- Display (h1/h2 grandes): Fraunces, peso 300, tracking -0.02em en >=24px (h1 48px: -0.72px).
- Resto: Inter 300/400/500. Prohibido peso 600+ en títulos.
- Etiquetas de categoría/región/códigos: JetBrains Mono (`@fontsource/jetbrains-mono`), 12px, mayúsculas, en píldora con borde.
- Escala: 10, 12, 14, 16, 20, 24, 32, 48px.

## Espaciado y forma
- Base 8px: 8, 16, 24, 32, 48, 64, 96, 128 (`--espacio-1` … `--espacio-8`).
- Contenedor máx 1200px. Separación entre secciones 64px.
- Radios: botones y badges 1000px, tarjetas 16px, tarjetas grandes 32px, inputs 8px, imágenes dentro de tarjetas 12px.

## Componentes
Los botones y enlaces compartidos viven en `src/styles/botones.module.css` y se reutilizan con `composes`.
- Botón primario: relleno bosque, texto lienzo, píldora. Secundario: contorno bosque 1px, transparente. Invertido (sobre sección oscura): relleno lienzo, texto bosque. Altura mínima 44px.
- Link de texto con flecha →.
- Badge: píldora lima con texto bosque. Etiqueta mono: píldora con borde escarcha.
- Tarjeta de producto: fondo piedra, radio 16px, padding 16px, imagen arriba con radio 12px, sin sombra; hover = borde bosque, sin elevación.
- Grid de catálogo: 4 columnas, gap 16px; 3 en <1100px, 2 en <720px, 1 en <420px.
- Input: borde escarcha 1px, radio 8px, foco borde bosque 2px sin glow.
- Navbar sticky, alto 64px, fondo lienzo, borde inferior escarcha 1px.
- Secciones a todo el ancho que alternan lienzo / bosque. Sobre bosque: texto lienzo y botón invertido.
- Iconos: líneas finas (stroke 1.5px).
- Imágenes: naturalistas; el hero lleva un velo bosque sólido `rgba(28,58,19,0.45)`, sin degradado.
- Modales: radio 32px, sin sombra, overlay `rgba(28,58,19,0.6)`.
- Tablas admin: filas separadas por borde escarcha; bajo 720px cada fila se vuelve tarjeta apilada (`data-label`).

## Accesibilidad
Sin scroll horizontal a 375, 768 y 1280px; objetivos táctiles >= 44px; foco visible en todo elemento interactivo; imágenes con `alt`.
