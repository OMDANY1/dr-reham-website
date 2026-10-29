import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { privacyPageCopy } from "@/content/ar/privacy";
import { isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { getCmsSiteSettings } from "@/lib/cms/repository";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildRouteMetadata({
  title: privacyPageCopy.meta.title,
  description: privacyPageCopy.meta.description,
  pathname: "/ar/privacy",
  forceNoIndex: siteConfig.mode === "preview" || !siteConfig.legalEntity,
});

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const settings = getCmsSiteSettings();
  const sections =
    settings.privacySections && settings.privacySections.length > 0
      ? settings.privacySections
      : privacyPageCopy.sections;

  return (
    <>
      <header className="page-header">
        <Container>
          <span className="eyebrow">{privacyPageCopy.eyebrow}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {privacyPageCopy.headline}
          </h1>
        </Container>
      </header>

      <section className="section section--borderless">
        <Container>
          <div
            style={{
              maxInlineSize: "var(--reading-measure)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
            }}
          >
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                style={{
                  paddingBlockEnd: "var(--space-5)",
                  borderBlockEnd: "1px solid var(--border)",
                }}
              >
                <h2
                  style={{
                    fontSize: "var(--text-h3)",
                    marginBlockEnd: "var(--space-3)",
                  }}
                >
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, idx) => (
                  <p key={idx} style={{ marginBlockEnd: "var(--space-3)" }}>
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
