import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { validateExternalHttpsUrl } from "@/lib/booking-links";

export default function robots(): MetadataRoute.Robots {
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);
  const isProductionReady =
    siteConfig.mode === "production" && Boolean(validDomain);

  if (!isProductionReady || !validDomain) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/ar",
    },
    sitemap: `${validDomain.replace(/\/$/, "")}/sitemap.xml`,
  };
}
