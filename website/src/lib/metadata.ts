import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { validateExternalHttpsUrl } from "@/lib/booking-links";

interface RouteMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  forceNoIndex?: boolean;
}

/**
 * ينشئ بيانات الميتا لكل مسار باللغة العربية مع احترام وضع المعاينة (noindex)
 * وعدم اختراع نطاق canonical وهمي عند كون domain === null.
 */
export function buildRouteMetadata({
  title,
  description,
  pathname,
  forceNoIndex = false,
}: RouteMetadataOptions): Metadata {
  const isPreview = siteConfig.mode === "preview" || forceNoIndex || !siteConfig.domain;
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);
  const canonicalUrl = validDomain
    ? new URL(pathname, validDomain).toString()
    : undefined;

  return {
    title,
    description,
    ...(canonicalUrl
      ? {
          alternates: {
            canonical: canonicalUrl,
            languages: {
              ar: canonicalUrl,
            },
          },
        }
      : {}),
    robots: isPreview
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      locale: "ar_SA",
      type: "website",
      siteName: siteConfig.profile.nameAr,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * ينشئ البيانات المنظمة (JSON-LD) للطبيب باستخدام الحقول الموثقة فقط من سجل المصادر.
 * لا يضيف تقييمات أو شهادات أو مستشفيات أو تخصصات غير موثقة.
 */
export function buildPhysicianJsonLd() {
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);
  const validInstagram = validateExternalHttpsUrl(siteConfig.instagramUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: siteConfig.profile.nameAr,
    alternateName: siteConfig.profile.nameEn,
    description: `${siteConfig.profile.specialtyAr} في ${siteConfig.profile.city}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.profile.city,
      addressCountry: "SA",
    },
    ...(validDomain ? { url: `${validDomain.replace(/\/$/, "")}/ar` } : {}),
    ...(validInstagram ? { sameAs: [validInstagram] } : {}),
  };
}
