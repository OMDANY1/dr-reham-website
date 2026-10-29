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
 * تتضمن فقط المسارات العامة المعتمدة والمقالات المنشورة فعليًا،
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

  const staticRoutes = [
    "/ar",
    "/ar/about",
    "/ar/services",
    "/ar/journal",
    "/ar/faq",
    "/ar/book",
    "/ar/privacy",
  ];

  const publicServices = getPublicServices(servicesRecords);
  const publicArticles = getStrictlyPublishedArticlesForSitemap();

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "/ar" ? 1 : 0.8,
    })),
    ...publicServices.map((service) => ({
      url: `${baseUrl}/ar/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publicArticles.map((article) => ({
      url: `${baseUrl}/ar/journal/${article.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
