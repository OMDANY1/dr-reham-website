/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { notFoundCopy } from "@/content/ar/not-found";
import { journalPageCopy } from "@/content/ar/articles";
import { servicesRecords } from "@/content/ar/services";
import {
  homeContentEn,
  journalPageCopyEn,
  notFoundCopyEn,
} from "@/content/en";
import {
  calculateArticleWordCount,
  calculateReadingTimeMinutes,
  formatReadingTime,
  getPublicServices,
  isSupportedLocale,
} from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { buildRouteMetadata } from "@/lib/metadata";
import {
  getPublicOrPreviewArticleBySlug,
  getPublicOrPreviewArticles,
} from "@/lib/cms/public-data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArticleShareBar } from "@/components/journal/ArticleShareBar";
import { PreviewBanner } from "@/components/cms/PreviewBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
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

  const nfCopy = locale === "en" ? notFoundCopyEn : notFoundCopy;
  const sp = await searchParams;
  const { article } = await getPublicOrPreviewArticleBySlug(
    slug,
    sp?.preview === "1",
    locale
  );
  if (!article) {
    return buildRouteMetadata({
      title: nfCopy.meta.title,
      description: nfCopy.meta.description,
      pathname: `/${locale}/journal`,
      locale,
      forceNoIndex: true,
    });
  }

  const brandSuffix =
    locale === "en" ? "Dr. Reham Alqahtani" : "د. ريهام القحطاني";

  return buildRouteMetadata({
    title: article.seo.title
      ? `${article.seo.title} | ${brandSuffix}`
      : `${article.title} | ${brandSuffix}`,
    description: article.seo.description ?? article.excerpt ?? "",
    pathname: `/${locale}/journal/${article.slug}`,
    locale,
    forceNoIndex: article.status === "draft",
  });
}

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const isEn = locale === "en";
  const copy = isEn ? journalPageCopyEn : journalPageCopy;
  const home = isEn ? homeContentEn : homeContent;

  const sp = await searchParams;
  const isPreviewParam = sp?.preview === "1";

  const { article, cmsArticle, redirectToSlug, isPreviewSession } =
    await getPublicOrPreviewArticleBySlug(slug, isPreviewParam, locale);

  if (redirectToSlug && redirectToSlug !== slug) {
    permanentRedirect(`/${locale}/journal/${redirectToSlug}`);
  }

  if (!article) {
    notFound();
  }

  const readingMinutes = calculateReadingTimeMinutes(article);
  const wordCount = calculateArticleWordCount(article);
  const showTableOfContents = article.body.length >= 3 || wordCount >= 350;

  const { articles: allVisible } = await getPublicOrPreviewArticles(
    isPreviewParam,
    locale
  );
  const allVisibleArticles = allVisible.filter(
    (item) => item.slug !== article.slug
  );
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
  const whatsappHref = validateExternalHttpsUrl(siteConfig.whatsappUrl);
  const hasRealAttribution = Boolean(
    article.author || article.reviewedBy || article.publishedAt
  );

  const readingBody =
    isEn && cmsArticle?.en?.body && cmsArticle.en.body.length > 0
      ? cmsArticle.en.body
      : article.body.length > 0
      ? article.body
      : cmsArticle?.body ?? [];

  const disclaimerText = isEn
    ? cmsArticle?.en?.disclaimer || copy.articleLabels.disclaimer
    : cmsArticle?.disclaimer ?? copy.articleLabels.disclaimer;

  return (
    <>
      {isPreviewSession ? <PreviewBanner /> : null}

      <header className="article-detail-header">
        <Container>
          <nav
            aria-label={isEn ? "Breadcrumb" : "مسار الصفحة"}
            className="article-breadcrumb-nav"
          >
            <ol className="breadcrumb">
              <li>
                <Link href={`/${locale}`}>{home.navigation.home}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/${locale}/journal`}>
                  {copy.articleLabels.breadcrumbJournal}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>

          <div className="article-detail-header__inner">
            <div className="journal-meta-row">
              <span className="journal-badge journal-badge--category">
                {article.category}
              </span>
              <span
                className="journal-reading-time"
                data-testid="article-reading-time"
              >
                {formatReadingTime(readingMinutes, locale)}
              </span>
              {isPreviewSession && article.status === "draft" ? (
                <span
                  className="draft-preview-badge"
                  data-testid="draft-preview-badge"
                >
                  {copy.articleLabels.draftBadge}
                </span>
              ) : null}
            </div>

            <h1 className="article-detail-header__title">{article.title}</h1>

            {article.excerpt ? (
              <p className="article-detail-header__lead">{article.excerpt}</p>
            ) : null}

            {hasRealAttribution ? (
              <div className="article-attribution-row">
                {article.author ? (
                  <span>
                    {copy.articleLabels.authorPrefix}{" "}
                    <strong>{article.author}</strong>
                  </span>
                ) : null}
                {article.reviewedBy ? (
                  <span>
                    {copy.articleLabels.reviewedByPrefix}{" "}
                    <strong>{article.reviewedBy}</strong>
                  </span>
                ) : null}
                {article.publishedAt ? (
                  <span>
                    {copy.articleLabels.publishedAtPrefix}{" "}
                    <span>{article.publishedAt}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {article.image ? (
            <figure className="article-hero-figure">
              <img
                src={article.image.src}
                alt={article.image.alt}
                className="article-hero-figure__img"
                style={
                  cmsArticle?.image?.focalX !== undefined &&
                  cmsArticle?.image?.focalY !== undefined
                    ? {
                        objectPosition: `${cmsArticle.image.focalX}% ${cmsArticle.image.focalY}%`,
                      }
                    : undefined
                }
                width={1120}
                height={640}
              />
            </figure>
          ) : null}
        </Container>
      </header>

      <article className="article-detail-body">
        <Container>
          <div className="article-detail-layout">
            {showTableOfContents ? (
              <aside
                className="article-toc"
                aria-labelledby="article-toc-heading"
                data-testid="article-toc"
              >
                <div className="article-toc__box">
                  <h2 id="article-toc-heading" className="article-toc__title">
                    {copy.articleLabels.tocHeading}
                  </h2>
                  <ol className="article-toc__list">
                    {readingBody.map((section, idx) => {
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
                </div>
              </aside>
            ) : null}

            <div className="article-reading-column">
              {readingBody.map((section, idx) => {
                const sectionId = section.id ?? `section-${idx + 1}`;
                const cmsSec = section as {
                  id?: string;
                  heading: string;
                  paragraphs: string[];
                  bullets?: string[];
                  linkLabel?: string;
                  linkUrl?: string;
                  imageSrc?: string;
                  imageAlt?: string;
                };
                return (
                  <section
                    key={sectionId}
                    id={sectionId}
                    className="article-content-section"
                  >
                    <h2 className="article-content-section__heading">
                      {cmsSec.heading}
                    </h2>
                    {cmsSec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="article-content-section__para">
                        {p}
                      </p>
                    ))}
                    {cmsSec.bullets && cmsSec.bullets.length > 0 ? (
                      <ul className="article-content-section__bullets">
                        {cmsSec.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    {cmsSec.imageSrc ? (
                      <figure
                        style={{
                          marginBlock: "var(--space-4)",
                          borderRadius: "var(--control-radius)",
                          overflow: "hidden",
                          border: "1.5px solid var(--color-border)",
                        }}
                      >
                        <img
                          src={cmsSec.imageSrc}
                          alt={cmsSec.imageAlt || cmsSec.heading}
                          style={{
                            inlineSize: "100%",
                            blockSize: "auto",
                            display: "block",
                          }}
                        />
                      </figure>
                    ) : null}
                    {cmsSec.linkUrl && cmsSec.linkLabel ? (
                      <p style={{ marginBlockStart: "var(--space-2)" }}>
                        <a
                          href={cmsSec.linkUrl}
                          className="text-link"
                          target={
                            cmsSec.linkUrl.startsWith("https://")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            cmsSec.linkUrl.startsWith("https://")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {cmsSec.linkLabel} {isEn ? "→" : "←"}
                        </a>
                      </p>
                    ) : null}
                  </section>
                );
              })}

              <div className="article-disclaimer-box">
                <p>{disclaimerText}</p>
              </div>

              {article.sources && article.sources.length > 0 ? (
                <section
                  className="article-sources"
                  aria-labelledby="article-sources-heading"
                  data-testid="article-sources"
                >
                  <h2
                    id="article-sources-heading"
                    className="article-sources__title"
                  >
                    {copy.articleLabels.sourcesHeading}
                  </h2>
                  <ul className="article-sources__list">
                    {article.sources.map((src, idx) => {
                      if (typeof src === "string") {
                        return (
                          <li key={idx} className="article-sources__item">
                            {src}
                          </li>
                        );
                      }
                      return (
                        <li key={idx} className="article-sources__item">
                          <span className="article-sources__institution">
                            {src.institution}
                          </span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="article-sources__link ltr-inline"
                          >
                            {src.title} ↗
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              <div className="article-footer-bar">
                <ArticleShareBar
                  title={article.title}
                  excerpt={article.excerpt}
                  locale={locale}
                />
                <Link href={`/${locale}/journal`} className="text-link">
                  {isEn ? "← " : "← "}
                  {copy.articleLabels.backToJournal}
                </Link>
              </div>

              {approvedRelatedServices.length > 0 ? (
                <section className="article-related-services">
                  <h2 className="article-sources__title">
                    {copy.articleLabels.relatedServicesHeading}
                  </h2>
                  {approvedRelatedServices.map((srv, idx) => (
                    <Link
                      key={srv.slug}
                      href={`/${locale}/services/${srv.slug}`}
                      className="service-link-row"
                    >
                      <span className="numbered-row__index">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="numbered-row__title">{srv.title}</h3>
                        <p className="numbered-row__desc">{srv.summary}</p>
                      </div>
                      <span className="service-link-row__action">
                        {isEn ? "View Service →" : "تفاصيل الخدمة ←"}
                      </span>
                    </Link>
                  ))}
                </section>
              ) : null}

              <aside
                className="article-calm-inquiry"
                aria-labelledby="article-calm-inquiry-heading"
              >
                <div>
                  <span className="eyebrow">
                    {copy.articleLabels.calmInquiryEyebrow}
                  </span>
                  <h2
                    id="article-calm-inquiry-heading"
                    className="article-calm-inquiry__title"
                  >
                    {copy.articleLabels.calmInquiryTitle}
                  </h2>
                  <p className="article-calm-inquiry__text">
                    {copy.articleLabels.calmInquiryText}
                  </p>
                </div>
                <div className="article-calm-inquiry__actions">
                  {whatsappHref ? (
                    <Button href={whatsappHref} variant="primary" external>
                      {isEn ? "Contact via WhatsApp ↗" : "تواصل عبر واتساب ↗"}
                    </Button>
                  ) : instagramHref ? (
                    <Button href={instagramHref} variant="primary" external>
                      {copy.articleLabels.calmInquiryCta} ↗
                    </Button>
                  ) : (
                    <Button href={`/${locale}/book`} variant="primary">
                      {copy.articleLabels.calmInquiryCta}
                    </Button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </article>

      {relatedArticles.length > 0 ? (
        <section
          className="section section--tinted"
          aria-labelledby="related-articles-heading"
          data-testid="related-articles-section"
        >
          <Container>
            <div className="section-header-row">
              <div>
                <span className="eyebrow">{article.category}</span>
                <h2 id="related-articles-heading" className="section-title">
                  {copy.articleLabels.relatedArticlesHeading}
                </h2>
              </div>
              <Button href={`/${locale}/journal`} variant="secondary">
                {home.knowledgeSection.viewAllLabel}
              </Button>
            </div>

            <div className="journal-grid">
              {relatedArticles.map((related) => {
                const relMinutes = calculateReadingTimeMinutes(related);
                return (
                  <article
                    key={related.slug}
                    className="journal-card"
                    data-testid="related-article-card"
                  >
                    <Link
                      href={`/${locale}/journal/${related.slug}`}
                      className="journal-card__media editorial-photo-wrap"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {related.image ? (
                        <img
                          src={related.image.src}
                          alt={related.image.alt}
                          className="journal-card__img editorial-photo-zoom"
                          width={640}
                          height={400}
                        />
                      ) : null}
                    </Link>

                    <div className="journal-card__body">
                      <div className="journal-meta-row">
                        <span className="journal-badge journal-badge--category">
                          {related.category}
                        </span>
                        <span className="journal-reading-time">
                          {formatReadingTime(relMinutes, locale)}
                        </span>
                        {isPreviewSession && related.status === "draft" ? (
                          <span className="draft-preview-badge">
                            {copy.articleLabels.draftBadge}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="journal-card__title">
                        <Link
                          href={`/${locale}/journal/${related.slug}`}
                          className="journal-card__title-link"
                        >
                          {related.title}
                        </Link>
                      </h3>

                      {related.excerpt ? (
                        <p className="journal-card__excerpt">
                          {related.excerpt}
                        </p>
                      ) : null}

                      <div className="journal-card__footer">
                        <Link
                          href={`/${locale}/journal/${related.slug}`}
                          className="text-link"
                        >
                          {copy.readArticleCta} {isEn ? "→" : "←"}
                        </Link>
                      </div>
                    </div>
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
