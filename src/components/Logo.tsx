/** Mark: the flag's red sun doubling as a wheel, on Bangladesh green. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0a6b4f" />
      <circle cx="14" cy="16" r="8.5" fill="#e2453c" />
      <circle cx="14" cy="16" r="5" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.95" />
      <circle cx="14" cy="16" r="1.6" fill="#fff" />
      <path d="M22.5 9.5 L27 9.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <path d="M23.5 13 L27 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        suggest<span className="text-brand">.bike</span>
      </span>
    </span>
  );
}
