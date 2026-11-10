import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { aboutContent } from "@/content/ar/about";
import { homeContent } from "@/content/ar/home";
import { aboutContentEn, homeContentEn } from "@/content/en";
import { getVerifiedBookableClinics } from "@/lib/booking-links";
import { isSupportedLocale } from "@/lib/content-gates";
import { buildRouteMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: SupportedLocale = locale === "en" ? "en" : "ar";
  const copy = activeLocale === "en" ? aboutContentEn : aboutContent;
  return buildRouteMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    pathname: `/${activeLocale}/about`,
    locale: activeLocale,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const isEn = locale === "en";
  const copy = isEn ? aboutContentEn : aboutContent;

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
              <span className="eyebrow">{copy.header.eyebrow}</span>
              <h1
                style={{
                  fontSize: "var(--text-h1)",
                  marginBlockEnd: "var(--space-2)",
                }}
              >
                {copy.header.name}
              </h1>
              <p
                style={{
                  fontSize: "var(--text-body-lg)",
                  color: "var(--color-plum)",
                  fontWeight: 700,
                  marginBlockEnd: "var(--space-3)",
                }}
              >
                {copy.header.specialty} — {copy.header.city}
              </p>
              <p className="section-lead">{copy.header.lead}</p>
            </div>

            <div className="editorial-split__content">
              <div
                className="editorial-photo-wrap"
                style={{
                  borderRadius: "var(--control-radius)",
                  overflow: "hidden",
                  aspectRatio: "4 / 3.55",
                  border: "1.5px solid var(--color-border)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={homeContent.doctorIntro.sculptureImage.src}
                  alt={
                    isEn
                      ? homeContentEn.doctorIntro.sculptureImage.alt
                      : homeContent.doctorIntro.sculptureImage.alt
                  }
                  width={680}
                  height={615}
                  style={{ objectPosition: "50% 42%" }}
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
                aria-label={
                  isEn
                    ? "Verified Professional Details"
                    : "البيانات الأساسية الموثقة"
                }
              >
                <div className="factual-spine">
                  <h2
                    style={{
                      fontSize: "var(--text-small)",
                      color: "var(--color-plum-dark)",
                      marginBlockEnd: "var(--space-3)",
                    }}
                  >
                    {isEn
                      ? "Professional Profile"
                      : "بطاقة التعريف المهنية"}
                  </h2>
                  <dl className="factual-spine__list">
                    {copy.factualSpine.map((item) => (
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
                  {copy.introduction.heading}
                </h2>
                {copy.introduction.paragraphs.map((paragraph, idx) => (
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
                    <h2 className="section-title">
                      {isEn
                        ? "Academic Credentials & Training"
                        : "المؤهلات العلمية والتدريب"}
                    </h2>
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
                  <h2 className="section-title">{copy.approach.heading}</h2>
                  <ol className="numbered-rows">
                    {copy.approach.items.map((item) => (
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
                    <h2 className="section-title">
                      {isEn
                        ? "Verified Practice Locations"
                        : "جهات الممارسة المعتمدة"}
                    </h2>
                    <ul className="numbered-rows">
                      {verifiedClinics.map((clinic, idx) => (
                        <li key={clinic.id} className="numbered-row">
                          <span className="numbered-row__index">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3 className="numbered-row__title">
                              {isEn && clinic.nameEn
                                ? clinic.nameEn
                                : clinic.name}
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

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
