import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, EmptyState } from '../components/Card';
import { EstadoBadge, CriticidadBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import type { EstadoCumplimiento } from '../../types/schema';

type Filtro = 'todos' | EstadoCumplimiento;

export function Certificados() {
  const { estado } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const filas = useMemo(() => {
    const todas = estado.naves.flatMap((nave) => {
      const resultado = evaluaciones[nave.id];
      return resultado.documentos.map((doc) => ({ nave, doc }));
    });
    return todas.sort((a, b) => (a.doc.diasParaVencer ?? Infinity) - (b.doc.diasParaVencer ?? Infinity));
  }, [estado.naves, evaluaciones]);

  const filtradas = filtro === 'todos' ? filas : filas.filter((f) => f.doc.estado === filtro);

  const opciones: { valor: Filtro; etiqueta: string }[] = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'vencido', etiqueta: 'Vencidos' },
    { valor: 'por_vencer', etiqueta: 'Por vencer' },
    { valor: 'faltante', etiqueta: 'Faltantes' },
    { valor: 'conforme', etiqueta: 'Conformes' },
    { valor: 'indeterminado', etiqueta: 'Requieren confirmación' },
  ];

  return (
    <>
      <div>
        <h1>Certificados</h1>
        <p className="pa-texto-suave">
          Cola de vencimientos de toda la flota, ordenada por fecha. Las reglas no verificadas se
          muestran en gris y nunca cuentan como alerta automática.
        </p>
      </div>

      <div className="pa-flex" style={{ flexWrap: 'wrap' }}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            className={`pa-btn ${filtro === o.valor ? 'pa-btn--primario' : 'pa-btn--secundario'}`}
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            onClick={() => setFiltro(o.valor)}
          >
            {o.etiqueta}
          </button>
        ))}
      </div>

      <Card>
        {filtradas.length === 0 ? (
          <EmptyState>No hay certificados en esta categoría.</EmptyState>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Nave</th>
                  <th>Documento</th>
                  <th>Criticidad</th>
                  <th>Vence en</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(({ nave, doc }) => (
                  <tr key={`${nave.id}-${doc.reglaId}`} className="clickable">
                    <td>
                      <Link to={`/flota/${nave.id}?tab=certificados`}>{nave.nombre}</Link>
                    </td>
                    <td>{doc.documentoExigido}</td>
                    <td>
                      <CriticidadBadge criticidad={doc.criticidad} />
                    </td>
                    <td className="pa-mono">{doc.diasParaVencer !== undefined ? `${doc.diasParaVencer} días` : '—'}</td>
                    <td>
                      <EstadoBadge estado={doc.estado} requiereConfirmacionManual={doc.requiereConfirmacionManual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
