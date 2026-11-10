"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import type { HomePageCmsData, ResultsCaseItem } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";

export interface ResultsSectionProps {
  data?: HomePageCmsData["resultsSection"];
  locale?: SupportedLocale;
  isPreviewSession?: boolean;
}

const AUTOPLAY_INTERVAL_MS = 6000;

const PREVIEW_PLACEHOLDER_CASES: ResultsCaseItem[] = [
  {
    id: "preview-case-1",
    titleAr: "موازنة ثنية الجفن العلوي",
    titleEn: "Upper Eyelid Crease Harmony",
    captionAr: "تناسق انحناءة الجفن العلوي مع الحفاظ على راحة سطح العين.",
    captionEn: "Balanced upper eyelid contour preserving natural ocular comfort.",
    beforeImageSrc: "/media/article-eyelid-indication.jpg",
    afterImageSrc: "/media/article-brow-lid-harmony.jpg",
    altAr: "معاينة تخطيطية لحالة الجفن العلوي",
    altEn: "Structural preview of upper eyelid case",
    beforeAltAr: "صورة قبل — معاينة تخطيطية للجفن العلوي",
    beforeAltEn: "Before photo — structural preview of upper eyelid",
    afterAltAr: "صورة بعد — معاينة تخطيطية للجفن العلوي",
    afterAltEn: "After photo — structural preview of upper eyelid",
    beforeFocalPoint: "50% 45%",
    afterFocalPoint: "50% 45%",
    sortOrder: 1,
    status: "draft",
    consentConfirmed: true,
    approvedByDoctor: true,
    published: true,
  },
  {
    id: "preview-case-2",
    titleAr: "تناسق محيط العين والحاجب",
    titleEn: "Periocular & Brow Contour Balance",
    captionAr: "تحسين الانسياب الطبيعي بين الحاجب والجفن العلوي بهدوء.",
    captionEn: "Refined natural transition between the eyebrow and upper eyelid.",
    beforeImageSrc: "/media/article-brow-lid-harmony.jpg",
    afterImageSrc: "/media/hero-eye-plum-ivory.jpg",
    altAr: "معاينة تخطيطية لتناسق محيط العين",
    altEn: "Structural preview of periocular harmony",
    beforeAltAr: "صورة قبل — معاينة تخطيطية لمحيط العين",
    beforeAltEn: "Before photo — structural preview of periocular region",
    afterAltAr: "صورة بعد — معاينة تخطيطية لمحيط العين",
    afterAltEn: "After photo — structural preview of periocular region",
    beforeFocalPoint: "50% 48%",
    afterFocalPoint: "60% 45%",
    sortOrder: 2,
    status: "draft",
    consentConfirmed: true,
    approvedByDoctor: true,
    published: true,
  },
  {
    id: "preview-case-3",
    titleAr: "عناية الجفن وراحة العين",
    titleEn: "Functional Eyelid & Surface Comfort",
    captionAr: "مراعاة الوظيفة الحيوية للجفن وتوازن المظهر الطبيعي.",
    captionEn: "Harmonizing protective eyelid function with calm aesthetics.",
    beforeImageSrc: "/media/article-tear-comfort.jpg",
    afterImageSrc: "/media/article-eyelid-indication.jpg",
    altAr: "معاينة تخطيطية لعناية الجفن",
    altEn: "Structural preview of functional eyelid care",
    beforeAltAr: "صورة قبل — معاينة تخطيطية لراحة الجفن",
    beforeAltEn: "Before photo — structural preview of eyelid comfort",
    afterAltAr: "صورة بعد — معاينة تخطيطية لراحة الجفن",
    afterAltEn: "After photo — structural preview of eyelid comfort",
    beforeFocalPoint: "50% 50%",
    afterFocalPoint: "50% 45%",
    sortOrder: 3,
    status: "draft",
    consentConfirmed: true,
    approvedByDoctor: true,
    published: true,
  },
  {
    id: "preview-case-4",
    titleAr: "إشراقة النظرة الطبيعية",
    titleEn: "Natural Gaze Revitalization",
    captionAr: "نتائج هادئة تحترم الملامح الطبيعية لكل وجه.",
    captionEn: "Subtle outcomes that respect each patient's natural identity.",
    beforeImageSrc: "/media/hero-eye-plum-ivory.jpg",
    afterImageSrc: "/media/article-brow-lid-harmony.jpg",
    altAr: "معاينة تخطيطية لإشراقة النظرة",
    altEn: "Structural preview of natural gaze",
    beforeAltAr: "صورة قبل — معاينة تخطيطية للنظرة",
    beforeAltEn: "Before photo — structural preview of gaze",
    afterAltAr: "صورة بعد — معاينة تخطيطية للنظرة",
    afterAltEn: "After photo — structural preview of gaze",
    beforeFocalPoint: "60% 45%",
    afterFocalPoint: "50% 45%",
    sortOrder: 4,
    status: "draft",
    consentConfirmed: true,
    approvedByDoctor: true,
    published: true,
  },
];

