/** Iconos SVG inline, minimalistas, en el trazo de la marca. */

export function IconoNave({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 15.5 3 11h18l-1 4.5M6 11V6h5l3 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 15.5c1 1.6 2.3 2.5 3.8 2.5s2.8-.9 3.8-2c1 1.1 2.3 2 3.8 2s2.8-.9 3.8-2c1 1.1 2.3 2 3.8 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 6V3.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
