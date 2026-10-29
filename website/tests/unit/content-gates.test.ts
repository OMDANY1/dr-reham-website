import { describe, expect, it } from "vitest";
import { siteConfig, qaVerifiedClinicsFixture } from "@/config/site";
import { servicesRecords } from "@/content/ar/services";
import { articlesRecords } from "@/content/ar/articles";
import { faqRecords } from "@/content/ar/faq";
import {
  calculateArticleWordCount,
  calculateReadingTimeMinutes,
  filterArticles,
  formatReadingTimeAr,
  getBookingCtaLabel,
  getPublicArticleBySlug,
  getPublicArticles,
  getPublicFaqs,
  getPublicServiceBySlug,
  getPublicServices,
  getVisibleArticleBySlug,
  getVisibleArticles,
  isLiveBookingReady,
  isPreviewableDraftArticle,
  isPublicArticle,
  isPublicAsset,
  isPublicFaq,
  isPublicService,
  isSupportedLocale,
  type ArticleRecord,
  type ServiceRecord,
} from "@/lib/content-gates";

describe("content-gates", () => {
  it("validates supported locales strictly (only 'ar' in V1)", () => {
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("en")).toBe(false);
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });

  it("blocks all unapproved draft services from public lists and slug lookup", () => {
    expect(getPublicServices(servicesRecords)).toHaveLength(0);
    expect(
      getPublicServiceBySlug(servicesRecords, "eyelid-consultation-draft")
    ).toBeNull();

    const approvedService: ServiceRecord = {
      slug: "approved-eyelid-service",
      title: "خدمة معتمدة",
      summary: "ملخص معتمد للخدمة.",
      category: "تجميل الجفون",
      overview: "تفاصيل الخدمة المعتمدة من الدكتورة.",
      consultationNotes: null,
      preparation: null,
      recovery: null,
      risks: null,
      faq: [],
      status: "published",
      approvedBy: "د. ريهام القحطاني",
      reviewedAt: "2026-10-29",
    };

    expect(isPublicService(approvedService)).toBe(true);
    expect(isPublicService({ ...approvedService, approvedBy: null })).toBe(
      false
    );
    expect(isPublicService({ ...approvedService, status: "draft" })).toBe(
      false
    );
  });

  it("separates preview draft articles from production published articles", () => {
    // في بوابة الإنتاج الصارمة (المستخدمة في sitemap.xml ووضع الإنتاج): لا تمر المسودات أبدًا
    expect(getPublicArticles(articlesRecords)).toHaveLength(0);
    expect(
      getPublicArticleBySlug(articlesRecords, "hooded-vs-deep-set-eyelid")
    ).toBeNull();
    expect(
      getVisibleArticles(articlesRecords, "production", true)
    ).toHaveLength(0);
    expect(
      getVisibleArticleBySlug(
        articlesRecords,
        "hooded-vs-deep-set-eyelid",
        "production",
        true
      )
    ).toBeNull();

    // في وضع المعاينة الخادمي (preview): تتوفر المسودات الست الكاملة لتقييم التجربة
    const previewArticles = getVisibleArticles(
      articlesRecords,
      "preview",
      true
    );
    expect(previewArticles).toHaveLength(6);
    for (const draft of previewArticles) {
      expect(isPreviewableDraftArticle(draft)).toBe(true);
      expect(draft.status).toBe("draft");
      expect(draft.author).toBeNull();
      expect(draft.reviewedBy).toBeNull();
      expect(draft.reviewedAt).toBeNull();
      expect(calculateArticleWordCount(draft)).toBeGreaterThan(280);
      expect(calculateReadingTimeMinutes(draft)).toBeGreaterThanOrEqual(2);
    }

    const approvedArticle: ArticleRecord = {
      slug: "approved-article",
      title: "مقال توعوي معتمد",
      excerpt: "مقدمة مختصرة ومعتمدة.",
      body: [
        {
          heading: "عنوان فقرة",
          paragraphs: ["نص توعوي مراجع طبيًا."],
        },
      ],
      category: "العين والجفون",
      author: "د. ريهام القحطاني",
      reviewedBy: "د. ريهام القحطاني",
      reviewedAt: "2026-10-29",
      publishedAt: "2026-10-29",
      status: "published",
      seo: { title: null, description: null },
    };

    expect(isPublicArticle(approvedArticle)).toBe(true);
    expect(isPublicArticle({ ...approvedArticle, reviewedBy: null })).toBe(
      false
    );
    expect(isPublicArticle({ ...approvedArticle, body: [] })).toBe(false);
    expect(formatReadingTimeAr(3)).toBe("3 دقائق للقراءة");
  });

  it("filters articles by category and search query together", () => {
    const all = getVisibleArticles(articlesRecords, "preview", true);
    expect(filterArticles(all, { category: "الكل", query: "" })).toHaveLength(
      6
    );
    expect(
      filterArticles(all, { category: "قبل الاستشارة", query: "" })
    ).toHaveLength(3);
    expect(
      filterArticles(all, { category: "العين والجفون", query: "قبل وبعد" })
    ).toHaveLength(1);
    expect(
      filterArticles(all, { category: "قبل الاستشارة", query: "الجفن المبطن" })
    ).toHaveLength(0);
  });

  it("exposes practical preparatory FAQs while blocking unverified clinic FAQ drafts", () => {
    const publicFaqs = getPublicFaqs(faqRecords);
    expect(publicFaqs).toHaveLength(4);
    expect(
      isPublicFaq(
        faqRecords.find((f) => f.id === "where-does-doctor-practice")!
      )
    ).toBe(false);
  });

  it("enforces consent and rights on clinical assets", () => {
    expect(
      isPublicAsset({
        id: "case-1",
        path: "/cases/1.jpg",
        role: "clinical-case",
        alt: "وصف",
        rights: "owned",
        consentRef: null,
        approved: true,
      })
    ).toBe(false);

    expect(
      isPublicAsset({
        id: "case-2",
        path: "/cases/2.jpg",
        role: "clinical-case",
        alt: "وصف",
        rights: "owned",
        consentRef: "CONSENT-2026-01",
        approved: true,
      })
    ).toBe(true);
  });

  it("switches inquiry CTA label honestly based on verified configuration", () => {
    expect(isLiveBookingReady(siteConfig)).toBe(false);
    expect(getBookingCtaLabel(siteConfig)).toBe("تواصل للاستفسار");

    expect(isLiveBookingReady(siteConfig, qaVerifiedClinicsFixture)).toBe(true);
    expect(getBookingCtaLabel(siteConfig, qaVerifiedClinicsFixture)).toBe(
      "احجز موعدًا"
    );
  });
});
