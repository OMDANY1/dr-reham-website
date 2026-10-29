import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeContent } from "@/content/ar/home";
import { servicesRecords } from "@/content/ar/services";
import { articlesRecords } from "@/content/ar/articles";
import { faqRecords } from "@/content/ar/faq";
import {
  getPublicFaqs,
  getPublicServices,
  getVisibleArticles,
  isSupportedLocale,
} from "@/lib/content-gates";
import { buildPhysicianJsonLd, buildRouteMetadata } from "@/lib/metadata";
import { Hero } from "@/components/sections/Hero";
import { SpecialtyIntro } from "@/components/sections/SpecialtyIntro";
import { BeforeConsultation } from "@/components/sections/BeforeConsultation";
import { ServiceRows } from "@/components/sections/ServiceRows";
import { KnowledgeTeaser } from "@/components/sections/KnowledgeTeaser";
import { ContentStyleSection } from "@/components/sections/ContentStyleSection";
import { BookingPanel } from "@/components/sections/BookingPanel";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const publicServices = getPublicServices(servicesRecords);
  const visibleArticles = getVisibleArticles(articlesRecords);
  const publicFaqs = getPublicFaqs(faqRecords).slice(0, 4);
  const physicianJsonLd = buildPhysicianJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />

      {/* ١. الافتتاحية الفوتوغرافية الحالية */}
      <Hero />

      {/* ٢. التعريف الموجز بالدكتورة والتخصص */}
      <section
        id={homeContent.doctorIntro.id}
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
                    {homeContent.doctorIntro.eyebrow}
                  </span>
                  <h2
                    id="doctor-brief-heading"
                    className="doctor-brief-identity__name"
                  >
                    {homeContent.doctorIntro.name}
                  </h2>
                  <p className="doctor-brief-identity__role">
                    {homeContent.doctorIntro.specialty}
                  </p>
                  <span className="doctor-brief-identity__city">
                    {homeContent.doctorIntro.city}
                  </span>
                </div>

                <div>
                  <Link
                    href={homeContent.doctorIntro.moreLinkHref}
                    className="text-link"
                  >
                    {homeContent.doctorIntro.moreLinkLabel} ←
                  </Link>
                </div>
              </div>

              <div className="doctor-brief-narrative">
                <p className="doctor-brief-statement">
                  {homeContent.doctorIntro.leadStatement}
                </p>

                <div className="doctor-brief-pillars">
                  {homeContent.doctorIntro.pillars.map((pillar) => (
                    <div key={pillar.title}>
                      <h3 className="doctor-brief-pillar__title">
                        {pillar.title}
                      </h3>
                      <p className="doctor-brief-pillar__text">{pillar.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ٣. قسم التخصص الحالي بعد ضبط كثافة المحتوى والمسافات */}
      <SpecialtyIntro />

      {/* الخدمات الفعلية إن كانت بياناتها معتمدة */}
      <ServiceRows services={publicServices} context="home" />

      {/* ٤. قسم «قبل الاستشارة» (ثلاث خطوات تحضيرية متصلة) */}
      <BeforeConsultation />

      {/* ٥. قسم بارز «من المقالات» (مقال كبير بجانب مقالتين أصغر) */}
      <KnowledgeTeaser articles={visibleArticles} />

      {/* ٦. قسم «تعرّف على أسلوب المحتوى» */}
      <ContentStyleSection />

      {/* ٧. قسم الأسئلة العملية المختصرة */}
      {publicFaqs.length > 0 ? (
        <section
          id={homeContent.faqSection.id}
          className="practical-faq-section"
          aria-labelledby="home-faq-heading"
        >
          <Container>
            <ScrollReveal>
              <div className="editorial-split">
                <div className="editorial-split__lead">
                  <span className="eyebrow">
                    {homeContent.faqSection.eyebrow}
                  </span>
                  <h2 id="home-faq-heading" className="section-title">
                    {homeContent.faqSection.title}
                  </h2>
                  <p className="section-lead">
                    {homeContent.faqSection.intro}
                  </p>
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
      ) : null}

      {/* ٨. دعوة التواصل الختامية والفوتر */}
      <BookingPanel mode="cta-banner" />
    </>
  );
}
