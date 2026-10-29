import type { Metadata } from "next";
import "@/styles/globals.css";
import { homeContent } from "@/content/ar/home";
import { siteConfig } from "@/config/site";
import { buildRouteMetadata } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getCmsSiteSettings,
  getEffectiveHomePageData,
} from "@/lib/cms/repository";

export const metadata: Metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let navigation = { ...homeContent.navigation };
  let brandName = siteConfig.profile.nameAr;
  let specialtyAr = siteConfig.profile.specialtyAr;
  let city = siteConfig.profile.city;
  let instagramUrl = siteConfig.instagramUrl;
  let footerDisclaimer =
    "الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل حالات مرضى أو نتائج علاجية.";
  let bookingLabel: string | undefined;

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
    if (settings?.siteName) brandName = settings.siteName;
    if (settings?.specialtyTitle) specialtyAr = settings.specialtyTitle;
    if (settings?.city) city = settings.city;
    if (settings?.instagramUrl) instagramUrl = settings.instagramUrl;
  } catch {
    // Fallback to static defaults if store is initializing
  }

  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main-content" className="skip-link">
          تخطي إلى المحتوى الرئيسي
        </a>
        <Header
          navigation={navigation}
          brandName={brandName}
          specialtyAr={specialtyAr}
          bookingLabel={bookingLabel}
        />
        <main id="main-content">{children}</main>
        <Footer
          navigation={navigation}
          brandName={brandName}
          specialtyAr={specialtyAr}
          city={city}
          instagramUrl={instagramUrl}
          footerDisclaimer={footerDisclaimer}
          bookingLabel={bookingLabel}
        />
      </body>
    </html>
  );
}
