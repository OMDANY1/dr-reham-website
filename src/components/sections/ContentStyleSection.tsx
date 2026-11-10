/* eslint-disable @next/next/no-img-element */
import React from "react";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface ContentStyleSectionProps {
  data?: HomePageCmsData["contentStyleSection"];
  instagramUrlOverride?: string;
  locale?: SupportedLocale;
}

export function ContentStyleSection({
  data,
  instagramUrlOverride,
  locale = "ar",
}: ContentStyleSectionProps = {}) {
  const isEn = locale === "en";
  const baseSection = isEn
    ? homeContentEn.contentStyleSection
    : homeContent.contentStyleSection;

  const eyebrow = isEn
    ? baseSection.eyebrow
    : data?.eyebrow || baseSection.eyebrow;
  const title = isEn ? baseSection.title : data?.title || baseSection.title;
  const lead = isEn ? baseSection.lead : data?.lead || baseSection.lead;
  const pillars = isEn
    ? baseSection.pillars
    : data?.pillars?.length
    ? data.pillars
    : baseSection.pillars;

  const cardBadge = isEn
    ? baseSection.instagramCard.badge
    : data?.instagramCard?.badge || baseSection.instagramCard.badge;
  const cardHandle =
    data?.instagramCard?.handle || baseSection.instagramCard.handle;
  const cardTitle = isEn
    ? baseSection.instagramCard.title
    : data?.instagramCard?.title || baseSection.instagramCard.title;
  const cardDesc = isEn
    ? baseSection.instagramCard.description
    : data?.instagramCard?.description || baseSection.instagramCard.description;
  const cardCta = isEn
    ? baseSection.instagramCard.ctaLabel
    : data?.instagramCard?.ctaLabel || baseSection.instagramCard.ctaLabel;
  const cardImageSrc =
    data?.instagramCard?.image?.src || baseSection.instagramCard.image.src;
  const cardImageAlt = isEn
    ? baseSection.instagramCard.image.alt
    : data?.instagramCard?.image?.alt || baseSection.instagramCard.image.alt;

  const instagramHref = validateExternalHttpsUrl(
    instagramUrlOverride ?? siteConfig.instagramUrl
  );

  return (
    <section
      id={data?.id ?? baseSection.id}
      className="content-style-section"
      aria-labelledby="content-style-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="content-style-grid">
            <div className="content-style-narrative">
              <span className="eyebrow">{eyebrow}</span>
              <h2
                id="content-style-heading"
                className="content-style-narrative__title"
              >
                {title}
              </h2>
              <p className="content-style-narrative__lead">{lead}</p>

              <div className="content-style-pillars">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="content-style-pillar">
                    <h3 className="content-style-pillar__title">
                      {pillar.title}
                    </h3>
                    <p className="content-style-pillar__text">{pillar.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-style-invitation">
              <div className="content-style-card">
                <div className="content-style-card__media editorial-photo-wrap">
                  <img
                    src={cardImageSrc}
                    alt={cardImageAlt}
                    className="content-style-card__img editorial-photo-zoom"
                    width={640}
                    height={380}
                  />
                </div>

                <div className="content-style-card__body">
                  <div className="content-style-card__top">
                    <span className="inquiry-channel-card__badge">
                      {cardBadge}
                    </span>
                    <span className="content-style-card__handle ltr-inline">
                      {cardHandle}
                    </span>
                  </div>

                  <h3 className="content-style-card__title">{cardTitle}</h3>
                  <p className="content-style-card__desc">{cardDesc}</p>

                  {instagramHref ? (
                    <div className="content-style-card__actions">
                      <Button href={instagramHref} variant="primary" external>
                        <span>{cardCta}</span>
                        <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
