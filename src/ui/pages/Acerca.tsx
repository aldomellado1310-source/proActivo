import { Card } from '../components/Card';
import { IconoDocumento, IconoInsumo } from '../components/iconos';

const AUDIENCIA = [
  'Armadores y empresas navieras con flotas propias o de apoyo a operaciones industriales.',
  'Gestores de flota responsables de mantener varias embarcaciones en regla a la vez.',
  'Empresas cuya operación depende de naves de apoyo y enfrentan riesgo directo ante una detención.',
  'Operadores que responden ante fiscalización de la Autoridad Marítima de forma recurrente.',
];

export function Acerca() {
  return (
    <>
      <div>
        <h1>Acerca de Navix</h1>
        <p className="pa-texto-suave">
          Navix responde una sola pregunta con certeza: ¿puede esta nave zarpar hoy sin
          exponerse a una observación, una multa o una detención? No es una herramienta de
          monitoreo operativo de la nave — es una herramienta de conformidad: documental, de
          gestión y física.
        </p>
      </div>

      <Card titulo="El problema que resuelve">
        <p>
          La normativa marítima chilena exige, según el tonelaje y tipo de cada embarcación, un
          conjunto extenso y variable de documentos, certificaciones y equipamiento a bordo. Hoy
          esa información suele vivir dispersa: carpetas físicas, planillas sueltas, memoria del
          patrón de nave. El resultado más frecuente no es el incumplimiento deliberado, sino el
          descubrimiento tardío — un certificado vencido, un equipo de seguridad caducado, una
          inspección no anticipada. Navix existe para eliminar ese margen de sorpresa.
        </p>
      </Card>

      <div>
        <h2 style={{ marginBottom: 4 }}>Qué controla Navix</h2>
        <p className="pa-texto-suave">
          Dos frentes de control que, juntos, definen si una nave está realmente en regla.
          Ninguno alcanza por sí solo: una nave puede tener toda su documentación vigente y aun
          así no estar apta si el equipamiento físico exigido por esa misma documentación no está
          a bordo, vencido o incompleto.
        </p>
      </div>

      <div className="pa-grid-2">
        <Card titulo={<span className="pa-flex" style={{ gap: 8 }}><IconoDocumento />Control normativo y de gestión</span>}>
          <p className="pa-texto-suave" style={{ marginBottom: 12 }}>
            Registra, clasifica y da seguimiento a la documentación exigida por la Autoridad
            Marítima para cada embarcación, según su categoría y tonelaje.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--pa-texto-suave)', fontSize: '0.9rem' }}>
            <li>Clasificación automática por tonelaje y tipo de nave.</li>
            <li>Certificados de matrícula, arqueo, seguridad, dotación y permisos.</li>
            <li>Gestión por jurisdicción: cada Capitanía de Puerto con sus propios criterios.</li>
            <li>Historial normativo: cada certificado conserva la versión bajo la que fue evaluado.</li>
            <li>Alertas anticipadas de vencimiento antes de una inspección.</li>
          </ul>
        </Card>
        <Card titulo={<span className="pa-flex" style={{ gap: 8 }}><IconoInsumo />Control de insumos a bordo</span>}>
          <p className="pa-texto-suave" style={{ marginBottom: 12 }}>
            Verifica que el equipamiento físico exigido esté efectivamente presente en la nave,
            vigente y en condiciones — no solo que exista un documento que lo certifique.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--pa-texto-suave)', fontSize: '0.9rem' }}>
            <li>Inventario por nave: salvavidas, contra incendio, sanitarios, comunicación.</li>
            <li>Vencimientos individuales, independientes del certificado que los exige.</li>
            <li>Cantidades mínimas calculadas según tipo de nave y dotación, no ingresadas a mano.</li>
            <li>Evidencia fotográfica con fecha de cada verificación en terreno.</li>
            <li>Listado esperado antes de una revista de cargo, con los faltantes destacados.</li>
          </ul>
        </Card>
      </div>

      <div className="pa-aviso">
        <strong>Principio operativo:</strong> una nave con documentación vigente pero con insumos
        vencidos o incompletos no se considera conforme. Navix evalúa el estado de la nave como
        una condición compuesta, no como la suma de casilleros marcados.
      </div>

      <Card titulo="A quién está dirigido">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {AUDIENCIA.map((linea) => (
            <li key={linea} style={{ marginBottom: 8 }}>
              {linea}
            </li>
          ))}
        </ul>
      </Card>

      <Card titulo="Qué hace distinto a Navix">
        <p style={{ marginBottom: 8 }}>
          Existen herramientas que permiten seguir la posición, la ruta o el desempeño operativo
          de una embarcación. Esa información es valiosa, pero opcional: una nave puede operar
          sin ese tipo de monitoreo. El cumplimiento normativo, en cambio, no es opcional — es la
          condición legal para que una nave pueda navegar.
        </p>
        <p className="pa-texto-suave" style={{ marginBottom: 0 }}>
          Navix no compite en el terreno del monitoreo operativo. Se ubica en el terreno de la
          conformidad: la certeza, verificable y documentada, de que una nave cumple con lo que
          la Autoridad Marítima exige de ella, hoy, en el mar y en el papel.
        </p>
      </Card>
    </>
  );
}
