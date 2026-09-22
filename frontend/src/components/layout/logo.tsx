/**
 * MJM brand mark — a geometric "M" monogram with a parcel-tape shine:
 * gold claw on the left, light blade on the right. Designed to sit on the
 * navy's header chip at small sizes.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="MJM Store"
    >
      <path
        d="M10 36 L10 14 L24 28 L38 14 L38 36"
        stroke="#E3B95C"
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 28 L38 14 L38 36"
        stroke="#FFFFFF"
        strokeOpacity={0.9}
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
