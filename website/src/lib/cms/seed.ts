import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { articlesRecords, journalPageCopy } from "@/content/ar/articles";
import { faqRecords } from "@/content/ar/faq";
import { privacyPageCopy } from "@/content/ar/privacy";
import type {
  CmsArticle,
  CmsClinicItem,
  CmsFaqItem,
  CmsMediaItem,
  CmsPageRecord,
  CmsSiteSettings,
  HomePageCmsData,
} from "./types";

const INITIAL_TIMESTAMP = "2026-10-29T12:00:00.000Z";

export function buildInitialHomePageData(): HomePageCmsData {
  return {
    hero: {
      doctorTag: homeContent.hero.doctorTag,
      specialtyTag: homeContent.hero.specialtyTag,
      headlineLine1: homeContent.hero.headlineLine1,
      headlineLine2: homeContent.hero.headlineLine2,
      support: homeContent.hero.support,
      primaryCta: homeContent.hero.primaryCta,
      primaryHref: siteConfig.instagramUrl,
      secondaryCta: homeContent.hero.secondaryCta,
      secondaryHref: homeContent.hero.secondaryHref,
      destinationHint: homeContent.hero.destinationHint,
      image: {
        src: homeContent.hero.image.src,
        alt: homeContent.hero.image.alt,
        focalX: 36,
        focalY: 35,
      },
    },
    doctorIntro: {
      id: homeContent.doctorIntro.id,
      eyebrow: homeContent.doctorIntro.eyebrow,
      name: homeContent.doctorIntro.name,
      specialty: homeContent.doctorIntro.specialty,
      professionalRank: siteConfig.profile.professionalRank,
      city: homeContent.doctorIntro.city,
      leadStatement: homeContent.doctorIntro.leadStatement,
      pillars: homeContent.doctorIntro.pillars.map((p) => ({
        title: p.title,
        text: p.text,
      })),
      credentials: siteConfig.profile.credentials.map((c) => ({
        id: c.id,
        title: c.title,
        institution: c.institution,
        year: c.year,
        verified: c.verified,
      })),
      moreLinkLabel: homeContent.doctorIntro.moreLinkLabel,
      moreLinkHref: homeContent.doctorIntro.moreLinkHref,
    },
    specialtySection: {
      id: homeContent.specialtySection.id,
      eyebrow: homeContent.specialtySection.eyebrow,
      title: homeContent.specialtySection.title,
      lead: homeContent.specialtySection.lead,
      image: {
        src: homeContent.specialtySection.image.src,
        alt: homeContent.specialtySection.image.alt,
        focalX: 45,
        focalY: 42,
      },
      highlights: homeContent.specialtySection.highlights.map((h) => ({
        number: h.number,
        title: h.title,
        description: h.description,
      })),
    },
    beforeConsultationSection: {
      id: homeContent.beforeConsultationSection.id,
      eyebrow: homeContent.beforeConsultationSection.eyebrow,
      title: homeContent.beforeConsultationSection.title,
      intro: homeContent.beforeConsultationSection.intro,
      steps: homeContent.beforeConsultationSection.steps.map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
      })),
      generalNote: homeContent.beforeConsultationSection.generalNote,
    },
    knowledgeSection: {
      eyebrow: homeContent.knowledgeSection.eyebrow,
      title: homeContent.knowledgeSection.title,
      intro: homeContent.knowledgeSection.intro,
      viewAllLabel: homeContent.knowledgeSection.viewAllLabel,
      readArticleLabel: homeContent.knowledgeSection.readArticleLabel,
    },
    contentStyleSection: {
      id: homeContent.contentStyleSection.id,
      eyebrow: homeContent.contentStyleSection.eyebrow,
      title: homeContent.contentStyleSection.title,
      lead: homeContent.contentStyleSection.lead,
      pillars: homeContent.contentStyleSection.pillars.map((p) => ({
        title: p.title,
        text: p.text,
      })),
      instagramCard: {
        badge: homeContent.contentStyleSection.instagramCard.badge,
        handle: homeContent.contentStyleSection.instagramCard.handle,
        title: homeContent.contentStyleSection.instagramCard.title,
        description: homeContent.contentStyleSection.instagramCard.description,
        ctaLabel: homeContent.contentStyleSection.instagramCard.ctaLabel,
        image: {
          src: homeContent.contentStyleSection.instagramCard.image.src,
          alt: homeContent.contentStyleSection.instagramCard.image.alt,
          focalX: 50,
          focalY: 50,
        },
      },
    },
    faqSection: {
      id: homeContent.faqSection.id,
      eyebrow: homeContent.faqSection.eyebrow,
      title: homeContent.faqSection.title,
      intro: homeContent.faqSection.intro,
      viewAllLabel: homeContent.faqSection.viewAllLabel,
    },
    finalInquiry: {
      eyebrow: homeContent.finalInquiry.eyebrow,
      heading: homeContent.finalInquiry.heading,
      support: homeContent.finalInquiry.support,
      primaryCta: homeContent.finalInquiry.primaryCta,
      primaryHref: siteConfig.instagramUrl,
      destinationCaption: homeContent.finalInquiry.destinationCaption,
    },
    headerFooter: {
      aboutLabel: homeContent.navigation.about,
      specialtyLabel: homeContent.navigation.specialty,
      journalLabel: homeContent.navigation.journal,
      faqLabel: homeContent.navigation.faq,
      contactLabel: homeContent.navigation.contact,
      privacyLabel: homeContent.navigation.privacy,
      primaryInquiryCta: homeContent.navigation.primaryInquiryCta,
      footerTagline:
        "عناية دقيقة بتفاصيل نظرتك — طب وجراحة تجميل العيون والجفون في الرياض.",
      footerDisclaimer:
        "الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل حالات مرضى أو نتائج علاجية.",
    },
    sectionVisibility: {
      doctorIntro: true,
      specialtySection: true,
      beforeConsultationSection: true,
      knowledgeSection: true,
      contentStyleSection: true,
      faqSection: true,
      finalInquiry: true,
    },
    sectionOrder: [
      "doctorIntro",
      "specialtySection",
      "beforeConsultationSection",
      "knowledgeSection",
      "contentStyleSection",
      "faqSection",
      "finalInquiry",
    ],
  };
}

