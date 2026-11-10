import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SupportedLocale } from "@/config/site";
import { servicesPageCopy, servicesRecords } from "@/content/ar/services";
import { servicesPageCopyEn } from "@/content/en";
import { getPublicServices, isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { ServiceRows } from "@/components/sections/ServiceRows";
import { BookingPanel } from "@/components/sections/BookingPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: SupportedLocale = locale === "en" ? "en" : "ar";
  const copy = activeLocale === "en" ? servicesPageCopyEn : servicesPageCopy;
  return buildRouteMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    pathname: `/${activeLocale}/services`,
    locale: activeLocale,
  });
}

export default async function ServicesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const copy = locale === "en" ? servicesPageCopyEn : servicesPageCopy;
  const publicServices = getPublicServices(servicesRecords);

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
            {copy.headline}
          </h1>
          <p className="section-lead">{copy.intro}</p>
        </Container>
      </header>

      <ServiceRows
        services={publicServices}
        context="index"
        locale={locale}
      />

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
