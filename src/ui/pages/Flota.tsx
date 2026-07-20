import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, EmptyState } from '../components/Card';
import { EstadoBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import { coincide } from '../filtro';

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  nave_menor: 'Nave menor',
  nave_mayor: 'Nave mayor',
  artefacto_naval: 'Artefacto naval',
};

export function Flota() {
  const navigate = useNavigate();
  const { estado } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();
  const [filtroNave, setFiltroNave] = useState('');
  const [filtroMatricula, setFiltroMatricula] = useState('');
  const [filtroArmador, setFiltroArmador] = useState('');

  const navesFiltradas = estado.naves.filter((nave) => {
    const armador = estado.armadores.find((a) => a.id === nave.armadorId);
    return (
      coincide(nave.nombre, filtroNave) &&
      coincide(nave.matricula, filtroMatricula) &&
      coincide(armador?.razonSocial ?? '', filtroArmador)
    );
  });

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
              <tr className="pa-fila-filtros">
                <th>
                  <input
                    className="pa-input-filtro"
                    placeholder="Filtrar…"
                    value={filtroNave}
                    onChange={(e) => setFiltroNave(e.target.value)}
                    aria-label="Filtrar por nave"
                  />
                </th>
                <th>
                  <input
                    className="pa-input-filtro"
                    placeholder="Filtrar…"
                    value={filtroMatricula}
                    onChange={(e) => setFiltroMatricula(e.target.value)}
                    aria-label="Filtrar por matrícula"
                  />
                </th>
                <th>
                  <input
                    className="pa-input-filtro"
                    placeholder="Filtrar…"
                    value={filtroArmador}
                    onChange={(e) => setFiltroArmador(e.target.value)}
                    aria-label="Filtrar por armador"
                  />
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {navesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState>Ninguna nave coincide con el filtro.</EmptyState>
                  </td>
                </tr>
              ) : null}
              {navesFiltradas.map((nave) => {
                const armador = estado.armadores.find((a) => a.id === nave.armadorId);
                const resultado = evaluaciones[nave.id];
                return (
                  <tr key={nave.id} className="clickable" onClick={() => navigate(`/flota/${nave.id}`)}>
                    <td>
                      <Link to={`/flota/${nave.id}`} onClick={(e) => e.stopPropagation()}>
                        <strong>{nave.nombre}</strong>
                      </Link>
                    </td>
                    <td className="pa-mono">{nave.matricula}</td>
                    <td>{armador?.razonSocial ?? '—'}</td>
                    <td>{ETIQUETAS_CATEGORIA[nave.categoria]}</td>
                    <td className="pa-mono">{nave.trg !== undefined ? `${nave.trg} TRG` : nave.arqueoBruto !== undefined ? `${nave.arqueoBruto} AB` : '—'}</td>
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
