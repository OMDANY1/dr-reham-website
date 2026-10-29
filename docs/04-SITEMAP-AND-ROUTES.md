# Routes and information architecture

Use localized path prefix now; only `ar` is enabled. `/` redirects to `/ar`. Unknown locale and unknown slugs return 404. Do not add an inert language switch.

| URL | Purpose | Specification | Navigation & Release Handling |
|---|---|---|---|
| /ar | Home | routes/home.md | Photographic editorial hero, doctor intro, specialty section, final inquiry CTA |
| /ar/about | About doctor | routes/about.md | Editorial profile with confirmed facts only; visible in primary nav |
| /ar/services | Services index | routes/services.md | Hidden from nav and home when 0 approved services; direct URL shows clean status without internal jargon |
| /ar/services/[slug] | Service details | routes/services.md | status=published and clinically approved; else 404 |
| /ar/journal | Education index | routes/journal.md | Hidden from nav and home when 0 approved articles; direct URL shows clean status |
| /ar/journal/[slug] | Article | routes/journal.md | Published and reviewed; else 404 |
| /ar/faq | Common questions | routes/faq.md | Shown in nav/home only when approved useful Q&A exist |
| /ar/book | Inquiry & contact | routes/book.md | Verified contact/inquiry channel (Instagram or verified clinics when active) |
| /ar/privacy | Privacy | routes/privacy.md | Footer link; truthful data practices |
| unmatched | 404 | routes/not-found.md | Always returns real 404 |

## Navigation rules
- Hide links to unready sections (`الخدمات`, `المعرفة`, `الأسئلة الشائعة`) from the primary header/footer navigation when their approved record count is zero.
- Primary navigation when clinical records are pending: `عن الدكتورة` (`/ar/about`), `التخصص` (`/ar#specialty`), `تواصل للاستفسار` (`/ar/book`).
- Header CTA: `تواصل للاستفسار` (links to `/ar/book` or verified contact flow; never write «احجز الآن» when live booking is unconfigured).
