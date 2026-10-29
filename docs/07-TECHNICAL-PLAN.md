# Proposed technical architecture

Use Next.js App Router + TypeScript + CSS variables/CSS modules (Tailwind optional). Select stable compatible releases at implementation time, verify official docs, pin a lockfile; no version assumptions in this kit. Prefer server components; only menu, selector and small motion islands are client components. No global state library, WebGL, database or authentication needed.

Suggested output tree (to be implemented, not present in this handoff):
```
website/
  package.json
  src/app/layout.tsx
  src/app/page.tsx
  src/app/[locale]/layout.tsx
  src/app/[locale]/page.tsx
  src/app/[locale]/about/page.tsx
  src/app/[locale]/services/page.tsx
  src/app/[locale]/services/[slug]/page.tsx
  src/app/[locale]/journal/page.tsx
  src/app/[locale]/journal/[slug]/page.tsx
  src/app/[locale]/faq/page.tsx
  src/app/[locale]/book/page.tsx
  src/app/[locale]/privacy/page.tsx
  src/app/not-found.tsx
  src/app/robots.ts
  src/app/sitemap.ts
  src/components/brand/Logo.tsx
  src/components/brand/ContourScene.tsx
  src/components/layout/{Header,Footer,MobileMenu}.tsx
  src/components/sections/{Hero,SpecialtyIntro,ServiceRows,KnowledgeTeaser,BookingPanel}.tsx
  src/components/ui/{Button,Container,Accordion,EmptyState}.tsx
  src/content/ar/{home,about,services,articles,faq}.ts
  src/config/site.ts
  src/lib/{content-gates,metadata,booking-links}.ts
  src/styles/{tokens,globals,motion}.css
  public/brand/logo-original.png
  public/fonts/
  tests/
```
Brace notation means separate files. Configure locale validation and lang/dir at the correct document layout level for chosen framework version. Root redirect and 404 must render without locale errors. Shared header/footer do not remount unnecessarily.

Copy supplied logo to public/brand. CSS mask with standard and webkit declarations; preserve source alpha. Include fallback img with original color only if mask unsupported, rather than blank branding. Decorative contour SVG is newly authored artwork separate from logo; do not fabricate vector logo paths.

No secrets in client code. Future integration values use environment config; only public destination URLs may be client exposed. Validate external protocols and approved hosts; never accept an arbitrary URL from a query parameter. CSP and server headers should match actual assets and integrations, not break font/image loading.

SEO: server-rendered metadata per route, Arabic titles, real canonical domain from config. Preview noindex; do not use example.com canonical. Sitemap only public pages/records. Add Physician structured data only for verified profile fields supported by current schema; no ratings, credentials, affiliations or medical specialties inferred from unrelated sources. Verify schema documentation during implementation. Social preview uses typography and contour artwork, not a fabricated portrait.

Privacy: no analytics or third-party trackers by default. Optional analytics only after actual configuration and policy review; track outbound booking clicks, not health data. Prefer external map link over embedded map initially. No cookie banner if no nonessential storage exists; if tracking is introduced, implement real consent behavior before it loads.

Performance budgets: aim LCP ≤2.5s, CLS ≤0.1, INP ≤200ms in real use; lab measurements are indicators, not field guarantees. Hero vector ≤80KB, no background video, font subset/weights constrained, image dimensions fixed, below-fold assets lazy. Report measured results honestly.
