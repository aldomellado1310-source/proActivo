/**
 * Coincidencia de texto para los filtros de columna de las tablas: ignora
 * mayúsculas/minúsculas y tildes (para que "dona" encuentre "Doña"). Un
 * filtro vacío siempre coincide, así que las tablas no filtran nada hasta
 * que se escribe algo.
 */
const DIACRITICOS = /[\u0300-\u036f]/g;

export function coincide(texto: string, filtro: string): boolean {
  if (!filtro.trim()) return true;
  const normaliza = (s: string) => s.toLocaleLowerCase('es-CL').normalize('NFD').replace(DIACRITICOS, '');
  return normaliza(texto).includes(normaliza(filtro));
}
