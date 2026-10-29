import React from "react";
import Link from "next/link";
import { homeContent } from "@/content/ar/home";
import { faqRecords } from "@/content/ar/faq";
import { getPublicFaqs } from "@/lib/content-gates";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function BeforeVisitChapter() {
  const { beforeVisitChapter } = homeContent;
  const publicFaqs = getPublicFaqs(faqRecords);

  const accordionItems = publicFaqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer ?? "",
  }));

  return (
    <section
      id={beforeVisitChapter.id}
      className="before-visit-chapter"
      aria-labelledby="before-visit-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="before-visit-chapter__header">
            <span className="before-visit-chapter__eyebrow">
              {beforeVisitChapter.eyebrow}
            </span>
            <h2
              id="before-visit-heading"
              className="before-visit-chapter__title"
            >
              {beforeVisitChapter.title}
            </h2>
            <p className="before-visit-chapter__intro">
              {beforeVisitChapter.intro}
            </p>
          </div>

          <div className="before-visit-chapter__split">
            {/* جانب مختصر للتحضير العام */}
            <div className="before-visit-prep">
              <h3 className="before-visit-prep__heading">
                {beforeVisitChapter.preparationSide.heading}
              </h3>
              <p className="before-visit-prep__summary">
                {beforeVisitChapter.preparationSide.summary}
              </p>

              <ul className="before-visit-prep__list">
                {beforeVisitChapter.preparationSide.items.map((item) => (
                  <li
                    key={item.title}
                    className="before-visit-prep__item"
                  >
                    <h4 className="before-visit-prep__item-title">
                      {item.title}
                    </h4>
                    <p className="before-visit-prep__item-detail">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* جانب الأسئلة العملية القابلة للفتح */}
            <div>
              <div className="before-visit-faq__header">
                <h3 className="before-visit-faq__heading">
                  {beforeVisitChapter.faqSide.heading}
                </h3>
                <Link
                  href={beforeVisitChapter.faqSide.allFaqLinkHref}
                  className="before-visit-faq__link"
                >
                  {beforeVisitChapter.faqSide.allFaqLinkLabel} ←
                </Link>
              </div>

              <Accordion items={accordionItems} />
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
