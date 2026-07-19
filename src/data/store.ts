/**
 * Store de la demo: datos semilla + overlay en localStorage.
 *
 * No hay backend. Todo cambio (registrar certificado, cargar evidencia,
 * ajustar stock de un insumo) se guarda en `localStorage` bajo la clave
 * `navix-demo-v1`. El botón "Restablecer demo" borra el overlay y
 * vuelve a los datos semilla.
 */
import type { Armador, Certificado, Insumo, ReglaNormativa } from '../types/schema';
import type { NaveSemilla } from './seed';
import {
  armadoresSemilla,
  certificadosSemilla,
  insumosSemilla,
  navesSemilla,
} from './seed';
import catalogoRaw from './catalogo-reglas.json';

export const CLAVE_STORAGE = 'navix-demo-v1';

const catalogo = catalogoRaw as unknown as {
  _meta: { descripcion: string; version: string; fechaGeneracion: string; advertencia: string };
  reglas_normativas: ReglaNormativa[];
};

export const reglasCatalogo: ReglaNormativa[] = catalogo.reglas_normativas;
export const advertenciaReglasNoVerificadas: string = catalogo._meta.advertencia;

export type PerfilId = 'gestor_flota' | 'patron_nave';

export interface Perfil {
  id: PerfilId;
  nombre: string;
  cargo: string;
}

export const PERFILES_DEMO: Perfil[] = [
  { id: 'gestor_flota', nombre: 'Paula Cárcamo', cargo: 'Gestora de Flota' },
  { id: 'patron_nave', nombre: 'Iván Barría', cargo: 'Patrón de Nave' },
];

export interface EstadoDemo {
  armadores: Armador[];
  naves: NaveSemilla[];
  certificados: Certificado[];
  insumos: Insumo[];
  perfilActivoId: PerfilId | null;
}

function estadoSemilla(): EstadoDemo {
  return {
    armadores: armadoresSemilla,
    naves: navesSemilla,
    certificados: certificadosSemilla,
    insumos: insumosSemilla,
    perfilActivoId: null,
  };
}

function storageDisponible(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function cargarEstado(): EstadoDemo {
  if (!storageDisponible()) return estadoSemilla();
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return estadoSemilla();
    const parseado = JSON.parse(crudo) as EstadoDemo;
    // Validación mínima: si falta alguna colección, se recompone desde la semilla.
    if (!parseado.naves || !parseado.certificados || !parseado.insumos) {
      return estadoSemilla();
    }
    return { ...estadoSemilla(), ...parseado };
  } catch {
    return estadoSemilla();
  }
}

export function guardarEstado(estado: EstadoDemo): void {
  if (!storageDisponible()) return;
  window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
}

export function restablecerDemo(): EstadoDemo {
  if (storageDisponible()) {
    window.localStorage.removeItem(CLAVE_STORAGE);
  }
  return estadoSemilla();
}

// ─────────────────────────────────────────────────────────────
// Operaciones de alto nivel usadas por la UI
// ─────────────────────────────────────────────────────────────

export function establecerPerfilActivo(perfilId: PerfilId): EstadoDemo {
  const estado = cargarEstado();
  const nuevo = { ...estado, perfilActivoId: perfilId };
  guardarEstado(nuevo);
  return nuevo;
}

export function cerrarSesion(): EstadoDemo {
  const estado = cargarEstado();
  const nuevo = { ...estado, perfilActivoId: null };
  guardarEstado(nuevo);
  return nuevo;
}

export function guardarCertificado(certificado: Certificado): EstadoDemo {
  const estado = cargarEstado();
  const existe = estado.certificados.some((c) => c.id === certificado.id);
  const certificados = existe
    ? estado.certificados.map((c) => (c.id === certificado.id ? certificado : c))
    : [...estado.certificados, certificado];
  const nuevo = { ...estado, certificados };
  guardarEstado(nuevo);
  return nuevo;
}

export function guardarInsumo(insumo: Insumo): EstadoDemo {
  const estado = cargarEstado();
  const existe = estado.insumos.some((i) => i.id === insumo.id);
  const insumos = existe
    ? estado.insumos.map((i) => (i.id === insumo.id ? insumo : i))
    : [...estado.insumos, insumo];
  const nuevo = { ...estado, insumos };
  guardarEstado(nuevo);
  return nuevo;
}

export function nuevoIdCertificado(): string {
  return `cert_${Date.now().toString(36)}`;
}
