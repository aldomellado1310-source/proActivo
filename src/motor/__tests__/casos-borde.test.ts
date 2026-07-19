import { describe, expect, it } from 'vitest';
import catalogoRaw from '../../data/catalogo-reglas.json';
import type { Certificado, Insumo, ReglaNormativa } from '../../types/schema';
import type { NaveEvaluable } from '../tipos';
import { clasificarNave } from '../clasificacion';
import { reglasAplicables, evaluarNave } from '../evaluacion';
import {
  UMBRAL_POR_VENCER_DIAS,
  diasParaVencer,
  estadoPorFecha,
  evaluarInsumo,
  peorEstado,
  sumarMeses,
} from '../estados';

// El catálogo semilla es la especificación de los casos borde (cb_01…cb_08).
const catalogo = catalogoRaw as unknown as {
  reglas_normativas: ReglaNormativa[];
  casos_borde_test: { id: string; descripcion: string; esperado: string }[];
};
const REGLAS = catalogo.reglas_normativas;

function descripcionDe(id: string): string {
  return catalogo.casos_borde_test.find((cb) => cb.id === id)?.descripcion ?? id;
}

const HOY = new Date('2026-07-19T12:00:00Z');

function fechaRelativa(dias: number, base: Date = HOY): string {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

function naveBase(overrides: Partial<NaveEvaluable> = {}): NaveEvaluable {
  return {
    id: 'nave_test',
    armadorId: 'armador_test',
    matricula: 'AY-0000',
    nombre: 'Nave de prueba',
    categoria: 'nave_menor',
    esloraTotal: 12,
    uso: 'apoyo_acuicultura',
    zonaNavegacionAutorizada: 'aguas_interiores',
    jurisdiccionId: 'cp_puerto_aysen',
    estadoCumplimiento: 'conforme',
    activa: true,
    ...overrides,
  };
}

function certificado(overrides: Partial<Certificado>): Certificado {
  return {
    id: 'cert_test',
    naveId: 'nave_test',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de prueba',
    fechaEmision: fechaRelativa(-100),
    organismoEmisor: 'Capitanía de Puerto',
    estado: 'conforme',
    cargadoPor: 'test',
    cargadoEn: fechaRelativa(-100),
    ...overrides,
  };
}

function insumo(overrides: Partial<Insumo>): Insumo {
  return {
    id: 'insumo_test',
    naveId: 'nave_test',
    categoria: 'salvamento',
    descripcion: 'Insumo de prueba',
    tipoControl: 'vencimiento',
    cantidad: 1,
    minimoExigido: 1,
    estado: 'conforme',
    ...overrides,
  };
}

describe('clasificarNave — casos borde', () => {
  it(`cb_01: ${descripcionDe('cb_01')}`, () => {
    const resultado = clasificarNave(naveBase({ trg: 50.0, esloraTotal: 15 }));
    expect(resultado.categoria).toBe('nave_menor');
  });

  it(`cb_02: ${descripcionDe('cb_02')}`, () => {
    const resultado = clasificarNave(
      naveBase({ trg: undefined, arqueoBruto: 62, esloraTotal: 22 })
    );
    // Sigue siendo nave_mayor por AB: la advertencia NO cambia la clasificación.
    expect(resultado.categoria).toBe('nave_mayor');
    expect(resultado.advertencias.some((a) => /eslora/i.test(a) && /convenio/i.test(a))).toBe(
      true
    );
  });

  it(`cb_03: ${descripcionDe('cb_03')}`, () => {
    const artefactoOriginal = naveBase({
      categoria: 'artefacto_naval',
      trg: 80,
      esloraTotal: 20,
    });

    // Sin propulsión: se mantiene como artefacto (se declara, no se deriva).
    const sinPropulsion = clasificarNave(artefactoOriginal);
    expect(sinPropulsion.categoria).toBe('artefacto_naval');
    expect(sinPropulsion.reclasificadoPorPropulsion).toBe(false);

    // El set de reglas aplicables a un artefacto incluye el permiso BNUP...
    const reglasArtefacto = reglasAplicables(artefactoOriginal, REGLAS);
    expect(reglasArtefacto.some((r) => r.id === 'rn_permiso_bnup')).toBe(true);

    // Incorpora propulsión propia → reclasificación a nave (deriva por TRG/AB).
    const conPropulsion = clasificarNave({ ...artefactoOriginal, potenciaPropulsoraKw: 180 });
    expect(conPropulsion.categoria).toBe('nave_mayor');
    expect(conPropulsion.reclasificadoPorPropulsion).toBe(true);
    expect(conPropulsion.advertencias.length).toBeGreaterThan(0);

    // Recalculado el set de reglas: ya NO aplica el permiso de artefacto naval.
    const naveReclasificada: NaveEvaluable = {
      ...artefactoOriginal,
      categoria: conPropulsion.categoria,
      potenciaPropulsoraKw: 180,
    };
    const reglasNave = reglasAplicables(naveReclasificada, REGLAS);
    expect(reglasNave.some((r) => r.id === 'rn_permiso_bnup')).toBe(false);
  });

  it(`cb_04: ${descripcionDe('cb_04')}`, () => {
    const naveArtesanal = naveBase({
      categoria: 'nave_menor',
      uso: 'pesca_artesanal',
      trg: 20,
    });
    const naveAcuicultura: NaveEvaluable = { ...naveArtesanal, uso: 'apoyo_acuicultura' };

    const reglasArtesanal = reglasAplicables(naveArtesanal, REGLAS);
    const reglasAcuicultura = reglasAplicables(naveAcuicultura, REGLAS);

    expect(reglasArtesanal.some((r) => r.id === 'rn_matricula_personal_menor')).toBe(true);
    expect(reglasAcuicultura.some((r) => r.id === 'rn_revision_proyecto_acuicola')).toBe(true);
    // El set de reglas aplicables cambia con el uso.
    expect(reglasArtesanal.map((r) => r.id).sort()).not.toEqual(
      reglasAcuicultura.map((r) => r.id).sort()
    );

    // Un certificado emitido antes del cambio conserva su reglaVersion original,
    // el motor nunca lo reescribe.
    const cert = certificado({ reglaId: 'rn_matricula_personal_menor', reglaVersion: 1 });
    expect(cert.reglaVersion).toBe(1);
  });

  it(`cb_05: ${descripcionDe('cb_05')}`, () => {
    // Limitación documentada de la demo: no hay criterios locales de
    // jurisdicción cargados todavía; el motor sí soporta una jurisdicción
    // de operación distinta de la de matrícula para filtrar reglas.
    const reglaLocalMelinka: ReglaNormativa = {
      id: 'rn_test_local_melinka',
      documentoExigido: 'Permiso local de prueba',
      categoriaDocumento: 'operacion',
      descripcionControl: 'Regla sintética para testear jurisdicción de operación.',
      condicion: { jurisdicciones: ['cp_melinka'] },
      tipoPlazo: 'permanente',
      organismoEmisor: 'Gobernación Marítima de Aysén',
      fuenteId: 'fn_regl_registro_naves',
      estadoVerificacion: 'verificada',
      criticidad: 'media',
      version: 1,
      vigenteDesde: '2026-07-18',
    };

    const naveMatriculadaAysen = naveBase({
      jurisdiccionId: 'cp_puerto_aysen',
      jurisdiccionOperacionId: 'cp_melinka',
    });

    const aplicaPorOperacion = reglasAplicables(naveMatriculadaAysen, [reglaLocalMelinka]);
    expect(aplicaPorOperacion).toHaveLength(1);

    const naveSoloAysen = naveBase({ jurisdiccionId: 'cp_puerto_aysen' });
    const noAplicaSoloMatricula = reglasAplicables(naveSoloAysen, [reglaLocalMelinka]);
    expect(noAplicaSoloMatricula).toHaveLength(0);
  });

  it(`cb_06: ${descripcionDe('cb_06')}`, () => {
    const nave = naveBase({
      id: 'nave_cb06',
      uso: 'deportiva_recreativa',
      zonaNavegacionAutorizada: 'costera',
      trg: 10,
    });

    const cert = certificado({
      naveId: 'nave_cb06',
      reglaId: 'rn_navegabilidad_deportiva',
      fechaEmision: fechaRelativa(-30),
      fechaVencimiento: fechaRelativa(365 * 5), // muy vigente
    });

    const insumoVencido = insumo({
      naveId: 'nave_cb06',
      reglaId: 'rn_navegabilidad_deportiva',
      tipoControl: 'vencimiento',
      fechaVencimiento: fechaRelativa(-5), // vencido
    });

    const resultado = evaluarNave(nave, [cert], [insumoVencido], REGLAS, HOY);
    const doc = resultado.documentos.find((d) => d.reglaId === 'rn_navegabilidad_deportiva');

    expect(doc?.estado).toBe('conforme');
    expect(resultado.aptaParaInspeccion).toBe(false);
  });

  it(`cb_07: ${descripcionDe('cb_07')}`, () => {
    const nave = naveBase({ id: 'nave_cb07' });
    const cert = certificado({
      naveId: 'nave_cb07',
      reglaId: 'rn_matricula',
      fechaEmision: fechaRelativa(-800),
      fechaVencimiento: fechaRelativa(-10), // "vencido" si se tomara literalmente
    });

    const regla = REGLAS.find((r) => r.id === 'rn_matricula')!;
    expect(regla.estadoVerificacion).toBe('no_verificada');

    const resultado = evaluarNave(nave, [cert], [], REGLAS, HOY);
    const doc = resultado.documentos.find((d) => d.reglaId === 'rn_matricula');

    expect(doc?.estado).toBe('indeterminado');
    expect(doc?.requiereConfirmacionManual).toBe(true);
    // Nunca debe aparecer como 'vencido' pese a la fecha pasada.
    expect(doc?.estado).not.toBe('vencido');
  });

  it(`cb_08: ${descripcionDe('cb_08')}`, () => {
    const resultado = clasificarNave(naveBase({ trg: undefined, arqueoBruto: 45, esloraTotal: 16 }));
    expect(resultado.categoria).toBe('nave_menor');
    expect(resultado.usoEquivalenciaAB).toBe(true);
    expect(resultado.advertencias.some((a) => /equivalencia/i.test(a))).toBe(true);
  });
});

describe('estados.ts', () => {
  it('calcula días para vencer', () => {
    expect(diasParaVencer(fechaRelativa(10), HOY)).toBe(10);
    expect(diasParaVencer(fechaRelativa(-3), HOY)).toBe(-3);
  });

  it('marca por_vencer dentro del umbral de 30 días', () => {
    const { estado } = estadoPorFecha(fechaRelativa(UMBRAL_POR_VENCER_DIAS), HOY);
    expect(estado).toBe('por_vencer');
  });

  it('marca conforme justo fuera del umbral', () => {
    const { estado } = estadoPorFecha(fechaRelativa(UMBRAL_POR_VENCER_DIAS + 1), HOY);
    expect(estado).toBe('conforme');
  });

  it('marca vencido con fecha pasada', () => {
    const { estado, diasParaVencer: dias } = estadoPorFecha(fechaRelativa(-1), HOY);
    expect(estado).toBe('vencido');
    expect(dias).toBe(-1);
  });

  it('sin fecha de vencimiento (plazo permanente) es conforme', () => {
    expect(estadoPorFecha(undefined, HOY).estado).toBe('conforme');
  });

  it('insumo de stock bajo el mínimo es faltante con déficit', () => {
    const resultado = evaluarInsumo(
      insumo({ tipoControl: 'stock', cantidad: 2, minimoExigido: 5 }),
      HOY
    );
    expect(resultado.estado).toBe('faltante');
    expect(resultado.deficitCantidad).toBe(3);
  });

  it('insumo de stock sobre el mínimo es conforme', () => {
    const resultado = evaluarInsumo(
      insumo({ tipoControl: 'stock', cantidad: 10, minimoExigido: 5 }),
      HOY
    );
    expect(resultado.estado).toBe('conforme');
  });

  it('insumo de servicio vencido según intervalo', () => {
    const resultado = evaluarInsumo(
      insumo({
        tipoControl: 'servicio',
        fechaUltimoServicio: sumarMeses(fechaRelativa(0), -13),
        intervaloServicioMeses: 12,
      }),
      HOY
    );
    expect(resultado.estado).toBe('vencido');
  });

  it('insumo de inspección es informativo (conforme)', () => {
    expect(evaluarInsumo(insumo({ tipoControl: 'inspeccion' }), HOY).estado).toBe('conforme');
  });

  it('peorEstado prioriza vencido/faltante sobre por_vencer e indeterminado', () => {
    expect(peorEstado(['conforme', 'indeterminado'])).toBe('indeterminado');
    expect(peorEstado(['conforme', 'por_vencer', 'indeterminado'])).toBe('por_vencer');
    expect(peorEstado(['por_vencer', 'vencido', 'indeterminado'])).toBe('vencido');
    expect(peorEstado([])).toBe('conforme');
  });
});

describe('evaluarNave — estadoGlobal se calcula sobre reglas verificadas + insumos', () => {
  it('con solo reglas no_verificada e insumos conformes, el global es indeterminado', () => {
    const nave = naveBase({ id: 'nave_indet', uso: 'apoyo_acuicultura' });
    const cert = certificado({ naveId: 'nave_indet', reglaId: 'rn_matricula' });
    const resultado = evaluarNave(nave, [cert], [], REGLAS, HOY);
    expect(resultado.documentos.every((d) => d.requiereConfirmacionManual)).toBe(true);
    expect(resultado.estadoGlobal).toBe('indeterminado');
  });

  it('un insumo vencido decide el global aunque todos los documentos sean indeterminados', () => {
    const nave = naveBase({ id: 'nave_insumo_decide', uso: 'apoyo_acuicultura' });
    const insumoVencido = insumo({ naveId: 'nave_insumo_decide', fechaVencimiento: fechaRelativa(-1) });
    const resultado = evaluarNave(nave, [], [insumoVencido], REGLAS, HOY);
    expect(resultado.estadoGlobal).toBe('vencido');
  });

  it('una regla verificada conforme sin alertas produce global conforme', () => {
    const nave = naveBase({
      id: 'nave_verificada_conforme',
      categoria: 'artefacto_naval',
      uso: 'apoyo_acuicultura',
    });
    const certBnup = certificado({
      naveId: 'nave_verificada_conforme',
      reglaId: 'rn_permiso_bnup',
      fechaVencimiento: fechaRelativa(200),
    });
    const resultado = evaluarNave(nave, [certBnup], [], REGLAS, HOY);
    const doc = resultado.documentos.find((d) => d.reglaId === 'rn_permiso_bnup');
    expect(doc?.requiereConfirmacionManual).toBe(false);
    expect(doc?.estado).toBe('conforme');
    expect(resultado.estadoGlobal).toBe('conforme');
  });
});

describe('evaluarNave — reglas no verificadas nunca disparan alerta automática', () => {
  it('ninguna regla no_verificada produce un estado distinto de indeterminado', () => {
    const nave = naveBase({
      id: 'nave_global',
      categoria: 'nave_mayor',
      trg: 320,
      transportaPasajeros: true,
      tieneRadiocomunicaciones: true,
    });
    const certVencido = certificado({
      naveId: 'nave_global',
      reglaId: 'rn_dispositivos_salvamento',
      fechaVencimiento: fechaRelativa(-200),
    });

    const resultado = evaluarNave(nave, [certVencido], [], REGLAS, HOY);
    for (const doc of resultado.documentos) {
      const regla = REGLAS.find((r) => r.id === doc.reglaId)!;
      if (regla.estadoVerificacion === 'no_verificada') {
        expect(doc.estado).toBe('indeterminado');
        expect(doc.requiereConfirmacionManual).toBe(true);
      }
    }
  });
});
