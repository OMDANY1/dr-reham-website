# QA acceptance checklist

## Visual
- [ ] Review screenshots at 390×844, 768×1024, 1440×1000; also test 360px width and 200% zoom.
- [ ] Hero has clear RTL hierarchy, distinct silhouette, calm whitespace and eye-contour motif.
- [ ] No horizontal overflow, clipped Arabic, isolated Arabic glyph animations, crowded menu or missing portrait box.
- [ ] All colors follow tokens. No generic stock clinic, invented metrics or repeated bento layout.
- [ ] Exact logo visible on light/dark backgrounds, no burgundy rectangle, no distortion; compact size remains legible.

## Function
- [ ] Root redirects correctly; all public routes work via direct load, refresh, back/forward.
- [ ] Unknown locale/slug and draft service/article URLs return real 404.
- [ ] Logo returns home; all nav/footer links work; no placeholder hash links.
- [ ] Mobile dialog keyboard/focus behavior correct. FAQ keyboard operation tested.
- [ ] Booking selected state maps to verified destination; unknown clinic param resets safely.
- [ ] Missing booking config produces honest fallback, no fake send or success state.
- [ ] Reduced motion leaves complete readable UI. Basic content/navigation survive no-JS.

## Content and privacy
- [ ] No unsupported rank, qualification, years, prices, patient outcomes, clinics or reviews.
- [ ] No draft/TODO placeholder leaks into production metadata/schema/sitemap.
- [ ] Preview is noindex. Production has verified canonical domain and approved privacy copy.
- [ ] No tracking before actual consent when consent is required by configured tools.
- [ ] No health data in URLs, logs, analytics, or prefilled messaging.

## Evidence
Run installed project typecheck, lint, production build and focused interaction tests. Use browser tests for navigation, empty content, draft gating, mobile menu, FAQ, and booking disabled/enabled with safe test config. Test actual color contrasts. Report Lighthouse setup/results as lab metrics. Attach representative screenshots and unresolved issues. Do not claim tests passed without running them.

Launch blockers: professional title/copy approval, clinic affiliation and booking verification, legal privacy details, actual domain, rights for any added media. Missing biography depth may reduce scope; missing live booking must never be disguised.
