/**
 * Tipos auxiliares del motor de evaluación.
 *
 * `schema.ts` se usa tal cual fue entregado (fuente de verdad del dominio).
 * `Nave` no incluye `transportaPasajeros` ni `tieneRadiocomunicaciones` —
 * atributos que sí forman parte de `CondicionAplicacion` y que el motor
 * necesita para decidir qué reglas aplican. Se modelan aquí como una
 * extensión de `Nave`, sin tocar el esquema original.
 */
import type { Nave } from '../types/schema';

export interface NaveEvaluable extends Nave {
  /** La nave transporta pasajeros regularmente. */
  transportaPasajeros?: boolean;
  /** La nave cuenta con equipo de radiocomunicaciones instalado. */
  tieneRadiocomunicaciones?: boolean;
  /**
   * Jurisdicción donde la nave está operando actualmente, si es distinta
   * de `jurisdiccionId` (que es la de matrícula). Ver cb_05: una nave
   * matriculada en Puerto Aysén puede operar bajo la jurisdicción de
   * Melinka y debe evaluarse con los criterios locales de esa capitanía.
   */
  jurisdiccionOperacionId?: string;
}

/**
 * Valor "TRG-equivalente" usado por el motor para comparar contra
 * trgMin/trgMax y para clasificar la nave. Si no hay TRG registrado se
 * usa el Arqueo Bruto (AB) bajo un supuesto de equivalencia que debe
 * quedar registrado como advertencia (cb_08): la Ley de Navegación
 * clasifica en TRG pero el Reglamento de Arqueo mide en AB, y la fuente
 * `fn_regl_arqueo` señala este punto como pendiente de confirmación.
 */
export function trgEquivalente(nave: Pick<Nave, 'trg' | 'arqueoBruto'>): number | undefined {
  return nave.trg ?? nave.arqueoBruto;
}
