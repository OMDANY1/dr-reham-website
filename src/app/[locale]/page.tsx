import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeContent } from "@/content/ar/home";
import { articlesRecords, journalPageCopy } from "@/content/ar/articles";
import { getVisibleArticles, isSupportedLocale } from "@/lib/content-gates";
import { isProtectedDraftPreviewActive } from "@/lib/preview-auth";
import { buildPhysicianJsonLd, buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { PanoramicOpening } from "@/components/sections/PanoramicOpening";
import { SpecialtyChapter } from "@/components/sections/SpecialtyChapter";
import { DoctorFeatureChapter } from "@/components/sections/DoctorFeatureChapter";
import { EditorialJournalChapter } from "@/components/sections/EditorialJournalChapter";
import { BeforeVisitChapter } from "@/components/sections/BeforeVisitChapter";
import { EditorialContactChapter } from "@/components/sections/EditorialContactChapter";

export const metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

export default async function ArabicHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const protectedPreview = await isProtectedDraftPreviewActive();
  const visibleArticles = getVisibleArticles(
    articlesRecords,
    undefined,
    protectedPreview
  );
  const physicianSchema = buildPhysicianJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(physicianSchema),
        }}
      />

      {protectedPreview ? (
        <div
          className="protected-preview-bar"
          role="region"
          aria-label="تنبيه وضع المعاينة المحمية"
        >
          <Container className="protected-preview-bar__inner">
            <div>
              <span className="protected-preview-bar__badge">معاينة محمية</span>
              <span>
                {journalPageCopy.protectedPreviewNotice.activeBannerText}
              </span>
            </div>
            <Link
              href="/api/preview/exit?redirect=/ar"
              className="protected-preview-bar__exit"
            >
              {journalPageCopy.protectedPreviewNotice.exitPreviewLabel}
            </Link>
          </Container>
        </div>
      ) : null}

      {/* الفصل الأول — الافتتاحية البانورامية («للنظرة تفاصيل.») */}
      <PanoramicOpening />

      {/* الفصل الثاني — «تخصص يبدأ من التفاصيل» */}
      <SpecialtyChapter />

      {/* الفصل الثالث — «د. ريهام القحطاني» (القسم السماوي المميز) */}
      <DoctorFeatureChapter />

      {/* الفصل الرابع — «اقرأ النظرة عن قرب» */}
      <EditorialJournalChapter
        articles={visibleArticles}
        isProtectedPreview={protectedPreview}
      />

      {/* الفصل الخامس — «قبل زيارتك» (التحضير العام + الأسئلة القابلة للفتح) */}
      <BeforeVisitChapter />

      {/* الفصل السادس — التواصل */}
      <EditorialContactChapter />
    </>
  );
}
