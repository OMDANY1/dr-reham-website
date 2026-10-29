import React from "react";
import type { Metadata } from "next";
import { notFoundCopy } from "@/content/ar/not-found";
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

export default function NotFound() {
  const bookingLabel = getBookingCtaLabel(siteConfig);

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
          <span className="eyebrow">{notFoundCopy.code}</span>
          <h1
            id="not-found-heading"
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-4)",
            }}
          >
            {notFoundCopy.headline}
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "var(--text-body-lg)",
              marginBlockEnd: "var(--space-6)",
            }}
          >
            {notFoundCopy.description}
          </p>

          <div className="empty-state__actions">
            <Button href="/ar" variant="primary">
              {notFoundCopy.homeCta}
            </Button>
            <Button href="/ar/book" variant="secondary">
              {bookingLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
