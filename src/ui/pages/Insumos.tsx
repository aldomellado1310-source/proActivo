import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Card';
import { EstadoBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import type { CategoriaInsumo } from '../../types/schema';

const ETIQUETAS_CATEGORIA: Record<CategoriaInsumo, string> = {
  salvamento: 'Salvamento',
  contra_incendio: 'Contra incendio',
  nautico_comunicaciones: 'Náutico / comunicaciones',
  sanitario: 'Sanitario',
  operacional: 'Operacional',
  faena_amarre: 'Faena y amarre',
  marpol: 'MARPOL',
};

const ESTADOS_ALERTA = ['vencido', 'por_vencer', 'faltante'];

export function Insumos() {
  const { estado } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaInsumo | 'todas'>('todas');

  const filas = useMemo(() => {
    return estado.naves.flatMap((nave) => {
      const resultado = evaluaciones[nave.id];
      return resultado.insumos.map((i) => {
        const insumo = estado.insumos.find((ins) => ins.id === i.insumoId)!;
        return { nave, insumo, evaluado: i };
      });
    });
  }, [estado.naves, estado.insumos, evaluaciones]);

  const filtradas = filas.filter((f) => {
    if (categoria !== 'todas' && f.insumo.categoria !== categoria) return false;
    if (soloAlertas && !ESTADOS_ALERTA.includes(f.evaluado.estado)) return false;
    return true;
  });

  // Ventanas agrupadas por nave en vez de una tabla plana de ~120 filas: cada
  // nave es su propia sección plegable, así el panel no obliga a un scroll
  // interminable para encontrar un insumo puntual.
  const gruposPorNave = useMemo(() => {
    const mapa = new Map<string, { nave: (typeof filtradas)[number]['nave']; filas: typeof filtradas }>();
    for (const fila of filtradas) {
      if (!mapa.has(fila.nave.id)) mapa.set(fila.nave.id, { nave: fila.nave, filas: [] });
      mapa.get(fila.nave.id)!.filas.push(fila);
    }
    return [...mapa.values()];
  }, [filtradas]);

  return (
    <>
      <div>
        <h1>Insumos</h1>
        <p className="pa-texto-suave">
          Inventario de insumos de la flota, con vencimientos y déficit de stock. Agrupado por
          nave — cada una es su propia ventana.
        </p>
      </div>

      <div className="pa-flex" style={{ flexWrap: 'wrap' }}>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaInsumo | 'todas')}>
          <option value="todas">Todas las categorías</option>
          {Object.entries(ETIQUETAS_CATEGORIA).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
        <label className="pa-flex" style={{ gap: 6 }}>
          <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />
          Solo con alerta
        </label>
      </div>

      {gruposPorNave.length === 0 ? (
        <div className="pa-card">
          <EmptyState>No hay insumos que coincidan con el filtro.</EmptyState>
        </div>
      ) : (
        <div className="pa-grupos-nave pa-fade-remonta" key={`${categoria}-${soloAlertas}`}>
          {gruposPorNave.map(({ nave, filas: filasNave }) => {
            const alertas = filasNave.filter((f) => ESTADOS_ALERTA.includes(f.evaluado.estado)).length;
            return (
              <details key={nave.id} className="pa-grupo-nave" open={soloAlertas || gruposPorNave.length === 1}>
                <summary className="pa-grupo-nave__resumen">
                  <span className="pa-grupo-nave__nombre">{nave.nombre}</span>
                  <span className="pa-grupo-nave__meta">
                    {filasNave.length} {filasNave.length === 1 ? 'insumo' : 'insumos'}
                    {alertas > 0 && <span className="pa-grupo-nave__alerta"> · {alertas} con alerta</span>}
                  </span>
                </summary>
                <div className="pa-grupo-nave__acciones">
                  <Link to={`/flota/${nave.id}?tab=insumos`}>Ver ficha de la nave →</Link>
                </div>
                <div className="pa-table-wrap">
                  <table className="pa-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th>Categoría</th>
                        <th>Detalle</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasNave.map(({ insumo, evaluado }) => (
                        <tr key={insumo.id}>
                          <td>{insumo.descripcion}</td>
                          <td>{ETIQUETAS_CATEGORIA[insumo.categoria]}</td>
                          <td className="pa-mono">
                            {evaluado.diasParaVencer !== undefined
                              ? `${evaluado.diasParaVencer} días`
                              : evaluado.deficitCantidad !== undefined
                                ? `Déficit: ${evaluado.deficitCantidad} ${insumo.unidad ?? ''}`
                                : '—'}
                          </td>
                          <td>
                            <EstadoBadge estado={evaluado.estado} />
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
