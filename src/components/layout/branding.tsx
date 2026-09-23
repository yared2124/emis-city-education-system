export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="EMIS logo"
    >
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path d="M32 12 10 22v6h44v-6L32 12z" fill="#ffffff" />
      <path
        d="M15 30v16h4V30h-4zm10 0v16h4V30h-4zm10 0v16h4V30h-4zm10 0v16h4V30h-4z"
        fill="rgba(255,255,255,0.62)"
      />
      <path d="M10 48h44v4H10z" fill="#ffffff" />
    </svg>
  );
}
