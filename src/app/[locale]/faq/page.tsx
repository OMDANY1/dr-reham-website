import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { faqPageCopy } from "@/content/ar/faq";
import {
  isLiveBookingReady,
  isSupportedLocale,
  type FaqCategory,
} from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { buildRouteMetadata } from "@/lib/metadata";
import { getPublicOrPreviewFaqs } from "@/lib/cms/public-data";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { BookingPanel } from "@/components/sections/BookingPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildRouteMetadata({
  title: faqPageCopy.meta.title,
  description: faqPageCopy.meta.description,
  pathname: "/ar/faq",
});

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

  const sp = await searchParams;
  const publicFaqs = await getPublicOrPreviewFaqs(sp?.preview === "1");
  const liveReady = isLiveBookingReady(siteConfig);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const inquiryHref = liveReady ? "/ar/book" : instagramHref ?? "/ar/book";

  const groupedFaqs = CATEGORY_ORDER.map((category) => ({
    category,
    title: faqPageCopy.categoryTitles[category],
    items: publicFaqs.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <header className="page-header">
        <Container>
          <span className="eyebrow">{faqPageCopy.eyebrow}</span>
          <h1
            style={{
              fontSize: "var(--text-h1)",
              marginBlockEnd: "var(--space-3)",
            }}
          >
            {faqPageCopy.headline}
          </h1>
          <p className="section-lead">{faqPageCopy.intro}</p>
        </Container>
      </header>

      <section
        className="section section--borderless"
        aria-labelledby="faq-main-heading"
      >
        <Container>
          <h2 id="faq-main-heading" className="sr-only">
            الأسئلة الشائعة
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
                <div key={group.category} className="editorial-split">
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
              ))}
            </div>
          ) : (
            <div className="inquiry-channel-card">
              <h3 className="empty-state__title">
                {faqPageCopy.directVisitState.title}
              </h3>
              <p className="empty-state__message">
                {faqPageCopy.directVisitState.message}
              </p>
              <div className="empty-state__actions">
                <Button
                  href={inquiryHref}
                  variant="primary"
                  external={!liveReady && Boolean(instagramHref)}
                >
                  {faqPageCopy.directVisitState.primaryCta}
                </Button>
                <Button href="/ar" variant="secondary">
                  {faqPageCopy.directVisitState.secondaryCta}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <BookingPanel mode="cta-banner" />
    </>
  );
}
