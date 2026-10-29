import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { qaVerifiedClinicsFixture, siteConfig } from "@/config/site";
import { bookPageCopy } from "@/content/ar/book";
import { isLiveBookingReady, isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { BookingPanel } from "@/components/sections/BookingPanel";

export async function generateMetadata(): Promise<Metadata> {
  const liveReady = isLiveBookingReady(siteConfig);
  return buildRouteMetadata({
    title: liveReady
      ? bookPageCopy.meta.liveTitle
      : bookPageCopy.meta.previewTitle,
    description: bookPageCopy.meta.description,
    pathname: "/ar/book",
  });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ clinic?: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const clinicQueryParam =
    typeof resolvedSearchParams.clinic === "string"
      ? resolvedSearchParams.clinic
      : null;

  const reqHeaders = await headers();
  const qaFixtureMode =
    siteConfig.mode === "preview"
      ? reqHeaders.get("x-qa-booking-fixture")
      : null;

  const activeClinics =
    qaFixtureMode === "verified-multi"
      ? qaVerifiedClinicsFixture
      : qaFixtureMode === "verified-single"
      ? [qaVerifiedClinicsFixture[0]]
      : siteConfig.clinics;

  const liveReady = isLiveBookingReady(
    siteConfig,
    qaFixtureMode ? activeClinics : undefined
  );

  return (
    <>
      <header className="page-header">
        <Container>
          <span className="eyebrow">{bookPageCopy.eyebrow}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {liveReady
              ? bookPageCopy.liveHeading
              : bookPageCopy.previewHeading}
          </h1>
          <p className="section-lead">
            {liveReady
              ? bookPageCopy.introLive
              : bookPageCopy.introPreview}
          </p>
        </Container>
      </header>

      <BookingPanel
        mode="full-selector"
        clinics={activeClinics}
        initialClinicParam={clinicQueryParam}
      />

      <section
        className="section section--borderless"
        aria-labelledby="consultation-guidance-heading"
      >
        <Container>
          <div className="editorial-split">
            <div className="editorial-split__lead">
              <span className="eyebrow">الزيارة الطبية</span>
              <h2 id="consultation-guidance-heading" className="section-title">
                {bookPageCopy.consultationGuidance.heading}
              </h2>
            </div>

            <div className="editorial-split__content">
              <ol className="numbered-rows">
                {bookPageCopy.consultationGuidance.items.map((item) => (
                  <li key={item.title} className="numbered-row">
                    <span className="numbered-row__index" aria-hidden="true">
                      {item.number}
                    </span>
                    <div>
                      <h3 className="numbered-row__title">{item.title}</h3>
                      <p className="numbered-row__desc">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      <BookingPanel mode="cta-banner" />
    </>
  );
}
