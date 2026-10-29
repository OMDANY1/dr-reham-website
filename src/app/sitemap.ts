import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { servicesRecords } from "@/content/ar/services";
import { articlesRecords } from "@/content/ar/articles";
import { getPublicArticles, getPublicServices } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";

/**
 * خريطة الموقع (Sitemap):
 * تتضمن فقط المسارات العامة المعتمدة ولا تسرّب أي سجل بحالة مسودة (draft).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);
  // عند عدم تحديد نطاق رسمي بعد، نستخدم مسارات نسبية آمنة أو قاعدة محلية بدون اختراع example.com
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
  const publicArticles = getPublicArticles(articlesRecords);

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
