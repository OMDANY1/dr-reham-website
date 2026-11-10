import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { journalPageCopy } from "@/content/ar/articles";
import { journalPageCopyEn } from "@/content/en";
import { isSupportedLocale } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { buildRouteMetadata } from "@/lib/metadata";
import { getPublicOrPreviewArticles } from "@/lib/cms/public-data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { JournalExplorer } from "@/components/journal/JournalExplorer";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { PreviewBanner } from "@/components/cms/PreviewBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isSupportedLocale(locale) ? locale : "ar";
  const copy = validLocale === "en" ? journalPageCopyEn : journalPageCopy;
  return buildRouteMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    pathname: `/${validLocale}/journal`,
    locale: validLocale,
  });
}

export default async function JournalIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const copy = locale === "en" ? journalPageCopyEn : journalPageCopy;
  const sp = await searchParams;
  const { articles: visibleArticles, isPreviewSession } =
    await getPublicOrPreviewArticles(sp?.preview === "1", locale);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);

  return (
    <>
      {isPreviewSession ? <PreviewBanner /> : null}

      <header className="page-header page-header--compact">
        <Container>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="page-header__title">{copy.headline}</h1>
          <p className="section-lead">{copy.intro}</p>
        </Container>
      </header>

      <section
        className="section section--journal-index"
        aria-labelledby="journal-list-heading"
      >
        <Container>
          <h2 id="journal-list-heading" className="sr-only">
            {locale === "en" ? "Educational Articles" : "قائمة المقالات التوعوية"}
          </h2>

          {visibleArticles.length > 0 ? (
            <JournalExplorer
              articles={visibleArticles}
              locale={locale}
              isPreviewSession={isPreviewSession}
            />
          ) : (
            <div className="inquiry-channel-card">
              <h3 className="empty-state__title">
                {copy.directVisitState.title}
              </h3>
              <p className="empty-state__message">
                {copy.directVisitState.message}
              </p>
              <div className="empty-state__actions">
                {instagramHref ? (
                  <Button href={instagramHref} variant="primary" external>
                    {copy.directVisitState.primaryCta} ↗
                  </Button>
                ) : null}
                <Button href={`/${locale}`} variant="secondary">
                  {copy.directVisitState.secondaryCta}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
