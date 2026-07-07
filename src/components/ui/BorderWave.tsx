/**
 * Separador ondulado reutilizable entre secciones.
 *
 * `background` pinta la banda (el color de la sección de la que "sale" la onda);
 * `fill` es el color del trazo SVG (hacia el que transiciona, normalmente el de
 * la sección vecina). Ambos aceptan cualquier valor CSS de color, incluido
 * `var(--paco-*)`.
 *
 * El trazo está pensado para un **borde inferior**. Para un borde superior pasa
 * `flip`: espeja la onda en vertical (`scaleY(-1)`) para que la curva quede bien
 * orientada, manteniendo la misma semántica de `background`/`fill`.
 */
type BorderWaveProps = {
  /** Color de fondo de la banda. Default: `var(--paco-orange)`. */
  background?: string;
  /** Color del trazo de la onda. Default: `var(--paco-purple)`. */
  fill?: string;
  /** Espeja la onda en vertical para usarla como borde superior. */
  flip?: boolean;
  className?: string;
};

export default function BorderWave({
  background = 'var(--paco-orange)',
  fill = 'var(--paco-purple)',
  flip = false,
  className = 'abt-wave',
}: BorderWaveProps) {
  return (
    <div className={className} style={{ background }} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}
