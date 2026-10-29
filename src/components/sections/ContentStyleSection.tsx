/* eslint-disable @next/next/no-img-element */
import React from "react";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface ContentStyleSectionProps {
  data?: HomePageCmsData["contentStyleSection"];
  instagramUrlOverride?: string;
}

export function ContentStyleSection({
  data,
  instagramUrlOverride,
}: ContentStyleSectionProps = {}) {
  const contentStyleSection = data ?? homeContent.contentStyleSection;
  const instagramHref = validateExternalHttpsUrl(
    instagramUrlOverride ?? siteConfig.instagramUrl
  );

  return (
    <section
      id={contentStyleSection.id}
      className="content-style-section"
      aria-labelledby="content-style-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="content-style-grid">
            <div className="content-style-narrative">
              <span className="eyebrow">{contentStyleSection.eyebrow}</span>
              <h2
                id="content-style-heading"
                className="content-style-narrative__title"
              >
                {contentStyleSection.title}
              </h2>
              <p className="content-style-narrative__lead">
                {contentStyleSection.lead}
              </p>

              <div className="content-style-pillars">
                {contentStyleSection.pillars.map((pillar) => (
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
                    src={contentStyleSection.instagramCard.image.src}
                    alt={contentStyleSection.instagramCard.image.alt}
                    className="content-style-card__img editorial-photo-zoom"
                    width={640}
                    height={380}
                  />
                </div>

                <div className="content-style-card__body">
                  <div className="content-style-card__top">
                    <span className="inquiry-channel-card__badge">
                      {contentStyleSection.instagramCard.badge}
                    </span>
                    <span className="content-style-card__handle ltr-inline">
                      {contentStyleSection.instagramCard.handle}
                    </span>
                  </div>

                  <h3 className="content-style-card__title">
                    {contentStyleSection.instagramCard.title}
                  </h3>
                  <p className="content-style-card__desc">
                    {contentStyleSection.instagramCard.description}
                  </p>

                  {instagramHref ? (
                    <div className="content-style-card__actions">
                      <Button href={instagramHref} variant="primary" external>
                        {contentStyleSection.instagramCard.ctaLabel} ↗
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
