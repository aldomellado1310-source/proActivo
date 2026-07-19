import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, EmptyState } from '../components/Card';
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
    if (soloAlertas && !['vencido', 'por_vencer', 'faltante'].includes(f.evaluado.estado)) return false;
    return true;
  });

  return (
    <>
      <div>
        <h1>Insumos</h1>
        <p className="pa-texto-suave">Inventario de insumos de toda la flota, con vencimientos y déficit de stock.</p>
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

      <Card>
        {filtradas.length === 0 ? (
          <EmptyState>No hay insumos que coincidan con el filtro.</EmptyState>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Nave</th>
                  <th>Insumo</th>
                  <th>Categoría</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(({ nave, insumo, evaluado }) => (
                  <tr key={`${nave.id}-${insumo.id}`} className="clickable">
                    <td>
                      <Link to={`/flota/${nave.id}?tab=insumos`}>{nave.nombre}</Link>
                    </td>
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
        )}
      </Card>
    </>
  );
}
