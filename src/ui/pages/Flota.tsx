import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { EstadoBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  nave_menor: 'Nave menor',
  nave_mayor: 'Nave mayor',
  artefacto_naval: 'Artefacto naval',
};

export function Flota() {
  const { estado } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();

  return (
    <>
      <div>
        <h1>Flota</h1>
        <p className="pa-texto-suave">{estado.naves.length} naves registradas en la Región de Aysén.</p>
      </div>

      <Card>
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Nave</th>
                <th>Matrícula</th>
                <th>Armador</th>
                <th>Categoría</th>
                <th>TRG / AB</th>
                <th>Estado</th>
                <th>Apta insp.</th>
              </tr>
            </thead>
            <tbody>
              {estado.naves.map((nave) => {
                const armador = estado.armadores.find((a) => a.id === nave.armadorId);
                const resultado = evaluaciones[nave.id];
                return (
                  <tr key={nave.id} className="clickable">
                    <td>
                      <Link to={`/flota/${nave.id}`}>
                        <strong>{nave.nombre}</strong>
                      </Link>
                    </td>
                    <td>{nave.matricula}</td>
                    <td>{armador?.razonSocial ?? '—'}</td>
                    <td>{ETIQUETAS_CATEGORIA[nave.categoria]}</td>
                    <td>{nave.trg !== undefined ? `${nave.trg} TRG` : nave.arqueoBruto !== undefined ? `${nave.arqueoBruto} AB` : '—'}</td>
                    <td>
                      <EstadoBadge estado={resultado.estadoGlobal} />
                    </td>
                    <td>{resultado.aptaParaInspeccion ? 'Sí' : 'No'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
