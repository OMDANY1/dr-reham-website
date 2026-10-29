import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeContent } from "@/content/ar/home";
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
import { SpecialtyIntro } from "@/components/sections/SpecialtyIntro";
import { BeforeConsultation } from "@/components/sections/BeforeConsultation";
import { ServiceRows } from "@/components/sections/ServiceRows";
import { KnowledgeTeaser } from "@/components/sections/KnowledgeTeaser";
import { ContentStyleSection } from "@/components/sections/ContentStyleSection";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

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

  const sp = await searchParams;
  const previewParam = sp?.preview === "1";

  const { homeData, isPreviewSession, previewUser } =
    await getPublicOrPreviewHomeData(previewParam);
  const { articles: visibleArticles } =
    await getPublicOrPreviewArticles(previewParam);
  const publicFaqs = (await getPublicOrPreviewFaqs(previewParam)).slice(0, 4);
  const cmsClinics = getPublicClinicsFromCms();
  const publicServices = getPublicServices(servicesRecords);
  const physicianJsonLd = buildPhysicianJsonLd();

  const renderSection = (key: HomeSectionKey) => {
    if (!homeData.sectionVisibility?.[key]) {
      return null;
    }

    switch (key) {
      case "doctorIntro":
        return (
          <section
            key="doctorIntro"
            id={homeData.doctorIntro.id}
            className="doctor-brief-section"
            style={{ scrollMarginBlockStart: "5.5rem" }}
            aria-labelledby="doctor-brief-heading"
          >
            <Container>
              <ScrollReveal>
                <div className="doctor-brief-grid">
                  <div className="doctor-brief-identity">
                    <div>
                      <span className="eyebrow">
                        {homeData.doctorIntro.eyebrow}
                      </span>
                      <h2
                        id="doctor-brief-heading"
                        className="doctor-brief-identity__name"
                      >
                        {homeData.doctorIntro.name}
                      </h2>
                      <p className="doctor-brief-identity__role">
                        {homeData.doctorIntro.specialty}
                      </p>
                      {homeData.doctorIntro.professionalRank ? (
                        <p
                          style={{
                            fontSize: "var(--text-small)",
                            color: "var(--color-secondary)",
                            marginBlockStart: "0.25rem",
                          }}
                        >
                          {homeData.doctorIntro.professionalRank}
                        </p>
                      ) : null}
                      <span className="doctor-brief-identity__city">
                        {homeData.doctorIntro.city}
                      </span>
                    </div>

                    <div>
                      <Link
                        href={homeData.doctorIntro.moreLinkHref}
                        className="text-link"
                      >
                        {homeData.doctorIntro.moreLinkLabel} ←
                      </Link>
                    </div>
                  </div>

                  <div className="doctor-brief-narrative">
                    <p className="doctor-brief-statement">
                      {homeData.doctorIntro.leadStatement}
                    </p>

                    <div className="doctor-brief-pillars">
                      {homeData.doctorIntro.pillars.map((pillar) => (
                        <div key={pillar.title}>
                          <h3 className="doctor-brief-pillar__title">
                            {pillar.title}
                          </h3>
                          <p className="doctor-brief-pillar__text">
                            {pillar.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </Container>
          </section>
        );

      case "specialtySection":
        return (
          <React.Fragment key="specialtySection">
            <SpecialtyIntro data={homeData.specialtySection} />
            <ServiceRows services={publicServices} context="home" />
          </React.Fragment>
        );

      case "beforeConsultationSection":
        return (
          <BeforeConsultation
            key="beforeConsultationSection"
            data={homeData.beforeConsultationSection}
          />
        );

      case "knowledgeSection":
        return (
          <KnowledgeTeaser
            key="knowledgeSection"
            articles={visibleArticles}
            sectionCopy={homeData.knowledgeSection}
          />
        );

      case "contentStyleSection":
        return (
          <ContentStyleSection
            key="contentStyleSection"
            data={homeData.contentStyleSection}
          />
        );

      case "faqSection":
        return publicFaqs.length > 0 ? (
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
                    <span className="eyebrow">
                      {homeData.faqSection.eyebrow}
                    </span>
                    <h2 id="home-faq-heading" className="section-title">
                      {homeData.faqSection.title}
                    </h2>
                    <p className="section-lead">{homeData.faqSection.intro}</p>
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
        ) : null;

      case "finalInquiry":
        return (
          <BookingPanel
            key="finalInquiry"
            mode="cta-banner"
            clinics={cmsClinics}
            finalInquiryData={homeData.finalInquiry}
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

      {/* ١. الافتتاحية الفوتوغرافية (ثابتة في أعلى الصفحة) */}
      <Hero data={homeData.hero} />

      {/* الأقسام القابلة للإظهار والإخفاء وإعادة الترتيب من لوحة الإدارة */}
      {homeData.sectionOrder.map((key) => renderSection(key))}
    </>
  );
}
