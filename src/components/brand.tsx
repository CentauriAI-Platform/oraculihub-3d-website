export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 2 43 13v22L24 46 5 35V13Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="m24 9 13 7.5v15L24 39l-13-7.5v-15Z"
        stroke="currentColor"
        opacity=".45"
      />
      <path
        d="m13 21 11-7 11 7M16 22v10m8-10v10m8-10v10M13 34h22M11 21h26"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M24 4v5m0 30v5M7 14l5 3m24 14 5 3M7 34l5-3m24-14 5-3"
        stroke="currentColor"
        opacity=".5"
      />
    </svg>
  );
}
