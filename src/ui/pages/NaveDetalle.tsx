import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Card, EmptyState } from '../components/Card';
import { EstadoBadge, CriticidadBadge } from '../components/Badge';
import { FormularioCertificado } from '../components/FormularioCertificado';
import { FormularioInsumo } from '../components/FormularioInsumo';
import { ModalFoto } from '../components/ModalFoto';
import { useEstadoDemo } from '../EstadoContext';
import { useEvaluaciones } from '../useEvaluaciones';
import { reglasAplicables } from '../../motor/evaluacion';
import { coincide } from '../filtro';
import type { Certificado, EvidenciaInsumo } from '../../types/schema';

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  nave_menor: 'Nave menor',
  nave_mayor: 'Nave mayor',
  artefacto_naval: 'Artefacto naval',
};

const ETIQUETAS_TIPO_CONTROL: Record<string, string> = {
  vencimiento: 'Vencimiento',
  servicio: 'Servicio periódico',
  stock: 'Stock mínimo',
  inspeccion: 'Inspección visual',
};

type Tab = 'certificados' | 'insumos' | 'revista';

export function NaveDetalle() {
  const { naveId } = useParams<{ naveId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { estado, reglas, guardarCert, guardarIns } = useEstadoDemo();
  const evaluaciones = useEvaluaciones();

  const [formularioAbierto, setFormularioAbierto] = useState<string | 'nuevo' | null>(null);
  const [modalInsumoId, setModalInsumoId] = useState<string | null>(null);
  const [formularioInsumoAbierto, setFormularioInsumoAbierto] = useState<string | null>(null);
  const [filtroDocumento, setFiltroDocumento] = useState('');
  const [filtroInsumo, setFiltroInsumo] = useState('');
  const [filtroCategoriaInsumo, setFiltroCategoriaInsumo] = useState('');
  const [filtroControlInsumo, setFiltroControlInsumo] = useState('');

  const nave = estado.naves.find((n) => n.id === naveId);

  if (!nave) {
    return (
      <Card>
        <EmptyState>
          No se encontró la nave. <Link to="/flota">Volver a Flota</Link>
        </EmptyState>
      </Card>
    );
  }

  const armador = estado.armadores.find((a) => a.id === nave.armadorId);
  const resultado = evaluaciones[nave.id];
  const certificadosNave = estado.certificados.filter((c) => c.naveId === nave.id);
  const insumosNave = estado.insumos.filter((i) => i.naveId === nave.id);
  const reglasNave = reglasAplicables(nave, reglas);

  const tabActual = (searchParams.get('tab') as Tab | null) ?? 'certificados';

  function cambiarTab(tab: Tab) {
    setSearchParams({ tab });
  }

  function certificadoDe(reglaId: string): Certificado | undefined {
    return certificadosNave
      .filter((c) => c.reglaId === reglaId)
      .sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime())[0];
  }

  const documentosFiltrados = resultado.documentos.filter((doc) => coincide(doc.documentoExigido, filtroDocumento));
  const insumosFiltrados = resultado.insumos.filter((i) => {
    const insumo = insumosNave.find((ins) => ins.id === i.insumoId);
    return (
      coincide(i.descripcion, filtroInsumo) &&
      coincide(insumo?.categoria.replace(/_/g, ' ') ?? '', filtroCategoriaInsumo) &&
      coincide(insumo ? ETIQUETAS_TIPO_CONTROL[insumo.tipoControl] : '', filtroControlInsumo)
    );
  });

  return (
    <>
      <div className="pa-flex pa-nave-titulo" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <p className="pa-texto-suave" style={{ marginBottom: 4 }}>
            <Link to="/flota">Flota</Link> / {nave.nombre}
          </p>
          <h1 style={{ marginBottom: 4 }}>{nave.nombre}</h1>
          <p className="pa-texto-suave">
            <span className="pa-mono">{nave.matricula}</span> · {armador?.razonSocial ?? 'Armador sin registrar'}
          </p>
        </div>
        <div className="pa-flex">
          <EstadoBadge estado={resultado.estadoGlobal} />
          <span className={`pa-badge ${resultado.aptaParaInspeccion ? 'pa-badge--conforme' : 'pa-badge--vencido'}`}>
            {resultado.aptaParaInspeccion ? 'Apta para inspección' : 'No apta para inspección'}
          </span>
        </div>
      </div>

      <Card titulo="Ficha técnica">
        <div className="pa-grid-2">
          <div>
            <p>
              <strong>Categoría:</strong> {ETIQUETAS_CATEGORIA[nave.categoria]}
            </p>
            <p>
              <strong>TRG / AB:</strong>{' '}
              <span className="pa-mono">
                {nave.trg !== undefined ? `${nave.trg} TRG` : nave.arqueoBruto !== undefined ? `${nave.arqueoBruto} AB` : 'Sin dato'}
              </span>
            </p>
            <p>
              <strong>Eslora total:</strong> {nave.esloraTotal} m
            </p>
            <p>
              <strong>Uso:</strong> {nave.uso.replace(/_/g, ' ')}
            </p>
            <p>
              <strong>Zona autorizada:</strong> {nave.zonaNavegacionAutorizada.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p>
              <strong>Año construcción:</strong> {nave.anioConstruccion ?? '—'}
            </p>
            <p>
              <strong>Material:</strong> {nave.material ?? '—'}
            </p>
            <p>
              <strong>Dotación autorizada:</strong> {nave.dotacionAutorizada ?? '—'}
            </p>
            <p>
              <strong>Radiocomunicaciones:</strong> {nave.tieneRadiocomunicaciones ? 'Sí' : 'No'}
            </p>
            <p>
              <strong>Transporta pasajeros:</strong> {nave.transportaPasajeros ? 'Sí' : 'No'}
            </p>
          </div>
        </div>
        {nave.advertenciasClasificacion.length > 0 && (
          <div className="pa-flex-col" style={{ marginTop: 12 }}>
            {nave.advertenciasClasificacion.map((advertencia, i) => (
              <div className="pa-aviso" key={i}>
                {advertencia}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="pa-tabs">
        <button className={tabActual === 'certificados' ? 'activo' : ''} onClick={() => cambiarTab('certificados')}>
          Certificados
        </button>
        <button className={tabActual === 'insumos' ? 'activo' : ''} onClick={() => cambiarTab('insumos')}>
          Insumos
        </button>
        <button className={tabActual === 'revista' ? 'activo' : ''} onClick={() => cambiarTab('revista')}>
          Revista de cargo
        </button>
      </div>

      {tabActual === 'certificados' && (
        <Card
          titulo="Certificados"
          acciones={
            <button className="pa-btn pa-btn--primario" onClick={() => setFormularioAbierto('nuevo')}>
              + Registrar certificado
            </button>
          }
        >
          {formularioAbierto === 'nuevo' && (
            <div style={{ marginBottom: 16 }}>
              <FormularioCertificado
                naveId={nave.id}
                reglasDisponibles={reglasNave}
                onGuardar={(cert) => {
                  guardarCert(cert);
                  setFormularioAbierto(null);
                }}
                onCancelar={() => setFormularioAbierto(null)}
              />
            </div>
          )}
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Criticidad</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th></th>
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
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>Ningún documento coincide con el filtro.</EmptyState>
                    </td>
                  </tr>
                ) : null}
                {documentosFiltrados.map((doc) => {
                  const cert = certificadoDe(doc.reglaId);
                  const regla = reglas.find((r) => r.id === doc.reglaId);
                  return (
                    <tr key={doc.reglaId}>
                      <td>
                        {doc.documentoExigido}
                        {cert?.folio ? <span className="pa-texto-suave pa-mono"> · {cert.folio}</span> : null}
                      </td>
                      <td>
                        <CriticidadBadge criticidad={doc.criticidad} />
                      </td>
                      <td className="pa-mono">
                        {cert?.fechaVencimiento
                          ? cert.fechaVencimiento
                          : regla?.tipoPlazo === 'permanente'
                            ? 'Sin vencimiento'
                            : regla?.tipoPlazo === 'por_evento'
                              ? 'Por evento'
                              : '—'}
                      </td>
                      <td>
                        <EstadoBadge estado={doc.estado} requiereConfirmacionManual={doc.requiereConfirmacionManual} />
                      </td>
                      <td>
                        {regla?.tipoPlazo !== 'por_evento' && (
                          <button
                            className="pa-btn pa-btn--secundario"
                            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                            onClick={() => setFormularioAbierto(doc.reglaId)}
                          >
                            {cert ? 'Renovar' : 'Registrar'}
                          </button>
                        )}
                        {formularioAbierto === doc.reglaId && (
                          <div style={{ marginTop: 8 }}>
                            <FormularioCertificado
                              naveId={nave.id}
                              reglasDisponibles={reglasNave}
                              reglaPreseleccionada={doc.reglaId}
                              certificadoExistente={cert}
                              onGuardar={(nuevoCert) => {
                                guardarCert(nuevoCert);
                                setFormularioAbierto(null);
                              }}
                              onCancelar={() => setFormularioAbierto(null)}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tabActual === 'insumos' && (
        <Card titulo="Insumos">
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Categoría</th>
                  <th>Control</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                  <th>Evidencia</th>
                  <th>Actualizar</th>
                </tr>
                <tr className="pa-fila-filtros">
                  <th>
                    <input
                      className="pa-input-filtro"
                      placeholder="Filtrar…"
                      value={filtroInsumo}
                      onChange={(e) => setFiltroInsumo(e.target.value)}
                      aria-label="Filtrar por insumo"
                    />
                  </th>
                  <th>
                    <input
                      className="pa-input-filtro"
                      placeholder="Filtrar…"
                      value={filtroCategoriaInsumo}
                      onChange={(e) => setFiltroCategoriaInsumo(e.target.value)}
                      aria-label="Filtrar por categoría"
                    />
                  </th>
                  <th>
                    <input
                      className="pa-input-filtro"
                      placeholder="Filtrar…"
                      value={filtroControlInsumo}
                      onChange={(e) => setFiltroControlInsumo(e.target.value)}
                      aria-label="Filtrar por control"
                    />
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState>Ningún insumo coincide con el filtro.</EmptyState>
                    </td>
                  </tr>
                ) : null}
                {insumosFiltrados.map((i) => {
                  const insumo = insumosNave.find((ins) => ins.id === i.insumoId)!;
                  return (
                    <tr key={i.insumoId}>
                      <td>{i.descripcion}</td>
                      <td>{insumo.categoria.replace(/_/g, ' ')}</td>
                      <td>{ETIQUETAS_TIPO_CONTROL[insumo.tipoControl]}</td>
                      <td className="pa-mono">
                        {insumo.tipoControl === 'stock'
                          ? `${insumo.cantidad} / ${insumo.minimoExigido} ${insumo.unidad ?? ''}`
                          : insumo.tipoControl === 'vencimiento'
                            ? (insumo.fechaVencimiento ?? '—')
                            : insumo.tipoControl === 'servicio'
                              ? `Últ. servicio: ${insumo.fechaUltimoServicio ?? '—'}`
                              : '—'}
                      </td>
                      <td>
                        <EstadoBadge estado={i.estado} />
                      </td>
                      <td>
                        <button
                          className="pa-btn pa-btn--secundario"
                          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                          onClick={() => setModalInsumoId(insumo.id)}
                        >
                          {insumo.evidencias?.length ? `${insumo.evidencias.length} foto(s)` : 'Cargar foto'}
                        </button>
                      </td>
                      <td>
                        {insumo.tipoControl !== 'inspeccion' && (
                          <button
                            className="pa-btn pa-btn--secundario"
                            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                            onClick={() => setFormularioInsumoAbierto(insumo.id)}
                          >
                            Actualizar
                          </button>
                        )}
                        {formularioInsumoAbierto === insumo.id && (
                          <div style={{ marginTop: 8 }}>
                            <FormularioInsumo
                              insumo={insumo}
                              onGuardar={(actualizado) => {
                                guardarIns(actualizado);
                                setFormularioInsumoAbierto(null);
                              }}
                              onCancelar={() => setFormularioInsumoAbierto(null)}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tabActual === 'revista' && (
        <Card titulo="Preparación de revista de cargo">
          <p className="pa-texto-suave" style={{ marginBottom: 16 }}>
            Listado esperado según reglas y plantillas de insumos aplicables, contrastado con lo
            registrado. Los faltantes o vencidos quedan destacados: son lo que un inspector
            encontraría hoy.
          </p>
          <h4>Documentos</h4>
          <div className="pa-table-wrap" style={{ marginBottom: 24 }}>
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Documento exigido</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultado.documentos.map((doc) => (
                  <tr key={doc.reglaId}>
                    <td style={doc.estado === 'vencido' || doc.estado === 'faltante' ? { color: 'var(--pa-vencido)', fontWeight: 600 } : undefined}>
                      {doc.documentoExigido}
                    </td>
                    <td>
                      <EstadoBadge estado={doc.estado} requiereConfirmacionManual={doc.requiereConfirmacionManual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h4>Insumos</h4>
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultado.insumos.map((i) => (
                  <tr key={i.insumoId}>
                    <td style={i.estado === 'vencido' || i.estado === 'faltante' ? { color: 'var(--pa-vencido)', fontWeight: 600 } : undefined}>
                      {i.descripcion}
                    </td>
                    <td>
                      <EstadoBadge estado={i.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalInsumoId && (
        <ModalFoto
          titulo="Cargar evidencia fotográfica"
          onCerrar={() => setModalInsumoId(null)}
          onGuardar={(fotoUrl) => {
            const insumo = insumosNave.find((i) => i.id === modalInsumoId);
            if (!insumo) return;
            const nuevaEvidencia: EvidenciaInsumo = {
              fotoUrl,
              fecha: new Date().toISOString(),
              registradoPor: 'demo_usuario',
            };
            guardarIns({ ...insumo, evidencias: [...(insumo.evidencias ?? []), nuevaEvidencia] });
            setModalInsumoId(null);
          }}
        />
      )}
    </>
  );
}
