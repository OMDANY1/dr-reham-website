/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { servicesRecords } from "@/content/ar/services";
import {
  getPublicServices,
  isSupportedLocale,
} from "@/lib/content-gates";
import { buildPhysicianJsonLd, buildRouteMetadata } from "@/lib/metadata";
import {
  getPublicClinicsFromCms,
  getPublicOrPreviewArticles,
  getPublicOrPreviewFaqs,
  getPublicOrPreviewHomeData,
} from "@/lib/cms/public-data";
import type { HomeSectionKey } from "@/lib/cms/types";
import { Hero } from "@/components/sections/Hero";
import { SpecialtiesStrip } from "@/components/sections/SpecialtiesStrip";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { BeforeConsultation } from "@/components/sections/BeforeConsultation";
import { ServiceRows } from "@/components/sections/ServiceRows";
import { KnowledgeTeaser } from "@/components/sections/KnowledgeTeaser";
import { ContentStyleSection } from "@/components/sections/ContentStyleSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: SupportedLocale = locale === "en" ? "en" : "ar";
  const meta =
    activeLocale === "en" ? homeContentEn.meta : homeContent.meta;
  return buildRouteMetadata({
    title: meta.title,
    description: meta.description,
    pathname: `/${activeLocale}`,
    locale: activeLocale,
  });
}

function PrincipleIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "cap":
    case "surgical":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14 5L24 9.8L14 14.6L4 9.8L14 5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 12V18.2C7.5 20.5 10.4 22.5 14 22.5C17.6 22.5 20.5 20.5 20.5 18.2V12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "gem":
    case "evidence":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8.5 5.5H19.5L24 11L14 23L4 11L8.5 5.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M4 11H24M14 23L9.5 11L14 5.5L18.5 11L14 23Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "contour":
    case "natural":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 20C10.5 14 14.5 9.5 21 7C19.5 14.5 15 19.5 8 20Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M6 22C10 18.5 14.5 14.5 18.5 10"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
    case "patient":
    default:
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14 4.5L22.5 8V14.2C22.5 19.2 18.9 22.8 14 24.5C9.1 22.8 5.5 19.2 5.5 14.2V8L14 4.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M10.8 14.3L13 16.5L17.5 12"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default async function HomePage({
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
  const sp = await searchParams;
  const previewParam = sp?.preview === "1";

  const { homeData, isPreviewSession, previewUser } =
    await getPublicOrPreviewHomeData(previewParam);
  const { articles: visibleArticles } = await getPublicOrPreviewArticles(
    previewParam,
    locale
  );
  const publicFaqs = (await getPublicOrPreviewFaqs(previewParam, locale)).slice(
    0,
    4
  );
  const cmsClinics = getPublicClinicsFromCms(locale);
  const publicServices = getPublicServices(servicesRecords);
  const physicianJsonLd = buildPhysicianJsonLd(locale);

  const enData = homeData.en;
  const baseAr = homeContent;
  const baseEn = homeContentEn;

  const renderAboutEditorial = () => {
    if (homeData.sectionVisibility?.doctorIntro === false) {
      return null;
    }

    const rawSculptureSrc =
      homeData.doctorIntro?.sculptureImage?.src ||
      baseAr.doctorIntro.sculptureImage.src;
    const sculptureSrc =
      rawSculptureSrc === "/media/about-eyelid-sculpture.jpg"
        ? "/media/dr-reham-about.jpg"
        : rawSculptureSrc;
    const sculptureAlt = isEn
      ? homeData.doctorIntro?.sculptureImage?.altEn ||
        baseEn.doctorIntro.sculptureImage.alt
      : homeData.doctorIntro?.sculptureImage?.alt ||
        baseAr.doctorIntro.sculptureImage.alt;

    const eyebrow = isEn
      ? enData?.doctorIntro?.eyebrow || baseEn.doctorIntro.eyebrow
      : homeData.doctorIntro?.eyebrow || baseAr.doctorIntro.eyebrow;

    const heading = isEn
      ? enData?.doctorIntro?.heading || baseEn.doctorIntro.heading
      : homeData.doctorIntro?.heading || baseAr.doctorIntro.heading;

    const leadStatement = isEn
      ? enData?.doctorIntro?.leadStatement || baseEn.doctorIntro.leadStatement
      : homeData.doctorIntro?.leadStatement || baseAr.doctorIntro.leadStatement;

    const moreLabel = isEn
      ? enData?.doctorIntro?.moreLinkLabel || baseEn.doctorIntro.moreLinkLabel
      : homeData.doctorIntro?.moreLinkLabel || baseAr.doctorIntro.moreLinkLabel;

    const principles = isEn
      ? enData?.doctorIntro?.principles?.length
        ? enData.doctorIntro.principles
        : baseEn.doctorIntro.principles
      : homeData.doctorIntro?.principles?.length
      ? homeData.doctorIntro.principles
      : baseAr.doctorIntro.principles;

    return (
      <section
        key="doctorIntro"
        id={homeData.doctorIntro?.id || "about-brief"}
        className="about-editorial-section"
        data-testid="about-editorial-section"
        style={{ scrollMarginBlockStart: "5.5rem" }}
        aria-labelledby="doctor-brief-heading"
      >
        <Container>
          <ScrollReveal>
            <div className="about-editorial-grid">
              <div className="about-editorial__media editorial-photo-wrap">
                <img
                  src={sculptureSrc}
                  alt={sculptureAlt}
                  className="about-editorial__img editorial-photo-zoom"
                  width={680}
                  height={615}
                />
              </div>

              <div className="about-editorial__narrative">
                <span className="eyebrow eyebrow--clean">{eyebrow}</span>
                <h2
                  id="doctor-brief-heading"
                  className="about-editorial__title"
                >
                  {heading}
                </h2>
                <p
                  className="about-editorial__desc"
                  data-testid="doctor-lead-statement"
                >
                  {leadStatement}
                </p>
                <Button href={`/${locale}/about`} variant="secondary">
                  <span>{moreLabel}</span>
                  <span aria-hidden="true">{isEn ? "→" : "←"}</span>
                </Button>
              </div>

              <ul className="about-editorial__principles">
                {principles.map((item, idx) => (
                  <li
                    key={`${item.icon}-${idx}`}
                    className="about-editorial__principle-item about-principle-row stagger-item"
                    style={{ "--stagger-index": idx } as React.CSSProperties}
                  >
                    <span className="about-editorial__principle-icon">
                      <PrincipleIcon icon={item.icon} />
                    </span>
                    <span className="about-editorial__principle-title">
                      {item.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    );
  };

  const renderSecondarySection = (key: HomeSectionKey) => {
    if (
      key === "testimonialsSection"
        ? homeData.sectionVisibility?.testimonialsSection === false
        : !homeData.sectionVisibility?.[key]
    ) {
      return null;
    }

    switch (key) {
      case "beforeConsultationSection":
        return (
          <BeforeConsultation
            key="beforeConsultationSection"
            data={homeData.beforeConsultationSection}
            locale={locale}
          />
        );

      case "contentStyleSection":
        return (
          <ContentStyleSection
            key="contentStyleSection"
            data={homeData.contentStyleSection}
            locale={locale}
          />
        );

      case "testimonialsSection":
        return (
          <TestimonialsSection
            key="testimonialsSection"
            data={homeData.testimonialsSection}
            locale={locale}
            isPreviewSession={isPreviewSession}
          />
        );

      case "faqSection": {
        if (publicFaqs.length === 0) return null;
        const faqEyebrow = isEn
          ? enData?.faqSection?.eyebrow || baseEn.faqSection.eyebrow
          : homeData.faqSection?.eyebrow || baseAr.faqSection.eyebrow;
        const faqTitle = isEn
          ? enData?.faqSection?.title || baseEn.faqSection.title
          : homeData.faqSection?.title || baseAr.faqSection.title;
        const faqIntro = isEn
          ? enData?.faqSection?.intro || baseEn.faqSection.intro
          : homeData.faqSection?.intro || baseAr.faqSection.intro;

        return (
          <section
            key="faqSection"
            id={homeData.faqSection.id}
            className="practical-faq-section"
            aria-labelledby="home-faq-heading"
          >
            <Container>
              <ScrollReveal>
                <div className="editorial-split">
                  <div className="editorial-split__lead">
                    <span className="eyebrow">{faqEyebrow}</span>
                    <h2 id="home-faq-heading" className="section-title">
                      {faqTitle}
                    </h2>
                    <p className="section-lead">{faqIntro}</p>
                  </div>

                  <div className="editorial-split__content">
                    <Accordion
                      items={publicFaqs.map((item, idx) => ({
                        id: item.id,
                        question: item.question,
                        answer: item.answer ?? "",
                        defaultOpen: idx === 0,
                      }))}
                    />
                  </div>
                </div>
              </ScrollReveal>
            </Container>
          </section>
        );
      }

      case "finalInquiry":
        return (
          <BookingPanel
            key="finalInquiry"
            mode="cta-banner"
            clinics={cmsClinics}
            finalInquiryData={homeData.finalInquiry}
            enOverride={enData?.finalInquiry}
            locale={locale}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isPreviewSession ? (
        <PreviewBanner userName={previewUser?.name} />
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />

      {/* 1. Photographic Editorial Hero */}
      <Hero
        data={homeData.hero}
        enOverride={enData?.hero}
        locale={locale}
      />

      {/* 2. Horizontal Subspecialties Strip */}
      {homeData.sectionVisibility?.specialtiesStrip !== false ? (
        <SpecialtiesStrip
          data={homeData.specialtiesStrip}
          locale={locale}
        />
      ) : null}

      {/* 3. Three-Column Editorial About Section (Sculptural Artwork + Narrative + 4 Principles) */}
      {renderAboutEditorial()}

      {/* 4. Dark Plum Results Section (Before & After Auto-Advancing Carousel) */}
      {homeData.sectionVisibility?.resultsSection !== false ? (
        <ResultsSection
          data={homeData.resultsSection}
          locale={locale}
          isPreviewSession={isPreviewSession}
        />
      ) : null}

      {/* 5. Patient Education & Articles 3-Card Section */}
      {homeData.sectionVisibility?.knowledgeSection !== false ? (
        <KnowledgeTeaser
          articles={visibleArticles}
          sectionCopy={homeData.knowledgeSection}
          enOverride={enData?.knowledgeSection}
          locale={locale}
          isPreviewSession={isPreviewSession}
        />
      ) : null}

      {/* Approved Services Rows (if any published service exists) */}
      {publicServices.length > 0 ? (
        <ServiceRows
          services={publicServices}
          context="home"
          locale={locale}
        />
      ) : null}

      {/* 6. Secondary Editorial Sections (Before Consultation, Content Style, Follower Testimonials, FAQ, Final Inquiry) */}
      {(() => {
        const filteredOrder = homeData.sectionOrder.filter(
          (key) =>
            key !== "specialtiesStrip" &&
            key !== "doctorIntro" &&
            key !== "resultsSection" &&
            key !== "specialtySection" &&
            key !== "knowledgeSection"
        );
        if (!filteredOrder.includes("testimonialsSection")) {
          const faqIdx = filteredOrder.indexOf("faqSection");
          if (faqIdx >= 0) {
            filteredOrder.splice(faqIdx, 0, "testimonialsSection");
          } else {
            filteredOrder.unshift("testimonialsSection");
          }
        }
        return filteredOrder.map((key) => renderSecondarySection(key));
      })()}
    </>
  );
}
