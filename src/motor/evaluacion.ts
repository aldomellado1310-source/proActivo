/**
 * Motor de evaluación: reglas aplicables → ResultadoEvaluacion.
 * Funciones puras sobre los tipos de `schema.ts`, consumiendo el catálogo
 * de reglas como datos (nunca hardcodeadas).
 */
import type {
  Certificado,
  Insumo,
  ReglaNormativa,
  ResultadoEvaluacion,
} from '../types/schema';
import type { NaveEvaluable } from './tipos';
import { trgEquivalente } from './tipos';
import { estadoPorFecha, evaluarInsumo, peorEstado } from './estados';

/**
 * Reglas aplicables a una nave según `CondicionAplicacion`.
 * Una regla sin ninguna condición coincidente se descarta.
 * Las reglas `obsoleta` (reemplazadas por una versión posterior de la
 * norma) se excluyen: no son la versión vigente de la exigencia.
 */
export function reglasAplicables(nave: NaveEvaluable, reglas: ReglaNormativa[]): ReglaNormativa[] {
  return reglas.filter((regla) => {
    if (regla.estadoVerificacion === 'obsoleta') return false;
    return condicionCoincide(nave, regla);
  });
}

function condicionCoincide(nave: NaveEvaluable, regla: ReglaNormativa): boolean {
  const c = regla.condicion;

  if (c.categorias && !c.categorias.includes(nave.categoria)) return false;
  if (c.usos && !c.usos.includes(nave.uso)) return false;
  if (c.zonas && !c.zonas.includes(nave.zonaNavegacionAutorizada)) return false;

  const valorTonelaje = trgEquivalente(nave);
  if (c.trgMin !== undefined && (valorTonelaje === undefined || valorTonelaje < c.trgMin)) return false;
  if (c.trgMax !== undefined && (valorTonelaje === undefined || valorTonelaje > c.trgMax)) return false;

  if (c.esloraMin !== undefined && nave.esloraTotal < c.esloraMin) return false;
  if (c.esloraMax !== undefined && nave.esloraTotal > c.esloraMax) return false;

  if (c.jurisdicciones) {
    const jurisdiccionOperativa = nave.jurisdiccionOperacionId ?? nave.jurisdiccionId;
    if (!c.jurisdicciones.includes(jurisdiccionOperativa)) return false;
  }

  if (c.transportaPasajeros !== undefined && Boolean(nave.transportaPasajeros) !== c.transportaPasajeros) {
    return false;
  }
  if (
    c.tieneRadiocomunicaciones !== undefined &&
    Boolean(nave.tieneRadiocomunicaciones) !== c.tieneRadiocomunicaciones
  ) {
    return false;
  }

  return true;
}

/** Certificado más reciente (por fechaEmision) para una regla dada. */
function certificadoVigentePara(
  naveId: string,
  reglaId: string,
  certificados: Certificado[]
): Certificado | undefined {
  return certificados
    .filter((cert) => cert.naveId === naveId && cert.reglaId === reglaId)
    .sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime())[0];
}

export function evaluarNave(
  nave: NaveEvaluable,
  certificados: Certificado[],
  insumos: Insumo[],
  reglas: ReglaNormativa[],
  hoy: Date = new Date()
): ResultadoEvaluacion {
  const aplicables = reglasAplicables(nave, reglas);

  const documentos: ResultadoEvaluacion['documentos'] = aplicables.map((regla) => {
    const certificado = certificadoVigentePara(nave.id, regla.id, certificados);

    // cb_07: regla no verificada → siempre indeterminado, nunca alerta automática,
    // independientemente del estado real del certificado.
    if (regla.estadoVerificacion === 'no_verificada') {
      return {
        reglaId: regla.id,
        documentoExigido: regla.documentoExigido,
        estado: 'indeterminado',
        diasParaVencer: certificado?.fechaVencimiento
          ? estadoPorFecha(certificado.fechaVencimiento, hoy).diasParaVencer
          : undefined,
        certificadoId: certificado?.id,
        criticidad: regla.criticidad,
        requiereConfirmacionManual: true,
      };
    }

    // tipoPlazo 'por_evento' (p. ej. zarpe): informativo, sin vencimiento.
    if (regla.tipoPlazo === 'por_evento') {
      return {
        reglaId: regla.id,
        documentoExigido: regla.documentoExigido,
        estado: 'conforme',
        certificadoId: certificado?.id,
        criticidad: regla.criticidad,
        requiereConfirmacionManual: false,
      };
    }

    if (!certificado) {
      return {
        reglaId: regla.id,
        documentoExigido: regla.documentoExigido,
        estado: 'faltante',
        criticidad: regla.criticidad,
        requiereConfirmacionManual: false,
      };
    }

    const { estado, diasParaVencer } = estadoPorFecha(certificado.fechaVencimiento, hoy);
    return {
      reglaId: regla.id,
      documentoExigido: regla.documentoExigido,
      estado,
      diasParaVencer,
      certificadoId: certificado.id,
      criticidad: regla.criticidad,
      requiereConfirmacionManual: false,
    };
  });

  const insumosEvaluados: ResultadoEvaluacion['insumos'] = insumos.map((insumo) => {
    const { estado, diasParaVencer, deficitCantidad } = evaluarInsumo(insumo, hoy);
    return {
      insumoId: insumo.id,
      descripcion: insumo.descripcion,
      estado,
      diasParaVencer,
      deficitCantidad,
    };
  });

  // cb_06: certificados OK pero insumo exigido vencido → apta = false, el
  // certificado en sí conserva su estado 'conforme'.
  const aptaParaInspeccion = insumosEvaluados.every(
    (i) => i.estado !== 'vencido' && i.estado !== 'faltante'
  );

  // El estado global se calcula sobre documentos de reglas VERIFICADAS más
  // insumos: los documentos 'indeterminado' (regla no_verificada) quedan
  // fuera del cómputo para no arrastrar el estado de la nave con alertas
  // que el sistema no puede confirmar. Si no hay ningún documento
  // verificado ni insumos, y sí hay documentos indeterminados, el global
  // es 'indeterminado' ("si solo hay indeterminados, indeterminado").
  const estadosDocumentosVerificados = documentos
    .filter((d) => !d.requiereConfirmacionManual)
    .map((d) => d.estado);
  const estadosInsumos = insumosEvaluados.map((i) => i.estado);
  const estadosRelevantes = [...estadosDocumentosVerificados, ...estadosInsumos];
  const estadoGlobal =
    estadosRelevantes.length > 0
      ? peorEstado(estadosRelevantes)
      : documentos.length > 0
        ? 'indeterminado'
        : 'conforme';

  return {
    naveId: nave.id,
    evaluadoEn: hoy.toISOString(),
    estadoGlobal,
    documentos,
    insumos: insumosEvaluados,
    aptaParaInspeccion,
  };
}
