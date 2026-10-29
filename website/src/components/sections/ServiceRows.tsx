import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { servicesPageCopy } from "@/content/ar/services";
import { isLiveBookingReady, type ServiceRecord } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export interface ServiceRowsProps {
  services: ServiceRecord[];
  context: "home" | "index";
}

/**
 * يعرض الخدمات الفعلية المعتمدة فقط:
 * - في الصفحة الرئيسية (home): إذا لم توجد خدمات معتمدة، يُحذف القسم تمامًا بدل عرض صندوق فارغ.
 * - في صفحة الفهرس المباشرة (/ar/services): يعرض بطاقة استفسار أنيقة دون عبارات تنفيذ داخلية.
 */
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
          <div className="editorial-split__lead">
            <span className="eyebrow">
              {homeContent.servicesSection.eyebrow}
            </span>
            <h2
              id={
                context === "home"
                  ? "home-services-heading"
                  : "services-list-heading"
              }
              className="section-title"
            >
              {homeContent.servicesSection.title}
            </h2>
            <p className="section-lead">
              {homeContent.servicesSection.intro}
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
                      href={`/ar/services/${service.slug}`}
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
                        تفاصيل الخدمة ←
                      </span>
                    </Link>
                  );
                })}

                {context === "home" ? (
                  <div style={{ marginBlockStart: "var(--space-5)" }}>
                    <Button href="/ar/services" variant="secondary">
                      {homeContent.servicesSection.viewAllLabel}
                    </Button>
                  </div>
                ) : null}
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
                    {servicesPageCopy.directVisitState.primaryCta}
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
