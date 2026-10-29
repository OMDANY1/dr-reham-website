/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { notFoundCopy } from "@/content/ar/not-found";
import { articlesRecords, journalPageCopy } from "@/content/ar/articles";
import { servicesRecords } from "@/content/ar/services";
import {
  calculateArticleWordCount,
  calculateReadingTimeMinutes,
  formatReadingTimeAr,
  getPublicServices,
  getVisibleArticleBySlug,
  getVisibleArticles,
  isSupportedLocale,
} from "@/lib/content-gates";
import { isProtectedDraftPreviewActive } from "@/lib/preview-auth";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArticleShareBar } from "@/components/journal/ArticleShareBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    return buildRouteMetadata({
      title: notFoundCopy.meta.title,
      description: notFoundCopy.meta.description,
      pathname: "/ar",
      forceNoIndex: true,
    });
  }

  const protectedPreview = await isProtectedDraftPreviewActive();
  const article = getVisibleArticleBySlug(
    articlesRecords,
    slug,
    undefined,
    protectedPreview
  );
  if (!article) {
    return buildRouteMetadata({
      title: notFoundCopy.meta.title,
      description: notFoundCopy.meta.description,
      pathname: "/ar/journal",
      forceNoIndex: true,
    });
  }

  return buildRouteMetadata({
    title: article.seo.title
      ? `${article.seo.title} | د. ريهام القحطاني`
      : `${article.title} | د. ريهام القحطاني`,
    description: article.seo.description ?? article.excerpt ?? "",
    pathname: `/ar/journal/${article.slug}`,
    forceNoIndex: article.status === "draft",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const protectedPreview = await isProtectedDraftPreviewActive();
  const article = getVisibleArticleBySlug(
    articlesRecords,
    slug,
    undefined,
    protectedPreview
  );
  if (!article) {
    notFound();
  }

  const readingMinutes = calculateReadingTimeMinutes(article);
  const wordCount = calculateArticleWordCount(article);
  const showTableOfContents = article.body.length >= 3 || wordCount >= 350;

  const allVisibleArticles = getVisibleArticles(
    articlesRecords,
    undefined,
    protectedPreview
  ).filter((item) => item.slug !== article.slug);
  const sameCategoryArticles = allVisibleArticles.filter(
    (item) => item.category === article.category
  );
  const otherCategoryArticles = allVisibleArticles.filter(
    (item) => item.category !== article.category
  );
  const relatedArticles = [
    ...sameCategoryArticles,
    ...otherCategoryArticles,
  ].slice(0, 3);

  const approvedRelatedServices = getPublicServices(servicesRecords).filter(
    (s) => article.relatedServiceSlugs?.includes(s.slug)
  );

  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const hasRealAttribution = Boolean(
    article.author || article.reviewedBy || article.publishedAt
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
              <span>{journalPageCopy.articleLabels.previewNotice}</span>
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

      <header className="article-detail-header">
        <Container>
          <nav aria-label="مسار الصفحة" className="article-breadcrumb">
            <Link href="/ar">{homeContent.navigation.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/ar/journal">
              {journalPageCopy.articleLabels.breadcrumbJournal}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{article.title}</span>
          </nav>

          <div className="journal-spread-meta">
            <span className="journal-spread-meta__category">
              {article.category}
            </span>
            <span aria-hidden="true">•</span>
            <span data-testid="article-reading-time">
              {formatReadingTimeAr(readingMinutes)}
            </span>
            {article.status === "draft" ? (
              <span
                className="journal-spread-meta__draft"
                data-testid="draft-preview-badge"
              >
                {journalPageCopy.articleLabels.draftBadge}
              </span>
            ) : null}
          </div>

          <h1 className="article-detail-header__title">{article.title}</h1>

          {article.excerpt ? (
            <p className="article-detail-header__excerpt">{article.excerpt}</p>
          ) : null}

          {hasRealAttribution ? (
            <div
              className="journal-spread-meta"
              style={{ marginBlockStart: "var(--space-3)" }}
            >
              {article.author ? (
                <span>
                  {journalPageCopy.articleLabels.authorPrefix}{" "}
                  <strong>{article.author}</strong>
                </span>
              ) : null}
              {article.reviewedBy ? (
                <span>
                  {journalPageCopy.articleLabels.reviewedByPrefix}{" "}
                  <strong>{article.reviewedBy}</strong>
                </span>
              ) : null}
              {article.publishedAt ? (
                <span>
                  {journalPageCopy.articleLabels.publishedAtPrefix}{" "}
                  <span>{article.publishedAt}</span>
                </span>
              ) : null}
            </div>
          ) : null}

          {article.image ? (
            <figure className="article-wide-hero">
              <img
                src={article.image.src}
                alt={article.image.alt}
                className="article-wide-hero__img"
                width={1344}
                height={768}
              />
            </figure>
          ) : null}
        </Container>
      </header>

      <article>
        <Container>
          <div className="article-layout">
            {/* فهرس جانبي عند الحاجة */}
            {showTableOfContents ? (
              <aside
                className="article-toc"
                aria-labelledby="article-toc-heading"
                data-testid="article-toc"
              >
                <h2 id="article-toc-heading" className="article-toc__heading">
                  {journalPageCopy.articleLabels.tocHeading}
                </h2>
                <ol className="article-toc__list">
                  {article.body.map((section, idx) => {
                    const sectionId = section.id ?? `section-${idx + 1}`;
                    return (
                      <li key={sectionId}>
                        <a
                          href={`#${sectionId}`}
                          className="article-toc__link"
                        >
                          {section.heading}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            ) : (
              <div />
            )}

            {/* عمود قراءة مريح */}
            <div className="article-prose">
              {article.body.map((section, idx) => {
                const sectionId = section.id ?? `section-${idx + 1}`;
                return (
                  <section
                    key={sectionId}
                    id={sectionId}
                    className="article-prose__section"
                  >
                    <h2 className="article-prose__heading">
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="article-prose__paragraph">
                        {p}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="article-prose__bullets">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                );
              })}

              <div className="before-visit-prep">
                <p style={{ fontSize: "var(--text-small)" }}>
                  {journalPageCopy.articleLabels.disclaimer}
                </p>
              </div>

              {article.sources && article.sources.length > 0 ? (
                <section
                  className="article-sources"
                  aria-labelledby="article-sources-heading"
                  data-testid="article-sources"
                >
                  <h2
                    id="article-sources-heading"
                    className="article-toc__heading"
                  >
                    {journalPageCopy.articleLabels.sourcesHeading}
                  </h2>
                  <ul className="article-sources__list">
                    {article.sources.map((src, idx) => {
                      if (typeof src === "string") {
                        return <li key={idx}>{src}</li>;
                      }
                      return (
                        <li key={idx}>
                          <strong>{src.institution}: </strong>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              textDecoration: "underline",
                              color: "var(--sky-600)",
                            }}
                          >
                            {src.title} ↗
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              <div className="article-share-bar">
                <ArticleShareBar
                  title={article.title}
                  excerpt={article.excerpt}
                />
                <Link href="/ar/journal" className="journal-chapter__all-link">
                  ← {journalPageCopy.articleLabels.backToJournal}
                </Link>
              </div>

              {approvedRelatedServices.length > 0 ? (
                <section className="article-sources">
                  <h2 className="article-toc__heading">
                    {journalPageCopy.articleLabels.relatedServicesHeading}
                  </h2>
                  {approvedRelatedServices.map((srv) => (
                    <Link
                      key={srv.slug}
                      href={`/ar/services/${srv.slug}`}
                      className="specialty-topic-row"
                    >
                      <div>
                        <h3 className="specialty-topic-row__title">
                          {srv.title}
                        </h3>
                        <p className="specialty-topic-row__desc">
                          {srv.summary}
                        </p>
                      </div>
                      <span aria-hidden="true">←</span>
                    </Link>
                  ))}
                </section>
              ) : null}

              <aside
                className="inquiry-channel-card"
                style={{ marginBlockStart: "var(--space-6)" }}
                aria-labelledby="article-calm-inquiry-heading"
              >
                <span className="eyebrow">
                  {journalPageCopy.articleLabels.calmInquiryEyebrow}
                </span>
                <h2
                  id="article-calm-inquiry-heading"
                  style={{
                    fontSize: "var(--text-h3)",
                    marginBlockEnd: "var(--space-2)",
                  }}
                >
                  {journalPageCopy.articleLabels.calmInquiryTitle}
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    marginBlockEnd: "var(--space-4)",
                  }}
                >
                  {journalPageCopy.articleLabels.calmInquiryText}
                </p>
                {instagramHref ? (
                  <Button href={instagramHref} variant="primary" external>
                    {journalPageCopy.articleLabels.calmInquiryCta} ↗
                  </Button>
                ) : (
                  <Button href="/ar/book" variant="primary">
                    {journalPageCopy.articleLabels.calmInquiryCta}
                  </Button>
                )}
              </aside>
            </div>
          </div>
        </Container>
      </article>

      {relatedArticles.length > 0 ? (
        <section
          className="section"
          aria-labelledby="related-articles-heading"
          data-testid="related-articles-section"
        >
          <Container>
            <div className="journal-chapter__header">
              <div>
                <span className="journal-chapter__eyebrow">
                  {article.category}
                </span>
                <h2
                  id="related-articles-heading"
                  className="journal-chapter__title"
                >
                  {journalPageCopy.articleLabels.relatedArticlesHeading}
                </h2>
              </div>
              <Link href="/ar/journal" className="journal-chapter__all-link">
                {homeContent.journalChapter.allArticlesLabel} ←
              </Link>
            </div>

            <div className="journal-editorial-rows">
              {relatedArticles.map((related) => {
                const relMinutes = calculateReadingTimeMinutes(related);
                return (
                  <article
                    key={related.slug}
                    className="journal-editorial-row"
                    data-testid="related-article-card"
                  >
                    <div className="journal-editorial-row__meta-col">
                      <span className="journal-spread-meta__category">
                        {related.category}
                      </span>
                      <span>{formatReadingTimeAr(relMinutes)}</span>
                      {related.status === "draft" ? (
                        <span className="journal-spread-meta__draft">
                          {journalPageCopy.articleLabels.draftBadge}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="journal-editorial-row__title">
                        <Link href={`/ar/journal/${related.slug}`}>
                          {related.title}
                        </Link>
                      </h3>
                      {related.excerpt ? (
                        <p className="journal-editorial-row__excerpt">
                          {related.excerpt}
                        </p>
                      ) : null}
                      <Link
                        href={`/ar/journal/${related.slug}`}
                        className="journal-editorial-row__link"
                      >
                        <span>{journalPageCopy.readArticleCta}</span>
                        <span aria-hidden="true">←</span>
                      </Link>
                    </div>

                    {related.image ? (
                      <Link
                        href={`/ar/journal/${related.slug}`}
                        className="journal-editorial-row__media editorial-image-zoom"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <img
                          src={related.image.src}
                          alt={related.image.alt}
                          className="journal-editorial-row__img"
                          width={640}
                          height={400}
                        />
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