export function buildInitialPageRecord(): CmsPageRecord {
  const data = buildInitialHomePageData();
  return {
    slug: "home",
    title: "الصفحة الرئيسية",
    draftData: structuredClone(data),
    publishedData: structuredClone(data),
    hasUnpublishedChanges: false,
    version: 1,
    deletedAt: null,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة النظام",
    publishedAt: INITIAL_TIMESTAMP,
    publishedBy: "تهيئة النظام",
  };
}

export function buildInitialArticles(): CmsArticle[] {
  return articlesRecords.map((record, index) => ({
    id: `article-${index + 1}-${record.slug}`,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt ?? "",
    category: record.category,
    featured: Boolean(record.featured),
    image: {
      src: record.image?.src ?? "/media/article-hooded-vs-deepset.jpg",
      alt: record.image?.alt ?? record.title,
      focalX: 50,
      focalY: 50,
    },
    body: record.body.map((section, sIdx) => ({
      id: section.id ?? `section-${sIdx + 1}`,
      heading: section.heading,
      paragraphs: [...section.paragraphs],
      ...(section.bullets ? { bullets: [...section.bullets] } : {}),
    })),
    author: record.author,
    reviewedBy: record.reviewedBy,
    reviewedAt: record.reviewedAt,
    approvedBy: null,
    approvedAt: null,
    publishedAt: record.publishedAt,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة المحتوى الأولي",
    status: record.status === "published" ? "published" : "draft",
    seo: {
      title: record.seo.title ?? record.title,
      description: record.seo.description ?? record.excerpt ?? "",
      ogImage: record.image?.src ?? null,
    },
    sources: (record.sources ?? []).map((src) =>
      typeof src === "string"
        ? { title: src, institution: src, url: "https://www.aao.org/" }
        : { title: src.title, institution: src.institution, url: src.url }
    ),
    disclaimer: journalPageCopy.articleLabels.disclaimer,
    version: 1,
    deletedAt: null,
  }));
}

