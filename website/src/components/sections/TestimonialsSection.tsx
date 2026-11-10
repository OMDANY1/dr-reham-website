"use client";

import React, { useCallback, useEffect, useState } from "react";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import type {
  FollowerTestimonialItem,
  HomePageCmsData,
} from "@/lib/cms/types";
import { renderBidiSafeText } from "@/lib/bidi";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface TestimonialsSectionProps {
  data?: HomePageCmsData["testimonialsSection"];
  locale?: SupportedLocale;
  isPreviewSession?: boolean;
}

const DEFAULT_TESTIMONIALS: FollowerTestimonialItem[] =
  homeContent.testimonialsSection.items;

export function TestimonialsSection({
  data,
  locale = "ar",
  isPreviewSession = false,
}: TestimonialsSectionProps) {
  const isEn = locale === "en";

  const rawItems =
    data?.items && data.items.length > 0 ? data.items : DEFAULT_TESTIMONIALS;

  const visibleItems = [...rawItems]
    .filter((item) => {
      if (isPreviewSession) return true;
      return (item.status ?? "published") === "published";
    })
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const total = visibleItems.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused || userPaused || reducedMotion) return;
    const timer = window.setInterval(goNext, 5500);
    return () => window.clearInterval(timer);
  }, [total, isPaused, userPaused, reducedMotion, goNext]);

  if (total === 0) {
    return null;
  }

  const eyebrow = isEn
    ? data?.eyebrowEn || homeContentEn.testimonialsSection.eyebrow
    : data?.eyebrow || homeContent.testimonialsSection.eyebrow;

  const title = isEn
    ? data?.titleEn || homeContentEn.testimonialsSection.title
    : data?.title || homeContent.testimonialsSection.title;

  const subtitle = isEn
    ? data?.subtitleEn || homeContentEn.testimonialsSection.subtitle
    : data?.subtitle || homeContent.testimonialsSection.subtitle;

  const formatCounter = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      id={data?.id || "follower-testimonials"}
      className="testimonials-editorial-section"
      data-testid="testimonials-section"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Container>
        <ScrollReveal>
          <div className="testimonials-header">
            <div className="testimonials-header__copy">
              <span className="eyebrow">{eyebrow}</span>
              <h2
                id="testimonials-heading"
                className="testimonials-header__title"
              >
                {title}
              </h2>
              <p className="testimonials-header__subtitle">{subtitle}</p>
            </div>

            {total > 1 ? (
              <div
                className="testimonials-controls"
                aria-label={
                  isEn
                    ? "Follower reflections navigation"
                    : "التنقل بين آراء المتابعين"
                }
              >
                <span
                  className="testimonials-controls__counter ltr-inline"
                  dir="ltr"
                  data-testid="testimonials-counter"
                >
                  {formatCounter(safeIndex + 1)} / {formatCounter(total)}
                </span>

                <div className="testimonials-controls__btns">
                  <button
                    type="button"
                    className="testimonials-controls__btn"
                    onClick={goPrev}
                    data-testid="testimonials-prev-btn"
                    aria-label={isEn ? "Previous reflection" : "الرأي السابق"}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          isEn
                            ? "M11.25 4.5L6.75 9L11.25 13.5"
                            : "M6.75 4.5L11.25 9L6.75 13.5"
                        }
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="testimonials-controls__btn"
                    onClick={() => setUserPaused((p) => !p)}
                    data-testid="testimonials-autoplay-toggle"
                    aria-pressed={userPaused}
                    aria-label={
                      userPaused
                        ? isEn
                          ? "Resume auto-rotation"
                          : "تشغيل التقليب التلقائي"
                        : isEn
                        ? "Pause auto-rotation"
                        : "إيقاف التقليب التلقائي"
                    }
                  >
                    {userPaused ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M3.5 2.5L11.5 7L3.5 11.5V2.5Z" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="2.5"
                          width="2.6"
                          height="9"
                          rx="0.8"
                          fill="currentColor"
                        />
                        <rect
                          x="8.4"
                          y="2.5"
                          width="2.6"
                          height="9"
                          rx="0.8"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="testimonials-controls__btn"
                    onClick={goNext}
                    data-testid="testimonials-next-btn"
                    aria-label={isEn ? "Next reflection" : "الرأي التالي"}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          isEn
                            ? "M6.75 4.5L11.25 9L6.75 13.5"
                            : "M11.25 4.5L6.75 9L11.25 13.5"
                        }
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="testimonials-grid" role="list">
            {visibleItems.map((item, idx) => {
              const isSpotlight = idx === safeIndex;
              const author = isEn
                ? item.authorEn || item.authorAr
                : item.authorAr;
              const role = isEn ? item.roleEn || item.roleAr : item.roleAr;
              const quote = isEn ? item.quoteEn || item.quoteAr : item.quoteAr;
              const topicTag = isEn
                ? item.topicTagEn || item.topicTagAr
                : item.topicTagAr;
              const platformLabel = isEn
                ? item.platformLabelEn || item.platformLabelAr
                : item.platformLabelAr;
              const initialChar = (author || "R").trim().charAt(0);

              return (
                <article
                  key={item.id}
                  role="listitem"
                  data-testid="testimonial-card"
                  className={`testimonial-card stagger-item ${
                    isSpotlight ? "testimonial-card--spotlight" : ""
                  }`}
                  style={{ "--stagger-index": idx } as React.CSSProperties}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className="testimonial-card__top">
                    <span
                      className="testimonial-card__quote-mark"
                      aria-hidden="true"
                    >
                      <svg
                        width="28"
                        height="22"
                        viewBox="0 0 28 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.4 0C5.1 2.2 0.8 7.3 0.8 13.8C0.8 18.6 4.1 21.8 8.2 21.8C11.9 21.8 14.6 19.2 14.6 15.6C14.6 12.1 11.9 9.7 8.6 9.7C7.6 9.7 6.5 10 5.9 10.4C6.6 6.6 9.3 3.6 12.8 2.1L11.4 0ZM24.8 0C18.5 2.2 14.2 7.3 14.2 13.8C14.2 18.6 17.5 21.8 21.6 21.8C25.3 21.8 28 19.2 28 15.6C28 12.1 25.3 9.7 22 9.7C21 9.7 19.9 10 19.3 10.4C20 6.6 22.7 3.6 26.2 2.1L24.8 0Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>

                    {topicTag ? (
                      <span className="testimonial-card__topic">
                        {topicTag}
                      </span>
                    ) : null}
                  </div>

                  <div
                    className="testimonial-card__stars"
                    aria-hidden="true"
                  >
                    {[0, 1, 2, 3, 4].map((starIdx) => (
                      <svg
                        key={starIdx}
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 1.5L9.85 5.45L14.2 5.95L10.95 8.9L11.82 13.2L8 11.02L4.18 13.2L5.05 8.9L1.8 5.95L6.15 5.45L8 1.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="testimonial-card__quote">
                    <p>{renderBidiSafeText(quote)}</p>
                  </blockquote>

                  <footer className="testimonial-card__footer">
                    <span
                      className="testimonial-card__avatar"
                      aria-hidden="true"
                    >
                      {initialChar}
                    </span>
                    <div className="testimonial-card__meta">
                      <strong className="testimonial-card__author">
                        {author}
                      </strong>
                      <span className="testimonial-card__role">{role}</span>
                      {platformLabel ? (
                        <span className="testimonial-card__platform">
                          {renderBidiSafeText(platformLabel)}
                        </span>
                      ) : null}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>

          <div className="testimonials-footer-bar">
            <div className="testimonials-dots" role="tablist">
              {visibleItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === safeIndex}
                  aria-label={
                    isEn
                      ? `Highlight reflection ${idx + 1}`
                      : `إبراز الرأي رقم ${idx + 1}`
                  }
                  className={`testimonials-dot ${
                    idx === safeIndex ? "testimonials-dot--active" : ""
                  }`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>

            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link testimonials-instagram-link"
            >
              <span>
                {isEn
                  ? "Join the educational community on Instagram"
                  : "تابع الإضاءات التوعوية عبر حساب إنستجرام الرسمي"}
              </span>
              <bdi dir="ltr" className="ltr-inline">
                @dr.rehamdq
              </bdi>
              <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
            </a>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
