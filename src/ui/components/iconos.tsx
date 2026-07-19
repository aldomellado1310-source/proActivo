/** Iconos SVG inline, minimalistas, en el trazo de la marca. */

/**
 * Isologo de Navix: dos picos superpuestos (Azul Naval detrás, Turquesa
 * Austral delante) que dejan un canal navegable entre ambos, con una ola de
 * Ámbar Energía en la base. Siempre en los tres colores de marca — a
 * diferencia de los íconos utilitarios de abajo, no hereda currentColor,
 * igual que exige el manual ("no cambiar colores").
 */
export function IconoNavix({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 32" fill="none" aria-hidden="true">
      <path d="M2 27 7.5 9Q9 5.5 10.5 9L16 27Z" fill="#163b5c" />
      <path d="M11 27 19.5 12Q21.5 8.5 23.5 12L32 27Z" fill="#278c8c" />
      <path
        d="M1.5 29.3Q9.5 25.8 18 29.3T34.5 29.3"
        stroke="#e29a45"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function IconoAncla({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v14M6 13c0 4 2.7 7 6 8 3.3-1 6-4 6-8M4 13h4m8 0h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoWifi({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 8.5c5.5-5 14.5-5 20 0M5.5 12c3.6-3.2 9.4-3.2 13 0M9 15.5c1.7-1.4 4.3-1.4 6 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function IconoCamara({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-1.8A1 1 0 0 1 10.1 4.7h3.8a1 1 0 0 1 .9.5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconoPanel({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19V10M11 19V5M18 19v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoFlota({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 14.5 4 11h16l-1 3.5M6.5 11V6.5h4l2.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 15c.9 1.4 2 2.2 3.3 2.2s2.5-.8 3.3-1.8c.9 1 2 1.8 3.3 1.8s2.5-.8 3.3-1.8c.9 1 2 1.8 3.3 1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoDocumento({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 6.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14.2 3.6V8h4.3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 12.5h7M8.5 15.8h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoInsumo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9.5A1.5 1.5 0 0 1 5.5 8h13A1.5 1.5 0 0 1 20 9.5v8A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8.5 8V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 12.5h16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconoReglas({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 6.2c-1.4-1-3.3-1.7-5.5-1.7-1 0-1.7.1-2.5.3v12.7c.8-.2 1.5-.3 2.5-.3 2.2 0 4.1.7 5.5 1.7m0-12.7c1.4-1 3.3-1.7 5.5-1.7 1 0 1.7.1 2.5.3v12.7c-.8-.2-1.5-.3-2.5-.3-2.2 0-4.1.7-5.5 1.7m0-12.7V18.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoTrazabilidad({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 5h11a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="5" cy="5" r="1.6" fill="currentColor" />
      <circle cx="19" cy="17" r="1.6" fill="currentColor" />
    </svg>
  );
}
