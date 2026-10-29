import {
  siteConfig,
  type Clinic,
  type SiteConfig,
  type SiteMode,
  type SupportedLocale,
} from "@/config/site";
import { getVerifiedBookableClinics } from "@/lib/booking-links";

export type RecordStatus = "draft" | "published";

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceRecord {
  slug: string;
  title: string;
  summary: string;
  category: string;
  overview: string | null;
  consultationNotes: string | null;
  preparation: string | null;
  recovery: string | null;
  risks: string | null;
  faq: ServiceFaqItem[];
  status: RecordStatus;
  approvedBy: string | null;
  reviewedAt: string | null;
  contourVariant?: "upper-lid" | "lower-arc" | "lateral-balance";
}

export interface ArticleSource {
  title: string;
  institution: string;
  url: string;
}

export interface ArticleSection {
  id?: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export type ArticleCategory = "العين والجفون" | "حول العين" | "قبل الاستشارة" | string;

export interface ArticleRecord {
  slug: string;
  title: string;
  excerpt: string | null;
  body: ArticleSection[];
  category: ArticleCategory;
  featured?: boolean;
  image?: {
    src: string;
    alt: string;
  };
  author: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  status: RecordStatus;
  seo: {
    title: string | null;
    description: string | null;
  };
  sources?: (string | ArticleSource)[];
  relatedServiceSlugs?: string[];
  sourceNote?: string;
}

export type FaqCategory = "appointments" | "consultation" | "procedure";

export interface FaqRecord {
  id: string;
  question: string;
  answer: string | null;
  category: FaqCategory;
  status: RecordStatus;
  reviewedBy: string | null;
  isAdministrativeSeed?: boolean;
}

export interface AssetRecord {
  id: string;
  path: string;
  role: "brand-logo" | "editorial-illustration" | "clinical-case";
  alt: string;
  rights: string | null;
  consentRef: string | null;
  approved: boolean;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === "ar";
}

/**
 * بوابة نشر الخدمة الطبية: تتطلب status === "published" واعتمادًا طبيًا صريحًا ومحتوى أساسيًا.
 */
export function isPublicService(service: ServiceRecord): boolean {
  return (
    service.status === "published" &&
    Boolean(service.approvedBy && service.approvedBy.trim().length > 0) &&
    Boolean(service.reviewedAt && service.reviewedAt.trim().length > 0) &&
    Boolean(service.title && service.title.trim().length > 0) &&
    Boolean(service.summary && service.summary.trim().length > 0) &&
    Boolean(service.overview && service.overview.trim().length > 0)
  );
}

/**
 * بوابة نشر المقال التوعوي للإنتاج العام (Production):
 * تتطلب status === "published" ومراجعًا وتاريخ مراجعة ونشر ومحتوى فعليًا.
 * المسودات لا تمر عبر هذه البوابة أبدًا، فلا تدخل خريطة الموقع أو البيانات المنظمة أو وضع الإنتاج.
 */
export function isPublicArticle(article: ArticleRecord): boolean {
  return (
    article.status === "published" &&
    Boolean(article.reviewedBy && article.reviewedBy.trim().length > 0) &&
    Boolean(article.reviewedAt && article.reviewedAt.trim().length > 0) &&
    Boolean(article.publishedAt && article.publishedAt.trim().length > 0) &&
    Boolean(article.title && article.title.trim().length > 0) &&
    Boolean(article.excerpt && article.excerpt.trim().length > 0) &&
    Array.isArray(article.body) &&
    article.body.length > 0 &&
    article.body.every((section) => section.paragraphs.length > 0)
  );
}

/**
 * يتحقق من أن مسودة المقال مكتملة العناصر وجاهزة للعرض داخل وضع المعاينة الخادمي فقط.
 */
export function isPreviewableDraftArticle(article: ArticleRecord): boolean {
  return (
    article.status === "draft" &&
    Boolean(article.title && article.title.trim().length > 0) &&
    Boolean(article.excerpt && article.excerpt.trim().length > 0) &&
    Array.isArray(article.body) &&
    article.body.length > 0 &&
    article.body.every((section) => section.paragraphs.length > 0)
  );
}

/**
 * يتحقق مما إذا كان الخادم في وضع المعاينة الذي يسمح بعرض مسودات المقالات لتقييم التجربة.
 * يعتمد حصريًا على إعداد الخادم (siteConfig.mode / SITE_STAGE) وليس على أي query parameter عام.
 */
export function isArticlePreviewStage(
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): boolean {
  const mode = modeOverride ?? siteConfig.mode;
  const draftsEnabled =
    enablePreviewDraftsOverride ?? siteConfig.enablePreviewDrafts;
  return mode === "preview" && draftsEnabled;
}

/**
 * بوابة نشر السؤال الشائع: تتطلب status === "published" ومراجعًا معتمدًا ونص سؤال وإجابة.
 */
export function isPublicFaq(faq: FaqRecord): boolean {
  return (
    faq.status === "published" &&
    Boolean(faq.reviewedBy && faq.reviewedBy.trim().length > 0) &&
    Boolean(faq.question && faq.question.trim().length > 0) &&
    Boolean(faq.answer && faq.answer.trim().length > 0)
  );
}

/**
 * بوابة نشر الأصول البصرية: تمنع أي حالة سريرية بدون موافقة موثقة وحقوق استخدام.
 */
export function isPublicAsset(asset: AssetRecord): boolean {
  if (!asset.approved || !asset.rights || !asset.alt.trim()) {
    return false;
  }
  if (
    asset.role === "clinical-case" &&
    (!asset.consentRef || !asset.consentRef.trim())
  ) {
    return false;
  }
  return true;
}

export function getPublicServices(records: ServiceRecord[]): ServiceRecord[] {
  return records.filter(isPublicService);
}

export function getPublicServiceBySlug(
  records: ServiceRecord[],
  slug: string
): ServiceRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found || !isPublicService(found)) {
    return null;
  }
  return found;
}

