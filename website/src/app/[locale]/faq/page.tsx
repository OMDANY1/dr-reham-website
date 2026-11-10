import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { faqPageCopy } from "@/content/ar/faq";
import { faqPageCopyEn } from "@/content/en";
import {
  isLiveBookingReady,
  isSupportedLocale,
  type FaqCategory,
} from "@/lib/content-gates";
import {
  buildWhatsAppBookingUrl,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { buildRouteMetadata } from "@/lib/metadata";
import { getPublicOrPreviewFaqs } from "@/lib/cms/public-data";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BookingPanel } from "@/components/sections/BookingPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: SupportedLocale = locale === "en" ? "en" : "ar";
  const copy = activeLocale === "en" ? faqPageCopyEn : faqPageCopy;
  return buildRouteMetadata({
    title: copy.meta.title,
    description: copy.meta.description,
    pathname: `/${activeLocale}/faq`,
    locale: activeLocale,
  });
}

const CATEGORY_ORDER: FaqCategory[] = [
  "appointments",
  "consultation",
  "procedure",
];

export default async function FaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const isEn = locale === "en";
  const copy = isEn ? faqPageCopyEn : faqPageCopy;

  const sp = await searchParams;
  const publicFaqs = await getPublicOrPreviewFaqs(sp?.preview === "1", locale);
  const liveReady = isLiveBookingReady(siteConfig);
  const whatsappHref =
    buildWhatsAppBookingUrl(siteConfig.whatsappE164) ?? siteConfig.whatsappUrl;
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const inquiryHref = liveReady
    ? `/${locale}/book`
    : whatsappHref ?? instagramHref ?? `/${locale}/book`;
  const isExternal = inquiryHref.startsWith("https://");

  const groupedFaqs = CATEGORY_ORDER.map((category) => ({
    category,
    title: copy.categoryTitles[category],
    items: publicFaqs.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

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

      <section
        className="section section--borderless"
        aria-labelledby="faq-main-heading"
      >
        <Container>
          <h2 id="faq-main-heading" className="sr-only">
            {isEn ? "Frequently Asked Questions" : "الأسئلة الشائعة"}
          </h2>

          {groupedFaqs.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-8)",
              }}
            >
              {groupedFaqs.map((group) => (
                <ScrollReveal key={group.category}>
                  <div className="editorial-split">
                    <div className="editorial-split__lead">
                      <h3 className="section-title">{group.title}</h3>
                    </div>
                    <div className="editorial-split__content">
                      <Accordion
                        items={group.items.map((item, idx) => ({
                          id: item.id,
                          question: item.question,
                          answer: item.answer ?? "",
                          defaultOpen: idx === 0,
                        }))}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="inquiry-channel-card">
              <h3 className="empty-state__title">
                {copy.directVisitState.title}
              </h3>
              <p className="empty-state__message">
                {copy.directVisitState.message}
              </p>
              <div className="empty-state__actions">
                <Button
                  href={inquiryHref}
                  variant="primary"
                  external={isExternal}
                >
                  {copy.directVisitState.primaryCta}
                </Button>
                <Button href={`/${locale}/journal`} variant="secondary">
                  {copy.directVisitState.secondaryCta}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <BookingPanel mode="cta-banner" locale={locale} />
    </>
  );
}