export function buildInitialMediaItems(): CmsMediaItem[] {
  const presets: Array<{
    id: string;
    name: string;
    filename: string;
    url: string;
    alt: string;
    focalX: number;
    focalY: number;
    isPublic: boolean;
  }> = [
    {
      id: "media-hero-gaze-editorial",
      name: "صورة الافتتاحية الفوتوغرافية",
      filename: "hero-gaze-editorial.jpg",
      url: "/media/hero-gaze-editorial.jpg",
      alt: homeContent.hero.image.alt,
      focalX: 36,
      focalY: 35,
      isPublic: true,
    },
    {
      id: "media-specialty-eyelid-profile",
      name: "صورة قسم التخصص",
      filename: "specialty-eyelid-profile.jpg",
      url: "/media/specialty-eyelid-profile.jpg",
      alt: homeContent.specialtySection.image.alt,
      focalX: 45,
      focalY: 42,
      isPublic: true,
    },
    {
      id: "media-article-hooded-vs-deepset",
      name: "صورة مقال الجفن المبطن والعين الغائرة",
      filename: "article-hooded-vs-deepset.jpg",
      url: "/media/article-hooded-vs-deepset.jpg",
      alt: "صورة تحريرية تعبيرية مقرّبة لانحناءة الجفن العلوي وقوس الحاجب تحت إضاءة نهارية ناعمة",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-tired-eye-factors",
      name: "صورة مقال مظهر الإرهاق حول العين",
      filename: "article-tired-eye-factors.jpg",
      url: "/media/article-tired-eye-factors.jpg",
      alt: "صورة تحريرية هادئة لمنطقة العين وأعلى الوجنة في ضوء الصباح الطبيعي",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-consultation-prep",
      name: "صورة مقال الاستعداد للاستشارة",
      filename: "article-consultation-prep.jpg",
      url: "/media/article-consultation-prep.jpg",
      alt: "تكوين فوتوغرافي هادئ لدفتر ملاحظات وقلم ونظارة طبية على سطح أبيض وسماوي فاتح",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-consultation-questions",
      name: "صورة مقال أسئلة الاستشارة وأسلوب المحتوى",
      filename: "article-consultation-questions.jpg",
      url: "/media/article-consultation-questions.jpg",
      alt: "تفصيل معماري هادئ لغرفة استشارة مضاءة بنور النهار الطبيعي",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-article-medical-history-notes",
      name: "صورة مقال المعلومات الصحية قبل الاستشارة",
      filename: "article-medical-history-notes.jpg",
      url: "/media/article-medical-history-notes.jpg",
      alt: "ملف أوراق منظم وإطار نظارة طبية على طاولة مضاءة بضوء النهار",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-realistic-expectations",
      name: "صورة مقال القراءة الواقعية لصور قبل وبعد",
      filename: "article-realistic-expectations.jpg",
      url: "/media/article-realistic-expectations.jpg",
      alt: "عدسة بصرية صافية تعكس ضوءًا هادئًا على سطح أبيض ناصع",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
  ];

  return presets.map((item) => ({
    id: item.id,
    name: item.name,
    filename: item.filename,
    mimeType: "image/jpeg",
    sizeBytes: 185000,
    width: 1200,
    height: 750,
    alt: item.alt,
    focalX: item.focalX,
    focalY: item.focalY,
    storagePath: item.url,
    url: item.url,
    isPublic: item.isPublic,
    uploadedBy: "تهيئة النظام",
    createdAt: INITIAL_TIMESTAMP,
    updatedAt: INITIAL_TIMESTAMP,
  }));
}

export function buildInitialFaqs(): CmsFaqItem[] {
  return faqRecords.map((faq, idx) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer ?? "",
    category: faq.category,
    sortOrder: idx + 1,
    status:
      faq.status === "published" && faq.answer && faq.answer.trim().length > 0
        ? "published"
        : "draft",
    reviewedBy: faq.reviewedBy,
    version: 1,
    deletedAt: null,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة النظام",
  }));
}

export function buildInitialClinics(): CmsClinicItem[] {
  return siteConfig.clinics.map((clinic, idx) => ({
    id: clinic.id,
    name: clinic.name,
    source: clinic.source,
    affiliationVerified: clinic.affiliationVerified,
    enabled: clinic.enabled,
    address: clinic.address,
    mapsUrl: clinic.mapsUrl,
    bookingUrl: clinic.bookingUrl,
    whatsappE164: clinic.whatsappE164,
    phone: null,
    hours: clinic.hours,
    sortOrder: idx + 1,
    version: 1,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة النظام",
  }));
}

export function buildInitialSettings(): CmsSiteSettings {
  return {
    siteName: siteConfig.profile.nameAr,
    siteDescription: homeContent.meta.description,
    specialtyTitle: siteConfig.profile.specialtyAr,
    city: siteConfig.profile.city,
    logoPath: "/brand/logo-original.png",
    faviconPath: "/brand/logo-original.png",
    defaultOgImage: "/media/hero-gaze-editorial.jpg",
    seoTitleTemplate: "%s | د. ريهام القحطاني",
    seoDefaultDescription: homeContent.meta.description,
    domain: siteConfig.domain,
    instagramUrl: siteConfig.instagramUrl,
    whatsappUrl: null,
    phone: null,
    email: null,
    defaultInquiryDestination: "instagram",
    bookingEnabled: siteConfig.bookingEnabled,
    enablePreviewDrafts: siteConfig.enablePreviewDrafts,
    legalEntity: siteConfig.legalEntity,
    privacyContact: siteConfig.privacyContact,
    privacySections: privacyPageCopy.sections.map((s) => ({
      id: s.id,
      heading: s.heading,
      paragraphs: [...s.paragraphs],
    })),
    version: 1,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة النظام",
  };
}
