import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { privacyPageCopy } from "@/content/ar/privacy";
import { privacyPageCopyEn } from "@/content/en";
import { isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { getCmsSiteSettings } from "@/lib/cms/repository";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isSupportedLocale(locale) ? locale : "ar";
  const copy = validLocale === "en" ? privacyPageCopyEn : privacyPageCopy;
  return buildRouteMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    pathname: `/${validLocale}/privacy`,
    locale: validLocale,
    forceNoIndex: siteConfig.mode === "preview" || !siteConfig.legalEntity,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const isEn = locale === "en";
  const copy = isEn ? privacyPageCopyEn : privacyPageCopy;
  const settings = getCmsSiteSettings();
  const sections = isEn
    ? copy.sections
    : settings.privacySections && settings.privacySections.length > 0
    ? settings.privacySections
    : copy.sections;

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
