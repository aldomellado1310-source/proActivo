import { useMemo, useState } from 'react';
import { Card, EmptyState } from '../components/Card';
import { CriticidadBadge, VerificacionBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { advertenciaReglasNoVerificadas } from '../../data/store';
import { coincide } from '../filtro';
import type { ReglaNormativa } from '../../types/schema';

const ETIQUETAS_CATEGORIA_DOC: Record<ReglaNormativa['categoriaDocumento'], string> = {
  registro: 'Registro',
  seguridad: 'Seguridad',
  personal: 'Personal',
  operacion: 'Operación',
  ambiental: 'Ambiental',
};

export function Reglas() {
  const { reglas } = useEstadoDemo();
  const [filtroDocumento, setFiltroDocumento] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroOrganismo, setFiltroOrganismo] = useState('');

  const porCategoria = useMemo(() => {
    const mapa = new Map<ReglaNormativa['categoriaDocumento'], ReglaNormativa[]>();
    for (const regla of reglas) {
      if (!mapa.has(regla.categoriaDocumento)) mapa.set(regla.categoriaDocumento, []);
      mapa.get(regla.categoriaDocumento)!.push(regla);
    }
    return mapa;
  }, [reglas]);

  const verificadas = reglas.filter((r) => r.estadoVerificacion === 'verificada').length;

  const categoriasFiltradas = [...porCategoria.entries()].map(([categoria, reglasCategoria]) => ({
    categoria,
    reglas: reglasCategoria.filter(
      (regla) =>
        coincide(regla.documentoExigido, filtroDocumento) &&
        coincide(regla.descripcionControl, filtroDescripcion) &&
        coincide(regla.organismoEmisor, filtroOrganismo)
    ),
  }));
  const hayFiltroActivo = Boolean(filtroDocumento || filtroDescripcion || filtroOrganismo);
  const sinResultados = hayFiltroActivo && categoriasFiltradas.every(({ reglas }) => reglas.length === 0);

  return (
    <>
      <div>
        <h1>Catálogo de reglas normativas</h1>
        <p className="pa-texto-suave">
          Las reglas son datos, no código: un cambio de circular se resuelve editando este
          catálogo, sin desplegar una versión nueva del sistema. {verificadas} de {reglas.length}{' '}
          reglas están confirmadas con fuente oficial.
        </p>
      </div>

      <div className="pa-aviso">
        <strong style={{ display: 'block', marginBottom: 4 }}>Advertencia de reglas no verificadas</strong>
        {advertenciaReglasNoVerificadas}
      </div>

      {sinResultados ? (
        <Card>
          <EmptyState>Ninguna regla coincide con el filtro.</EmptyState>
        </Card>
      ) : null}

      {categoriasFiltradas.map(({ categoria, reglas: reglasCategoria }) =>
        reglasCategoria.length === 0 && hayFiltroActivo ? null : (
          <Card key={categoria} titulo={ETIQUETAS_CATEGORIA_DOC[categoria]}>
            <div className="pa-table-wrap">
              <table className="pa-table">
                <thead>
                  <tr>
                    <th>Documento exigido</th>
                    <th>Descripción</th>
                    <th>Organismo emisor</th>
                    <th>Criticidad</th>
                    <th>Verificación</th>
                  </tr>
                  <tr className="pa-fila-filtros">
                    <th>
                      <input
                        className="pa-input-filtro"
                        placeholder="Filtrar…"
                        value={filtroDocumento}
                        onChange={(e) => setFiltroDocumento(e.target.value)}
                        aria-label="Filtrar por documento exigido"
                      />
                    </th>
                    <th>
                      <input
                        className="pa-input-filtro"
                        placeholder="Filtrar…"
                        value={filtroDescripcion}
                        onChange={(e) => setFiltroDescripcion(e.target.value)}
                        aria-label="Filtrar por descripción"
                      />
                    </th>
                    <th>
                      <input
                        className="pa-input-filtro"
                        placeholder="Filtrar…"
                        value={filtroOrganismo}
                        onChange={(e) => setFiltroOrganismo(e.target.value)}
                        aria-label="Filtrar por organismo emisor"
                      />
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reglasCategoria.map((regla) => (
                    <tr key={regla.id}>
                      <td>
                        <strong>{regla.documentoExigido}</strong>
                        <div className="pa-texto-suave pa-mono">
                          {regla.tipoPlazo === 'fijo' && regla.vigenciaMeses
                            ? `Vigencia: ${regla.vigenciaMeses} meses`
                            : regla.tipoPlazo === 'permanente'
                              ? 'Plazo permanente'
                              : regla.tipoPlazo === 'por_evento'
                                ? 'Por evento'
                                : 'Condicional (por evento de renovación)'}
                        </div>
                      </td>
                      <td>{regla.descripcionControl}</td>
                      <td>{regla.organismoEmisor}</td>
                      <td>
                        <CriticidadBadge criticidad={regla.criticidad} />
                      </td>
                      <td>
                        <VerificacionBadge estadoVerificacion={regla.estadoVerificacion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}
    </>
  );
}
