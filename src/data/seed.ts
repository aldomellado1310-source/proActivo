/**
 * Flota semilla de la demo — Región de Aysén.
 *
 * Las fechas se calculan siempre en relación a `new Date()` real, para que
 * la demo muestre vencimientos "vivos" sin importar cuándo se ejecute.
 *
 * Decisión de modelado: el estado global de una nave (`estadoGlobal`, ver
 * `motor/evaluacion.ts`) se calcula sobre documentos de reglas VERIFICADAS
 * más insumos. Como solo 3 de las 15 reglas del catálogo están
 * `estadoVerificacion: 'verificada'` (rn_navegabilidad_deportiva,
 * rn_dotacion_minima, rn_permiso_bnup), la mayoría de los certificados de
 * cada nave se muestran en gris "requiere confirmación" — es intencional,
 * es el punto central de la demo ("reglas como datos, mayoría sin
 * verificar"). Los insumos, en cambio, sí generan alertas de color reales
 * independientemente de la regla que los exige, porque su estado depende
 * de datos físicos objetivos (fecha, cantidad), no de si la norma que los
 * exige fue confirmada por un experto. Por eso el "certificado por vencer"
 * de Aysén Austral se modela como un insumo próximo a vencer: no existe
 * ninguna regla verificada aplicable a una nave_menor de apoyo a
 * acuicultura en el catálogo semilla, así que una alerta ámbar real en ese
 * segmento solo puede originarse en un insumo.
 */
import type {
  Armador,
  CategoriaInsumo,
  Certificado,
  Insumo,
  TipoControlInsumo,
} from '../types/schema';
import type { NaveEvaluable } from '../motor/tipos';
import { clasificarNave } from '../motor/clasificacion';
import catalogoRaw from './catalogo-reglas.json';

// ─────────────────────────────────────────────────────────────
// Utilidades de fecha relativas a "hoy"
// ─────────────────────────────────────────────────────────────

