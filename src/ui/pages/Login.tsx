import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { IconoAncla, IconoWifi, IconoCamara, IconoHistorial } from '../components/iconos';
import { useEstadoDemo } from '../EstadoContext';
import { PERFILES_DEMO, type PerfilId } from '../../data/store';

const FEATURES = [
  { icono: <IconoAncla />, titulo: 'Multi-nave', subtitulo: 'Toda la flota' },
  { icono: <IconoWifi />, titulo: 'Sin conexión', subtitulo: 'Funciona sin señal' },
  { icono: <IconoCamara />, titulo: 'Evidencia fotográfica', subtitulo: 'Insumos y hallazgos' },
  { icono: <IconoHistorial />, titulo: 'Historial normativo', subtitulo: 'Cada regla, con su versión' },
];

export function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useEstadoDemo();

  function entrarComo(perfilId: PerfilId) {
    iniciarSesion(perfilId);
    navigate('/dashboard');
  }

  return (
    <div className="pa-app">
      <Header />
      <div className="pa-login">
        <div>
          <h1 className="pa-login__marca">
            <img
              src={`${import.meta.env.BASE_URL}navix-logo.png`}
              alt="Navix — software de gestión marítima"
              className="pa-login__logo"
            />
          </h1>
          <p className="pa-texto-suave pa-login__subtitulo">DIRECTEMAR · Región de Aysén</p>
          <p className="pa-texto-suave pa-login__intro">
            Responde una sola pregunta con certeza: ¿puede esta nave zarpar hoy sin exponerse a
            una observación, una multa o una detención? Certificados, insumos a bordo y
            preparación de revista de cargo en un solo lugar, con el motor de reglas normativas
            como dato editable — no como código.
          </p>
          <div className="pa-login__features">
            {FEATURES.map((f) => (
              <div className="pa-feature-card" key={f.titulo}>
                {f.icono}
                <strong>{f.titulo}</strong>
                <span>{f.subtitulo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pa-login__card">
          <h2 style={{ marginBottom: 4 }}>Bienvenido de vuelta</h2>
          <p className="pa-texto-suave">Ingresa a la demo de Navix</p>

          <p className="pa-login__accesos-titulo">ACCESOS RÁPIDOS PARA LA DEMO</p>
          {PERFILES_DEMO.map((perfil) => (
            <button key={perfil.id} className="pa-acceso-rapido" onClick={() => entrarComo(perfil.id)}>
              <span className="pa-acceso-rapido__avatar">
                {perfil.nombre
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span>
                <strong>{perfil.nombre}</strong>
                <span>{perfil.cargo}</span>
              </span>
            </button>
          ))}
          <p className="pa-texto-suave" style={{ marginTop: 16 }}>
            Demo sin autenticación real: al elegir un perfil se guarda localmente y se abre el
            panel. Usa "Restablecer demo" en cualquier momento para volver a los datos semilla.
          </p>
        </div>
      </div>
    </div>
  );
}
