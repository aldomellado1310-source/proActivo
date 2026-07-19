import { useState, type FormEvent } from 'react';
import type { Certificado, ReglaNormativa } from '../../types/schema';
import { nuevoIdCertificado } from '../../data/store';

interface FormularioCertificadoProps {
  naveId: string;
  reglasDisponibles: ReglaNormativa[];
  certificadoExistente?: Certificado;
  reglaPreseleccionada?: string;
  onGuardar: (certificado: Certificado) => void;
  onCancelar: () => void;
}

export function FormularioCertificado({
  naveId,
  reglasDisponibles,
  certificadoExistente,
  reglaPreseleccionada,
  onGuardar,
  onCancelar,
}: FormularioCertificadoProps) {
  const [reglaId, setReglaId] = useState(
    certificadoExistente?.reglaId ?? reglaPreseleccionada ?? reglasDisponibles[0]?.id ?? ''
  );
  const [folio, setFolio] = useState(certificadoExistente?.folio ?? '');
  const [fechaEmision, setFechaEmision] = useState(
    certificadoExistente?.fechaEmision ?? new Date().toISOString().slice(0, 10)
  );
  const [fechaVencimiento, setFechaVencimiento] = useState(certificadoExistente?.fechaVencimiento ?? '');
  const [organismoEmisor, setOrganismoEmisor] = useState(certificadoExistente?.organismoEmisor ?? '');
  const [observaciones, setObservaciones] = useState(certificadoExistente?.observaciones ?? '');

  const reglaSeleccionada = reglasDisponibles.find((r) => r.id === reglaId);

  function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    if (!reglaSeleccionada) return;
    const certificado: Certificado = {
      id: certificadoExistente?.id ?? nuevoIdCertificado(),
      naveId,
      reglaId: reglaSeleccionada.id,
      reglaVersion: reglaSeleccionada.version,
      tipoDocumento: reglaSeleccionada.documentoExigido,
      folio: folio || undefined,
      fechaEmision,
      fechaVencimiento: fechaVencimiento || undefined,
      organismoEmisor: organismoEmisor || reglaSeleccionada.organismoEmisor,
      estado: 'conforme',
      cargadoPor: certificadoExistente?.cargadoPor ?? 'demo_usuario',
      cargadoEn: certificadoExistente?.cargadoEn ?? new Date().toISOString(),
      observaciones: observaciones || undefined,
    };
    onGuardar(certificado);
  }

  return (
    <form className="pa-card" style={{ background: '#fbfdff' }} onSubmit={manejarEnvio}>
      <h4 style={{ marginBottom: 12 }}>
        {certificadoExistente ? 'Renovar certificado' : 'Registrar certificado'}
      </h4>
      <div className="pa-grid-2">
        <div className="pa-campo">
          <label htmlFor="regla">Documento exigido</label>
          <select
            id="regla"
            value={reglaId}
            onChange={(e) => setReglaId(e.target.value)}
            disabled={!!certificadoExistente}
          >
            {reglasDisponibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.documentoExigido}
              </option>
            ))}
          </select>
        </div>
        <div className="pa-campo">
          <label htmlFor="folio">Folio</label>
          <input id="folio" value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="pa-campo">
          <label htmlFor="fechaEmision">Fecha de emisión</label>
          <input
            id="fechaEmision"
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            required
          />
        </div>
        <div className="pa-campo">
          <label htmlFor="fechaVencimiento">Fecha de vencimiento</label>
          <input
            id="fechaVencimiento"
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            disabled={reglaSeleccionada?.tipoPlazo === 'permanente' || reglaSeleccionada?.tipoPlazo === 'por_evento'}
          />
        </div>
        <div className="pa-campo">
          <label htmlFor="organismoEmisor">Organismo emisor</label>
          <input
            id="organismoEmisor"
            value={organismoEmisor}
            onChange={(e) => setOrganismoEmisor(e.target.value)}
            placeholder={reglaSeleccionada?.organismoEmisor}
          />
        </div>
        <div className="pa-campo">
          <label htmlFor="observaciones">Observaciones</label>
          <input id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </div>
      </div>
      <div className="pa-flex" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="pa-btn pa-btn--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="pa-btn pa-btn--primario">
          Guardar
        </button>
      </div>
    </form>
  );
}