/**
 * يعيد المقالات المعتمدة للنشر العام فقط (للإنتاج، خريطة الموقع، والبيانات المنظمة).
 */
export function getPublicArticles(records: ArticleRecord[]): ArticleRecord[] {
  return records.filter(isPublicArticle);
}

export function getPublicArticleBySlug(
  records: ArticleRecord[],
  slug: string
): ArticleRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found || !isPublicArticle(found)) {
    return null;
  }
  return found;
}

/**
 * يعيد المقالات المتاحة للعرض في الواجهة حسب مرحلة التشغيل الخادمية:
 * - في وضع الإنتاج (production): يعيد المقالات المعتمدة فقط (`isPublicArticle`).
 * - في وضع المعاينة (preview): يعيد المقالات المعتمدة + المسودات المكتملة للمراجعة.
 */
export function getVisibleArticles(
  records: ArticleRecord[],
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): ArticleRecord[] {
  if (isArticlePreviewStage(modeOverride, enablePreviewDraftsOverride)) {
    return records.filter(
      (article) =>
        isPublicArticle(article) || isPreviewableDraftArticle(article)
    );
  }
  return getPublicArticles(records);
}

export function getVisibleArticleBySlug(
  records: ArticleRecord[],
  slug: string,
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): ArticleRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found) {
    return null;
  }
  if (isPublicArticle(found)) {
    return found;
  }
  if (
    isArticlePreviewStage(modeOverride, enablePreviewDraftsOverride) &&
    isPreviewableDraftArticle(found)
  ) {
    return found;
  }
  return null;
}

/**
 * يحسب عدد الكلمات الفعلي للمقال من العنوان والملخص وجميع الفقرات والقوائم.
 */
export function calculateArticleWordCount(
  article: Pick<ArticleRecord, "title" | "excerpt" | "body">
): number {
  const chunks: string[] = [article.title, article.excerpt ?? ""];
  for (const section of article.body) {
    chunks.push(section.heading);
    chunks.push(...section.paragraphs);
    if (section.bullets && section.bullets.length > 0) {
      chunks.push(...section.bullets);
    }
  }
  const words = chunks
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

/**
 * يحسب وقت القراءة التقديري بالدقائق بناءً على المحتوى الفعلي للمقال (~150 كلمة/دقيقة للقراءة الطبية المتأنية).
 */
export function calculateReadingTimeMinutes(
  article: Pick<ArticleRecord, "title" | "excerpt" | "body">
): number {
  const words = calculateArticleWordCount(article);
  return Math.max(1, Math.round(words / 150));
}

export function formatReadingTimeAr(minutes: number): string {
  if (minutes <= 1) return "دقيقة واحدة للقراءة";
  if (minutes === 2) return "دقيقتان للقراءة";
  if (minutes >= 3 && minutes <= 10) return `${minutes} دقائق للقراءة`;
  return `${minutes} دقيقة للقراءة`;
}

/**
 * فلترة المقالات حسب التصنيف ونص البحث في العنوان والملخص.
 */
export function filterArticles(
  articles: ArticleRecord[],
  options: { category?: string; query?: string }
): ArticleRecord[] {
  const normalizedCategory = options.category?.trim() ?? "الكل";
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";

  return articles.filter((article) => {
    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === "الكل" ||
      article.category === normalizedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${article.title} ${article.excerpt ?? ""} ${article.category}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getPublicFaqs(records: FaqRecord[]): FaqRecord[] {
  return records.filter(isPublicFaq);
}

/**
 * يتحقق مما إذا كان الحجز المباشر مفعلًا فعليًا ولديه عيادة موثقة واحدة على الأقل.
 */
export function isLiveBookingReady(
  config: SiteConfig,
  clinicsOverride?: Clinic[]
): boolean {
  const clinics = clinicsOverride ?? config.clinics;
  if (!config.bookingEnabled && !clinicsOverride) {
    return false;
  }
  return getVerifiedBookableClinics(clinics).length > 0;
}

/**
 * يعيد نص زر التواصل/المواعيد الصادق حسب جاهزية التكامل:
 * «تواصل للاستفسار» عند عدم وجود قناة حجز مباشر مؤكدة، و«احجز موعدًا» عند التفعيل الموثق.
 */
export function getBookingCtaLabel(
  config: SiteConfig,
  clinicsOverride?: Clinic[]
): string {
  return isLiveBookingReady(config, clinicsOverride)
    ? "احجز موعدًا"
    : "تواصل للاستفسار";
}
