import { Link } from 'react-router-dom';
import { Card, StatTile, EmptyState } from '../components/Card';
import { EstadoBadge } from '../components/Badge';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import { PERFILES_DEMO } from '../../data/store';

export function Dashboard() {
  const { estado, reglas } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();
  const perfil = PERFILES_DEMO.find((p) => p.id === estado.perfilActivoId);

  const naves = estado.naves;
  const resultados = naves.map((n) => ({ nave: n, resultado: evaluaciones[n.id] }));

  const totalNaves = naves.length;
  const conformes = resultados.filter((r) => r.resultado.estadoGlobal === 'conforme').length;
  const conAlertas = resultados.filter((r) =>
    ['por_vencer', 'vencido', 'faltante'].includes(r.resultado.estadoGlobal)
  ).length;
  const noAptas = resultados.filter((r) => !r.resultado.aptaParaInspeccion).length;

  // Cola de vencimientos: solo documentos de reglas VERIFICADAS, con fecha.
  const colaVencimientos = resultados
    .flatMap(({ nave, resultado }) =>
      resultado.documentos
        .filter((d) => !d.requiereConfirmacionManual && d.diasParaVencer !== undefined)
        .map((d) => ({ nave, doc: d }))
    )
    .sort((a, b) => (a.doc.diasParaVencer ?? 0) - (b.doc.diasParaVencer ?? 0))
    .slice(0, 8);

  const insumosConAlerta = resultados
    .flatMap(({ nave, resultado }) =>
      resultado.insumos
        .filter((i) => i.estado === 'vencido' || i.estado === 'por_vencer' || i.estado === 'faltante')
        .map((i) => ({ nave, insumo: i }))
    )
    .sort((a, b) => (a.insumo.diasParaVencer ?? 0) - (b.insumo.diasParaVencer ?? 0))
    .slice(0, 8);

  // Reglas que requieren confirmación manual, agrupadas.
  const conteoPorRegla = new Map<string, Set<string>>();
  for (const { nave, resultado } of resultados) {
    for (const doc of resultado.documentos) {
      if (!doc.requiereConfirmacionManual) continue;
      if (!conteoPorRegla.has(doc.reglaId)) conteoPorRegla.set(doc.reglaId, new Set());
      conteoPorRegla.get(doc.reglaId)!.add(nave.id);
    }
  }
  const reglasPendientes = [...conteoPorRegla.entries()]
    .map(([reglaId, navesSet]) => ({
      regla: reglas.find((r) => r.id === reglaId),
      cantidadNaves: navesSet.size,
    }))
    .filter((r) => r.regla)
    .sort((a, b) => b.cantidadNaves - a.cantidadNaves);

  return (
    <>
      <div>
        <h1>Panel general</h1>
        <p className="pa-texto-suave">
          {perfil ? `Hola, ${perfil.nombre.split(' ')[0]}.` : ''} Estado de la flota evaluado en
          tiempo real por el motor de reglas.
        </p>
      </div>

      <div className="pa-stats">
        <StatTile valor={totalNaves} etiqueta="Naves totales" />
        <StatTile valor={conformes} etiqueta="Conformes" />
        <StatTile valor={conAlertas} etiqueta="Con alertas" variante="alerta" />
        <StatTile valor={noAptas} etiqueta="No aptas para inspección" variante="ambar" />
      </div>

      <Card titulo="Próximos vencimientos (reglas verificadas)">
        {colaVencimientos.length === 0 ? (
          <EmptyState>No hay certificados de reglas verificadas próximos a vencer.</EmptyState>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Nave</th>
                  <th>Documento</th>
                  <th>Vence en</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {colaVencimientos.map(({ nave, doc }) => (
                  <tr key={`${nave.id}-${doc.reglaId}`} className="clickable">
                    <td>
                      <Link to={`/flota/${nave.id}?tab=certificados`}>{nave.nombre}</Link>
                    </td>
                    <td>{doc.documentoExigido}</td>
                    <td>{doc.diasParaVencer !== undefined ? `${doc.diasParaVencer} días` : '—'}</td>
                    <td>
                      <EstadoBadge estado={doc.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card titulo="Insumos con alerta">
        {insumosConAlerta.length === 0 ? (
          <EmptyState>Ningún insumo en alerta.</EmptyState>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Nave</th>
                  <th>Insumo</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {insumosConAlerta.map(({ nave, insumo }) => (
                  <tr key={`${nave.id}-${insumo.insumoId}`} className="clickable">
                    <td>
                      <Link to={`/flota/${nave.id}?tab=insumos`}>{nave.nombre}</Link>
                    </td>
                    <td>{insumo.descripcion}</td>
                    <td>
                      {insumo.diasParaVencer !== undefined
                        ? `${insumo.diasParaVencer} días`
                        : insumo.deficitCantidad !== undefined
                          ? `Déficit: ${insumo.deficitCantidad}`
                          : '—'}
                    </td>
                    <td>
                      <EstadoBadge estado={insumo.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card titulo="Requieren confirmación manual">
        <div className="pa-aviso pa-aviso--gris" style={{ marginBottom: 16 }}>
          Estas reglas provienen de fuentes públicas sin validar (<code>estadoVerificacion: 'no_verificada'</code>)
          y nunca generan alertas automáticas. Deben confirmarse con la Capitanía de Puerto o un
          experto de dominio antes de tratarse como exigencias activas.
        </div>
        {reglasPendientes.length === 0 ? (
          <EmptyState>No hay reglas pendientes de confirmación.</EmptyState>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Documento exigido</th>
                  <th>Criticidad</th>
                  <th>Naves afectadas</th>
                </tr>
              </thead>
              <tbody>
                {reglasPendientes.map(({ regla, cantidadNaves }) => (
                  <tr key={regla!.id}>
                    <td>
                      <EstadoBadge estado="indeterminado" /> <span style={{ marginLeft: 8 }}>{regla!.documentoExigido}</span>
                    </td>
                    <td>{regla!.criticidad}</td>
                    <td>{cantidadNaves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card titulo="Flota">
        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Nave</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Apta para inspección</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map(({ nave, resultado }) => (
                <tr key={nave.id} className="clickable">
                  <td>
                    <Link to={`/flota/${nave.id}`}>{nave.nombre}</Link>
                  </td>
                  <td>{nave.categoria.replace('_', ' ')}</td>
                  <td>
                    <EstadoBadge estado={resultado.estadoGlobal} />
                  </td>
                  <td>{resultado.aptaParaInspeccion ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
