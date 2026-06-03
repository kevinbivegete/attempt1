/**
 * Standalone SVG mark.
 * `variant="color"` — orange tones for dark backgrounds (default)
 * `variant="white"` — pure white, for use on the orange gradient box
 */
export const LogoMark = ({
  size = 36,
  variant = 'color',
}: {
  size?: number;
  variant?: 'color' | 'white';
}) => {
  const main   = variant === 'white' ? 'white'                   : '#e0822d';
  const accent = variant === 'white' ? 'rgba(255,255,255,0.38)'  : '#893027';
  const soft   = variant === 'white' ? 'rgba(255,255,255,0.22)'  : 'rgba(224,130,45,0.35)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vertical stroke of F */}
      <rect x="6" y="5" width="5" height="26" fill={main} />
      {/* Top horizontal of F */}
      <rect x="6" y="5" width="20" height="5" fill={main} />
      {/* Mid horizontal of F */}
      <rect x="6" y="15.5" width="14" height="4.5" fill={main} />
      {/* Rising accent triangle */}
      <polygon points="24,5 31,5 31,12" fill={accent} />
      {/* Bottom accent square */}
      <rect x="24" y="26" width="7" height="5" fill={soft} />
    </svg>
  );
};

/** Full inline brand block: mark + name + tagline */
export const BrandLogo = ({
  size = 36,
  nameClass = 'text-xs font-semibold text-white',
  tagClass = 'text-[10px] text-white/[0.30]',
}: {
  size?: number;
  nameClass?: string;
  tagClass?: string;
}) => (
  <div className="flex items-center gap-3">
    <div
      className="flex flex-shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #893027 0%, #e0822d 100%)',
        boxShadow: '0 3px 16px 0 #a852054d',
      }}
    >
      <LogoMark size={size * 0.85} />
    </div>
    <div>
      <div className={nameClass}>FairLending</div>
      <div className={tagClass}>FSP Portal</div>
    </div>
  </div>
);
