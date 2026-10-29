import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesPageCopy, servicesRecords } from "@/content/ar/services";
import { getPublicServices, isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { ServiceRows } from "@/components/sections/ServiceRows";
import { BookingPanel } from "@/components/sections/BookingPanel";

export const metadata: Metadata = buildRouteMetadata({
  title: servicesPageCopy.meta.title,
  description: servicesPageCopy.meta.description,
  pathname: "/ar/services",
});

export default async function ServicesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const publicServices = getPublicServices(servicesRecords);

  return (
    <>
      <header className="page-header">
        <Container>
          <span className="eyebrow">{servicesPageCopy.eyebrow}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {servicesPageCopy.headline}
          </h1>
          <p className="section-lead">{servicesPageCopy.intro}</p>
        </Container>
      </header>

      <ServiceRows services={publicServices} context="index" />

      <BookingPanel mode="cta-banner" />
    </>
  );
}
