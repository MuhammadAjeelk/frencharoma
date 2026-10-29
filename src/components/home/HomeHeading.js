import Link from "next/link";

// The homepage section title, which the mockup draws differently per device:
// - md and up: a tracked eyebrow over a roman serif title flanked by short
//   gold rules, centred, with an underlined link pinned right below it.
// - phones: Playfair italic, left-aligned, a one-line subtitle, and an outlined
//   "View All" box on the right.
// Only one of the two is ever displayed, so screen readers hear one heading.
//
// `tone` is the phone ground ("dark" or "light"); desktop grounds are always light.

function Arrow({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" />
    </svg>
  );
}

export default function HomeHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View All",
  desktopLinkLabel,
  tone = "light",
  phoneOnly = false,
  phoneLinkOnly = false,
  className = "",
}) {
  const dark = tone === "dark";

  return (
    <div className={className}>
      {/* Phones */}
      <div className="md:hidden flex items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2
            className={`font-[family-name:var(--font-playfair)] italic font-normal text-[26px] leading-tight ${
              dark ? "text-[var(--fa-gold-hover)]" : "text-[var(--fa-ink)]"
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-1 font-[family-name:var(--font-playfair)] text-[15px] leading-snug ${dark ? "text-[var(--fa-on-dark)]" : "text-[var(--fa-ink)]"}`}>
              {subtitle}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm ${
              dark
                ? "border-[var(--fa-on-dark)]/70 text-[var(--fa-cream)] hover:bg-[var(--fa-on-dark)] hover:text-[var(--fa-ink)]"
                : "border-[var(--fa-ink)]/60 text-[var(--fa-ink)] hover:bg-[var(--fa-ink)] hover:text-[var(--fa-cream)]"
            } transition-colors`}
          >
            {linkLabel}
            <Arrow />
          </Link>
        )}
      </div>

      {/* Desktop */}
      {!phoneOnly && (
        <div className="hidden md:block relative mb-8 text-center">
          {eyebrow && (
            <p className="font-[family-name:var(--font-playfair)] text-[13px] uppercase tracking-[0.35em] text-[var(--fa-ink)]/80">
              {eyebrow}
            </p>
          )}
          <div className="mt-1 flex items-center justify-center gap-8">
            <span className="h-px w-16 bg-[var(--fa-home-rule)]" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-playfair)] font-normal text-4xl lg:text-[44px] tracking-[0.01em] text-[var(--fa-ink)]">
              {title}
            </h2>
            <span className="h-px w-16 bg-[var(--fa-home-rule)]" aria-hidden="true" />
          </div>
          {href && !phoneLinkOnly && (
            <Link
              href={href}
              className="absolute right-0 bottom-0 translate-y-full inline-flex items-center gap-2 pt-1 font-[family-name:var(--font-playfair)] text-xl text-[var(--fa-ink)] underline underline-offset-4 decoration-1 hover:text-[var(--fa-gold-ink)] transition-colors"
            >
              {desktopLinkLabel || linkLabel}
              <Arrow className="w-5 h-5 no-underline" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
