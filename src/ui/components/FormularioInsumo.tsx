import { useState, type FormEvent } from 'react';
import type { Insumo } from '../../types/schema';

interface FormularioInsumoProps {
  insumo: Insumo;
  onGuardar: (insumo: Insumo) => void;
  onCancelar: () => void;
}

/**
 * Solicitud de actualización de insumo: edita solo los parámetros de los que
 * depende su vencimiento según `tipoControl` (ver motor/estados.ts,
 * evaluarInsumo) — el resto de campos del insumo (categoría, mínimo exigido,
 * etc.) no cambian aquí. Sin fecha fija (tipoControl 'inspeccion') no hay
 * nada que editar, así que NaveDetalle no ofrece este formulario para esos.
 */
export function FormularioInsumo({ insumo, onGuardar, onCancelar }: FormularioInsumoProps) {
  const [fechaVencimiento, setFechaVencimiento] = useState(insumo.fechaVencimiento ?? '');
  const [fechaUltimoServicio, setFechaUltimoServicio] = useState(insumo.fechaUltimoServicio ?? '');
  const [intervaloServicioMeses, setIntervaloServicioMeses] = useState(
    insumo.intervaloServicioMeses?.toString() ?? ''
  );
  const [cantidad, setCantidad] = useState(insumo.cantidad.toString());

  function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    const actualizado: Insumo = { ...insumo };
    if (insumo.tipoControl === 'vencimiento') {
      actualizado.fechaVencimiento = fechaVencimiento || undefined;
    } else if (insumo.tipoControl === 'servicio') {
      actualizado.fechaUltimoServicio = fechaUltimoServicio || undefined;
      actualizado.intervaloServicioMeses = intervaloServicioMeses ? Number(intervaloServicioMeses) : undefined;
    } else if (insumo.tipoControl === 'stock') {
      actualizado.cantidad = Number(cantidad);
    }
    onGuardar(actualizado);
  }

  return (
    <form className="pa-card" style={{ background: '#fbfdff' }} onSubmit={manejarEnvio}>
      <h4 style={{ marginBottom: 12 }}>Solicitud de actualización</h4>
      <div className="pa-grid-2">
        {insumo.tipoControl === 'vencimiento' && (
          <div className="pa-campo">
            <label htmlFor="fechaVencimientoInsumo">Fecha de vencimiento</label>
            <input
              id="fechaVencimientoInsumo"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
        )}
        {insumo.tipoControl === 'servicio' && (
          <>
            <div className="pa-campo">
              <label htmlFor="fechaUltimoServicioInsumo">Fecha de último servicio</label>
              <input
                id="fechaUltimoServicioInsumo"
                type="date"
                value={fechaUltimoServicio}
                onChange={(e) => setFechaUltimoServicio(e.target.value)}
              />
            </div>
            <div className="pa-campo">
              <label htmlFor="intervaloServicioInsumo">Intervalo de servicio (meses)</label>
              <input
                id="intervaloServicioInsumo"
                type="number"
                min={1}
                value={intervaloServicioMeses}
                onChange={(e) => setIntervaloServicioMeses(e.target.value)}
              />
            </div>
          </>
        )}
        {insumo.tipoControl === 'stock' && (
          <div className="pa-campo">
            <label htmlFor="cantidadInsumo">Cantidad a bordo</label>
            <input
              id="cantidadInsumo"
              type="number"
              min={0}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
            <span className="pa-texto-suave" style={{ fontSize: '0.78rem' }}>
              Mínimo exigido: {insumo.minimoExigido} {insumo.unidad ?? ''}
            </span>
          </div>
        )}
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