function fechaRelativa(dias: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────
// Jurisdicciones (solo para presentación — no hay criterios locales
// cargados en esta demo, ver limitación documentada de cb_05)
// ─────────────────────────────────────────────────────────────

export const NOMBRES_JURISDICCION: Record<string, string> = {
  cp_puerto_aysen: 'Capitanía de Puerto de Puerto Aysén',
  cp_puerto_chacabuco: 'Capitanía de Puerto de Puerto Chacabuco',
  cp_melinka: 'Capitanía de Puerto de Melinka',
};

// ─────────────────────────────────────────────────────────────
// Armadores
// ─────────────────────────────────────────────────────────────

export const armadoresSemilla: Armador[] = [
  {
    id: 'armador_salmones_fiordo',
    rut: '76.123.456-7',
    razonSocial: 'Salmones del Fiordo SpA',
    contactoNombre: 'Marcela Huenchul',
    contactoEmail: 'operaciones@salmonesdelfiordo.cl',
    contactoTelefono: '+56 9 5555 1122',
    jurisdiccionPrincipalId: 'cp_puerto_aysen',
    activo: true,
    creadoEn: fechaRelativa(-900),
  },
  {
    id: 'armador_transportes_australes',
    rut: '77.987.654-3',
    razonSocial: 'Transportes Australes Ltda',
    contactoNombre: 'Ricardo Paillao',
    contactoEmail: 'flota@transportesaustrales.cl',
    contactoTelefono: '+56 9 5555 3344',
    jurisdiccionPrincipalId: 'cp_puerto_chacabuco',
    activo: true,
    creadoEn: fechaRelativa(-1200),
  },
];

// ─────────────────────────────────────────────────────────────
// Naves — la categoría se deriva con clasificarNave(), nunca se
// ingresa a mano (salvo la declaración inicial de artefacto naval).
// ─────────────────────────────────────────────────────────────

type DatosBaseNave = Omit<NaveEvaluable, 'estadoCumplimiento' | 'ultimaEvaluacion'>;

const datosBaseNaves: DatosBaseNave[] = [
  {
    id: 'nave_dona_berta',
    armadorId: 'armador_salmones_fiordo',
    matricula: 'AY-1042',
    nombre: 'Doña Berta',
    categoria: 'nave_menor',
    trg: 18,
    esloraTotal: 14,
    mangaMaxima: 4.2,
    puntal: 1.8,
    anioConstruccion: 2016,
    material: 'Acero',
    potenciaPropulsoraKw: 110,
    uso: 'apoyo_acuicultura',
    zonaNavegacionAutorizada: 'aguas_interiores',
    jurisdiccionId: 'cp_puerto_aysen',
    distintivoLlamada: 'CB1042',
    dotacionAutorizada: 4,
    tieneRadiocomunicaciones: true,
    activa: true,
  },
  {
    id: 'nave_aysen_austral',
    armadorId: 'armador_salmones_fiordo',
    matricula: 'AY-2077',
    nombre: 'Aysén Austral',
    categoria: 'nave_menor',
    trg: 50.0,
    esloraTotal: 26,
    mangaMaxima: 7,
    puntal: 2.4,
    anioConstruccion: 2011,
    material: 'Acero',
    potenciaPropulsoraKw: 260,
    uso: 'apoyo_acuicultura',
    zonaNavegacionAutorizada: 'aguas_interiores',
    jurisdiccionId: 'cp_puerto_aysen',
    distintivoLlamada: 'CB2077',
    dotacionAutorizada: 3,
    tieneRadiocomunicaciones: true,
    activa: true,
  },
  {
    id: 'nave_wellboat_patagonia',
    armadorId: 'armador_transportes_australes',
    matricula: 'CB-3301',
    nombre: 'Wellboat Patagonia',
    categoria: 'nave_mayor',
    arqueoBruto: 320,
    esloraTotal: 42,
    mangaMaxima: 10,
    puntal: 4.5,
    anioConstruccion: 2005,
    material: 'Acero',
    potenciaPropulsoraKw: 1200,
    uso: 'transporte_pasajeros',
    zonaNavegacionAutorizada: 'costera',
    jurisdiccionId: 'cp_puerto_chacabuco',
    distintivoLlamada: 'CBWP01',
    numeroISMM: '8814021',
    dotacionAutorizada: 9,
    transportaPasajeros: true,
    tieneRadiocomunicaciones: true,
    activa: true,
  },
  {
    id: 'nave_ponton_melinka_ii',
    armadorId: 'armador_salmones_fiordo',
    matricula: 'ME-0087',
    nombre: 'Pontón Melinka II',
    categoria: 'artefacto_naval', // declarado, no derivado
    arqueoBruto: 140,
    esloraTotal: 26,
    material: 'Acero / HDPE',
    anioConstruccion: 2018,
    uso: 'apoyo_acuicultura',
    zonaNavegacionAutorizada: 'aguas_interiores',
    jurisdiccionId: 'cp_melinka',
    dotacionAutorizada: 0,
    activa: true,
  },
  {
    id: 'nave_cisne_rapido',
    armadorId: 'armador_transportes_australes',
    matricula: 'CB-1590',
    nombre: 'Cisne Rápido',
    categoria: 'nave_menor',
    arqueoBruto: 62,
    esloraTotal: 22,
    mangaMaxima: 5.5,
    puntal: 2.1,
    anioConstruccion: 2014,
    material: 'Fibra de vidrio',
    potenciaPropulsoraKw: 450,
    uso: 'pesca_artesanal',
    zonaNavegacionAutorizada: 'costera',
    jurisdiccionId: 'cp_puerto_chacabuco',
    distintivoLlamada: 'CB1590',
    dotacionAutorizada: 4,
    tieneRadiocomunicaciones: true,
    activa: true,
  },
  {
    id: 'nave_estrella_del_sur',
    armadorId: 'armador_transportes_australes',
    matricula: 'CB-0765',
    nombre: 'Estrella del Sur',
    categoria: 'nave_menor',
    trg: 8,
    esloraTotal: 9.5,
    mangaMaxima: 2.8,
    puntal: 1.1,
    anioConstruccion: 2020,
    material: 'Fibra de vidrio',
    potenciaPropulsoraKw: 150,
    uso: 'deportiva_recreativa',
    zonaNavegacionAutorizada: 'costera',
    jurisdiccionId: 'cp_puerto_aysen',
    dotacionAutorizada: 1,
    tieneRadiocomunicaciones: false,
    activa: true,
  },
];

export interface NaveSemilla extends NaveEvaluable {
  /** Advertencias de clasificación (cb_02, cb_08, etc.) para mostrar en la ficha técnica. */
  advertenciasClasificacion: string[];
}

export const navesSemilla: NaveSemilla[] = datosBaseNaves.map((datos) => {
  const clasificacion = clasificarNave(datos);
  return {
    ...datos,
    categoria: clasificacion.categoria,
    estadoCumplimiento: 'indeterminado',
    ultimaEvaluacion: fechaRelativa(0),
    advertenciasClasificacion: clasificacion.advertencias,
  };
});

// ─────────────────────────────────────────────────────────────
// Certificados
// ─────────────────────────────────────────────────────────────

let contadorCertificado = 0;
function crearCertificado(datos: Omit<Certificado, 'id' | 'cargadoPor' | 'cargadoEn'>): Certificado {
  contadorCertificado += 1;
  return {
    ...datos,
    id: `cert_${String(contadorCertificado).padStart(3, '0')}`,
    cargadoPor: 'demo_seed',
    cargadoEn: fechaRelativa(-1),
  };
}

export const certificadosSemilla: Certificado[] = [
  // ── Doña Berta — todo conforme a nivel documental (todas las reglas
  // aplicables son no_verificada → se muestran en gris, ninguna en rojo).
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-1042',
    fechaEmision: fechaRelativa(-700),
    organismoEmisor: 'Capitanía de Puerto de Puerto Aysén',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-1042',
    fechaEmision: fechaRelativa(-700),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_distintivo_llamada',
    reglaVersion: 1,
    tipoDocumento: 'Distintivo de Llamada',
    folio: 'CB1042',
    fechaEmision: fechaRelativa(-700),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_revista_cargo',
    reglaVersion: 1,
    tipoDocumento: 'Revista de Cargo',
    folio: 'RC-1042-26',
    fechaEmision: fechaRelativa(-200),
    fechaVencimiento: fechaRelativa(165),
    organismoEmisor: 'Capitanía de Puerto — Inspector de Naves',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_matricula_personal_menor',
    reglaVersion: 1,
    tipoDocumento: 'Matrícula de Personal de Naves Menores',
    fechaEmision: fechaRelativa(-500),
    organismoEmisor: 'Capitanía de Puerto',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_marpol_residuos',
    reglaVersion: 1,
    tipoDocumento: 'Autorización de retiro de residuos MARPOL',
    fechaEmision: fechaRelativa(-100),
    fechaVencimiento: fechaRelativa(265),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_dona_berta',
    reglaId: 'rn_dispositivos_salvamento',
    reglaVersion: 1,
    tipoDocumento: 'Aprobación de dispositivos de salvamento',
    fechaEmision: fechaRelativa(-300),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),

  // ── Aysén Austral — 50.0 TRG exacto (cb_01: nave_menor).
  crearCertificado({
    naveId: 'nave_aysen_austral',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-2077',
    fechaEmision: fechaRelativa(-600),
    organismoEmisor: 'Capitanía de Puerto de Puerto Aysén',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_aysen_austral',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-2077',
    fechaEmision: fechaRelativa(-600),
    observaciones: 'TRG 50.0 — umbral exacto de nave_menor (Art. 26 y 51, D.L. 2.222/1978).',
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_aysen_austral',
    reglaId: 'rn_revista_cargo',
    reglaVersion: 1,
    tipoDocumento: 'Revista de Cargo',
    folio: 'RC-2077-26',
    fechaEmision: fechaRelativa(-350),
    fechaVencimiento: fechaRelativa(15),
    organismoEmisor: 'Capitanía de Puerto — Inspector de Naves',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_aysen_austral',
    reglaId: 'rn_marpol_residuos',
    reglaVersion: 1,
    tipoDocumento: 'Autorización de retiro de residuos MARPOL',
    fechaEmision: fechaRelativa(-180),
    fechaVencimiento: fechaRelativa(185),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),

  // ── Wellboat Patagonia — nave mayor por AB, transporta pasaje.
  // rn_dotacion_minima es la única regla VERIFICADA aplicable: se deja
  // vencida a propósito → única alerta roja real de la flota (documental).
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_dotacion_minima',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Dotación Mínima de Seguridad',
    folio: 'DOT-3301',
    fechaEmision: fechaRelativa(-800),
    fechaVencimiento: fechaRelativa(-15),
    organismoEmisor: 'Gobernación Marítima de Aysén',
    estado: 'vencido',
    observaciones: 'Vencido — requiere renovación inmediata antes de continuar operando con pasaje.',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-3301',
    fechaEmision: fechaRelativa(-1500),
    organismoEmisor: 'Capitanía de Puerto de Puerto Chacabuco',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-3301',
    fechaEmision: fechaRelativa(-1500),
    observaciones: 'Sin TRG registrado: clasificación derivada por Arqueo Bruto (320 AB).',
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_hipotecas',
    reglaVersion: 1,
    tipoDocumento: 'Inscripción en Registro de Hipotecas, Gravámenes y Prohibiciones',
    fechaEmision: fechaRelativa(-1500),
    organismoEmisor: 'Registro de Naves DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_distintivo_llamada',
    reglaVersion: 1,
    tipoDocumento: 'Distintivo de Llamada / N° ISMM',
    folio: 'CBWP01',
    fechaEmision: fechaRelativa(-1500),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_cert_seguridad_pasaje',
    reglaVersion: 1,
    tipoDocumento: 'Certificado General de Seguridad para Naves de Pasaje (Modelo PU)',
    folio: 'PU-3301',
    fechaEmision: fechaRelativa(-300),
    fechaVencimiento: fechaRelativa(65),
    organismoEmisor: 'DIRECTEMAR — Sistema de Inspección de Naves',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_titulo_stcw',
    reglaVersion: 1,
    tipoDocumento: 'Título / Licencia STCW',
    fechaEmision: fechaRelativa(-900),
    fechaVencimiento: fechaRelativa(920),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_marpol_residuos',
    reglaVersion: 1,
    tipoDocumento: 'Autorización de retiro de residuos MARPOL',
    fechaEmision: fechaRelativa(-100),
    fechaVencimiento: fechaRelativa(265),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_wellboat_patagonia',
    reglaId: 'rn_dispositivos_salvamento',
    reglaVersion: 1,
    tipoDocumento: 'Aprobación de dispositivos de salvamento',
    fechaEmision: fechaRelativa(-300),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),

  // ── Pontón Melinka II — artefacto naval, permiso BNUP vigente
  // (rn_permiso_bnup: única regla verificada aplicable → alerta verde real).
  crearCertificado({
    naveId: 'nave_ponton_melinka_ii',
    reglaId: 'rn_permiso_bnup',
    reglaVersion: 1,
    tipoDocumento: 'Permiso de uso de bienes nacionales de uso público / fiscales',
    folio: 'BNUP-0087',
    fechaEmision: fechaRelativa(-200),
    fechaVencimiento: fechaRelativa(165),
    organismoEmisor: 'Gobernación Marítima de Aysén',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_ponton_melinka_ii',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-0087',
    fechaEmision: fechaRelativa(-600),
    organismoEmisor: 'Capitanía de Puerto de Melinka',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_ponton_melinka_ii',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-0087',
    fechaEmision: fechaRelativa(-600),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_ponton_melinka_ii',
    reglaId: 'rn_revision_proyecto_acuicola',
    reglaVersion: 1,
    tipoDocumento: 'Revisión de proyecto de nave menor con cubierta / artefacto de apoyo a acuicultura',
    fechaEmision: fechaRelativa(-600),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_ponton_melinka_ii',
    reglaId: 'rn_marpol_residuos',
    reglaVersion: 1,
    tipoDocumento: 'Autorización de retiro de residuos MARPOL',
    fechaEmision: fechaRelativa(-120),
    fechaVencimiento: fechaRelativa(245),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),

  // ── Cisne Rápido — 22 m eslora, 62 AB (cb_02: nave_mayor, exenta de
  // convenios internacionales por eslora). rn_dotacion_minima verificada
  // se deja vigente y sin fecha para no distraer del foco de este caso,
  // que es la advertencia de clasificación.
  crearCertificado({
    naveId: 'nave_cisne_rapido',
    reglaId: 'rn_dotacion_minima',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Dotación Mínima de Seguridad',
    folio: 'DOT-1590',
    fechaEmision: fechaRelativa(-400),
    organismoEmisor: 'Gobernación Marítima de Aysén',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_cisne_rapido',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-1590',
    fechaEmision: fechaRelativa(-800),
    observaciones: 'Sin TRG registrado: clasificación derivada por Arqueo Bruto (62 AB).',
    organismoEmisor: 'Capitanía de Puerto de Puerto Chacabuco',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_cisne_rapido',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-1590',
    fechaEmision: fechaRelativa(-800),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_cisne_rapido',
    reglaId: 'rn_hipotecas',
    reglaVersion: 1,
    tipoDocumento: 'Inscripción en Registro de Hipotecas, Gravámenes y Prohibiciones',
    fechaEmision: fechaRelativa(-800),
    organismoEmisor: 'Registro de Naves DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_cisne_rapido',
    reglaId: 'rn_distintivo_llamada',
    reglaVersion: 1,
    tipoDocumento: 'Distintivo de Llamada',
    folio: 'CB1590',
    fechaEmision: fechaRelativa(-800),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),

  // ── Estrella del Sur — deportiva, Certificado de Navegabilidad
  // (rn_navegabilidad_deportiva: única regla verificada tipo 'fijo' del
  // catálogo). Se deja a ~15 días de vencer: única alerta ámbar real.
  crearCertificado({
    naveId: 'nave_estrella_del_sur',
    reglaId: 'rn_navegabilidad_deportiva',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Navegabilidad',
    folio: 'NAV-0765',
    fechaEmision: fechaRelativa(-2145), // ≈ 72 meses - 15 días
    fechaVencimiento: fechaRelativa(15),
    organismoEmisor: 'Capitanía de Puerto de Puerto Aysén',
    estado: 'por_vencer',
  }),
  crearCertificado({
    naveId: 'nave_estrella_del_sur',
    reglaId: 'rn_matricula',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Matrícula',
    folio: 'MAT-0765',
    fechaEmision: fechaRelativa(-2100),
    organismoEmisor: 'Capitanía de Puerto de Puerto Aysén',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_estrella_del_sur',
    reglaId: 'rn_arqueo',
    reglaVersion: 1,
    tipoDocumento: 'Certificado de Arqueo',
    folio: 'ARQ-0765',
    fechaEmision: fechaRelativa(-2100),
    organismoEmisor: 'DIRECTEMAR',
    estado: 'conforme',
  }),
  crearCertificado({
    naveId: 'nave_estrella_del_sur',
    reglaId: 'rn_revista_cargo',
    reglaVersion: 1,
    tipoDocumento: 'Revista de Cargo',
    folio: 'RC-0765-26',
    fechaEmision: fechaRelativa(-100),
    fechaVencimiento: fechaRelativa(265),
    organismoEmisor: 'Capitanía de Puerto — Inspector de Naves',
    estado: 'conforme',
  }),
];

// ─────────────────────────────────────────────────────────────
// Insumos — generados desde `plantillas_insumos` del catálogo, con
// overrides puntuales por nave para ejercitar el motor en la demo.
// ─────────────────────────────────────────────────────────────

interface PlantillaInsumo {
  descripcion: string;
  tipoControl: TipoControlInsumo;
  reglaId?: string;
  minimoFormula?: string;
  intervaloServicioMeses?: number;
  unidad?: string;
}

interface PlantillaCategoria {
  categoria: CategoriaInsumo;
  items: PlantillaInsumo[];
}

const catalogo = catalogoRaw as unknown as { plantillas_insumos: PlantillaCategoria[] };

function minimoPorDefecto(item: PlantillaInsumo, dotacion: number): number {
  if (item.minimoFormula === 'dotacionAutorizada + 10%') {
    return Math.max(1, Math.ceil(dotacion * 1.1));
  }
  if (item.unidad === 'litros') return 200;
  if (item.tipoControl === 'stock') return 2;
  return 1;
}

function cantidadConforme(minimo: number, item: PlantillaInsumo): number {
  if (item.unidad === 'litros') return minimo + 50;
  return minimo + 2;
}

let contadorInsumo = 0;
function generarInsumosParaNave(
  naveId: string,
  dotacion: number,
  overrides: Record<string, Partial<Insumo>> = {}
): Insumo[] {
  const insumos: Insumo[] = [];
  for (const grupo of catalogo.plantillas_insumos) {
    for (const item of grupo.items) {
      contadorInsumo += 1;
      const minimoExigido = minimoPorDefecto(item, dotacion);
      const base: Insumo = {
        id: `insumo_${String(contadorInsumo).padStart(4, '0')}`,
        naveId,
        categoria: grupo.categoria,
        descripcion: item.descripcion,
        tipoControl: item.tipoControl,
        cantidad: cantidadConforme(minimoExigido, item),
        minimoExigido,
        unidad: item.unidad,
        reglaId: item.reglaId,
        estado: 'conforme',
        ubicacionABordo: undefined,
        evidencias: [],
      };
      if (item.tipoControl === 'vencimiento') {
        base.fechaVencimiento = fechaRelativa(180);
      }
      if (item.tipoControl === 'servicio') {
        base.fechaUltimoServicio = fechaRelativa(-60);
        base.intervaloServicioMeses = item.intervaloServicioMeses ?? 12;
      }
      const override = overrides[item.descripcion];
      insumos.push(override ? { ...base, ...override } : base);
    }
  }
  return insumos;
}

export const insumosSemilla: Insumo[] = [
  // Doña Berta: certificados OK, pero un chaleco salvavidas vencido →
  // aptaParaInspeccion = false pese a que el "certificado" sigue conforme (cb_06).
  ...generarInsumosParaNave('nave_dona_berta', 4, {
    'Chaleco salvavidas': { fechaVencimiento: fechaRelativa(-5) },
  }),
  // Aysén Austral: señales pirotécnicas a ~20 días de vencer → alerta ámbar real.
  ...generarInsumosParaNave('nave_aysen_austral', 3, {
    'Señales pirotécnicas': { fechaVencimiento: fechaRelativa(20) },
  }),
  // Wellboat Patagonia: además del certificado vencido, un déficit de stock
  // de repuestos críticos de propulsión (revista de cargo con faltantes).
  ...generarInsumosParaNave('nave_wellboat_patagonia', 9, {
    'Repuestos críticos de propulsión': { cantidad: 0, minimoExigido: 2 },
  }),
  ...generarInsumosParaNave('nave_ponton_melinka_ii', 0),
  ...generarInsumosParaNave('nave_cisne_rapido', 4),
  ...generarInsumosParaNave('nave_estrella_del_sur', 1),
];
