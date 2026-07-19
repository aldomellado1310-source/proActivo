# Navix

Software de gestión marítima: demo interactiva de auditoría de cumplimiento para
DIRECTEMAR — Región de Aysén. Registro de flota, clasificación de naves por TRG/AB,
certificados con alertas de vencimiento, control de insumos y preparación de revista de
cargo. Conecta datos, personas y territorio para navegar con inteligencia en los fiordos
de Aysén.

Es una demo **con datos mock** (sin backend): el motor de evaluación de reglas normativas
sí es real y corre en el navegador sobre datos de ejemplo, con persistencia local en
`localStorage`.

## Principio rector

Las reglas normativas son **datos**, no código. El catálogo en
[`src/data/catalogo-reglas.json`](src/data/catalogo-reglas.json) alimenta el motor de
evaluación ([`src/motor/`](src/motor)); cambiar una circular es editar ese documento, no
desplegar una versión nueva del sistema.

## Advertencia sobre reglas no verificadas

> Todas las reglas nacen con `estadoVerificacion='no_verificada'`. NO deben disparar
> alertas automáticas en producción hasta ser confirmadas con la Capitanía de Puerto o un
> experto de dominio. Los campos `vigenciaMeses` marcados con `'requiereConfirmacion': true`
> son estimaciones, no valores confirmados en fuente oficial.

(Texto tomado de `_meta.advertencia` en `catalogo-reglas.json`.)

En la práctica esto significa que una regla `no_verificada` **nunca** aparece en rojo o
ámbar: su estado siempre es `indeterminado` ("requiere confirmación"), sin importar la
fecha del certificado asociado. Solo 3 de las 15 reglas semilla están `verificada`, así que
la mayor parte de la flota muestra documentos en gris — es intencional: refleja el estado
real de verificación del catálogo, no un error.

## Stack

- Vite + React 18 + TypeScript, sin backend.
- `react-router-dom` para la navegación.
- CSS plano con custom properties (sin Tailwind) — ver `src/styles/`.
- Vitest para los tests del motor de evaluación.
- Persistencia demo: datos semilla en TypeScript (`src/data/seed.ts`, con fechas relativas
  a `new Date()`) + overlay en `localStorage` bajo la clave `navix-demo-v1`. El botón
  "Restablecer demo" del menú lateral borra el overlay y vuelve a los datos semilla.

## Diseño visual

Sigue el manual de marca de Navix. Paleta oficial (tokens en `src/styles/tokens.css`):

| Token | Hex | Uso |
| --- | --- | --- |
| Azul Naval (`--pa-navy`) | `#163B5C` | Header, texto de marca, superficies estructurales |
| Turquesa Austral (`--pa-accion`/`--pa-turquesa`) | `#278C8C` | Acciones, enlaces, estados activos |
| Ámbar Energía (`--pa-acento-marca`) | `#E29A45` | Acento de marca — nunca como color de estado |

El degradado oficial (Azul Naval → Turquesa Austral → Ámbar Energía, `--pa-degradado-acento`)
se reserva a momentos puntuales — la barra superior de la tarjeta de login — en vez de
repetirse por toda la interfaz.

Tipografía con dos roles, tal como define el manual:

- **Sora SemiBold** — exclusiva del logotipo/wordmark "Navix" (clase `.pa-logotipo` en
  `src/styles/base.css`). No se usa en ningún otro texto de la interfaz.
- **DM Sans** — todo lo demás: títulos de página, cuerpo, títulos de tarjeta. El manual la
  define como "tipografía corporativa complementaria" para títulos y textos de interfaz.
- **DM Mono** (extensión propia del producto, fuera del manual de marca) — datos tabulares:
  matrícula, TRG/AB, folios, fechas, días para vencer. Clase utilitaria `.pa-mono`.

El isologo (`IconoNavix` en `src/ui/components/iconos.tsx`) son dos picos superpuestos —
Azul Naval detrás, Turquesa Austral delante— que dejan un canal navegable entre ambos, con
una ola de Ámbar Energía en la base: la geografía de fiordos vista desde arriba, siguiendo
el concepto del manual de marca.

El fondo lleva una textura muy sutil de líneas de sonda náutica y las tarjetas un grano fino
(ambos en SVG inline, opacidad ≤0.06); el header y los botones primarios usan degradados de
varias paradas. Tokens en `src/styles/tokens.css`.

