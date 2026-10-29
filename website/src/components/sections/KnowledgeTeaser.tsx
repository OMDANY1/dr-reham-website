/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { homeContent } from "@/content/ar/home";
import { journalPageCopy } from "@/content/ar/articles";
import {
  calculateReadingTimeMinutes,
  formatReadingTimeAr,
  type ArticleRecord,
} from "@/lib/content-gates";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface KnowledgeTeaserProps {
  articles: ArticleRecord[];
}

/**
 * قسم «من المقالات» في الصفحة الرئيسية:
 * يعرض مقالًا كبيرًا مميزًا بجانب مقالتين أصغر بتكوين تحريري متوازن مع زر «جميع المقالات».
 * في وضع المعاينة يعرض المسودات المكتملة مع شارة «مسودة للمراجعة»، وفي وضع الإنتاج يعرض المعتمد فقط.
 */
export function KnowledgeTeaser({ articles }: KnowledgeTeaserProps) {
  if (articles.length === 0) {
    return null;
  }

  const primaryArticle =
    articles.find((item) => item.featured) ?? articles[0];
  const secondaryArticles = articles
    .filter((item) => item.slug !== primaryArticle.slug)
    .slice(0, 2);

  return (
    <section
      className="home-articles-section"
      aria-labelledby="knowledge-teaser-heading"
      data-testid="home-articles-section"
    >
      <Container>
        <ScrollReveal>
          <div className="section-header-row">
            <div>
              <span className="eyebrow">
                {homeContent.knowledgeSection.eyebrow}
              </span>
              <h2 id="knowledge-teaser-heading" className="section-title">
                {homeContent.knowledgeSection.title}
              </h2>
              <p className="section-lead">
                {homeContent.knowledgeSection.intro}
              </p>
            </div>
            <div className="section-header-row__action">
              <Button href="/ar/journal" variant="secondary">
                {homeContent.knowledgeSection.viewAllLabel} ←
              </Button>
            </div>
          </div>

          <div className="home-articles-showcase">
            {/* المقال الرئيسي الكبير */}
            <article className="home-article-featured">
              <Link
                href={`/ar/journal/${primaryArticle.slug}`}
                className="home-article-featured__media editorial-photo-wrap"
                tabIndex={-1}
                aria-hidden="true"
              >
                {primaryArticle.image ? (
                  <img
                    src={primaryArticle.image.src}
                    alt={primaryArticle.image.alt}
                    className="home-article-featured__img editorial-photo-zoom"
                    width={800}
                    height={500}
                  />
                ) : null}
              </Link>

              <div className="home-article-featured__body">
                <div className="journal-meta-row">
                  <span className="journal-badge journal-badge--category">
                    {primaryArticle.category}
                  </span>
                  <span className="journal-reading-time">
                    {formatReadingTimeAr(
                      calculateReadingTimeMinutes(primaryArticle)
                    )}
                  </span>
                  {primaryArticle.status === "draft" ? (
                    <span className="draft-preview-badge">
                      {journalPageCopy.articleLabels.draftBadge}
                    </span>
                  ) : null}
                </div>

                <h3 className="home-article-featured__title">
                  <Link
                    href={`/ar/journal/${primaryArticle.slug}`}
                    className="journal-card__title-link"
                  >
                    {primaryArticle.title}
                  </Link>
                </h3>

                {primaryArticle.excerpt ? (
                  <p className="home-article-featured__excerpt">
                    {primaryArticle.excerpt}
                  </p>
                ) : null}

                <div>
                  <Link
                    href={`/ar/journal/${primaryArticle.slug}`}
                    className="text-link"
                  >
                    {homeContent.knowledgeSection.readArticleLabel} ←
                  </Link>
                </div>
              </div>
            </article>

            {/* المقالتان الأصغر بجانبه */}
            <div className="home-articles-side">
              {secondaryArticles.map((article) => (
                <article key={article.slug} className="home-article-compact">
                  <Link
                    href={`/ar/journal/${article.slug}`}
                    className="home-article-compact__media editorial-photo-wrap"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {article.image ? (
                      <img
                        src={article.image.src}
                        alt={article.image.alt}
                        className="home-article-compact__img editorial-photo-zoom"
                        width={420}
                        height={280}
                      />
                    ) : null}
                  </Link>

                  <div className="home-article-compact__body">
                    <div className="journal-meta-row">
                      <span className="journal-badge journal-badge--category">
                        {article.category}
                      </span>
                      <span className="journal-reading-time">
                        {formatReadingTimeAr(
                          calculateReadingTimeMinutes(article)
                        )}
                      </span>
                      {article.status === "draft" ? (
                        <span className="draft-preview-badge">
                          {journalPageCopy.articleLabels.draftBadge}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="home-article-compact__title">
                      <Link
                        href={`/ar/journal/${article.slug}`}
                        className="journal-card__title-link"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    {article.excerpt ? (
                      <p className="home-article-compact__excerpt">
                        {article.excerpt}
                      </p>
                    ) : null}

                    <div>
                      <Link
                        href={`/ar/journal/${article.slug}`}
                        className="text-link"
                      >
                        {homeContent.knowledgeSection.readArticleLabel} ←
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
