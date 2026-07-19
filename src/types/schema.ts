/**
 * Sistema de Auditoría Marítima — DIRECTEMAR / TRG
 * Esquema de datos (Firestore + TypeScript)
 *
 * Principio rector: las reglas normativas son DATOS, no código.
 * Un cambio de circular se resuelve editando documentos de la
 * colección `reglas_normativas`, sin desplegar una versión nueva.
 */

// ─────────────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────────────

/** ISO 8601. Se guarda como Timestamp en Firestore. */
export type FechaISO = string;

export type EstadoVerificacion =
  | 'verificada'        // fuente confirmada, puede disparar alertas automáticas
  | 'no_verificada'     // cargada desde fuente pública sin validar → NO dispara alertas
  | 'obsoleta';         // reemplazada por una versión posterior de la norma

export type EstadoCumplimiento =
  | 'conforme'
  | 'por_vencer'
  | 'vencido'
  | 'faltante'
  | 'indeterminado';    // regla no verificada: el sistema debe poder decir "no sé"

export type CategoriaNave =
  | 'nave_menor'        // ≤ 50 TRG/AB
  | 'nave_mayor'        // > 50 TRG/AB
  | 'artefacto_naval';

export type UsoNave =
  | 'apoyo_acuicultura'
  | 'pesca_artesanal'
  | 'pesca_industrial'
  | 'transporte_pasajeros'
  | 'carga_cabotaje'
  | 'remolque'
  | 'deportiva_recreativa';

export type ZonaNavegacion = 'bahia' | 'costera' | 'alta_mar' | 'aguas_interiores';

export type TipoPlazo =
  | 'permanente'              // no vence salvo cambio de condiciones
  | 'fijo'                    // N meses desde emisión
  | 'condicional'             // vence por evento (modificación estructural, cambio de uso)
  | 'por_evento';             // se emite por ocurrencia, sin vigencia continua (ej. zarpe)

// ─────────────────────────────────────────────────────────────
// /fuentes_normativas/{fuenteId}
// ─────────────────────────────────────────────────────────────

export interface FuenteNormativa {
  id: string;
  norma: string;                    // "Circular O-71/010"
  organismo: 'DIRECTEMAR' | 'OMI' | 'SUBPESCA' | 'SERNAPESCA' | 'OTRO';
  descripcion: string;
  fechaPublicacion?: FechaISO;
  fechaConsulta: FechaISO;          // cuándo se verificó por última vez
  url?: string;
  vigente: boolean;
  reemplazadaPor?: string;          // id de la fuente que la sustituye
  notasVerificacion?: string;       // quién validó, con qué alcance
}

// ─────────────────────────────────────────────────────────────
// /reglas_normativas/{reglaId}
// El motor de evaluación consume esta colección.
// ─────────────────────────────────────────────────────────────

/** Condiciones que deben cumplirse para que la regla aplique a una nave. */
export interface CondicionAplicacion {
  categorias?: CategoriaNave[];
  usos?: UsoNave[];
  zonas?: ZonaNavegacion[];
  trgMin?: number;
  trgMax?: number;
  esloraMin?: number;
  esloraMax?: number;
  /** Si se especifica, la regla solo aplica en estas jurisdicciones. */
  jurisdicciones?: string[];
  /** La nave lleva pasajeros a bordo. */
  transportaPasajeros?: boolean;
  /** La nave cuenta con equipo de radiocomunicaciones. */
  tieneRadiocomunicaciones?: boolean;
}

export interface ReglaNormativa {
  id: string;
  documentoExigido: string;         // "Certificado de Matrícula"
  categoriaDocumento:
    | 'registro'
    | 'seguridad'
    | 'personal'
    | 'operacion'
    | 'ambiental';
  descripcionControl: string;       // qué controla en la práctica
  condicion: CondicionAplicacion;
  tipoPlazo: TipoPlazo;
  /** Solo si tipoPlazo === 'fijo'. */
  vigenciaMeses?: number;
  /** Solo si tipoPlazo === 'condicional': eventos que obligan a renovar. */
  eventosRenovacion?: string[];     // ["modificacion_estructural", "reparacion_mayor"]
  organismoEmisor: string;
  fuenteId: string;                 // → FuenteNormativa
  estadoVerificacion: EstadoVerificacion;
  /** Impacto si la regla está mal evaluada — insumo del FMEA. */
  criticidad: 'critica' | 'alta' | 'media' | 'baja';
  /** Versión de la regla. Los certificados históricos apuntan a la versión que los evaluó. */
  version: number;
  vigenteDesde: FechaISO;
  vigenteHasta?: FechaISO;
}

