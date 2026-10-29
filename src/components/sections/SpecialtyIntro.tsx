import React from "react";
import { homeContent } from "@/content/ar/home";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface SpecialtyIntroProps {
  data?: HomePageCmsData["specialtySection"];
}

export function SpecialtyIntro({ data }: SpecialtyIntroProps = {}) {
  const specialtySection = data ?? homeContent.specialtySection;
  const img = specialtySection.image as {
    src: string;
    alt: string;
    focalX?: number;
    focalY?: number;
  };

  return (
    <section
      id={specialtySection.id}
      className="specialty-showcase-section"
      style={{ scrollMarginBlockStart: "5.5rem" }}
      aria-labelledby="specialty-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="specialty-showcase-grid">
            <div className="specialty-photo-column editorial-photo-wrap">
              <div className="specialty-photo-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  width={1200}
                  height={1400}
                  loading="lazy"
                  style={
                    img.focalX !== undefined && img.focalY !== undefined
                      ? {
                          objectPosition: `${img.focalX}% ${img.focalY}%`,
                        }
                      : undefined
                  }
                  className="specialty-photo-img editorial-photo-zoom"
                />
              </div>
            </div>

            <div className="specialty-copy-column">
              <span className="eyebrow">{specialtySection.eyebrow}</span>
              <h2 id="specialty-heading" className="specialty-copy-column__title">
                {specialtySection.title}
              </h2>
              <p className="specialty-copy-column__lead">
                {specialtySection.lead}
              </p>

              <ol className="specialty-highlights-list">
                {specialtySection.highlights.map((item) => (
                  <li key={item.number} className="specialty-highlight-row">
                    <span
                      className="specialty-highlight-row__num"
                      aria-hidden="true"
                    >
                      {item.number}
                    </span>
                    <div>
                      <h3 className="specialty-highlight-row__title">
                        {item.title}
                      </h3>
                      <p className="specialty-highlight-row__desc">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
