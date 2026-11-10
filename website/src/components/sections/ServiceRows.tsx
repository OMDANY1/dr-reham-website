import React from "react";
import Link from "next/link";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { servicesPageCopy } from "@/content/ar/services";
import { homeContentEn, servicesPageCopyEn } from "@/content/en";
import { isLiveBookingReady, type ServiceRecord } from "@/lib/content-gates";
import {
  buildWhatsAppBookingUrl,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export interface ServiceRowsProps {
  services: ServiceRecord[];
  context: "home" | "index";
  locale?: SupportedLocale;
}

export function ServiceRows({
  services,
  context,
  locale = "ar",
}: ServiceRowsProps) {
  const displayedServices =
    context === "home" ? services.slice(0, 4) : services;

  if (context === "home" && displayedServices.length === 0) {
    return null;
  }

  const isEn = locale === "en";
  const pageCopy = isEn ? servicesPageCopyEn : servicesPageCopy;
  const homeSec = isEn
    ? homeContentEn.specialtySection
    : homeContent.servicesSection;

  const liveReady = isLiveBookingReady(siteConfig);
  const whatsappHref =
    buildWhatsAppBookingUrl(siteConfig.whatsappE164) ?? siteConfig.whatsappUrl;
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const inquiryHref = liveReady
    ? `/${locale}/book`
    : whatsappHref ?? instagramHref ?? `/${locale}/book`;
  const isExternal = inquiryHref.startsWith("https://");

  return (
    <section
      className="section"
      aria-labelledby={
        context === "home" ? "home-services-heading" : "services-list-heading"
      }
    >
      <Container>
        <div className="editorial-split">
          <div className="editorial-split__lead">
            <span className="eyebrow">{homeSec.eyebrow}</span>
            <h2
              id={
                context === "home"
                  ? "home-services-heading"
                  : "services-list-heading"
              }
              className="section-title"
            >
              {homeSec.title}
            </h2>
            <p className="section-lead">
              {"intro" in homeSec ? homeSec.intro : homeSec.lead}
            </p>
          </div>

          <div className="editorial-split__content">
            {displayedServices.length > 0 ? (
              <div>
                {displayedServices.map((service, index) => {
                  const numberLabel = String(index + 1).padStart(2, "0");
                  return (
                    <Link
                      key={service.slug}
                      href={`/${locale}/services/${service.slug}`}
                      className="service-link-row"
                    >
                      <span className="numbered-row__index" aria-hidden="true">
                        {numberLabel}
                      </span>
                      <div>
                        <h3 className="numbered-row__title">{service.title}</h3>
                        <p className="numbered-row__desc">{service.summary}</p>
                      </div>
                      <span className="service-link-row__action">
                        {isEn ? "Service Details →" : "تفاصيل الخدمة ←"}
                      </span>
                    </Link>
                  );
                })}

                {context === "home" ? (
                  <div style={{ marginBlockStart: "var(--space-5)" }}>
                    <Button href={`/${locale}/services`} variant="secondary">
                      {isEn
                        ? "Explore Subspecialty Areas"
                        : homeContent.servicesSection.viewAllLabel}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="inquiry-channel-card">
                <h3 className="empty-state__title">
                  {pageCopy.directVisitState.title}
                </h3>
                <p className="empty-state__message">
                  {pageCopy.directVisitState.message}
                </p>
                <div className="empty-state__actions">
                  <Button
                    href={inquiryHref}
                    variant="primary"
                    external={isExternal}
                  >
                    {pageCopy.directVisitState.primaryCta}
                  </Button>
                  <Button href={`/${locale}/about`} variant="secondary">
                    {pageCopy.directVisitState.secondaryCta}
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
