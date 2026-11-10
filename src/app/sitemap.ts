import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { servicesRecords } from "@/content/ar/services";
import { getPublicServices } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { getStrictlyPublishedArticlesForSitemap } from "@/lib/cms/public-data";
import { getCmsSiteSettings } from "@/lib/cms/repository";

export const dynamic = "force-dynamic";

/**
 * خريطة الموقع (Sitemap):
 * تتضمن فقط المسارات العامة المعتمدة والمقالات المنشورة فعليًا باللغتين (/ar و /en)،
 * ولا تسرّب أي سجل بحالة مسودة (draft) أو بانتظار المراجعة أو مؤرشف.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const settings = getCmsSiteSettings();
  const validDomain = validateExternalHttpsUrl(
    settings.domain ?? siteConfig.domain
  );
  const baseUrl = validDomain
    ? validDomain.replace(/\/$/, "")
    : "http://localhost:3000";

  const staticSuffixes = [
    "",
    "/about",
    "/services",
    "/journal",
    "/faq",
    "/book",
    "/privacy",
  ];

  const publicServices = getPublicServices(servicesRecords);
  const publicArticlesAr = getStrictlyPublishedArticlesForSitemap("ar");
  const publicArticlesEn = getStrictlyPublishedArticlesForSitemap("en");

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["ar", "en"] as const) {
    for (const suffix of staticSuffixes) {
      entries.push({
        url: `${baseUrl}/${locale}${suffix}`,
        changeFrequency: "weekly",
        priority: suffix === "" ? 1 : 0.8,
      });
    }

    for (const service of publicServices) {
      entries.push({
        url: `${baseUrl}/${locale}/services/${service.slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const article of publicArticlesAr) {
    entries.push({
      url: `${baseUrl}/ar/journal/${article.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const article of publicArticlesEn) {
    entries.push({
      url: `${baseUrl}/en/journal/${article.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
