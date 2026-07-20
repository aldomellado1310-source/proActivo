import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Card';
import { EstadoBadge, CriticidadBadge } from '../components/Badge';
import { EtiquetasFiltro } from '../components/EtiquetasFiltro';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import { coincide, valoresUnicos } from '../filtro';
import type { EstadoCumplimiento } from '../../types/schema';

type Filtro = 'todos' | EstadoCumplimiento;

const ESTADOS_ALERTA = ['vencido', 'por_vencer', 'faltante'];

export function Certificados() {
  const { estado } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [filtroDocumento, setFiltroDocumento] = useState('');

  const filas = useMemo(() => {
    const todas = estado.naves.flatMap((nave) => {
      const resultado = evaluaciones[nave.id];
      return resultado.documentos.map((doc) => ({ nave, doc }));
    });
    return todas.sort((a, b) => (a.doc.diasParaVencer ?? Infinity) - (b.doc.diasParaVencer ?? Infinity));
  }, [estado.naves, evaluaciones]);

  const filtradas = filas
    .filter((f) => filtro === 'todos' || f.doc.estado === filtro)
    .filter((f) => coincide(f.doc.documentoExigido, filtroDocumento));

  const valoresDocumento = valoresUnicos(filas.map((f) => f.doc.documentoExigido));

  // Ventanas agrupadas por nave: dentro de cada una, los documentos siguen
  // ordenados por fecha de vencimiento (más urgente primero) porque el orden
  // de `filas` ya es global por fecha y se preserva al agrupar. La cola
  // urgente cruzando toda la flota, sin importar la nave, vive en el Panel
  // ("Próximos vencimientos"); esta vista es el detalle completo por nave.
  const gruposPorNave = useMemo(() => {
    const mapa = new Map<string, { nave: (typeof filtradas)[number]['nave']; filas: typeof filtradas }>();
    for (const fila of filtradas) {
      if (!mapa.has(fila.nave.id)) mapa.set(fila.nave.id, { nave: fila.nave, filas: [] });
      mapa.get(fila.nave.id)!.filas.push(fila);
    }
    return [...mapa.values()];
  }, [filtradas]);

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
          Certificados de la flota agrupados por nave; dentro de cada una, ordenados por fecha de
          vencimiento. Las reglas no verificadas se muestran en gris y nunca cuentan como alerta
          automática.
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

      {gruposPorNave.length === 0 ? (
        <div className="pa-card">
          <EmptyState>No hay certificados en esta categoría.</EmptyState>
        </div>
      ) : (
        <div className="pa-grupos-nave pa-fade-remonta" key={filtro}>
          {gruposPorNave.map(({ nave, filas: filasNave }) => {
            const alertas = filasNave.filter((f) => ESTADOS_ALERTA.includes(f.doc.estado)).length;
            return (
              <details key={nave.id} className="pa-grupo-nave" open={filtro !== 'todos' || gruposPorNave.length === 1}>
                <summary className="pa-grupo-nave__resumen">
                  <span className="pa-grupo-nave__nombre">{nave.nombre}</span>
                  <span className="pa-grupo-nave__meta">
                    {filasNave.length} {filasNave.length === 1 ? 'documento' : 'documentos'}
                    {alertas > 0 && <span className="pa-grupo-nave__alerta"> · {alertas} con alerta</span>}
                  </span>
                </summary>
                <div className="pa-grupo-nave__acciones">
                  <Link to={`/flota/${nave.id}?tab=certificados`}>Ver ficha de la nave →</Link>
                </div>
                <div className="pa-table-wrap">
                  <table className="pa-table">
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Criticidad</th>
                        <th>Vence en</th>
                        <th>Estado</th>
                      </tr>
                      <tr className="pa-fila-filtros">
                        <th>
                          <input
                            className="pa-input-filtro"
                            placeholder="Filtrar…"
                            value={filtroDocumento}
                            onChange={(e) => setFiltroDocumento(e.target.value)}
                            aria-label="Filtrar por documento"
                          />
                          <EtiquetasFiltro
                            valores={valoresDocumento}
                            activo={filtroDocumento}
                            onSeleccionar={setFiltroDocumento}
                          />
                        </th>
                        <th></th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasNave.map(({ doc }) => (
                        <tr key={doc.reglaId}>
                          <td>{doc.documentoExigido}</td>
                          <td>
                            <CriticidadBadge criticidad={doc.criticidad} />
                          </td>
                          <td className="pa-mono">
                            {doc.diasParaVencer !== undefined ? `${doc.diasParaVencer} días` : '—'}
                          </td>
                          <td>
                            <EstadoBadge estado={doc.estado} requiereConfirmacionManual={doc.requiereConfirmacionManual} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
