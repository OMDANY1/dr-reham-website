import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { aboutContent } from "@/content/ar/about";
import { homeContent } from "@/content/ar/home";
import { getVerifiedBookableClinics } from "@/lib/booking-links";
import { isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = buildRouteMetadata({
  title: aboutContent.meta.title,
  description: aboutContent.meta.description,
  pathname: "/ar/about",
});

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const verifiedCredentials = siteConfig.profile.credentials.filter(
    (c) => c.verified
  );
  const verifiedClinics = getVerifiedBookableClinics(siteConfig.clinics);

  return (
    <>
      <header className="page-header">
        <Container>
          <div className="editorial-split" style={{ alignItems: "center" }}>
            <div className="editorial-split__lead">
              <span className="eyebrow">{aboutContent.header.eyebrow}</span>
              <h1
                style={{
                  fontSize: "var(--text-h1)",
                  marginBlockEnd: "var(--space-2)",
                }}
              >
                {aboutContent.header.name}
              </h1>
              <p
                style={{
                  fontSize: "var(--text-body-lg)",
                  color: "var(--sky-700)",
                  fontWeight: 700,
                  marginBlockEnd: "var(--space-3)",
                }}
              >
                {aboutContent.header.specialty} — {aboutContent.header.city}
              </p>
              <p className="section-lead">{aboutContent.header.lead}</p>
            </div>

            <div className="editorial-split__content">
              <div
                className="editorial-photo-wrap"
                style={{
                  borderRadius: "var(--control-radius)",
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  border: "1px solid var(--sky-200)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={homeContent.specialtySection.image.src}
                  alt={homeContent.specialtySection.image.alt}
                  width={1200}
                  height={675}
                  className="specialty-photo-img editorial-photo-zoom"
                />
              </div>
            </div>
          </div>
        </Container>
      </header>

      <section
        className="section section--borderless"
        aria-labelledby="about-intro-heading"
      >
        <Container>
          <ScrollReveal>
            <div className="editorial-split">
              <aside
                className="editorial-split__lead"
                aria-label="البيانات الأساسية الموثقة"
              >
                <div className="factual-spine">
                  <h2
                    style={{
                      fontSize: "var(--text-small)",
                      color: "var(--sky-700)",
                      marginBlockEnd: "var(--space-3)",
                    }}
                  >
                    بطاقة التعريف المهنية
                  </h2>
                  <dl className="factual-spine__list">
                    {aboutContent.factualSpine.map((item) => (
                      <div key={item.label} className="factual-spine__row">
                        <dt className="factual-spine__term">{item.label}</dt>
                        <dd className="factual-spine__value">
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-link ${
                                item.isLtr ? "ltr-inline" : ""
                              }`.trim()}
                            >
                              {item.value}
                            </a>
                          ) : (
                            item.value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>

              <div className="editorial-split__content">
                <h2 id="about-intro-heading" className="section-title">
                  {aboutContent.introduction.heading}
                </h2>
                {aboutContent.introduction.paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      maxInlineSize: "var(--reading-measure)",
                      marginBlockEnd: "var(--space-4)",
                      fontSize: "var(--text-body-lg)",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}

                {verifiedCredentials.length > 0 ? (
                  <div style={{ marginBlockStart: "var(--space-7)" }}>
                    <h2 className="section-title">المؤهلات العلمية والتدريب</h2>
                    <ul className="numbered-rows">
                      {verifiedCredentials.map((cred, idx) => (
                        <li key={cred.id} className="numbered-row">
                          <span className="numbered-row__index">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3 className="numbered-row__title">
                              {cred.title}
                            </h3>
                            <p className="numbered-row__desc">
                              {cred.institution}
                              {cred.year ? ` — ${cred.year}` : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div style={{ marginBlockStart: "var(--space-7)" }}>
                  <h2 className="section-title">
                    {aboutContent.approach.heading}
                  </h2>
                  <ol className="numbered-rows">
                    {aboutContent.approach.items.map((item) => (
                      <li key={item.title} className="numbered-row">
                        <span
                          className="numbered-row__index"
                          aria-hidden="true"
                        >
                          {item.number}
                        </span>
                        <div>
                          <h3 className="numbered-row__title">{item.title}</h3>
                          <p className="numbered-row__desc">{item.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {verifiedClinics.length > 0 ? (
                  <div style={{ marginBlockStart: "var(--space-7)" }}>
                    <h2 className="section-title">جهات الممارسة المعتمدة</h2>
                    <ul className="numbered-rows">
                      {verifiedClinics.map((clinic, idx) => (
                        <li key={clinic.id} className="numbered-row">
                          <span className="numbered-row__index">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3 className="numbered-row__title">
                              {clinic.name}
                            </h3>
                            {clinic.address ? (
                              <p className="numbered-row__desc">
                                {clinic.address}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <BookingPanel mode="cta-banner" />
    </>
  );
}
