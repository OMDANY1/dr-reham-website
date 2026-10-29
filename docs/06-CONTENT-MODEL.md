# Content architecture

Create typed local data in src/content/ar and central site config. No CMS required for first build. Editable content must not be embedded into JSX across pages.

SiteConfig: nameAr, nameEn, specialtyAr, city, locale, domain:null, instagramUrl, bookingEnabled:false, legalEntity:null, privacyContact:null.
Clinic: id, name, source, affiliationVerified:false, address:null, mapsUrl:null, bookingUrl:null, whatsappE164:null, hours:null, enabled:false.
Service: slug, title, summary, category, overview, consultationNotes, preparation, recovery, risks, faq[], status:draft|published, approvedBy:null, reviewedAt:null. Every medical section requires approval; do not populate guessed healing timelines.
Article: slug,title,excerpt,body,category,author,reviewedBy,reviewedAt,publishedAt,status,seo. Approved service links only.
FAQ: id,question,answer,category,status,reviewedBy.
Asset: id,path,role,alt,rights,consentRef,approved. No clinical case without explicit authorization and context.

Gate: isPublic(record) = status === published AND required approval data exists. Unknown fields remain null; never replace with friendly fabricated values. Distinguish draft copy from publicly approved copy. Site config must support preview mode with noindex; production requires approved records and destinations.

Use content/site-draft.json as source seed; schema above is the contract to implement, not an existing CMS integration. The two clinic entries are source notes only until enabled; do not display them as live options merely because their names exist.
