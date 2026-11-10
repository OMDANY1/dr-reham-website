import React from "react";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface BeforeConsultationProps {
  data?: HomePageCmsData["beforeConsultationSection"];
  locale?: SupportedLocale;
}

export function BeforeConsultation({
  data,
  locale = "ar",
}: BeforeConsultationProps = {}) {
  const isEn = locale === "en";
  const baseSection = isEn
    ? homeContentEn.beforeConsultationSection
    : homeContent.beforeConsultationSection;

  const eyebrow = isEn
    ? baseSection.eyebrow
    : data?.eyebrow || baseSection.eyebrow;
  const title = isEn ? baseSection.title : data?.title || baseSection.title;
  const intro = isEn ? baseSection.intro : data?.intro || baseSection.intro;
  const steps = isEn
    ? baseSection.steps
    : data?.steps?.length
    ? data.steps
    : baseSection.steps;
  const generalNote = isEn
    ? baseSection.generalNote
    : data?.generalNote || baseSection.generalNote;

  return (
    <section
      id={data?.id ?? baseSection.id}
      className="prep-steps-section"
      aria-labelledby="before-consultation-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="prep-steps-header">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h2
                id="before-consultation-heading"
                className="prep-steps-header__title"
              >
                {title}
              </h2>
            </div>
            <p className="prep-steps-header__intro">{intro}</p>
          </div>

          <ol className="prep-steps-track">
            {steps.map((step) => (
              <li key={step.stepNumber} className="prep-step-card">
                <div className="prep-step-card__top">
                  <span className="prep-step-card__number" aria-hidden="true">
                    {step.stepNumber}
                  </span>
                  <span className="prep-step-card__line" aria-hidden="true" />
                </div>
                <h3 className="prep-step-card__title">{step.title}</h3>
                <p className="prep-step-card__desc">{step.description}</p>
              </li>
            ))}
          </ol>

          <p className="prep-steps-footnote">{generalNote}</p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
