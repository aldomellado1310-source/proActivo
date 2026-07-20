import type { CategoriaInsumo } from '../types/schema';

/** Etiquetas legibles de categoría de insumo, compartidas entre Insumos.tsx
 * (vista agrupada) y NaveDetalle.tsx (ficha de nave) — antes vivían
 * duplicadas, y NaveDetalle ni siquiera tenía la suya: caía al valor crudo
 * del enum (p. ej. "nautico_comunicaciones" en vez de "Náutico /
 * comunicaciones"). */
export const ETIQUETAS_CATEGORIA_INSUMO: Record<CategoriaInsumo, string> = {
  salvamento: 'Salvamento',
  contra_incendio: 'Contra incendio',
  nautico_comunicaciones: 'Náutico / comunicaciones',
  sanitario: 'Sanitario',
  operacional: 'Operacional',
  faena_amarre: 'Faena y amarre',
  marpol: 'MARPOL',
};
