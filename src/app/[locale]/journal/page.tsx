import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { journalPageCopy } from "@/content/ar/articles";
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

export const metadata: Metadata = buildRouteMetadata({
  title: journalPageCopy.meta.title,
  description: journalPageCopy.meta.description,
  pathname: "/ar/journal",
});

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

  const sp = await searchParams;
  const { articles: visibleArticles, isPreviewSession } =
    await getPublicOrPreviewArticles(sp?.preview === "1");
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);

  return (
    <>
      {isPreviewSession ? <PreviewBanner /> : null}

      <header className="page-header page-header--compact">
        <Container>
          <span className="eyebrow">{journalPageCopy.eyebrow}</span>
          <h1 className="page-header__title">{journalPageCopy.headline}</h1>
          <p className="section-lead">{journalPageCopy.intro}</p>
        </Container>
      </header>

      <section
        className="section section--journal-index"
        aria-labelledby="journal-list-heading"
      >
        <Container>
          <h2 id="journal-list-heading" className="sr-only">
            قائمة المقالات التوعوية
          </h2>

          {visibleArticles.length > 0 ? (
            <JournalExplorer articles={visibleArticles} />
          ) : (
            <div className="inquiry-channel-card">
              <h3 className="empty-state__title">
                {journalPageCopy.directVisitState.title}
              </h3>
              <p className="empty-state__message">
                {journalPageCopy.directVisitState.message}
              </p>
              <div className="empty-state__actions">
                {instagramHref ? (
                  <Button href={instagramHref} variant="primary" external>
                    {journalPageCopy.directVisitState.primaryCta} ↗
                  </Button>
                ) : null}
                <Button href="/ar" variant="secondary">
                  {journalPageCopy.directVisitState.secondaryCta}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <BookingPanel mode="cta-banner" />
    </>
  );
}
