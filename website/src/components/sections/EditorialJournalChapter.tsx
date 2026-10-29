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
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface EditorialJournalChapterProps {
  /**
   * المقالات المتاحة في السياق الحالي:
   * - في النسخة العامة: فقط المقالات المعتمدة (`isPublicArticle`). وعند عدم وجود مقالات معتمدة بعد،
   *   يُعرض التكوين التحريري باستخدام المحاور التوعوية العامة (`publicEditorialItems`) دون شارات «مسودة للمراجعة».
   * - في المعاينة المحمية: تُعرض المقالات أو المسودات قيد المراجعة مع شارتها داخل المعاينة المحمية فقط.
   */
  articles: ArticleRecord[];
  isProtectedPreview?: boolean;
}

export function EditorialJournalChapter({
  articles,
  isProtectedPreview = false,
}: EditorialJournalChapterProps) {
  const { journalChapter } = homeContent;

  const hasArticleRecords = articles.length > 0;
  const featuredArticle = hasArticleRecords
    ? articles.find((a) => a.featured) ?? articles[0]
    : null;
  const sideArticles =
    hasArticleRecords && featuredArticle
      ? articles.filter((a) => a.slug !== featuredArticle.slug).slice(0, 2)
      : [];

  const mainItem = featuredArticle
    ? {
        href: `/ar/journal/${featuredArticle.slug}`,
        category: featuredArticle.category,
        meta: formatReadingTimeAr(
          calculateReadingTimeMinutes(featuredArticle)
        ),
        isDraft: isProtectedPreview && featuredArticle.status === "draft",
        title: featuredArticle.title,
        excerpt: featuredArticle.excerpt ?? "",
        image: featuredArticle.image ?? {
          src: "/media/gaze-article-hooded-vs-deepset.jpg",
          alt: featuredArticle.title,
        },
        cta: journalPageCopy.readArticleCta,
      }
    : {
        href: journalChapter.publicEditorialItems.featured.href,
        category: journalChapter.publicEditorialItems.featured.category,
        meta: journalChapter.publicEditorialItems.featured.readingMeta,
        isDraft: false,
        title: journalChapter.publicEditorialItems.featured.title,
        excerpt: journalChapter.publicEditorialItems.featured.excerpt,
        image: journalChapter.publicEditorialItems.featured.image,
        cta: journalChapter.readItemLabel,
      };

  const secondaryItems =
    sideArticles.length > 0
      ? sideArticles.map((article) => ({
          key: article.slug,
          href: `/ar/journal/${article.slug}`,
          category: article.category,
          meta: formatReadingTimeAr(calculateReadingTimeMinutes(article)),
          isDraft: isProtectedPreview && article.status === "draft",
          title: article.title,
          excerpt: article.excerpt ?? "",
          image: article.image ?? {
            src: "/media/gaze-article-periorbital-fatigue.jpg",
            alt: article.title,
          },
        }))
      : journalChapter.publicEditorialItems.sideList.map((item) => ({
          key: item.title,
          href: item.href,
          category: item.category,
          meta: item.readingMeta,
          isDraft: false,
          title: item.title,
          excerpt: item.excerpt,
          image: item.image,
        }));

  return (
    <section
      id={journalChapter.id}
      className="journal-chapter"
      aria-labelledby="journal-chapter-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="journal-chapter__header">
            <div>
              <span className="journal-chapter__eyebrow">
                {journalChapter.eyebrow}
              </span>
              <h2
                id="journal-chapter-heading"
                className="journal-chapter__title"
              >
                {journalChapter.title}
              </h2>
              <p className="journal-chapter__intro">{journalChapter.intro}</p>
            </div>

            <Link
              href={journalChapter.allArticlesHref}
              className="journal-chapter__all-link"
            >
              <span>{journalChapter.allArticlesLabel}</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="journal-chapter__spread">
            {/* العنصر التحريري الرئيسي بصورة كبيرة */}
            <article className="journal-spread-main">
              <Link
                href={mainItem.href}
                className="journal-spread-main__media editorial-image-zoom"
              >
                <img
                  src={mainItem.image.src}
                  alt={mainItem.image.alt}
                  width={1344}
                  height={768}
                  className="journal-spread-main__img"
                />
              </Link>

              <div className="journal-spread-meta">
                <span className="journal-spread-meta__category">
                  {mainItem.category}
                </span>
                <span aria-hidden="true">•</span>
                <span>{mainItem.meta}</span>
                {mainItem.isDraft ? (
                  <span className="journal-spread-meta__draft">
                    {journalPageCopy.articleLabels.draftBadge}
                  </span>
                ) : null}
              </div>

              <h3 className="journal-spread-main__title">
                <Link href={mainItem.href}>{mainItem.title}</Link>
              </h3>

              <p className="journal-spread-main__excerpt">{mainItem.excerpt}</p>

              <Link
                href={mainItem.href}
                className="journal-spread-main__cta"
              >
                <span>{mainItem.cta}</span>
                <span aria-hidden="true">←</span>
              </Link>
            </article>

            {/* القائمة التحريرية الجانبية لمقالين بصور مصغرة وخطوط رفيعة */}
            <div className="journal-spread-side">
              {secondaryItems.map((item) => (
                <article key={item.key} className="journal-side-item">
                  <div>
                    <div className="journal-spread-meta">
                      <span className="journal-spread-meta__category">
                        {item.category}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>{item.meta}</span>
                      {item.isDraft ? (
                        <span className="journal-spread-meta__draft">
                          {journalPageCopy.articleLabels.draftBadge}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="journal-side-item__title">
                      <Link href={item.href}>{item.title}</Link>
                    </h3>

                    <p className="journal-side-item__excerpt">{item.excerpt}</p>
                  </div>

                  <Link
                    href={item.href}
                    className="journal-side-item__thumb editorial-image-zoom"
                    aria-label={item.title}
                  >
                    <img
                      src={item.image.src}
                      alt={item.image.alt}
                      width={420}
                      height={315}
                      className="journal-side-item__img"
                    />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