export function ResultsSection({
  data,
  locale = "ar",
  isPreviewSession = false,
}: ResultsSectionProps) {
  const isEn = locale === "en";
  const sectionRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const rawCases = [...(data?.cases ?? [])].sort(
    (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
  );

  // Publicly approved & published cases
  const approvedPublicCases = rawCases.filter((c) => {
    const isPublished = c.status ? c.status === "published" : c.published;
    return (
      isPublished &&
      c.consentConfirmed &&
      c.approvedByDoctor &&
      Boolean(c.beforeImageSrc) &&
      Boolean(c.afterImageSrc)
    );
  });

  // In preview mode, show any configured cases (including drafts) or fallback to structural preview
  const previewConfiguredCases = rawCases.filter(
    (c) => Boolean(c.beforeImageSrc) && Boolean(c.afterImageSrc)
  );

  const displayCases: ResultsCaseItem[] = isPreviewSession
    ? previewConfiguredCases.length > 0
      ? previewConfiguredCases
      : PREVIEW_PLACEHOLDER_CASES
    : approvedPublicCases;

  const totalCount = displayCases.length;
  const hasMultipleCases = totalCount > 1;

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Detect tab visibility
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Detect whether section is inside viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep activeIndex in bounds if cases list changes
  useEffect(() => {
    if (totalCount > 0 && activeIndex >= totalCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalCount]);

  const canAutoPlay =
    hasMultipleCases &&
    !isPausedByUser &&
    !isHovered &&
    !isFocusedWithin &&
    !prefersReducedMotion &&
    isInViewport &&
    isTabVisible;

  useEffect(() => {
    if (!canAutoPlay) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCount);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [canAutoPlay, totalCount]);

  const goToNextManual = useCallback(() => {
    if (!hasMultipleCases) return;
    setIsPausedByUser(true);
    setActiveIndex((prev) => (prev + 1) % totalCount);
  }, [hasMultipleCases, totalCount]);

  const goToPrevManual = useCallback(() => {
    if (!hasMultipleCases) return;
    setIsPausedByUser(true);
    setActiveIndex((prev) => (prev - 1 + totalCount) % totalCount);
  }, [hasMultipleCases, totalCount]);

  const goToIndexManual = useCallback(
    (idx: number) => {
      if (!hasMultipleCases) return;
      setIsPausedByUser(true);
      setActiveIndex(idx);
    },
    [hasMultipleCases]
  );

  // Strict medical honesty gate: never show on public site unless real consented cases exist
  if (approvedPublicCases.length === 0 && !isPreviewSession) {
    return null;
  }

  const baseCopy = isEn
    ? homeContentEn.resultsSection
    : homeContent.resultsSection;

  const eyebrow = isEn
    ? data?.eyebrowEn || baseCopy.eyebrow
    : data?.eyebrow || baseCopy.eyebrow;
  const title = isEn
    ? data?.titleEn || baseCopy.title
    : data?.title || baseCopy.title;
  const description = isEn
    ? data?.descriptionEn || baseCopy.description
    : data?.description || baseCopy.description;
  const beforeLabel = baseCopy.beforeLabel;
  const afterLabel = baseCopy.afterLabel;

  const safeIndex = totalCount > 0 ? activeIndex % totalCount : 0;
  const displayIndex = String(safeIndex + 1).padStart(2, "0");
  const displayTotal = String(totalCount).padStart(2, "0");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasMultipleCases) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isEn) {
        goToNextManual();
      } else {
        goToPrevManual();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isEn) {
        goToPrevManual();
      } else {
        goToNextManual();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleCases || e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      !hasMultipleCases ||
      touchStartXRef.current === null ||
      touchStartYRef.current === null ||
      e.changedTouches.length === 0
    ) {
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      // In LTR, swiping left (deltaX < 0) advances to next; in RTL, swiping right (deltaX > 0) advances to next
      if (isEn) {
        if (deltaX < 0) goToNextManual();
        else goToPrevManual();
      } else {
        if (deltaX > 0) goToNextManual();
        else goToPrevManual();
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="results"
      className="results-plum-section"
      data-testid="results-plum-section"
      aria-labelledby="results-heading"
      aria-roledescription="carousel"
    >
      <Container>
        <div className="results-plum-grid">
          {/* Narrative Side Column */}
          <div className="results-plum__narrative">
            <span className="results-plum__eyebrow">{eyebrow}</span>
            <h2 id="results-heading" className="results-plum__title">
              {title}
            </h2>
            <p className="results-plum__desc">{description}</p>
            <span className="results-plum__olive-rule" aria-hidden="true" />
          </div>

          {/* Side-by-Side Before & After Carousel Gallery */}
          <div
            className="results-carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsFocusedWithin(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsFocusedWithin(false);
              }
            }}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            tabIndex={0}
            role="region"
            aria-label={
              isEn
                ? "Before and After Selected Cases Carousel"
                : "معرض حالات قبل وبعد"
            }
            data-testid="results-carousel-region"
          >
            <div className="results-carousel__stage">
              <div className="results-carousel__slides">
                {displayCases.map((item, idx) => {
                  const isActive = idx === safeIndex;
                  const caseTitle = isEn
                    ? item.titleEn || item.titleAr
                    : item.titleAr || item.titleEn;
                  const caseCaption = isEn
                    ? item.captionEn || item.captionAr
                    : item.captionAr || item.captionEn;
                  const beforeAlt = isEn
                    ? item.beforeAltEn ||
                      item.altEn ||
                      item.beforeAltAr ||
                      item.altAr ||
                      "Before procedure"
                    : item.beforeAltAr ||
                      item.altAr ||
                      "صورة قبل الإجراء";
                  const afterAlt = isEn
                    ? item.afterAltEn ||
                      item.altEn ||
                      item.afterAltAr ||
                      item.altAr ||
                      "After procedure"
                    : item.afterAltAr ||
                      item.altAr ||
                      "صورة بعد الإجراء";

                  return (
                    <article
                      key={item.id}
                      className={`results-carousel__slide ${
                        isActive ? "results-carousel__slide--active" : ""
                      }`.trim()}
                      aria-hidden={!isActive}
                      data-testid={
                        isActive ? "results-active-slide" : "results-slide"
                      }
                    >
                      <div className="results-pair-grid">
                        {/* Before Card */}
                        <figure className="results-photo-card">
                          <div className="results-photo-card__frame">
                            <img
                              src={item.beforeImageSrc}
                              alt={beforeAlt}
                              className="results-photo-card__img"
                              style={{
                                objectPosition:
                                  item.beforeFocalPoint || "50% 50%",
                              }}
                              loading={idx === 0 ? "eager" : "lazy"}
                            />
                            <figcaption
                              className="results-photo-card__badge"
                              data-testid="results-before-badge"
                            >
                              {beforeLabel}
                            </figcaption>
                          </div>
                        </figure>

                        {/* After Card */}
                        <figure className="results-photo-card">
                          <div className="results-photo-card__frame">
                            <img
                              src={item.afterImageSrc}
                              alt={afterAlt}
                              className="results-photo-card__img"
                              style={{
                                objectPosition:
                                  item.afterFocalPoint || "50% 50%",
                              }}
                              loading={idx === 0 ? "eager" : "lazy"}
                            />
                            <figcaption
                              className="results-photo-card__badge results-photo-card__badge--after"
                              data-testid="results-after-badge"
                            >
                              {afterLabel}
                            </figcaption>
                          </div>
                        </figure>
                      </div>

                      {caseTitle || caseCaption ? (
                        <div className="results-carousel__caption-bar">
                          {caseTitle ? (
                            <span className="results-carousel__case-title">
                              {caseTitle}
                            </span>
                          ) : null}
                          {caseCaption ? (
                            <span className="results-carousel__case-desc">
                              {caseCaption}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              {/* Controls Bar (Shown only when more than 1 case exists) */}
              {hasMultipleCases ? (
                <div
                  className="results-carousel__controls"
                  data-testid="results-carousel-controls"
                >
                  <span
                    className="results-plum__counter"
                    dir="ltr"
                    data-testid="results-counter"
                    aria-live="polite"
                  >
                    {displayIndex} / {displayTotal}
                  </span>

                  <div
                    className="results-plum__dots"
                    role="tablist"
                    aria-label={isEn ? "Select case" : "اختر الحالة"}
                  >
                    {displayCases.map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        role="tab"
                        aria-selected={i === safeIndex}
                        aria-label={
                          isEn ? `Case ${i + 1}` : `الحالة ${i + 1}`
                        }
                        className={`results-plum__dot ${
                          i === safeIndex ? "results-plum__dot--active" : ""
                        }`.trim()}
                        onClick={() => goToIndexManual(i)}
                        data-testid="results-dot-btn"
                      />
                    ))}
                  </div>

                  <div className="results-carousel__nav-btns">
                    <button
                      type="button"
                      className="results-carousel__icon-btn"
                      onClick={goToPrevManual}
                      aria-label={isEn ? "Previous case" : "الحالة السابقة"}
                      data-testid="results-prev-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {isEn ? (
                          <path
                            d="M10 3.5L5.5 8L10 12.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <path
                            d="M6 3.5L10.5 8L6 12.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="results-carousel__icon-btn"
                      onClick={() => setIsPausedByUser((prev) => !prev)}
                      aria-pressed={isPausedByUser}
                      aria-label={
                        isPausedByUser
                          ? isEn
                            ? "Resume automatic slide transition"
                            : "استئناف التقليب التلقائي"
                          : isEn
                          ? "Pause automatic slide transition"
                          : "إيقاف التقليب التلقائي مؤقتًا"
                      }
                      title={
                        isPausedByUser
                          ? isEn
                            ? "Resume"
                            : "تشغيل"
                          : isEn
                          ? "Pause"
                          : "إيقاف مؤقت"
                      }
                      data-testid="results-autoplay-toggle"
                    >
                      {isPausedByUser ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 3.5L12.5 8L5 12.5V3.5Z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <rect
                            x="4.2"
                            y="3.5"
                            width="2.6"
                            height="9"
                            rx="0.8"
                            fill="currentColor"
                          />
                          <rect
                            x="9.2"
                            y="3.5"
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
                      className="results-carousel__icon-btn"
                      onClick={goToNextManual}
                      aria-label={isEn ? "Next case" : "الحالة التالية"}
                      data-testid="results-next-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {isEn ? (
                          <path
                            d="M6 3.5L10.5 8L6 12.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <path
                            d="M10 3.5L5.5 8L10 12.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
