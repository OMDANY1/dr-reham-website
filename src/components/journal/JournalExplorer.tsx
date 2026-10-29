/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ARTICLE_CATEGORIES, journalPageCopy } from "@/content/ar/articles";
import {
  calculateReadingTimeMinutes,
  filterArticles,
  formatReadingTimeAr,
  type ArticleRecord,
} from "@/lib/content-gates";

export interface JournalExplorerProps {
  articles: ArticleRecord[];
}

export function JournalExplorer({ articles }: JournalExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isDefaultView =
    selectedCategory === "الكل" && searchQuery.trim().length === 0;

  const featuredArticle = useMemo(() => {
    return articles.find((item) => item.featured) ?? articles[0] ?? null;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return filterArticles(articles, {
      category: selectedCategory,
      query: searchQuery,
    });
  }, [articles, selectedCategory, searchQuery]);

  // في العرض الافتراضي يظهر المقال المميز في الأعلى ولا يتكرر في الشبكة أدناه
  const gridArticles = useMemo(() => {
    if (isDefaultView && featuredArticle) {
      return filteredArticles.filter(
        (item) => item.slug !== featuredArticle.slug
      );
    }
    return filteredArticles;
  }, [filteredArticles, isDefaultView, featuredArticle]);

  const handleReset = () => {
    setSelectedCategory("الكل");
    setSearchQuery("");
  };

  return (
    <div className="journal-magazine">
      {/* ١. المقال المميز في البداية (يظهر في الوضع الافتراضي قبل التصفية والبحث فلا يتكرر في الشبكة) */}
      {isDefaultView && featuredArticle ? (
        <article
          className="journal-featured"
          data-testid="featured-article-card"
          aria-labelledby="featured-article-title"
        >
          <div className="journal-featured__media editorial-photo-wrap">
            {featuredArticle.image ? (
              <img
                src={featuredArticle.image.src}
                alt={featuredArticle.image.alt}
                className="journal-featured__img editorial-photo-zoom"
                width={960}
                height={600}
              />
            ) : null}
          </div>

          <div className="journal-featured__content">
            <div className="journal-meta-row">
              <span className="journal-badge journal-badge--featured">
                {journalPageCopy.featuredBadge}
              </span>
              <span className="journal-badge journal-badge--category">
                {featuredArticle.category}
              </span>
              <span className="journal-reading-time">
                {formatReadingTimeAr(
                  calculateReadingTimeMinutes(featuredArticle)
                )}
              </span>
              {featuredArticle.status === "draft" ? (
                <span
                  className="draft-preview-badge"
                  data-testid="draft-preview-badge"
                >
                  {journalPageCopy.articleLabels.draftBadge}
                </span>
              ) : null}
            </div>

            <h2
              id="featured-article-title"
              className="journal-featured__title"
            >
              <Link
                href={`/ar/journal/${featuredArticle.slug}`}
                className="journal-featured__title-link"
              >
                {featuredArticle.title}
              </Link>
            </h2>

            {featuredArticle.excerpt ? (
              <p className="journal-featured__excerpt">
                {featuredArticle.excerpt}
              </p>
            ) : null}

            <div className="journal-featured__actions">
              <Link
                href={`/ar/journal/${featuredArticle.slug}`}
                className="btn btn--primary"
              >
                {journalPageCopy.readArticleCta} ←
              </Link>
            </div>
          </div>
        </article>
      ) : null}

      {/* ٢. شريط البحث والفلاتر التفاعلي */}
      <div
        className="journal-controls"
        role="region"
        aria-label="أدوات البحث وتصفية المقالات"
      >
        <div
          className="journal-categories"
          role="group"
          aria-label={journalPageCopy.categoryFilterLabel}
        >
          {ARTICLE_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`journal-category-pill ${
                  active ? "journal-category-pill--active" : ""
                }`.trim()}
                aria-pressed={active}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="journal-search">
          <label htmlFor="journal-search-input" className="sr-only">
            {journalPageCopy.searchLabel}
          </label>
          <div className="journal-search__field">
            <svg
              className="journal-search__icon"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="9"
                r="6.25"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path
                d="M13.5 13.5L17.25 17.25"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            <input
              id="journal-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={journalPageCopy.searchPlaceholder}
              className="journal-search__input"
              data-testid="journal-search-input"
            />
            {searchQuery.trim().length > 0 ? (
              <button
                type="button"
                className="journal-search__clear"
                onClick={() => setSearchQuery("")}
                aria-label={journalPageCopy.clearSearchLabel}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ٣. شبكة المقالات أو حالة عدم وجود نتائج */}
      {filteredArticles.length === 0 ? (
        <div
          className="journal-empty-state"
          data-testid="journal-empty-results"
          role="status"
        >
          <h3 className="journal-empty-state__title">
            {journalPageCopy.emptySearchState.title}
          </h3>
          <p className="journal-empty-state__message">
            {journalPageCopy.emptySearchState.message}
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleReset}
          >
            {journalPageCopy.emptySearchState.resetCta}
          </button>
        </div>
      ) : (
        <div className="journal-grid" data-testid="articles-grid">
          {gridArticles.map((article) => {
            const minutes = calculateReadingTimeMinutes(article);
            return (
              <article
                key={article.slug}
                className="journal-card"
                data-testid="article-grid-card"
              >
                <Link
                  href={`/ar/journal/${article.slug}`}
                  className="journal-card__media editorial-photo-wrap"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {article.image ? (
                    <img
                      src={article.image.src}
                      alt={article.image.alt}
                      className="journal-card__img editorial-photo-zoom"
                      width={640}
                      height={400}
                    />
                  ) : null}
                </Link>

                <div className="journal-card__body">
                  <div className="journal-meta-row">
                    <span className="journal-badge journal-badge--category">
                      {article.category}
                    </span>
                    <span className="journal-reading-time">
                      {formatReadingTimeAr(minutes)}
                    </span>
                    {article.status === "draft" ? (
                      <span className="draft-preview-badge">
                        {journalPageCopy.articleLabels.draftBadge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="journal-card__title">
                    <Link
                      href={`/ar/journal/${article.slug}`}
                      className="journal-card__title-link"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {article.excerpt ? (
                    <p className="journal-card__excerpt">{article.excerpt}</p>
                  ) : null}

                  <div className="journal-card__footer">
                    <Link
                      href={`/ar/journal/${article.slug}`}
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
      )}
    </div>
  );
}
