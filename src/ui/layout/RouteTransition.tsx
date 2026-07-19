import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/** Remonta su contenido en cada cambio de ruta para disparar la animación de entrada (.pa-route-transition). */
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="pa-route-transition" key={pathname}>
      {children}
    </div>
  );
}
