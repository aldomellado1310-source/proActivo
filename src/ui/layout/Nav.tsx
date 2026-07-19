import { NavLink } from 'react-router-dom';
import { useEstadoDemo } from '../EstadoContext';
import { IconoPanel, IconoFlota, IconoDocumento, IconoInsumo, IconoReglas, IconoInfo } from '../components/iconos';

const ITEMS = [
  { to: '/dashboard', etiqueta: 'Panel', icono: <IconoPanel /> },
  { to: '/flota', etiqueta: 'Flota', icono: <IconoFlota /> },
  { to: '/certificados', etiqueta: 'Certificados', icono: <IconoDocumento /> },
  { to: '/insumos', etiqueta: 'Insumos', icono: <IconoInsumo /> },
  { to: '/reglas', etiqueta: 'Reglas', icono: <IconoReglas /> },
];

export function Nav() {
  const { reset } = useEstadoDemo();

  return (
    <nav className="pa-nav" aria-label="Navegación principal">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? 'activo' : undefined)}
        >
          {item.icono} {item.etiqueta}
        </NavLink>
      ))}
      <div className="pa-nav__secundario">
        <NavLink to="/acerca-de" className={({ isActive }) => (isActive ? 'activo' : undefined)}>
          <IconoInfo /> Acerca de Navix
        </NavLink>
      </div>
      <div className="pa-nav__reset">
        <button
          className="pa-btn pa-btn--secundario"
          style={{ width: '100%', fontSize: '0.8rem' }}
          onClick={() => {
            if (window.confirm('¿Restablecer la demo a los datos semilla? Se perderán los cambios locales.')) {
              reset();
            }
          }}
        >
          Restablecer demo
        </button>
      </div>
    </nav>
  );
}
