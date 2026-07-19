import { NavLink } from 'react-router-dom';
import { useEstadoDemo } from '../EstadoContext';

const ITEMS = [
  { to: '/dashboard', etiqueta: 'Panel', icono: '📊' },
  { to: '/flota', etiqueta: 'Flota', icono: '🚢' },
  { to: '/certificados', etiqueta: 'Certificados', icono: '📄' },
  { to: '/insumos', etiqueta: 'Insumos', icono: '🧰' },
  { to: '/reglas', etiqueta: 'Reglas', icono: '📚' },
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
          <span aria-hidden="true">{item.icono}</span> {item.etiqueta}
        </NavLink>
      ))}
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
