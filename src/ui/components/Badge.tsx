import type { EstadoCumplimiento, ReglaNormativa } from '../../types/schema';

const ETIQUETAS_ESTADO: Record<EstadoCumplimiento, string> = {
  conforme: 'Conforme',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  faltante: 'Faltante',
  indeterminado: 'Requiere confirmación',
};

export function EstadoBadge({
  estado,
  requiereConfirmacionManual,
}: {
  estado: EstadoCumplimiento;
  /** Si viene de una regla no_verificada, se refuerza el copy "gris". */
  requiereConfirmacionManual?: boolean;
}) {
  const etiqueta =
    requiereConfirmacionManual && estado === 'indeterminado'
      ? 'Requiere confirmación'
      : ETIQUETAS_ESTADO[estado];
  return <span className={`pa-badge pa-badge--${estado}`}>{etiqueta}</span>;
}

const ETIQUETAS_CRITICIDAD: Record<ReglaNormativa['criticidad'], string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export function CriticidadBadge({ criticidad }: { criticidad: ReglaNormativa['criticidad'] }) {
  return (
    <span className={`pa-badge pa-badge--criticidad-${criticidad}`} style={{ border: 'none' }}>
      {ETIQUETAS_CRITICIDAD[criticidad]}
    </span>
  );
}

export function VerificacionBadge({ estadoVerificacion }: { estadoVerificacion: ReglaNormativa['estadoVerificacion'] }) {
  if (estadoVerificacion === 'verificada') {
    return (
      <span className="pa-badge pa-badge--conforme" title="Fuente confirmada, puede disparar alertas automáticas">
        Verificada
      </span>
    );
  }
  if (estadoVerificacion === 'obsoleta') {
    return (
      <span className="pa-badge pa-badge--indeterminado" title="Reemplazada por una versión posterior de la norma">
        Obsoleta
      </span>
    );
  }
  return (
    <span
      className="pa-badge pa-badge--indeterminado"
      title="Cargada desde fuente pública sin validar — no dispara alertas automáticas"
    >
      No verificada
    </span>
  );
}
