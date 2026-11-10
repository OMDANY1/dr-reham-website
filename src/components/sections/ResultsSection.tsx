"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import type { HomePageCmsData } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export interface ResultsSectionProps {
  data?: HomePageCmsData["resultsSection"];
  locale?: SupportedLocale;
  isPreviewSession?: boolean;
}

export function ResultsSection({
  data,
  locale = "ar",
  isPreviewSession = false,
}: ResultsSectionProps) {
  const isEn = locale === "en";
  const [sliderPercent, setSliderPercent] = useState(50);
  const [activeIndex, setActiveIndex] = useState(0);

  const approvedCases = (data?.cases ?? []).filter(
    (c) =>
      c.published &&
      c.consentConfirmed &&
      c.approvedByDoctor &&
      Boolean(c.beforeImageSrc) &&
      Boolean(c.afterImageSrc)
  );

  // Strict medical honesty gate: never show on public site unless real consented cases exist
  if (approvedCases.length === 0 && !isPreviewSession) {
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
  const ctaLabel = isEn
    ? data?.ctaLabelEn || baseCopy.ctaLabel
    : data?.ctaLabel || baseCopy.ctaLabel;
  const beforeLabel = baseCopy.beforeLabel;
  const afterLabel = baseCopy.afterLabel;

  const activeCase = approvedCases[activeIndex]
    ? {
        id: approvedCases[activeIndex].id,
        beforeImageSrc: approvedCases[activeIndex].beforeImageSrc,
        afterImageSrc: approvedCases[activeIndex].afterImageSrc,
        beforeAlt: isEn
          ? approvedCases[activeIndex].altEn || approvedCases[activeIndex].altAr
          : approvedCases[activeIndex].altAr,
        afterAlt: isEn
          ? approvedCases[activeIndex].altEn || approvedCases[activeIndex].altAr
          : approvedCases[activeIndex].altAr,
      }
    : {
        id: "preview-layout-placeholder",
        beforeImageSrc: "/media/article-eyelid-indication.jpg",
        afterImageSrc: "/media/article-brow-lid-harmony.jpg",
        beforeAlt: isEn ? "Editorial layout preview" : "معاينة تخطيطية قبل",
        afterAlt: isEn ? "Editorial layout preview" : "معاينة تخطيطية بعد",
      };

  const totalCount = approvedCases.length > 0 ? approvedCases.length : 4;
  const displayIndex = String(activeIndex + 1).padStart(2, "0");
  const displayTotal = String(totalCount).padStart(2, "0");

  return (
    <section
      id="results"
      className="results-plum-section"
      data-testid="results-plum-section"
      aria-labelledby="results-heading"
    >
      <Container>
        {approvedCases.length === 0 && isPreviewSession ? (
          <div
            style={{
              marginBlockEnd: "1.25rem",
              padding: "0.55rem 1rem",
              borderRadius: "0.45rem",
              backgroundColor: "rgba(251, 247, 243, 0.12)",
              border: "1px dashed rgba(251, 247, 243, 0.45)",
              fontSize: "0.82rem",
              color: "var(--color-ivory-on-plum)",
            }}
          >
            {baseCopy.previewNotice}
          </div>
        ) : null}

        <div className="results-plum-grid">
          <div className="results-plum__narrative">
            <span className="results-plum__eyebrow">{eyebrow}</span>
            <h2 id="results-heading" className="results-plum__title">
              {title}
            </h2>
            <p className="results-plum__desc">{description}</p>
            <Button href={`/${locale}/book`} variant="outline-white">
              <span>{ctaLabel}</span>
              <span aria-hidden="true">{isEn ? "→" : "←"}</span>
            </Button>
          </div>

          <div className="results-plum__stage-wrap">
            <div className="results-ba-slider">
              {/* After Image (Full underlying layer) */}
              <div className="results-ba-slider__pane">
                <img
                  src={activeCase.afterImageSrc}
                  alt={activeCase.afterAlt}
                  className="results-ba-slider__img"
                />
              </div>

              {/* Before Image (Clipped overlay layer) */}
              <div
                className="results-ba-slider__pane"
                style={{
                  clipPath: isEn
                    ? `inset(0 ${100 - sliderPercent}% 0 0)`
                    : `inset(0 0 0 ${100 - sliderPercent}%)`,
                }}
              >
                <img
                  src={activeCase.beforeImageSrc}
                  alt={activeCase.beforeAlt}
                  className="results-ba-slider__img"
                />
              </div>

              {/* Vertical Divider Line & Handle */}
              <div
                className="results-ba-slider__divider"
                style={{
                  left: isEn ? `${sliderPercent}%` : `${100 - sliderPercent}%`,
                }}
              />
              <div
                className="results-ba-slider__handle"
                style={{
                  left: isEn ? `${sliderPercent}%` : `${100 - sliderPercent}%`,
                }}
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 4.5L2.2 8L5.5 11.5M10.5 4.5L13.8 8L10.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Accessible Range Input for Mouse, Touch, and Keyboard */}
              <input
                type="range"
                min={10}
                max={90}
                value={sliderPercent}
                onChange={(e) => setSliderPercent(Number(e.target.value))}
                className="results-ba-slider__range"
                aria-label={
                  isEn
                    ? "Before and After comparison slider"
                    : "شريط مقارنة قبل وبعد"
                }
              />

              <span className="results-ba-slider__badge results-ba-slider__badge--before">
                {beforeLabel}
              </span>
              <span className="results-ba-slider__badge results-ba-slider__badge--after">
                {afterLabel}
              </span>
            </div>

            <div className="results-plum__pagination">
              <span className="results-plum__counter" dir="ltr">
                {displayIndex} / {displayTotal}
              </span>
              <div className="results-plum__dots" aria-hidden="true">
                {Array.from({ length: Math.min(totalCount, 4) }).map((_, i) => (
                  <span
                    key={i}
                    className={`results-plum__dot ${
                      i === activeIndex ? "results-plum__dot--active" : ""
                    }`.trim()}
                    onClick={() => {
                      if (approvedCases.length > i) {
                        setActiveIndex(i);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
