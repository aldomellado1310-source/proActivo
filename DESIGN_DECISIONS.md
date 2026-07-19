# DESIGN_DECISIONS.md — Navix

Fuente de verdad estética para el trabajo de "agente demostrable" sobre este proyecto
(ver `CLAUDE-agente-demostrable.md` / `PLAYBOOK-demostrable.md`). Destilado de las
skills instaladas (`taste-*`, `apple-design`, `emil-design-eng`, `impeccable`,
`animation-vocabulary`, `improve-animations`, `review-animations`) aplicado a lo que
**ya existe** en este proyecto — no se reinventa el sistema, se documenta el que hay
para que las decisiones futuras se midan contra él.

## Sistema de diseño: se respeta el existente

No hay sistema nuevo que crear. Navix ya tiene un sistema de diseño coherente
(`src/styles/tokens.css`, `src/styles/base.css`) fruto de trabajo previo de rebranding
y pulido. Fase 0 aquí es documentarlo, no rehacerlo.

### Tokens concretos

- **Color de marca** (manual oficial Navix): `--pa-navy: #163b5c` (Azul Naval),
  `--pa-turquesa: #278c8c` (Turquesa Austral), `--pa-acento-marca: #e29a45` (Ámbar
  Energía). El degradado de marca completo (`--pa-degradado-acento`) se reserva a
  momentos puntuales (portada de login), nunca a uso repetido en la interfaz.
- **Color de acción/enlace**: `--pa-accion: #278c8c` para elementos grandes (botones,
  íconos); `--pa-enlace: #217777` para texto de enlace — más oscuro porque el texto
  necesita 4.5:1 (AA) y `--pa-accion` no lo cumple en tamaño de texto normal.
- **Color de estado** (semáforo funcional, fuera de la paleta de marca porque el
  manual no define colores de estado): conforme `#35775e` / por vencer `#93642d` /
  vencido y faltante `#ad3e38` / indeterminado `#616a72`, cada uno con su `-bg` de
  fondo pastel. Todos verificados a ≥4.5:1 contra su propio fondo de badge.
  `--pa-acento-marca` (ámbar) nunca se usa como color de estado — ambigüedad con
  "por vencer" si se mezclaran.
- **Espaciado**: escala `--pa-espacio-1` a `-7` = 4/8/12/16/24/32/48px (base 4, no
  estrictamente 4/8 puro pero consistente y ya en uso en toda la app).
- **Radios**: tarjeta 16px, pill 999px, input 10px.
- **Sombra**: 3 niveles (`sm` 2px/6%, base 8px/8%, `lg` 20px/16%), todas con el mismo
  tinte navy (`rgba(22,59,92,…)`) para que la sombra se sienta parte de la marca, no
  gris genérico.
- **Tipografía**: `DM Sans` para todo el texto de producto (títulos y cuerpo); `Sora`
  SemiBold exclusiva del wordmark "Navix" (`.pa-logotipo`) — nunca en títulos de
  página; `DM Mono` para datos tabulares (extensión propia del producto, fuera del
  manual de marca, para lectura de cifras/fechas).

### Estados obligatorios — cobertura real

- **Vacío**: `EmptyState` (`src/ui/components/Card.tsx`) usado en Dashboard,
  Certificados, Insumos cuando una cola/tabla no tiene filas.
- **Carga**: no hay estado de carga real todavía — la app es 100% datos locales
  sincrónicos (`src/data/store.ts`), no hay fetch async en el happy path. Se revisa
  en Fase 1/2 si esto es un hueco real o directamente fuera de alcance (no hay
  operación async que mostrar cargando).
- **Error**: cubierto en el login de credenciales (`.pa-login__error`, admin/admin).
  No hay otras superficies de error porque no hay red — a confirmar en Fase 1/2.
- **Foco/hover/active**: hover aislado tras `@media (hover: hover) and (pointer:
  fine)` para no dejar estados "pegados" en touch; active en botones primarios
  comprime sombra + `translateY`.

### Vocabulario de movimiento

- **Duración/easing estándar**: micro-interacciones (hover/focus/active) en
  0.15s `ease`; transiciones de contenido (fade de tabla al filtrar, logo del
  header) en 0.2–0.28s, `ease-out` o `cubic-bezier(0.16, 1, 0.3, 1)` para las que
  quieren sensación de "asentar".
- **Transiciones existentes**: `pa-entrada` (fade+translateY sutil, 0.2s, para
  contenido que se remonta: `.pa-fade-remonta`), `pa-deriva` (deriva lenta de fondo,
  solo en login), `pa-modal-fondo`/`pa-modal-caja` (entrada de modal con blur de
  scrim), colapso del logo del header al hacer scroll (solo en login,
  `colapsaAlDesplazar`).
- **Criterio de "cuándo animar"** (Emil Kowalski, ya aplicado): nunca animar lo que
  se usa con frecuencia (navegación entre vistas, toggles de uso constante); reservar
  motion con más presencia para lo que se ve una vez por sesión (login) o para
  acciones ocasionales (cambiar de filtro, no cada clic).
- `prefers-reduced-motion: reduce` ya está cubierto globalmente
  (`src/styles/base.css:66-71`): fuerza duración ~0 en todas las animaciones/
  transiciones vía `!important`. Cualquier animación nueva hereda esto sin trabajo
  adicional — no se necesita guard por componente.

### 6 reglas de craft aplicables a este proyecto (impeccable / apple-design)

1. **Cero valores sueltos.** Todo margen/padding/radio/sombra nuevo usa un token de
   `tokens.css`; si el valor que se necesita no existe, se agrega el token, no un
   número mágico inline.
2. **El ritmo de espaciado comunica agrupación**, no un contenedor extra — ya en uso
   en el Dashboard (`.pa-grupo-ajustado` para las dos colas de riesgo activo, 32px de
   separación entre secciones no relacionadas).
3. **Restraint de marca**: el degradado completo de marca (navy→turquesa→ámbar) es
   para un solo lugar (portada); en el resto de la interfaz, el ámbar es acento
   puntual (borde, indicador activo), nunca fondo grande.
4. **Contraste AA se calcula, no se estima al ojo** — cada color de texto/badge nuevo
   se valida contra su fondo real con la fórmula de luminancia relativa antes de
   aceptarlo.
5. **El hover no debe "pegarse" en touch** — todo estilo de `:hover` nuevo va detrás
   de `@media (hover: hover) and (pointer: fine)`.
6. **Alineación óptica sobre alineación matemática** en textos con íconos/badges al
   lado — ya visible en avatares de perfil e íconos de estado del header.

## Happy path de demo (declarado en Fase 0, se detalla en Fase 1)

Secuencia mostrable: **Login → Dashboard → Flota → ficha de una nave (Certificados +
Insumos) → Reglas → Acerca de Navix**. Usuario objetivo y problema, MVP dentro/fuera
de alcance y estado real de cada paso se completan en Fase 1 (Reconocimiento) con
verificación en vivo, no aquí — Fase 0 es solo la barra estética.
