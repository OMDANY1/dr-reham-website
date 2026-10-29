import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { articlesRecords, journalPageCopy } from "@/content/ar/articles";
import { getVisibleArticles, isSupportedLocale } from "@/lib/content-gates";
import { isProtectedDraftPreviewActive } from "@/lib/preview-auth";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { JournalExplorer } from "@/components/journal/JournalExplorer";
import { EditorialContactChapter } from "@/components/sections/EditorialContactChapter";

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
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const initialCategory =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "الكل";

  const protectedPreview = await isProtectedDraftPreviewActive();
  const visibleArticles = getVisibleArticles(
    articlesRecords,
    undefined,
    protectedPreview
  );

  return (
    <>
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
              href="/api/preview/exit?redirect=/ar/journal"
              className="protected-preview-bar__exit"
            >
              {journalPageCopy.protectedPreviewNotice.exitPreviewLabel}
            </Link>
          </Container>
        </div>
      ) : null}

      <header className="journal-masthead">
        <Container>
          <span className="journal-masthead__eyebrow">
            {journalPageCopy.eyebrow}
          </span>
          <h1 className="journal-masthead__title">
            {journalPageCopy.headline}
          </h1>
          <p className="journal-masthead__intro">{journalPageCopy.intro}</p>
        </Container>
      </header>

      <section className="section" aria-labelledby="journal-list-heading">
        <Container>
          <h2 id="journal-list-heading" className="sr-only">
            قائمة موضوعات ومقالات العين والجفون
          </h2>

          <JournalExplorer
            articles={visibleArticles}
            isProtectedPreview={protectedPreview}
            initialCategory={initialCategory}
          />

          {/* في النسخة العامة غير المحمية (ومع بقاء المسودات غير منشورة للعامة)، تتوفر بوابة المعاينة المحمية للمراجعين فقط */}
          {!protectedPreview && siteConfig.mode === "preview" ? (
            <aside
              className="journal-preview-gate"
              aria-label="بوابة المعاينة المحمية للمسودات"
            >
              <div>
                <strong>
                  {journalPageCopy.protectedPreviewNotice.publicBannerTitle}
                </strong>
                <p style={{ fontSize: "var(--text-small)", color: "var(--muted)" }}>
                  {journalPageCopy.protectedPreviewNotice.publicBannerText}
                </p>
              </div>

              <form
                action="/api/preview"
                method="GET"
                className="journal-preview-gate__form"
              >
                <input type="hidden" name="redirect" value="/ar/journal" />
                <label htmlFor="preview-key-input" className="sr-only">
                  مفتاح المعاينة المحمية
                </label>
                <input
                  id="preview-key-input"
                  type="password"
                  name="key"
                  placeholder="مفتاح المعاينة المحمية"
                  className="journal-preview-gate__input"
                  required
                />
                <button type="submit" className="btn btn--secondary">
                  دخول المعاينة المحمية
                </button>
              </form>
            </aside>
          ) : null}
        </Container>
      </section>

      <EditorialContactChapter />
    </>
  );
}