// ─────────────────────────────────────────────────────────────
// /jurisdicciones/{jurisdiccionId}
// ─────────────────────────────────────────────────────────────

export interface Jurisdiccion {
  id: string;                       // "cp_puerto_aysen"
  gobernacionMaritima: string;      // "Gobernación Marítima de Aysén"
  capitaniaPuerto: string;          // "Puerto Aysén"
  region: string;                   // "Aysén del General Carlos Ibáñez del Campo"
  /** Sobrescrituras locales: reglaId → cambios aplicables. */
  criteriosLocales?: Record<string, Partial<ReglaNormativa>>;
  notas?: string;
}

// ─────────────────────────────────────────────────────────────
// /armadores/{armadorId}
// ─────────────────────────────────────────────────────────────

export interface Armador {
  id: string;
  rut: string;
  razonSocial: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  jurisdiccionPrincipalId: string;
  activo: boolean;
  creadoEn: FechaISO;
}

// ─────────────────────────────────────────────────────────────
// /naves/{naveId}
// ─────────────────────────────────────────────────────────────

export interface Nave {
  id: string;
  armadorId: string;
  matricula: string;                // único por capitanía
  nombre: string;
  categoria: CategoriaNave;         // derivada, no ingresada manualmente
  trg?: number;
  arqueoBruto?: number;
  esloraTotal: number;              // metros
  mangaMaxima?: number;
  puntal?: number;
  anioConstruccion?: number;
  material?: string;
  potenciaPropulsoraKw?: number;
  uso: UsoNave;
  zonaNavegacionAutorizada: ZonaNavegacion;
  jurisdiccionId: string;
  distintivoLlamada?: string;
  numeroISMM?: string;
  dotacionAutorizada?: number;
  /** Estado agregado calculado: certificados + insumos. */
  estadoCumplimiento: EstadoCumplimiento;
  ultimaEvaluacion?: FechaISO;
  activa: boolean;
}

// ─────────────────────────────────────────────────────────────
// /naves/{naveId}/certificados/{certificadoId}
// ─────────────────────────────────────────────────────────────

export interface Certificado {
  id: string;
  naveId: string;
  reglaId: string;                  // → ReglaNormativa
  /** Versión de la regla bajo la que se evaluó. Nunca se actualiza. */
  reglaVersion: number;
  tipoDocumento: string;
  folio?: string;
  fechaEmision: FechaISO;
  fechaVencimiento?: FechaISO;      // null si tipoPlazo === 'permanente'
  organismoEmisor: string;
  estado: EstadoCumplimiento;
  /** Ruta en Storage. Inmutable: una corrección crea un documento nuevo. */
  archivoUrl?: string;
  archivoHash?: string;
  cargadoPor: string;               // uid
  cargadoEn: FechaISO;
  observaciones?: string;
}

// ─────────────────────────────────────────────────────────────
// /naves/{naveId}/insumos/{insumoId}
// ─────────────────────────────────────────────────────────────

export type CategoriaInsumo =
  | 'salvamento'
  | 'contra_incendio'
  | 'nautico_comunicaciones'
  | 'sanitario'
  | 'operacional'
  | 'faena_amarre'
  | 'marpol';

export type TipoControlInsumo =
  | 'vencimiento'        // caduca en fecha
  | 'servicio'           // requiere recarga/mantención periódica
  | 'stock'              // se controla por cantidad mínima
  | 'inspeccion';        // se controla por desgaste, sin fecha fija

