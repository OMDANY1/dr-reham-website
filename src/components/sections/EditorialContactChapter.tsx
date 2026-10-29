import React from "react";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function EditorialContactChapter() {
  const { contactChapter } = homeContent;
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);

  return (
    <section
      id={contactChapter.id}
      className="contact-chapter"
      aria-labelledby="contact-chapter-heading"
    >
      <Container>
        <ScrollReveal>
          <div className="contact-chapter__box">
            <div>
              <span className="contact-chapter__eyebrow">
                {contactChapter.eyebrow}
              </span>
              <h2
                id="contact-chapter-heading"
                className="contact-chapter__title"
              >
                {contactChapter.title}
              </h2>
              <p className="contact-chapter__lead">{contactChapter.lead}</p>
            </div>

            <div className="contact-chapter__actions">
              {instagramHref ? (
                <Button href={instagramHref} variant="primary" external>
                  {contactChapter.primaryCta} ↗
                </Button>
              ) : null}
              <Button href={contactChapter.secondaryHref} variant="secondary">
                {contactChapter.secondaryCta}
              </Button>
            </div>
          </div>

          <p className="contact-chapter__note">{contactChapter.channelNote}</p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
