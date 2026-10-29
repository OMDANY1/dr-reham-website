import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeContent } from "@/content/ar/home";
import { notFoundCopy } from "@/content/ar/not-found";
import { servicesPageCopy, servicesRecords } from "@/content/ar/services";
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

  const service = getPublicServiceBySlug(servicesRecords, slug);
  if (!service) {
    return buildRouteMetadata({
      title: notFoundCopy.meta.title,
      description: notFoundCopy.meta.description,
      pathname: "/ar/services",
      forceNoIndex: true,
    });
  }

  return buildRouteMetadata({
    title: `${service.title} | د. ريهام القحطاني`,
    description: service.summary,
    pathname: `/ar/services/${service.slug}`,
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

  const relatedServices = getPublicServices(servicesRecords).filter(
    (s) => s.slug !== service.slug
  );

  return (
    <>
      <header className="page-header">
        <Container>
          <nav aria-label="مسار الصفحة">
            <ol className="breadcrumb">
              <li>
                <Link href="/ar">{homeContent.navigation.home}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/ar/services">
                  {servicesPageCopy.detailLabels.breadcrumbServices}
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
              {servicesPageCopy.detailLabels.reviewedByPrefix}{" "}
              <strong>{service.approvedBy}</strong> —{" "}
              {servicesPageCopy.detailLabels.reviewedAtPrefix}{" "}
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
                  {servicesPageCopy.detailLabels.overviewHeading}
                </h2>
                <p>{service.overview}</p>
              </section>
            ) : null}

            {service.consultationNotes ? (
              <section>
                <h2 className="section-title">
                  {servicesPageCopy.detailLabels.consultationHeading}
                </h2>
                <p>{service.consultationNotes}</p>
              </section>
            ) : null}

            {service.preparation ? (
              <section>
                <h2 className="section-title">
                  {servicesPageCopy.detailLabels.preparationHeading}
                </h2>
                <p>{service.preparation}</p>
              </section>
            ) : null}

            {service.recovery ? (
              <section>
                <h2 className="section-title">
                  {servicesPageCopy.detailLabels.recoveryHeading}
                </h2>
                <p>{service.recovery}</p>
              </section>
            ) : null}

            {service.risks ? (
              <section>
                <h2 className="section-title">
                  {servicesPageCopy.detailLabels.risksHeading}
                </h2>
                <p>{service.risks}</p>
              </section>
            ) : null}

            {service.faq.length > 0 ? (
              <section>
                <h2 className="section-title">
                  {servicesPageCopy.detailLabels.faqHeading}
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
                  {servicesPageCopy.detailLabels.relatedHeading}
                </h2>
                <div>
                  {relatedServices.map((rel, idx) => (
                    <Link
                      key={rel.slug}
                      href={`/ar/services/${rel.slug}`}
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
                        عرض الخدمة ←
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </Container>
      </article>

      <BookingPanel mode="cta-banner" />
    </>
  );
}
