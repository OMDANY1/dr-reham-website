import type { Metadata } from "next";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { validateExternalHttpsUrl } from "@/lib/booking-links";

interface RouteMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  locale?: SupportedLocale;
  forceNoIndex?: boolean;
}

/**
 * ينشئ بيانات الميتا لكل مسار بالعربية والإنجليزية مع روابط hreflang المتبادلة،
 * مع احترام وضع المعاينة (noindex) وعدم اختراع نطاق canonical وهمي عند كون domain === null.
 */
export function buildRouteMetadata({
  title,
  description,
  pathname,
  locale,
  forceNoIndex = false,
}: RouteMetadataOptions): Metadata {
  const effectiveLocale: SupportedLocale =
    locale ?? (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar");
  const isPreview =
    siteConfig.mode === "preview" || forceNoIndex || !siteConfig.domain;
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);

  const suffix = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "";
  const arPath = `/ar${suffix}`;
  const enPath = `/en${suffix}`;

  const canonicalUrl = validDomain
    ? new URL(pathname, validDomain).toString()
    : pathname;
  const arUrl = validDomain ? new URL(arPath, validDomain).toString() : arPath;
  const enUrl = validDomain ? new URL(enPath, validDomain).toString() : enPath;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: arUrl,
        en: enUrl,
        "x-default": arUrl,
      },
    },
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
      locale: effectiveLocale === "en" ? "en_US" : "ar_SA",
      alternateLocale: effectiveLocale === "en" ? ["ar_SA"] : ["en_US"],
      type: "website",
      siteName:
        effectiveLocale === "en"
          ? siteConfig.profile.nameEn
          : siteConfig.profile.nameAr,
      ...(validDomain ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * ينشئ البيانات المنظمة (JSON-LD) للطبيب باستخدام الحقول الموثقة فقط من سجل المصادر.
 * لا يضيف تقييمات أو شهادات أو مستشفيات أو تخصصات غير موثقة.
 */
export function buildPhysicianJsonLd(locale: SupportedLocale = "ar") {
  const validDomain = validateExternalHttpsUrl(siteConfig.domain);
  const validInstagram = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const isEn = locale === "en";

  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: isEn ? siteConfig.profile.nameEn : siteConfig.profile.nameAr,
    alternateName: isEn ? siteConfig.profile.nameAr : siteConfig.profile.nameEn,
    description: isEn
      ? `${siteConfig.profile.specialtyEn} in ${siteConfig.profile.cityEn}.`
      : `${siteConfig.profile.specialtyAr} في ${siteConfig.profile.city}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: isEn
        ? siteConfig.profile.cityEn
        : siteConfig.profile.city,
      addressCountry: "SA",
    },
    ...(validDomain
      ? { url: `${validDomain.replace(/\/$/, "")}/${locale}` }
      : {}),
    ...(validInstagram ? { sameAs: [validInstagram] } : {}),
  };
}
