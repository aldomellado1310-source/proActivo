import { useMemo } from 'react';
import type { ResultadoEvaluacion } from '../types/schema';
import { evaluarNave } from '../motor/evaluacion';
import { useEstadoDemo } from './EstadoContext';

/** Evalúa toda la flota con el motor real, memoizado según el estado actual. */
export function useEvaluaciones(): Record<string, ResultadoEvaluacion> {
  const { estado, reglas } = useEstadoDemo();

  return useMemo(() => {
    const hoy = new Date();
    const resultado: Record<string, ResultadoEvaluacion> = {};
    for (const nave of estado.naves) {
      const certificadosNave = estado.certificados.filter((c) => c.naveId === nave.id);
      const insumosNave = estado.insumos.filter((i) => i.naveId === nave.id);
      resultado[nave.id] = evaluarNave(nave, certificadosNave, insumosNave, reglas, hoy);
    }
    return resultado;
  }, [estado, reglas]);
}
