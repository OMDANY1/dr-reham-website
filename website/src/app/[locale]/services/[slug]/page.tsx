import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeContent } from "@/content/ar/home";
import { notFoundCopy } from "@/content/ar/not-found";
import { servicesPageCopy, servicesRecords } from "@/content/ar/services";
import {
  homeContentEn,
  notFoundCopyEn,
  servicesPageCopyEn,
} from "@/content/en";
import {
  getPublicServiceBySlug,
  getPublicServices,
  isSupportedLocale,
} from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { BookingPanel } from "@/components/sections/BookingPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    return buildRouteMetadata({
      title: notFoundCopy.meta.title,
      description: notFoundCopy.meta.description,
      pathname: "/ar",
      forceNoIndex: true,
    });
  }

  const nfCopy = locale === "en" ? notFoundCopyEn : notFoundCopy;
  const service = getPublicServiceBySlug(servicesRecords, slug);
  if (!service) {
    return buildRouteMetadata({
      title: nfCopy.meta.title,
      description: nfCopy.meta.description,
      pathname: `/${locale}/services`,
      locale,
      forceNoIndex: true,
    });
  }

  return buildRouteMetadata({
    title: `${service.title} | ${
      locale === "en" ? "Dr. Reham Alqahtani" : "د. ريهام القحطاني"
    }`,
    description: service.summary,
    pathname: `/${locale}/services/${service.slug}`,
    locale,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const service = getPublicServiceBySlug(servicesRecords, slug);
  if (!service) {
    notFound();
  }

  const isEn = locale === "en";
  const copy = isEn ? servicesPageCopyEn : servicesPageCopy;
  const home = isEn ? homeContentEn : homeContent;

  const relatedServices = getPublicServices(servicesRecords).filter(
    (s) => s.slug !== service.slug
  );

  return (
    <>
      <header className="page-header">
        <Container>
          <nav aria-label={isEn ? "Breadcrumb" : "مسار الصفحة"}>
            <ol className="breadcrumb">
              <li>
                <Link href={`/${locale}`}>{home.navigation.home}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/${locale}/services`}>
                  {copy.detailLabels.breadcrumbServices}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{service.title}</li>
            </ol>
          </nav>

          <span className="eyebrow">{service.category}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {service.title}
          </h1>
          <p className="section-lead">{service.summary}</p>

          {service.approvedBy && service.reviewedAt ? (
            <p
              style={{
                marginBlockStart: "var(--space-4)",
                fontSize: "var(--text-caption)",
                color: "var(--color-secondary)",
              }}
            >
              {copy.detailLabels.reviewedByPrefix}{" "}
              <strong>{service.approvedBy}</strong> —{" "}
              {copy.detailLabels.reviewedAtPrefix}{" "}
              <span>{service.reviewedAt}</span>
            </p>
          ) : null}
        </Container>
      </header>

      <article className="section">
        <Container>
          <div
            style={{
              maxInlineSize: "var(--reading-measure)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-7)",
            }}
          >
            {service.overview ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.overviewHeading}
                </h2>
                <p>{service.overview}</p>
              </section>
            ) : null}

            {service.consultationNotes ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.consultationHeading}
                </h2>
                <p>{service.consultationNotes}</p>
              </section>
            ) : null}

            {service.preparation ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.preparationHeading}
                </h2>
                <p>{service.preparation}</p>
              </section>
            ) : null}

            {service.recovery ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.recoveryHeading}
                </h2>
                <p>{service.recovery}</p>
              </section>
            ) : null}

            {service.risks ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.risksHeading}
                </h2>
                <p>{service.risks}</p>
              </section>
            ) : null}

            {service.faq.length > 0 ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.faqHeading}
                </h2>
                <Accordion
                  items={service.faq.map((f, idx) => ({
                    id: `${service.slug}-faq-${idx}`,
                    question: f.question,
                    answer: f.answer,
                  }))}
                />
              </section>
            ) : null}

            {relatedServices.length > 0 ? (
              <section>
                <h2 className="section-title">
                  {copy.detailLabels.relatedHeading}
                </h2>
                <div>
                  {relatedServices.map((rel, idx) => (
                    <Link
                      key={rel.slug}
                      href={`/${locale}/services/${rel.slug}`}
                      className="service-link-row"
                    >
                      <span className="numbered-row__index">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="numbered-row__title">{rel.title}</h3>
                        <p className="numbered-row__desc">{rel.summary}</p>
                      </div>
                      <span className="service-link-row__action">
                        {isEn ? "View Service →" : "عرض الخدمة ←"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </Container>
      </article>

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