El motion sigue el criterio de Emil Kowalski (skill `emil-design-eng`,
[emilkowalski/skills](https://github.com/emilkowalski/skills)): solo anima lo que comunica algo
y nunca las acciones frecuentes. Por eso navegar entre vistas no tiene animación de entrada, y
los stat-tiles / tarjetas de features del login (no clickeables) no tienen hover decorativo. La
entrada escalonada del login y el fade del modal de evidencia sí se mantienen, por ser momentos
puntuales. Todo respeta `prefers-reduced-motion`.

Los desplazamientos de hover puramente decorativos (nav lateral, accesos rápidos del login)
están detrás de `@media (hover: hover) and (pointer: fine)`: en touch, tocar dispara `:hover`
sin que haya un puntero fino detrás, así que sin ese filtro el efecto queda "pegado" tras el tap.

El panel agrupa sus dos colas de riesgo activo ("Próximos vencimientos" e "Insumos con
alerta") con espacio ajustado (`.pa-grupo-ajustado`) porque son la misma categoría
conceptual; el resto de secciones usa la separación generosa por defecto de `.pa-main` —
ritmo de espaciado como señal de agrupación, no solo relleno. Los botones primarios
comprimen su sombra al presionar (además del `translateY` existente) para que el gesto de
click se lea también como un cambio de profundidad. El fondo del modal de evidencia usa
`backdrop-filter: blur()` en vez de un scrim opaco, con fallback sólido bajo
`prefers-reduced-transparency`. Cambiar un filtro en Certificados o Insumos (acción
ocasional, no una navegación frecuente) remonta la tabla con un fade corto de 200ms para
señalar "conjunto de filas nuevo" sin competir con la regla de "sin animación de entrada"
de la navegación entre vistas.

### Skills de diseño instaladas

El repo trae skills de agente instaladas con [`skills`](https://github.com/vercel-labs/skills)
(`.agents/skills/`, symlink en `.claude/skills/`) y [`taste-skill`](https://github.com/taste-skill/taste-skill)
(`skills/taste/`, symlinked bajo los nombres `taste-*`): `emil-design-eng`, `apple-design`,
`animation-vocabulary`, `improve-animations`, `review-animations`, `find-animation-opportunities`,
`impeccable`, `taste-default`, `taste-soft-calm`, `taste-redesign` y el resto del set de
`taste-skill`. Se usaron para la auditoría de contraste y de motion de esta vuelta de pulido
(colores de estado, badges de criticidad y el enlace `<a>` global no cumplían 4.5:1 AA sobre su
fondo — ver `--pa-enlace` y los tokens de estado en `src/styles/tokens.css`).

## Cómo correr

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`). En el login, usa
cualquiera de los dos "Accesos rápidos para la demo" — no hay autenticación real.

## Tests

```bash
npm test        # equivalente a: npx vitest run
```

Cubre los 8 casos borde del catálogo (`cb_01`…`cb_08`, definidos en
`catalogo-reglas.json → casos_borde_test`) más los tests de `estados.ts` y del cómputo de
`estadoGlobal`. Ver `src/motor/__tests__/casos-borde.test.ts`.

Otros comandos:

```bash
npm run build    # build de producción (tsc -b && vite build)
npm run preview  # sirve el build de producción localmente
```

## Estructura

```
src/
├── types/schema.ts        # esquema de dominio (Nave, Certificado, Insumo, ReglaNormativa…)
├── data/
│   ├── catalogo-reglas.json  # catálogo semilla: fuentes, reglas, plantillas de insumos
│   ├── seed.ts                # flota demo (6 naves, 2 armadores) con fechas relativas a hoy
│   └── store.ts                # seed + overlay localStorage, reset
├── motor/
│   ├── clasificacion.ts   # categoría de la nave por TRG/AB + advertencias
│   ├── evaluacion.ts      # reglas aplicables → ResultadoEvaluacion
│   ├── estados.ts         # estado por fecha/cantidad, umbrales
│   └── __tests__/         # casos borde + tests de estados
└── ui/
    ├── layout/             # Header, Nav, Layout
    ├── components/         # Card, Badge, ModalFoto, FormularioCertificado, iconos
    └── pages/              # Login, Dashboard, Flota, NaveDetalle, Certificados, Insumos, Reglas
```

## Documento de referencia

[`docs/matriz-normativa-aysen.html`](docs/matriz-normativa-aysen.html) — matriz normativa
DIRECTEMAR por TRG para la Región de Aysén que originó el catálogo de reglas. Se conserva
como documento de referencia, no se consume programáticamente.

## Fuera de alcance (fase 2)

Personal embarcado y titulaciones STCW, integración directa con el SIN de DIRECTEMAR,
multi-región, backend real (Firebase u otro) y portal para terceros verificadores.
