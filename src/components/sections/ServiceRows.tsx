import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { servicesPageCopy } from "@/content/ar/services";
import { isLiveBookingReady, type ServiceRecord } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export interface ServiceRowsProps {
  services: ServiceRecord[];
  context: "home" | "index";
}

export function ServiceRows({ services, context }: ServiceRowsProps) {
  const displayedServices =
    context === "home" ? services.slice(0, 4) : services;

  if (context === "home" && displayedServices.length === 0) {
    return null;
  }

  const liveReady = isLiveBookingReady(siteConfig);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const inquiryHref = liveReady ? "/ar/book" : instagramHref ?? "/ar/book";

  return (
    <section
      className="section"
      aria-labelledby={
        context === "home" ? "home-services-heading" : "services-list-heading"
      }
    >
      <Container>
        <div className="editorial-split">
          <div>
            <span className="eyebrow">{servicesPageCopy.eyebrow}</span>
            <h2
              id={
                context === "home"
                  ? "home-services-heading"
                  : "services-list-heading"
              }
              className="section-title"
            >
              {servicesPageCopy.headline}
            </h2>
            <p className="section-lead">{servicesPageCopy.intro}</p>
          </div>

          <div>
            {displayedServices.length > 0 ? (
              <div>
                {displayedServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/ar/services/${service.slug}`}
                    className="specialty-topic-row"
                  >
                    <div>
                      <h3 className="specialty-topic-row__title">
                        {service.title}
                      </h3>
                      <p className="specialty-topic-row__desc">
                        {service.summary}
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
              </div>
            ) : (
              <div className="inquiry-channel-card">
                <h3 className="empty-state__title">
                  {servicesPageCopy.directVisitState.title}
                </h3>
                <p className="empty-state__message">
                  {servicesPageCopy.directVisitState.message}
                </p>
                <div className="empty-state__actions">
                  <Button
                    href={inquiryHref}
                    variant="primary"
                    external={!liveReady && Boolean(instagramHref)}
                  >
                    {servicesPageCopy.directVisitState.primaryCta}{" "}
                    {!liveReady && instagramHref ? "↗" : ""}
                  </Button>
                  <Button href="/ar/about" variant="secondary">
                    {servicesPageCopy.directVisitState.secondaryCta}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
