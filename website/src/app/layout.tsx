import type { Metadata } from "next";
import { headers } from "next/headers";
import "@/styles/globals.css";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { buildRouteMetadata } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import {
  getCmsSiteSettings,
  getEffectiveHomePageData,
} from "@/lib/cms/repository";

export const metadata: Metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale: SupportedLocale = "ar";
  try {
    const reqHeaders = await headers();
    if (reqHeaders.get("x-site-locale") === "en") {
      locale = "en";
    }
  } catch {
    // Fallback to 'ar' if headers() is not available during static generation
  }

  const isEn = locale === "en";
  const dir = isEn ? "ltr" : "rtl";

  let navigation = { ...homeContent.navigation };
  let navigationEn = { ...homeContentEn.navigation };
  let brandName = siteConfig.profile.nameAr;
  let brandNameEn = siteConfig.profile.nameEn;
  let specialtyAr = siteConfig.profile.specialtyAr;
  let specialtyEn = siteConfig.profile.specialtyEn;
  let city = siteConfig.profile.city;
  let cityEn = siteConfig.profile.cityEn;
  let instagramUrl = siteConfig.instagramUrl;
  let whatsappUrl = siteConfig.whatsappUrl;
  let whatsappDisplay = siteConfig.whatsappDisplay;
  let footerDisclaimer =
    "الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل حالات مرضى أو نتائج علاجية.";
  let footerDisclaimerEn =
    "Images published on this website are editorial and illustrative and do not represent individual patient cases or clinical outcomes.";
  let bookingLabel: string | undefined;
  let bookingLabelEn: string | undefined;

  try {
    const homeData = getEffectiveHomePageData({ previewDraft: false });
    const settings = getCmsSiteSettings();
    if (homeData?.headerFooter) {
      navigation = {
        ...homeContent.navigation,
        about: homeData.headerFooter.aboutLabel || homeContent.navigation.about,
        specialty:
          homeData.headerFooter.specialtyLabel ||
          homeContent.navigation.specialty,
        journal:
          homeData.headerFooter.journalLabel || homeContent.navigation.journal,
        faq: homeData.headerFooter.faqLabel || homeContent.navigation.faq,
        contact:
          homeData.headerFooter.contactLabel || homeContent.navigation.contact,
        privacy:
          homeData.headerFooter.privacyLabel || homeContent.navigation.privacy,
      };
      if (homeData.headerFooter.footerDisclaimer) {
        footerDisclaimer = homeData.headerFooter.footerDisclaimer;
      }
      if (homeData.headerFooter.primaryInquiryCta) {
        bookingLabel = homeData.headerFooter.primaryInquiryCta;
      }
    }
    if (homeData?.en?.headerFooter) {
      navigationEn = {
        ...homeContentEn.navigation,
        about:
          homeData.en.headerFooter.aboutLabel ||
          homeContentEn.navigation.about,
        specialty:
          homeData.en.headerFooter.specialtyLabel ||
          homeContentEn.navigation.specialty,
        journal:
          homeData.en.headerFooter.journalLabel ||
          homeContentEn.navigation.journal,
        faq: homeData.en.headerFooter.faqLabel || homeContentEn.navigation.faq,
        contact:
          homeData.en.headerFooter.contactLabel ||
          homeContentEn.navigation.contact,
        privacy:
          homeData.en.headerFooter.privacyLabel ||
          homeContentEn.navigation.privacy,
      };
      if (homeData.en.headerFooter.footerDisclaimer) {
        footerDisclaimerEn = homeData.en.headerFooter.footerDisclaimer;
      }
      if (homeData.en.headerFooter.primaryInquiryCta) {
        bookingLabelEn = homeData.en.headerFooter.primaryInquiryCta;
      }
    }
    if (settings?.siteName) brandName = settings.siteName;
    if (settings?.siteNameEn) brandNameEn = settings.siteNameEn;
    if (settings?.specialtyTitle) specialtyAr = settings.specialtyTitle;
    if (settings?.specialtyTitleEn) specialtyEn = settings.specialtyTitleEn;
    if (settings?.city) city = settings.city;
    if (settings?.cityEn) cityEn = settings.cityEn;
    if (settings?.instagramUrl) instagramUrl = settings.instagramUrl;
    if (settings?.whatsappUrl) whatsappUrl = settings.whatsappUrl;
    if (settings?.phone) whatsappDisplay = settings.phone;
  } catch {
    // Fallback to static defaults if store is initializing
  }

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          {isEn ? "Skip to main content" : "تخطي إلى المحتوى الرئيسي"}
        </a>
        <Header
          navigation={navigation}
          navigationEn={navigationEn}
          brandName={brandName}
          brandNameEn={brandNameEn}
          specialtyAr={specialtyAr}
          specialtyEn={specialtyEn}
          bookingLabel={bookingLabel}
          bookingLabelEn={bookingLabelEn}
          whatsappUrl={whatsappUrl}
        />
        <main id="main-content">{children}</main>
        <FloatingWhatsApp
          whatsappUrl={whatsappUrl}
          whatsappDisplay={whatsappDisplay}
        />
        <Footer
          navigation={navigation}
          navigationEn={navigationEn}
          brandName={brandName}
          brandNameEn={brandNameEn}
          specialtyAr={specialtyAr}
          specialtyEn={specialtyEn}
          city={city}
          cityEn={cityEn}
          instagramUrl={instagramUrl}
          footerDisclaimer={footerDisclaimer}
          footerDisclaimerEn={footerDisclaimerEn}
          bookingLabel={bookingLabel}
          bookingLabelEn={bookingLabelEn}
          whatsappUrl={whatsappUrl}
          whatsappDisplay={whatsappDisplay}
        />
      </body>
    </html>
  );
}
