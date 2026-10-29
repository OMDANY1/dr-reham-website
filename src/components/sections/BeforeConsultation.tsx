import React from "react";
import { homeContent } from "@/content/ar/home";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * قسم «قبل الاستشارة» في الصفحة الرئيسية:
 * يعرض ثلاث خطوات تحضيرية عامة بتصميم متصل ومرتب يساعد الزائر على الاستعداد للزيارة الطبية،
 * دون تقديم وعود علاجية أو افتراض نظام عمل غير مؤكد داخل العيادة.
 */
export function BeforeConsultation() {
  const { beforeConsultationSection } = homeContent;

  return (
    <section
      id={beforeConsultationSection.id}
      className="prep-steps-section"
      aria-labelledby="before-consultation-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="prep-steps-header">
            <div>
              <span className="eyebrow">
                {beforeConsultationSection.eyebrow}
              </span>
              <h2
                id="before-consultation-heading"
                className="prep-steps-header__title"
              >
                {beforeConsultationSection.title}
              </h2>
            </div>
            <p className="prep-steps-header__intro">
              {beforeConsultationSection.intro}
            </p>
          </div>

          <ol className="prep-steps-track">
            {beforeConsultationSection.steps.map((step) => (
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

          <p className="prep-steps-footnote">
            {beforeConsultationSection.generalNote}
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
