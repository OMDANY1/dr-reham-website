import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { qaVerifiedClinicsFixture, siteConfig } from "@/config/site";
import { bookPageCopy } from "@/content/ar/book";
import { bookPageCopyEn } from "@/content/en";
import { isLiveBookingReady, isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { getPublicClinicsFromCms } from "@/lib/cms/public-data";
import { Container } from "@/components/ui/Container";
import { BookingPanel } from "@/components/sections/BookingPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isSupportedLocale(locale) ? locale : "ar";
  const copy = validLocale === "en" ? bookPageCopyEn : bookPageCopy;
  const cmsClinics = getPublicClinicsFromCms(validLocale);
  const liveReady = isLiveBookingReady(siteConfig, cmsClinics);
  return buildRouteMetadata({
    title: liveReady ? copy.meta.liveTitle : copy.meta.previewTitle,
    description: copy.meta.description,
    pathname: `/${validLocale}/book`,
    locale: validLocale,
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

  const copy = locale === "en" ? bookPageCopyEn : bookPageCopy;

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

  const cmsClinics = getPublicClinicsFromCms(locale);
  const activeClinics =
    qaFixtureMode === "verified-multi"
      ? qaVerifiedClinicsFixture
      : qaFixtureMode === "verified-single"
      ? [qaVerifiedClinicsFixture[0]]
      : cmsClinics;

  const liveReady = isLiveBookingReady(
    siteConfig,
    qaFixtureMode
      ? activeClinics
      : cmsClinics.some((c) => c.enabled && c.affiliationVerified)
      ? cmsClinics
      : undefined
  );

  return (
    <>
      <header className="page-header">
        <Container>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {liveReady ? copy.liveHeading : copy.previewHeading}
          </h1>
          <p className="section-lead">
            {liveReady ? copy.introLive : copy.introPreview}
          </p>
        </Container>
      </header>

      <BookingPanel
        mode="full-selector"
        clinics={activeClinics}
        initialClinicParam={clinicQueryParam}
        locale={locale}
      />

      <section
        className="section section--borderless"
        aria-labelledby="consultation-guidance-heading"
      >
        <Container>
          <div className="editorial-split">
            <div className="editorial-split__lead">
              <span className="eyebrow">
                {locale === "en" ? "CONSULTATION GUIDE" : "الزيارة الطبية"}
              </span>
              <h2 id="consultation-guidance-heading" className="section-title">
                {copy.consultationGuidance.heading}
              </h2>
            </div>

            <div className="editorial-split__content">
              <ol className="numbered-rows">
                {copy.consultationGuidance.items.map((item) => (
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

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
