import React from "react";
import { homeContent } from "@/content/ar/home";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * قسم التخصص:
 * يعتمد على صورة تحريرية مقرّبة ثانية ومختلفة عن الافتتاحية
 * بتكوين معماري غير مماثل للـ Hero ونص موجز وواضح.
 */
export function SpecialtyIntro() {
  const { specialtySection } = homeContent;

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
            {/* عمود الصورة التحريرية الثانية بإطار سماوي معماري خلفها */}
            <div className="specialty-photo-column editorial-photo-wrap">
              <div className="specialty-photo-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={specialtySection.image.src}
                  alt={specialtySection.image.alt}
                  width={1200}
                  height={1400}
                  loading="lazy"
                  className="specialty-photo-img editorial-photo-zoom"
                />
              </div>
            </div>

            {/* عمود النص التحريري الموجز */}
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
