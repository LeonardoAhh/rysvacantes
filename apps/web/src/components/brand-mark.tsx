type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        d="M7 12.5 14 10h12l7 2.5 3 12.2-3.6 4.8H7.6L4 24.7l3-12.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M13 17h14l2 8H11l2-8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M16 19.5v3m4-3v3m4-3v3M8 17l-1.5 5m25.5-5 1.5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}
