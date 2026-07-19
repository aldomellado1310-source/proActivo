import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Certificado, Insumo } from '../types/schema';
import {
  cargarEstado,
  establecerPerfilActivo,
  cerrarSesion as cerrarSesionStore,
  guardarCertificado,
  guardarInsumo,
  restablecerDemo,
  reglasCatalogo,
  type EstadoDemo,
  type PerfilId,
} from '../data/store';

interface EstadoContextValor {
  estado: EstadoDemo;
  reglas: typeof reglasCatalogo;
  iniciarSesion: (perfilId: PerfilId) => void;
  cerrarSesion: () => void;
  guardarCert: (certificado: Certificado) => void;
  guardarIns: (insumo: Insumo) => void;
  reset: () => void;
}

const EstadoContext = createContext<EstadoContextValor | null>(null);

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoDemo>(() => cargarEstado());

  const iniciarSesion = useCallback((perfilId: PerfilId) => {
    setEstado(establecerPerfilActivo(perfilId));
  }, []);

  const cerrarSesion = useCallback(() => {
    setEstado(cerrarSesionStore());
  }, []);

  const guardarCert = useCallback((certificado: Certificado) => {
    setEstado(guardarCertificado(certificado));
  }, []);

  const guardarIns = useCallback((insumo: Insumo) => {
    setEstado(guardarInsumo(insumo));
  }, []);

  const reset = useCallback(() => {
    setEstado(restablecerDemo());
  }, []);

  const valor = useMemo<EstadoContextValor>(
    () => ({ estado, reglas: reglasCatalogo, iniciarSesion, cerrarSesion, guardarCert, guardarIns, reset }),
    [estado, iniciarSesion, cerrarSesion, guardarCert, guardarIns, reset]
  );

  return <EstadoContext.Provider value={valor}>{children}</EstadoContext.Provider>;
}

export function useEstadoDemo(): EstadoContextValor {
  const ctx = useContext(EstadoContext);
  if (!ctx) throw new Error('useEstadoDemo debe usarse dentro de <EstadoProvider>');
  return ctx;
}
