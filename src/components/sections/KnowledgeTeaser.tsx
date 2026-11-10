/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn, journalPageCopyEn } from "@/content/en";
import { journalPageCopy } from "@/content/ar/articles";
import {
  calculateReadingTimeMinutes,
  formatReadingTime,
  type ArticleRecord,
} from "@/lib/content-gates";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface KnowledgeTeaserProps {
  articles: ArticleRecord[];
  sectionCopy?: HomePageCmsData["knowledgeSection"];
  enOverride?: NonNullable<HomePageCmsData["en"]>["knowledgeSection"];
  locale?: SupportedLocale;
  isPreviewSession?: boolean;
}

function AnatomicalGuideOverlay({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg
        className="education-article-card__guide-svg"
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M52 74C110 56 210 56 268 74"
          stroke="#321C30"
          strokeOpacity="0.72"
          strokeWidth="1.5"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg
        className="education-article-card__guide-svg"
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M78 132C112 72 195 54 258 66"
          stroke="#FBF7F3"
          strokeOpacity="0.88"
          strokeWidth="1.45"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <path
          d="M210 112L224 44M224 44L217 52M224 44L229 54"
          stroke="#FBF7F3"
          strokeOpacity="0.88"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M236 124L250 68M250 68L243 76M250 68L255 78"
          stroke="#FBF7F3"
          strokeOpacity="0.88"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export function KnowledgeTeaser({
  articles,
  sectionCopy,
  enOverride,
  locale = "ar",
  isPreviewSession = false,
}: KnowledgeTeaserProps) {
  if (articles.length === 0) {
    return null;
  }

  const isEn = locale === "en";
  const baseCopy = isEn
    ? homeContentEn.knowledgeSection
    : homeContent.knowledgeSection;

  const eyebrow = isEn
    ? enOverride?.eyebrow || baseCopy.eyebrow
    : sectionCopy?.eyebrow || baseCopy.eyebrow;
  const title = isEn
    ? enOverride?.title || baseCopy.title
    : sectionCopy?.title || baseCopy.title;
  const intro = isEn
    ? enOverride?.intro || baseCopy.intro
    : sectionCopy?.intro || baseCopy.intro;
  const viewAllLabel = isEn
    ? enOverride?.viewAllLabel || baseCopy.viewAllLabel
    : sectionCopy?.viewAllLabel || baseCopy.viewAllLabel;

  const displayArticles = articles.slice(0, 3);
  const draftBadgeLabel = isEn
    ? journalPageCopyEn.articleLabels.draftBadge
    : journalPageCopy.articleLabels.draftBadge;

  return (
    <section
      id="education"
      className="education-editorial-section"
      aria-labelledby="knowledge-teaser-heading"
      data-testid="home-articles-section"
    >
      <Container>
        <ScrollReveal>
          <div className="education-editorial-grid">
            <div className="education-editorial__intro">
              <span className="eyebrow eyebrow--clean">{eyebrow}</span>
              <h2
                id="knowledge-teaser-heading"
                className="education-editorial__title"
              >
                {title}
              </h2>
              <p className="education-editorial__lead">{intro}</p>
              <Link href={`/${locale}/journal`} className="text-link">
                <span>{viewAllLabel}</span>
                <span aria-hidden="true">{isEn ? "→" : "←"}</span>
              </Link>
            </div>

            <div className="education-editorial__cards">
              {displayArticles.map((article, idx) => {
                const minutes = calculateReadingTimeMinutes(article);
                return (
                  <Link
                    key={article.slug}
                    href={`/${locale}/journal/${article.slug}`}
                    className="education-article-card stagger-item"
                    style={{ "--stagger-index": idx } as React.CSSProperties}
                    data-testid="education-article-card"
                  >
                    <div className="education-article-card__media editorial-photo-wrap">
                      {article.image ? (
                        <img
                          src={article.image.src}
                          alt={article.image.alt}
                          className="education-article-card__img editorial-photo-zoom"
                          width={640}
                          height={400}
                        />
                      ) : null}
                      <AnatomicalGuideOverlay index={idx} />
                    </div>

                    <div className="education-article-card__body">
                      <h3 className="education-article-card__title">
                        {article.title}
                      </h3>

                      <div className="education-article-card__meta">
                        <svg
                          className="education-article-card__clock"
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6.25"
                            stroke="currentColor"
                            strokeWidth="1.35"
                          />
                          <path
                            d="M8 4.8V8.2L10.3 9.6"
                            stroke="currentColor"
                            strokeWidth="1.35"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{formatReadingTime(minutes, locale)}</span>
                        {isPreviewSession && article.status === "draft" ? (
                          <span
                            className="draft-preview-badge"
                            data-testid="draft-preview-badge"
                          >
                            {draftBadgeLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
