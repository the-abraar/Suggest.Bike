/** Mark: a magnifying glass over a couple on a classic scooter, full-face helmets, bazaar bag on the floor. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="40 28 168 168" aria-hidden="true">
      <defs><clipPath id="lm-c"><circle cx="110" cy="90" r="51.5"/></clipPath><radialGradient id="lm-g" cx=".3" cy=".25" r=".9"><stop offset="0" stopColor="#fff" stopOpacity=".22"/><stop offset=".55" stopColor="#fff" stopOpacity=".05"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs><circle cx="110" cy="90" r="54" fill="var(--brand-soft)"/><g clipPath="url(#lm-c)"><circle cx="80" cy="116" r="12" fill="var(--ink)"/><circle cx="142" cy="116" r="10" fill="var(--ink)"/><circle cx="80" cy="116" r="5.5" fill="var(--brand-soft)"/><circle cx="142" cy="116" r="4.5" fill="var(--brand-soft)"/><circle cx="80" cy="116" r="2" fill="var(--ink)"/><circle cx="142" cy="116" r="1.8" fill="var(--ink)"/><path d="M60 112C58 86 76 73 102 75L112 77V108H96C92 100 70 100 66 116Z" fill="var(--brand)"/><rect x="108" y="104" width="28" height="6" rx="3" fill="var(--brand)"/><path d="M128 108C126 90 128 76 134 64H140C140 76 142 92 144 108Z" fill="var(--brand)"/><path d="M130 108Q142 98 154 108" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round"/><path d="M143 70 142 114" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round"/><path d="M130 60H152" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round"/><circle cx="152" cy="66" r="5" fill="var(--accent)"/><path d="M72 75Q94 63 118 73V78H72Z" fill="var(--accent)"/><path d="M114 104Q114 92 122 92Q130 92 130 104Z" fill="#d8b572" stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round"/><path d="M117 93Q122 85 127 93" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/><path d="M118 92Q117 85 121 83Q122 89 120 92ZM123 92Q125 85 129 86Q127 91 125 92Z" fill="#4c9a5f"/><rect x="74" y="60" width="14" height="20" rx="6" fill="var(--ink)"/><circle cx="81" cy="55" r="6" fill="var(--accent)"/><ellipse cx="83.4" cy="59.2" rx="3.72" ry="2.28" fill="var(--accent)"/><path d="M81.3 52.6L86.88 53.2Q87.24 57.1 84.6 57.52L81.3 57.52Z" fill="#cfe3fa"/><path d="M82.8 53.68L85.5 53.98" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8"/><path d="M104 78 110 102" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round"/><rect x="98" y="58" width="16" height="20" rx="7" fill="var(--accent)"/><path d="M112 66 131 62" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/><circle cx="107" cy="49" r="7" fill="var(--ink)"/><ellipse cx="109.8" cy="53.9" rx="4.34" ry="2.66" fill="var(--ink)"/><path d="M107.35 46.2L113.86 46.9Q114.28 51.45 111.2 51.94L107.35 51.94Z" fill="#cfe3fa"/><path d="M109.1 47.46L112.25 47.81" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8"/></g><circle cx="110" cy="90" r="54" fill="url(#lm-g)"/><path d="M63.700 81.800A47 47 0 0 1 71.500 63.100" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".75"/><circle cx="110" cy="90" r="54" fill="none" stroke="var(--brand)" strokeWidth="5"/><path d="M149 129 190 170" fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round"/><path d="M181 161 190 170" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"/>
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
