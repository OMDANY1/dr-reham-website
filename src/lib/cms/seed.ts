import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { articlesRecords, journalPageCopy } from "@/content/ar/articles";
import { faqRecords } from "@/content/ar/faq";
import { privacyPageCopy } from "@/content/ar/privacy";
import {
  articlesTranslationsEn,
  faqTranslationsEn,
  homeContentEn,
  journalPageCopyEn,
} from "@/content/en";
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
      tagline: homeContent.hero.tagline,
      support: homeContent.hero.support,
      primaryCta: homeContent.hero.primaryCta,
      primaryHref: siteConfig.whatsappUrl,
      secondaryCta: homeContent.hero.secondaryCta,
      secondaryHref: homeContent.hero.secondaryHref,
      destinationHint: homeContent.hero.destinationHint,
      image: {
        src: homeContent.hero.image.src,
        alt: homeContent.hero.image.alt,
        altEn: homeContentEn.hero.image.alt,
        focalX: 68,
        focalY: 42,
      },
    },
    specialtiesStrip: homeContent.specialtiesStrip.map((item, idx) => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      titleEn:
        homeContentEn.specialtiesStrip[idx]?.title ?? item.title,
      subtitle: item.subtitle,
      subtitleEn:
        homeContentEn.specialtiesStrip[idx]?.subtitle ?? item.subtitle,
      enabled: true,
    })),
    doctorIntro: {
      id: homeContent.doctorIntro.id,
      eyebrow: homeContent.doctorIntro.eyebrow,
      name: homeContent.doctorIntro.name,
      heading: homeContent.doctorIntro.heading,
      specialty: homeContent.doctorIntro.specialty,
      professionalRank: siteConfig.profile.professionalRank,
      city: homeContent.doctorIntro.city,
      leadStatement: homeContent.doctorIntro.leadStatement,
      sculptureImage: {
        src: homeContent.doctorIntro.sculptureImage.src,
        alt: homeContent.doctorIntro.sculptureImage.alt,
        altEn: homeContentEn.doctorIntro.sculptureImage.alt,
      },
      principles: homeContent.doctorIntro.principles.map((p, idx) => ({
        icon: p.icon,
        title: p.title,
        titleEn:
          homeContentEn.doctorIntro.principles[idx]?.title ?? p.title,
      })),
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
    resultsSection: {
      id: homeContent.resultsSection.id,
      eyebrow: homeContent.resultsSection.eyebrow,
      eyebrowEn: homeContentEn.resultsSection.eyebrow,
      title: homeContent.resultsSection.title,
      titleEn: homeContentEn.resultsSection.title,
      description: homeContent.resultsSection.description,
      descriptionEn: homeContentEn.resultsSection.description,
      ctaLabel: homeContent.resultsSection.ctaLabel,
      ctaLabelEn: homeContentEn.resultsSection.ctaLabel,
      cases: [
        {
          id: "case-1",
          titleAr: "تجميل جفون سفلية مع إعادة توزيع الدهون",
          titleEn: "Lower Blepharoplasty with Fat Repositioning",
          captionAr: "",
          captionEn: "",
          beforeImageSrc: "/media/case-1-before.jpg",
          afterImageSrc: "/media/case-1-after.jpg",
          altAr: "حالة تجميل جفون سفلية مع إعادة توزيع الدهون",
          altEn: "Lower blepharoplasty with fat repositioning case",
          beforeAltAr: "صورة قبل — تجميل جفون سفلية مع إعادة توزيع الدهون",
          beforeAltEn: "Before photo — lower blepharoplasty with fat repositioning",
          afterAltAr: "صورة بعد — تجميل جفون سفلية مع إعادة توزيع الدهون",
          afterAltEn: "After photo — lower blepharoplasty with fat repositioning",
          beforeFocalPoint: "50% 50%",
          afterFocalPoint: "50% 50%",
          sortOrder: 1,
          status: "published",
          consentConfirmed: true,
          approvedByDoctor: true,
          published: true,
        },
        {
          id: "case-2",
          titleAr:
            "تجميل الجفون العلوية والجفون السفلية مع إعادة توزيع الدهون بجرح مخفي + توسيع العيون من الزوايا الخارجية",
          titleEn:
            "Upper & Lower Blepharoplasty with Hidden-Incision Fat Repositioning + Lateral Canthal Refinement",
          captionAr: "",
          captionEn: "",
          beforeImageSrc: "/media/case-2-before.jpg",
          afterImageSrc: "/media/case-2-after.jpg",
          altAr:
            "حالة تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي وتوسيع العيون من الزوايا الخارجية",
          altEn:
            "Upper and lower blepharoplasty with hidden-incision fat repositioning and lateral canthal refinement",
          beforeAltAr:
            "صورة قبل — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي",
          beforeAltEn:
            "Before photo — upper and lower blepharoplasty with fat repositioning",
          afterAltAr:
            "صورة بعد — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي وتوسيع الزوايا الخارجية",
          afterAltEn:
            "After photo — upper and lower blepharoplasty with hidden-incision fat repositioning",
          beforeFocalPoint: "50% 50%",
          afterFocalPoint: "50% 50%",
          sortOrder: 2,
          status: "published",
          consentConfirmed: true,
          approvedByDoctor: true,
          published: true,
        },
        {
          id: "case-3",
          titleAr:
            "تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق فيما بينهم",
          titleEn:
            "Upper Blepharoplasty with Brow Lift & Brow-Lid Harmony Adjustment",
          captionAr: "",
          captionEn: "",
          beforeImageSrc: "/media/case-3-before.jpg",
          afterImageSrc: "/media/case-3-after.jpg",
          altAr:
            "حالة تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق فيما بينهم",
          altEn:
            "Upper blepharoplasty with brow lift and brow-lid harmony adjustment",
          beforeAltAr:
            "صورة قبل — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق",
          beforeAltEn:
            "Before photo — upper blepharoplasty with brow lift and harmony adjustment",
          afterAltAr:
            "صورة بعد — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق فيما بينهم",
          afterAltEn:
            "After photo — upper blepharoplasty with brow lift and harmony adjustment",
          beforeFocalPoint: "50% 50%",
          afterFocalPoint: "50% 50%",
          sortOrder: 3,
          status: "published",
          consentConfirmed: true,
          approvedByDoctor: true,
          published: true,
        },
      ],
    },
    specialtySection: {
      id: homeContent.specialtySection.id,
      eyebrow: homeContent.specialtySection.eyebrow,
      title: homeContent.specialtySection.title,
      lead: homeContent.specialtySection.lead,
      image: {
        src: homeContent.specialtySection.image.src,
        alt: homeContent.specialtySection.image.alt,
        focalX: 50,
        focalY: 45,
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
    testimonialsSection: {
      id: homeContent.testimonialsSection.id,
      eyebrow: homeContent.testimonialsSection.eyebrow,
      eyebrowEn: homeContentEn.testimonialsSection.eyebrow,
      title: homeContent.testimonialsSection.title,
      titleEn: homeContentEn.testimonialsSection.title,
      subtitle: homeContent.testimonialsSection.subtitle,
      subtitleEn: homeContentEn.testimonialsSection.subtitle,
      items: homeContent.testimonialsSection.items.map((item) => ({
        ...item,
      })),
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
      primaryHref: siteConfig.whatsappUrl,
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
    en: {
      hero: {
        doctorTag: homeContentEn.hero.doctorTag,
        specialtyTag: homeContentEn.hero.specialtyTag,
        headlineLine1: homeContentEn.hero.headlineLine1,
        headlineLine2: homeContentEn.hero.headlineLine2,
        tagline: homeContentEn.hero.tagline,
        support: homeContentEn.hero.support,
        primaryCta: homeContentEn.hero.primaryCta,
        secondaryCta: homeContentEn.hero.secondaryCta,
        destinationHint: homeContentEn.hero.destinationHint,
      },
      doctorIntro: {
        eyebrow: homeContentEn.doctorIntro.eyebrow,
        name: homeContentEn.doctorIntro.name,
        heading: homeContentEn.doctorIntro.heading,
        specialty: homeContentEn.doctorIntro.specialty,
        city: homeContentEn.doctorIntro.city,
        leadStatement: homeContentEn.doctorIntro.leadStatement,
        moreLinkLabel: homeContentEn.doctorIntro.moreLinkLabel,
        principles: homeContentEn.doctorIntro.principles.map((p) => ({
          icon: p.icon,
          title: p.title,
        })),
      },
      knowledgeSection: {
        eyebrow: homeContentEn.knowledgeSection.eyebrow,
        title: homeContentEn.knowledgeSection.title,
        intro: homeContentEn.knowledgeSection.intro,
        viewAllLabel: homeContentEn.knowledgeSection.viewAllLabel,
        readArticleLabel: homeContentEn.knowledgeSection.readArticleLabel,
      },
      faqSection: {
        eyebrow: homeContentEn.faqSection.eyebrow,
        title: homeContentEn.faqSection.title,
        intro: homeContentEn.faqSection.intro,
        viewAllLabel: homeContentEn.faqSection.viewAllLabel,
      },
      finalInquiry: {
        eyebrow: homeContentEn.finalInquiry.eyebrow,
        heading: homeContentEn.finalInquiry.heading,
        support: homeContentEn.finalInquiry.support,
        primaryCta: homeContentEn.finalInquiry.primaryCta,
        destinationCaption: homeContentEn.finalInquiry.destinationCaption,
      },
    },
    statusEn: "published",
    sectionVisibility: {
      specialtiesStrip: true,
      doctorIntro: true,
      resultsSection: true,
      knowledgeSection: true,
      specialtySection: false,
      beforeConsultationSection: false,
      contentStyleSection: false,
      testimonialsSection: true,
      faqSection: true,
      finalInquiry: true,
    },
    sectionOrder: [
      "specialtiesStrip",
      "doctorIntro",
      "resultsSection",
      "knowledgeSection",
      "testimonialsSection",
      "faqSection",
      "finalInquiry",
    ],
  };
}

export function buildInitialPageRecord(): CmsPageRecord {
  const data = buildInitialHomePageData();
  return {
    slug: "home",
    title: "الصفحة الرئيسية (AR / EN)",
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
  return articlesRecords.map((record, index) => {
    const enTrans = articlesTranslationsEn[record.slug];
    return {
      id: `article-${index + 1}-${record.slug}`,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt ?? "",
      category: record.category,
      featured: Boolean(record.featured),
      image: {
        src: record.image?.src ?? "/media/article-eyelid-indication.jpg",
        alt: record.image?.alt ?? record.title,
        altEn: enTrans?.title ?? record.title,
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
      en: enTrans
        ? {
            title: enTrans.title,
            excerpt: enTrans.excerpt ?? "",
            category: enTrans.category,
            body: enTrans.body.map((section, sIdx) => ({
              id: section.id ?? `section-${sIdx + 1}`,
              heading: section.heading,
              paragraphs: [...section.paragraphs],
              ...(section.bullets ? { bullets: [...section.bullets] } : {}),
            })),
            status: "draft",
            reviewedBy: null,
            reviewedAt: null,
            approvedBy: null,
            approvedAt: null,
            publishedAt: null,
            seo: {
              title: enTrans.seo.title ?? enTrans.title,
              description: enTrans.seo.description ?? enTrans.excerpt ?? "",
              ogImage: record.image?.src ?? null,
            },
            disclaimer: journalPageCopyEn.articleLabels.disclaimer,
          }
        : undefined,
      sources: (record.sources ?? []).map((src) =>
        typeof src === "string"
          ? { title: src, institution: src, url: "https://www.aao.org/" }
          : { title: src.title, institution: src.institution, url: src.url }
      ),
      disclaimer: journalPageCopy.articleLabels.disclaimer,
      version: 1,
      deletedAt: null,
    };
  });
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
      id: "media-hero-eye-plum-ivory",
      name: "صورة الافتتاحية التحريرية (Hero Eye)",
      filename: "hero-eye-plum-ivory.jpg",
      url: "/media/hero-eye-plum-ivory.jpg",
      alt: homeContent.hero.image.alt,
      focalX: 68,
      focalY: 42,
      isPublic: true,
    },
    {
      id: "media-dr-reham-about",
      name: "صورة د. ريهام القحطاني (قسم عن الدكتورة)",
      filename: "dr-reham-about.jpg",
      url: "/media/dr-reham-about.jpg",
      alt: homeContent.doctorIntro.sculptureImage.alt,
      focalX: 50,
      focalY: 42,
      isPublic: true,
    },
    {
      id: "media-case-1-before",
      name: "الحالة ١ (قبل) — تجميل جفون سفلية مع إعادة توزيع الدهون",
      filename: "case-1-before.jpg",
      url: "/media/case-1-before.jpg",
      alt: "صورة قبل — تجميل جفون سفلية مع إعادة توزيع الدهون",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-case-1-after",
      name: "الحالة ١ (بعد) — تجميل جفون سفلية مع إعادة توزيع الدهون",
      filename: "case-1-after.jpg",
      url: "/media/case-1-after.jpg",
      alt: "صورة بعد — تجميل جفون سفلية مع إعادة توزيع الدهون",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-case-2-before",
      name: "الحالة ٢ (قبل) — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي",
      filename: "case-2-before.jpg",
      url: "/media/case-2-before.jpg",
      alt: "صورة قبل — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-case-2-after",
      name: "الحالة ٢ (بعد) — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي",
      filename: "case-2-after.jpg",
      url: "/media/case-2-after.jpg",
      alt: "صورة بعد — تجميل الجفون العلوية والسفلية مع إعادة توزيع الدهون بجرح مخفي",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-case-3-before",
      name: "الحالة ٣ (قبل) — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق",
      filename: "case-3-before.jpg",
      url: "/media/case-3-before.jpg",
      alt: "صورة قبل — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-case-3-after",
      name: "الحالة ٣ (بعد) — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق",
      filename: "case-3-after.jpg",
      url: "/media/case-3-after.jpg",
      alt: "صورة بعد — تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-about-eyelid-sculpture",
      name: "العمل الفني النحتي (بديل احتياطي)",
      filename: "about-eyelid-sculpture.jpg",
      url: "/media/about-eyelid-sculpture.jpg",
      alt: "عمل فني نحتي مستوحى من انحناءة الجفن بخامات عاجية وبرقوقية دافئة",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-article-eyelid-indication",
      name: "صورة مقال الجفن المبطن والعين الغائرة",
      filename: "article-eyelid-indication.jpg",
      url: "/media/article-eyelid-indication.jpg",
      alt: "صورة تحريرية تعبيرية مقرّبة لانحناءة الجفن العلوي وقوس الحاجب تحت إضاءة نهارية ناعمة",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-tear-comfort",
      name: "صورة مقال راحة العين والدموع",
      filename: "article-tear-comfort.jpg",
      url: "/media/article-tear-comfort.jpg",
      alt: "صورة تحريرية هادئة لقطرة نقية ترمز لراحة سطح العين والدموع",
      focalX: 50,
      focalY: 50,
      isPublic: false,
    },
    {
      id: "media-article-brow-lid-harmony",
      name: "صورة مقال تناغم الحاجب والجفن",
      filename: "article-brow-lid-harmony.jpg",
      url: "/media/article-brow-lid-harmony.jpg",
      alt: "صورة تحريرية مقرّبة لتناغم الحاجب والجفن العلوي في إضاءة دافئة",
      focalX: 50,
      focalY: 50,
      isPublic: true,
    },
    {
      id: "media-article-consultation-questions",
      name: "صورة مقال أسئلة الاستشارة",
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
      alt: "عدسة بصرية صافية تعكس ضوءًا هادئًا على سطح عاجي دافئ",
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
  return faqRecords.map((faq, idx) => {
    const enTrans = faqTranslationsEn[faq.id];
    const isPub =
      faq.status === "published" && faq.answer && faq.answer.trim().length > 0;
    return {
      id: faq.id,
      question: faq.question,
      questionEn: enTrans?.question ?? "",
      answer: faq.answer ?? "",
      answerEn: enTrans?.answer ?? "",
      category: faq.category,
      sortOrder: idx + 1,
      status: isPub ? "published" : "draft",
      statusEn: isPub && enTrans ? "published" : "draft",
      reviewedBy: faq.reviewedBy,
      version: 1,
      deletedAt: null,
      updatedAt: INITIAL_TIMESTAMP,
      updatedBy: "تهيئة النظام",
    };
  });
}

export function buildInitialClinics(): CmsClinicItem[] {
  return siteConfig.clinics.map((clinic, idx) => ({
    id: clinic.id,
    name: clinic.name,
    nameEn: clinic.nameEn,
    source: clinic.source,
    affiliationVerified: clinic.affiliationVerified,
    enabled: clinic.enabled,
    address: clinic.address,
    addressEn: clinic.addressEn,
    mapsUrl: clinic.mapsUrl,
    bookingUrl: clinic.bookingUrl,
    whatsappE164: clinic.whatsappE164,
    phone: null,
    hours: clinic.hours,
    hoursEn: clinic.hoursEn,
    sortOrder: idx + 1,
    version: 1,
    updatedAt: INITIAL_TIMESTAMP,
    updatedBy: "تهيئة النظام",
  }));
}

export function buildInitialSettings(): CmsSiteSettings {
  return {
    siteName: siteConfig.profile.nameAr,
    siteNameEn: siteConfig.profile.nameEn,
    siteDescription: homeContent.meta.description,
    siteDescriptionEn: homeContentEn.meta.description,
    specialtyTitle: siteConfig.profile.specialtyAr,
    specialtyTitleEn: siteConfig.profile.specialtyEn,
    city: siteConfig.profile.city,
    cityEn: siteConfig.profile.cityEn,
    logoPath: "/brand/logo-original.png",
    faviconPath: "/brand/logo-original.png",
    defaultOgImage: "/media/hero-eye-plum-ivory.jpg",
    seoTitleTemplate: "%s | د. ريهام القحطاني",
    seoDefaultDescription: homeContent.meta.description,
    domain: siteConfig.domain,
    instagramUrl: siteConfig.instagramUrl,
    whatsappUrl: siteConfig.whatsappUrl,
    phone: siteConfig.whatsappDisplay,
    email: null,
    defaultInquiryDestination: "whatsapp",
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
