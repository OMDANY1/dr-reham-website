/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ARTICLE_CATEGORIES,
  journalPageCopy,
  publicEditorialTopics,
} from "@/content/ar/articles";
import {
  calculateReadingTimeMinutes,
  filterArticles,
  formatReadingTimeAr,
  type ArticleRecord,
} from "@/lib/content-gates";

export interface JournalExplorerProps {
  articles: ArticleRecord[];
  isProtectedPreview?: boolean;
  initialCategory?: string;
}

interface UnifiedMagazineItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  metaText: string;
  isDraft: boolean;
  href: string;
  ctaLabel: string;
  image: {
    src: string;
    alt: string;
  };
}

export function JournalExplorer({
  articles,
  isProtectedPreview = false,
  initialCategory = "الكل",
}: JournalExplorerProps) {
  const validInitialCategory = ARTICLE_CATEGORIES.includes(
    initialCategory as (typeof ARTICLE_CATEGORIES)[number]
  )
    ? initialCategory
    : "الكل";

  const [selectedCategory, setSelectedCategory] =
    useState<string>(validInitialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const items: UnifiedMagazineItem[] = useMemo(() => {
    if (articles.length > 0) {
      return articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt ?? "",
        category: article.category,
        featured: Boolean(article.featured),
        metaText: formatReadingTimeAr(calculateReadingTimeMinutes(article)),
        isDraft: isProtectedPreview && article.status === "draft",
        href: `/ar/journal/${article.slug}`,
        ctaLabel: journalPageCopy.readArticleCta,
        image: article.image ?? {
          src: "/media/gaze-article-hooded-vs-deepset.jpg",
          alt: article.title,
        },
      }));
    }

    return publicEditorialTopics.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      excerpt: topic.excerpt,
      category: topic.category,
      featured: topic.featured,
      metaText: topic.readingLabel,
      isDraft: false,
      href: topic.href,
      ctaLabel: topic.ctaLabel,
      image: topic.image,
    }));
  }, [articles, isProtectedPreview]);

  const isDefaultView =
    selectedCategory === "الكل" && searchQuery.trim().length === 0;

  const featuredItem = useMemo(() => {
    return items.find((item) => item.featured) ?? items[0] ?? null;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (articles.length > 0) {
      const matched = filterArticles(articles, {
        category: selectedCategory,
        query: searchQuery,
      });
      const matchedSlugs = new Set(matched.map((m) => m.slug));
      return items.filter((item) => matchedSlugs.has(item.slug));
    }

    const normalizedCategory = selectedCategory.trim();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCat =
        !normalizedCategory ||
        normalizedCategory === "الكل" ||
        item.category === normalizedCategory;
      if (!matchesCat) return false;
      if (!normalizedQuery) return true;
      const haystack = `${item.title} ${item.excerpt} ${item.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [articles, items, selectedCategory, searchQuery]);

  const rowItems = useMemo(() => {
    if (isDefaultView && featuredItem) {
      return filteredItems.filter((item) => item.slug !== featuredItem.slug);
    }
    return filteredItems;
  }, [filteredItems, isDefaultView, featuredItem]);

  const handleReset = () => {
    setSelectedCategory("الكل");
    setSearchQuery("");
  };

  return (
    <div className="journal-magazine">
      {/* ١. البحث والتصنيفات كجزء واضح ومباشر من رأس الصفحة */}
      <div
        className="journal-toolbar"
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
                className={`journal-category-btn ${
                  active ? "journal-category-btn--active" : ""
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
              مسح ×
            </button>
          ) : null}
        </div>
      </div>

      {/* ٢. المقال الافتتاحي المميز في الوضع الافتراضي (دون تكراره في الصفوف أدناه) */}
      {isDefaultView && featuredItem ? (
        <article
          className="journal-lead-feature"
          data-testid="featured-article-card"
          aria-labelledby="featured-article-title"
        >
          <Link
            href={featuredItem.href}
            className="journal-lead-feature__media editorial-image-zoom"
          >
            <img
              src={featuredItem.image.src}
              alt={featuredItem.image.alt}
              className="journal-lead-feature__img"
              width={1344}
              height={768}
            />
          </Link>

          <div>
            <div className="journal-spread-meta">
              <span className="journal-spread-meta__category">
                {journalPageCopy.featuredBadge} — {featuredItem.category}
              </span>
              <span aria-hidden="true">•</span>
              <span>{featuredItem.metaText}</span>
              {featuredItem.isDraft ? (
                <span
                  className="journal-spread-meta__draft"
                  data-testid="draft-preview-badge"
                >
                  {journalPageCopy.articleLabels.draftBadge}
                </span>
              ) : null}
            </div>

            <h2
              id="featured-article-title"
              className="journal-lead-feature__title"
            >
              <Link href={featuredItem.href}>{featuredItem.title}</Link>
            </h2>

            <p className="journal-lead-feature__excerpt">
              {featuredItem.excerpt}
            </p>

            <Link href={featuredItem.href} className="btn btn--primary">
              <span>{featuredItem.ctaLabel}</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </article>
      ) : null}

      {/* ٣. الصفوف التحريرية المتنوعة أو حالة عدم وجود نتائج */}
      {filteredItems.length === 0 ? (
        <div
          className="empty-state"
          data-testid="journal-empty-results"
          role="status"
        >
          <h3 className="empty-state__title">
            {journalPageCopy.emptySearchState.title}
          </h3>
          <p className="empty-state__message">
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
        <div className="journal-editorial-rows" data-testid="articles-grid">
          {rowItems.map((item, idx) => {
            const isWideRow = idx % 2 === 1;
            return (
              <article
                key={item.slug}
                className={`journal-editorial-row ${
                  isWideRow ? "journal-editorial-row--wide-media" : ""
                }`.trim()}
                data-testid="article-grid-card"
              >
                <div className="journal-editorial-row__meta-col">
                  <span className="journal-spread-meta__category">
                    {item.category}
                  </span>
                  <span>{item.metaText}</span>
                  {item.isDraft ? (
                    <span className="journal-spread-meta__draft">
                      {journalPageCopy.articleLabels.draftBadge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="journal-editorial-row__title">
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p className="journal-editorial-row__excerpt">
                    {item.excerpt}
                  </p>
                  <Link
                    href={item.href}
                    className="journal-editorial-row__link"
                  >
                    <span>{item.ctaLabel}</span>
                    <span aria-hidden="true">←</span>
                  </Link>
                </div>

                <Link
                  href={item.href}
                  className="journal-editorial-row__media editorial-image-zoom"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    className="journal-editorial-row__img"
                    width={672}
                    height={420}
                  />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
