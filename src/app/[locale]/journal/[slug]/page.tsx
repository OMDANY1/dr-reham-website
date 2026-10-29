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

  const article = getVisibleArticleBySlug(articlesRecords, slug);
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
    // المسودات لا تُفهرس أبدًا حتى لو كانت معروضة في وضع المعاينة
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

  const article = getVisibleArticleBySlug(articlesRecords, slug);
  if (!article) {
    notFound();
  }

  const readingMinutes = calculateReadingTimeMinutes(article);
  const wordCount = calculateArticleWordCount(article);
  const showTableOfContents = article.body.length >= 3 || wordCount >= 350;

  const allVisibleArticles = getVisibleArticles(articlesRecords).filter(
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
  const hasRealAttribution = Boolean(
    article.author || article.reviewedBy || article.publishedAt
  );

  return (
    <>
      <header className="article-detail-header">
        <Container>
          <nav aria-label="مسار الصفحة" className="article-breadcrumb-nav">
            <ol className="breadcrumb">
              <li>
                <Link href="/ar">{homeContent.navigation.home}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/ar/journal">
                  {journalPageCopy.articleLabels.breadcrumbJournal}
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
                {formatReadingTimeAr(readingMinutes)}
              </span>
              {article.status === "draft" ? (
                <span
                  className="draft-preview-badge"
                  data-testid="draft-preview-badge"
                >
                  {journalPageCopy.articleLabels.draftBadge}
                </span>
              ) : null}
            </div>

            <h1 className="article-detail-header__title">{article.title}</h1>

            {article.excerpt ? (
              <p className="article-detail-header__lead">{article.excerpt}</p>
            ) : null}

            {/* لا تُعرض بيانات الكاتب أو المراجع أو تاريخ النشر إلا إذا كانت حقيقية ومعتمدة */}
            {hasRealAttribution ? (
              <div className="article-attribution-row">
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
          </div>

          {article.image ? (
            <figure className="article-hero-figure">
              <img
                src={article.image.src}
                alt={article.image.alt}
                className="article-hero-figure__img"
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
            {/* فهرس التنقل الداخلي للمقالات الطويلة */}
            {showTableOfContents ? (
              <aside
                className="article-toc"
                aria-labelledby="article-toc-heading"
                data-testid="article-toc"
              >
                <div className="article-toc__box">
                  <h2 id="article-toc-heading" className="article-toc__title">
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
                </div>
              </aside>
            ) : null}

            {/* عمود القراءة المريح */}
            <div className="article-reading-column">
              {article.body.map((section, idx) => {
                const sectionId = section.id ?? `section-${idx + 1}`;
                return (
                  <section
                    key={sectionId}
                    id={sectionId}
                    className="article-content-section"
                  >
                    <h2 className="article-content-section__heading">
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="article-content-section__para">
                        {p}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="article-content-section__bullets">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                );
              })}

              {/* تنبيه التوعية العامة */}
              <div className="article-disclaimer-box">
                <p>{journalPageCopy.articleLabels.disclaimer}</p>
              </div>

              {/* المصادر الفعلية في نهاية المقال */}
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
                    {journalPageCopy.articleLabels.sourcesHeading}
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

              {/* شريط المشاركة ونسخ الرابط وعودة للمقالات */}
              <div className="article-footer-bar">
                <ArticleShareBar
                  title={article.title}
                  excerpt={article.excerpt}
                />
                <Link href="/ar/journal" className="text-link">
                  ← {journalPageCopy.articleLabels.backToJournal}
                </Link>
              </div>

              {approvedRelatedServices.length > 0 ? (
                <section className="article-related-services">
                  <h2 className="article-sources__title">
                    {journalPageCopy.articleLabels.relatedServicesHeading}
                  </h2>
                  {approvedRelatedServices.map((srv, idx) => (
                    <Link
                      key={srv.slug}
                      href={`/ar/services/${srv.slug}`}
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
                        تفاصيل الخدمة ←
                      </span>
                    </Link>
                  ))}
                </section>
              ) : null}

              {/* دعوة هادئة للاستفسار عبر القناة الرسمية */}
              <aside
                className="article-calm-inquiry"
                aria-labelledby="article-calm-inquiry-heading"
              >
                <div>
                  <span className="eyebrow">
                    {journalPageCopy.articleLabels.calmInquiryEyebrow}
                  </span>
                  <h2
                    id="article-calm-inquiry-heading"
                    className="article-calm-inquiry__title"
                  >
                    {journalPageCopy.articleLabels.calmInquiryTitle}
                  </h2>
                  <p className="article-calm-inquiry__text">
                    {journalPageCopy.articleLabels.calmInquiryText}
                  </p>
                </div>
                <div className="article-calm-inquiry__actions">
                  {instagramHref ? (
                    <Button href={instagramHref} variant="primary" external>
                      {journalPageCopy.articleLabels.calmInquiryCta} ↗
                    </Button>
                  ) : (
                    <Button href="/ar/book" variant="primary">
                      {journalPageCopy.articleLabels.calmInquiryCta}
                    </Button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </article>

      {/* مقالات مرتبطة بحسب التصنيف مع استبعاد المقال الحالي */}
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
                  {journalPageCopy.articleLabels.relatedArticlesHeading}
                </h2>
              </div>
              <Button href="/ar/journal" variant="secondary">
                {homeContent.knowledgeSection.viewAllLabel}
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
                      href={`/ar/journal/${related.slug}`}
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
                          {formatReadingTimeAr(relMinutes)}
                        </span>
                        {related.status === "draft" ? (
                          <span className="draft-preview-badge">
                            {journalPageCopy.articleLabels.draftBadge}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="journal-card__title">
                        <Link
                          href={`/ar/journal/${related.slug}`}
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
                          href={`/ar/journal/${related.slug}`}
                          className="text-link"
                        >
                          {journalPageCopy.readArticleCta} ←
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
