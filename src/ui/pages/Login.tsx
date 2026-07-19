import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { IconoAncla, IconoWifi, IconoCamara, IconoHistorial, IconoCandado } from '../components/iconos';
import { useEstadoDemo } from '../EstadoContext';
import { PERFILES_DEMO, type PerfilId } from '../../data/store';

const FEATURES = [
  { icono: <IconoAncla />, titulo: 'Multi-nave', subtitulo: 'Toda la flota' },
  { icono: <IconoWifi />, titulo: 'Sin conexión', subtitulo: 'Funciona sin señal' },
  { icono: <IconoCamara />, titulo: 'Evidencia fotográfica', subtitulo: 'Insumos y hallazgos' },
  { icono: <IconoHistorial />, titulo: 'Historial normativo', subtitulo: 'Cada regla, con su versión' },
];

type ModoAcceso = 'rapido' | 'credenciales';

export function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useEstadoDemo();
  const [modo, setModo] = useState<ModoAcceso>('rapido');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  function entrarComo(perfilId: PerfilId) {
    iniciarSesion(perfilId);
    navigate('/dashboard');
  }

  function manejarEnvioCredenciales(e: FormEvent) {
    e.preventDefault();
    if (usuario.trim().toLowerCase() === 'admin' && clave === 'admin') {
      entrarComo('admin');
      return;
    }
    setError('Usuario o clave incorrectos. En esta demo, el acceso de administrador es admin / admin.');
  }

  return (
    <div className="pa-app">
      {/* Decorativo, solo en la portada: es el único momento "raro" de la sesión
          (se ve una vez), así que es donde el criterio de Emil Kowalski sobre
          frecuencia de uso permite algo de delight en el fondo. */}
      <div className="pa-fondo-animado" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
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

          <div className="pa-toggle pa-toggle--claro" role="group" aria-label="Forma de acceso">
            <button type="button" aria-pressed={modo === 'rapido'} onClick={() => setModo('rapido')}>
              Accesos rápidos
            </button>
            <button type="button" aria-pressed={modo === 'credenciales'} onClick={() => setModo('credenciales')}>
              Usuario y clave
            </button>
          </div>

          {modo === 'rapido' ? (
            <div className="pa-fade-remonta" key="rapido">
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
          ) : (
            <form className="pa-fade-remonta" key="credenciales" onSubmit={manejarEnvioCredenciales}>
              <div className="pa-campo">
                <label htmlFor="usuario">Usuario</label>
                <input
                  id="usuario"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setError('');
                  }}
                  placeholder="admin"
                />
              </div>
              <div className="pa-campo">
                <label htmlFor="clave">Clave</label>
                <input
                  id="clave"
                  type="password"
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => {
                    setClave(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••"
                />
              </div>
              {error ? (
                <p className="pa-login__error" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="pa-btn pa-btn--primario" style={{ width: '100%' }}>
                <IconoCandado /> Ingresar como administrador
              </button>
              <p className="pa-texto-suave" style={{ marginTop: 16 }}>
                Demo sin autenticación real: la clave de administrador es fija (admin / admin) y
                solo vive en este navegador.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
