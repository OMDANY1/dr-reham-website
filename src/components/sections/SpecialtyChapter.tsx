import React from "react";
import Link from "next/link";
import { homeContent } from "@/content/ar/home";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function SpecialtyChapter() {
  const { specialtyChapter } = homeContent;

  return (
    <section
      id={specialtyChapter.id}
      className="specialty-chapter"
      aria-labelledby="specialty-chapter-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="specialty-chapter__grid">
            <div>
              <span className="specialty-chapter__eyebrow">
                {specialtyChapter.eyebrow}
              </span>
              <h2
                id="specialty-chapter-heading"
                className="specialty-chapter__title"
              >
                {specialtyChapter.title}
              </h2>
              <p className="specialty-chapter__lead">
                {specialtyChapter.lead}
              </p>
              <p className="specialty-chapter__body">
                {specialtyChapter.body}
              </p>
            </div>

            <nav
              className="specialty-chapter__links"
              aria-label="روابط استكشاف محتوى العين والجفون والاستشارة"
            >
              {specialtyChapter.topicLinks.map((topic) => (
                <Link
                  key={topic.href}
                  href={topic.href}
                  className="specialty-topic-row"
                >
                  <div>
                    <span className="specialty-topic-row__meta">
                      {topic.meta}
                    </span>
                    <h3 className="specialty-topic-row__title">
                      {topic.label}
                    </h3>
                    <p className="specialty-topic-row__desc">
                      {topic.description}
                    </p>
                  </div>
                  <span
                    className="specialty-topic-row__arrow"
                    aria-hidden="true"
                  >
                    ←
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
