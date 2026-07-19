import { Navigate, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Nav } from './Nav';
import { RouteTransition } from './RouteTransition';
import { useEstadoDemo } from '../EstadoContext';

/** Envuelve las páginas autenticadas: header + nav lateral. Redirige a /login si no hay perfil activo. */
export function Layout() {
  const { estado } = useEstadoDemo();

  if (!estado.perfilActivoId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pa-app">
      <Header />
      <div className="pa-shell">
        <Nav />
        <main className="pa-main">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  );
}
