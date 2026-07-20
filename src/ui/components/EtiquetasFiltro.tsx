/**
 * Chips con los valores únicos de una columna (calculados sobre los datos
 * sin filtrar, para que no desaparezcan al escribir en el filtro de texto
 * de al lado). Clic selecciona ese valor exacto como filtro; clic de nuevo
 * lo deselecciona. Complementa el input de texto, no lo reemplaza.
 */
export function EtiquetasFiltro({
  valores,
  activo,
  onSeleccionar,
}: {
  valores: string[];
  activo: string;
  onSeleccionar: (valor: string) => void;
}) {
  if (valores.length === 0) return null;
  return (
    <div className="pa-etiquetas-filtro">
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          className={`pa-etiqueta-filtro${activo === valor ? ' pa-etiqueta-filtro--activa' : ''}`}
          onClick={() => onSeleccionar(activo === valor ? '' : valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  );
}
