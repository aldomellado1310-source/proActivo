import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEstadoDemo } from '../EstadoContext';
import { TODOS_LOS_PERFILES } from '../../data/store';

/**
 * `colapsaAlDesplazar`: solo lo usa Login.tsx. El header es sticky en toda la
 * app, pero el logo únicamente se desvanece al bajar en el scroll largo del
 * login (marketing + tarjeta de acceso) — en las vistas de trabajo el logo
 * se queda quieto, es un ancla de "dónde estoy" que no debería competir con
 * el contenido por atención.
 */
export function Header({ colapsaAlDesplazar = false }: { colapsaAlDesplazar?: boolean }) {
  const { estado, cerrarSesion } = useEstadoDemo();
  const [online, setOnline] = useState(true);
  const [colapsado, setColapsado] = useState(false);
  const perfil = TODOS_LOS_PERFILES.find((p) => p.id === estado.perfilActivoId);

  useEffect(() => {
    if (!colapsaAlDesplazar) return;
    function alDesplazar() {
      setColapsado(window.scrollY > 32);
    }
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, [colapsaAlDesplazar]);

  return (
    <header className={`pa-header${colapsado ? ' pa-header--compacto' : ''}`}>
      <div className="pa-header__izq">
        <Link to={perfil ? '/dashboard' : '/'} className="pa-header__marca">
          <img src={`${import.meta.env.BASE_URL}navix-icono.png`} alt="" className="pa-header__icono" />
          <span className="pa-logotipo">Navix</span>
        </Link>
        <span className="pa-badge-demo">DEMO INTERACTIVA</span>
        <span className="pa-header__subtitulo">DIRECTEMAR · Región de Aysén</span>
      </div>
      <div className="pa-header__der">
        <div className="pa-toggle" role="group" aria-label="Estado de conexión (decorativo)">
          <button type="button" aria-pressed={online} onClick={() => setOnline(true)}>
            Online
          </button>
          <button type="button" aria-pressed={!online} onClick={() => setOnline(false)}>
            Offline
          </button>
        </div>
        {perfil ? (
          <div className="pa-header__perfil">
            <span className="pa-header__perfil-avatar">
              {perfil.nombre
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              {perfil.nombre}
              <br />
              <span className="pa-header__cargo" style={{ opacity: 0.85, fontSize: '0.75rem' }}>
                {perfil.cargo}
              </span>
            </span>
            <button className="pa-btn-salir" onClick={cerrarSesion}>
              Salir
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
