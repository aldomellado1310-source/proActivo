import type { ReactNode } from 'react';

export function Card({
  titulo,
  acciones,
  children,
}: {
  titulo?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pa-card">
      {titulo ? (
        <div className="pa-card__titulo">
          <h3>{titulo}</h3>
          {acciones}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function StatTile({
  valor,
  etiqueta,
  variante,
}: {
  valor: ReactNode;
  etiqueta: string;
  variante?: 'alerta' | 'ambar' | 'gris';
}) {
  return (
    <div className={`pa-stat-tile${variante ? ` pa-stat-tile--${variante}` : ''}`}>
      <div className="pa-stat-tile__valor">{valor}</div>
      <div className="pa-stat-tile__etiqueta">{etiqueta}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="pa-empty">{children}</div>;
}
