import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEstadoDemo } from '../EstadoContext';
import { PERFILES_DEMO } from '../../data/store';

export function Header() {
  const { estado, cerrarSesion } = useEstadoDemo();
  const [online, setOnline] = useState(true);
  const perfil = PERFILES_DEMO.find((p) => p.id === estado.perfilActivoId);

  return (
    <header className="pa-header">
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
              <span style={{ opacity: 0.85, fontSize: '0.75rem' }}>{perfil.cargo}</span>
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
