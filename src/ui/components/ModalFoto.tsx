import { useRef, useState } from 'react';

interface ModalFotoProps {
  titulo: string;
  onCerrar: () => void;
  onGuardar: (fotoUrl: string) => void;
}

/** Modal simple para "cargar evidencia": convierte la imagen elegida a base64 y la guarda en localStorage. */
export function ModalFoto({ titulo, onCerrar, onGuardar }: ModalFotoProps) {
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function manejarArchivo(archivo: File | undefined) {
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => setPrevisualizacion(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="pa-modal-fondo"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onCerrar}
    >
      <div
        className="pa-card pa-modal-caja"
        style={{ maxWidth: 420, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pa-card__titulo">
          <h3>{titulo}</h3>
        </div>

        {previsualizacion ? (
          <img
            src={previsualizacion}
            alt="Previsualización de evidencia"
            style={{ width: '100%', borderRadius: 12, marginBottom: 12, maxHeight: 260, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="pa-empty"
            style={{ border: '1px dashed var(--pa-borde)', borderRadius: 12, marginBottom: 12 }}
          >
            Sin foto seleccionada
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => manejarArchivo(e.target.files?.[0])}
          style={{ marginBottom: 16 }}
        />

        <div className="pa-flex" style={{ justifyContent: 'flex-end' }}>
          <button className="pa-btn pa-btn--secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="pa-btn pa-btn--primario"
            disabled={!previsualizacion}
            onClick={() => previsualizacion && onGuardar(previsualizacion)}
          >
            Guardar evidencia
          </button>
        </div>
      </div>
    </div>
  );
}
