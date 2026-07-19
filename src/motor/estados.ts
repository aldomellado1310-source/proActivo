/**
 * Cálculo de estados de cumplimiento a partir de fechas y cantidades.
 * Funciones puras: reciben `hoy` como parámetro para ser 100% testeables
 * y para que la demo siempre muestre vencimientos "vivos" respecto a la
 * fecha real de ejecución.
 */
import type { EstadoCumplimiento, FechaISO, Insumo } from '../types/schema';

/** Días antes del vencimiento en que un documento pasa a "por_vencer". */
export const UMBRAL_POR_VENCER_DIAS = 30;

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/** Diferencia en días completos entre `hoy` y `fecha` (positiva si `fecha` es futura). */
export function diasParaVencer(fecha: FechaISO, hoy: Date): number {
  const objetivo = new Date(fecha);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioObjetivo = new Date(objetivo.getFullYear(), objetivo.getMonth(), objetivo.getDate());
  return Math.round((inicioObjetivo.getTime() - inicioHoy.getTime()) / MS_POR_DIA);
}

export function sumarMeses(fecha: FechaISO, meses: number): FechaISO {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

/**
 * Estado de un documento con fecha de vencimiento fija.
 * Sin fecha de vencimiento (plazo permanente / condicional sin evento) → conforme.
 */
export function estadoPorFecha(
  fechaVencimiento: FechaISO | undefined,
  hoy: Date,
  umbralDias: number = UMBRAL_POR_VENCER_DIAS
): { estado: EstadoCumplimiento; diasParaVencer?: number } {
  if (!fechaVencimiento) {
    return { estado: 'conforme' };
  }
  const dias = diasParaVencer(fechaVencimiento, hoy);
  if (dias < 0) return { estado: 'vencido', diasParaVencer: dias };
  if (dias <= umbralDias) return { estado: 'por_vencer', diasParaVencer: dias };
  return { estado: 'conforme', diasParaVencer: dias };
}

export interface EstadoInsumo {
  estado: EstadoCumplimiento;
  diasParaVencer?: number;
  deficitCantidad?: number;
}

/** Evalúa un insumo según su `tipoControl`. */
export function evaluarInsumo(insumo: Insumo, hoy: Date): EstadoInsumo {
  switch (insumo.tipoControl) {
    case 'vencimiento': {
      const { estado, diasParaVencer } = estadoPorFecha(insumo.fechaVencimiento, hoy);
      return { estado, diasParaVencer };
    }
    case 'servicio': {
      if (!insumo.fechaUltimoServicio || !insumo.intervaloServicioMeses) {
        return { estado: 'indeterminado' };
      }
      const proximoServicio = sumarMeses(insumo.fechaUltimoServicio, insumo.intervaloServicioMeses);
      const { estado, diasParaVencer } = estadoPorFecha(proximoServicio, hoy);
      return { estado, diasParaVencer };
    }
    case 'stock': {
      if (insumo.cantidad < insumo.minimoExigido) {
        return { estado: 'faltante', deficitCantidad: insumo.minimoExigido - insumo.cantidad };
      }
      return { estado: 'conforme' };
    }
    case 'inspeccion':
      // Se controla por desgaste, sin fecha fija: informativo, no genera alerta automática.
      return { estado: 'conforme' };
    default:
      return { estado: 'indeterminado' };
  }
}

/** Orden de severidad para determinar el "peor" estado entre varios. */
const SEVERIDAD: Record<EstadoCumplimiento, number> = {
  conforme: 0,
  indeterminado: 1,
  por_vencer: 2,
  faltante: 3,
  vencido: 4,
};

export function peorEstado(estados: EstadoCumplimiento[]): EstadoCumplimiento {
  if (estados.length === 0) return 'conforme';
  return estados.reduce((peor, actual) =>
    SEVERIDAD[actual] > SEVERIDAD[peor] ? actual : peor
  );
}
