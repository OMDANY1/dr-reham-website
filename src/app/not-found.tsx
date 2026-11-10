import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFoundCopy } from "@/content/ar/not-found";
import { notFoundCopyEn } from "@/content/en";
import { siteConfig } from "@/config/site";
import { getBookingCtaLabel } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = buildRouteMetadata({
  title: notFoundCopy.meta.title,
  description: notFoundCopy.meta.description,
  pathname: "/ar",
  forceNoIndex: true,
});

export default async function NotFound() {
  const reqHeaders = await headers();
  const locale = reqHeaders.get("x-site-locale") === "en" ? "en" : "ar";
  const copy = locale === "en" ? notFoundCopyEn : notFoundCopy;
  const bookingLabel = getBookingCtaLabel(siteConfig, undefined, locale);

  return (
    <section
      className="section section--borderless"
      aria-labelledby="not-found-heading"
    >
      <Container>
        <div
          style={{
            maxInlineSize: "42rem",
            paddingBlock: "var(--space-7)",
          }}
        >
          <span className="eyebrow">{copy.code}</span>
          <h1
            id="not-found-heading"
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-4)",
            }}
          >
            {copy.headline}
          </h1>
          <p
            style={{
              color: "var(--color-paragraph)",
              fontSize: "var(--text-body-lg)",
              marginBlockEnd: "var(--space-6)",
            }}
          >
            {copy.description}
          </p>

          <div className="hero-editorial__cta-row">
            <Button href={`/${locale}`} variant="primary">
              {copy.homeCta}
            </Button>
            <Button href={`/${locale}/book`} variant="secondary">
              {bookingLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
