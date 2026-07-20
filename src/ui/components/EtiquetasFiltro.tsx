/** Por encima de esto, mostrarlas todas como chips deja de ser "un vistazo
 * rápido" y pasa a ser una lista que hay que explorar — para eso ya está
 * el input de texto de al lado. No tiene sentido reinventar un selector
 * scrolleable a mano para lo que un input ya resuelve mejor. */
const MAXIMO_VALORES = 8;

/**
 * Chips con los valores únicos de una columna (calculados sobre los datos
 * sin filtrar, para que no desaparezcan al escribir en el filtro de texto
 * de al lado). Clic selecciona ese valor exacto como filtro; clic de nuevo
 * lo deselecciona. Complementa el input de texto, no lo reemplaza — y solo
 * aparece cuando la columna tiene pocos valores distintos (ver MAXIMO_VALORES).
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
  if (valores.length === 0 || valores.length > MAXIMO_VALORES) return null;
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
