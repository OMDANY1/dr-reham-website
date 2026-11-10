/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { SupportedLocale } from "@/config/site";
import { ARTICLE_CATEGORIES, journalPageCopy } from "@/content/ar/articles";
import { ARTICLE_CATEGORIES_EN, journalPageCopyEn } from "@/content/en";
import {
  calculateReadingTimeMinutes,
  filterArticles,
  formatReadingTime,
  type ArticleRecord,
} from "@/lib/content-gates";

export interface JournalExplorerProps {
  articles: ArticleRecord[];
  locale?: SupportedLocale;
  isPreviewSession?: boolean;
}

export function JournalExplorer({
  articles,
  locale = "ar",
  isPreviewSession = false,
}: JournalExplorerProps) {
  const isEn = locale === "en";
  const allLabel = isEn ? "All" : "الكل";
  const categories = isEn ? ARTICLE_CATEGORIES_EN : ARTICLE_CATEGORIES;
  const copy = isEn ? journalPageCopyEn : journalPageCopy;

  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isDefaultView =
    (selectedCategory === "الكل" || selectedCategory === "All") &&
    searchQuery.trim().length === 0;

  const featuredArticle = useMemo(() => {
    return articles.find((item) => item.featured) ?? articles[0] ?? null;
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return filterArticles(articles, {
      category: selectedCategory,
      query: searchQuery,
    });
  }, [articles, selectedCategory, searchQuery]);

  const gridArticles = useMemo(() => {
    if (isDefaultView && featuredArticle) {
      return filteredArticles.filter(
        (item) => item.slug !== featuredArticle.slug
      );
    }
    return filteredArticles;
  }, [filteredArticles, isDefaultView, featuredArticle]);

  const handleReset = () => {
    setSelectedCategory(allLabel);
    setSearchQuery("");
  };

  return (
    <div className="journal-magazine">
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
                {copy.featuredBadge}
              </span>
              <span className="journal-badge journal-badge--category">
                {featuredArticle.category}
              </span>
              <span className="journal-reading-time">
                {formatReadingTime(
                  calculateReadingTimeMinutes(featuredArticle),
                  locale
                )}
              </span>
              {isPreviewSession && featuredArticle.status === "draft" ? (
                <span
                  className="draft-preview-badge"
                  data-testid="draft-preview-badge"
                >
                  {copy.articleLabels.draftBadge}
                </span>
              ) : null}
            </div>

            <h2
              id="featured-article-title"
              className="journal-featured__title"
            >
              <Link
                href={`/${locale}/journal/${featuredArticle.slug}`}
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
                href={`/${locale}/journal/${featuredArticle.slug}`}
                className="btn btn--primary"
              >
                <span>{copy.readArticleCta}</span>
                <span aria-hidden="true">{isEn ? "→" : "←"}</span>
              </Link>
            </div>
          </div>
        </article>
      ) : null}

      <div
        className="journal-controls"
        role="region"
        aria-label={
          isEn
            ? "Article search and category filters"
            : "أدوات البحث وتصفية المقالات"
        }
      >
        <div
          className="journal-categories"
          role="group"
          aria-label={copy.categoryFilterLabel}
        >
          {categories.map((category) => {
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
            {copy.searchLabel}
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
              placeholder={copy.searchPlaceholder}
              className="journal-search__input"
              data-testid="journal-search-input"
            />
            {searchQuery.trim().length > 0 ? (
              <button
                type="button"
                className="journal-search__clear"
                onClick={() => setSearchQuery("")}
                aria-label={copy.clearSearchLabel}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div
          className="journal-empty-state"
          data-testid="journal-empty-results"
          role="status"
        >
          <h3 className="journal-empty-state__title">
            {copy.emptySearchState.title}
          </h3>
          <p className="journal-empty-state__message">
            {copy.emptySearchState.message}
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleReset}
          >
            {copy.emptySearchState.resetCta}
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
                  href={`/${locale}/journal/${article.slug}`}
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
                      {formatReadingTime(minutes, locale)}
                    </span>
                    {isPreviewSession && article.status === "draft" ? (
                      <span className="draft-preview-badge">
                        {copy.articleLabels.draftBadge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="journal-card__title">
                    <Link
                      href={`/${locale}/journal/${article.slug}`}
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
                      href={`/${locale}/journal/${article.slug}`}
                      className="text-link"
                    >
                      <span>{copy.readArticleCta}</span>
                      <span aria-hidden="true">{isEn ? "→" : "←"}</span>
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
