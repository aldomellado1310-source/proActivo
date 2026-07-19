# PLAYBOOK DEMOSTRABLE (v3)

Complemento del núcleo (`CLAUDE-agente-demostrable.md`). Lee cada fase cuando entres
en ella. Con varios proyectos: inventaría, prioriza el más cercano a demostrable,
trabaja de a uno. Descubre el stack; no lo asumas.

---

## FASE 0 — Definición y decisiones de diseño

Declara:
- **Happy path de demo:** secuencia exacta mostrable en vivo, valor entendible en <3 min.
- **Usuario y problema.**
- **Barra de MVP funcional:** dentro / fuera de alcance.
- **Barra estética:** sistema de diseño existente (se respeta) o uno sobrio nuevo;
  escala tipográfica, espaciado (base 4/8), radios, sombras; estados obligatorios
  (carga, vacío, error, éxito, focus/hover/active); tono y presupuesto de movimiento.

**Lectura única de skills:** lee las skills de diseño instaladas y destila en
`DESIGN_DECISIONS.md` (raíz del proyecto):
- Tokens concretos elegidos (valores, no principios abstractos).
- 5-8 reglas de craft aplicables a este proyecto (de impeccable/apple-design).
- Vocabulario de movimiento: qué transiciones existen, duración/easing estándar.
Este archivo es la fuente de verdad estética desde ahora.

**Entrega:** guion de demo + dentro/fuera de MVP + `DESIGN_DECISIONS.md`.

---

## FASE 1 — Reconocimiento

Mapea estructura, entrypoints, stack, capa de datos, integraciones, scripts de
build/run, estado real del happy path (¿corre? ¿dónde se rompe?).
Inventario visual: sistema de diseño actual, librería de componentes, manejo de
estados, animaciones existentes.

**Preparación de red de seguridad:** crea branch `demo/<proyecto>` desde el estado
actual. Verifica que build y linter corren ANTES de tocar nada (baseline).

**Entrega:** mapa de arquitectura 1 página + estado real de demo + inventario visual + baseline verificado.

---

## FASE 2 — Diagnóstico

Registra hallazgos con ID (`D-01`, `D-02`...) · archivo:línea · severidad · eje ·
evidencia · impacto en demo. Ejes:

a) **Bloqueadores de demo** — lo que impide completar el happy path.
b) **Seguridad y datos** — auth, reglas/permisos, secretos, validación. Solo
   diagnóstico: cambios a reglas de seguridad son [DECISIÓN DE PRODUCTO].
c) **Estructura** — organización, acoplamiento, duplicación, tipado.
d) **Estética y UX** — audita contra `DESIGN_DECISIONS.md`:
   consistencia de tokens (detecta valores mágicos), jerarquía y ritmo, estados
   completos, feedback de interacción (hover/active/focus, foco por teclado, targets
   táctiles), microcopy, responsive, accesibilidad base (contraste AA, labels, alt).
e) **Interacción y movimiento** — usando el vocabulario de `DESIGN_DECISIONS.md`:
   transiciones bruscas, layout shifts, ausencia de movimiento orientador, exceso
   que distrae, reduced-motion.
f) **Rendimiento y fiabilidad** — latencia percibida, fallos de red, optimistic UI
   donde tenga sentido.

**Entrega:** tabla priorizada con IDs, marcando qué bloquea la demo.

---

## FASE 3 — Plan de intervención  →  ⛔ CHECKPOINT HUMANO

Orden del trabajo mínimo:
1. Desbloquear happy path.
2. Riesgos de seguridad/datos → solo los ejecutables sin [DECISIÓN DE PRODUCTO];
   los demás se listan para aprobación.
3. Reestructurar solo lo necesario para sostener 1 y 4.
4. Elevar capa estética según `DESIGN_DECISIONS.md`.
5. Coreografiar interacción dentro del presupuesto de movimiento.
6. Datos seed + modo demo reproducible.

**Cada ítem del plan nace con:**
- Referencia al hallazgo (`D-XX`)
- Etiqueta [estructural] / [estético] / [interacción]
- Archivos estimados (respetando presupuesto de ≤10 por commit)
- **Criterio de aceptación verificable** (qué se observa cuando está hecho)
- **Método de verificación** (comando, prueba manual del flujo, o screenshot)

**⛔ DETENTE AQUÍ.** Presenta el plan completo (tabla) + ítems marcados
[DECISIÓN DE PRODUCTO] + estimación de alcance. No ejecutes nada de Fase 4 hasta
recibir aprobación explícita. Si hay correcciones, ajusta y vuelve a presentar.

---

## FASE 4 — Ejecución (post-aprobación, autónoma)

Facultades: reorganizar módulos, extraer componentes, rehacer capa visual según
`DESIGN_DECISIONS.md`, coreografiar movimiento, crear piezas faltantes del happy
path, integrar modo demo sin dependencia de servicios externos frágiles.

Reglas:
- Un commit por ítem del plan, mensaje `tipo(D-XX): descripción`.
- ≤10 archivos por commit; si un ítem requiere más, divídelo.
- Tras cada commit: linter + build. Tras cada 3-4 commits: happy path completo.
- Cada animación necesita una razón (orientar, feedback, suavizar); si no, no va.
- No cierres un ítem sin ejecutar su método de verificación declarado.

**Entrega:** registro de cambios (ítem → commit → verificación ejecutada).

---

## FASE 4.5 — Compuerta de revisión de diseño (con evidencia)

Ninguna pantalla se declara presentable sin pasar esto:

1. **Screenshots Playwright** de cada pantalla del happy path en 390px (móvil) y
   1440px (desktop), guardados en `demo-evidence/`. Incluye al menos un estado de
   carga, uno vacío y uno de error capturados.
2. **Chequeos programáticos:** contraste AA en textos principales; sin overflow
   horizontal en móvil (`document.body.scrollWidth <= viewport`); sin layout shift
   visible en las transiciones del happy path.
3. **Auditoría de craft** contra `DESIGN_DECISIONS.md` + checklist impeccable:
   alineación óptica, espaciado consistente, cero valores sueltos.
4. **Auditoría de movimiento** (review-animations): propósito, duración/easing,
   reduced-motion funcional.

Registro PASA / NO PASA por pantalla con archivo:línea. Corrige NO PASA y repite.
La evidencia (capturas) se adjunta al cierre — la autodeclaración no basta.

---

## FASE 5 — Cierre y handoff

- Confirmación del happy path de punta a punta + carpeta `demo-evidence/` con capturas.
- Instrucciones para levantar la demo desde cero (incluyendo seed/modo demo).
- Backlog de siguiente iteración en tareas atómicas y delegables
  (objetivo · archivos · cambio · criterio de aceptación · verificación),
  con backlog funcional separado del de pulido estético/interacción.
- Lista de [DECISIÓN DE PRODUCTO] pendientes que quedaron sin resolver.
