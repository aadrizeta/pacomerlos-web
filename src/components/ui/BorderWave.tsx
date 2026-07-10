type BorderWaveProps = {
  background?: string;
  fill?: string;
  flip?: boolean;
  className?: string;
};

export default function BorderWave({
  background = 'var(--paco-orange)',
  fill = 'var(--paco-purple)',
  flip = false,
}: BorderWaveProps) {
  return (
    <div aria-hidden="true">
      <svg
        className="w-full -my-px"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <rect x="0" y="0" width="1440" height="80" fill={background} />
        <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}