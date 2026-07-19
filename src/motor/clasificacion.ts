/**
 * Clasificación de naves por TRG/AB — D.L. 2.222/1978 (Ley de Navegación), Art. 26 y 51.
 *
 * Reglas de negocio (no negociables, ver casos_borde_test en catalogo-reglas.json):
 *  - cb_01: TRG === 50.0 exacto → nave_menor ("el umbral es 50 o menos").
 *  - cb_02: eslora < 24 m con AB > 50 → advertencia de exención de convenios
 *           internacionales, SIN cambiar la clasificación automática.
 *  - cb_03: un artefacto naval que incorpora propulsión propia se reclasifica
 *           como nave (deriva de TRG/AB) y debe advertirse el recálculo de reglas.
 *  - cb_08: sin TRG, con AB → clasificar por AB y registrar el supuesto de
 *           equivalencia aplicado.
 */
import type { CategoriaNave, Nave } from '../types/schema';
import { trgEquivalente } from './tipos';

export const UMBRAL_NAVE_MENOR = 50;
export const ESLORA_EXENCION_CONVENIOS = 24;

export interface ResultadoClasificacion {
  categoria: CategoriaNave;
  advertencias: string[];
  /** true si la categoría se derivó usando AB en lugar de TRG (cb_08). */
  usoEquivalenciaAB: boolean;
  /** true si se trata de un artefacto naval reclasificado a nave por propulsión propia (cb_03). */
  reclasificadoPorPropulsion: boolean;
}

type NaveParaClasificar = Pick<
  Nave,
  'categoria' | 'trg' | 'arqueoBruto' | 'esloraTotal' | 'potenciaPropulsoraKw'
>;

/**
 * Clasifica una nave según TRG/AB. Los artefactos navales se DECLARAN, no se
 * derivan: si `nave.categoria === 'artefacto_naval'` y no hay evidencia de
 * propulsión propia, se conserva esa categoría tal cual.
 */
export function clasificarNave(nave: NaveParaClasificar): ResultadoClasificacion {
  const advertencias: string[] = [];

  if (nave.categoria === 'artefacto_naval') {
    const tienePropulsionPropia = (nave.potenciaPropulsoraKw ?? 0) > 0;
    if (!tienePropulsionPropia) {
      return {
        categoria: 'artefacto_naval',
        advertencias,
        usoEquivalenciaAB: false,
        reclasificadoPorPropulsion: false,
      };
    }
    // cb_03: incorporó propulsión propia → reclasificación a nave.
    advertencias.push(
      'El artefacto naval incorpora propulsión propia: se reclasifica como nave. ' +
        'Debe recalcularse el set completo de reglas aplicables; los certificados ' +
        'emitidos bajo el régimen de artefacto quedan marcados como no aplicables.'
    );
    const resultado = clasificarPorTonelaje(nave, advertencias);
    return { ...resultado, reclasificadoPorPropulsion: true };
  }

  const resultado = clasificarPorTonelaje(nave, advertencias);
  return { ...resultado, reclasificadoPorPropulsion: false };
}

function clasificarPorTonelaje(
  nave: NaveParaClasificar,
  advertencias: string[]
): Omit<ResultadoClasificacion, 'reclasificadoPorPropulsion'> {
  const usoEquivalenciaAB = nave.trg === undefined && nave.arqueoBruto !== undefined;
  if (usoEquivalenciaAB) {
    advertencias.push(
      `Nave sin dato de TRG: se clasifica usando Arqueo Bruto (${nave.arqueoBruto} AB) bajo el ` +
        'supuesto de equivalencia TRG≈AB. La equivalencia por tipo de nave no está confirmada ' +
        '(ver fn_regl_arqueo) — verificar con Ingeniero de Arqueo autorizado.'
    );
  }

  const valor = trgEquivalente(nave);

  if (nave.esloraTotal < ESLORA_EXENCION_CONVENIOS && (nave.arqueoBruto ?? 0) > UMBRAL_NAVE_MENOR) {
    advertencias.push(
      `Eslora total ${nave.esloraTotal} m (< ${ESLORA_EXENCION_CONVENIOS} m) con AB > ${UMBRAL_NAVE_MENOR}: ` +
        'la nave queda exenta de convenios internacionales por eslora. Esta advertencia es informativa ' +
        'y no altera la clasificación automática por tonelaje.'
    );
  }

  if (valor === undefined) {
    advertencias.push(
      'La nave no registra TRG ni Arqueo Bruto: no es posible derivar la clasificación automáticamente.'
    );
    return { categoria: nave.categoria, advertencias, usoEquivalenciaAB };
  }

  const categoria: CategoriaNave = valor <= UMBRAL_NAVE_MENOR ? 'nave_menor' : 'nave_mayor';
  return { categoria, advertencias, usoEquivalenciaAB };
}
