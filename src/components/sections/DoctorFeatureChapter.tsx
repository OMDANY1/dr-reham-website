import React from "react";
import Link from "next/link";
import { homeContent } from "@/content/ar/home";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function DoctorFeatureChapter() {
  const { doctorChapter } = homeContent;

  return (
    <section
      id={doctorChapter.id}
      className="doctor-feature-chapter"
      aria-labelledby="doctor-feature-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="doctor-feature-chapter__grid">
            <div>
              <span className="doctor-feature-chapter__eyebrow">
                {doctorChapter.eyebrow}
              </span>
              <h2
                id="doctor-feature-heading"
                className="doctor-feature-chapter__name"
              >
                {doctorChapter.name}
              </h2>
              <p className="doctor-feature-chapter__summary">
                {doctorChapter.summary}
              </p>
              <Link
                href={doctorChapter.aboutLinkHref}
                className="doctor-feature-chapter__cta"
              >
                <span>{doctorChapter.aboutLinkLabel}</span>
                <span aria-hidden="true">←</span>
              </Link>
            </div>

            <aside
              className="doctor-feature-card"
              aria-label={doctorChapter.credentialsCard.heading}
            >
              <div className="doctor-feature-card__header">
                <h3 className="doctor-feature-card__heading">
                  {doctorChapter.credentialsCard.heading}
                </h3>
                <Logo tone="white" size="compact" decorative />
              </div>

              <dl className="doctor-feature-card__list">
                {doctorChapter.credentialsCard.rows.map((row) => {
                  const safeHref = row.href
                    ? validateExternalHttpsUrl(row.href)
                    : null;
                  return (
                    <div key={row.label} className="doctor-feature-card__row">
                      <dt className="doctor-feature-card__label">
                        {row.label}
                      </dt>
                      <dd className="doctor-feature-card__value">
                        {safeHref ? (
                          <a
                            href={safeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doctor-feature-card__link"
                          >
                            {row.value} ↗
                          </a>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </aside>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