export interface Insumo {
  id: string;
  naveId: string;
  categoria: CategoriaInsumo;
  descripcion: string;
  tipoControl: TipoControlInsumo;
  cantidad: number;
  /** Derivado del tipo de nave, TRG y dotación — no se ingresa manualmente. */
  minimoExigido: number;
  unidad?: string;
  fechaVencimiento?: FechaISO;
  fechaUltimoServicio?: FechaISO;
  intervaloServicioMeses?: number;
  homologado?: boolean;
  numeroHomologacion?: string;
  /** Regla que exige este insumo. Su vencimiento es independiente del certificado. */
  reglaId?: string;
  estado: EstadoCumplimiento;
  ubicacionABordo?: string;
  evidencias?: EvidenciaInsumo[];
}

export interface EvidenciaInsumo {
  fotoUrl: string;
  fecha: FechaISO;
  lat?: number;
  lng?: number;
  registradoPor: string;
}

// ─────────────────────────────────────────────────────────────
// /naves/{naveId}/inspecciones/{inspeccionId}
// ─────────────────────────────────────────────────────────────

export interface Inspeccion {
  id: string;
  naveId: string;
  tipo: 'revista_cargo' | 'auditoria_interna' | 'renovacion' | 'inicial' | 'extraordinaria';
  fecha: FechaISO;
  inspector: string;
  jurisdiccionId?: string;
  resultado: 'aprobada' | 'aprobada_con_observaciones' | 'rechazada' | 'pendiente';
  hallazgos: Hallazgo[];
  observaciones?: string;
  /** Snapshot del estado de la nave al momento de inspeccionar. */
  snapshotEstado?: EstadoCumplimiento;
}

export interface Hallazgo {
  reglaId?: string;
  insumoId?: string;
  descripcion: string;
  severidad: 'critica' | 'mayor' | 'menor' | 'observacion';
  plazoSubsanacionDias?: number;
  subsanado: boolean;
  fechaSubsanacion?: FechaISO;
  evidenciaUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// Resultado del motor de evaluación
// ─────────────────────────────────────────────────────────────

export interface ResultadoEvaluacion {
  naveId: string;
  evaluadoEn: FechaISO;
  estadoGlobal: EstadoCumplimiento;
  /** Regla aplicable → estado del documento correspondiente. */
  documentos: {
    reglaId: string;
    documentoExigido: string;
    estado: EstadoCumplimiento;
    diasParaVencer?: number;
    certificadoId?: string;
    criticidad: ReglaNormativa['criticidad'];
    /** true si la regla no está verificada → no debe generar alerta automática. */
    requiereConfirmacionManual: boolean;
  }[];
  insumos: {
    insumoId: string;
    descripcion: string;
    estado: EstadoCumplimiento;
    diasParaVencer?: number;
    deficitCantidad?: number;
  }[];
  /**
   * Una nave con certificados vigentes pero insumos vencidos NO es conforme.
   * Este flag alimenta la vista de "preparación para revista de cargo".
   */
  aptaParaInspeccion: boolean;
}

// ─────────────────────────────────────────────────────────────
// Mapa de colecciones Firestore
// ─────────────────────────────────────────────────────────────

/*
  /fuentes_normativas/{fuenteId}
  /reglas_normativas/{reglaId}
  /jurisdicciones/{jurisdiccionId}
  /armadores/{armadorId}
  /naves/{naveId}
      /certificados/{certificadoId}
      /insumos/{insumoId}
      /inspecciones/{inspeccionId}
      /evaluaciones/{evaluacionId}      ← histórico de ResultadoEvaluacion
  /usuarios/{uid}

  Índices compuestos sugeridos:
    naves:        armadorId + estadoCumplimiento
    naves:        jurisdiccionId + activa
    certificados: naveId + fechaVencimiento (asc)   → cola de vencimientos
    insumos:      naveId + estado
    insumos:      naveId + categoria + fechaVencimiento (asc)

  Notas de diseño offline-first:
    - Habilitar persistencia local de Firestore para uso en fiordos sin señal.
    - Las evidencias fotográficas se encolan localmente y suben al recuperar red.
    - El motor de evaluación debe poder correr en cliente con las reglas cacheadas,
      no solo en Cloud Functions.
*/
